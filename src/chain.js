
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Placeholder from './placeholder.js';
import Trait from './trait.js';
import Catbus from './catbus.es.js';
import Gear from './gear.js';
import Cog from './cog.js';


let _id = 0;

function Chain(url, el, before, parent, config, sourceName, keyField){

    this.id = ++_id;
    this.firstElement = null;
    this.head = null;
    this.placeholder = null;
    this.el = el; // ref element
    this.before = !!before; // el appendChild or insertBefore
    this.elements = [];
    this.domElements = [];
    this.namedElements = {};
    this.children = [];
    this.parent = parent || null;
    this.scope = parent ? parent.scope.createChild() : Catbus.createChild();
    this.url = url;
    this.root = '';
    this.script = null;
    this.config = config || {};
    this.scriptMonitor = null;
    this.aliasValveMap = null;
    this.aliasContext = null;
    this.sourceName = sourceName;
    this.keyField = keyField;
    this.bus = null;

    this.usePlaceholder();
    this.load();

}

Chain.prototype.usePlaceholder = function() {


    this.placeholder = Placeholder.take();

    if(this.el) {
        if (this.before) {
            this.el.parentNode.insertBefore(this.placeholder, this.el);
        } else {
            this.el.appendChild(this.placeholder);
        }
    } else {

        this.parent.placeholder.parentNode
            .insertBefore(this.placeholder, this.parent.placeholder);
    }

};

Chain.prototype.killPlaceholder = function() {

    if(!this.placeholder)
        return;

    Placeholder.give(this.placeholder);
    this.placeholder = null;

};


Chain.prototype.load = function() {

    if(ScriptLoader.has(this.url)){
        this.onScriptReady();
    } else {
        ScriptLoader.request(this.url, this.onScriptReady.bind(this));
    }

};

Chain.prototype.onScriptReady = function() {

    this.script = Object.create(ScriptLoader.read(this.url));
    this.script.id = this.id;
    this.script.config = this.config;
    this.root = this.script.root;
    this.prep();

};


Chain.prototype.prep = function(){

    const parent = this.parent;
    const aliasValveMap = parent ? parent.aliasValveMap : null;
    const aliasList = this.script.alias;

    if(parent && parent.root === this.root && !aliasList && !aliasValveMap){
        // same relative path, no new aliases and no valves, reuse parent context
        this.aliasContext = parent.aliasContext;
        this.aliasContext.shared = true;
    } else {
        // new context, apply valves from parent then add aliases from cog
        this.aliasContext = parent
            ? parent.aliasContext.clone()
            : new AliasContext(this.root); // root of application
        this.aliasContext.restrictAliasList(aliasValveMap);
        this.aliasContext.injectAliasList(aliasList);
    }

    this.loadBooks();

};



Chain.prototype.loadBooks = function loadBooks(){

    if(this.script.books.length === 0) {
        this.loadTraits();
        return;
    }

    const urls = this.aliasContext.freshUrls(this.script.books);

    if (urls.length) {
        this.scriptMonitor = new ScriptMonitor(urls, this.readBooks.bind(this));
    } else {
        this.readBooks()
    }



};




Chain.prototype.readBooks = function readBooks() {

    const urls = this.script.books;

    if(this.aliasContext.shared) // need a new context
        this.aliasContext = this.aliasContext.clone();

    for (let i = 0; i < urls.length; ++i) {

        const url = urls[i];
        const book = ScriptLoader.read(url);
        if(book.type !== 'book')
            console.log('EXPECTED BOOK: got ', book.type, book.url);

        this.aliasContext.injectAliasList(book.alias);

    }

    this.loadTraits();

};


Chain.prototype.loadTraits = function loadTraits(){

    const urls = this.aliasContext.freshUrls(this.script.traits);

    if(urls.length){
        this.scriptMonitor = new ScriptMonitor(urls, this.build.bind(this));
    } else {
        this.build();
    }

};



Chain.prototype.getNamedElement = function getNamedElement(name){

    if(!name)
        return null;

    const el = this.namedElements[name];

    if(!el)
        throw new Error('Named element ' + name + ' not found in display!');

    return el;

};

Chain.prototype.build = function build(){ // urls loaded

    const nyan = this.sourceName + ' | *buildCogsByIndex';
    this.bus = this.scope.bus(nyan, this).pull();

};


Chain.prototype.buildCogsByIndex = function buildCogsByIndex(msg){

    const len = msg.length;
    const children = this.children;
    const childCount = children.length;
    const updateCount = len > childCount ? childCount : len;

    // update existing
    for(let i = 0; i < updateCount; ++i){
        const d = msg[i];
        const c = children[i];
        c.source.write(d);
    }

    if(len === 0 && childCount > 0){

        // restore placeholder as all children gone
        this.placeholder = this.placeholder || Placeholder.take();
        const el = this.getFirstElement();
        el.parentNode.insertBefore(this.placeholder, el);

    }

    if(childCount < len) {

        const lastEl = this.getLastElement();
        const nextEl = lastEl.nextElementSibling;
        const parentEl = lastEl.parentNode;
        const before = !!nextEl;
        const el = nextEl || parentEl;

        for (let i = childCount; i < len; ++i) {
            // create cogs for new data
            const cog = new Cog(this.url, el, before, this, this.config, i);
            children.push(cog);

        }

    } else {

        for (let i = childCount - 1; i >= len; --i) {
            // remove cogs without corresponding data
            children[i].destroy();
            children.splice(i, 1);
        }
    }




};

Chain.prototype.getFirstElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.head;
    }
    return c.placeholder || c.elements[0];

};

Chain.prototype.getLastElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.tail;
    }
    return c.placeholder || c.elements[c.elements.length - 1];

};


Chain.prototype.destroy = function(){

    const len = this.children.length;
    for(let i = 0; i < len; ++i){
        const c = this.children[i];
        c.destroy();
    }

    if(this.placeholder){
        this.killPlaceholder();
    } else {

        const len = this.elements.length;
        for(let i = 0; i < len; ++i){
            const e = this.elements[i];
            e.parentNode.removeChild(e);
        }
    }



    this.children = [];

};

export default Chain;


import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Placeholder from './placeholder.js';
import Trait from './trait.js';
import Catbus from './catbus.es.js';

let _id = 0;

function Chain(url, el, before, parent, config){

    this.id = ++_id;
    this.placeholder = null;
    this.el = el; // ref element
    this.before = !!before; // el appendChild or insertBefore
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

    this.bookUrls = null;
    this.traitUrls = null;

    this.traitInstances = [];
    this.busInstances = [];

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
    this.root = this.script.root;
    this.loadBooks();

};


Chain.prototype.loadBooks = function loadBooks(){

    const urls = this.bookUrls = this.aliasContext.freshUrls(this.script.books);

    if(urls.length){
        this.scriptMonitor = new ScriptMonitor(urls, this.readBooks.bind(this));
    } else {
        this.loadTraits()
    }

};




Chain.prototype.readBooks = function readBooks() {

    const urls = this.bookUrls;

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

    const urls = this.traitUrls = this.aliasContext.freshUrls(this.script.traits);

    if(urls.length){
        this.scriptMonitor = new ScriptMonitor(urls, this.build.bind(this));
    } else {
        this.build();
    }

};


Chain.prototype.buildStates = function buildStates(){

    const states = this.script.states;
    const len = states.length;

    for(let i = 0; i < len; ++i){

        const def = states[i];
        const state = this.scope.state(def.name);

        if(def.hasValue) {

            const value = typeof def.value === 'function'
                ? def.value.call(this.script)
                : def.value;

            state.write(value, def.topic, true);
        }

    }

    for(let i = 0; i < len; ++i){

        const def = states[i];
        const state = this.scope.state(def.name);
        state.refresh(def.topic);

    }

};





Chain.prototype.buildBusFromNyan = function buildBusFromNyan(nyanStr, el){
    return this.scope.bus(nyanStr, this.script, el, this.script.methods);
};

Chain.prototype.buildBusFromFunction = function buildBusFromFunction(f, el){

    //const bus = this.scope.bus()
};

Chain.prototype.buildBuses = function buildBuses(){

    const buses = this.script.buses;
    const len = buses.length;
    const instances = this.busInstances;

    for(let i = 0; i < len; ++i){

        const def = buses[i];
        const bus = this.buildBusFromNyan(def); // todo add function support not just nyan str
        instances.push(bus);

    }

};

Chain.prototype.buildCogs = function buildCogs(){

    const cogs = this.script.cogs;
    const children = this.children;
    const aliasContext = this.aliasContext;

    const len = cogs.length;
    for(let i = 0; i < len; ++i){

        const def = cogs[i];
        const url = aliasContext.resolveUrl(def.url, def.root);
        const el = this.getNamedElement(def.el);
        const before = !!(el && def.before);

        const cog = new Cog(url, el, before, this, def.config);
        children.push(cog);

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

    // bind to source, on source change, if not placeholder
    // use it or add placeholder before first, make cogs,
    // remove placeholder if cogs

    // script.prep is called earlier
    this.buildMethods();
    this.buildTraits(); // calls prep on all traits
    this.buildStates();
    this.buildActions();

    this.script.init();

    this.initTraits(); // calls init on all traits
    this.mount(); // mounts display, calls script.mount, then mount for all traits

    this.buildBuses();
    this.buildEvents();
    this.buildCogs(); // placeholders for direct children, async loads possible
    this.killPlaceholder();
    this.start(); // calls start for all traits

};


Chain.prototype.mount = function mount(){

    this.mountDisplay();
    this.script.mount();
    this.mountTraits();

};

Chain.prototype.start = function start(){

    this.script.start();
    this.startTraits();

};

export default Cog;

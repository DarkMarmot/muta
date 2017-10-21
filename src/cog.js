
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Trait from './trait.js';
import Catbus from './catbus.es.js';
import Gear from './gear.js';
import Chain from './chain.js';
import PartBuilder from './partBuilder.js';
import AlterDom from './alterDom.js';
import Placeholder from './placeholder.js';


let _id = 0;

function Cog(url, slot, parent, config, index, key){

    this.id = ++_id;
    this.type = 'cog';
    //this.slot = slot;
    this.dead = false;

    this.head = null;
    this.tail = null;
    this.first = null;
    this.last = null;

    this.placeholder = slot;
    this.elements = [];
    this.namedSlots = {};
    this.namedElements = {};
    this.children = [];
    this.parent = parent || null;
    this.scope = parent ? parent.scope.createChild() : Catbus.createChild();
    this.url = url;
    this.root = '';
    this.script = null;
    this.config = config || {};
    this.source = this.scope.demand('source');

    this.index = index;
    this.key = key;
    this.scriptMonitor = null;
    this.aliasValveMap = null;
    this.aliasContext = null;

    this.bookUrls = null;
    this.traitUrls = null;

    this.traitInstances = [];
    this.busInstances = [];

    if(parent && parent.type === 'cog') {
        const d = this.scope.demand('config');
        const c = this.config;
        if(typeof c === 'string'){
            const nyan = c + ' | config';
            this.buildBusFromNyan(nyan).pull();
        } else {
           d.write(c);
        }

    }


    this.load();

}



Cog.prototype.mountDisplay = function() {

    if(!this.script.display) // check for valid html node
        return;

    let frag = document
        .createRange()
        .createContextualFragment(this.script.display);

    const named = frag.querySelectorAll('[name]');
    const len = named.length;
    const hash = this.namedElements;
    const scriptEls = this.script.els = {};
    const scriptDom = this.script.dom = {};

    for(let i = 0; i < len; ++i){
        const el = named[i];
        const name = el.getAttribute('name');
        const tag = el.tagName;
        if(tag === 'SLOT'){
            this.namedSlots[name] = el;
        } else {
            hash[name] = el;
            scriptEls[name] = el;
            scriptDom[name] = new AlterDom(el);
        }
    }

    this.elements = [].slice.call(frag.childNodes, 0);
    this.placeholder.parentNode.insertBefore(frag, this.placeholder);
    Placeholder.give(this.placeholder);
    this.placeholder = null;

};


Cog.prototype.load = function() {

    if(ScriptLoader.has(this.url)){
        this.onScriptReady();
    } else {
        ScriptLoader.request(this.url, this.onScriptReady.bind(this));
    }

};

Cog.prototype.onScriptReady = function() {

    const def = ScriptLoader.read(this.url);
    this.script = Object.create(def);
    this.script.id = this.id;
    this.script.config = this.config;
    this.script.cog = this;
    this.root = this.script.root;
    this.prep();

};


Cog.prototype.prep = function(){

    const parent = this.parent;
    const aliasValveMap = parent ? parent.aliasValveMap : null;
    // const aliasList = this.script.alias;
    const aliasHash = this.script.aliases;

    if(parent && parent.root === this.root && !aliasHash && !aliasValveMap){
        // same relative path, no new aliases and no valves, reuse parent context
        this.aliasContext = parent.aliasContext;
        this.aliasContext.shared = true;
    } else {
        // new context, apply valves from parent then add aliases from cog
        this.aliasContext = parent
            ? parent.aliasContext.clone()
            : new AliasContext(this.root); // root of application
        this.aliasContext.restrictAliasList(aliasValveMap);
        //this.aliasContext.injectAliasList(aliasList);
        this.aliasContext.injectAliasHash(aliasHash);
    }

    this.script.prep();
    this.loadBooks();

};



Cog.prototype.loadBooks = function loadBooks(){

    if(this.script.books.length === 0) {
        this.loadTraits();
        return;
    }

    const urls = this.bookUrls = this.aliasContext.freshUrls(this.script.books);

    if (urls.length) {
        this.scriptMonitor = new ScriptMonitor(urls, this.readBooks.bind(this));
    } else {
        this.readBooks();
    }



};




Cog.prototype.readBooks = function readBooks() {

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


Cog.prototype.loadTraits = function loadTraits(){

    const urls = this.traitUrls = this.aliasContext.freshUrls(this.script.traits);

    if(urls.length){
        this.scriptMonitor = new ScriptMonitor(urls, this.build.bind(this));
    } else {
        this.build();
    }

};

Cog.prototype.buildStates = PartBuilder.buildStates;
Cog.prototype.buildWires = PartBuilder.buildWires;
Cog.prototype.buildRelays = PartBuilder.buildRelays;
Cog.prototype.buildActions = PartBuilder.buildActions;
Cog.prototype.output = PartBuilder.output;

Cog.prototype.buildEvents = function buildEvents(){

    // todo add compile check -- 'target el' not found in display err!

    const events = this.script.events;
    const buses = this.busInstances;

    for(const name in events){

        const value = events[name];
        const el = this.script.els[name];

        _ASSERT_HTML_ELEMENT_EXISTS(name, el);

        if(Array.isArray(value)){
            for(let i = 0; i < value.length; ++i){
                const bus = this.buildBusFromNyan(value[i], el);
                buses.push(bus);
            }
        } else {
            const bus = this.buildBusFromNyan(value, el);
            buses.push(bus);
        }

    }

};

Cog.prototype.buildBuses = function buildBuses(){

    const buses = this.script.buses;
    const wires = this.script.wires;

    const len = buses.length;
    const instances = this.busInstances;

    for(const name in wires){
        const bus = this.scope._wires[name];
        bus.pull();
    }

    for(let i = 0; i < len; ++i){

        const def = buses[i];
        const bus = this.buildBusFromNyan(def); // todo add function support not just nyan str
        bus.pull();
        instances.push(bus);

    }

};



Cog.prototype.buildBusFromNyan = function buildBusFromNyan(nyanStr, el){
    return this.scope.bus(nyanStr, this.script, el);
};

Cog.prototype.buildBusFromFunction = function buildBusFromFunction(f, el){

    //const bus = this.scope.bus()
};



Cog.prototype.buildCogs = function buildCogs(){

    const cogs = this.script.cogs;
    const children = this.children;
    const aliasContext = this.aliasContext;
    // todo work this out in script load for perf
    const count = this.elements.length;

    this.first = count ? this.elements[0] : null;
    this.last = count ? this.elements[count - 1] : null;

    for(const slotName in cogs){

        const def = cogs[slotName];
        AliasContext.applySplitUrl(def);

        const slot = this.namedSlots[slotName];
        let cog;

        if(def.type === 'gear') {
            cog = new Gear(def.url, slot, this, def.config);
        } else if (def.type === 'chain') {
            const url = aliasContext.resolveUrl(def.url, def.root);
            cog = new Chain(url, slot, this, def.config, def.source);
        } else {
            const url = aliasContext.resolveUrl(def.url, def.root);
            cog = new Cog(url, slot, this, def.config);
        }

        children.push(cog);

        if(slot === this.first)
            this.head = cog;

        if(slot === this.last)
            this.tail = cog;

    }


};


Cog.prototype.buildChains = function buildChains(){

    const chains = this.script.chains;
    const children = this.children;
    const aliasContext = this.aliasContext;
    // todo work this out in script load for perf
    const count = this.elements.length;

    this.first = count ? this.elements[0] : null;
    this.last = count ? this.elements[count - 1] : null;

    for(const slotName in chains){

        const def = chains[slotName];
        AliasContext.applySplitUrl(def);

        const slot = this.namedSlots[slotName];

        const url = aliasContext.resolveUrl(def.url, def.root);
        const chain = new Chain(url, slot, this, def.config, def.source);

        children.push(chain);

        if(slot === this.first)
            this.head = chain;

        if(slot === this.last)
            this.tail = chain;

    }


};


Cog.prototype.getNamedElement = function getNamedElement(name){

    if(!name)
        return null;

    const el = this.namedElements[name];

    if(!el)
        throw new Error('Named element ' + name + ' not found in display!');

    return el;

};

Cog.prototype.buildTraits = function buildTraits(){

    const traits = this.script.traits;
    const instances = this.traitInstances;

    const len = traits.length;
    for(let i = 0; i < len; ++i){

        const def = traits[i]; // todo url and base instead of url/root?
        const instance = new Trait(this, def);
        instances.push(instance);
        instance.script.prep();

    }

};


Cog.prototype.initTraits = function initTraits(){

    const traits = this.traitInstances;
    const len = traits.length;
    for(let i = 0; i < len; ++i){
        const script = traits[i].script;
        script.init();
    }

};

Cog.prototype.mountTraits = function mountTraits(){

    const traits = this.traitInstances;
    const len = traits.length;
    for(let i = 0; i < len; ++i){
        const script = traits[i].script;
        script.mount();
    }

};

Cog.prototype.startTraits = function startTraits(){

    const traits = this.traitInstances;
    const len = traits.length;
    for(let i = 0; i < len; ++i){
        const script = traits[i].script;
        script.start();
    }

};

Cog.prototype.build = function build(){ // urls loaded

    // script.prep is called earlier

    this.mount(); // mounts display, calls script.mount, then mount for all traits

    this.buildStates();
    this.buildWires();
    this.buildActions();
    this.buildRelays();

    this.script.init();

    this.buildTraits(); // calls prep on all traits -- mixes states, actions, etc
    this.initTraits(); // calls init on all traits

    this.buildBuses();
    this.buildEvents();

    this.buildCogs(); // placeholders for direct children, async loads possible
    this.buildChains();
    this.start(); // calls start for all traits

};

Cog.prototype.getFirstElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.head;
    }

    return c.placeholder || c.elements[0];

};

Cog.prototype.getLastElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.tail;
    }
    return c.placeholder || c.elements[c.elements.length - 1];

};

Cog.prototype.mount = function mount(){

    this.mountDisplay();
    this.script.mount();
    this.mountTraits();

};

Cog.prototype.start = function start(){

    this.script.start();
    this.startTraits();

};

Cog.prototype.restorePlaceholder = function restorePlaceholder(){

};

Cog.prototype.destroy = function(){

    this.dead = true;


    for(let i = 0; i < this.children.length; ++i){
        const c = this.children[i];
        c.destroy();
    }

    for(let i = 0; i < this.elements.length; ++i){
        const e = this.elements[i];
        e.parentNode.removeChild(e);
    }

    this.scope.destroy();
    this.children = [];

};

function _ASSERT_HTML_ELEMENT_EXISTS(name, el){
    if(!el){
        throw new Error('HTML Element + named [' + name + '] not found in display!' )
    }
}

export default Cog;

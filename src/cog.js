
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Placeholder from './placeholder.js';
import Trait from './trait.js';
import Catbus from './catbus.es.js';


function Cog(url, el, before, parent, config){

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

Cog.prototype.usePlaceholder = function() {

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

Cog.prototype.killPlaceholder = function() {

    if(!this.placeholder)
        return;

    Placeholder.give(this.placeholder);
    this.placeholder = null;

};


Cog.prototype.mountDisplay = function() {

    if(!this.script.display)
        return;

    let frag = document
        .createRange()
        .createContextualFragment(this.script.display);

    const named = frag.querySelectorAll('[name]');
    const len = named.length;
    const hash = this.namedElements;
    const scriptEls = this.script.els;

    for(let i = 0; i < len; ++i){
        const el = named[i];
        const name = el.getAttribute('name');
        hash[name] = el;
        scriptEls[name] = el;
    }

    this.elements = [].slice.call(frag.childNodes, 0);
    this.placeholder.parentNode.insertBefore(frag, this.placeholder);


};


Cog.prototype.load = function() {

    if(ScriptLoader.has(this.url)){
        this.onScriptReady();
    } else {
        ScriptLoader.request(this.url, this.onScriptReady.bind(this));
    }

};

Cog.prototype.onScriptReady = function() {

    this.script = Object.create(ScriptLoader.read(this.url));
    this.root = this.script.root;
    this.prep();

};


Cog.prototype.prep = function(){

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

    this.script.prep();
    this.loadBooks();

};



Cog.prototype.loadBooks = function loadBooks(){

    const urls = this.bookUrls = this.aliasContext.freshUrls(this.script.books);

    if(urls.length){
        this.scriptMonitor = new ScriptMonitor(urls, this.readBooks.bind(this));
    } else {
        this.loadTraits()
    }

};




Cog.prototype.readBooks = function readBooks() {

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


Cog.prototype.loadTraits = function loadTraits(){

    const urls = this.traitUrls = this.aliasContext.freshUrls(this.script.traits);

    if(urls.length){
        this.scriptMonitor = new ScriptMonitor(urls, this.build.bind(this));
    } else {
        this.build();
    }

};


Cog.prototype.buildStates = function buildStates(){

    const states = this.script.states;

    for(const k in states){

        const value = states[k];
        const i = k.indexOf(':');
        const topic = i === -1 ? null : k.substr(i+1);
        const name = i === -1 ? k : k.substring(0, i);

        const state = this.scope.state(name);
        state.write(value, topic || null, true);

    }

};




Cog.prototype.buildActions = function buildActions(){

    const actions = this.script.actions;

    for(const name in actions){

        const validator = actions[name]; // todo implement as functor filter
        this.scope.action(name);

    }

};

Cog.prototype.buildEvents = function buildEvents(){

    const events = this.script.events;
    const buses = this.busInstances;

    for(const name in events){

        const value = events[name];
        const el = this.namedElements[name];
        const bus = this.buildBusFromNyan(value, el);
        buses.push(bus);

    }

};

Cog.prototype.buildBusFromNyan = function buildBusFromNyan(nyanStr, el){
    return this.scope.bus(nyanStr, this.script, el, this.script.methods);
};

Cog.prototype.buildBusFromFunction = function buildBusFromFunction(f, el){

    //const bus = this.scope.bus()
};

Cog.prototype.buildBuses = function buildBuses(){

    const buses = this.script.buses;
    const len = buses.length;
    const instances = this.busInstances;

    for(let i = 0; i < len; ++i){

        const def = buses[i];
        const bus = this.buildBusFromNyan(def); // todo add function support not just nyan str
        instances.push(bus);

    }

};

Cog.prototype.buildCogs = function buildCogs(){

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

Cog.prototype.getNamedElement = function getNamedElement(name){

    if(!name)
        return null;

    const el = this.namedElements[name];

    if(!el)
        throw new Error('Named element ' + name + ' not found in display!');

    return el;

};

Cog.prototype.buildTraits = function buildData(){

    const traits = this.script.traits;
    const instances = this.traitInstances;

    const len = traits.length;
    for(let i = 0; i < len; ++i){
        const def = traits[i]; // todo path and root instead of url/root?
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
    this.buildTraits(); // calls prep on all traits
    this.buildStates();
    this.buildActions();

    this.script.init();
    this.initTraits(); // calls init on all traits
    this.buildBuses();
    this.mount(); // mounts display, calls script.mount, then mount for all traits
    this.buildCogs(); // placeholders for direct children, async loads possible
    this.killPlaceholder();
    this.start(); // calls start for all traits

};


Cog.prototype.mount = function mount(){

    this.mountDisplay();
    this.buildEvents();
    this.script.mount();
    this.mountTraits();

};

Cog.prototype.start = function start(){

    console.log('start me!', this);

    this.script.start();
    this.startTraits();

};

export default Cog;

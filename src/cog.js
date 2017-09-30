
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Placeholder from './placeholder.js';
import Trait from './trait.js';
import Catbus from './catbus.es.js';
import Gear from './gear.js';
import Chain from './chain.js';

let _id = 0;

function Cog(url, el, before, parent, config, index, key){

    this.id = ++_id;
    this.dead = false;
    this.firstElement = null;
    this.head = null;
    this.tail = null;
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

    if(!this.script.display) // check for valid html node
        return;

    let frag = document
        .createRange()
        .createContextualFragment(this.script.display);

    const named = frag.querySelectorAll('[name]');
    const len = named.length;
    const hash = this.namedElements;
    const scriptEls = this.script.els = {};

    for(let i = 0; i < len; ++i){
        const el = named[i];
        const name = el.getAttribute('name');
        hash[name] = el;
        scriptEls[name] = el;
    }

    this.elements = [].slice.call(frag.childNodes, 0);
    this.placeholder.parentNode.insertBefore(frag, this.placeholder);
    this.firstElement = this.elements[0];

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


Cog.prototype.buildStates = function buildStates(){

    const states = this.script.states;

    for(const name in states){

        const def = states[name];
        const state = this.scope.demand(name);

        if(def.hasValue) {

            const value = typeof def.value === 'function'
                ? def.value.call(this.script)
                : def.value;

            state.write(value, true);
        }

    }

    for(const name in states){

        const state = this.scope.grab(name);
        state.refresh();

    }

};

Cog.prototype.buildBelts = function buildBelts(){

    const belts = this.script.belts;

    for(const name in belts){

        const def = belts[name];
        const state = this.scope.demand(name);
        const action = this.scope.demand('$' + name);


        if(def.hasValue) {

            const value = typeof def.value === 'function'
                ? def.value.call(this.script)
                : def.value;

            state.write(value, true);

        }


    }

    for(const name in belts){

        const state = this.scope.grab(name);
        state.refresh();

    }

};


Cog.prototype.buildRelays = function buildRelays(){

    const scope = this.scope;
    const config = this.config;
    const relays = this.script.relays;
    const len = relays.length;

    for(let i = 0; i < len; ++i){

        const def = relays[i];

        const actionName = def.action;
        const stateName = def.state;
        const reportName = def.report;

        const remoteActionName = actionName && config[actionName];
        const remoteStateName = stateName && config[stateName];

        let remoteAction = remoteActionName ? scope.find(remoteActionName, true) : null;
        let remoteState = remoteStateName ? scope.find(remoteStateName, true) : null;

        let report = reportName ? scope.find(config[reportName], true) : null;

        let localAction = actionName ? scope.demand(actionName) : null;
        let localState = stateName ? scope.demand(stateName) : null;

        if(actionName && !stateName && remoteAction){ // only action goes out relay
                scope.bus().addSubscribe(actionName, localAction).write(remoteAction);

        }

        if(stateName && !actionName && remoteState){ // only state comes in relay
                scope.bus().addSubscribe(remoteStateName, remoteState).write(localState).pull();
        }

        if(actionName && stateName){ // defines both
            if(remoteAction && remoteState){ // wire action and state (wire together above)
                scope.bus().addSubscribe(actionName, localAction).write(remoteAction);
                scope.bus().addSubscribe(remoteStateName, remoteState).write(localState).pull();
            } else if (remoteAction && !remoteState){ // action to remote action to state
                scope.bus().addSubscribe(actionName, localAction).write(remoteAction);
                scope.bus().addSubscribe(remoteActionName, remoteAction).write(localState);
            } else if (remoteState && !remoteAction){ // action to remote state to state
                scope.bus().addSubscribe(actionName, localAction).write(remoteState);
                scope.bus().addSubscribe(remoteStateName, remoteState).write(localState).pull();
            } else { // neither configured, wire locally
                scope.bus().addSubscribe(actionName, localAction).write(localState);
            }
        }

        // todo wire with transform
        // todo add report -- remove write to remote state

    }

};


Cog.prototype.buildActions = function buildActions(){

    const actions = this.script.actions;
    const len = actions.length;

    for(let i = 0; i < len; ++i){

        const def = actions[i];
        this.scope.action(def.name);
        // also {bus, accept}

    }

};


Cog.prototype.buildEvents = function buildEvents(){

    const events = this.script.events;
    const buses = this.busInstances;

    for(const name in events){

        const value = events[name];
        const el = this.script.els[name];

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


Cog.prototype.buildBusFromNyan = function buildBusFromNyan(nyanStr, el){
    return this.scope.bus(nyanStr, this.script, el);
};


Cog.prototype.buildBusFromFunction = function buildBusFromFunction(f, el){

    //const bus = this.scope.bus()
};


Cog.prototype.buildBuses = function buildBuses(){

    const buses = this.script.buses;
    const belts = this.script.belts;

    const len = buses.length;
    const instances = this.busInstances;

    for(const name in belts){
        const bus = this.buildBusFromNyan('$' + name + ' | =' + name);
        bus.pull();
        instances.push(bus);
    }

    for(let i = 0; i < len; ++i){

        const def = buses[i];
        const bus = this.buildBusFromNyan(def); // todo add function support not just nyan str
        bus.pull();
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
        const el = this.getNamedElement(def.el);
        const before = !!(el && def.before);
        const isHead = (i === 0 && this.elements.length === 0) ||
            (!this.head && before && this.elements.length && el === this.elements[0]);

        if(def.type === 'gear') {
            const gear = new Gear(def.url, el, before, this, def.config);
            children.push(gear);
            if (isHead)
                this.head = gear;
        } else if (def.type === 'chain') {
            const url = aliasContext.resolveUrl(def.url, def.root);
            const chain = new Chain(url, el, before, this, def.config, def.source);
            children.push(chain);
            if (isHead)
                this.head = chain;
        } else {
            const url = aliasContext.resolveUrl(def.url, def.root);
            const cog = new Cog(url, el, before, this, def.config);
            children.push(cog);
            if(isHead)
                this.head = cog;
        }

    }

    if(len && !this.elements.length)
        this.tail = children[len - 1];

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

    this.buildTraits(); // calls prep on all traits -- mixes states, actions, etc
    this.buildStates();
    this.buildBelts();
    this.buildActions();
    this.buildRelays();

    this.script.init();

    this.initTraits(); // calls init on all traits
    this.mount(); // mounts display, calls script.mount, then mount for all traits

    this.buildBuses();
    this.buildEvents();
    this.buildCogs(); // placeholders for direct children, async loads possible
    this.killPlaceholder();
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

Cog.prototype.destroy = function(){

    this.dead = true;

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

    this.scope.destroy();
    this.children = [];

};

export default Cog;

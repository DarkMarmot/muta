
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Catbus from './catbus.es.js';


function Cog(url, config, parent){

    this.elements = [];
    this.children = [];
    this.parent = parent || null;
    this.scope = parent ? parent.scope.createChild() : Catbus.createChild();
    this.url = url;
    this.dir = '';
    this.script = null;
    this.config = config || {};
    this.scriptMonitor = null;
    this.aliasValveMap = null;
    this.aliasContext = null;

    this.bookUrls = null;
    this.traitUrls = null;

    this.traitInstances = [];
    this.buses = [];

    this.load();

}

Cog.prototype.load = function() {

    if(ScriptLoader.has(this.url)){
        this.onScriptReady();
    } else {
        ScriptLoader.request(this.url, this.onScriptReady.bind(this));
    }

};

Cog.prototype.onScriptReady = function() {

    this.script = Object.create(ScriptLoader.read(this.url));
    this.dir = this.script.dir;
    this.prep();

};


Cog.prototype.prep = function(){

    const parent = this.parent;
    const aliasValveMap = parent ? parent.aliasValveMap : null;
    const aliasList = this.script.alias;

    if(parent && parent.dir === this.dir && !aliasList && !aliasValveMap){
        // same relative path, no new aliases and no valves, reuse parent context
        this.aliasContext = parent.aliasContext;
        this.aliasContext.shared = true;
    } else {
        // new context, apply valves from parent then add aliases from cog
        this.aliasContext = parent
            ? parent.aliasContext.clone()
            : new AliasContext(this.dir); // root of application
        this.aliasContext.restrictAliasList(aliasValveMap);
        this.aliasContext.injectAliasList(aliasList);
    }

    this.script.prep();
    this.loadBooks();

};



Cog.prototype.loadBooks = function loadBooks(){

    const urls = this.bookUrls = this.aliasContext.freshUrls(this.script.book);

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

    const urls = this.traitUrls = this.aliasContext.freshUrls(this.script.trait);

    if(urls.length){
        this.scriptMonitor = new ScriptMonitor(urls, this.init.bind(this));
    } else {
        this.init();
    }

};


Cog.prototype.buildData = function buildData(){

};

Cog.prototype.buildBus = function buildBus(){

};

Cog.prototype.buildTraits = function buildData(){

};

Cog.prototype.readyTraits = function readyTraits(){

};

Cog.prototype.mountTraits = function mountTraits(){

};

Cog.prototype.startTraits = function startTraits(){

};

Cog.prototype.init = function init(){

    this.buildData();

    this.script.init();

    this.buildTraits();
    this.buildBus();

    this.ready();

};


Cog.prototype.ready = function ready(){

    this.readyTraits();
    this.script.ready();

    this.mount();

};


Cog.prototype.mount = function mount(){

    this.mountTraits();
    this.script.ready();

    this.start();

};

Cog.prototype.start = function start(){

    console.log('start me!', this);

    this.startTraits();
    this.script.start();

};

export default Cog;

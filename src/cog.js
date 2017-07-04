
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';


function Cog(el, url, config, parent){

    this.el = el;
    this.parent = parent;
    this.url = url;
    this.dir = toDir(url);
    this.script = null;
    this.config = config || {};
    this.scriptMonitor = null;
    this.valveMap = null;
    this.aliasContext = null;

    this.bookUrls = null;
    this.traitUrls = null;

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
    this.prep();

};


Cog.prototype.prep = function(){

    const parent = this.parent;
    const valveMap = parent ? parent.valveMap : null;
    const aliasList = this.script.alias;

    if(parent && parent.dir === this.dir && !aliasList && !valveMap){
        // same relative path, no new aliases and no valves, reuse parent context
        this.aliasContext = parent.aliasContext;
        this.aliasContext.shared = true;
    } else {
        // new context, apply valves from parent then add aliases from cog
        this.aliasContext = parent
            ? parent.aliasContext.clone()
            : new AliasContext(this.dir); // root of application
        this.aliasContext.restrictAliasList(valveMap);
        this.aliasContext.injectAliasList(aliasList);
    }

    this.script.prep && this.script.prep();
    this.loadBooks();

};

Cog.prototype.init = function init(){


    console.log('init me!', this);

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
        if(book.__type !== 'book')
            console.log('EXPECTED BOOK: got ', book.__type, book.__url);

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


function toDir(url){

    const i = url.lastIndexOf('/');
    return url.substring(0, i + 1);

}

export default Cog;

import Catbus from './catbus.es.js';
import PathResolver from './pathResolver.js';
import ScriptLoader from './scriptLoader.js';
import ScriptMonitor from './scriptMonitor.js';
import Cog from './cog.js';

const Muta = {};
const NOOP = function(){};

Muta.PR = PathResolver;

Muta.init = function init(el, url){

    url = PathResolver.resolveFile(null, url);
    return new Cog(url, el);

};

const defaultMethods = ['prep','init','mount','start','dismount','destroy'];

const defaultCogProps = {
    type: 'cog',
    config: null,
    api: null,
    cogs: [],
    traits: [],
    books: []
};

Muta.cog = function cog(def){

    for(const prop in defaultCogProps){
        def[prop] = def.hasOwnProperty(prop) ? def[prop] : defaultCogProps[prop];
    }

    for(let i = 0; i < defaultMethods.length; i++){
        const name = defaultMethods[i];
        def[name] = def[name] || NOOP;
    }

    ScriptLoader.currentScript = def;

};


Muta.trait = function trait(def){

    def.type = 'trait';
    def.config = null;
    def.cog = null; // becomes cog script instance

    for(let i = 0; i < defaultMethods.length; i++){
        const name = defaultMethods[i];
        def[name] = def[name] || NOOP;
    }

    ScriptLoader.currentScript = def;

};

Muta.book = function book(def){

    def.type = 'book';
    ScriptLoader.currentScript = def;

};

Muta.loadScript = function(path){
    ScriptLoader.load(path);
};

Muta.getScriptMonitor = function(paths, readyCallback){
    return new ScriptMonitor(paths, readyCallback);
};


export default Muta;

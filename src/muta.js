import Catbus from './catbus.es.js';
import PathResolver from './pathResolver.js';
import ScriptLoader from './scriptLoader.js';
import ScriptMonitor from './scriptMonitor.js';
import Cog from './cog.js';

const Muta = {};
const NOOP = function(){};
const TRUE = function(){ return true;};

Muta.init = function init(el, url){

    url = PathResolver.resolveUrl(null, url);
    return new Cog(url, el);

};

const defaultMethods = ['prep','init','mount','start','unmount','destroy'];
const defaultArrays = ['alias', 'cogs', 'traits', 'states', 'actions', 'buses', 'books', 'relays'];
const defaultHashes = ['els', 'methods', 'events'];


function createWhiteList(v){

    if(typeof v === 'function') // custom acceptance function
        return v;

    if(Array.isArray(v)) {
        return function (x) {
            return v.indexOf(x) !== -1;
        }
    }

    return TRUE;
}

function prepStateDefs(states){

    const len = states.length;
    const list = [];

    for(let i = 0; i < len; ++i){

        const def = states[i];
        const specificName = def.specificName = def.name;
        def.hasValue = def.hasOwnProperty('value');
        def.hasAccept = def.hasOwnProperty('accept');
        def.value = def.hasValue && def.value;
        def.accept = def.hasAccept ? createWhiteList(def.hasAccept) : NOOP;
        const hasColon = specificName.indexOf(':') === -1;
        def.topic = hasColon ? null : specificName.substr(i+1);
        def.name = hasColon ? specificName : specificName.substring(0, i);

        list.push(def);

    }

    return list;

}


Muta.cog = function cog(def){

    def.id = 0;
    def.api = null;
    def.config = null;
    def.type = 'cog';

    for(let i = 0; i < defaultHashes.length; i++){
        const name = defaultHashes[i];
        def[name] = def[name] || {};
    }

    for(let i = 0; i < defaultArrays.length; i++){
        const name = defaultArrays[i];
        def[name] = def[name] || [];
    }

    for(let i = 0; i < defaultMethods.length; i++){
        const name = defaultMethods[i];
        def[name] = def[name] || NOOP;
    }

    def.states = prepStateDefs(def.states);

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

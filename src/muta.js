import Catbus from './catbus.es.js';
import PathResolver from './pathResolver.js';
import ScriptLoader from './scriptLoader.js';
import ScriptMonitor from './scriptMonitor.js';
import Cog from './cog.js';

let Muta = {};
const NOOP = function(){};
const TRUE = function(){ return true;};

Muta.init = function init(slot, url){

    url = PathResolver.resolveUrl(null, url);
    return new Cog(url, slot);

};

const defaultMethods = ['prep','init','mount','start','unmount','destroy'];
const defaultArrays = ['alias', 'traits', 'states', 'actions', 'buses', 'books', 'relays'];
const defaultHashes = ['els', 'cogs', 'chains', 'gears', 'methods', 'events'];



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

function prepCogDefs(data){

    if(!data)
        return data;

    for(const name in data){

        const val = data[name];
        const def = val && typeof val === 'string' ? {url: val} : val;
        data[name] = def;

    }

    return data;

}

function prepGearDefs(data){

    if(!data)
        return data;

    for(const name in data){

        const val = data[name];
        const def = val && typeof val === 'string' ? {url: val} : val;
        data[name] = def;

    }

    return data;

}

function prepDataDefs(data, asActions){

    if(!data)
        return data;

    for(const name in data){


        const val = data[name];
        const def = val && typeof val === 'object' ? val : {value: val};

        def.hasValue = def.hasOwnProperty('value');
        def.hasAccept = def.hasOwnProperty('accept');
        def.value = def.hasValue && def.value;
        def.accept = def.hasAccept ? createWhiteList(def.hasAccept) : NOOP;
        def.name = (asActions && name[0] !== '$') ? '$' + name : name;

        data[name] = def;

    }

    return data;

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


    def.cogs = prepCogDefs(def.cogs);
    def.gears = prepCogDefs(def.gears);
    def.states = prepDataDefs(def.states);
    def.wires  = prepDataDefs(def.wires);
    def.actions  = prepDataDefs(def.actions, true);

    ScriptLoader.currentScript = def;

};


Muta.trait = function trait(def){

    def.type = 'trait';
    def.config = null;
    def.cog = null; // becomes cog script instance
    def.trait = null;

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

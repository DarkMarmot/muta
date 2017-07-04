import Catbus from './catbus.es.js';
import PathResolver from './pathResolver.js';
import ScriptLoader from './scriptLoader.js';
import ScriptMonitor from './scriptMonitor.js';
import App from './app.js';
import Cog from './cog.js';

const Muta = {};
const NOOP = function(){};

Muta.PR = PathResolver;

Muta.init = function init(el, url){

    return new Cog(el, url);

};

Muta.cog = function cog(def){

    def.__type = 'cog';
    def.pre = NOOP; //
    def.init = NOOP;
    def.ready = NOOP;
    def.mount = NOOP;
    def.destroy = NOOP;
    ScriptLoader.currentScript = def;

};

Muta.trait = function trait(def){

    def.__type = 'trait';
    ScriptLoader.currentScript = def;

};

Muta.book = function book(def){

    def.__type = 'book';
    ScriptLoader.currentScript = def;

};

Muta.loadScript = function(path){
    ScriptLoader.load(path);
};

Muta.getScriptMonitor = function(paths, readyCallback){
    return new ScriptMonitor(paths, readyCallback);
};


export default Muta;

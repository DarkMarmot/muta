import Catbus from './catbus.es.js';
import PathResolver from './pathResolver.js';
import ScriptLoader from './scriptLoader.js';
import ScriptMonitor from './scriptMonitor.js';
import App from './app.js';


const Muta = {};
const aliasCounter = 0;

Muta.PR = PathResolver;

Muta.init = function init(el, path){

    return new App(el, path);

};

Muta.cog = function cog(def){

    def.__type = 'cog';
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

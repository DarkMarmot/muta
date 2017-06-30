import Catbus from './catbus.es.js';
import ScriptLoader from './scriptLoader.js';
import App from './app.js';


const Muta = {};
const aliasCounter = 0;

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

Muta.scrap = function scrap(def){

    def.__type = 'scrap';
    ScriptLoader.currentScript = def;

};

Muta.loadScript = function(path){
    ScriptLoader.load(path);
};



export default Muta;

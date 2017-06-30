import Catbus from './catbus.es.js';
import ScriptLoader from './scriptLoader.js';
import App from './app.js';


const Muta = {};
const aliasCounter = 0;

Muta.init = function init(el, path){

    return new App(el, path);

};

Muta.cog = function has(cogDef){

    ScriptLoader.currentScript = cogDef;

};

Muta.trait = function has(traitDef){



};

Muta.scrap = function has(scrapDef){



};

Muta.loadScript = function(path){
    ScriptLoader.load(path);
};

Muta._takeCurrentScript = function(){
    const taken = currentScript;
    currentScript = null;
    return taken;
};

export default Muta;

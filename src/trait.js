
import ScriptLoader from './scriptLoader.js';


function Trait(cog, def){

    this.cog = cog;
    this.config = def.config || {};
    this.url = cog.aliasContext.resolveFile(def.file, def.dir);
    this.script = Object.create(ScriptLoader.read(this.url));
    this.script.cog = cog.script;
    this.script.config = this.config;
    this.script.api = cog.api;

}

export default Trait;
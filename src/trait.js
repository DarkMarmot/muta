
import ScriptLoader from './scriptLoader.js';


function Trait(cog, def){

    this.cog = cog;
    this.config = def.config || {};
    this.url = cog.aliasContext.resolveUrl(def.url, def.root);
    this.script = Object.create(ScriptLoader.read(this.url));
    this.script.cog = cog.script;
    this.script.config = this.config;
    this.script.api = cog.api;
    this.scope = cog.scope.createChild();

}

export default Trait;
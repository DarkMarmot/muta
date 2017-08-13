
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Placeholder from './placeholder.js';
import Trait from './trait.js';
import Catbus from './catbus.es.js';
import Cog from './cog.js';

let _id = 0;

function Gear(url, el, before, parent, config){

    this.id = ++_id;
    this.placeholder = null;
    this.el = el; // ref element
    this.before = !!before; // el appendChild or insertBefore

    this.children = [];
    this.parent = parent;
    this.scope = parent.scope.createChild();
    this.root = parent.root;
    this.config = config || {};
    this.aliasContext = parent.aliasContext;

    const nyan = url + ' | *createCog';
    this.bus = this.scope.bus(nyan, this);

    this.usePlaceholder();

    this.bus.pull();

}

Gear.prototype.usePlaceholder = function() {

    this.placeholder = Placeholder.take();

    if(this.el) {
        if (this.before) {
            this.el.parentNode.insertBefore(this.placeholder, this.el);
        } else {
            this.el.appendChild(this.placeholder);
        }
    } else {

        this.parent.placeholder.parentNode
            .insertBefore(this.placeholder, this.parent.placeholder);
    }

};

Gear.prototype.killPlaceholder = function() {

    if(!this.placeholder)
        return;

    Placeholder.give(this.placeholder);
    this.placeholder = null;

};



Gear.prototype.createCog = function createCog(msg){


    const children = this.children;
    const aliasContext = this.aliasContext;
    const url = aliasContext.resolveUrl(msg, this.root);

    if(children.length){

        const oldCog = children[0];
        const el = oldCog.elements[0]; // todo recurse first element for virtual cog
        const cog = new Cog(url, el, true, this, this.config);
        children.push(cog);
        children.shift(); // todo destroy
        oldCog.destroy();

    } else {

        const cog = new Cog(url, this.placeholder, true, this, this.config);
        children.push(cog);

    }

    this.killPlaceholder();


};


Gear.prototype.destroy = Cog.prototype.destroy;

export default Gear;

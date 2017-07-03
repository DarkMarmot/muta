
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';

// init aliases, if parent valves or local aliases -> new ac --> check books
// if books --> load books --> new ac --> check traits
// if traits --> load traits --> init --> make traits --> start --> load cogs -->

function Cog(script, config, parent){

    this.script = script;
    this.url = script.__url;
    this.dir = script.__dir;
    this.config = config;
    this.scriptMonitor = null;
    this.bookPaths = [];
    this.traitPaths = [];

    this.aliasContext = (parent && parent.dir === this.dir)
        ? parent.aliasContext : new AliasContext(this.dir);

    const newValveMap = parent && parent.valveMap;
    const newAliasMap = script && script.alias;

    if(newAliasMap || newValveMap){
        this.aliasContext = new AliasContext(this.dir, newAliasMap, newValveMap, this.aliasContext);
    }

    this.loadBooks(script);

}


function itemsToFileList(context, items){

    const paths = [];
    for(let i = 0; i < items.length; i++){
        const item = items[i];
        const file = context.resolveFile(item.file, item.dir);
        if(!ScriptLoader.has(file) && paths.indexOf(file) === -1)
            paths.push(file);
    }
    return paths;

}

Cog.prototype.loadBooks = function loadBooks(){

    this.bookPaths = itemsToFileList(this.aliasContext, this.script.book);
    if(this.bookPaths.length){
        this.scriptMonitor = new ScriptMonitor(this.bookPaths, this.readBooks.bind(this));
    } else {
        this.loadTraits()
    }

};


Cog.prototype.readBooks = function readBooks() {

    const paths = this.bookPaths;
    const aliasMap = {};

    for (let i = 0; i < paths.length; ++i) {

        const book = ScriptLoader.read(path);
        if(book.__type !== 'book')
            console.log('EXPECTED BOOK: got ', book.__type, book.__path);

        const aliasList = book.alias;

        for(let j = 0; j < aliasList.length; ++j){
            const alias = aliasList[j];
            aliasMap[alias.name] = this.aliasContext.resolveFile(alias.file, alias.dir);
        }

    }

    this.aliasContext = new AliasContext(this.dir, aliasMap, null, this.aliasContext);
    this.loadTraits();

};


Cog.prototype.loadTraits = function loadTraits(){

    this.traitPaths = itemsToFileList(this.aliasContext, this.script.trait);
    if(this.traitPaths.length){
        this.scriptMonitor = new ScriptMonitor(this.traitPaths, this.init.bind(this));
    } else {
        this.loadTraits();
    }

};


Cog.prototype.initAliases = function initAliases(){

};


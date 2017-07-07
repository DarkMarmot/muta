
import PathResolver from './pathResolver.js';
import ScriptLoader from './scriptLoader.js';

// whenever new aliases or valves (limiting access to aliases) are encountered,
// a new aliasContext is created and used to resolve files and directories.
// it inherits the aliases from above and then extends or limits those.
//
// the resolveFile and resolveDir methods determine a path from a file and/or
// directory combination (either can be an alias). if no directory is
// given -- and the file or alias is not an absolute path -- then a relative path
// is generated from the current file (returning a new absolute path).
//
// (all method calls are cached here for performance reasons)

function AliasContext(sourceDir, aliasMap, valveMap){

    this.sourceDir = sourceDir;
    this.aliasMap = aliasMap ? restrict(copy(aliasMap), valveMap) : {};
    this.fileCache = {}; // 2 level cache (first dir, then file)
    this.dirCache = {}; // 2 level cache (first dir, then file)
    this.shared = false; // shared once used by another lower cog

}

AliasContext.prototype.clone = function(){
    return new AliasContext(this.sourceDir, this.aliasMap);
};


AliasContext.prototype.restrictAliasList = function(valveMap){
    this.aliasMap = restrict(this.aliasMap, valveMap);
    return this;
};

AliasContext.prototype.injectAlias = function(alias){
    this.aliasMap[alias.name] = this.resolveFile(alias.file, alias.dir);
    return this;
};

AliasContext.prototype.injectAliasList = function(aliasList){
    for(let i = 0; i < aliasList.length; i++){
        this.injectAlias(aliasList[i]);
    }
    return this;
};

// given a list of objects with file and dir, get urls not yet downloaded

AliasContext.prototype.freshUrls = function freshUrls(list) {

    const result = [];

    if(!list)
        return result;

    for(let i = 0; i < list.length; i++){
        const url = this.itemToUrl(list[i]);
        if(!ScriptLoader.has(url) && result.indexOf(url) === -1)
            result.push(url);
    }

    return result;

};




AliasContext.prototype.itemToUrl = function applyUrl(item) {
    return this.resolveFile(item.file, item.dir);
};


AliasContext.prototype.resolveFile = function resolveFile(file, dir){

    const cache = this.fileCache;
    dir = dir || this.sourceDir || '';
    const baseCache = cache[dir] = cache[dir] || {};
    return baseCache[file] = baseCache[file] ||
        PathResolver.resolveFile(this.aliasMap, file, dir);

};

AliasContext.prototype.resolveDir = function resolveDir(url, base){

    const cache = this.dirCache;
    base = base || this.sourceDir || '';
    const baseCache = cache[base] = cache[base] || {};
    return baseCache[url] = baseCache[url] ||
        PathResolver.resolveDir(this.aliasMap, url, base);

};


// limits the source hash to only have keys found in the valves hash (if present)

function restrict(source, valves){

    if(!valves)
        return source;

    const result = {};
    for(const k in valves){
        result[k] = source[k];
    }

    return result;
}

// creates a shallow copy of the source hash

function copy(source, target){

    target = target || {};
    for(const k in source){
        target[k] = source[k];
    }
    return target;

}

export default AliasContext;
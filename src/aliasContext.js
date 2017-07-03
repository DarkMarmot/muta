
import PathResolver from './pathResolver.js';

// each context contains a map of aliases
// a cache of resolved url and base combos
// a script monitor for when the context is ready
// a getChild to make a new context with a shallow copy of the alias map
// something to apply valves to the context

// first alias context -- if local aliases or parent valves, extend parent's
// if books, load books -- add aliases from books, new context

// load books, add aliases, create new context
// load traits

const EMPTY = {};

function AliasContext(sourceDir, aliasMap, valveMap, from){

    const baseAliasMap = from // another base context
        ? restrict(copy(from.aliasMap), from.valveMap)
        : EMPTY;

    this.sourceDir = sourceDir;
    this.aliasMap = copy(aliasMap, baseAliasMap);
    this.valveMap = valveMap || EMPTY;
    this.fileCache = {};
    this.dirCache = {};

}

AliasContext.prototype.resolveFile = function resolveFile(url, base){

    const cache = this.fileCache;
    base = base || this.sourceDir || '';
    const baseCache = cache[base] = cache[base] || {};
    return baseCache[url] = baseCache[url] ||
        PathResolver.resolveFile(this.aliasMap, url, base);

};

AliasContext.prototype.resolveDir = function resolveDir(url, base){

    const cache = this.dirCache;
    base = base || this.sourceDir || '';
    const baseCache = cache[base] = cache[base] || {};
    return baseCache[url] = baseCache[url] ||
        PathResolver.resolveDir(this.aliasMap, url, base);

};


function restrict(source, valves){

    if(!valves)
        return source;

    const result = {};
    for(const k in valves){
        result[k] = source[k];
    }

    return result;
}


function copy(source, target){

    target = target || {};
    for(const k in source){
        target[k] = source[k];
    }
    return target;

}

export default AliasContext;
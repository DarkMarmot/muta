
import PathResolver from './pathResolver.js';

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
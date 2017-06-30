
// each context contains a map of aliases
// each has a hash of context loaders (tracking a file getting dependencies)


function Context(aliasMap){

    this.aliasMap = aliasMap ? shallowCopy(aliasMap) : {};
    this.loaders = {};

}

Context.prototype.need = function need(path){

    this.aliasMap[name] = path;

};

Context.prototype.request = function request(path, needs, callback){

    if(!this.loaders[path]){
        const loader = this.loaders[path] = new ContextLoader(this, path, needs);
    }

};


function shallowCopy(obj){

    const result = {};
    for(const k in obj){
        result[k] = obj[k];
    }
    return result;

}
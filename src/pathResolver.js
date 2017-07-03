
// path context cache -- for url base combos already resolved

const PathResolver = {};
const ANCHOR = document.createElement('a');

// base is current file root or specified root

PathResolver.resolveFile = function resolveFile(aliasMap, url, base) {

    url = aliasMap ? (aliasMap[url] || url) : url;

    if(base && url.indexOf('http') !== 0)  {

            base = aliasMap[base] || base;
            const lastChar = base.substr(-1);
            url = (lastChar !== '/') ? base + '/' + url : base + url;

    }

    ANCHOR.href = url;
    return ANCHOR.href;

};

PathResolver.resolveDir = function resolveDir(aliasMap, url, base){

    const path = PathResolver.resolveFile(aliasMap, url, base);
    return toDir(path);

};


function toDir(path){
    const i = path.lastIndexOf('/');
    return path.substring(0, i + 1);
}



export default PathResolver;
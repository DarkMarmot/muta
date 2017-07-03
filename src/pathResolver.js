
// the PathResolver is a namespace that uses a browser hack to generate an
// absolute path from a url string -- using an anchor tag's href.
// it combines the aliasMap with a file and possible base directory.

const PathResolver = {};
const ANCHOR = document.createElement('a');

PathResolver.resolveFile = function resolveFile(aliasMap, file, dir) {

    file = aliasMap ? (aliasMap[file] || file) : file;

    if(dir && file.indexOf('http') !== 0)  {

            dir = aliasMap ? (aliasMap[dir] || dir) : dir;
            const lastChar = dir.substr(-1);
            file = (lastChar !== '/') ? dir + '/' + file : dir + file;

    }

    ANCHOR.href = file;
    return ANCHOR.href;

};

PathResolver.resolveDir = function resolveDir(aliasMap, file, dir){

    return toDir(PathResolver.resolveFile(aliasMap, file, dir));

};


function toDir(path){
    const i = path.lastIndexOf('/');
    return path.substring(0, i + 1);
}


export default PathResolver;
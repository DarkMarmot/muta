
// holds a cache of all scripts loaded by url
// provides dynamic dependency callbacks (in case new dependencies emerge)

const ScriptLoader = {};
const status = { loaded: {}, failed: {}, fetching: {}};
const cache = {};
const listenersByFile = {}; // loaded only, use init timeouts to request again


function cleanup(e){

    const target = e.target;
    target.onload = target.onerror = null;

}

ScriptLoader.currentScript = null;

ScriptLoader.onError = function onError(e){

    const src = e.target.src;
    const f = status.failed[src] || 0;
    status.failed[src] = f + 1;
    status.fetching[src] = false;
    cleanup(e);

    if(f < 3) {
        setTimeout(ScriptLoader.load, f * 1000, src);
    }

    console.log('script err', e);

};

ScriptLoader.onLoad = function onLoad(e){

    const src = e.target.src;
    console.log('on load for', src);
    status.loaded[src] = true;
    cache[src] = ScriptLoader.currentScript;
    console.log('cache',cache);
    cleanup(e);

    const listeners = listenersByFile[src] || [];
    const len = listeners.length;
    for(let i = 0; i < len; ++i){
        listeners[i]();
    }

    listenersByFile[src] = [];

    console.log('script load', e);

};

ScriptLoader.request = function(path, callback){

    if(status.loaded[path])
        return callback(path);

    const listeners = listenersByFile[path] = listenersByFile[path] || [];
    if(listeners.indexOf[callback] === -1){
        listeners.push(callback);
    }

    ScriptLoader.load(path);

};

ScriptLoader.load = function(path){

    if(status.fetching[path]) // also true if loaded, this only clears on error
        return;

    const script = document.createElement("script");

    script.onerror = ScriptLoader.onError;
    script.onload = ScriptLoader.onLoad;
    script.async = true;
    script.charset = "utf-8";
    script.src = path;

    console.log('here comes', path);
    status.fetching[path] = true;
    document.head.appendChild(script);

    console.log('added', path);


};

export default ScriptLoader;

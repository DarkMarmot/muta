
import ScriptLoader from './scriptLoader.js';

// holds a cache of all Contexts loaded by url
// provides dynamic dependency callbacks (in case new dependencies emerge)

const ContextLoader = {};
const contexts = {}; // by id, then path to contextLoader


ContextLoader.load = function load(contextId, path, needs){

    const pathStatus = contexts[contextId] = contexts[contextId] || {};
    pathStatus[path] = pathStatus[path] || {needs: needs, ready: false};

};

function ContextLoader(contextId, path){

    this.contextId = contextId;
    this.path = path;
    this.filesNeeded = {};

}

function cleanup(e){

    const target = e.target;
    target.onload = target.onerror = null;

}

ContextLoader.onError = function onError(e){

    const src = e.target.src;
    const f = status.failed[src] || 0;
    status.failed[src] = f + 1;
    status.fetching[src] = false;
    cleanup(e);

    if(f < 3) {
        setTimeout(ContextLoader.load, f * 1000, src);
    }

    console.log('Context err', e);

};

ContextLoader.onLoad = function onLoad(e){

    const src = e.target.src;
    status.loaded[src] = true;
    cleanup(e);

    const listeners = listenersByFile[src] || [];
    const len = listeners.length;
    for(let i = 0; i < len; ++i){
        listeners[i]();
    }

    listenersByFile[src] = [];

    console.log('Context load', e);

};

ContextLoader.request = function(path, callback){

    if(status.loaded[path])
        return callback(path);

    const listeners = listenersByFile[path] = listenersByFile[path] || [];
    if(listeners.indexOf[callback] === -1){
        listeners.push(callback);
    }

    ContextLoader.load(path);

};

ContextLoader.load = function(path){

    if(status.fetching[path]) // also true if loaded, this only clears on error
        return;

    const Context = document.createElement("Context");

    Context.onerror = ContextLoader.onError;
    Context.onload = ContextLoader.onLoad;
    Context.async = true;
    Context.charset = "utf-8";
    Context.src = path;

    status.fetching[path] = true;
    document.head.appendChild(Context);


};

export default ContextLoader;

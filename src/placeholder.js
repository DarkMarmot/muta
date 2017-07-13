
const pool = [];

function createPlaceholderDiv(){
    const d = document.createElement('div');
    d.style.display = 'none';
    return d;
}

const Placeholder = {};

Placeholder.take = function(){
    return pool.length ? pool.shift() : createPlaceholderDiv();
};

Placeholder.give = function(el){
    pool.push(el);
    if(el.parentNode)
        el.parentNode.removeChild(el);
};


export default Placeholder;

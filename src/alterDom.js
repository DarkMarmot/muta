
function AlterDom(el) {
    this._el = el;
    this._display = this.style.display;
    this._visible = false;

}

// todo add getter for el

AlterDom.prototype.focus = function focus() {
    this._el.focus();
};

AlterDom.prototype.blur = function blur() {
    this._el.focus();
};

AlterDom.prototype.value = function value(value) {
    if(arguments.length === 0) {
        return this.el.value;
    }
    this.value = value;
};

AlterDom.prototype.toggleFocus = function toggleFocus(focus) {

    focus ? this._el.focus() : this._el.blur();

};

AlterDom.prototype.toggleDisplay = function toggleDisplay(visible) {

    if(arguments.length === 0) {
        this._visible = !this._visible;
    } else {
        this._visible = visible;
    }
    this._updateDisplay();

};

AlterDom.prototype.showDisplay = function showDisplay(display) {

    this._visible = true;
    if(arguments.length === 1) {
        this._display = display;
    }
    this._updateDisplay();

};

AlterDom.prototype.hideDisplay = function hideDisplay(display) {

    this._visible = false;
    if(arguments.length === 1) {
        this._display = display;
    }
    this._updateDisplay();

};


AlterDom.prototype._updateDisplay = function _updateDisplay(display) {

    const display = this._visible ? this._display || 'block' : 'none';
    this._el.style.display = display;

};

AlterDom.prototype.text = function text(text) {

    this._el.innerText = text;

};

AlterDom.prototype.toggleClasses = function(changes){

    const toHash = function(acc, v){ acc[v] = true; return acc;};
    const current = this._el.className.split(' ').reduce(toHash, {});

    for(const k in changes){

        const request = changes[k];
        current[k] = !request;

    }

    let result = '';
    for(const k in current) {
        if(current[k])
            result += k;
    }

    this._el.className = result;
    return this;

};

    Rei.prototype.toggleClass = function(nameOrNames, add){

        if(!nameOrNames) return false;
        var names = nameOrNames.split(' ');

        for(const k in hash){
            var name = names[i];
            if(name) {
                if(arguments.length == 2)
                    this._toggleClass(name, add);
                else
                    this._toggleClassImplicitly(name);
            }
        }


        return this;
    };

    Rei.prototype._toggleClass = function(name, setting){

        var class_list = this[0].classList;

        if(setting)
            class_list.add(name);
        else
            class_list.remove(name);

        return this;

    };

    Rei.prototype._toggleClassImplicitly = function(name){ // this is a bad way to do things, just for jquery compatibility

        var class_list = this[0].classList;

        if(!class_list.contains(name)) {
            class_list.add(name);
        } else {
            class_list.remove(name);
        }

        return this;
    };



    Rei.prototype.addClass = function(nameOrNames){
        var names = nameOrNames.split(' ');
        var class_list = this[0].classList;
        for(var i = 0; i < names.length; i++){
            var name = names[i];
            if(name)
                class_list.add(name);
        }
        return this;
    };


    Rei.prototype.removeClass = function(nameOrNames){
        if(!nameOrNames){
            this.removeAllClasses();
            return this;
        }
        var names = nameOrNames.split(' ');
        var class_list = this[0].classList;
        for(var i = 0; i < names.length; i++){
            var name = names[i];
            if(name)
                class_list.remove(name);
        }
        return this;
    };


    Rei.prototype.removeAllClasses = function(){
        var arr = [];
        var i;
        var list = this[0].classList;

        for(i = 0; i < list.length; i++){
            arr.push(list.item(i));
        }

        for(i = 0; i < arr.length; i++){
            this.removeClass(arr[i]);
        }

        return this;
    };


    Rei.prototype.prop = function(nameOrOptions, value){
        var element = this[0];
        if(arguments.length === 0) return element;
        if(arguments.length === 2) {
            element[nameOrOptions] = value;
        } else {
            for(var p in nameOrOptions){
                element[p] = nameOrOptions[p];
            }
        }
        return this;
    };

    Rei.prototype.css = function(nameOrOptions, value){
        var style = this[0].style;
        if(arguments.length === 0) return style;
        if(arguments.length === 2) {
            style[nameOrOptions] = value + '';
        } else {
            if(typeof nameOrOptions === 'string')
                return this[0].style[nameOrOptions];
            for(var p in nameOrOptions){
                style[p] = nameOrOptions[p] + '';
            }
        }
        return this;
    };

    Rei.prototype.attr = function(nameOrOptions, value){
        var attributes = this[0].attributes;
        if(arguments.length === 0) return attributes;
        if(arguments.length === 2) {
            this[0].setAttribute(nameOrOptions, value);
        } else {
            if(typeof nameOrOptions === 'string')
                return this[0].getAttribute(nameOrOptions);
            for(var p in nameOrOptions){
                this[0].setAttribute(p, nameOrOptions[p]);
            }
        }
        return this;
    };

    Rei.prototype.removeAttr = function(name){
        this[0].removeAttribute(name);
        return this;
    };



}).call(this);


function App(el, path){

    this.catbus = Catbus;
    this.scope = this.catbus.createChild();
    this.el = el;
    this.path = path;

}

export default App;

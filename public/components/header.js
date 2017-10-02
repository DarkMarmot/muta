

Muta.cog({

    relays: [
        {action: 'target'},
        // {wire: 'target'}
    ],



    display: '<div name="header" class="header" > i am the header ' +
    '<div name="gg">guppy change</div></div>',

    alias: [],

    events: {
        header: '@click | *p { *log } | =$target', // todo -- err desc for target not found
        gg: '@click | *rnd | =$guppy'
    },

    states:
        {dog: 'dog.js'}
    ,

    rnd: function(){
      if(Math.random() < .5){
          return 'x1.js';
      }
      return 'x2.js';
    },
    p: function() {
        console.log('p is ', this.config.p);
        return this.config.p;
    }
    ,
    log: function(msg){
        console.log('my msg:', msg, this);
    }

});

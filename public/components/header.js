

Muta.cog({

    relays: [
        {action: 'target'}
    ],

    display: '<div name="header" class="header" > i am the header </div>',

    alias: [],

    events: {
        header: '@click | *p { *log } | =target'
    },

    states: [
        {name: 'dog', value: 'dog.js'}
    ],
    methods: {
        p: function(){
            return this.config.p;
            },
        log: function(msg){
          //  console.log('my msg:', msg, this);
        }
    }


});


Muta.cog({

    display: '<div name="bunny" style="background: #6b543c; color: #ffdf88; padding: 10px;">moo dog win!</div>',

    alias: [
        {name: 'ROOT', url: './'}
    ],

    cogs: [

        {url: 'cow.js', el: 'bunny', put: 'after'},
        {url: 'frog.js', el: 'bunny', before: true},
        {url: 'dog.js', config: {say: 'puppy'}}

    ],

    books: [
        {url: 'meow.js'}
    ],

    states: [
        {name: 'puppy', value: function(){ this.methods.add1(5);} },
        {name: 'kitty', value: 'whiskers'},
        {name: 'gar', value: 19}
    ],

    actions: [
        {name:'meow_cmd'}
    ],


    events: {
      bunny: '@click | =meow_cmd'
    },

    buses: [
        '^meow_cmd | gar | *add1 | =gar',
        'puppy | =gar',
        'gar | *hop'
    ],

    traits: [
        {url: 'test2.js', config: { meow: 'i do meow!'}}
    ],

    methods: {
        hop: function(msg){ console.log('method hop - ', msg, this);},
        add1: function(n){

            n = n + 10;
            console.log('ADD', n, this);
            return n;
        }
    }

});
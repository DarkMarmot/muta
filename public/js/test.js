
Muta.cog({

    display: '<div name="bunny" style="background: #6b543c; color: #ffdf88; padding: 10px;">moo dog win!</div>',

    alias: [
        {name: 'ROOT', url: './'}
    ],

    cogs: [

        {url: 'cow.js', el: 'bunny', put: 'after'},
        {url: 'dog.js', el: 'bunny'},
        {url: 'dog.js', config: {say: 'puppy'}}

    ],

    books: [
        {url: 'meow.js'}
    ],

    states: {
        puppy: 5,
        kitty: 'whiskers',
        gar: 19
    },

    actions: {
        'meow_cmd': true // bus: '',
    },



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
            console.log('ADD');
            return n + 1;
        }
    }

});
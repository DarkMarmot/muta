
Muta.cog({

    test1: 'rock!',

    display: '<div name="bunny" style="background: red; color: white; padding: 10px;">moo dog win!</div>',

    init: function(){
       console.log('moo!');
    },

    alias: [
        {name: 'ROOT', file: './'}
    ],

    cogs: [
        {file: 'cow.js', el: 'bunny'},
        {file: 'dog.js', el: 'bunny'},
        {file: 'dog.js', config: {say: 'puppy'}}
    ],

    books: [
        {file: 'meow.js'}
    ],

    traits: [
        {file: 'test2.js', config: { meow: 'i do meow!'}}
    ]

});
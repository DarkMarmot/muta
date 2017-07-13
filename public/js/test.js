
console.log('loadin test 1!');

Muta.cog({
    test1: 'rock!',

    display: '<div name="bunny">moo dog win!</div>',
    init: function(){
       console.log('moo!');
    },

    alias: [
        {name: 'ROOT', file: './'}
    ],

    book: [
        {file: 'meow.js'}
    ],

    trait: [
        {file: 'test2.js', config: { meow: 'i do meow!'}}
    ]
});
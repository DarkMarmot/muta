
console.log('loadin test 1!');

Muta.cog({
    test1: 'rock!',

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
        {file: 'test2.js', config: { meow: 1}}
    ]
});
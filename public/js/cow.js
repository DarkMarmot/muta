
console.log('loadin cow cog!');

Muta.cog({
    test1: 'rock!',

    display: '<div>cow appears!</div>',
    init: function(){
       console.log('cow says moo!');
    },

    traits: [
        {file: 'test2.js', config: { meow: 'i do not meow!'}}
    ]
});

console.log('loadin cow cog!');

Muta.cog({
    test1: 'rock!',

    display: '<div name="frog" style="background: pink; color: white; padding: 20px;">frog appears!</div>',
    init: function(){

    },

    cogs: [
        {url: 'dog.js', el: 'frog'},
    ],

    traits: [
        {url: 'test2.js', config: { meow: 'i do not bark!'}}
    ]
});
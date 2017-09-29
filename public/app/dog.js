
console.log('loadin cow cog!');

Muta.cog({

    test1: 'rock!',

    display: '<div name="dog" style="background: blue; color: white; padding: 20px;">dog appears!</div>',
    init: function(){
       console.log('cow says moo!');
       console.log('dog', this);
    },

    cogs: [
        {url: 'gar.js'},
        {url: 'gar.js', el: 'dog'}
    ],

    traits: [
        {url: 'test2.js', config: { meow: 'i do not bark!'}}
    ]

});
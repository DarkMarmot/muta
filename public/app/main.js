
Muta.cog({

    prep: function(){
      console.log('i am prepping!');
    },

    display: '<div name="app" class="main"></div>',

    alias: [
        {name: 'APP_ROOT', url: './'},
        {name: 'COMPONENTS', url: '../components'},
        {name: 'BUTTON', url: 'button.js', root: 'COMPONENTS'}
    ],

    cogs: [

        {url: 'header.js', root: 'COMPONENTS', el: 'app', config: {p: 'pike.js'}},
        {url: 'bunny.js', type: 'chain', el: 'app', source: 'stuff'},
        {url: 'header.js', root: 'COMPONENTS', el: 'app', config: {p: 'gar.js'}},
        {url: 'puppy', type: 'gear'}

    ],

    states: [
        {name: 'hop', value: 'cow.js'},
        {name: 'catfish', value: 'fluff.js'},
        {name: 'puppy', value: 'frog.js'},
        {name: 'appTitle', value: 'KILL LIST'},
        {name: 'stuff', value: [1,2,3,4]}
    ]

});
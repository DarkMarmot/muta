
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
        {url: 'header.js', root: 'COMPONENTS', el: 'app', config: {p: 'cow.js'}},
        {url: 'header.js', root: 'COMPONENTS', el: 'app', config: {p: 'frog.js'}},
        {url: 'puppy', type: 'gear'}
    ],

    states: [
        {name: 'puppy', value: 'frog.js'},
        {name: 'appTitle', value: 'KILL LIST'}
    ]

});
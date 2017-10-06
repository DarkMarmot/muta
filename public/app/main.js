
Muta.cog({


    prep: function(){
        console.log('i am prepping!');
    },


    display: '<div name="app" class="main"></div>',


    aliases: {
        BUTTON: 'COMPONENTS button.js',
        APP_ROOT: './',
        COMPONENTS: '../components'

    },

    cogs: [

        {url: 'header.js', root: 'COMPONENTS', el: 'app', config: {target: '$hop', p: 'pike.js'}},
        {url: 'bunny.js', type: 'chain', el: 'app', source: 'stuff'},
        {url: 'header.js', root: 'COMPONENTS', el: 'app', config: {target: '$hop', p: 'gar.js'}},
        {url: 'puppy', type: 'gear'},
        {url: 'greeny', type: 'gear'}

    ],


    states: {

        greeny  : 'turtle.js',
        catfish : 'fluff.js',
        puppy   : 'frog.js',
        appTitle: 'KILL LIST',

    },

    wires: {
        hop: 'cow.js',
        stuff: {value: [1,2,3,4]},
        guppy: 'fluff.js'
    },


    stuffLog: function(m){
        console.log('stu', m);
    }

});
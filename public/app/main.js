
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

        {url: 'header.js', root: 'COMPONENTS', el: 'app', config: {target: '$hop', p: 'pike.js'}},
        {url: 'bunny.js', type: 'chain', el: 'app', source: 'stuff'},
        {url: 'header.js', root: 'COMPONENTS', el: 'app', config: {target: '$hop', p: 'gar.js'}},
        {url: 'puppy', type: 'gear'}

    ],


    // states: [
    //     {name: '$hop'},
    //     {name: 'hop', value: 'cow.js'},
    //     {name: 'catfish', value: 'fluff.js'},
    //     {name: 'puppy', value: 'frog.js'},
    //     {name: 'appTitle', value: 'KILL LIST'},
    //     {name: '$stuff'},
    //     {name: 'stuff', value: [1,2,3,4]}
    // ],

    states: {

        catfish: 'fluff.js',
        puppy: 'frog.js',
        appTitle: 'KILL LIST',
        hop: 'cow.js',
        stuff: {value: [1,2,3,4]}
    },

    belts: { // todo create both state and $action
        hop: 'cow.js',
        stuff: {value: [1,2,3,4]}
    }

    // actions: {
    //     $hop: {},
    //     $stuff: {}
    // },

    // buses: [
    //     '$stuff | =stuff',
    //     '$hop | =hop'
    // ]

    // actions: {
    //     catfish: 'fluff.js',
    //     addPatient: '*verifyPatient | patientList',
    // }
    ,

    stuffLog: function(m){
        console.log('stu', m);
    }

});

Muta.cog({

    display: '<div style="background: green" name="cow"> cow appears! </div>',

    events: {
        cow: '@click | dog, bunny | *woof | meow_cmd'
    },

    methods: {
        woof: function(e){
            e.stopPropagation();
            console.log('woof');
            return 'woof';
        }
    }
});
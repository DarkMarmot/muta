
Muta.cog({

    display: '<div name="fluff" style="background: mediumvioletred" name="gar"> fluff appears! </div>',

    events: {
        fluff: '@click | stuff | *push | =stuff'
    },

    methods: {
        push: function(msg){
            var i = Math.floor(Math.random() * 10);
            var result = [];
            for(let k = 0; k < i; ++k){
                result.push(k);
            }
            console.log('show', result);
            return result;
        }
    }
});
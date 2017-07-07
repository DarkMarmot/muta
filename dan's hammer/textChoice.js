Muta.cog({

    Display: {
        html: ` <div id="menu" class="ephex_absolute_center"> </div>`
    },

    Blueprint: {
        Net: {},
        Alias: {},
        Prop: {},
        Data: {
            reportAction: “”,
        },

        Command: {
            reportAction_cmd: `gather="itemData" pipe="selReportAction_cmd”`,
            cmd_ChooseAction: ``
        },

        Cog: {
            menu: `NODE url="REIV_BUTTON_MENU" source="prop menuConfig”`
        },

        Sensor: {
            itemData: `WATCH need="adjStatusHash" transform="toNewReportingAction" pipe="reportAction”`
        },

        Script: {

            toNewReportingAction: function(msg) { 
                var key = msg.itemData.record.textResult + '|' + msg.itemData.record.performingOrgName 
                return msg.adjStatusHash[key] 
            },  

            menuConfig: { 
                classes: { 
                    menu: 'ephex_toggle_menu_big', 
                    button: 'ephex_toggle_button' 
                },  
                renderer: 'REIV_TEXT_BUTTON_RENDERER', 
                tell: 'reportAction_cmd', 
                show: 'reportAction', 	 
                items: [ 
                    { title: 'Send', value: 'send' }, 
                    { title: 'Ignore', value: 'ignore' } 
                    ]
            }
        }
    }

})
/* jshint node: true, asi: true, laxcomma: true, esversion: 6 */
'use strict'

// just for the linter
const Cognition = {}
const Catbus = {}
const RegistryThing = {}


const App = new Cognition({
    constants: {

    },
    bus: new Catbus(),
    registry: new RegistryThing(),
})

import { Cog, registry, bus } from 'App'

// service/module registry
registry.register('net', {
    _request (method, url, query, body) {

    },

    get (url, query) {
        return this._request('GET', url, query)
    },

    post (url, query, body) {
        return this._request('POST', url, query, body)
    }

})

// Global Catbus instance for all data crap
bus.data('user').create() // explicity init method for a data loc

registry.get('net').get('/api/auth/user', { userId: 'mqi7918' })
    .then(response => {
        let user = response.data.user

        bus.data('user').write(user)
    })

/* Actual component starts here
 *****************************************/
export default new Cog({
    manifest: [ // data locations, third party modules, etc that will be injected
        'net',
        'aModuleOrSomething',
        'user',
        'patients'
    ],

    children: { // cogs that will be held as children locally in this component
        'flash': {
            el: "#flash-element",

            exports: [ // not sure if this has value
                'message',
                'hide'
            ],

            events: {
                'hide': 'hideFlash'
            },

            timeout: 1000,
        }
    },

    el: "#mount-target-in-managed-portion-of-ui",

    created () {

    },

    render () {

    },

    mounted () {

    },

    unmounted () {},

    destroyed () {},

    methods: {
        doFlash (msg, opts) {
            let type = opts.error || 'info'

            this.flash.message(msg, { type: type })
        },

        hideFlash (ev) {
            this.flash.hide()
        },

        addPatientToUnit (templateRefs) {
            let unit = bus.data('unit').read()

            let patient = {
                name: templateRefs.patientName,
                id: templateRefs.patientId
            }

            patient.unitId = unit.id

            this.net.post('/api/units/patients', null, patient)
                .then(response => {
                    this.doFlash('Patient successfully added to room')
                })
                .catch(err => {
                    this.doFlash("Hey that didn't work. Sorry about that. Try again in a second.", { error: true })
                })
        },

        validateSomeThing () {},

        makeANetworkRequest () {}
    }
})

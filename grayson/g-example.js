let cog = Muta.cog({
	name: 'myCog',				// A cog name that other cogs can use to reference
	app: '.someDomElement',		// The DOM element to bind to
	import: {					// Import state data from other cogs
		global, // The global state
		'someOtherCog' // a state with the name 'someOtherCog'
	},
	state: {					// This cog's state data
		patient: {},
		user: {}
	},
	export: {					// Data to make available to other cogs
		user,  // Make user from this state available to other cogs
			  // Usage: import{ 'myCog' }    then user is available
		state  // Make entire state available to other cogs
	},
	actions: {					// Actions that can be taken on state data
		updateUser(opts) {
			if (someValidationFunc(opts)) {
				user.opts = opts;  // Or something
			}
		},
		changePatient(patientID) {
			let newPatient = getSomePatientWith({id: patientID});
			if (newPatient) {
				patient = newPatient;
			}
		}
	},
	data: {						// Any random non-state specific data we want
		isUserSelected: false
	},
	methods: {					// Any random non-state action methods
		calculateUserColor() {
			return isUserSelected ? 'green' : 'red';  // Or whatever
		},
		calculateUserBorderWidth() {
			return isUserSelected ? '2px' : 'thick';
		},
		someValidationFunc(opts) {
			// Validate opts
			// ...
			return isValid;
		}
	},
	calc: {						// Calculated or 'computed' properties
		userSelectionBorder: {
			let color = calculateUserColor();
			let width = calculateUserBorderWidth();
			let style = isUserSelected ? 'solid' : 'dashed'; // calculated properties don't have to use methods
			return `${color} ${width} ${style}`;
		}
	},
	listen: {					// Does actions when data is changed/updated
		isUserSelected: {
			// This will change some DOM element's border when isUserSelected is changed
			someDomElement.style.border = userSelectionBorder;
		}
	},	
	layout: {					// Defines the layout/template of the html
		// hyperscript or html or whatever
		// Would be cool if the user could choose what they write the layout in.
		// Some could use html, some pug, and some hyperscript
	}
});

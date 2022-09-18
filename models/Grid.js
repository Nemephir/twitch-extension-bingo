const mongoose = require( 'mongoose' )

const schema = new mongoose.Schema( {
	channel  : {
		type    : String,
		required: true
	},
	name     : {
		type   : String,
		default: 'Default'
	},
	size     : {
		type   : Number,
		default: 3
	},
	moderator: {
		type   : Boolean,
		default: false
	},
	cells    : {
		type   : [ { content: String, checked: Boolean } ],
		default: [
			{ content: '', checked: false },
			{ content: '', checked: false },
			{ content: '', checked: false },
			{ content: '', checked: false },
			{ content: '', checked: false },
			{ content: '', checked: false },
			{ content: '', checked: false },
			{ content: '', checked: false },
			{ content: '', checked: false }
		]
	}
} )

module.exports = mongoose.model( 'Grid', schema )
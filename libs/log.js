var moment = require('moment');

module.exports = {
	logDebug: false,

	debug: function(msg) {
		if (this.logDebug) {
			this.log(msg);
		}
	},

	log: function(msg) {
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ': ' + msg);
	}
};

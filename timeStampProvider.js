var moment = require('moment');

module.exports = {
	now: function() {
		return new Date();
	},

	nowToTimestamp: function() {
		return moment().toJSON();
	},

	logTimestamp: function() {
		return moment().format('YYYY-MM-DD HH:mm:ss');
	}
};

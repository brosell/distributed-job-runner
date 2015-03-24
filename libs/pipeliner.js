var log = require("./log.js");

function Pipeline() {
	this.fns = [];
	this.callback = null;
}

Pipeline.prototype = {
	go: function(callback) {
		this.callback = callback;
		this.next();
	},

	next: function(err) {
		var me = this;
		var fns = me.fns;

		if (err) {
			log.debug('err: ' + err);
			this.clear();
			this.doCallback(err);
			return;
		}

		var fn = fns.shift();
		if (fn) {
			setImmediate(function() {
				fn(me);
			}.bind(me));
		} else {
			this.doCallback();
		}
	},

	doCallback: function(err) {
		var me = this;
		setTimeout(function() {
			me.callback(err, me);
		}.bind(me), 1);
	},

	clear: function() {
		this.fns = [];
	},

	enqueue: function(fn) {
		var me = this;

		me.fns.push(function(me) {
			var answer = fn(me);
			if (answer !== false)
				me.next();
		});
	}
};

module.exports = Pipeline;

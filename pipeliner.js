

function Pipeline() {
	this.fns = [];
	this.callback = null;
	this.errorOccured = false;
	this.errorMsg = "";
}

Pipeline.prototype.go = function(callback) {
	this.callback = callback;
	this.next();
};

Pipeline.prototype.error = function(msg) {
	this.errorOccured = true;
	this.errorMsg = msg;
	this.callback(true, this);
};

Pipeline.prototype.next = function() {
	var me = this;
	var fns = me.fns;

	if (me.errorOccured) {
		return;
	}

	var fn = fns.shift();
	if (fn) {
		setImmediate(function() {
			fn(me);
		}.bind(me));
	} else {
		setImmediate(function() {
			me.callback(false, me);
		}.bind(me));
	}
};

Pipeline.prototype.clear = function() {
	this.fns = [];
};

Pipeline.prototype.enqueue = function(fn) {
	var me = this;

	me.fns.push(function(me) {
		var answer = fn(me);
		if (answer !== false)
			me.next(me);
	});
};

module.exports = Pipeline;

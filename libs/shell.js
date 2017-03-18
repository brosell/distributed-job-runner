var log = require("./log.js");
var spawn = require('child_process').spawn;

module.exports = {
	run: function(cmd, args, callbacks ) {
		
		var child = spawn(cmd, args);
		var resp = "";
		var errResp = "";

		child.stdout.on('data', function (buffer) {
			resp += buffer.toString();
			if (callbacks.data) {
				callbacks.data(buffer.toString());
			}
		});
		child.stdout.on('end', function() {
			if (callbacks.end) {
				callbacks.end ();
			}
			if (callbacks.done) {
				callbacks.done(resp);
			}
		});

		child.on('close', function(code){
			if (callbacks.close) {
				callbacks.close(code);
			}
		});
	}


};
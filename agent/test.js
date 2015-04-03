var shell = require('../libs/shell.js');

shell.run('cmd', ['/c', 'testRunner.bat'], {
			done: function(stdout) {
				console.log(stdout);
			}
		});
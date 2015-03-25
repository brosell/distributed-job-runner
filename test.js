var shell = require('./libs/shell.js');

shell.run('nodeunit.cmd', ['functional-tests', '--reporter', 'eclipse'],
	{
		data: function(stdout){
			console.log(stdout);
		}
	}
);
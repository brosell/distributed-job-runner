var shell = require('./libs/shell.js');
 // require('./index.js');
//cmd /c del /q data\*

shell.run('cmd', ['/c', 'del', '/q', 'data\\*'], {
	done: function(stdout){
		console.log('deleted');
	}
});
 
// shell.run('node', ['index.js'], {
// 	done: function(stdout) {

// 	}
// });


shell.run('nodeunit.cmd', ['functional-tests', '--reporter', 'eclipse'],
	{
		data: function(stdout){
			console.log(stdout);
		},

		done: function(stdout) {
			console.log('exiting...');
			setTimeout(function() {
				console.log('---------------');
				var lines = stdout.split('\n');
				for(var i in lines) {
					var line = lines[i];
					if (line.lastIndexOf('2015', 0) === -1) {
						console.log(line);
					}
				}
				// console.log(stdout);
				setTimeout(function() { process.exit(); }, 1000);
			}, 4000);
		}

	}
);
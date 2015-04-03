/*
one job: provide a list of tests from the test assemblies
*/

var shell = require('./libs/shell.js');

function TestProvider() {

}

TestProvider.prototype = {
	provide: function(pipeline) {
		shell.run('getTests.bat', null, {
			done: function(stdout) {
				pipeline.data.tests = stdout.split('\n')
										.map(function(s) { return s.trim(); })
										.filter(function(s) { return s; }); // not blank
				pipeline.next();
			}
		});

		return false;
	}
};


module.exports = TestProvider;

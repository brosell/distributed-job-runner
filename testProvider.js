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
				console.log(stdout);
				var tests = JSON.parse(stdout);
				pipeline.data.tests = tests
										.map(function(test) { return test.suite; });
				pipeline.next();
			}
		});

		return false;
	}
};


module.exports = TestProvider;

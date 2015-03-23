/*
one job: provide a list of tests from the test assemblies
*/

function TestProvider() {

}

TestProvider.prototype = {
	provide: function(pipeline) {
		setTimeout(
			function() {
				pipeline.data.tests = [
				"first",
				"second",
				"third",
				"forth",
				"fifth"
			];
			pipeline.next();
		}, 1000);

		return false;
	}
};


module.exports = TestProvider;

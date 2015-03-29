/*
One Job: create the jobs to be associated with the session
- get list of tests
- create a job for each
*/
var async = require("async");
var models = require("./models.js");
var log = require('./libs/log.js');

function JobAccumulator() {

}

JobAccumulator.prototype = {
	accumulate: function(pipeline) {
		var tests = pipeline.data.tests;
		var sessionId = pipeline.data.session.id;
		var me = this;

		async.each(tests,
			function(test, callback) {
				log.debug('adding job: ' + test);

				var job = {
					sessionId: sessionId,
					who: 'Bert',
					what: test,
					status: 'waiting',
					result: 'pending'
				};

				models.jobs.create(job);
				callback();
			},
			function(err) {
				log.debug('added jobs');
				pipeline.next();
			}
		);

		return false;
	},

	createJob: function(test, sessionId) {
		log.debug('adding job: ' + test);

		var job = {
			sessionId: sessionId,
			who: 'Bert',
			what: test,
			status: 'waiting'
		};

		models.jobs.create(job);
	}
};

module.exports = JobAccumulator;

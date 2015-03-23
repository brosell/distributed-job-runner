/*
One job: make the session ready for use.
- pipeline:
	- get list of test
	- kickoff the jobAccumulator
	- set the session to ready
	- errors
		- timeouts
		- exceptions
*/

var Pipeline = require('./libs/pipeliner.js');
var log = require("./libs/log.js");

var TestProvider = require('./testProvider.js');
var JobAccumulator = require('./jobAccumulator.js');

var models = require('./models.js');

function SessionConfigurator(session) {
	this.pipeline = new Pipeline();

	this.pipeline.data = {
		session: session
	};
}

SessionConfigurator.prototype = {
	configure: function() {
		var testProvider = new TestProvider();
		var jobAccumulator = new JobAccumulator();

		this.pipeline.enqueue(testProvider.provide);
		this.pipeline.enqueue(jobAccumulator.accumulate);
		this.pipeline.enqueue(this.finalizeConfiguration);

		this.pipeline.go(function(err, pipeline) {
			log.debug('configured session');
		});
	},

	finalizeConfiguration: function(pipeline) {
		// set the status to ready?
		models.sessions.update(pipeline.data.session.id, { status: 'ready', result: 'pending' });
	}
};

module.exports = SessionConfigurator;

var log = require("./libs/log.js");
var Model = require("./libs/Model.js");

module.exports = {
	sessions: new Model({
		name: 'sessions',
		fields: [
			'startTimestamp',
			'endTimestamp',
			'status', // status: initializing, ready (for applicants), complete
			'result', // pending, pass, fail      overall result of the session [pending|pass|fail]
		],
		validators: {
			'result': function(value) {
				return ['', 'pending', 'pass', 'fail'].indexOf(value) != -1;
			}
		}
	}),

	jobs: new Model({
		name: 'jobs',
		fields: [
			'sessionId',
			'who',
			'what',
			'startTimestamp',
			'endTimestamp',
			'status', // waiting, started, complete
			'result' // pending, pass, fail
		]
	}),

	jobArtifacts: new Model({
		name: 'job-artifacts',
		fields: [
			'jobId',
			'artifact-type',
			'artifact'
		]
	})
};



var log = require("./libs/log.js");
var Model = require("./libs/Model.js");

module.exports = {
	sessions: new Model({
		name: 'sessions',
		fields: [
			'startTimestamp',
			'endTimestamp',
			'status', // status: initializing, generating list, bootstrapping, ready for applicants
			'result', // overall result of the session [pending|pass|fail]
		],
	}),

	jobs: new Model({
		name: 'jobs',
		fields: [
			'sessionId',
			'who',
			'what',
			'startTimestamp',
			'endTimestamp',
			'status', // [waiting for applicant|running|pass|fail|timed out]
			'result'
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



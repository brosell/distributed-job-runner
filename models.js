var Model = require("./libs/Model.js");

module.exports = {
	sessions: new Model({
		name: 'sessions',
		fields: ['startTimestamp', 'endTimestamp', 'result'],
	}),

	jobs: new Model({
		name: 'jobs',
		fields: ['who', 'what', 'startTimestamp', 'endTimestamp', 'result']
	})

	
};

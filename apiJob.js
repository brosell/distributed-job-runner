var log = require("./libs/log.js");

module.exports = {
	jobsApi: {
		name: 'job',
		url: 'jobs',

		parent: 'sessions',

		onList: function(request) {
			if (request.parentId) {
				log.debug('job parent');
				return this.model.queryItems(function(item) {
					return item.sessionId == request.parentId;
				});
			}

			return this.model.list();
		}

	},

	init: function(api, models) {
		this.jobsApi.model = models.jobs;

		api.addResource(this.jobsApi, { applyBoilerPlate: true });
	}
};
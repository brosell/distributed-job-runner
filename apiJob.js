var log = require("./libs/log.js");

module.exports = {
	jobsApi: {
		name: 'job',
		url: 'jobs',

		parent: 'sessions',

		onList: function(request) {
			if (request.parentId) {
				log.debug('list jobs of parent');
				return this.model.queryItems(function(item) {
					return item.sessionId == request.parentId;
				});
			}

			return this.model.list();
		},

		onGet: function(id, request) {
			if (request.parentId) {
				log.debug('get job via parent');
			}
			return this.model.queryItem(function(item) {
				return item.sessionId == request.parentId && item.id == id;
			});
		}

	},

	init: function(api, models) {
		this.jobsApi.model = models.jobs;

		api.addResource(this.jobsApi, { applyBoilerPlate: true });
	}
};
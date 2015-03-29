var log = require("./libs/log.js");
var LINQ = require('node-linq').LINQ;
var models = require('./models.js');

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
		},

		onPut: function(id, data, request) {
			if (request.queryString['complete']) {
				data.status = 'complete';
				data.endTimestamp = new Date().toString();
			
				var job = this.model.update(id, data);
				log.debug('+1');
				var session = models.sessions.get(job.sessionId);
				log.debug('+2');
				var jobs = models.jobs.queryItems(function(j) { return j.sessionId == session.id; });
				log.debug('+3');
				var allComplete = new LINQ(jobs).All(function(j) { return j.status == 'complete'; });
				log.debug('+4');
				log.log('allcomplete: ' + allComplete);
				if (allComplete) {
					session.status = 'complete';
					models.sessions.update(session.id, session);
				}
			}
		}
	},

	init: function(api, models) {
		this.jobsApi.model = models.jobs;

		api.addResource(this.jobsApi, { applyBoilerPlate: true });
	}
};
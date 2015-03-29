var log = require("./libs/log.js");
var SessionConfigurator = require("./sessionConfigurator.js");
var models = require('./models.js');
log.logDebug = true;

// CI agent -> mediator
module.exports = {
	sessions: {
		name: 'session',
		url: 'sessions',

		// list current and past sessions
		onList: function() {
			return this.model.list();
		},

		// data on a specific session (current or past)
		onGet: function(id) {
			return this.model.get(id);
		},
	},

	currentSession: {
		name: 'current-session',
		url: 'current-session',

		allocateJob: function(currentSession) {
			var nextJob = models.jobs.queryItem(function(job) {
				return job.sessionId == currentSession.id &&
					job.status == 'waiting';
			});
			
			if (nextJob) {
				nextJob.status = 'started';
				nextJob.startTimestamp = new Date().toString();
				models.jobs.update(nextJob.id, nextJob);
			}

			return nextJob;
		},

		// view the one and only current session
		onList: function(request) {
			var currentSession = this.model.queryItem(function(item) {
				return !item.endTimestamp;
			});

			if (currentSession && request.queryString['allocateJob']) {
				return this.allocateJob(currentSession);
			}

			if (currentSession && request.queryString['deep']) {
				currentSession.jobs = models.jobs.queryItems(function(job) {
					return job.sessionId == currentSession.id;
				});
			}

			return currentSession;
		},

		// create a session - fails if session is already active
		onPost: function(data, request, result) {
			var currentSession = this.model.queryItem(function(item) {
				return !item.endTimestamp;
			});

			if (currentSession && !request.queryString['force']){
				result.status = 422;
				result.response = { error: 'session already running', currentSession: currentSession };
				return;
			}

			result.status = 201;
			currentSession = this.model.create({startTimestamp: new Date().toString()}, true);

			var sessionConfigurator = new SessionConfigurator(currentSession);
			sessionConfigurator.configure();

			return currentSession;
		},

		// cancel a session. Only current session can be canceled
		onDelete: function(id, request, result) {
			// TODO: if open or unassigned jobs then require confirmation
			if(!request.queryString['confirm']){
				result.status = 422;
				result.response = "confirmation required";
				return;
			}

			var currentSession = this.model.queryItem(function(item) {
				return !item.endTimestamp;
			});
			if (currentSession) {
				currentSession.endTimestamp = new Date().toString();
				return this.model.update(currentSession.id, currentSession);
			}
		},

		autoEndSession: function() {
			log.debug('autoend');
			this.onDelete();
		}
	},

	init: function(api, models) {
		this.sessions.model = models.sessions;
		this.currentSession.model = models.sessions;

		api.addResource(this.sessions);
		api.addResource(this.currentSession);

		return {
			sessions: this.sessions,
			current: this.currentSession
		};
	}


};

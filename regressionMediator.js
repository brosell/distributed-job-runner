var Api = require("./RestApiScaffold.js");
var Model = require("./Model.js");

var api = new Api();

var sessionModel = new Model({
	name: 'sessions',
	fields: ['startTimestamp', 'endTimestamp', 'result'],
});

var jobModel = new Model({
	name: 'jobs',
	fields: ['who', 'what', 'startTimestamp', 'endTimestamp', 'result']
});

// result { status: 200, response="?" }

// CI -> Mediator
api.addResource( {	name: 'regression-session',
	url: 'regression-sessions',

	// list current and past sessions
	onList: function() {
		return sessionModel.list();
	},

	// data on a specific session (current or past)
	onGet: function(id) {
		return sessionModel.getItem(id);
	},
});

api.addResource( {	name: 'current-regression-session',
	url: 'current-regression-session',

	// view the one and only current session
	onList: function() {
		var currentSession = sessionModel.queryItem(function(item) {
			return !item.endTimestamp;
		});

		return currentSession;
	},

	// create a session - fails if session is already active
	onPost: function(data, request, result) {
		var currentSession = sessionModel.queryItem(function(item) {
			return !item.endTimestamp;
		});

		if (currentSession){
			result.status = 422;
			result.response = { error: 'session already running', currentSession: currentSession };
			return;
		}

		result.status = 201;
		return sessionModel.create({startTimestamp: new Date().toString()}, true);
	},

	// cancel a session. Only current session can be canceled
	onDelete: function(id) {
		var currentSession = sessionModel.queryItem(function(item) {
			return !item.endTimestamp;
		});
		if (currentSession) {
			currentSession.endTimestamp = new Date().toString();
			return sessionModel.update(currentSession.id, currentSession);
		}
	}
});

// workAgent -> Mediator
api.addResource( {	name: 'job',
	url: 'jobs',
	
	// list jobs statuses for current session or specific session (parentresourse? queryparameter?)
	onList: function() {
		console.log('onList');
		return { list: 'yep' };
	},

	// data on a specific job (current or past)
	onGet: function(id) {
		console.log('onGet');
	},

	// create a job - only applicable to current session, reject other session ids
	onPost: function(data) {
		console.log('onPost');
		return data;
	},

	// modify a job (set results, complete, etc)
	onPut: function(id, data) {
		console.log('onPut');
		return { id: id, data: data };
	},

	// cancel a job. Only jobs in current session can be canceled. maybe some other exception?
	onDelete: function(id) {
		console.log('onDelete');
		return { id: id };
	}
});

api.addResource( {	name: 'test',
	url: 'test',

	onBeforeRoute: function(data) {
		console.log('onBeforeRoute: ' + data.resource);
		// data.request.method='POST';
	},

	onList: function(request) {
		var attrs = [];
		for (var attr in request) {
			attrs[attrs.length] = attr;
		}
		return attrs;
	},
	onGet: function(id, request) {
		return request[id];
	},
	onPost: function(data, request) {
		return {method: 'post', data: data};
	},
	onPut: function(id, data, request) {
		return {method: 'put', id: id, data: data};
	},
	onDelete: function(id, request) {
		return {method: 'delete', id: id };
	}
});

api.addResource( {	name: 'meta',
	url: 'meta',

	onBeforeRoute: function(data) {
		console.log('onBeforeRoute: ' + data.resource);
		// data.request.method='POST';
	},

	functions: {
		reloadModels: function(){
			sessionModel.load();
			jobModel.load();
			return { 'result': 'reloaded' };
		},
		clearSessions: function(request) {
			sessionModel.clear();
			return "cleared";
		},
		resources: function(request) {
			return api.resourceNames;
		}
	},

	onList: function(request) {
		var result = [];
		for(var a in this.functions) {
			result[result.length] = a;
		}

		return result;
	},
	onGet: function(id, request) {
		return this.functions[id](request);
	}
});


api.start(8888);

console.log('started.');
var Api = require("./RestApiScaffold.js");
var Model = require("./Model.js");

var api = new Api();

appleModel = new Model({
	name: 'apple',
	fields: ["name", "description"]
}),

api.addResource( {	name: 'apple',
	url: 'apples',

	onBeforeRoute: function(data) {
		console.log('onBeforeRoute: ' + data.resource);
		// data.request.method='POST';
	},

	onList: function() {
		console.log('onList');
		return appleModel.list();
	},
	onGet: function(id) {
		console.log('onGet');
		return appleModel.get(id);
	},
	onPost: function(data) {
		console.log('onPost');
		return appleModel.create(data);
	},
	onPut: function(id, data) {
		console.log('onPut');
		return appleModel.update(id, data);
	}
});

// CI -> Mediator
api.addResource( {	name: 'regression-session',
	url: 'regression-sessions',

	onBeforeRoute: function(data) {
		console.log('onBeforeRoute: ' + data.resource);
		// data.request.method='POST';
	},

	// list current and past sessions
	onList: function() {
		console.log('onList');
		return { list: 'yep' };
	},

	// data on a specific session (current or past)
	onGet: function(id) {
		console.log('onGet');
	},

	// create a session - fails if session is already active
	onPost: function(data) {
		console.log('onPost');
		return data;
	},

	// modify a session
	onPut: function(id, data) {
		console.log('onPut');
		return { id: id, data: data };
	},

	// cancel a session. Only current session can be canceled
	onDelete: function(id) {
		console.log('onDelete');
		return { id: id };
	}
});

api.addResource( {	name: 'current-regression-session',
	url: 'current-regression-session',

	onBeforeRoute: function(data) {
		console.log('onBeforeRoute: ' + data.resource);
		// data.request.method='POST';
	},

	// view the one and only current session
	onList: function() {
		console.log('onList');
		return { list: 'yep' };
	},

	// cancel a session. Only current session can be canceled
	onDelete: function(id) {
		console.log('onDelete');
		return false;
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


api.start(8888);

console.log('started.');
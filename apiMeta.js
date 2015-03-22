var log = require("./libs/log.js");

module.exports = {
	metaApi: {
		name: 'meta',
		url: 'meta',

		onBeforeRoute: function(data) {
			log.debug('onBeforeRoute: ' + data.resource);
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
				return request._api.resourceNames;
			},
			quit: function(request) {
				setTimeout(function() {process.exit();}, 1000);
				return "quiting in a sec";
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
			if (this.functions[id]) {
				return this.functions[id](request);
			}
		}
	},

	testApi: {
		name: 'test',
		url: 'test',

		onBeforeRoute: function(data) {
			log.debug('onBeforeRoute: ' + data.resource);
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
	},

	init: function(api, models) {
		api.addResource(this.metaApi);
		api.addResource(this.testApi);

		return { metaApi: this.metaApi, testApi: this.testApi };
	}
};

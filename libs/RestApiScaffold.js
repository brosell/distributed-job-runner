var Pipeline = require('./pipeliner.js');
var http = require("http");

/*
	request = { method, queryString, url, statusCode, headers}
*/

function Api() {
	this.resources = {};
	this.resourceNames = [];
}

Api.prototype = {

	filter: function(pipeline) {
		// filter out unwanted request
		console.log('filter');
		if (pipeline.data.request.url == '/favicon.ico') {
			// 404;
			pipeline.result.status = 404;
			pipeline.result.response = "Not Fuund";
			pipeline.clear();
		}
	},

	processRequestBody: function(pipeline) {
		// for POST and PUT read the body stream
		console.log('processRequestBody');

		var request = pipeline.data.request;
		var response = pipeline.data.response;

		if (request.method != 'POST' && request.method != 'PUT') {
			console.log('no body expected... skipping.');
			return;
		}

		var body = '';
		request.on('data', function(data) {
			body += data;

			// Too much POST data, kill the connection!
			if (body.length > 1e6)
				req.connection.destroy();
		});
		request.on('end', function() {
			try {
				if (body != ''){
					pipeline.data.postData = JSON.parse(body);
				}
				pipeline.next();
			} catch (ex) {
				response.writeHead(500);
				response.write("bad data");
				response.end();
			}
		});

		return false;
	},

	writeResponse: function(pipeline) {
		// json response, status, response.end, etc
		console.log('writeResponse');
		pipeline.data.response.writeHead(pipeline.result.status);
		pipeline.data.response.write(JSON.stringify(pipeline.result.response, null, 2));
		pipeline.data.response.end();
	},

	error: function(pipeline) {

	},

	processUrl: function(pipeline) {
		var request = pipeline.data.request;
		var url = request.url;

		console.log('url: ' + url);
		
		var urlParts = url.split('?');

		request.queryString = {};
		if (urlParts.length == 2) {
			var queries = urlParts[1].split('&');
			for(var i=0; i<queries.length; i++) {
				var queryParts = queries[i].split('=');
				var key = queryParts[0];
				var value = queryParts[1]?decodeURI(queryParts[1]):"true";

				if (!request.queryString[key]) {
					request.queryString[key] = value;
				} else if (!Array.isArray(request.queryString[key])) {
					var existing = request.queryString[key];
					request.queryString[key] = [];
					request.queryString[key][0] = existing;
					request.queryString[key][1] = value;
				} else {
					request.queryString[key][request.queryString[key].length] = value;
				}
			}
		}

		var pathSegments = urlParts[0].split('/');

		pipeline.data.resource = pathSegments[1];
		pipeline.data.id = pathSegments[2];
	},

	routeRequest: function(pipeline) {

		var request = pipeline.data.request;
		var result = pipeline.result;

		var modelResource = this.resources[pipeline.data.resource];
		if (!modelResource) {
			pipeline.result.status = 404;
			pipeline.result.response = "Resource Type Not Found";
			pipeline.clear();
			return;
		}

		if (modelResource.onBeforeRoute) {
			modelResource.onBeforeRoute(pipeline.data);
		}

		var method = request.method;

		var restResult;

		pipeline.result.status = 404;
		pipeline.result.response = "Not Found";
		

		if (method == 'GET' && !pipeline.data.id && modelResource.onList) {
			// list
			restResult = modelResource.onList(request, result);
			if (restResult) {
				pipeline.result.status = 200;
			}
		} else if (method == 'GET' && modelResource.onGet) {
			// get
			restResult = modelResource.onGet(pipeline.data.id, request, result);
			if (restResult) {
				pipeline.result.status = 200;
			}
		} else if (method == 'POST' && modelResource.onPost && !pipeline.data.id) {
			// create
			restResult = modelResource.onPost(pipeline.data.postData, request, result);
			if (restResult) {
				pipeline.result.status = 201;
			}
		} else if (method == 'PUT' && modelResource.onPut) {
			restResult = modelResource.onPut(pipeline.data.id, pipeline.data.postData, request, result);
			if (restResult) {
				pipeline.result.status = 200;
			}
		} else if (method == 'DELETE' && modelResource.onDelete) {
			restResult = modelResource.onDelete(pipeline.data.id, request, result);
			if (restResult) {
				pipeline.result.status = 200;
			}
		}

		if (restResult === false) {
			pipeline.clear();
			return;
		}

		if (typeof(restResult) != 'undefined'){
			pipeline.result.response = restResult;
		}
		
	},

	onRequest: function(request, response) {
		var me = this;
		var pipeline = new Pipeline();
		pipeline.data = {
			request: request,
			response: response,
		};
		pipeline.result = {
			status: 200
		};

		pipeline.data.request._api = this;

		pipeline.enqueue(this.filter.bind(this));
		pipeline.enqueue(this.processRequestBody.bind(this));
		pipeline.enqueue(this.processUrl.bind(this));
		pipeline.enqueue(this.routeRequest.bind(this));

		pipeline.go(function(err, pipeline) {
			// pipeline.enqueue(this.prepareResponsee.bind(this));
			pipeline.enqueue(me.writeResponse.bind(me));

			pipeline.go(function(err, pipeline) {
				console.log("finished ");
			});
		});
	},

	start: function(port) {
		console.log("listening on port " + port + "...");
		var me = this;
		var http = require("http");
		var server = http.createServer(me.onRequest.bind(me));
		server.listen(port);
	},

	addResource: function(resourceCfg) {
		this.resources[resourceCfg.url] = resourceCfg;
		this.resourceNames[this.resourceNames.length] = resourceCfg.url;
	}
};

module.exports = Api;
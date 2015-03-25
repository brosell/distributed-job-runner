var Pipeline = require('../libs/pipeliner.js');
var Client = require('node-rest-client').Client;
var log = require('../libs/log.js');
log.logDebug = false;

client = new Client();

var urlBase = 'http://localhost:8888/';

client.registerMethod('getCurrentSession', urlBase + 'current-session', 'GET');
client.registerMethod('createCurrentSession', urlBase + 'current-session', 'POST');
client.registerMethod('closeCurrentSession', urlBase + 'current-session', 'DELETE');

var rest = client.methods;

module.exports = {
	'setUp': function(callback) {
		// 'delete' the potential current session
		rest.closeCurrentSession( {
				parameters: { confirm: true }
			},
			function(data) {
				callback();
			}
		);
	},
	
	'tearDown': function(callback) {
		callback();
	},
	
	'there is no current-session': function(test) {
		rest.getCurrentSession(function(data, response) {
			test.equal(response.statusCode, 404);
			test.done();
		});
	},

	'can create one': function(test) {
		rest.createCurrentSession(function(data) {
			test.equal('', data.status);
			test.equal('', data.result);
			test.equal('sessions', data.model);
			test.ok(data.id);
			test.equal('', data.endTimestamp);
			test.notEqual('', data.startTimestamp);
			test.done();
		});
	},

	'complete lifecycle': function(test) {
		var pipeline = new Pipeline();
		var id = '';
		// test.expect(8);

		pipeline.enqueue(function(pl) {
			log.debug('create the session');
			rest.createCurrentSession(function(data, resp) {
				if (resp.statusCode >= 300) {
					pl.next('failed to create');
				}
				id = data.id;
				setTimeout(function() { pl.next(); }, 1000 );
			});
			return false;
		});

		pipeline.enqueue(function(pl){
			log.debug('do and test a deep get');
			rest.getCurrentSession( { parameters: { deep: true } }, function(data, resp){
				if (resp.statusCode >= 300) {
					pl.next('failed to get');
				}

				test.equal(data.id, id);
				test.equal(data.result, 'pending');
				test.equal(data.status, 'ready');
				test.ok(data.jobs);
				test.equal(5, data.jobs.length);
				test.equal('jobs', data.jobs[0].model);
				pl.next();
			});
			return false;
		});

		pipeline.enqueue(function(pl){
			log.debug('do and test a shallow get');
			rest.getCurrentSession(function(data, resp){
				if (resp.statusCode >= 300) {
					pl.next('failed to get');
				}

				test.equal(data.id, id);
				test.equal(data.result, 'pending');
				test.equal(data.status, 'ready');
				test.ok(!data.jobs);

				pl.next();
			});
			return false;
		});

		pipeline.enqueue(function(pl) {
			rest.closeCurrentSession( {	parameters: { confirm: true } }, function(data) {
				pl.next();
			});
			return false;
		});

		pipeline.enqueue(function(pl) {
			log.debug('make sure deleted');
			rest.getCurrentSession(function(data, response) {
				test.equal(response.statusCode, 404);
				pl.next();
			});
			return false;
		});

		pipeline.go(function(err) {
			log.debug('done: ' + err || 'ok');
			test.done();
		});
	}
	
};
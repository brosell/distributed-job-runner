var LINQ = require('node-linq').LINQ;
var Client = require('node-rest-client').Client;
var log = require('../libs/log.js');
var Pipeline = require('../libs/pipeliner.js');

log.logDebug = true;


client = new Client();

var urlBase = 'http://localhost:8888/';

client.registerMethod('getCurrentSession', urlBase + 'current-session', 'GET');
client.registerMethod('getCurrentSessionDeep', urlBase + 'current-session?deep', 'GET');
client.registerMethod('createCurrentSession', urlBase + 'current-session', 'POST');
client.registerMethod('closeCurrentSession', urlBase + 'current-session', 'DELETE');

client.registerMethod('allocateJob', urlBase + 'current-session/?allocateJob', 'GET');
client.registerMethod('completeJob', urlBase + 'jobs/${id}?complete', 'PUT');

var rest = client.methods;

module.exports = {
	'setUp': function(callback) {
		rest.createCurrentSession({ parameters: {force: true} }, function(data, resp) {
			log.debug("create session: " + resp.statusCode);
				
			if (resp.statusCode >= 300) {
				log.debug("couldn't create session", resp.statusCode);
			}

			setTimeout(function() { callback(); }, 1000);
		});
	},
	
	'tearDown': function(callback) {
		rest.closeCurrentSession( {	parameters: { confirm: true } }, function(data) {
			callback();
		});
	},

	'happy path': function(test) {
		var pipeline = new Pipeline();

		function jobsCountQuery(filters, cb) {
			rest.getCurrentSessionDeep(function(data) {
				// log.debug(JSON.stringify(data, null, 2));
				if (typeof(filters) == 'function') {
					var count = new LINQ(data.jobs).Count(filters);
					cb(count);
				}
				else {
					answers = {};
					for(var name in filters){
						answers[name] = new LINQ(data.jobs).Count(filters[name]);
					}
					cb(answers);
				}
			});
		}

		function objectEquals(test, expected, actual, max) {
			var message = '';
			var name;
			for(name in expected) {
				if (expected[name] !== actual[name]) {
					message += name + '(' + expected[name] +' !== ' + actual[name] + '), ';
				}
			}

			if (max) {
				for(name in actual) {
					if (expected[name] !== actual[name]) {
						message += name + '(' + expected[name] +' !== ' + actual[name] + '), ';
					}
				}
			}
			test.ok(message === '', message);
		}

		// get the list of jobs, ensure that none are started or complete
		pipeline.enqueue(function(pl) {
			jobsCountQuery(
				function(job) { return job.status === 'waiting' && job.startTimestamp === "" && job.endTimestamp === ""; },
				function(count) {
					test.equals(5, count);
					pl.next();
				}
			);

			return false;
		});

		// allocate ourself some work
		// ensure that only one job is started, non-complete
		pipeline.enqueue(function(pl) {
			rest.allocateJob(function(data) {
				pl.data.job = data;
				jobsCountQuery(
					function(job) { return job.id == data.id &&
										job.status === 'started' &&
										job.startTimestamp !== "" &&
										job.endTimestamp === "";
					},
					function(count) {
						test.equals(1, count);
						pl.next();
					}
				);
			});
			return false;
		});
		
		// complete the job
		// ensure only one job has been started and completed
		pipeline.enqueue(function(pl) {
			job = pl.data.job;
			job.result = "fail";
			rest.completeJob({path: { "id": job.id }, data: job }, function(data) {
				jobsCountQuery(
					function(j) { return j.id == job.id	&&
						j.status === 'complete'&&
						j.startTimestamp !== ""	&&
						j.endTimestamp !== "" &&
						j.result == job.result;
					},
					function(count) {
						// log.debug('++++++++' + JSON.stringify(data, null, 2));
						test.equals(1, count);
						pl.next();
					}
				);
			});
			return false;
		});
		
		var job2, job3, job4, job5;

		// allocate two jobs
		// ensure that one is complete, two are pending
		pipeline.enqueue(function(pipeline) {
			var testPipeline = new Pipeline([
				function(pl) {
					rest.allocateJob(function(data) {
						job2 = data;
						pl.next();
					});
					return false;
				},
				function(pl) {
					rest.allocateJob(function(data) {
						job3 = data;
						pl.next();
					});
					return false;
				}
			]).go(function(err){
				jobsCountQuery(
					function(job) { return (job.id == job3.id || job.id == job2.id)	&&
											job.status === 'started' &&
											job.startTimestamp !== "" &&
											job.endTimestamp === "";
					},
					function(count) {
						test.equals(2, count);
						pipeline.next();
					}
				);
			});
			return false;
		});

		function getJobStatusCounts(cb) {
			jobsCountQuery({
					completed: function(j) {
						return j.status === 'complete' &&
							j.startTimestamp !== ""	&&
							j.endTimestamp !== "";
					},
					pending: function(j) {
						return j.status === 'started';
					},
					waiting: function(j) {
						return j.status === 'waiting';
					}
				},
				cb
			);
		}

		// complete one of the jobs
		// ensure that two are complete and one is pending
		pipeline.enqueue(function(pl) {
			var job = job2;
			job.result = "pass";
			rest.completeJob({path: { "id": job.id }, data: job }, function(data) {
				getJobStatusCounts(function(counts){
					var expected = {completed: 2, pending: 1, waiting: 2};
					objectEquals(test, expected, counts);
					pl.next();
				});
			});
			return false;
		});

		// allocate one job
		// ensure that two are complete and two are pending
		pipeline.enqueue(function(pl) {
			rest.allocateJob(function(data) {
				job4 = data;
				getJobStatusCounts(function(counts){
					var expected = {completed: 2, pending: 2, waiting: 1};
					objectEquals(test, expected, counts);
					pl.next();
				});
			});
			return false;
		});

		// allocate one job
		// ensure that two are complete and three are pending
		pipeline.enqueue(function(pl) {
			rest.allocateJob(function(data) {
				job5 = data;
				getJobStatusCounts(function(counts){
					var expected = {completed: 2, pending: 3, waiting: 0};
					objectEquals(test, expected, counts);
					pl.next();
				});
			});
			return false;
		});

		// attempt to allocate one job
		// ensure that 4nn error is returned
		pipeline.enqueue(function(pl) {
			rest.allocateJob(function(data, response) {
				test.equal(response.statusCode, 404);

				getJobStatusCounts(function(counts){
					var expected = {completed: 2, pending: 3, waiting: 0};
					objectEquals(test, expected, counts);
					pl.next();
				});
			});
			return false;
		});

		// complete each pending job
		// ensure that all jobs are completed
		pipeline.enqueue(function(pl) {
			var testPipeline = new Pipeline([
				function(p) {
					var job = job3;
					job.result = 'pass';
					rest.completeJob({path: { "id": job.id }, data: job }, function(data) {
						p.next();
					});
					return false;
				},
				function(p) {
					var job = job4;
					job.result = 'pass';
					rest.completeJob({path: { "id": job.id }, data: job }, function(data) {
						p.next();
					});
					return false;
				},
				function(p) {
					var job = job5;
					job.result = 'pass';
					rest.completeJob({path: { "id": job.id }, data: job }, function(data) {
						p.next();
					});
					return false;
				}
			]).go(function(err){
				getJobStatusCounts(function(counts){

					var expected = {completed: 5, pending: 0, waiting: 0};
					objectEquals(test, expected, counts);
					pl.next();
				});
			});
			return false;
		});
		
		// ensure that the session is completed
		pipeline.enqueue(function(pl){
			rest.getCurrentSession(function(session) {
				test.equals(session.status, 'complete');
				pl.next();
			});
			return false;
		});

		// wrap up
		test.expect(pipeline.fns.length + 1);
		pipeline.go(function(err){
			test.done();
		});
	},
	
	// 'if no current session then no jobs': function(test) {

	// },

};

 // module.exports.setUp(function(){});
 // module.exports['happy path']({ok: function(){}, equals:function(){}, done:function(){}, expect:function(){}});
 // module.exports.tearDown(function(){});

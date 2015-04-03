var config = require('./config.js');
var Client = require('node-rest-client').Client;
var log = require('../libs/log.js');
var Pipeline = require('../libs/pipeliner.js');
var shell = require('../libs/shell.js');

client = new Client();

var urlBase = config.jobMasterUrl;

client.registerMethod('allocateJob', urlBase + 'current-session/?allocateJob', 'GET');
client.registerMethod('completeJob', urlBase + 'jobs/${id}?complete', 'PUT');

var jobMaster = client.methods;

function makePipeline() {
	return new Pipeline([
		function(pl) {
			jobMaster.allocateJob(function(job, response) {
				if (response.statusCode != 200) {
					pl.next('no jobs');
					return;
				}
				pl.data.job = job;
				pl.next();
			});
			return false;
		},

		function(pl) {
			log.log('execute ' + pl.data.job.testSuite + ' as ' + pl.data.job.adminUser);
			//shell.run('cmd', ['/c', 'testRunner.bat', pl.data.job.testSuite, pl.data.job.adminUser], {
			shell.run('testRunner.bat', [pl.data.job.testSuite, pl.data.job.adminUser], {
				done: function(stdout) {
					log.log(stdout);
					pl.data.result = 'pass';
					pl.next();
				}
			});
			return false;
		},
		function(pl) {
			job = pl.data.job;
			job.result = pl.data.result;
			jobMaster.completeJob({path: { "id": job.id }, data: job }, function(data) {
				log.log('done, good job');
				pl.next();
			});
			return false;
		}
	]);
}

function runForever() {
	var pipeline = makePipeline();
	log.log(pipeline.fns.length);
	pipeline.go(function(err) {
		if (err) {
			log.log(err);
		}
		log.log('pausing before next job request.');
		setTimeout(runForever, 5000);
	});
}



runForever();
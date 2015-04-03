
/* 
	request job from master
	do work
	report results
*/

var config = require('./config.js');
var Client = require('node-rest-client').Client;
var log = require('../libs/log.js');
var Pipeline = require('../libs/pipeliner.js');

client = new Client();

var urlBase = config.jobMasterUrl;

client.registerMethod('allocateJob', urlBase + 'current-session/?allocateJob', 'GET');
client.registerMethod('completeJob', urlBase + 'jobs/${id}?complete', 'PUT');

var rest = client.methods;

var pipeline = new Pipeline([
	function(pl) {
		rest.allocateJob(function(job, response) {
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
		pl.data.result = 'pass';
		setTimeout(function() { pl.next(); }, 2000);
	},
	function(pl) {
		job = pl.data.job;
		job.result = pl.data.result;
		rest.completeJob({path: { "id": job.id }, data: job }, function(data) {
			log.log('done, good job');
		});
	}
]);

pipeline.go(function(err) {
	if (err) {
		log.log(err);
	}
	log.log('done');
});



module.exports = {
	jobsApi: {
		name: 'job',
		url: 'jobs'
	},

	init: function(api, models) {
		this.jobsApi.model = models.jobs;

		models.boilderPlate.mergeWith(this.jobsApi);

		api.addResource(this.jobsApi);
	}
};
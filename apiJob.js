
module.exports = {
	jobsApi: {
		name: 'job',
		url: 'jobs'
	},

	init: function(api, models) {
		this.jobsApi.model = models.jobs;

		api.addResource(this.jobsApi, { applyBoilerPlate: true });
	}
};
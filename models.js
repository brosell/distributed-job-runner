var Model = require("./Model.js");

module.exports = {
	sessions: new Model({
		name: 'sessions',
		fields: ['startTimestamp', 'endTimestamp', 'result'],
	}),

	jobs: new Model({
		name: 'jobs',
		fields: ['who', 'what', 'startTimestamp', 'endTimestamp', 'result']
	}),

	boilderPlate: {
		functions: {
			onList: function() {
				return this.model.list();
			},

			onGet: function(id) {
				return this.model.get(id);
			},

			onPost: function(data) {
				return this.model.create(data);
			},

			onPut: function(id, data) {
				return this.model.update(id, data);
			}
		},

		mergeWith: function(other) {
			for(var fn in this.functions) {
				if (!other[fn]) {
					other[fn] = this.functions[fn];
				}
			}
		}
	}
};

var fs = require('fs');
var log = require("./log.js");

function Model(cfg) {
	// name and fields
	this.resourceCfg = cfg;
	this.modelName = cfg.name;
	this.filename = "data_" + this.modelName + ".json";

	this.data = [];
	this.load();
}

Model.prototype = {
	list: function(filterExpression) {
		return this.clone(this.data);
	},

	count: function(filterExpression) {
		return this.data.length;
	},

	create: function(sourceObj, pushToFront) {
		var obj = {
			id: 'x'
		};
		for (var i in this.resourceCfg.fields) {
			var fieldName = this.resourceCfg.fields[i];
			obj[fieldName] = '';
		}

		obj = this.updateFrom(sourceObj, obj);

		if (obj.id == 'x') {
			obj.id = this.guid();
			obj.model = this.modelName;
		}

		if (pushToFront) {
			this.data.unshift(obj);
		}
		else {
			this.data.push(obj);
		}

		this.save();
		return this.clone(obj);
	},

	queryItems: function(filter) {
		var returnList = [];
		for (var i = 0; i < this.data.length; i++) {
			if (filter(this.data[i])) {
				returnList[returnList.length] = this.data[i];
			}
		}
		return returnList;
	},

    queryItem: function(filter) {
		var returnList = [];
		for (var i = 0; i < this.data.length; i++) {
			if (filter(this.data[i])) {
				return this.data[i];
			}
		}
	},

	getItem: function(id) {
		var r = this.queryItem(function(item){
			return item.id == id;
		});

		return r;
	},

	get: function(id) {
		log.debug('get: ' + id);

		var item = this.getItem(id);
		var ret;
		if (item) {
			ret = this.modelClone(item);
		}
		return ret;
	},

	update: function(id, data) {
		log.debug('update');
		var toUpdate = this.getItem(id);
		toUpdate = this.updateFrom(data, toUpdate);
		this.save();
		return this.clone(toUpdate);
	},

	load: function() {
		log.debug('loading: ' + this.filename);
		try {
			var dataContents = fs.readFileSync(this.filename, {
				encoding: 'UTF8'
			});

			if (dataContents) {
				this.data = JSON.parse(dataContents);
			}
		} catch(e) {

		}
	},

	save: function() {
		var json = JSON.stringify(this.data, null, 2);
		//log.debug('save: ' + json);
		fs.writeFileSync(this.filename, json);
	},

	guid: function() {
		var g = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
		return g;
	},

	clone: function(obj) {
		return JSON.parse(JSON.stringify(obj));
	},

	updateFrom: function(from, to) {
		var ret = to;
		for (var i in this.resourceCfg.fields) {
			var fieldName = this.resourceCfg.fields[i];
			if (from[fieldName]) {
				ret[fieldName] = from[fieldName] || "";
			}
		}
		return ret;
	},

	modelClone: function(from, to) {
		var ret = to ? to : {};
		for (var i in this.resourceCfg.fields) {
			var fieldName = this.resourceCfg.fields[i];
			if (from[fieldName] || !to) {
				ret[fieldName] = from[fieldName] || "";
			}
		}

		ret.id = from.id;
		ret.model = this.modelName;
		return ret;
	},

	clear: function() {
		this.data = [];
		this.save();
	}
};

module.exports = Model;

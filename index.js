var Api = require("./RestApiScaffold.js");

var api = new Api();
var models = require("./models.js");

var metaApis = require("./apiMeta.js").init(api, models);
var sessionApis = require("./apiSession.js").init(api, models);
var jobsApis = require("./apiJob.js").init(api, models);

api.start(8888);

console.log('started.');
var Api = require("./libs/RestApiScaffold.js");
var log = require("./libs/log.js");

log.logDebug = true;

var api = new Api();
var models = require("./models.js");

var metaApis = require("./apiMeta.js").init(api, models);
var sessionApis = require("./apiSession.js").init(api, models);
var jobsApis = require("./apiJob.js").init(api, models);

api.start(8888);

log.log('started.');
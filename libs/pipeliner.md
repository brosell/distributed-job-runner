return false from a method to "pause" the pipeline. A later call to pipeline.next() will be required to "unpause".

// instantiate
var pipeline = new Pipeline();

// provide pipeline scope data
pipeline.data = {
};

// enquwue the methods that makeup the pipeline
pipeline.enqueue(this.filter.bind(this));
pipeline.enqueue(this.processRequestBody.bind(this));
pipeline.enqueue(this.processQueryString.bind(this));
pipeline.enqueue(this.processUrl.bind(this));
pipeline.enqueue(this.routeRequest.bind(this));

// start the pipeline
pipeline.go(function(err, pipeline) {
	// called when pipeline completes (i.e. pipeline.next() has nothing to do)
	
	// in this case we add some post-processing to the existing pipeline
	pipeline.enqueue(me.writeResponse.bind(me));

	pipeline.go(function(err, pipeline) {
		log.debug("finished ");
	});
});
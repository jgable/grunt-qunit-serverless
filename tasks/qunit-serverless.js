var QUnitServerlessTask = require("./lib/QUnitServerlessTask");

module.exports = function(grunt) {

	var phantomjs = require('grunt-lib-phantomjs').init(grunt);

	grunt.registerMultiTask("qunit-serverless", "Builds up an HTML page and runs it with PhantomJS", function() {
		var task = new QUnitServerlessTask(this, phantomjs);

		task.run();
	});
};
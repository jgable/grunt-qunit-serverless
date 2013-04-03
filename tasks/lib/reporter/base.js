
var grunt = require("grunt"),
	_ = grunt.util._;

var statuses = {
	fail: "✖".red,
	success: "✓".green
};

var defaults = {
	logLevel: 0,
	statuses: statuses
};



var BaseReporter = function(opts) {
	this.opts = _.defaults(opts, defaults);
};

_.extend(BaseReporter.prototype, {
	_log: function(level, msg) {
		if(level > this.opts.logLevel) {
			return;
		}

		var logFunc = level === 0 ? "log" : "verbose";

		grunt[logFunc].writeln(msg);
	},
	log: function(msg) {
		this._log(0, msg);
	},
	verbose: function(msg) {
		this._log(1, msg);
	},
	isVerbose: function() {
		return this.opts.logLevel > 0;
	},

	// Begin empty qunit event handlers
	start: function(pageUrl) {

	},
	complete: function(state) {

	},
	moduleStart: function(name) {

	},
	moduleDone: function(name, failed, passed, total) {

	},
	testStart: function(name) {

	},
	testDone: function(name) {

	},
	assertionPassed: function(message) {

	},
	assertionFailed: function(actual, expected, message, source) {

	}
});

module.exports = BaseReporter;
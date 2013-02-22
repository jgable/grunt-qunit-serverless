/*
	Portions of this code taken from grunt-lib-qunit; https://github.com/gruntjs/grunt-contrib-qunit 
*/

var grunt = require("grunt");

var _ = grunt.util._;

var statuses = {
	fail: "✖".red,
	success: "✓".green
};

var PhantomQUnitRunner = function(phantomjs, opts) {
	opts = opts || {};

	this.phantomjs = phantomjs;
	this.opts = _.defaults(opts, {
		statuses: statuses,
		timeout: 5000
	});

	this._resetState();
	this._addPhantomHandlers();
};

PhantomQUnitRunner.prototype = {
	_verboseLog: function(msg) {
		grunt.verbose.writeln(msg);
	},
	_log: function(msg) {
		grunt.log.writeln(msg);
	},

	_resetState: function() {
		this.state = {
			failed: 0,
			passed: 0,
			total: 0,
			duration: 0,
			currentModule: null,
			currentTest: null,
			modules: {
				unnamed: {
					totals: {

					},
					tests: {}
				}
			}
		};
	},

	_addPhantomHandlers: function() {
		_.bindAll(this, "_qunit_moduleStart", "_qunit_log", "_qunit_done", "_qunit_testStart", "_qunit_testDone", "_qunit_moduleDone", "_phantom_failLoad", "_phantom_failTimeout");
		
		this.phantomjs.on("qunit.moduleStart", this._qunit_moduleStart);
		this.phantomjs.on("qunit.testStart", this._qunit_testStart);
		this.phantomjs.on('qunit.testDone', this._qunit_testDone);
		this.phantomjs.on("qunit.moduleDone", this._qunit_moduleDone);
		this.phantomjs.on("qunit.log", this._qunit_log);
		this.phantomjs.on('qunit.done', this._qunit_done);

		this.phantomjs.on("fail.load", this._phantom_failLoad);
		this.phantomjs.on("fail.timeout", this._phantom_failTimeout);
	},

	_clearPhantomHandlers: function() {
		this.phantomjs.removeListener("qunit.moduleStart", this._qunit_moduleStart);
		this.phantomjs.removeListener("qunit.testStart", this._qunit_testStart);
		this.phantomjs.removeListener('qunit.testDone', this._qunit_testDone);
		this.phantomjs.removeListener("qunit.moduleDone", this._qunit_moduleDone);
		this.phantomjs.removeListener("qunit.log", this._qunit_log);
		this.phantomjs.removeListener('qunit.done', this._qunit_done);

		this.phantomjs.removeListener("fail.load", this._phantom_failLoad);
		this.phantomjs.removeListener("fail.timeout", this._phantom_failTimeout);	
	},

	_qunit_moduleStart: function(name) {
		this._log("  " + name + ":");
		this.state.currentModule = name;
		this.state.modules[name] = this.state.modules[name] || {
			totals: null,
			tests: {}
		};
	},
	
	_qunit_moduleDone: function(name, failed, passed, total) {
		var moduleStatus = passed === total ? statuses.success : statuses.fail;
		
		this.state.modules[name].totals = this.state.modules[name].totals || {
			failed: 0,
			passed: 0,
			total: 0
		};

		this.state.modules[name].totals.failed += failed;
		this.state.modules[name].totals.passed += passed;
		this.state.modules[name].totals.total += total;

		failed = "" + failed;
		passed = "" + passed;
		total = "" + total;

		this._log("    " + moduleStatus + " (" + failed.red + " / " + passed.green + " / " + total.cyan + ")");
		this._log("");
		
		this.state.currentModule = null;
	},

	_qunit_testStart: function(name) {
		this.state.currentTest = name;
		this.state.testStart = new Date().getTime();
		this._verboseLog("    - " + name);
	},

	_qunit_testDone: function(name, failed, passed, total) {
		var moduleName = this.state.currentModule || "unnamed",
			elapsed = (new Date().getTime()) - this.state.testStart;

		this.state.modules[moduleName].tests[name] = {
			name: name,
			failed: failed,
			passed: passed,
			total: total
		};

		failed = "" + failed;
		passed = "" + passed;
		total = "" + total;

		var testStatus = passed === total ? statuses.success : statuses.fail,
			warn = "(" + elapsed + "ms)";

		if (elapsed <= 100) {
			warn = "";
		} else if (elapsed > 500) {
			warn = warn.red;
		} else if (elapsed > 100) {
			warn = warn.yellow;
		}

		this._verboseLog("      " + testStatus + " (" + failed.red + " / " + passed.green + " / " + total.cyan + ") " + warn);
	},

	_qunit_log: function(result, actual, expected, message, source) {
		message = message || (result ? "okay" : "not okay");
		
		if(result) {
			// An assertion passed
			this._verboseLog("      " + statuses.success + " " + message.grey);
			return;
		}

		this._verboseLog("      " + statuses.fail + " " + message.grey);
		if(actual && expected) {
			this._verboseLog("        - " + "Actual:   ".grey + actual);
			this._verboseLog("        - " + "Expected: ".grey + expected);
		}
		if(source) {
			this._verboseLog("        - " + "Source: ".grey + source.replace(/ {4}(at)/g, '  $1').magenta);
		}
	},

	_qunit_done: function(failed, passed, total, duration) {
		// Stop the phantom spawn.
		this.phantomjs.halt();

		var totalStatus = passed === total ? statuses.success : statuses.fail;

		this.state.failed = failed;
		this.state.passed = passed;
		this.state.total = total;
		this.state.duration = duration;

		failed = "" + failed;
		passed = "" + passed;
		total = "" + total;

		duration = ((duration / 100)|0) / 10;
		duration = "" + duration + " seconds";
		
		this._log("  Tests Complete: " + totalStatus + " (" + failed.red + " / " + passed.green + " / " + total.cyan + ") in " + duration);
	},

	_phantom_failLoad: function(url) {
		this.phantomjs.halt();
		grunt.warn("Unable to load: " + url);
	},

	_phantom_failTimeout: function() {
		this.phantomjs.halt();
		grunt.warn("Timeout reached (missing start() call?)");
	},

	run: function(pageUrl, done) {
		var self = this;

		this._verboseLog("Loading QUnit Page at: " + pageUrl);

		// Give us some space
		this._log("");

		this.phantomjs.spawn(pageUrl, {

			options: {
				timeout: self.opts.timeout
			},

			done: function(err) {
				if(err) {
					return done(err);
				}

				return done(null, self.state);
			}
		});
	},

	dispose: function() {
		this._clearPhantomHandlers();
	}
};

module.exports = PhantomQUnitRunner;
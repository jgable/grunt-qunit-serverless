/*
	Portions of this code taken from grunt-lib-qunit; https://github.com/gruntjs/grunt-contrib-qunit 
*/

var grunt = require("grunt");

var _ = grunt.util._,
	BaseReporter = require("./reporter/base"),
	SpecReporter = require("./reporter/spec");

// TODO: Remove
var statuses = {
	fail: "✖".red,
	success: "✓".green
};

var PhantomQUnitRunner = function(phantomjs, opts) {
	opts = opts || {};

	this.phantomjs = phantomjs;
	this.opts = _.defaults(opts, {
		statuses: statuses,
		reporter: new SpecReporter({
			logLevel: grunt.option("verbose") ? 1 : 0
		}),
		timeout: 5000
	});

	this.reporter = this.opts.reporter;

	this._resetState();
	this._addPhantomHandlers();
};

_.extend(PhantomQUnitRunner.prototype, {
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
		this.state.currentModule = name;
		this.state.modules[name] = this.state.modules[name] || {
			totals: null,
			tests: {}
		};

		this.reporter.moduleStart(name);
	},
	
	_qunit_moduleDone: function(name, failed, passed, total) {
		if(!this.state.modules[name]) {
			return;
		}
		
		this.state.modules[name].totals = this.state.modules[name].totals || {
			failed: 0,
			passed: 0,
			total: 0
		};

		this.state.modules[name].totals.failed += failed;
		this.state.modules[name].totals.passed += passed;
		this.state.modules[name].totals.total += total;

		this.reporter.moduleDone(name, failed, passed, total);
		
		this.state.currentModule = null;
	},

	_qunit_testStart: function(name) {
		this.state.currentTest = name;
		this.state.testStart = new Date().getTime();
		
		this.reporter.testStart(name);
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

		this.reporter.testDone(name, failed, passed, total, elapsed);

		this.state.currentTest = null;
	},

	_qunit_log: function(result, actual, expected, message, source) {
		message = message || (result ? "okay" : "not okay");
		
		if(result) {
			// An assertion passed
			this.reporter.assertionPassed(message);
		} else {
			// Assertion failed
			this.reporter.assertionFailed(actual, expected, message, source);	
		}
	},

	_qunit_done: function(failed, passed, total, duration) {
		// Stop the phantom spawn.
		this.phantomjs.halt();

		this.state.failed = failed;
		this.state.passed = passed;
		this.state.total = total;
		this.state.duration = duration;

		this.reporter.complete(this.state);
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

		this.reporter.start(pageUrl);

		this.phantomjs.spawn(pageUrl, {

			options: {
				timeout: self.opts.timeout
			},

			done: function(err) {
				try {
					self.dispose();	
				} catch (ignore) { }
				
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
});

// For others to base their reporters off of
PhantomQUnitRunner.reporters = {
	Base: BaseReporter,
	Spec: SpecReporter
};

module.exports = PhantomQUnitRunner;
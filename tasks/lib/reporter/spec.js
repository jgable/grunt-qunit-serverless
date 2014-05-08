
var grunt = require("grunt"),
	_ = grunt.util._;

var BaseReporter = require("./base");

var SpecReporter = function(opts) {
	BaseReporter.call(this, opts);


	this._currModule = "";
	this._currAssertions = [];
	this._failedTestCount = 0;
	this._failedTestMsgs = [];
};

_.extend(SpecReporter.prototype, BaseReporter.prototype);

_.extend(SpecReporter.prototype, {
	start: function(pageUrl) {
		this.verbose("");
		this.verbose("Loading QUnit Page at: " + pageUrl);

		// Give us some space
		this.log("");
	},
	complete: function(state) {
		var self = this,
			totalPassed = state.passed === state.total,
			totalStatus = totalPassed ? this.opts.statuses.success : this.opts.statuses.fail,
			totalMsg = "";


		var failed = "" + state.failed,
			passed = "" + state.passed,
			total = "" + state.total,
			duration = "" + (((state.duration / 100)|0) / 10) + " seconds";

		if(totalPassed) {
			totalMsg = "  " + total.green + " tests complete ".green;
			totalMsg += "(".grey + duration.grey + ")".grey;
		} else {
			totalMsg = "  " + failed.red + " of ".red + total.red + " tests failed".red + ":".grey;
		}
		
		this.log("");
		this.log(totalMsg);

		if(this._failedTestCount) {
			this.log("");
			_.each(this._failedTestMsgs, function(failedMsg) {
				self.log("  " + failedMsg);
			});
			this.log("");
		}
	},
	moduleStart: function(name) {
		this.log("  " + name);
		this._currModule = name;
	},
	moduleDone: function(name, failed, passed, total) {
		var moduleStatus = passed === total ? this.opts.statuses.success : this.opts.statuses.fail;
		
		this.log("");
	},
	
	testStart: function(name) {
		
	},
	assertionPassed: function(message) {
		this._currAssertions.push("      " + this.opts.statuses.success + " " + message.grey);
	},
	assertionFailed: function(actual, expected, message, source) {
		this._currAssertions.push("      " + this.opts.statuses.fail + " " + message.grey);
		if(actual !== "undefined" && expected !== "undefined") {
			this._currAssertions.push("        - " + "Actual:   ".grey + actual);
			this._currAssertions.push("        - " + "Expected: ".grey + expected);
		}
		if(source) {
			this._currAssertions.push("        - " + "Source: ".grey + source.replace(/ {4}(at)/g, '  $1').magenta);
		}
	},
	testDone: function(name, failed, passed, total, elapsed) {
		var self = this,
			testPassed = passed === total,
			testStatus = testPassed ? this.opts.statuses.success : this.opts.statuses.fail,
			warn = "(" + elapsed + "ms)",
			msg = "    " + testStatus + " " + name.grey + " ";

		failed = "" + failed;
		passed = "" + passed;
		total = "" + total;

		if (elapsed <= 100) {
			warn = "";
		} else if (elapsed > 500) {
			warn = warn.red;
		} else if (elapsed > 100) {
			warn = warn.yellow;
		}

		msg += warn;

		this.log(msg);

		if(this._failedTestCount > 2) {
			// Don't log more than 3 failed tests.
			testPassed = true;
		}

		if(!testPassed) {
			this._failedTestMsgs.push( ( this._failedTestCount+1 )+") " + this._currModule);
			this._failedTestMsgs.push(msg);
		}

		_.each(this._currAssertions, function(assertionMsg) { 
			self.verbose(assertionMsg);

			if(!testPassed) {
				self._failedTestMsgs.push(assertionMsg);
			}
		});

		if(!testPassed) {
			// Add some spacing between failed tests
			this._failedTestMsgs.push("");
			this._failedTestCount++;
		}

		this._currAssertions = [];
	}
	
});

module.exports = SpecReporter;
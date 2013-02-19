var path = require("path"),
	os = require("os");

var grunt = require("grunt"),
	uuid = require("node-uuid");

var _ = grunt.util._,
	async = grunt.util.async;

var IncludesBase = require("./IncludesBase");

var PageBuilder = function(opts) {
	IncludesBase.call(this);

	this.opts = _.defaults({}, opts, this._includeDefaults());
};

_.extend(PageBuilder.prototype, IncludesBase.prototype);

_.extend(PageBuilder.prototype, {
	_readFile: function(path) {
		return grunt.file.read(path);
	},

	_getTempFilePath: function() {
		return path.join(os.tmpDir(), "qsvl-" + uuid.v1() + ".html");
	},

	build: function(done) {
		var self = this,
			opts = this.opts,
			qunitPage = _.template(grunt.file.read(opts.pageTemplate)),
			qunitStyle = grunt.file.read(opts.qunitCss),
			qunitScript = grunt.file.read(opts.qunitJs),
			qunitBridgeScript = grunt.file.read(opts.qunitBridge),
			includeFiles = [],
			testFiles = [],
			templateFiles = [],
			templateNamer = opts.templateNamer || function(filePath) {
				return path.basename(filePath);
			};

		if(opts.includeFiles) {
			includeFiles = grunt.file.expand(opts.includeFiles);
		}

		if (opts.testFiles) {
			testFiles = grunt.file.expand(opts.testFiles);
		}

		if(opts.templateFiles) {
			templateFiles = grunt.file.expand(opts.templateFiles);
		}

		var pageData = {
			title: "tests",
			style: qunitStyle,
			script: {
				qunit: qunitScript,
				qunitBridge: qunitBridgeScript,
				header: opts.headerScript || ""
			}
		};

		var includeContents = "",
			addIncludeContents = function(includePath, cb) {
				includeContents += self._readFile(includePath) + "\n\n";

				cb();
			};

		// Load all the include files.
		async.forEach(includeFiles, addIncludeContents, function(err) {
			if(err) {
				return done(err);
			}

			pageData.script.includes = includeContents;

			var testContents = "",
			addTestContents = function(testPath, cb) {
				testContents += self._readFile(testPath) + "\n\n";

				cb();
			};

			// Load all the test file contents
			async.forEach(testFiles, addTestContents, function(err) {
				if(err) {
					return done(err);
				}

				pageData.script.tests = testContents;

				var	templateContents = [],
					addTemplateContents = function(templatePath, cb) {
						var fileName = templateNamer(templatePath);

						templateContents.push("<script type='text/html' id='" + fileName + "'>\n" + self._readFile(templatePath) + "\n</script>\n");

						cb();
					};

				// Load all the templateFile contents
				async.forEach(templateFiles, addTemplateContents, function(err) {
					if(err) {
						return done(err);
					}

					pageData.script.templates = templateContents;

					var pageHtml = qunitPage(pageData),
						pagePath = self._getTempFilePath();

					grunt.file.write(pagePath, pageHtml);

					done(null, pagePath, pageHtml);
				});
			});
		});

	}
});

module.exports = PageBuilder;
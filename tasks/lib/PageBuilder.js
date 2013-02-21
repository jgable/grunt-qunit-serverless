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

		var	addIncludeContents = function(includePath, cb) {
				var includeContents = self._readFile(includePath);

				cb(null, "<script>\n" + includeContents + "\n</script>\n");
			};

		// Load all the include files.
		async.map(includeFiles, addIncludeContents, function(err, includeTags) {
			if(err) {
				return done(err);
			}

			pageData.script.includes = includeTags;

			var addTestContents = function(testPath, cb) {
				var testContents = self._readFile(testPath);

				cb(null, "<script>\n" + testContents + "\n</script>\n");
			};

			// Load all the test file contents
			async.map(testFiles, addTestContents, function(err, testTags) {
				if(err) {
					return done(err);
				}

				pageData.script.tests = testTags;

				var	addTemplateContents = function(templatePath, cb) {
						var fileName = templateNamer(templatePath),
							tag = "<script type='text/html' id='" + fileName + "'>\n" + self._readFile(templatePath) + "\n</script>\n";

						cb(null, tag);
					};

				// Load all the templateFile contents
				async.map(templateFiles, addTemplateContents, function(err, templateTags) {
					if(err) {
						return done(err);
					}

					pageData.script.templates = templateTags;

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
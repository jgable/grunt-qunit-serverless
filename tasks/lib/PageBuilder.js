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

	this.idtag = uuid.v1();
	this.tmpDir = os.tmpDir();
};

_.extend(PageBuilder.prototype, IncludesBase.prototype);

_.extend(PageBuilder.prototype, {
	_readFile: function(path) {
		return grunt.file.read(path);
	},

	_writeFile: function(path, contents) {
		grunt.file.write(path, contents);
	},

	_getTempJsAssetPath: function(assetType, name) {
		return path.join(this.tmpDir, this.idtag, "js", assetType, name);
	},

	_getTempFilePath: function() {
		var filePath = path.join(this.tmpDir, this.idtag, "qunit-tests.html");

		return filePath;
	},

	build: function(done) {
		var self = this,
			opts = this.opts,
			qunitPage = _.template(grunt.file.read(opts.pageTemplate)),
			// Yeah, I know, this is cheating
			qunitStyle = this._getTempJsAssetPath("qunit", "qunit.css"),
			qunitScript = this._getTempJsAssetPath("qunit", "qunit.js"),
			qunitBridgeScript = this._getTempJsAssetPath("qunit", "qunitBridge.js"),
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

		// Write the qunit files over
		this._writeFile(qunitStyle, this._readFile(opts.qunitCss));
		this._writeFile(qunitScript, this._readFile(opts.qunitJs));
		this._writeFile(qunitBridgeScript, this._readFile(opts.qunitBridge));

		var pageData = {
			title: opts.pageTitle || "tests",
			style: "<link href='js/qunit/qunit.css' rel='stylesheet' type='test/css' />",
			script: {
				qunit: "<script src='js/qunit/qunit.js'></script>",
				qunitBridge: "<script src='js/qunit/qunitBridge.js'></script>",
				header: opts.headerScript || ""
			}
		};

		var	addIncludeContents = function(includePath, cb) {
				// Will be dirname/filename
				var	filename = path.basename(path.dirname(includePath)) + path.sep + path.basename(includePath);

				self._writeFile(self._getTempJsAssetPath("includes", filename), self._readFile(includePath));

				cb(null, "<script src='js/includes/" + filename + "'></script>");
			};

		// Load all the include files.
		async.map(includeFiles, addIncludeContents, function(err, includeTags) {
			if(err) {
				return done(err);
			}

			pageData.script.includes = includeTags;

			var addTestContents = function(testPath, cb) {
				var filename = path.basename(path.dirname(testPath)) + path.sep + path.basename(testPath);

				self._writeFile(self._getTempJsAssetPath("tests", filename), self._readFile(testPath));

				cb(null, "<script src='js/tests/" + filename + "'></script>");
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
var path = require("path");

var IncludesBase = function() {
	this.includesFolderPath = path.resolve(path.join(__dirname, "..", "..", "includes"));
};

IncludesBase.prototype = {
	_includeFilePath: function(file) {
		return path.join(this.includesFolderPath, file);
	},

	_includeDefaults: function() {
		return {
			pageTemplate: this._includeFilePath("qunit-page.tpl"),
			qunitCss: this._includeFilePath("qunit.css"),
			qunitJs: this._includeFilePath("qunit.js"),
			qunitBridge: this._includeFilePath("qunit-bridge.js")
		};
	}
};

module.exports = IncludesBase;
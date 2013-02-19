var path = require("path");

module.exports = function(grunt) {

	var cfg = {
		
		jshint: {
			all: ["tasks/**/*.js"]
		},

		"qunit-serverless": {
			test: {
				options: {
					headerScript: "window.headerObj = true;",
					includeFiles: [path.join("test", "res", "includes", "*.js")],
					testFiles: [path.join("test", "res", "tests", "test*.js")],
					templateFiles: [path.join("test", "res", "templates", "*.stache")]
				}
			},
			fail: {
				options: {
					headerScript: "window.headerObj = true;",
					includeFiles: [path.join("test", "res", "includes", "*.js")],
					testFiles: [path.join("test", "res", "tests", "*.js")],
					templateFiles: [path.join("test", "res", "templates", "*.stache")]
				}	
			}
		}
	};

	grunt.initConfig(cfg);

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadTasks("./tasks");

	grunt.registerTask("default", ["jshint:all", "qunit-serverless:test"]);
};
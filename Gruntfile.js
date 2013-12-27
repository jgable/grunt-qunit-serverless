var path = require("path");

module.exports = function(grunt) {

	var cfg = {
		
		jshint: {
			all: ["tasks/**/*.js"]
		},

		mochacli: {
			options: {
				compilers: "coffee:coffee-script",
				timeout: 3000,
				ignoreLeaks: false,
				ui: 'bdd',
				reporter: 'spec'
			},

			all: ['test/*.coffee']
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
	grunt.loadNpmTasks("grunt-mocha-cli");
	grunt.loadTasks("./tasks");

	grunt.registerTask("default", ["jshint:all", "mochacli:all", "qunit-serverless:test"]);
};
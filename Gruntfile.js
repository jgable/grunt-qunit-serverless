var path = require("path");

module.exports = function(grunt) {

	var cfg = {
		buildPath: path.join(__dirname, 'test', '.build'),
		
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
			options: {
				tmpDir: "<%= buildPath %>"
			},
			test: {
				options: {
					headerScript: "window.headerObj = true;",
					includeFiles: [path.join("test", "res", "includes", "*.js")],
					testFiles: [path.join("test", "res", "tests", "test*.js")],
					templateFiles: [path.join("test", "res", "templates", "*.stache")]
				}
			},
			connectBuild: {
				options: {
					headerScript: "window.headerObj = true;",
					includeFiles: [path.join("test", "res", "includes", "*.js")],
					testFiles: [path.join("test", "res", "tests", "test*.js")],
					templateFiles: [path.join("test", "res", "templates", "*.stache")],
					connectUrl: 'http://127.0.0.1:8000/'
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
		},

		connect: {
			qunit: {
				options: {
					port: 8000,
					base: "<%= buildPath %>"
				}
			}
		},

		clean: {
			build: ['test/.build/*']
		}
	};

	grunt.initConfig(cfg);

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-clean");

	grunt.loadNpmTasks("grunt-mocha-cli");
	grunt.loadTasks("./tasks");

	grunt.registerTask("test-connect", ["clean", "connect:qunit", "qunit-serverless:connectBuild"]);
	
	grunt.registerTask("default", ["jshint:all", "mochacli:all", "qunit-serverless:test", "test-connect"]);
};
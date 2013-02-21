grunt-qunit-serverless [![Build Status](https://secure.travis-ci.org/jgable/grunt-qunit-serverless.png)](http://travis-ci.org/jgable/grunt-qunit-serverless)
======================

A serverless version of the [grunt-contrib-qunit](https://github.com/gruntjs/grunt-contrib-qunit) task.  The intent of this task is to be able to run your [qunit](http://qunitjs.com/) tests without spinning up a web server.

## Installation

    npm install grunt-qunit-serverless --save

## Example

    var cfg = {
    	
    	"qunit-serverless": {
    		all: {
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
    
    grunt.loadNpmTasks("grunt-qunit-serverless");
    
    grunt.registerTask("default", ["qunit-serverless:test"]);

## Options

#### qunitJs

The path to the qunit.js file you would like to use.  Otherwise, we will default to one that is included with the npm package.

#### qunitCss

The path to the qunit.css file you would like to use.  Otherwise, we will default to one that is included with the npm package.

#### qunitBridge

The path to the PhantomJS to QUnit bridge script file you would like to use.  Otherwise, we will default to noe that is included with the npm package that is based on one from [grunt-contrib-qunit](https://github.com/gruntjs/grunt-contrib-qunit/blob/master/phantomjs/bridge.js).

#### pageTemplate

The path to an [underscore template](http://underscorejs.org/#template) file that will build the qunit test page.  Defaults to one that is included with the npm package.

#### headerScript

Raw JavaScript that you would like to include at the top of the page.  Not intended to be very long.  See other options for how to include files (such as libraries).

#### includeFiles

A `grunt.file.expand(...)` argument array describing the files you'd like to include before qunit.

#### testFiles

A `grunt.file.expand(...)` argument array describing the test files to include.

#### templateFiles

A `grunt.file.expand(...)` argument array describing template files you'd like to include after the test files.

## License

This library is licensed under the MIT License.  Portions of this code were taken from the [grunt-contrib-qunit](https://github.com/gruntjs/grunt-contrib-qunit) task.


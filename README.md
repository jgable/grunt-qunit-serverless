grunt-qunit-serverless [![Build Status](https://travis-ci.org/jgable/grunt-qunit-serverless.png?branch=master)](https://travis-ci.org/jgable/grunt-qunit-serverless)
======================

A serverless version of the [grunt-contrib-qunit](https://github.com/gruntjs/grunt-contrib-qunit) task.  The intent of this task is to be able to run your [qunit](http://qunitjs.com/) tests without spinning up a web server.

## Installation

    npm install grunt-qunit-serverless --save

## Reporting

#### Normal
[![Normal Logging](http://jgable-hosting.s3.amazonaws.com/qunit-serverless-basic-logging.png)](http://jgable-hosting.s3.amazonaws.com/qunit-serverless-basic-logging.png)

#### Verbose
[![Verbose Logging](http://jgable-hosting.s3.amazonaws.com/qunit-serverless-verbose-logging.png)](http://jgable-hosting.s3.amazonaws.com/qunit-serverless-verbose-logging.png)

## Example Config

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
    
    grunt.registerTask("default", ["qunit-serverless"]);

## Options

#### qunitJs

The path to the qunit.js file you would like to use.  Otherwise, we will default to one that is included with the npm package.

#### qunitCss

The path to the qunit.css file you would like to use.  Otherwise, we will default to one that is included with the npm package.

#### qunitBridge

The path to the PhantomJS to QUnit bridge script file you would like to use.  Otherwise, we will default to noe that is included with the npm package that is based on one from [grunt-contrib-qunit](https://github.com/gruntjs/grunt-contrib-qunit/blob/master/phantomjs/bridge.js).

#### qunit-filter

A test filter to pass to the qunit runner; can limit the number of tests you run.  Also can be passed in via command line as `--qunit-filter="something"`.

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

#### buildOnly

A boolean value that when set to a truthy value indicates that only the html file should be built and its path output to the console.

## Reporters

As of version 0.2.0 you can build your own reporter based on a simple interface shown below, the default is a Spec based reported similar to the [Mocha Spec](https://mochajs.org/#reporters) reporter.

```javascript
{
    start: function(pageUrl) {

    },
    complete: function(state) {

    },
    moduleStart: function(name) {

    },
    moduleEnd: function(name, failed, passed, total) {

    },
    testStart: function(name) {

    },
    testDone: function(name) {

    },
    assertionPassed: function(message) {

    },
    assertionFailed: function(actual, expected, message, source) {

    }
}
```

## License

This library is licensed under the MIT License.  Portions of this code were taken from the [grunt-contrib-qunit](https://github.com/gruntjs/grunt-contrib-qunit) task.


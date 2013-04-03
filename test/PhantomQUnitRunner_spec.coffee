path = require "path"
{EventEmitter} = require "events"

grunt = require "grunt"
should = require "should"

PageBuilder = require "../tasks/lib/PageBuilder"
PhantomQUnitRunner = require "../tasks/lib/PhantomQUnitRunner"
BaseReporter = require "../tasks/lib/reporter/base"

describe "PhantomQUnitRunner", ->
	mockPhantom = undefined
	mockReporter = undefined

	beforeEach ->
		mockPhantom = new EventEmitter
		mockPhantom.halt = -> return

		mockReporter = new BaseReporter

	it "resets state", ->
		runner = new PhantomQUnitRunner mockPhantom

		should.exist runner.state

		should.not.exist runner.state.currentModule
		should.not.exist runner.state.currentTest

		runner.state.currentModule = "test1"

		should.exist runner.state.currentModule
		runner._resetState()
		should.not.exist runner.state.currentModule

	it "attaches qunit handlers", ->
		runner = new PhantomQUnitRunner mockPhantom

		runner._verboseLog = runner._log = (msg) -> return

		should.exist runner.phantomjs

		runner.phantomjs.should.equal mockPhantom

		ran = 
			moduleStart: false
			moduleDone: false
			testStart: false
			testDone: false
			log: false
			done: false

		runner._clearPhantomHandlers()

		# Re-assign the internal event handlers
		for own methodName, __ of ran
			runner["_qunit_#{methodName}"] = -> ran[methodName] = true

		runner._addPhantomHandlers()

		# Emit the events and test that our event handlers ran
		for own methodName, __ of ran
			ran[methodName].should.equal false
			mockPhantom.emit "qunit.#{methodName}", "name", 0, 1, 1
			ran[methodName].should.equal true, methodName

	it "logs module tests", ->
		runner = new PhantomQUnitRunner mockPhantom

		verbose = []
		log = []

		runner.reporter.verbose = (msg) -> 
			#console.log "v: " + msg
			verbose.push msg
		runner.reporter.log = (msg) -> 
			#console.log "c: " + msg
			log.push msg
 
		mockPhantom.emit "qunit.moduleStart", "test module"
		mockPhantom.emit "qunit.testStart", "test1"
		mockPhantom.emit "qunit.log", true, undefined, undefined, "1's are same"
		mockPhantom.emit "qunit.testDone", "test1", 0, 1, 1
		mockPhantom.emit "qunit.testStart", "test2"
		mockPhantom.emit "qunit.log", true, undefined, undefined, "2's are same"
		mockPhantom.emit "qunit.log", true, undefined, undefined, "3's are same"
		mockPhantom.emit "qunit.testDone", "test2", 0, 2, 2
		mockPhantom.emit "qunit.moduleDone", "test module", 0, 3, 3
		mockPhantom.emit "qunit.done", 0, 3, 3, 828

		verbose.length.should.equal 3
		log.length.should.equal 5

		should.exist runner.state.modules["test module"]
		should.exist runner.state.modules["test module"].tests.test1

	it "loads built html files", (done) ->
		builder = new PageBuilder
			headerScript: "window.headerObj = true;"
			includeFiles: [path.join(__dirname, "res", "includes", "*.js")]
			testFiles: [path.join(__dirname, "res", "tests", "*.js")]
			templateFiles: [path.join(__dirname, "res", "templates", "*.stache")]

		builder.build (err, pageUrl, pageContents) ->
			return done(err) if err

			should.exist pageUrl, "pageUrl"
			should.exist pageContents, "pageContents"

			phantomjs = require('grunt-lib-phantomjs').init(grunt)

			runner = new PhantomQUnitRunner phantomjs, 
				reporter: mockReporter

			runner.run pageUrl, (err, testResults) ->
				return done(err) if err

				should.exist testResults

				done()

path = require "path"

should = require "should"
grunt = require "grunt"

{_, async} = grunt.util

QUnitServerlessTask = require "../tasks/lib/QUnitServerlessTask"

describe "QUnitServerlessTask", ->

	makeFakeTask = ->
		options: -> {}

	it "can load include paths", ->

		task = new QUnitServerlessTask(makeFakeTask())

		result = task._includeFilePath "someFile.txt"

		expect = path.resolve path.join(__dirname, "..", "includes", "someFile.txt")

		result.should.equal expect, "someFile.txt"

	it "can load default includes", ->

		task = new QUnitServerlessTask(makeFakeTask())

		result = task._includeDefaults()

		result.pageTemplate.should.equal task._includeFilePath("qunit-page.tpl")
		result.qunitCss.should.equal task._includeFilePath("qunit.css")
		result.qunitJs.should.equal task._includeFilePath("qunit.js")
		result.qunitBridge.should.equal task._includeFilePath("qunit-bridge.js")

		
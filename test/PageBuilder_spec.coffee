fs = require "fs"
path = require "path"

should = require "should"
phantom = require "phantom"

PageBuilder = require "../tasks/lib/PageBuilder"

describe "PageBuilder", ->
	ph = undefined
	page = undefined

	before (done) ->
		phantom.create (createdPh) ->
			ph = createdPh

			done()

	beforeEach (done) ->
		ph.createPage (createdPage) ->
			page = createdPage

			done()

	it "generates temp file names", (done) ->
		builder = new PageBuilder()

		result = builder._getTempFilePath()

		should.exist result

		# Check that the directory exists already so we can write to it.
		fs.exists path.dirname(result), (exists) ->
			exists.should.equal true

			done()

	it "builds html files with include files", (done) ->
		builder = new PageBuilder
			includeFiles: [path.join(__dirname, "res", "includes", "*.js")]

		builder.build (err, pageUrl, pageContents) ->
			return done err if err

			should.exist pageUrl
			should.exist pageContents

			fs.exists pageUrl, (exists) ->
				exists.should.equal true

				done()

	it "builds html files with single test file", (done) ->
		builder = new PageBuilder
			testFiles: [path.join(__dirname, "res", "tests", "test1.js")]

		builder.build (err, pageUrl, pageContents) ->
			return done err if err

			should.exist pageUrl

			should.exist pageContents

			fs.exists pageUrl, (exists) ->
				exists.should.equal true

				done()

	it "builds html files with many test files", (done) ->
		builder = new PageBuilder
			testFiles: [path.join(__dirname, "res", "tests", "*.js")]

		builder.build (err, pageUrl, pageContents) ->
			return done err if err

			should.exist pageUrl

			should.exist pageContents

			fs.exists pageUrl, (exists) ->
				exists.should.equal true

				done()

	it "builds html files with templates", (done) ->
		builder = new PageBuilder
			templateFiles: [path.join(__dirname, "res", "templates", "*.stache")]

		builder.build (err, pageUrl, pageContents) ->
			return done err if err

			should.exist pageUrl

			should.exist pageContents

			fs.exists pageUrl, (exists) ->
				exists.should.equal true

				done()

	it "builds html files with all the things", (done) ->
		builder = new PageBuilder
			headerScript: "window.headerObj = true;"
			includeFiles: [path.join(__dirname, "res", "includes", "*.js")]
			testFiles: [path.join(__dirname, "res", "tests", "*.js")]
			templateFiles: [path.join(__dirname, "res", "templates", "*.stache")]

		builder.build (err, pageUrl, pageContents) ->
			return done err if err

			should.exist pageUrl, "pageUrl"

			should.exist pageContents, "pageContents"

			console.log pageUrl

			fs.exists pageUrl, (exists) ->
				exists.should.equal true

				page.open pageUrl, (status) ->
					return done(status) unless status == "success"

					page.evaluate (-> window.headerObj), (headerObj) ->
						should.exist headerObj, "headerObj"

						page.evaluate (-> window.testObj), (testObj) ->
							should.exist testObj, "testObj"

							should.exist testObj.include1
							should.exist testObj.include2
							should.exist testObj.include3

							page.evaluate (-> window.testsRun), (testsRun) ->
								should.exist testsRun, "testsRun"

								should.exist testsRun.test1
								should.exist testsRun.test2

								page.evaluate (-> Array.prototype.slice.call(document.querySelectorAll("script[type='text/html']"), 0)), (templateTags) ->

									should.exist templateTags, "templateTags"

									templateTags.length.should.equal 3

									done()
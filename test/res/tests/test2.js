
(function() {
	module("module 2");

	test("sample test 2", function() {
		ok(true, "loaded sample test 2");
	});

	window.testsRun || (window.testsRun = {});
	window.testsRun.test2 = true;
}());
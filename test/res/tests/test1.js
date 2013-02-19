
(function() {
	module("module 1");

	test("sample test 1", function() {
		ok(true, "loaded sample test 1");
	});

	window.testsRun || (window.testsRun = {});
	window.testsRun.test1 = true;
}());
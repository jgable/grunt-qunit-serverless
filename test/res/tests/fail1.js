
(function() {
	module("module fail");

	test("sample test 3", function() {
		ok(false, "loaded sample test 3");
	});

	window.testsRun || (window.testsRun = {});
	window.testsRun.test3 = true;
}());
moudle.exports = (function() {
	var cache = {};
	return function() {
		return cache;
	}
})();
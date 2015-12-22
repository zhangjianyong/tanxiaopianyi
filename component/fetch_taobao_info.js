var page = null;
var spawn = require('child_process').spawn;
var path = require('path');

moudle.exports = function(phantomjs, params) {
	renderPage(url);
}

var renderPage = function(myurl) {
	page = webpage.create();
	page.onNavigationRequested = function(url, type, willNavigate, main) {
		if (main && url != myurl && url.replace(/\/$/, "") != myurl && (type == "Other" || type == "Undefined")) {
			myurl = url;
			page.close();
			renderPage(url);
		}
	};

	page.open(myurl, function(status) {
		if (status === "success") {
			page.includeJs(path.join(__dirname, '/static/js/lib/jquery-1.11.3.min.js'), function() {
				$('script').each(function(i, e) {
					var THAT = $(this).text();
					if (THAT.search('var g_config') >= 0) {
						eval(THAT);
						console.log(g_config.itemId);
					}
				})
				console.log(page.content);
			})
		} else {
			page.close();
		}
	})
}
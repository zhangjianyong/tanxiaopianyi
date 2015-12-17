var page = require('webpage').create(),
	system = require('system'),
	url,referer;

if (system.args.length === 1) {
	console.log('Usage: loadspeed.js <some URL>');
	phantom.exit();
}
url = system.args[1];
referer = system.args[2];
// page.onConsoleMessage = function(msg) {
// 	console.log('msg ' + msg);
// };
// page.onNavigationRequested = function(url, type, willNavigate, main) {
// 	console.log('Trying to navigate to: ' + url);
// 	// console.log('Will actually navigate: ' + willNavigate);
// }
page.customHeaders={
	'Upgrade-Insecure-Requests':1,
	'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36',

	'Referer':referer
}
// page.onResourceRequested = function(request) {
//   	console.log('Request ' + JSON.stringify(request, undefined, 4));
// };
// page.settings={
// 	'loadImages':false
// 	// 'javascriptEnabled':false
// }
// page.onResourceReceived = function(response) {
//   console.log('Receive ' + JSON.stringify(response, undefined, 4));
// };
// page.onResourceError = function(resourceError) {
//     console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
//     console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
// };

page.open(url, function(status) {
	if (status !== 'success') {
		console.log('Unable to access s.click %s', url);
	} else {
		var sclick = page.evaluate(function() {
			var link = document.querySelector('#exe');
			if (link) {
				var reg = /window.location=('|")?([^'"]+)('|")?/gim;
				// var div = document.createElement('div');
				// div.appendChild(document.createTextNode(reg.exec(link.attributes['onclick'].nodeValue)[2]));
				// return div.innerHTML;
				return reg.exec(link.attributes['onclick'].nodeValue)[2];
			}else{
				return document.title;
			}
		});
		// page.open(sclick, function(status) {
		// 	if (status !== 'success') {
		// 		console.log('Unable to access s.click %s', url);
		// 	} else {
		// 		var itemId = page.evaluate(function() {
		// 			return document.title;
		// 		});
		// 		console.log(itemId);
		// 	}
		// })
	console.log(sclick);
	}
	phantom.exit();
});
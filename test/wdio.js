var webdriverio = require('webdriverio');
var Proxy = require('browsermob-proxy').Proxy;
var proxyHost = 'localhost'
var proxy = new Proxy({
	host: proxyHost,
	port:9090,
	selHost:proxyHost,
	selPort:4445
});
proxy.start([9090],function(err, data) {
	if (!err) {
		// SET AND OVERRIDE HTTP REQUEST HEADERS IF YOU WANT TO 
		var headersToSet = {
			'Referer': 'http://www.1zw.com/'
		}
		proxy.addHeader(data.port, headersToSet, function(err, resp) {
			console.log(data);
			if (!err) {
				proxy.startHAR(data.port, 'http://localhost:9090', function(err, resp) {
					if (!err) {
						// DO WHATEVER WEB INTERACTION YOU WANT USING THE PROXY 
						doSeleniumStuff(proxyHost + ':' + data.port, function() {
							proxy.getHAR(data.port, function(err, resp) {
								if (!err) {
									console.log(resp);
									fs.writeFileSync('output.har', resp, 'utf8');
								} else {
									console.err('Error getting HAR file: ' + err);
								}
								proxy.stop(data.port, function() {});
							});
						});
					} else {
						console.error('Error starting HAR: ' + err);
						proxy.stop(data.port, function() {});
					}
				});
			} else {
				console.error('Error setting the custom headers');
				proxy.stop(data.port, function() {});
			}
		});
	} else {
		console.error('Error starting proxy: ' + err);
	}
});

function doSeleniumStuff(proxy, cb) {
	var options = {
		desiredCapabilities: {
			browserName: 'chrome'
		}
	};

	webdriverio
		.remote(options)
		.init()
		.url('http://s.click.taobao.com/t?e=m%3D2%26s%3DzBIQKBnhFFEcQipKwQzePOeEDrYVVa64qu1K02Mshg63bLqV5UHdqYLEDrgryanEYXyJLYCFAeaTkpIFLqgdLXAXpY9Gs3dhe0V%2Fchf9cUJ2A%2B4a0FMB8RjHU0M1zgUnxqN%2Bmy18aGPfiASwSmIG2H3K1FENUGYp4eiBBe1ZSfn7ld4CGOjU7tyM2aVnO8FrTHSKda6%2BD90%3D')
		.title(function(err, res) {
			console.log('Title was: ' + res.value);
		})
		.end();
}
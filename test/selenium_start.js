var selenium = require('selenium-standalone');

selenium.start(function(err, cp) {
	if (err) {
		console.log(err);
		return;
	}

	cp.stderr.once('data', function() {
		cp.kill();
	});
});
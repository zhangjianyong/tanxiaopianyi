var spawn = require('child_process').spawn;
var fetch = require('fetch_taobao_info');

moudle.exports = function(phantomjs, params) {
	renderPage(url);
}

var snapshot = spawn('phantomjs', ['run_snapshot.js', campaignId]);
snapshot.stdout.on('data', function(data) {
	console.log('stdout: ' + data);
});
snapshot.stderr.on('data', function(data) {
	console.log('stderr: ' + data);
});
snapshot.on('close', function(code) {
	console.log('snapshot exited with code ' + code);
});
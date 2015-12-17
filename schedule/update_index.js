var _request = require('request');
var db = require('../db');
var later = require('later');
var spawn = require('child_process').spawn;
var config = require('../config');
var path = require('path');


var sched_delta = later.parse.cron('0 0/3 * * * ?', true);
later.setInterval(function() {
	free = spawn(path.join(config.coreseek, 'bin/indexer'), ['--config', path.join(config.coreseek, 'etc/csft.conf'), 'tanxiaopianyi_delta', '--rotate']);

	free.stdout.on('data', function(data) {
		// console.log('standard output:\n' + data);
	});

	free.stderr.on('data', function(data) {
		console.log('update index tanxiaopianyi_delta error :\n' + data);
	});

	free.on('exit', function(code, signal) {
		console.log('update index tanxiaopianyi_delta sucessful');
	});
}, sched_delta);

var sched_main = {
	schedules: [{
		h:[2],
		m: [0]
	}]
};
later.setInterval(function() {
	free = spawn(path.join(config.coreseek, 'bin/indexer'), ['--config', path.join(config.coreseek, 'etc/csft.conf'), 'tanxiaopianyi_main', '--rotate']);

	free.stdout.on('data', function(data) {
		// console.log('standard output:\n' + data);
	});

	free.stderr.on('data', function(data) {
		console.log('update index tanxiaopianyi_main error :\n' + data);
	});

	free.on('exit', function(code, signal) {
		console.log('update index tanxiaopianyi_main sucessful');
	});
}, sched_main);
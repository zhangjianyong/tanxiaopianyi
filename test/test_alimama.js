var _request = require('request');
var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path

childProcess.execFile(binPath, [
		path.join(__dirname, 'alimama.js'),
		'http://temai.egou.com/toitem.htm?id=162020',
		'http://temai.egou.com/'
	], function(err, stdout, stderr) {
		// console.log(err);
		console.log(stdout);
		// console.log(stderr);

		// var reg = /(.*)&ref=.*/gim;
		// var url = reg.exec(stdout)[1];
		// _request({
		// 	url: stdout,
		// 	headers: {
		// 		'Referer': 'http://s.click.taobao.com/t_js?tu='+encodeURIComponent(stdout),
		// 		'Host':'s.click.taobao.com'
		// 	},
		// 	timeout: 2000,
		// }, (error, response, body) => {
		// 	if (error) {
		// 		console.log(error);
		// 	} else {
		// 		console.log(body);
		// 	}
		// })
console.log(stdout.substring(0,4));
if(stdout.substring(0,4)=='http'){
		childProcess.execFile(binPath, [
			path.join(__dirname, 'alimama.js'),
			stdout,
			'http://s.click.taobao.com/t_js?tu='+encodeURIComponent(stdout)
		], function(err, stdout, stderr) {
			// console.log(err);
			console.log(stdout);
		})
	}})
	// _request({
	// 	url: 'http://www.1zw.com/item59983.html',
	// 	headers: {
	// 		'Referer': 'http://www.1zw.com/'
	// 	},
	// 	timeout: 2000,
	// }, (error, response, body) => {
	// 	if (error) {
	// 		console.log(error);
	// 		spider.fetch(url_tpl, page, opt);
	// 	} else {
	// 		console.log(body);
	// 	}
	// })
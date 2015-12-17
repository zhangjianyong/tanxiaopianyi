var _request = require('request');
var db = require('../db');
var later = require('later');
var util = require('util');
var cheerio = require('cheerio');

var spider = require('../component/spider')({
	'max_threads': 1,
	'max_try_count': 2
});
var queue = require('../component/queue')({
	'max_size': 100
});

var site_id = 4;

spider.on('fetch', function(url, page, opt) {
	_request({
		url: url,
		timeout: 1000,
	}, (error, response, body) => {
		//切记释放连接
		spider.release();
		var data = {};
		if (error) {
			console.error(error);
			spider.fetch(url, page, opt);
		} else {
			try {
				$ = cheerio.load(body);
				var ps = $("a[class='goods_img good_url']");

				ps.each(function(i, ele) {
					var href = $(this).attr('href');
					if (i > 0) return;
					console.log(href);
					// spooky.start(href);
					// spooky.then(function() {
					// 	console.log(document.title);
					// });
					// spooky.run();
					// _request({
					// 	url: href,
					// 	timeout: 1000,
					// 	headers: {
					// 		'Referer': page
					// 	}
					// }, (error, response, body) => {
					// 	if (error) {
					// 		console.error(error);
					// 	} else {
					// 		if (!response.headers.at_itemid) {

					// 			console.log('error' + url);
					// 			console.log(response);
					// 		} else {
					// 			console.log(response.headers.at_itemid);
					// 		}
					// 	}

					// });
				});
			} catch (e) {
				console.error(e);
			}
		}
	});
});

queue.on('max', function(data) {
	// try {
	// 	db.execute('INSERT IGNORE INTO fetch_item(site_id, item_id, cat_id) VALUES(?, ?, ?) ', [site_id, item_id, cat_id], function(err, rows, fields) {
	// 		if (err) {
	// 			return conn.rollback(function() {
	// 				throw err;
	// 			});
	// 		}
	// 	});
	// } catch (e) {
	// 	console.log(e);
	// }
});

spider.on('end', function() {
	queue.flush();
})

var sched = later.parse.cron('0/10 * * * * ?', true);

// later.setInterval(function() {
// 	"use strict";
// 	var links = [{
// 		'url': 'http://www.1zw.com/cat/1.html',
// 		'cat': '1'
// 	}];

// 	console.info('starting fetch site_id %s', site_id);
// 	links.forEach(function(l) {
// 		spider.fetch(l.url, 1, {
// 			'cat': l.cat
// 		});
// 	});
// }, sched);
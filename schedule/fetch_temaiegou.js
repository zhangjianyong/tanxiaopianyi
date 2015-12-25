var _request = require('request');
var db = require('../db');
var later = require('later');
var util = require('util');
var cheerio = require('cheerio')
var config = require('../config');
var redis = require('ioredis')(config.redis);

var spider = require('../component/spider')({
	'max_threads': 1,
	'max_try_count': 2
});

var site_id = 3;
var renderPage = function(myurl) {
	page = webpage.create();
	page.onNavigationRequested = function(url, type, willNavigate, main) {
		if (main && url != myurl && url.replace(/\/$/, "") != myurl && (type == "Other" || type == "Undefined")) {
			// console.log("\tfollowing " + myurl + " redirect to " + url);
			myurl = url;
			page.close();
			renderPage(url);
		}
	};

	page.open(myurl, function(status) {
		if (status === "success") {
			var title = page.evaluate(function() {
				return document.title;
			});
			console.log(title);
		} else {
			page.close();
		}
	});
}

spider.on('fetch', function(url_tpl, page, opt) {
	var url = util.format(url_tpl, page);
	console.log(url);
	_request({
		url: url,
		timeout: 2000,
	}, (error, response, body) => {
		//切记释放连接
		spider.release();
		var data = {};
		if (error) {
			console.error(error);
			spider.fetch(url_tpl, page, opt);
		} else {
			try {
				$ = cheerio.load(body);
				var ps = $("ul[id=tjp_list] li");

				if (ps.length <= 0) {
					return;
				}

				ps.each(function(i, ele) {
					redis.lpush('temaiegou_cat', [$(this).attr('key'), ].join('\0'));
					var _img = $(this).find('div[class=pic] div[class=pic_img]').first();
					var href = _img.find('a').first().attr('href');
					var pic_url = _img.find('img').first().attr('data-original');
					// renderPage(href);
					// queue.add({
					// 	'item_id': $(this).attr('key'),
					// 	'pic_url': $(this).find('div[class=pic] div[class=pic_img] a img').first().attr('data-original'),
					// 	'cat_id': opt.cat
					// });
				});

				spider.fetch(url_tpl, ++page, opt);
				$("script").each(function(i, ele) {
					var THAT = $(this).text();
					if (THAT.search('deals') >= 0) {
						eval(THAT.replace('_TMH.setDeal({ deals: deals});', '').replace('_TMH.scrollLoad();', ''));
						var items = JSON.parse(deals);
						items.forEach(function(i) {
							// redis.lpush('', );
							// if (i.numIid) {
							// 	queue.add({
							// 		'item_id': i.numIid,
							// 		'pic_url': p.picUrl,
							// 		'cat_id': opt.cat
							// 	});
							// }
						})
					}
				});


			} catch (e) {
				console.error(e);
			}
		}
	});
});

// var insert_sql = 'INSERT IGNORE INTO fetch_item(site_id, item_id, cat_id, pic_url) VALUES(?, ?, ?, ?) ';
// queue.on('max', function(data) {
// 	console.log(data);
// 	try {
// 		db.getConnection(function(err, conn) {
// 			if (err) throw err;
// 			conn.prepare(insert_sql, function(err, statement) {
// 				if (err) throw err;
// 				data.forEach(function(d) {
// 					statement.execute([site_id, d.item_id, d.cat_id, d.pic_url], function(err, rows, fields) {
// 						if (err) throw err;
// 					});
// 				})
// 			})
// 			conn.release();
// 		});
// 	} catch (e) {
// 		console.log(e);
// 	}
// });

// spider.on('end', function() {
// 	queue.flush();
// })

// var sched = later.parse.cron('0/20 * * * * ?', true);
// var sched = {
// 	schedules: [{
// 		m: [06]
// 	}]
// };

// later.setInterval(function() {
// 	"use strict";
// 	var links = [{
// 		'url': 'http://temai.egou.com/nvren/p%d.html',
// 		'cat': '1'
// 	}, {
// 		'url': 'http://temai.egou.com/nanren/p%d.html',
// 		'cat': '2'
// 	}, {
// 		'url': 'http://temai.egou.com/jiaju/p%d.html',
// 		'cat': '3'
// 	}, {
// 		'url': 'http://temai.egou.com/meizhuangnv/p%d.html',
// 		'cat': '4'
// 	}, {
// 		'url': 'http://temai.egou.com/xiebao/xienv/p%d.html',
// 		'cat': '5'
// 	}, {
// 		'url': 'http://temai.egou.com/xiebao/xienan/p%d.html',
// 		'cat': '5'
// 	}, {
// 		'url': 'http://temai.egou.com/xiebao/baobaonv/p%d.html',
// 		'cat': '5'
// 	}, {
// 		'url': 'http://temai.egou.com/xiebao/baobaonan/p%d.html',
// 		'cat': '5'
// 	}, {
// 		'url': 'http://temai.egou.com/shipin/p%d.html',
// 		'cat': '6'
// 	}, {
// 		'url': 'http://temai.egou.com/xiebao/shipin/p%d.html',
// 		'cat': '7'
// 	}, {
// 		'url': 'http://temai.egou.com/xiebao/pidai/p%d.html',
// 		'cat': '7'
// 	}, {
// 		'url': 'http://temai.egou.com/muying/p%d.html',
// 		'cat': '8'
// 	}, {
// 		'url': 'http://temai.egou.com/shuma/p%d.html',
// 		'cat': '9'
// 	}];

// 	console.info('starting fetch site_id %s', site_id);
// 	links.forEach(function(l) {
// 		spider.fetch(l.url, 1, {
// 			'cat': l.cat
// 		});
// 	});
// }, sched);
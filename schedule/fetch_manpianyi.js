var _request = require('request');
var db = require('../db').back;
var config = require('../config');
var redis = require('ioredis')(config.redis);
var later = require('later');
var util = require('util');
var cheerio = require('cheerio')

//按分类抓取商品
var spider = require('../component/spider')({
	'max_threads': 1,
	'max_try_count': 2
});

var site_id = 1;

spider.on('fetch', function(url_tpl, page, opt) {
	var url = util.format(url_tpl, page == 1 ? "" : "_" + page);
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
				var ps = $("li[name=shoucangshows]");

				if (ps.length <= 0) {
					return;
				}
				ps.each(function(i, ele) {
					var title_ele = $(this).find('div[class=goods-box] h5 a').first();
					var href = title_ele.attr('href');
					var title = title_ele.text();

					var site_pid = href.replace('http://jp.manpianyi.com/jump_url.php?id=', '');
					redis.lpush('manpianyi_cat_item', [site_id, site_pid, $(this).attr('key'), opt.cat, $(this).find('div[class=goods-box] div[class=goods-pic] a img').first().attr('data-original'), title].join('\0'));
				});

				spider.fetch(url_tpl, ++page, opt);
				// $("script").each(function(i, ele) {
				// 	var THAT = $(this).text();
				// 	if (THAT.search('jsonobj_all') >= 0) {
				// 		eval(THAT);
				// 		var pages = JSON.parse(jsonobj_all);
				// 		for (var key in pages) {
				// 			pages[key].forEach(function(p) {
				// 				if (p.num_iid) {
				// 					queue.add({
				// 						'item_id': p.num_iid,
				// 						'pic_url': p.img210,
				// 						'cat_id': opt.cat
				// 					});
				// 				}
				// 			})
				// 		}
				// 	}
				// });


			} catch (e) {
				console.error(e);
			}
		}
	});
});

// var sched = later.parse.cron('0/20 * * * * ?', true);
var sched = {
	schedules: [{
		m: [3],
		s: [0]
	}]
};

later.setInterval(function() {
	"use strict";
	var links = [{
		'url': 'http://www.manpianyi.com/nvzhuang%s.html',
		'cat': '1'
	}, {
		'url': 'http://www.manpianyi.com/nanzhuang%s.html',
		'cat': '2'
	}, {
		'url': 'http://www.manpianyi.com/jiaju%s.html',
		'cat': '3'
	}, {
		'url': 'http://www.manpianyi.com/huazhuangpin%s.html',
		'cat': '4'
	}, {
		'url': 'http://www.manpianyi.com/xiebao%s.html',
		'cat': '5'
	}, {
		'url': 'http://www.manpianyi.com/meishi%s.html',
		'cat': '6'
	}, {
		'url': 'http://www.manpianyi.com/peishi%s.html',
		'cat': '7'
	}, {
		'url': 'http://www.manpianyi.com/muying%s.html',
		'cat': '8'
	}, {
		'url': 'http://www.manpianyi.com/shuma%s.html',
		'cat': '9'
	}, {
		'url': 'http://www.manpianyi.com/qita%s.html',
		'cat': '10'
	}];

	console.info('starting fetch site_id %s', site_id);
	links.forEach(function(l) {
		spider.fetch(l.url, 1, {
			'cat': l.cat
		});
	});
}, sched);


/*抓取商品排序*/
var spider_order = require('../component/spider')({
	'max_threads': 1,
	'max_try_count': 2
});
var queue_order = require('../component/queue')({
	'max_size': 100
});

spider_order.on('fetch', function(url_tpl, page, opt) {
	var url = util.format(url_tpl, page == 1 ? "" : "_" + page);
	console.log(url);
	_request({
		url: url,
		timeout: 2000,
	}, (error, response, body) => {
		//切记释放连接
		spider_order.release();
		var data = {};
		if (error) {
			console.error(error);
			spider_order.fetch(url_tpl, page, opt);
		} else {
			try {
				$ = cheerio.load(body);
				var ps = $("li[name=shoucangshows]");

				if (ps.length <= 0) {
					return;
				}
				var rank = (page - 1) * 299;
				ps.each(function(i, ele) {
					var href = $(this).find('div[class=goods-box] div[class=goods-pic] a').first().attr('href');
					var site_pid = href.replace('http://jp.manpianyi.com/jump_url.php?id=', '');
					queue_order.add({
						'item_id': $(this).attr('key'),
						'site_pid': site_pid,
						'rank': ++rank
					});
				});


				// $("script").each(function(i, ele) {
				// 	var THAT =
				// 		$(this).text();
				// 	if (THAT.search('jsonobj_all') >= 0) {
				// 		eval(THAT);
				// 		var pages = JSON.parse(jsonobj_all);
				// 		for (var key in pages) {
				// 			pages[key].forEach(function(p) {
				// 				if (p.num_iid) {
				// 					queue_order.add({
				// 						'item_id': p.num_iid
				// 					});
				// 				}
				// 			})
				// 		}
				// 	}
				// });
				spider_order.fetch(url_tpl, ++page, opt);

			} catch (e) {
				console.error(e);
			}
		}
	});
});

var update_sql = 'UPDATE fetch_item SET rank = ? WHERE site_id = ? AND item_id = ?';
queue_order.on('max', function(data) {
	try {
		db.getConnection(function(err, conn) {
			if (err) throw err;
			conn.prepare(update_sql, function(err, statement) {
				if (err) throw err;
				data.forEach(function(d) {
					statement.execute([d.rank, site_id, d.item_id], function(err, rows, fields) {
						if (err) throw err;
					});
				})
			})
			conn.release();
		});
	} catch (e) {
		console.log(e);
	}
});

spider_order.on('end', function() {
	queue_order.flush();
})

// var sched = later.parse.cron('0/20 * * * * ?', true);
var sched = {
	schedules: [{
		m: [07]
	}]
};

later.setInterval(function() {
	"use strict";
	var links = [{
		'url': 'http://www.manpianyi.com/index%s.html'
	}];

	console.info('starting fetch site_id %s', site_id);
	links.forEach(function(l) {
		spider_order.fetch(l.url, 1, {});
	});
}, sched);
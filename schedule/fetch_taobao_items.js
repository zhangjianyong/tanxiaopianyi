var _request = require('request');
var db = require('../db').back;
var later = require('later');
var util = require('util');
var redis = require('ioredis')('redis://:1qazxsw23edc@202.85.215.47:6379/0');
var spider = require('../component/spider')({
	'max_threads': 5,
	'max_try_count': 1
});

// var queue = require('../component/queue')({
// 	'max_size': 2000
// });

spider.on('fetch', function(url_tpl, page, opt) {
	var url = util.format(url_tpl, page);
	var activity_id = opt.act;
	var act_begin_time = opt.act_begin_time;
	var act_end_time = opt.act_end_time;
	var share_rate = opt.share_rate;
	_request({
		url: url,
		timeout: 3000
	}, (error, response, body) => {
		//切记释放连接
		spider.release();
		var data = {};
		if (error) {
			console.error(url + ":" + error);
			spider.fetch(url_tpl, page, opt);
		} else {
			try {
				data = JSON.parse(body);

				data.data.result.forEach(function(d) {
					redis.lpush('alimama_act_item', [activity_id, d.itemId, d.itemTitle, d.sellerId, d.picUrl, d.commissionRate, (d.isSoldOut == true ? 1 : 0), d.discountPrice * 100, d.auctionPrice * 100, d.discountRate * 100, d.soldQuantity, (d.mall == true ? 1 : 0), share_rate, act_begin_time, act_end_time].join('\0'));
					if (data.data.hasNext == 1) {
						spider.fetch(url_tpl, ++page, opt);
					}
				});
			} catch (e) {
				console.error(e);
			}
		};

	})
})

/*更新已抓取商品的价格,销量等及抓取未收入的商品*/
// var sched = {
// 	schedules: [{
// 		m: [25],
// 		s: [0]
// 	}, {
// 		h: [19],
// 		m: [30]
// 	}]
// };
var sched = later.parse.cron('0 18 * * * ?', true);

var rows = 1000;

var format = function(time) {
	return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate();
}
later.setInterval(function() {
	"use strict";

	if (!spider.isStop()) {
		console.log('alimama item is fetching, this fetch is skip.')
		return;
	}
	var perPageSize = 1000;
	//重置抓取数组
	var act_link_tpl = 'http://temai.taobao.com/event/items.json?toPage=%s&perPageSize=%d&isPreview=1&id=%d';

	/*统计当前有效的活动的数量*/
	db.query('SELECT count(*) c FROM alimama_activity WHERE `status` = ? AND now() >= begin_time AND DATE_ADD(NOW(), INTERVAL -15 DAY) <= end_time ', ['normal'], function(err, act_count, fields) {
		if (err) {
			console.log(err);
			return;
		}
		console.info('load alimama valid activity amount: %d', act_count[0].c);
		var load_act_times = Math.ceil(act_count[0].c / rows);

		for (let i = 0; i <= load_act_times; i++) {
			db.query('SELECT * FROM alimama_activity WHERE `status` = ? AND now() >= begin_time AND DATE_ADD(NOW(), INTERVAL -15 DAY) <= end_time LIMIT ?, ?', ['normal', i * rows, rows], function(err, acts, fields) {
				acts.forEach(function(act) {
					spider.fetch(util.format(act_link_tpl, '%d', perPageSize, act.activity_id), 1, {
						'act': act.activity_id,
						'act_begin_time': format(act.begin_time),
						'act_end_time': format(act.end_time),
						'share_rate': act.share_rate
					});
				});
			});
		};
	});
}, sched);
var _request = require('request');
var db = require('../db').back;
var config = require('../config');
var redis = require('ioredis')(config.redis);
var later = require('later');
var util = require('util');
var spider = require('../component/spider')({
	'max_threads': 5,
	'max_try_count': 2
});
spider.on('fetch', function(url_tpl, page, opt) {
	var url = util.format(url_tpl, page);
	var activity_id = opt.act;
	var ali_pid = opt.pid;
	_request({
		url: url,
		timeout: 5000,
	}, (error, response, body) => {
		//切记释放连接
		spider.release();
		var data = {};
		if (error) {
			console.error(url, error);
			spider.fetch(url_tpl, page, opt);
		} else {
			try {
				data = JSON.parse(body);
				var find = false;
				var result = data.data.result;
				for (var i = 0; i < result.length; i++) {
					var r = result[i];
					if (r.itemId == opt.item_id) {
						redis.lpush('generate_pid_url', [opt.product_id, opt.activity_id, opt.item_id, opt.ali_pid, r.href].join('\0'));
						find = true;
						break;
					}
				}
				if (data.data.hasNext == 1 && !find) {
					spider.fetch(url_tpl, ++page, opt);
				}
			} catch (e) {
				console.error(e);
			}
		}
	});
});

var sched = later.parse.cron('0/10 * * * * ?', true);
// var sched = {
// 	schedules: [{
// 		m: [18]
// 	}]
// };
later.setInterval(function() {
	if (!spider.isStop()) {
		console.log('generate_pid_url is running.');
		return;
	}
	console.log('start generate_pid_url.');
	var act_link_tpl = 'http://temai.taobao.com/event/items.json?toPage=%s&perPageSize=%d&catId=&tagId=&pid=%s&unid=&platformType=&isPreview=0&id=%d';
	try {
		db.query('SELECT p.id, p.`item_id`, p.`activity_id`, a.`ali_pid` FROM product p, alimama_pid a WHERE NOT EXISTS (SELECT ali_pid FROM product_url pu WHERE pu.product_id = id AND pu.ali_pid = ali_pid)', function(err, rows, fields) {
			if (err) {
				throw err;
			}
			if (!rows) {
				return;
			}
			rows.forEach(function(i) {
				spider.fetch(util.format(act_link_tpl, '%d', 1000, i.ali_pid, i.activity_id), 1, {
					'activity_id': i.activity_id,
					'ali_pid': i.ali_pid,
					'item_id': i.item_id,
					'product_id': i.id
				});
			});
		})
	} catch (e) {
		console.log(e);
	}
}, sched);
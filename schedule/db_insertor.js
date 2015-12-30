'use strict'
var config = require('../config');
var redis = require('ioredis')(config.redis);
var later = require('later');
var db = require('../db').back;
var util = require('util');

var running_threads_count = 0,
	max_threads_count = 10,
	running_jobs = [],
	jobs = [{
		des: '淘宝鹊桥商品入库',
		name: 'alimama_act_item',
		do: 'INSERT INTO alimama_act_item(activity_id, item_id, item_title, seller_id, pic_url, commission_rate, is_sold_out, discount_price, auction_price, discount_rate, sold_quantity, is_mall, share_rate, act_begin_time, act_end_time, create_time) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null) ON DUPLICATE KEY UPDATE is_sold_out = ? , discount_price = ? , auction_price = ? , discount_rate = ? , sold_quantity = ?',
		transform: function(data) {
			data.push(data[6], data[7], data[8], data[9], data[10]);
			return data;
		},
		threads: 10,
		stat:'on'
	}, {
		des: '淘宝鹊桥活动入库',
		name: 'alimama_act',
		do: 'INSERT IGNORE INTO alimama_activity(activity_id, title, comments, share_rate, avg_commission, begin_time, end_time, last_modify) VALUES(?, ?, ?, ?, ?, ?, ?, null)',
		transform: function(data) {
			return data;
		},
		threads: 5,
		stat:'on'
	}, {
		des: '生成链接入库',
		name: 'generate_pid_url',
		do: 'INSERT IGNORE INTO product_url(product_id, activity_id, item_id, ali_pid, url, create_time) VALUES(?, ?, ?, ?, ?, null)',
		transform: function(data) {
			return data;
		},
		threads: 2,
		stat:'on'
	}, {
		des: 'manpianyi分类抓取入库',
		name: 'manpianyi_cat_item',
		do: 'INSERT IGNORE INTO fetch_item(site_id, site_pid, item_id, cat_id, pic_url, title) VALUES(?, ?, ?, ?, ?, ?) ',
		transform: function(data) {
			return data;
		},
		threads: 2,
		stat:'on'
	}, {
		des: 'manpianyi位置抓取入库',
		name: 'manpianyi_pos_item',
		do: 'UPDATE fetch_item SET rank = ? WHERE site_id = ? AND item_id = ?',
		transform: function(data) {
			return data;
		},
		threads: 2,
		stat:'on'
	}, {
		des: '抓取商品转入product表',
		name: 'pick_item_to_product',
		do: function(data, cb) {
			db.query('SELECT * FROM alimama_act_item WHERE item_id = ? AND act_begin_time <= curdate() AND curdate() <= DATE_ADD(act_end_time,INTERVAL 15 DAY) ORDER BY commission_rate*share_rate desc LIMIT 0,1', [data[0]], function(err, acts, fields) {
				if (err) throw err;
				if (!acts) return;
				var a = acts[0];
				if (!a) return;
				a.item_title = data[3];
				a.cat_id = data[1];
				a.rank = data[2];
				a.pic_url = data[4];
				// console.log(item);
				var rank = parseInt(a.rank * a.commission_rate * a.share_rate / 1000000);
				db.query('INSERT INTO product(activity_id, item_id, title, ori_pic_url, commission_rate, share_rate, is_sold_out, discount_price, auction_price, discount_rate, sold_quantity, shop_id, shop_name, p_shop_id, p_shop_name, act_begin_time, act_end_time, cat_id, rank, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE activity_id = ?, commission_rate = ?, share_rate = ?, is_sold_out = ?, discount_price = ?, auction_price = ?, discount_rate = ?, sold_quantity = ?, act_begin_time = ?, act_end_time = ?, cat_id = ?, rank = ?, last_modify = ?', [a.activity_id, a.item_id, a.item_title, a.pic_url, a.commission_rate, a.share_rate, a.is_sold_out, a.discount_price, a.auction_price, a.discount_rate, a.sold_quantity, 0, 's', (a.is_mall == 1 ? 2 : 1), (a.is_mall == 1 ? '天猫' : '淘宝'), a.act_begin_time, a.act_begin_time, a.cat_id, rank, null, a.activity_id, a.commission_rate, a.share_rate, a.is_sold_out, a.discount_price, a.auction_price, a.discount_rate, a.sold_quantity, a.act_begin_time, a.act_begin_time, a.cat_id, rank, null], function(err, rows, fields) {
					if (err) throw err;
					cb();
				});
			});
		},
		threads: 5,
		stat:'off'
	}];

var run = function(job) {
	// console.log('job %s next task', job.name);
	redis.rpop(job.name, function(err, data) {
		if (err) throw err;
		if (data == null) {
			running_jobs[job.name]='finished';
			return;
		}
		var _data = data.split('\0');
		if (util.isString(job.do)) {
			db.query(job.do, job.transform(_data), function(err, rows, fields) {
				if (err) {
					console.log(job, err, _data);
				}
				run(job);
			})
		} else if (util.isFunction(job.do)) {
			job.do(_data, function(){
				run(job);
			});
		} else {
			console.log('error type');
		}

	});
}
var running_jobs = {};
later.setInterval(function() {
	jobs.forEach(function(j) {
		var rj = running_jobs[j.name];
		if (j.stat == 'on' && (!rj || rj.status == 'finished')) {
			console.log('job %s start',j.name);
			running_jobs[j.name] = 'running';
			for (var i = 0; i < (j.threads || 1); i++) {
				run(j);
			}
		}
	})
}, later.parse.cron('0/10 * * * * ?', true));
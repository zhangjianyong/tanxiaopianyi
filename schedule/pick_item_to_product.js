'use strict'
var _request = require('request');
var db = require('../db').back;
var later = require('later');

// var sched = later.parse.cron('0 0/30 * * * ?', true);
var sched = {
	schedules: [{
		m: [18]
	}]
};
later.setInterval(function() {
	try {
		console.log('pick item to product start')
		db.getConnection(function(err, conn) {
			conn.execute('SELECT fi.item_id, fi.cat_id, fi.rank, fi.title, fi.pic_url FROM fetch_item fi, fetch_website fw WHERE fi.site_id = fw.id ORDER BY fw.weight', function(err, rows, fields) {
				var items = {};
				if(err || rows.length==0){
					console.log('fetch_item empty',err);
					return;
				}
				rows.forEach(function(r) {
					let i = items[r.item_id];
					if (!i) {
						r.rank = 10000- r.rank;
						items[r.item_id] = r;
					} else {
						i.rank += 50;
					}
				})
				// console.log(items);
				// console.log('pick %d items', items.length);
				for (let i in items) {
					conn.execute('SELECT * FROM alimama_act_item WHERE item_id = ? AND act_begin_time <= curdate() AND curdate() <= DATE_ADD(act_end_time,INTERVAL 15 DAY) ORDER BY commission_rate*share_rate desc LIMIT 0,1', [i], function(err, acts, fields) {
						var a = acts[0];
						if (!a) return;
						let item = items[i];
						a.item_title = item.title;
						a.cat_id = item.cat_id;
						a.rank = item.rank;
						a.pic_url = item.pic_url;
						// console.log(item);
						var rank = parseInt(a.rank*a.commission_rate*a.share_rate/1000000);
						conn.execute('INSERT INTO product(activity_id, item_id, title, ori_pic_url, commission_rate, share_rate, is_sold_out, discount_price, auction_price, discount_rate, sold_quantity, shop_id, shop_name, p_shop_id, p_shop_name, act_begin_time, act_end_time, cat_id, rank, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE activity_id = ?, commission_rate = ?, share_rate = ?, is_sold_out = ?, discount_price = ?, auction_price = ?, discount_rate = ?, sold_quantity = ?, act_begin_time = ?, act_end_time = ?, cat_id = ?, rank = ?, last_modify = ?', [a.activity_id, a.item_id, a.item_title, a.pic_url, a.commission_rate, a.share_rate, a.is_sold_out, a.discount_price, a.auction_price, a.discount_rate, a.sold_quantity, 0, 's', (a.is_mall == 1 ? 2 : 1), (a.is_mall == 1 ? '天猫' : '淘宝'), a.act_begin_time, a.act_begin_time, a.cat_id, rank, null, a.activity_id, a.commission_rate, a.share_rate, a.is_sold_out, a.discount_price, a.auction_price, a.discount_rate, a.sold_quantity, a.act_begin_time, a.act_begin_time, a.cat_id, rank, null], function(err, rows, fields) {
							if (err) {
								throw err;
							}
						});
					});
				}
				conn.release();
			})
		})
	} catch (e) {
		console.log(e);
	}
}, sched);
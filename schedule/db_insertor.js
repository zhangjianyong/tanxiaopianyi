var config = require('../config');
var redis = require('ioredis')(config.redis);
var later = require('later');
var db = require('../db').back;
var pop = function(queue, cb, count) {
	redis.rpop(queue, function(err, l) {
		if (l && l != null) {
			cb(l);
			++count[0];
			pop(queue, cb, count);
		} else {
			console.log('insert %s to db end: %d', queue, count[0]);
			count[0] = 0;
		}
	});
};
//淘宝鹊桥商品入库
var alimama_act_item_count = [0];
var alimama_act_item = function() {
	if (alimama_act_item_count[0] > 0) {
		console.log('insert alimama_act_item to db is running. count %d', alimama_act_item_count[0]);
		return;
	}
	console.log('insert alimama_act_item to db start');
	var insert_sql = 'INSERT INTO alimama_act_item(activity_id, item_id, item_title, seller_id, pic_url, commission_rate, is_sold_out, discount_price, auction_price, discount_rate, sold_quantity, is_mall, share_rate, act_begin_time, act_end_time, create_time) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null) ON DUPLICATE KEY UPDATE is_sold_out = ? , discount_price = ? , auction_price = ? , discount_rate = ? , sold_quantity = ? ';
	try {
		db.getConnection(function(err, conn) {
			conn.prepare(insert_sql, function(err, statement) {
				if (err) {
					throw err;
				}
				pop('alimama_act_item', function(data) {
					var d = data.split('\0');
					d.push(d[6], d[7], d[8], d[9], d[10]);
					statement.execute(d, function(err, rows, fields) {
						if (err) {
							console.log(err, d);
						}
					});
				}, alimama_act_item_count);
			})
			conn.release();
		});
	} catch (e) {
		console.log(e);
	}
}
later.setInterval(alimama_act_item, later.parse.cron('0 0/3 * * * ?', true));


//manpianyi商品入库
var manpianyi_cat_item_count = [0];
var manpianyi_cat_item = function() {
	if (manpianyi_cat_item_count[0] > 0) {
		console.log('insert manpianyi_cat_item to db is running. count %d', manpianyi_cat_item_count[0]);
		return;
	}
	console.log('insert manpianyi_cat_item to db start');
	var insert_sql = 'INSERT IGNORE INTO fetch_item(site_id, site_pid, item_id, cat_id, pic_url, title) VALUES(?, ?, ?, ?, ?, ?) ';
	try {
		db.getConnection(function(err, conn) {
			conn.prepare(insert_sql, function(err, statement) {
				if (err) {
					throw err;
				}
				pop('manpianyi_cat_item', function(data) {
					var d = data.split('\0');
					statement.execute(d, function(err, rows, fields) {
						if (err) {
							console.log(err, d);
						}
					});
				}, manpianyi_cat_item_count);
			})
			conn.release();
		});
	} catch (e) {
		console.log(e);
	}
}
later.setInterval(manpianyi_cat_item, later.parse.cron('0 0/3 * * * ?', true));

//对应pid生成的链接入库
var generate_pid_url_count = [0];
var generate_pid_url = function() {
	if (generate_pid_url_count > 0) {
		console.log('insert generate_pid_url to db is running. count %d', generate_pid_url_count[0]);
		return;
	}
	console.log('insert generate_pid_url to db start');
	var insert_sql = 'INSERT IGNORE INTO product_url(product_id, activity_id, item_id, ali_pid, url, create_time) VALUES(?, ?, ?, ?, ?, null)';
	try {
		db.getConnection(function(err, conn) {
			conn.prepare(insert_sql, function(err, statement) {
				if (err) {
					throw err;
				}
				pop('generate_pid_url', function(data) {
					var d = data.split('\0');
					statement.execute(d, function(err, rows, fields) {
						if (err) {
							console.log(err, d);
						}
					});
				}, generate_pid_url_count);
			})
			conn.release();
		});
	} catch (e) {
		console.log(e);
	}
}
later.setInterval(generate_pid_url, later.parse.cron('0 0/3 * * * ?', true));

//淘宝鹊桥活动入库
var alimama_act_count = [0];
var alimama_act = function() {
	if (alimama_act_count > 0) {
		console.log('insert alimama_act to db is running. count %d', alimama_act_count[0]);
		return;
	}
	console.log('insert alimama_act to db start');
	var insert_sql = 'INSERT IGNORE INTO alimama_activity(activity_id, title, comments, share_rate, avg_commission, begin_time, end_time, last_modify) VALUES(?, ?, ?, ?, ?, ?, ?, null)';
	try {
		db.getConnection(function(err, conn) {
			conn.prepare(insert_sql, function(err, statement) {
				if (err) {
					throw err;
				}
				pop('alimama_act', function(data) {
					var d = data.split('\0');
					statement.execute(d, function(err, rows, fields) {
						if (err) {
							console.log(err, d);
						}
					});
				}, alimama_act_count);
			})
			conn.release();
		});
	} catch (e) {
		console.log(e);
	}
}
later.setInterval(alimama_act, later.parse.cron('0 0/1 * * * ?', true));
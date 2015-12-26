var config = require('../config');
var redis = require('ioredis')(config.redis);
var later = require('later');
var db = require('../db').back;

var running_threads_count = 0,
	max_threads_count = 10,
	running_jobs = [],
	jobs = [{
		des: '淘宝鹊桥商品入库',
		name: 'alimama_act_item',
		sql: 'INSERT INTO alimama_act_item(activity_id, item_id, item_title, seller_id, pic_url, commission_rate, is_sold_out, discount_price, auction_price, discount_rate, sold_quantity, is_mall, share_rate, act_begin_time, act_end_time, create_time) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null) ON DUPLICATE KEY UPDATE is_sold_out = ? , discount_price = ? , auction_price = ? , discount_rate = ? , sold_quantity = ?',
		transform: function(data) {
			data.push(data[6], data[7], data[8], data[9], data[10]);
			return data;
		}
	}, {
		des: '淘宝鹊桥活动入库',
		name: 'alimama_act',
		sql: 'INSERT IGNORE INTO alimama_activity(activity_id, title, comments, share_rate, avg_commission, begin_time, end_time, last_modify) VALUES(?, ?, ?, ?, ?, ?, ?, null)',
		transform: function(data) {
			return data;
		}
	}, {
		des: '生成链接入库',
		name: 'generate_pid_url',
		sql: 'INSERT IGNORE INTO product_url(product_id, activity_id, item_id, ali_pid, url, create_time) VALUES(?, ?, ?, ?, ?, null)',
		transform: function(data) {
			return data;
		}
	}, {
		des: 'manpianyi分类抓取入库',
		name: 'manpianyi_cat_item',
		sql: 'INSERT IGNORE INTO fetch_item(site_id, site_pid, item_id, cat_id, pic_url, title) VALUES(?, ?, ?, ?, ?, ?) ',
		transform: function(data) {
			return data;
		}
	}, {
		des: 'manpianyi位置抓取入库',
		name: 'manpianyi_pos_item',
		sql: 'UPDATE fetch_item SET rank = ? WHERE site_id = ? AND item_id = ?',
		transform: function(data) {
			return data;
		}
	}];
// var run = function() {
// 	for (var c = 0, r = 0; c < (r = max_threads_count - running_threads_count); ++running_threads_count) {
// 		try {
// 			var index = r % jobsArray.length;
// 			var jname = jobsArray[index];
// 			// console.log('%s job start', j.name);
// 			if (j.isFinished == 1) {
// 				if (j.threads <= 0) {
// 					console.log('%s job finished: %d items', jname, j.count);
// 					running_jobs.splice(index, 1);
// 					--running_threads_count;
// 					continue;
// 				}
// 			} else {
// 				j.threads += 1;
// 			}

// 			redis.rpop(jname, function(err, data) {
// 				--running_threads_count;
// 				var job = jobs[jname];
// 				job.threads -= 1;
// 				if (err) {
// 					throw err;
// 				}
// 				if (data == null) {
// 					job.isFinished = 1;
// 					run();
// 					return;
// 				}
// 				var _data = data.split('\0');
// 				job.count += 1;
// 				db.query(job.sql, job.transform(_data), function(err, rows, fields) {
// 					// console.log(_data);
// 					// console.log('%s job next %d', j.name, count);
// 					if (err) {
// 						console.log(job, err, _data);
// 					}
// 					run();
// 				})
// 			});
// 		} catch (e) {
// 			console.log(e);
// 		}
// 	}
// }
var run = function(job) {
	redis.rpop(job.name, function(err, data) {
		if (err) throw err;
		if (data == null) return;
		var _data = data.split('\0');
		db.query(job.sql, job.transform(_data), function(err, rows, fields) {
			if (err) {
				console.log(job, err, _data);
			}
			console.log(job);
			run(job);
		})
	});
}
later.setInterval(function() {
	jobs.forEach(function(j){
		j.count || 0;
		run(j);
	})
}, later.parse.cron('0/10 * * * * ?', true))
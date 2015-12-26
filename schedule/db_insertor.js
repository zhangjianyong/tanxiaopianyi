var config = require('../config');
var redis = require('ioredis')(config.redis);
var later = require('later');
var db = require('../db').back;

var running_threads_count = 0,
	max_threads_count = 10,
	running_jobs = [],
	jobs = {};
jobs['alimama_act_item'] = {
	des: '淘宝鹊桥商品入库',
	sql: 'INSERT INTO alimama_act_item(activity_id, item_id, item_title, seller_id, pic_url, commission_rate, is_sold_out, discount_price, auction_price, discount_rate, sold_quantity, is_mall, share_rate, act_begin_time, act_end_time, create_time) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null) ON DUPLICATE KEY UPDATE is_sold_out = ? , discount_price = ? , auction_price = ? , discount_rate = ? , sold_quantity = ?',
	transform: function(data) {
		data.push(data[6], data[7], data[8], data[9], data[10]);
		return data;
	}
};
jobs['alimama_act'] = {
	des: '淘宝鹊桥活动入库',
	sql: 'INSERT IGNORE INTO alimama_activity(activity_id, title, comments, share_rate, avg_commission, begin_time, end_time, last_modify) VALUES(?, ?, ?, ?, ?, ?, ?, null)',
	transform: function(data) {
		return data;
	}
};
jobs['generate_pid_url'] = {
	des: '生成链接入库',
	sql: 'INSERT IGNORE INTO product_url(product_id, activity_id, item_id, ali_pid, url, create_time) VALUES(?, ?, ?, ?, ?, null)',
	transform: function(data) {
		return data;
	}
};
jobs['manpianyi_cat_item'] = {
	des: 'manpianyi分类抓取入库',
	sql: 'INSERT IGNORE INTO fetch_item(site_id, site_pid, item_id, cat_id, pic_url, title) VALUES(?, ?, ?, ?, ?, ?) ',
	transform: function(data) {
		return data;
	}
};
jobs['manpianyi_pos_item'] = {
	des: 'manpianyi位置抓取入库',
	sql: 'UPDATE fetch_item SET rank = ? WHERE site_id = ? AND item_id = ?',
	transform: function(data) {
		return data;
	}
};
var run = function() {
	for (var c = 0, r = 0; c < (r = max_threads_count - running_threads_count); ++running_threads_count) {
		try {
			var index = r % running_jobs.length;
			var jname = running_jobs[index];
			var j = jobs[jname];
			// console.log('%s job start', j.name);
			if (j.isFinished == 1) {
				if (j.threads <= 0) {
					console.log('%s job finished: %d items', jname, j.count);
					running_jobs.splice(index, 1);
					--running_threads_count;
					continue;
				}
			} else {
				j.threads += 1;
			}

			redis.rpop(jname, function(err, data) {
				--running_threads_count;
				var job = jobs[jname];
				job.threads -= 1;
				if (err) {
					console.log(err);
				}
				if (data == null) {
					job.isFinished = 1;
					run();
					return;
				}
				var _data = data.split('\0');
				var count = job.count += 1;
				db.query(job.sql, job.transform(_data), function(err, rows, fields) {
					// console.log(_data);
					// console.log('%s job next %d', j.name, count);
					if (err) {
						console.log(jname, err, _data);
					}
					run();
				})
			});
		} catch (e) {
			console.log(e);
		}
	}
}

later.setInterval(function() {
	for(var key in jobs){
		var j = jobs[key];
		if (running_jobs.indexOf(key) == -1) {
			j.count = j.threads = j.isFinished = 0;
			running_jobs.push(key);
		}
	}
	if (running_threads_count == 0) {
		run();
	}
}, later.parse.cron('0/10 * * * * ?', true))
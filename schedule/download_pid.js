var _request = require('request');
var db = require('../db').back;
var later = require('later');
var config = require('../config');
var path = require('path');

// var sched = later.parse.cron('0 0/3 * * * ?', true);
// later.setInterval(function() {
// 	db.query('SELECT id, ori_pic FROM product WHERE pic_url is null', function(err, prds, fields) {
// 		if (err) {
// 			console.log(err);
// 			return;
// 		}
// 		prds.forEach(function(act) {
// 			spider.fetch(util.format(act_link_tpl, '%d', perPageSize, act.activity_id), 1, {
// 				'act': act.activity_id,
// 				'act_begin_time': act.begin_time,
// 				'act_end_time': act.end_time,
// 				'share_rate': act.share_rate
// 			});
// 		});
// 	});
// }, sched);
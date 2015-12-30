'use strict'
var _request = require('request');
var db = require('../db');
var later = require('later');
var config = require('../config');
var redis = require('ioredis')(config.redis);

var running = false;
var sched = later.parse.cron('0 0/1 * * * ?', true);

later.setInterval(function() {
	try {
		if (running) {
			console.log('pick item to product is running');
		} else {
			running = true;
			console.log('pick item to product start');
		}

		db.query('SELECT fi.item_id, fi.cat_id, fi.rank, fi.title, fi.pic_url FROM fetch_item fi, fetch_website fw WHERE fi.site_id = fw.id ORDER BY fw.weight', function(err, rows, fields) {
			if (err) {
				throw err;
			}
			if (!rows) {
				return;
			}
			var items = {};
			rows.forEach(function(r) {
				let i = items[r.item_id];
				if (!i) {
					r.rank = 10000 - r.rank;
					items[r.item_id] = r;
				} else {
					i.rank += 50;
				}
				
			});
			for(let id in items){
				let it = items[id];
				redis.lpush('pick_item_to_product', [it.item_id, it.cat_id, it.rank, it.title, it.pic_url].join('\0'));
			}
			running = false;
		});
		// })
	} catch (e) {
		console.log(e);
	}
}, sched);
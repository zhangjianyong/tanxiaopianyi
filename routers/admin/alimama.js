'use strict'

var querystring = require('querystring');
var db = require('../../db');

var router = require('koa-router')({
	prefix: '/admin'
});


module.exports = router;
/**
 *alimama活动列表
 **/
router.get('/alimama_activity_list', function*(next) {
	var css = ['/admin/css/jquery-ui-1.10.3.full.min.css', '/admin/css/datepicker.css', '/admin/css/ui.jqgrid.css']
	var js = ['/admin/js/alimama_activity_list.js'];
	yield this.render('/admin/alimama_activity_list', {
		'js': js,
		'css': css
	});
});

/**
 *alimama活动列表接口
 */
router.get('/i/alimama_activity_list', function*(next) {
	var params = querystring.parse(this.querystring);

	var page = parseInt(params.page) || 1;
	var rows = parseInt(params.rows) || 20;

	var promise = [];

	promise.push(new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT count(*) c FROM alimama_activity',
			timeout: 1000
		}, function(err, count, fields) {
			if (err) {
				reject(err);
			}
			resolve(count);
		});
	}));

	promise.push(new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT * FROM alimama_activity LIMIT ?, ?',
			timeout: 1000
		}, [(page - 1) * rows, rows], function(err, data, fields) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	}));

	var result = yield Promise.all(promise).then(function(data) {
		return data;
	});

	yield this.body = {
		'total': result[0][0]['c'],
		'page': page,
		'records': rows.length,
		'rows': result[1]
	};

});

/**
 *alimama商品列表
 */
router.get('/alimama_item_list', function*(next) {
	var js = ['/admin/js/jquery.colorbox-min.js', '/js/lib/template.js', '/admin/js/alimama_item_list.js'];
	var css = ['/admin/css/colorbox.css'];
	yield this.render('/admin/alimama_item_list', {
		'js': js,
		'css': css
	});
});

/**
 *alimama商品列表接口
 */
router.get('/i/alimama_item_list', function*(next) {
	var params = querystring.parse(this.querystring);

	var page = parseInt(params.page) || 1;
	var rows = parseInt(params.rows) || 20;

	var promise = [];

	promise.push(new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT item_id,item_title,pic_url,is_mall FROM alimama_act_item GROUP BY item_id LIMIT ?, ?',
			timeout: 1000
		}, [(page - 1) * rows, rows], function(err, data, fields) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	}));

	var result = yield Promise.all(promise).then(function(data) {
		return data;
	});

	yield this.body = result[0];

});

/**
 *alimama商品鹊桥详情
 */
router.get('/alimama_item', function*(next) {
	var params = querystring.parse(this.querystring);
	var item_id = params.item_id;
	if (!item_id) {
		return;
	}
	var promise = [];

	promise.push(new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT a.activity_id, a.title, a.begin_time, a.end_time, a.share_rate, ai.item_id, ai.seller_id, ai.commission_rate, ai.auction_price, ai.discount_price, ai.discount_rate, ai.sold_quantity, ai.is_sold_out, ai.is_mall, ai.create_time, ai.last_modify FROM alimama_act_item ai LEFT JOIN alimama_activity a ON ai.activity_id = a.activity_id WHERE item_id = ?',
			timeout: 1000
		}, [item_id], function(err, data, fields) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	}));

	var result = yield Promise.all(promise).then(function(data) {
		return data;
	});

	var js = ['/admin/js/jquery.colorbox-min.js', '/js/lib/template.js', '/admin/js/alimama_item_list.js'];
	var css = ['/admin/css/colorbox.css'];
	yield this.render('/admin/alimama_item', {
		'js': js,
		'css': css,
		'items': result[0]
	});

});

/**
 *加鹊桥商品到商品库中
 *但状态为'前台不展示'态
 */
router.get('/i/alimama_product_add', function*(next) {
	var params = querystring.parse(this.querystring);
	var item_id = params.item_id;
	var act_id = params.act_id;
	if (!item_id || !act_id) {
		return;
	}

	var promise = [];

	var item = yield new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT * FROM alimama_act_item WHERE item_id = ? and activity_id = ?',
			timeout: 1000
		}, [item_id, act_id], function(err, data, fields) {
			if (err || !data) {
				reject(err);
			}
			resolve(data[0]);
		});
	});

	var act = yield new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT * FROM alimama_activity WHERE activity_id = ?',
			timeout: 1000
		}, [act_id], function(err, act, fields) {
			if (err || !act) {
				reject(err);
			}
			resolve(act[0]);
		});
	});

	var urls = yield new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT * FROM alimama_act_item_pid_url WHERE activity_id = ? and item_id = ?',
			timeout: 1000
		}, [item.activity_id, item.item_id], function(err, urls, fields) {
			if (err || !act) {
				reject(err);
			}
			resolve(urls);
		});
	});


	var result = yield new Promise((resolve, reject) => {
		try {

			db.getConnection(function(err, conn) {
				conn.beginTransaction(function(err) {
					var id = Date.now();

					if (err) {
						throw err;
					}
					db.execute('INSERT INTO product(id, activity_id, item_id, title, pic_url, auction_price, discount_price, discount_rate, commission_rate, share_rate, act_begin_time, act_end_time, shop_id, shop_name, create_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null)', [id, act.activity_id, item.item_id, item.item_title, item.pic_url, item.auction_price, item.discount_price, item.discount_rate, item.commission_rate, act.share_rate, act.begin_time, act.end_time, 1, '淘宝'], function(err, data, fields) {
						if (err) {
							return conn.rollback(function() {
								throw err;
							});
						}
					});

					console.log(urls);
					urls.forEach(function(url) {
						conn.execute('INSERT INTO product_url (product_id, activity_id, item_id, ali_pid, url, create_time) VALUES(?, ?, ?, ?, ?, null)', [id, url.activity_id, url.item_id, url.ali_pid, url.url], function(err, rows, fields) {
							if (err) {
								return conn.rollback(function() {
									throw err;
								});
							}
						});
					});
					conn.commit(function(err) {
						if (err) {
							return conn.rollback(function() {
								throw err;
							});
						}
						conn.release();
					});
				});
			});
		} catch (e) {
			console.log(e);
		}

	});
	console.log(result);
	yield this.body = result;
});
'use strict'
var querystring = require('querystring');
var parse = require('co-body');
var db = require('../../db');
var router = require('koa-router')();
var util = require('util');
var channel = require('../../component/channel');

module.exports = router;

router.get('/', function*(next) {
	var params = querystring.parse(this.querystring) || {};
	var cat = params.cat;
	var order = params.order || 'rank_up';
	var page = parseInt(params.page) || 1;
	var price = params.price;
	var rows = 100;
	var pid = yield channel(this);

	var conditions = [];
	conditions.push('p.id = pu.product_id');
	conditions.push(util.format("pu.ali_pid = '%s'", pid));
	var _order = ' ORDER BY %s %s'

	//排序
	var arrow = {
		'up': 'asc',
		'down': 'desc'
	};
	var orders = {
		'rate': 'p.discount_rate',
		'price': 'p.discount_price',
		'sale': 'p.sold_quantity',
		'rank': 'p.id'
	};
	var order_array = order.split('_');

	if (!arrow[order_array[1]] || !orders[order_array[0]]) {
		this.redirect('/404');
	}

	for (let okey in orders) {
		if (okey == order_array[0]) {
			_order = util.format(_order, orders[order_array[0]], arrow[order_array[1]]);
			break;
		}
	}
	//分类
	var cats = yield new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT id, name, path FROM category where status = ? ORDER BY display_order desc',
			timeout: 1000
		}, ['normal'], function(err, rows, fields) {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	}).then(function(data) {
		return data;
	}).catch(function(err) {
		console.log(err);
	});

	var catMap = {};
	cats.forEach(function(c) {
		catMap[c.id] = c;
	})

	if (cat) {
		if (catMap[cat]) {
			conditions.push(util.format('cat_id = %d', parseInt(cat)));
		} else {
			this.redirect('/404');
		}
	}

	//价格
	var prices = {
			'9': [0, 990],
			'29': [990, 2990]
		}
		// console.log(params);
	if (price) {
		if (prices[price]) {
			conditions.push(util.format('p.discount_price > %d AND p.discount_price <= %d', prices[price][0], prices[price][1]));
		} else {
			this.redirect('/404');
		}
	}

	//时间
	if (params.new) {
		conditions.push(' p.create_time >= curdate()');
	}


	var _where = (conditions.length == 0 ? '' : 'WHERE ' + conditions.join(' AND '));

	var sql_count = util.format("SELECT COUNT(*) c FROM product p, product_url pu %s", _where);
	var sql_list = util.format("SELECT p.*, pp.url FROM product p, (SELECT p.id, pu.url FROM product p, product_url pu %s %s LIMIT ?, ? ) pp WHERE p.id = pp.id", _where, _order);
	// console.log(sql_list);
	var promise = [];
	promise.push(new Promise((resolve, reject) => {
		db.query({
			sql: sql_count,
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
			sql: sql_list,
			timeout: 1000
		}, [(page - 1) * rows, rows], function(err, data, fields) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	}));

	promise.push(new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT count(*) c FROM product p WHERE p.create_time >= curdate()',
			timeout: 1000
		}, function(err, data, fields) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	}));

	var result = yield Promise.all(promise).then(function(data) {
		return {
			'total': data[0][0]['c'],
			'rows': data[1],
			'today_count': data[2][0]['c']
		};
	});

	var pageObj = {};
	pageObj.total = result.total;
	pageObj.rows_per_page = rows;
	pageObj.page_count = Math.ceil(result.total / rows);
	pageObj.page_num = page;
	pageObj.rows = result.rows;

	var title = '【贪小便宜网】9块9包邮，贪小便宜网独家优惠-贪小便宜官网';
	var keywords = '贪小便宜网,贪小便宜官网,贪小便宜';
	var description = '贪小便宜网汇集独家优惠商品全场1折起,天天都有九块九(9.9)包邮商品,秒杀最新9块9包邮独家折扣尽在贪小便宜官网(tanxiaopianyi)';
	if (price && price == '9') {
		title = '9块9包邮秒杀-贪小便宜网';
		keywords = '九块九包邮,9块9包邮,9.9元包邮';
		description = '贪小便宜网独家优惠精选九块九(9.9)包邮商品,秒杀9.9元包邮超值宝贝尽在9块9包邮专区';
	} else if (price && price == '29') {
		title = '29块9包邮秒杀-贪小便宜网';
		keywords = '二十九块九包邮,29块9包邮,29.9元包邮';
		description = '贪小便宜网独家优惠精选二十九块九(29.9)包邮商品,秒杀29.9元包邮超值宝贝尽在29块9包邮专区';
	} else if (catMap[cat]) {
		var cat_name = catMap[cat].name;
		title = util.format('%s-贪小便宜网%s', cat_name, cat_name);
		keywords = util.format('%s,贪小便宜网%s,%s折扣', cat_name, cat_name, cat_name);
		description = util.format('贪小便宜网%s汇集了%s最低折扣优惠信息,还可以享受%s贪小便宜网独家优惠宝贝', cat_name, cat_name, cat_name);
	}
	yield this.render('/web/index', {
		'pagejs': ['js/page/web/index.js'],
		'page': pageObj,
		'cats': cats,
		'_cat': cat,
		'_price': price,
		'_order': order,
		'_new': params.new,
		'today_count': result.today_count,
		'_kw': '',
		'title': title,
		'keywords': keywords,
		'description': description,
		'ischeck': function(source, des) {
			return source == des.split('_')[0] ? 'class=active' : '';
		},
		'order': function(source, des) {
			var _order = des.split('_');
			return source == _order[0] ? (_order[1] == 'up' ? source + '_down' : source + '_up') : source + '_up';
		},
		'arrow': function(source, des) {
			var _order = des.split('_');
			return source == _order[0] ? _order[1] : 'up';
		}
	});
});
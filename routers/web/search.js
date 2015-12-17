'use strict'
var querystring = require('querystring');
var parse = require('co-body');
var db = require('../../db');
var router = require('koa-router')();
var util = require('util');
var SphinxClient = require("sphinxapi");
var channel = require('../../component/channel');
var config = require('../../config');

module.exports = router;

router.get('/search', function*(next) {
	var params = querystring.parse(this.querystring) || {};
	var cat = parseInt(params.cat);
	var keyword = params.kw;
	var page = parseInt(params.page) || 1;
	var rows = 100;

	var pid = yield channel(this);
	var client = new SphinxClient();
	client.SetServer(config.indexServer, config.indexServerPort);

	if (!keyword) {
		this.redirect('/404');
	}

	client.SetGroupBy('cat_id', SphinxClient.SPH_GROUPBY_ATTR, "@count desc");
	client.AddQuery(keyword, config.indexData);

	client.ResetGroupBy();
	if (cat) {
		client.SetFilter('cat_id', [cat]);
	}
	client.SetSortMode(SphinxClient.SPH_SORT_ATTR_DESC, 'rank');
	client.SetLimits((page - 1) * rows, rows);
	client.AddQuery(keyword, config.indexData);

	var searchResult = yield new Promise((resolve, reject) => {
		client.RunQueries(function(err, result) {
			console.log(result);
			if (err) {
				reject(err);
			}
			resolve(result);
		});
	}).then(function(data) {
		return data;
	}).catch(function(err) {
		console.log(err);
	});

	var total = searchResult ? searchResult[1].total : 0;
	console.log('search word %s count %d', keyword, total);

	try {
		db.execute('INSERT INTO search_data (word, `count`) VALUES(?, ?)', [keyword, total], function(err, data, fields) {
			if (err) {
				console.log(err);
				throw err;
			}
		});
	} catch (e) {
		console.log(e);
	}
	if (total == 0) {
		return;
	}

	//取出所有检索到的prdid
	var prds = searchResult[1].matches;
	var _prdids = [];
	prds.forEach(function(p) {
		_prdids.push(p.id);
	});
	//按类分组
	var cats = searchResult[0].matches;
	var _cats = {},
		_catids = [];
	cats.forEach(function(c) {
		let cat_id = c.attrs['@groupby'];
		_catids.push(cat_id);
		_cats[cat_id] = c.attrs['@count'];
	})

	var pageObj = {};

	if (total == 0) {
		pageObj.total = 0;
		yield this.render('/web/search', {
			'pagejs': ['js/page/web/search.js'],
			'page': pageObj,
			'_price': {},
			'cats': [{
				'id': null,
				'name': '全部',
				'count': total
			}],
			'_cat': cat,
			'_kw': keyword,
		});
		return;
	}

	/*
		匹配分类名称
		匹配有产品链接的产品
	*/
	var sql_rows = util.format("SELECT p.*, pu.url FROM product p, product_url pu WHERE pu.product_id IN (%s) AND pu.ali_pid = '%s' AND p.id = pu.product_id", _prdids.join(','), pid);
	var sql_cats = util.format("SELECT id, name, path FROM category where status ='%s' AND id IN (%s) ORDER BY display_order desc", 'normal', _catids.join(','));
	var promise = [];
	// console.log(sql_rows);
	promise.push(new Promise((resolve, reject) => {
		db.query({
			sql: sql_rows,
			timeout: 1000
		}, function(err, data, fields) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	}));

	promise.push(new Promise((resolve, reject) => {
		db.query({
			sql: sql_cats,
			timeout: 1000
		}, function(err, rows, fields) {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	}));

	var result = yield Promise.all(promise).then(function(data) {
		let total = 0;
		data[1].forEach(function(c) {
			c.count = _cats[c.id];
			total += c.count;
		});
		data[1].splice(0, 0, {
			'id': null,
			'name': '全部',
			'count': total
		});
		var _prds = {};
		var _rows = [];

		data[0].forEach(function(p) {
			_prds[p.id] = p;
		})
		
		_prdids.forEach(function(id) {
			var _p = _prds[id];
			if (_p) {
				_rows.push(_p);
			}
		})

		return {
			'rows': _rows,
			'cats': data[1]
		};
	});

	var _rows = result.rows;
	var _total = _rows.length;
	pageObj.total = _total;
	pageObj.rows_per_page = rows;
	pageObj.page_count = Math.ceil(_total / rows);
	pageObj.page_num = page;
	pageObj.rows = _rows;

	var title = util.format('%s-贪小便宜网%s', keyword, keyword);
	var keywords = util.format('%s,贪小便宜网%s,%s折扣', keyword, keyword, keyword);
	var description = util.format('贪小便宜网%s汇集了%s最低折扣优惠信息,还可以享受%s贪小便宜网独家优惠宝贝', keyword, keyword, keyword);
	yield this.render('/web/search', {
		'pagejs': ['js/page/web/search.js'],
		'page': pageObj,
		'_price': {},
		'cats': result.cats,
		'_cat': cat,
		'_kw': keyword,
		'title': title,
		'keywords': keywords,
		'description': description
	});
});
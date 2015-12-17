'use strict'
var querystring = require('querystring');
var db = require('../../db');
var router = require('koa-router')();
var util = require('util');
var queue = require('../../component/queue')({
	'max_size': 100
});

module.exports = router;

router.get('/union', function*(next) {
	var params = querystring.parse(this.querystring) || {};

	var product_id = params.prd || 0;
	var from = this.header['Referrer'] || '';
	var chn = this.cookies.get('chn');
	var to = params.to;
	var pos = params.pos || '';
	console.log(product_id, from, chn, to, pos);
	try {
		db.execute('INSERT INTO union_data (product_id, chn, pos, from_url, to_url) VALUES(?, ?, ?, ?, ?)', [product_id, chn, pos, from, to], function(err, data, fields) {
			if (err) {
				console.log(err);
				throw err;
			}
		});
	} catch (e) {
		console.log(e);
	}
	this.redirect(to);
})
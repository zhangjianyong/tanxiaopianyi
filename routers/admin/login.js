'use strict'

var parse = require('co-body');
var db = require('../../db');

var router = require('koa-router')({
	prefix: '/admin'
});


module.exports = router;


router.get('/login', function*(next) {
	yield this.render('/admin/login', {
		'pagejs': '/admin/js/login.js'
	});
});

router.post('/sign_in', function*(next) {
	var data = yield parse(this);

	var data = yield db.query('SELECT id FROM admin_user WHERE u_name = ? and u_pwd = ? ', [data.u_name, data.u_pwd]).spread(function(data) {
		return data;
	});

	if (data.length == 1) {
		yield this.body = {
			'status': 'ok',
			'msg': '登录成功'
		};
	} else {
		yield this.body = {
			'status': 'ko',
			'msg': '登录失败'
		};
	}
});

router.post('/sign_up', function*(next) {
	console.log(parse(this));
});
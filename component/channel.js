var db = require('../db');
var querystring = require('querystring');

module.exports = function *(ctx) {
	var chns = yield new Promise((resolve, reject) => {
		db.query({
			sql: 'SELECT ali_pid, chn FROM alimama_pid',
			timeout: 1000
		}, function(err, pids, fields) {
			if (err) {
				reject(err);
			}
			var chns = {};
			pids.forEach(function(p) {
				chns[p.chn] = p.ali_pid;
			})
			resolve(chns);
		});
	}).then(function(data) {
		return data;
	}).catch(function(err) {
		console.log(err);
	});

	var params = querystring.parse(ctx.querystring);
	var chn = (params && params.w) ? params.w : null;
	var cookie_chn = ctx.cookies.get('chn');

	chn = chn || cookie_chn;
	chn = (chn && chns[chn]) ? chn : 'default';

	if (!chns[cookie_chn] || (chn != cookie_chn && chn != 'default')) {
		var today = new Date();
		today.setDate(today.getDate() + 1);
		cookie_chn = ctx.cookies.set('chn', chn, {
			expires: today
		});
	}

	return chns[chn];
};
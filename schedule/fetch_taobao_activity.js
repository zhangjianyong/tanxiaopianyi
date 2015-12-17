var _request = require('request');
var config = require('../config');
var redis = require('ioredis')(config.redis);
var db = require('../db');
var later = require('later');
var util = require('util');
var spider = require('../component/spider')({
	'max_threads': 5,
	'max_try_count': 2
});

spider.on('fetch', function(url_tpl, page, opt) {
	var url = util.format(url_tpl, opt.spm, page, opt.per_page_size, opt._tb_token_);
	var options = {
		url: url,
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Accept-Encoding': 'gzip, deflate, sdch',
			'Accept-Language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
			'Connection': 'keep-alive',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Cookie': opt.cookie,
			'Host': 'pub.alimama.com',
			'Referer': util.format('http://pub.alimama.com/myunion.htm?spm=%s', opt.spm),
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
			'X-Requested-With': 'XMLHttpRequest'
		},
		timeout: 2000
	};

	_request(options, (error, response, body) => {
		//切记释放连接
		spider.release();
		var data = {};
		if (error) {
			console.error(url + ":" + error);
			spider.fetch(url_tpl, page, opt);
		} else {
			try {
				data = JSON.parse(body);
				if (data.data.hasNext == true) {
					spider.fetch(url_tpl, ++page, opt);
				}
				data.data.result.forEach(function(d) {
					redis.lpush('alimama_act', [d.eventId, d.title, d.comments, d.share_rate, d.avg_commission, d.begin_time, d.end_time].join('\0'));
				});
			} catch (e) {
				console.log(e);
			}
		}
	});
});

var sched = {
	schedules: [{
		m: [43],
		s: [0]
	}, {
		// h: [19],
		m: [50]
	}]
};

/*整点抓取一次*/
// var sched = later.parse.cron('0 0 ? * * ?', true);
later.setInterval(function() {
	if (!spider.isStop()) {
		console.log('alimama activity is fetching, this fetch is skip.');
		return;
	}
	console.log('start fetch alimama activity.');
	var url_tpl = 'http://pub.alimama.com/event/squareList.json?spm=%s&orderType=3&key=&toPage=%d&perPageSize=%d&platformType=-1&catId=-1&commissionRangeType=-1&eventStatus=-1&highQuality=-1&promotionType=-1&t=1446884115989&_tb_token_=%s&_input_charset=utf-8';

	spider.fetch(url_tpl, 1, {
		'per_page_size': 100,
		'spm': 'a219t.7473494.1998155389.3.Pjafsq',
		'_tb_token_': 'RxNdp1cLxuo',
		'cookie': 'cookie2=1c02bcd7ee4a9dc2be2c97c89a26b4af; t=90c2b6bc708003bcda3942625bb9264c; cna=Cu3kDK/IhXcCAXcoNQJaD6l+; lzstat_uv=3380532563323835873|2876347@2650839@2650835@1774292@1774054; lzstat_ss=3502239773_0_1434394041_2876347|638893544_0_1434393777_2650839|2022456848_0_1434393777_2650835|643902365_0_1445447120_1774292|1325229190_0_1445447120_1774054; _tb_token_=RxNdp1cLxuo; v=0; cookie32=b7fb82705c8cc4836942396b784fd535; cookie31=MTcwNzU2ODMsdGVhcmZseWluaGVhdmVuLHRlYXJmbHlpbmhlYXZlbkBnbWFpbC5jb20sVEI%3D; alimamapwag=TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xOyBXT1c2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQzLjAuMjM1Ny4xMzAgU2FmYXJpLzUzNy4zNg%3D%3D; login=VFC%2FuZ9ayeYq2g%3D%3D; alimamapw=QwQDR1UNHV8MXQQFFVVbPlRUU1VUVARWVFRXAlhWAFYFVFdWBFIABARQAgJTUQQG; isg=5A0EF1C35104DA33664E1930630F791A; l=AlJSA/4-oi4207lJoAZ4B6osIhY2QFb4'
	});
}, sched);
var Redis = require('ioredis');
var redis = new Redis('redis://:1qazxsw23edc@202.85.215.47:6379/0');
// redis.lpush('links', {
// 	'link': 'http://www.jd.com'
// });

var pop = function(queue, cb) {
	redis.rpop(queue, function(err, l) {
		cb(l);
		if (l != null) {
			pop(queue, cb);
		}
	});
};
pop('alimama_act_item', function(l){
	var d = l.split(',');
	d.push(1,2,3);
	console.log(d);
});
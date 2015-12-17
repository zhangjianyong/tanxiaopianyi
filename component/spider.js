var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function(opt) {
	return new Spider(opt);
}

function Spider(opt) {
	this._max_threads = opt.max_threads || 10;
	this._max_try_count = opt.max_try_count || 3;
	this._threads = 0;
	this._urls = [];
	var spider = this;
	EventEmitter.call(this);
}

util.inherits(Spider, EventEmitter);

Spider.prototype.fetch = function(url_tpl, page, opt) {
	if (!url_tpl) {
		return;
	}
	opt.try_count = opt.try_count || -1;
	if (this._threads >= this._max_threads) {
		this._urls.push({
			'tpl': url_tpl,
			'page': page,
			'opt': opt
		});
		return;
	}
	this.emit("fetch", url_tpl, page, opt);
	this._threads++;
}

Spider.prototype.isStop = function() {
	// console.log(this._threads, this._urls.length);
	return (this._threads <= 0 && this._urls.length == 0);
}

Spider.prototype.release = function() {
	this._threads--;
	url = this._urls.shift();
	// console.log('spider queue length:' + this._urls.length);
	if (url) {
		if (url.opt.try_count <= this._max_try_count) {
			++url.opt.try_count;
			this.emit("fetch", url.tpl, url.page, url.opt);
			this._threads++;
		} else {
			console.log('max_try_count : %s', url);
		}
	}
	if (this.isStop()) {
		this.emit("end");
		console.log('spider end');
	}
}
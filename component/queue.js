var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function(opt) {
	return new Queue(opt);
}

function Queue(opt) {
	this._max_size = opt.max_size || 1000;
	this._data = [];
	this._count = 0;
	EventEmitter.call(this);
}

util.inherits(Queue, EventEmitter);

Queue.prototype.add = function(obj) {
	if (!obj) {
		return;
	}

	this._count++;

	if (this._count % this._max_size == 0) {
		this.emit("max", this._data.splice(0, this._max_size));
	}

	this._data.push(obj);
}

Queue.prototype.flush = function() {
	this.emit("max", this._data);
}
module.exports = function(opt) {
	return new JobMan(opt);
}

function JobMan(opt) {
	this._max_threads = opt._max_threads || 30;
	this._jobs = [];
	this._count = 0;
}

JobMan.prototype.add = function(obj) {
	if (!obj) {
		return;
	}

	this._jobs.push(obj);
}

JobMan.prototype.isFinshed = function() {
	this.emit("max", this._data);
}

JobMan.prototype.start = function() {
	while (true) {
		if (_count == 0) {
			break;
		}
		if (_count <= _max_threads) {
			++_count;
			var job = _jobs[Math.round(Math.random() * (_jobs.length - 1))];
			new Promise((resolve, reject) => {
				redis.rpop(job.name, function(err, data) {
					if (err) throw err;
					if (data == null) return;
					var _data = data.split('\0');
					db.query(job.sql, job.transform(_data), function(err, rows, fields) {
						if (err) {
							console.log(job, err, _data);
						}
						// console.log(job);
						run(job);
					})
				});
			}).then(function(data) {
				--_count;
			}).catch(function(err) {
				--_count;
				console.log(err);
			});
		}
	}
}
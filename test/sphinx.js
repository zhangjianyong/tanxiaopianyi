var SphinxClient = require("sphinxapi"),
	util = require('util'),
	assert = require('assert');

var cl = new SphinxClient();
cl.SetServer('localhost', 9312);
cl.SetGroupBy('cat_id', SphinxClient.SPH_GROUPBY_ATTR, "@count desc");
cl.AddQuery('香水', 'tanxiaopianyi_main;tanxiaopianyi_delta');

cl.ResetGroupBy();
cl.SetLimits(0, 1);
cl.SetMaxQueryTime(3000);
cl.SetSortMode(SphinxClient.SPH_SORT_ATTR_DESC, 'rank');
cl.AddQuery('香水', 'tanxiaopianyi_main;tanxiaopianyi_delta');
cl.RunQueries(function(err, result) {
	assert.ifError(err);
	console.log(util.inspect(result, false, null, true));
});
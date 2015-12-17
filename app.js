'use strict'
var app = require('koa')();
var render = require('koa-ejs');
var serve = require('koa-static');
var path = require('path');
var router = require('./router');
var util = require('util');
var config = require('./config');
var favicon = require('koa-favicon');

module.exports = app;

app.use(serve('assets'));
app.use(serve('static'));
app.use(favicon(path.join(__dirname, '/static/image/web/favicon.ico')));
var filters = {
  format_day: function(time) {
    return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate();
  },
  format_daytime: function(time) {
    return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getHours() + ':' + time.getHours();
  },
  toFixed: function(num) {
    return num.toFixed(2);
  },
  parseFloat: function(num) {
    return parseFloat(num);
  },
  link: function(path, params) {
    var ps = [];
    for (let okey in params) {
      if (params[okey]) {
        ps.push(util.format('%s=%s', okey, params[okey]));
      }
    }
    var qs = ps.join('&');
    path = path || '';
    return params.length == 0 ? path : path + '?' + qs;
  }
};
config.tpl.filters = filters;
render(app, config.tpl);
router.use(app);

var sysRender = app.context.render;

function* renderApp(url, data) {
  data.resourceVer = config.js_version;
  data.jsServer = config.jsServer;
  data.imgServer = config.imgServer;

  yield sysRender.apply(this, [url, data])
}

app.context.render = renderApp;
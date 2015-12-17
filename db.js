var db = require('mysql2');
var config = require('./config');
var config = {
	host: process.env.MYSQL_HOST || config.db,
	user: process.env.MYSQL_USER || config.dbUser,
	password: process.env.CI ? process.env.MYSQL_PASSWORD : config.dbPwd,
	database: process.env.MYSQL_DATABASE || config.dbName,
	port: process.env.MYSQL_PORT || config.dbPort,
	connectionLimit: 20,
	acquireTimeout: 60000,
	waitForConnections: true,
	queueLimit: 10000,
	connectTimeout: 1000,
	timeout: 30000
};
module.exports = db.createPool(config);
module.exports.back = db.createPool(config);
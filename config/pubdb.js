'use strict';

var config = require('./config');

module.exports = function(){
	var nano = require('nano')(config.publishedcouch);
	var db = nano.use(config.sitedb);
	return db;
};
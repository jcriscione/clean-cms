'use strict';

var config = require('./config');

module.exports = function(){
	var nano = require('nano')(config.couch);
	var db = nano.use(config.cmsdb);
	return db;
};
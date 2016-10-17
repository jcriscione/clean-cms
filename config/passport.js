'use strict';

var passport = require('passport'),
	path = require('path'),
	config = require('./config');

var nano = require('nano')(config.couch);
var db = nano.use(config.cmsdb);

module.exports = function() {
	// Serialize sessions
	passport.serializeUser(function(user, done) {
		done(null, user._id || user.id);
	});

	// Deserialize sessions
	passport.deserializeUser(function(id, done) {
		db.get(id, function(err, user){
			if (user){
				delete user.salt;
				delete user.password;
			}
			done(err, user);
		});
	});

	// Initialize strategies
	config.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
		require(path.resolve(strategy))();
	});
};
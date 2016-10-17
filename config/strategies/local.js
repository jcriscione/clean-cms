'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
var config = require('./../config');
var nano = require('nano')(config.couch);
var db = nano.use(config.cmsdb);
var crypto = require('crypto');
var _ = require('lodash');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {

			var hashPassword = function(user, password) {
				if (user.salt && password) {
					return crypto.pbkdf2Sync(password, user.salt, 10000, 64).toString('base64');
				} else {
					return password;
				}
			};

			db.view('cms', 'by_username', {key: username, include_docs: true, limit: 1}, function(err, users){
				if (err) {
					return done(err);
				}
				if (!users || users.length === 0) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}
				var user = _.map(users.rows, function(row){
					return row.doc;
				})[0];

				if (!user || !user.password || user.password !== hashPassword(user, password)){
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}

				return done(null, user);
			});

		}
	));
};

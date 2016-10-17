'use strict';

/**
 * Module dependencies.
 */
var	errorHandler = require('./errors'),
	_ = require('lodash');

var db = require('./../../config/db')();
var crypto = require('crypto');
var passport = require('passport');
var config = require('./../../config/config');
var async = require('async');
var EmailService = require('./../services/emailService');

var getUserByToken = function(token, cb){
	db.view('cms', 'by_model', {key: 'User', include_docs: true}, function(err, response){
		if (err)
			return cb(err);

		var found = _.map(response.rows, function(row){
			if (row.doc && row.doc.resetPasswordToken === token)
				return row.doc;
		});

		if (found.length === 0)
			return cb();

		return cb(null, found[0]);
	});
};


/**
 * Create a User
 */
exports.create = function(req, res) {

	var user = req.body;

	db.view('cms', 'by_username', {key: user.username}, function(err, response){
		if (err)
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		if (response && response.rows && response.rows.length > 0)
			return res.status(500).send({message: 'Username exists'});

		user.model = 'User';
		user.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64').toString();
		user.password = crypto.pbkdf2Sync(user.password, user.salt, 10000, 64).toString('base64');
		user.created = new Date();
		user.creator = (req.user) ? req.user.username : 'System';

		db.insert(user, function(err, body){
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(body);
			}
		});
	});

};

/*
update user object
 */
exports.update = function(req, res) {
	delete req.body._rev;
	var oldRoles = req.profile.roles;
	var user = _.extend(req.profile, req.body);
	user.model = 'User';

	db.insert(user, user._id, function(err, saved){ //update the user
		if (err) {
			console.log('err', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if ( (oldRoles.indexOf('none') !== -1) && (user.roles.toString() !== oldRoles.toString()) ) { //send email if the role has changed

				exports.getAdminEmails(function(emails){

					var email = (_.isString(user.email)) ? user.email : user.email[0];
					emails.push(email); //add user's email to recipient list

					exports.getSiteSettings(function(settings){

						function getValue(val) {
							return typeof val === 'string' && val.length > 0 ? val : '[not defined]';
						}

						var newMailOptions = {
							to: emails || null,
							subject: '[ALERT] CMS access granted', // Subject line
							text: 'The admin for ' + getValue(config.app.title) + ' ' + getValue(settings.countryCode) + ' CMS has granted you access. You can now login using your IBM ID via the link on [' + getValue(config.app.frontEndUrl) + ']' // plaintext body
						};

						var mailer = new EmailService();

						mailer.sendMail(newMailOptions, function(err) {
							if (err) {
								console.log('err', err);
							}
						});
					});
				});
			}

			return res.jsonp(saved);
		}
	});
};

/**
 * Show the current User
 */
exports.read = function(req, res) {
	if (req.profile.salt)
		req.profile.isLocal = true;
	delete req.profile.password;
	delete req.profile.salt;
	res.jsonp(req.profile);
};


/**
 * Delete an User
 */
exports.delete = function(req, res) {

  db.destroy(req.profile._id, req.profile._rev, function(err, body){
  	if (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	} else {
		res.jsonp(body);
	}
  });

};

/**
 * List of Users
 */
exports.list = function(req, res) {

	db.view('cms', 'by_model', {key: 'User', include_docs: true}, function(err, response){
		if (err)
			return res.status(500).json({error: err});

		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var docs = _.map(response.rows, function(row){
				delete row.doc.password;
				delete row.doc.salt;
				return row.doc;
			});
			res.jsonp(docs);
		}
	});
};



/*
User signup
 */
exports.signup = function(req, res){
	req.body.roles = [];
	req.body.roles.push('none');
	exports.create(req, res);
};


/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			var roles = ['admin', 'editor', 'preview-only'];
	  		if (!user || _.intersection(user.roles, roles).length === 0) {
	  			res.status(400).send({message: 'Please await confirmation of your registration from a system administrator.'});
	  		}
	  		else{
	  			req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.jsonp(user);
					}
				});
	  		}

		}
	})(req, res, next);
};

exports.oauthCallback = function(req, res) {

	if (!req.user)
		return res.status(400).send('error');

	var id = req.user.id || req.user._id;
	db.get(id, { revs_info: true }, function(err, user) {

		if (err || !user)
            return res.status(400).send('error');

        var roles = ['admin', 'editor', 'preview-only'];
	  	if (!user || _.intersection(user.roles, roles).length === 0) {

			console.log('send new user alert');

		    exports.getAdminEmails(function(emails){

				exports.getSiteSettings(function(settings){

					function getValue(val) {
						return typeof val === 'string' && val.length > 0 ? val : '[not defined]';
					}

					var newMailOptions = {
						to: emails || null,
						subject: '[ALERT] New user requesting CMS access', // Subject line
						text: user.username + ' has requested access to the ' +  getValue(config.cmsdb) + ' ' + getValue(settings.countryCode) + ' application. Please log in to grant the user access with the appropriate permissions or remove them. Please be selective about which users have access to manage other users and publish content.' // plaintext body
					};

					config.sendMail(newMailOptions);
				});
		    });

            return res.redirect('/thanks');
        }

        // Successful authentication, redirect home.
		return res.redirect('/');

	});

};

exports.thanks = function(req, res){
	res.render('thanks');
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};



/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res) {
	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(err, buffer) {
				var token = buffer.toString('hex');
				done(err, token);
			});
		},
		// Lookup user by username
		function(token, done) {
			if (req.body.username) {


				db.view('cms', 'by_username', {key: req.body.username, include_docs: true}, function(err, response){
					if (err)
						return done(err);

					if (!response || (response.rows && response.rows.length === 0))
						return done(new Error('No account with that username has been found'));

					var user = _.map(response.rows, function(row){
						return row.doc;
					})[0];

					if (!user.salt)
						return done(new Error('It appears you signed up using your IBM Single Sign on account. Please contact that service to retrieve your password.'));

					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

					db.insert(user, user._id, function(err){
						done(err, token, user);
					});

				});

			} else {
				return done(new Error('Username field must not be blank'));
			}
		},
		function(token, user, done) {
			res.render('templates/reset-password-email', {
				name: user.displayName,
				appName: config.app.title,
				url: 'http://' + req.headers.host + '/auth/reset/' + token
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			var mailer = new EmailService();

			var mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Password Reset',
				html: emailHTML
			};
			mailer.sendMail(mailOptions, function(err){
				return done(err, user);
			});
		}
	], function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.send({
				message: 'An email has been sent to ' + user.email + ' with further instructions.'
			});
		}
	});
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
	getUserByToken(req.params.token, function(err, user){
		if (err)
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		if (!user)
			return res.redirect('/#!/password/reset/invalid');

		res.redirect('/#!/password/reset/' + req.params.token);
	});
};

/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {
	// Init Variables
	var passwordDetails = req.body;

	async.waterfall([

		function(done) {
			getUserByToken(req.params.token, function(err, user) {
				if (!err && user) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						user.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64').toString();
						user.password = crypto.pbkdf2Sync(passwordDetails.newPassword, user.salt, 10000, 64).toString('base64');
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						db.insert(user, user._id, function(err){
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								req.login(user, function(err) {
									if (err) {
										res.status(400).send(err);
									} else {
										delete user.password;
										delete user.salt;
										res.json(user);

										done(err, user);
									}
								});
							}
						});
					} else {
						return res.status(400).send({
							message: 'Passwords do not match'
						});
					}
				} else {
					return res.status(400).send({
						message: 'Password reset token is invalid or has expired.'
					});
				}
			});
		},
		function(user, done) {
			res.render('templates/reset-password-confirm-email', {
				name: user.username,
				appName: config.app.title
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			var mailer = new EmailService();
			var mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Your password has been changed',
				html: emailHTML
			};

			mailer.sendMail(mailOptions, function(err) {
				done(err, 'done');
			});
		}
	], function(err) {
		if (err) return next(err);
	});
};

/**
 * Change Password
 */
exports.changePassword = function(req, res) {
	// Init Variables
	var passwordDetails = req.body;

	if (req.user) {
		if (passwordDetails.newPassword) {
			db.get(req.user.id, function(err, user) {
				if (!err && user) {
					var testPassword = crypto.pbkdf2Sync(passwordDetails.currentPassword, user.salt, 10000, 64).toString('base64');
					if (testPassword === user.password) {
						if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
							user.password = testPassword;

							db.insert(user, user._id, function(err){
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									req.login(user, function(err) {
										if (err) {
											res.status(400).send(err);
										} else {
											res.send({
												message: 'Password changed successfully'
											});
										}
									});
								}
							});
						} else {
							res.status(400).send({
								message: 'Passwords do not match'
							});
						}
					} else {
						res.status(400).send({
							message: 'Current password is incorrect'
						});
					}
				} else {
					res.status(400).send({
						message: 'User is not found'
					});
				}
			});
		} else {
			res.status(400).send({
				message: 'Please provide a new password'
			});
		}
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};




exports.userByID = function(req, res, next, id) {
	db.get(id, {}, function(err, user) {
		if (err) return next(err);
		if (! user) return next(new Error('Failed to load user ' + id));
	  	req.profile = user;
	  	next();
	});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (!req.user || _.contains(req.user.roles, 'none')) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.canEdit = function(req, res, next) {
	if (req.user && (_.contains(req.user.roles, 'admin') || _.contains(req.user.roles, 'editor'))) {
		next();
	}
	else{
		return res.status(403).send('User is not authorized');
	}
};

exports.canPublish = function(req, res, next) {
	if (!req.user || !_.contains(req.user.roles, 'admin')) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.getSiteSettings = function(cb) {

	var data = {};

	db.view('cms', 'settingsForSite', {key: process.env.SITEID || 1, include_docs: true}, function(err, response){
		if (err) {
			console.log(err);
		}

		if (!response || !response.rows || response.rows.length === 0) {
			console.log('no settings data');
		}

		else {
			data = response.rows[0].doc;
		}

		cb(data);
	});
};

exports.getAdminEmails = function(cb) {
	var emails = [];

	db.view('cms', 'by_model', {key: 'User', include_docs: true}, function(err, response){
		if (err) {
			console.log(err);
		}
		else {
			var docs = _.map(response.rows, function(row){
				delete row.doc.password;
				delete row.doc.salt;
				return row.doc;
			});

			_(docs).forEach(function(user){

				if (user.email && user.roles && (user.roles.indexOf('admin') > -1) ) {
					if (_.isString(user.email)){
						emails.push(user.email);
					}
					else{
						emails.concat(user.email);
					}
				}
			});
			cb(emails);
		}
	});
};

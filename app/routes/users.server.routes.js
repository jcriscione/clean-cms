'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users');


	app.route('/users')
		.get(users.requiresLogin, users.hasAuthorization, users.list)
		.post(users.requiresLogin, users.canPublish, users.create);

	app.route('/users/:userId')
		.get(users.requiresLogin, users.hasAuthorization, users.read)
		.put(users.requiresLogin, users.canPublish, users.update)
		.delete(users.requiresLogin, users.canPublish, users.delete);

	// Setting up the users authentication api
    app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	app.get('/auth/ibm', passport.authenticate('bluemix', {requestedAuthnPolicy: 'http://www.ibm.com/idaas/authnpolicy/basic'}));
	app.get('/auth/ibm/callback', passport.authenticate('bluemix'), users.oauthCallback);

	app.get('/thanks', users.thanks);

    // Setting up the users password api
    app.route('/users/password').post(users.changePassword);
    app.route('/auth/forgot').post(users.forgot);
    app.route('/auth/reset/:token').get(users.validateResetToken);
    app.route('/auth/reset/:token').post(users.reset);


    // Finish by binding the user middleware
	app.param('userId', users.userByID);
};

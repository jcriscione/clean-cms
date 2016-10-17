'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var campaigns = require('../../app/controllers/campaigns');

	// Pages Routes
	app.route('/campaigns')
		.get(users.requiresLogin, users.hasAuthorization, campaigns.list)
		.post(users.requiresLogin, users.canEdit, campaigns.create);

	app.route('/campaigns/:campaignId')
		.get(users.requiresLogin, users.hasAuthorization, campaigns.read)
		.put(users.requiresLogin, users.canEdit, campaigns.update)
		.delete(users.requiresLogin, users.canEdit, campaigns.delete);

	// Finish by binding the Page middleware
	app.param('campaignId', campaigns.campaignByID);
};
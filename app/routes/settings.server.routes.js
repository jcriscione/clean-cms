'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var settings = require('../../app/controllers/settings.server.controller');

	// Settings Routes
	app.route('/settings')
		.get(users.requiresLogin, settings.read)
		.put(users.requiresLogin, users.canEdit, settings.update);

};
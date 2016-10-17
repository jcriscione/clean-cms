'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var roles = require('../../app/controllers/roles');

	// Pages Routes
	app.route('/roles')
		.get(users.requiresLogin, users.hasAuthorization, roles.list)
		.post(users.requiresLogin, users.canEdit, roles.create);

	app.route('/roles/:roleId')
		.get(roles.read)
		.put(users.requiresLogin, users.canEdit, roles.update)
		.delete(users.requiresLogin, users.canEdit, roles.delete);

	// Finish by binding the Page middleware
	app.param('roleId', roles.roleByID);
};
'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var contenttypes = require('../../app/controllers/contenttypes');

	// Contenttypes Routes
	app.route('/contenttypes')
		.get(users.requiresLogin, users.hasAuthorization, contenttypes.list)
		.post(users.requiresLogin, users.canEdit, contenttypes.create);

	app.route('/contenttypes/:contenttypeId')
		.get(users.requiresLogin, users.hasAuthorization, contenttypes.read)
		.put(users.requiresLogin, users.canEdit, contenttypes.update)
		.delete(users.requiresLogin, users.canEdit, contenttypes.delete);

	// Finish by binding the Contenttype middleware
	app.param('contenttypeId', contenttypes.contenttypeByID);
};
'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var segments = require('../../app/controllers/segments');

	// Pages Routes
	app.route('/segments')
		.get(users.requiresLogin, users.hasAuthorization, segments.list)
		.post(users.requiresLogin, users.canEdit, segments.create);

	app.route('/segments/:segmentId')
		.get(users.requiresLogin, users.hasAuthorization, segments.read)
		.put(users.requiresLogin, users.canEdit, segments.update)
		.delete(users.requiresLogin, users.canEdit, segments.delete);

	// Finish by binding the Page middleware
	app.param('segmentId', segments.segmentByID);
};
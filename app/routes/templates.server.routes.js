'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var templates = require('../../app/controllers/templates');

	// Templates Routes
	app.route('/templates')
		.get(users.requiresLogin, users.hasAuthorization, templates.list)
		.post(users.requiresLogin, users.canEdit, templates.create);

	app.route('/templates/typeahead')
		.get(templates.typeahead);

	app.route('/templates/:templateId')
		.get(users.requiresLogin, users.hasAuthorization, templates.read)
		.put(users.requiresLogin, users.canEdit, templates.update)
		.delete(users.requiresLogin, users.canEdit, templates.delete);

	// Finish by binding the Template middleware
	app.param('templateId', templates.templateByID);
};
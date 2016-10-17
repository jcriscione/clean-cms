'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var contents = require('../../app/controllers/contents');

	// Contents Routes
	app.route('/contents')
		.get(users.requiresLogin, users.hasAuthorization, contents.list)
		.post(users.requiresLogin, users.canEdit, contents.create);

	app.route('/contents/typeahead')
		.get(contents.typeahead);

	app.route('/contents/:contentId')
		.get(users.requiresLogin, users.hasAuthorization, contents.read)
		.put(users.requiresLogin, users.canEdit, contents.update)
		.delete(users.requiresLogin, users.canEdit, contents.delete);

	// Finish by binding the Content middleware
	app.param('contentId', contents.contentByID);
};
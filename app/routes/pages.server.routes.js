'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var pages = require('../../app/controllers/pages');

	// Pages Routes
	app.route('/pages')
		.get(users.requiresLogin, users.hasAuthorization, pages.list)
		.post(users.requiresLogin, users.canEdit, pages.create);

	app.route('/pages/tree')
		.get(users.requiresLogin, users.hasAuthorization, pages.getSiteTree);

	app.route('/pages/typeahead')
		.get(pages.typeahead);

	app.route('/pages/:pageId')
		.get(users.requiresLogin, users.hasAuthorization, pages.read)
		.put(users.requiresLogin, users.canEdit, pages.update)
		.delete(users.requiresLogin, users.canEdit, pages.delete);

	app.route('/pages/:pageId/publish')
		.post(users.requiresLogin, users.canPublish, pages.publish);

	app.route('/pages/:pageId/preview')
		.get(pages.preview)
		.options(function(req, res){
			return res.send(200);
		});

	// Finish by binding the Page middleware
	app.param('pageId', pages.pageByID);
};

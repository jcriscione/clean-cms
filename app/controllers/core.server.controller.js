'use strict';
var _ = require('lodash');
/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	var roles = ['admin', 'editor', 'preview-only'];
	res.render('index', {
		user: (req.user && _.intersection(req.user.roles, roles).length > 0) ? req.user : null
	});
};

exports.thanks = function(req, res) {
	res.render('thanks', {});
};
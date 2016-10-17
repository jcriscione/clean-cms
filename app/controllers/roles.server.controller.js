'use strict';

/**
 * Module dependencies.
 */

var	errorHandler = require('./errors'),
	_ = require('lodash');

var db = require('./../../config/db')();

/**
 * Create a Role
 */
exports.create = function(req, res) {
	var role = req.body;
	role.model = 'Role';
	role.created = new Date();
	role.creator = req.user.username;
	db.insert(role, function(err, body){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(body);
		}
	});
};

/**
 * Show the current Role
 */
exports.read = function(req, res) {
	res.jsonp(req.role);
};

/**
 * Update a role
 */
exports.update = function(req, res) {
	delete req.body._rev;
	var role = _.extend(req.role , req.body);
	  role.model = 'Role';

	  db.insert(role, role._id, function(err, saved){
	  	if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(saved);
		}
	  });
};

/**
 * Delete an role
 */
exports.delete = function(req, res) {
	db.destroy(req.role._id, req.role._rev, function(err, body){
  	if (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	} else {
		res.jsonp(body);
	}
  });
};

/**
 * List of roles
 */
exports.list = function(req, res) {
	db.view('cms', 'by_model', {key: 'Role', include_docs: true}, function(err, response){
		if (err)
			return res.status(500).json({error: err});

		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var docs = _.map(response.rows, function(row){
				return row.doc;
			});
			res.jsonp(docs);
		}
	});
};

/**
 * role middleware
 */
exports.roleByID = function(req, res, next, id) {
	db.get(id, { revs_info: true }, function(err, role) {
		if (err) return next(err);
		if (! role) return next(new Error('Failed to load role ' + id));

	  	req.role = role;
	  	next();
	});
};


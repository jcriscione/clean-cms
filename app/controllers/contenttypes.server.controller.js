'use strict';

/**
 * Module dependencies.
 */
//var mongoose = require('mongoose'),
var	errorHandler = require('./errors'),
	//Contenttype = mongoose.model('Contenttype'),
	_ = require('lodash');

var db = require('./../../config/db')();

/**
 * Create a Contenttype
 */
exports.create = function(req, res) {
	var contenttype = req.body;
	contenttype.model = 'ContentType';
	contenttype.created = new Date();
	contenttype.creator = req.user.username;
	db.insert(contenttype, function(err, body){
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
 * Show the current Contenttype
 */
exports.read = function(req, res) {
	res.jsonp(req.contenttype);
};

/**
 * Update a Contenttype
 */
exports.update = function(req, res) {
	delete req.body._rev;
	var contenttype = _.extend(req.contenttype , req.body);
	contenttype.model = 'ContentType';

	db.insert(contenttype, contenttype._id, function(err, saved){
		if (err) {
			console.log('err', err);
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
		} else {
			res.jsonp(saved);
		}
	});
};

/**
 * Delete an Contenttype
 */
exports.delete = function(req, res) {
	db.destroy(req.contenttype._id, req.contenttype._rev, function(err, body){
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
 * List of Contenttypes
 */
exports.list = function(req, res) { 
	db.view('cms', 'by_model', {key: 'ContentType', include_docs: true}, function(err, response){
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
 * Contenttype middleware
 */
exports.contenttypeByID = function(req, res, next, id) { 
	db.get(id, { revs_info: true }, function(err, contenttype) {
		if (err) return next(err);
		if (! contenttype) return next(new Error('Failed to load Content ' + id));

	  	req.contenttype = contenttype;
	  	next();
	});
};


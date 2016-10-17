'use strict';

/**
 * Module dependencies.
 */

var	errorHandler = require('./errors'),
	_ = require('lodash');

var db = require('./../../config/db')();

/**
 * Create a segment
 */
exports.create = function(req, res) {
	var segment = req.body;
	segment.model = 'Segment';
	segment.created = new Date();
	segment.creator = req.user.username;
	db.insert(segment, function(err, body){
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
 * Show the current segment
 */
exports.read = function(req, res) {
	res.jsonp(req.segment);
};

/**
 * Update a segment
 */
exports.update = function(req, res) {
	delete req.body._rev;
	var segment = _.extend(req.segment , req.body);
	  segment.model = 'Segment';

	  db.insert(segment, segment._id, function(err, saved){
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
 * Delete an segment
 */
exports.delete = function(req, res) {
	db.destroy(req.segment._id, req.segment._rev, function(err, body){
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
 * List of Segments
 */
exports.list = function(req, res) {
	db.view('cms', 'by_model', {key: 'Segment', include_docs: true}, function(err, response){
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
 * Segment middleware
 */
exports.segmentByID = function(req, res, next, id) {
	db.get(id, { revs_info: true }, function(err, segment) {
		if (err) return next(err);
		if (! segment) return next(new Error('Failed to load segment ' + id));

	  	req.segment = segment;
	  	next();
	});
};


'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors');
var _ = require('lodash');
var db = require('./../../config/db')();
var contentService = require('./../services/contentService');


var mapContent = function(content) {
	if (content.languages) {
		_.forOwn(content.languages, function(language, languageKey) {
			_.forOwn(language, function(val, contentKey) {
				// {list: {items: []}} structure check for backward compatibility
				if ( _.has(language[contentKey], 'items') &&
					(contentKey === 'list' || language[contentKey].isCollection) ) {

					language[contentKey].items = _.map(language[contentKey].items, function(item) {
						if (item && item._id)
							return item._id;
					});

				}
			});
		});
	}
	return content;
};

/**
 * Create a Content
 */
exports.create = function(req, res) {

	var content = req.body;
	content.model = 'Content';
	content.created = new Date();
	content.creator = req.user.username;
	content = mapContent(content);
	db.insert(content, function(err, body){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('body', body);
			res.jsonp(body);
		}
	});

};

/**
 * Show the current Content
 */
exports.read = function(req, res) {
	var contents = [req.content];
	contentService.populateSubDocuments(contents, function(err, results){
		if (err)
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		return res.jsonp(results[0]);
	});
};

/**
 * Update a Content
 */
exports.update = function(req, res) {
  delete req.body._rev;
  var content = _.extend(req.content , req.body);
  content.model = 'Content';
  content = mapContent(content);
  db.insert(content, content._id, function(err, saved){
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
 * Delete an Content
 */
exports.delete = function(req, res) {

  db.destroy(req.content._id, req.content._rev, function(err, body){
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
 * List of Contents
 */
exports.list = function(req, res) {
	db.view('cms', 'by_model', {key: 'Content', include_docs: true}, function(err, response){
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

exports.typeahead = function(req, res){
	var query = req.query.q;
	if (!query)
		return res.jsonp({});

	var start = [];
	start.push(query);
	var end = [];
	end.push(query + '\u9999');
	db.view('cms', 'contentSearch', {startkey: start, endkey: end}, function(err, response){
		if (err)
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		var formatted = _.map(response.rows, function(row){
			return {_id: row.id, name: row.key[1]};
		});

		return res.jsonp(formatted);
	});
};

/**
 * Content middleware
 */
exports.contentByID = function(req, res, next, id) {
	db.get(id, function(err, content) {
		if (err) return next(err);
		if (! content) return next(new Error('Failed to load Content ' + id));

	  	req.content = content;
	  	next();
	});
};


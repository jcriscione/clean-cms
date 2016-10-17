'use strict';

/**
 * Module dependencies.
 */
//var mongoose = require('mongoose'),
var	errorHandler = require('./errors'),
	//Template = mongoose.model('Template'),
	_ = require('lodash');
var async = require('async');
var db = require('./../../config/db')();

/**
 * Create a Template
 */
exports.create = function(req, res) {
	var template = req.body;
	template.model = 'Template';
	template.created = new Date();
	template.creator = req.user.username;
	db.insert(template, function(err, body){
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
 * Show the current Template
 */
exports.read = function(req, res) {
	res.jsonp(req.template);
};

/**
 * Update a Template
 */
exports.update = function(req, res) {
	delete req.body._rev;
	var template = _.extend(req.template , req.body);
	template.model = 'Template';

	db.insert(template, template._id, function(err, saved){
		if (err) 
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		//update all pages with this template
		db.view('cms', 'by_template', {key: saved.id, include_docs: true}, function(err, response){
			if (err)
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});

			var pages = _.map(response.rows, function(row){
				return row.doc;
			});

			var updateLocations = function(page, cb){
				var results = [];
				_.each(template.locations, function(location){
					var item = _.findWhere(page.locations, {name: location.name}) || { name: location.name };
					results.push(item);
				});

				page.locations = results;
				page.updated = new Date();
				page.updatedBy = req.user.username;
				db.insert(page, page._id, cb);
			};

			async.map(pages, updateLocations, function(err, result){
				if (err)
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});

				res.jsonp(saved);
			});
		});
	});
};

/**
 * Delete an Template
 */
exports.delete = function(req, res) {
	db.destroy(req.template._id, req.template._rev, function(err, body){
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
 * List of Templates
 */
exports.list = function(req, res) { 
	db.view('cms', 'by_model', {key: 'Template', include_docs: true}, function(err, response){
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
	db.view('cms', 'templateSearch', {startkey: start, endkey: end}, function(err, response){
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
 * Template middleware
 */
exports.templateByID = function(req, res, next, id) { 
	db.get(id, { revs_info: true }, function(err, template) {
		if (err) return next(err);
		if (! template) return next(new Error('Failed to load Content ' + id));

	  	req.template = template;
	  	next();
	});
};


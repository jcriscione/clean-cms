'use strict';

/**
 * Module dependencies.
 */

var	errorHandler = require('./errors'),
	_ = require('lodash');

var db = require('./../../config/db')();

/**
 * Create a campaign
 */
exports.create = function(req, res) {
	var campaign = req.body;
	campaign.model = 'Campaign';
	campaign.created = new Date();
	campaign.creator = req.user.username;
	db.insert(campaign, function(err, body){
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
 * Show the current campaign
 */
exports.read = function(req, res) {
	res.jsonp(req.campaign);
};

/**
 * Update a campaign
 */
exports.update = function(req, res) {
	delete req.body._rev;
	var campaign = _.extend(req.campaign , req.body);
	  campaign.model = 'Campaign';

	  db.insert(campaign, campaign._id, function(err, saved){
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
 * Delete an campaign
 */
exports.delete = function(req, res) {
	db.destroy(req.campaign._id, req.campaign._rev, function(err, body){
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
 * List of Campaigns
 */
exports.list = function(req, res) {
	db.view('cms', 'by_model', {key: 'Campaign', include_docs: true}, function(err, response){
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
 * Campaign middleware
 */
exports.campaignByID = function(req, res, next, id) {
	db.get(id, { revs_info: true }, function(err, campaign) {
		if (err) return next(err);
		if (! campaign) return next(new Error('Failed to load campaign ' + id));

	  	req.campaign = campaign;
	  	next();
	});
};


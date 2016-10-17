'use strict';

/**
 * Module dependencies.
 */

var	errorHandler = require('./errors'),
	_ = require('lodash');

var db = require('./../../config/db')();
var siteId = process.env.SITEID || 1;

/**
 * Show the current settings
 */
exports.read = function(req, res) {
	db.view('cms', 'settingsForSite', {key: siteId, include_docs: true}, function(err, response){
      if (err)
        return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});

      if (!response || !response.rows || response.rows.length === 0)
      	return res.status(404).send({
      		message: 'Not found!'
      	});

      return res.jsonp(response.rows[0].doc);
    });
};

/**
 * Update a settings
 */
exports.update = function(req, res) {
	db.view('cms', 'settingsForSite', {key: siteId, include_docs: true}, function(err, response){
      if (err)
        return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});

      if (!response || !response.rows || response.rows.length === 0)
      	return res.status(404).send({
      		message: 'Not found!'
      	});

      delete req.body._rev;
      var settings = _.extend(response.rows[0].doc, req.body);
	  settings.model = 'Settings';
	  settings.siteId = siteId;

	  db.insert(settings, settings._id, function(err, saved){
	  	if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(saved);
		}
	  });
    });
};


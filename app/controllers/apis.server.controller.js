'use strict';

/**
 * Module dependencies.
 */
var	errorHandler = require('./errors'),
	_ = require('lodash');
var pubdb = require('./../../config/pubdb')();

/**
 * Create a Api
 */
exports.getsite = function(req, res) {
	
	pubdb.get('sitenav', function(err, doc){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		else{
			return res.jsonp(doc);
		}
	});

};

/**
 * Show the current Api
 */
exports.getpage = function(req, res) {
	var pageUrl = req.query.key;
	if (!pageUrl)
		return res.status(404).send({message: 'Not Found'});

	pubdb.view('site', 'by_url', {key: pageUrl, include_docs: true}, function(err, page){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		else{
			
			return res.jsonp(page);
		}
	});
};

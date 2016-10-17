'use strict';
var _ = require('lodash');
var db = require('./../../config/db')();
var pubdb = require('./../../config/pubdb')();

exports.getItemsByKeys = function(keys, cb){
	var items = _.filter(keys, function(id){
		return !_.isUndefined(id) && !_.isNull(id);
	});
	db.fetch({keys: items}, function(err, results){
		if (err)
			return cb(err);

		var rows = _.map(results.rows, function(row){
			return row.doc;
		});
		return cb(null, rows);
	});
};

exports.getItemByKey = function(key, cb){
	db.get(key, function(err, results){
		if (err)
			return cb(err);

		var rows = _.map(results.rows, function(row){
			return row.doc;
		})[0];
		
		return cb(null, rows);
	});
};

exports.getItemsByModel = function(model, cb){
	db.view('cms', 'by_model', {key: model, include_docs: true}, function(err, response){

		if (err)
			return cb(err);

		var docs = _.map(response.rows, function(row){
			return row.doc;
		});

		return cb(null, docs);
	});
};

exports.getPublishedItemsByModel = function(model, cb){
	pubdb.view('site', 'by_model', {key: model, include_docs: true}, function(err, response){

		if (err)
			return cb(err);

		var docs = _.map(response.rows, function(row){
			return row.doc;
		});

		return cb(null, docs);
	});
};

exports.getSiteSettings = function(siteId, cb){
	db.view('cms', 'settingsForSite', {key: siteId, include_docs: true}, function(err, response){
      if (err)
        return cb(err);

      if (!response || !response.rows || response.rows.length === 0)
      	return cb('no settings!');

      return cb(null, response.rows[0].doc);
    });
};

exports.saveItem = function(key, obj, cb){
	db.get(key, function(err, existing){
		if (existing)
			obj._rev = existing._rev;

		db.insert(obj, key, function(err, saved){
			if (err)
				return cb(err);

			cb(null, saved);
		});
	});
};

exports.savePublishedItem = function(key, obj, cb){
	pubdb.get(key, function(err, existing){
		if (existing)
			obj._rev = existing._rev;

		pubdb.insert(obj, key, function(err, saved){
			if (err)
				return cb(err);

			cb(null, saved);
		});
	});
};
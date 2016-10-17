'use strict';
var _ = require('lodash');
var async = require('async');
var db = require('./../../config/db')();
var loggerService = require('./loggerService');

exports.populateSubDocuments = function(contents, cb) {
	var toPopulate    = {};
	var collectionIds = [];
	var collections   = [];

	var getSubDocuments = function(items) {
		collectionIds = [];

		_.each(items, function(item) {
			if ( _.isEmpty(item) )
				return;

			_.forOwn(item.languages, function(language, languageKey) {
				toPopulate[languageKey] = toPopulate[languageKey] || {};

				var contentId = language._id || item._id;

				_.forOwn(language, function(val, contentKey) {
					// {list: {items: []}} structure check for backward compatibility
					if ( _.has(language[contentKey], 'items') &&
						(contentKey === 'list' || language[contentKey].isCollection) ) {

						toPopulate[languageKey][contentKey] = toPopulate[languageKey][contentKey] || {};

						if (!toPopulate[languageKey][contentKey][contentId]) {

							var itemCollection = _.filter(language[contentKey].items, function(id) {
								return !_.isUndefined(id) && !_.isNull(id);
							});

							// Fix for collections saved without a 'Collection Type' (after v18 migration)
							itemCollection = _.map(language[contentKey].items, function(id) {
								return _.has(id, '_id') ? id._id : id;
							});

							if ( !_.isEmpty(itemCollection) ) {
								toPopulate[languageKey][contentKey][contentId] = itemCollection;
								collectionIds = collectionIds.concat(itemCollection);
							}

						} else {

							if ( !_.isEmpty(toPopulate[languageKey][contentKey][contentId]) ) {
								var collectionArray = [];

								_.each(toPopulate[languageKey][contentKey][contentId],
									function(collectionId) {
										var content = _.findWhere(collections, {_id: collectionId});
										var contentLocal;

										if (content && content.languages) {
											content      = _.first( getSubDocuments([content]) );
											contentLocal = content.languages[languageKey];
										} else if (content && content.data) {
											contentLocal = content.data;
										} else {
											return;
										}

										collectionArray.push(
											_.extend(contentLocal, {
												'_id':          content._id,
												'name':         content.name,
												'content-type': content.type,
												'filters':      content.filters || {}
											})
										);
									}
								);

								language[contentKey].items = _.filter(collectionArray, function(val) {
									return !_.isUndefined(val) && !_.isNull(val);
								});
							}

						}
					}
				});
			});
		});

		collectionIds = _.uniq(collectionIds);
		return items;
	};

	async.waterfall([
		function(cb_getSubDocuments) {
			contents = getSubDocuments(contents);  // Starts collection ID collation

			async.whilst(
				function() {
					return !_.isEmpty(collectionIds);
				},
				function(cb_getCollections) {
					db.fetch({keys: collectionIds}, function(err, results) {
						if (err)
							return cb();

						collections = collections.concat( getSubDocuments( _.map(results.rows, 'doc') ) );
						cb_getCollections();
					});
				},
				function() {
					contents = getSubDocuments(contents);  // Starts collection ID replacement

					cb_getSubDocuments(null);
				}
			);
		},
		function(cb_getSubDocuments) {
			cb_getSubDocuments(null);
		}
	], function() {
		contents = _.reject(contents, _.isEmpty);
		return cb(null, contents);
	});

};

exports.getContent = function(id, cb) {
	db.get(id, function(err, content) {
		if (err)
			return cb(err);

		if (!content)
			return cb('Not found!');

		var contents = [content];
		exports.populateSubDocuments(contents, function(err, results) {
			if (err)
				return cb(err);

			return cb(null, results[0]);
		});
	});
};

exports.getContents = function(ids, reqData, cb) {
	if ( !_.isEmpty(reqData) ) {
		loggerService.auditLogger.info('Get contents', {
			data: {
				datetime:           new Date().toString(),
				request_username:   reqData.user ? (reqData.user.username || null) : null,
				request_url:        reqData.url,
				node_filename:      __filename,
				node_method:        'getContents',
				node_method_caller: reqData.node_method_caller,
				node_callback:      reqData.node_callback,
				content_ids:        ids
			}
		});
	}

	ids = _.filter(ids, function(id) {
		return !_.isUndefined(id) && !_.isNull(id);
	});

	db.fetch({keys: ids}, function(err, response) {
		if (err)
			return cb(err);

		var docs = _.map(response.rows, 'doc');

		exports.populateSubDocuments(docs, function(err, results) {
			if (err)
				return cb(err);

			return cb(null, results);
		});
	});
};


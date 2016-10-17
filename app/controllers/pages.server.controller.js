'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors');
var _ = require('lodash');

var jspath = require('jspath');
var db = require('./../../config/db')();
var pubdb = require('./../../config/pubdb')();
var async = require('async');
var config = require('./../../config/config');
var contentService = require('./../services/contentService');
var siteId = process.env.SITEID || 1;

// Creates hierarchical tree from array
var unflatten = function(array, parent, tree) {
	tree = tree || [];
	parent = parent || {masterId: ''};
	var children = _.filter(array, function(child) {
		return child.parent === parent.masterId;
	});

	if ( !_.isEmpty(children) ) {
		if (parent.masterId === '') {
			tree = children;
		} else {
			parent.children = _.sortBy(children, function(a) {
				return a.sort;
			});
		}

		_.each(children, function(child) {
			unflatten(array, child);
		});
	}

	return tree;
};

// Validates necessary fields on a page
var validatePage = function(page) {
	if (page.url === '/') {
		return page.template && (page.parent === '') && page.url && page.model && page.name;
	} else {
		return page.template && page.parent && page.url && page.model && page.name;
	}
};

// Generates the page json
var generatePublishedPages = function(page, logMetadata, cb) {

	logMetadata.node_method_caller = 'generatePublishedPages';

	async.waterfall([
		// Get contents and collections
		function(callback) {
			var contentIds = [];
			_.each(page.locations, function(location) {
				contentIds = contentIds.concat(location.contents);
			});

			logMetadata.node_callback = 'get_content';

			contentService.getContents(contentIds, logMetadata, function(err, items) {
				if (err)
					return callback(err);

				return callback(null, items);
			});
		},

		// Get template
		function(contents, callback) {
			db.get(page.template, function(err, template) {
				if (err)
					return callback(err);

				callback(null, contents, template);
			});
		},

		// Get settings
		function(contents, template, callback) {
			db.view('cms', 'settingsForSite', {key: siteId, include_docs: true}, function(err, response) {
				if (err)
					return callback(err);

				if (!response || !response.rows || response.rows.length === 0)
					return callback('no settings!');

				return callback(null, contents, template, response.rows[0].doc);
			});
		}
	],
	function(err, contents, template, settings) {
		if (err)
			cb(err);

		// Construct page
		var locations = page.locations;
		page.template = template.name;

		var formatContent = function(content, language) {
			var type = content.type;

			// Backward compatibility
			var contentLocal;

			if (content.languages)
				contentLocal = content.languages[language.locale] || {};
			else
				contentLocal = content.data || {};

			content = _.extend(contentLocal, _.pick(content, '_id', 'name', 'filters'));
			content['content-type'] = type;
			return content;
		};

		var pages = [];

		_.each(settings.languages, function(language) {
			var p = {};

			if (page.languages)
				p = _.clone(_.extend(page, page.languages[language.locale]));
			else
				p = _.clone(page);

			p.locale = language.locale;

			// Clean item
			p = _.pick(p, '_id', 'model', 'url', 'canonical_url', 'pagesubtitle', 'navlabel', 'hide_nav',
				'orphan_page', 'hide_top_nav', 'hide_in_footer', 'deeplink_nav', 'marketo_enabled',
				'marketo_script', 'munchkin_enabled', 'munchkin_script', 'deeplink_nav', 'parallax_page',
				'phone_number', 'priority_code', 'section_only', 'page_title', 'sort', 'page_keywords',
				'page_description', 'og_image', 'og_title', 'og_description', 'og_url', 'locale', 'masterId',
				'locations', 'name', 'template', 'start_date', 'parent', 'contact_enabled', 'email_enabled',
				'email_type', 'email_target', 'chat_enabled', 'chat_script', 'chat_label');

			p.locations = {};

			_.each(locations, function(location) {
				var items = [];

				_.each(location.contents, function(contentId) {
					var content = _.find(contents, {_id: contentId});

					if (content)
						items.push( formatContent(content, language) );

				});

				p.locations[location.name] = items;
			});

			pages.push(p);
		});

		return cb(null, pages);
	});

};

// Saves page json to site db
var savePublishedPages = function(pages, cb) {

	var funcs = [];
	_.each(pages, function(page) {

		funcs.push(function(callback) {
			// Set master and delete pageid
			page.masterId = page._id;
			delete page._id;

			pubdb.view('site', 'by_masterId', {key: [page.masterId, page.locale], include_docs: true}, function(err, existing) {
				//pubdb.get(page._id, function(err, existing) {
				if (existing && existing.rows.length > 0) {
					var doc = existing.rows[0].doc;
					page._rev = doc._rev;
					page._id = doc._id;
				} else {
					delete page._rev;
				}

				pubdb.insert(page, function(err, saved) {
					if (err)
						return callback(err);

					callback(null, saved);
				});
			});
		});

	});

	async.parallel(funcs,
		function(err, result) {
			if (err)
				return cb(err);

			return cb(null, result);
	});

};

// Saves sitemap json to site db
var savePublishedNav = function(cb) {

	async.parallel([
		function(callback) {
			pubdb.view('site', 'by_model', {key: 'Page', include_docs: true}, function(err, response) {
				if (err)
					return callback(err);

				var docs = _.map(response.rows, 'doc');

				return callback(null, docs);
			});
		},
		function(callback) {
			db.view('cms', 'settingsForSite', {key: siteId, include_docs: true}, function(err, response) {
				if (err)
					return callback(err);

				if (!response || !response.rows || response.rows.length === 0)
					return callback('no settings!');

				return callback(null, response.rows[0].doc);
			});
		}
		], function(err, response) {
			if (err)
				return cb(err);

			var pages = response[0];
			var settings = response[1];
			var funcs = [];

			_.each(settings.languages, function(language) {
				funcs.push(function(callback) {
					var languageSpecific = _.filter(pages, function(page) {
						return page.locale === language.locale;
					});
					languageSpecific = _.map(languageSpecific, function(row) {
						return _.pick(row, '_id', 'page_title', 'navlabel', 'pagesubtitle', 'section_only',
							'hide_nav', 'orphan_page', 'hide_top_nav', 'hide_in_footer', 'deeplink_nav',
							'marketo_enabled', 'parallax_page', 'phone_number', 'priority_code',
							'deeplink_nav', 'marketo_script', 'munchkin_enabled', 'munchkin_script', 'name',
							'parent', 'url', 'sort', 'locale', 'masterId', 'contact_enabled',
							'email_enabled', 'email_type', 'email_target', 'chat_enabled', 'chat_script',
							'chat_label');
					});

					// Remap the dictionary to an object instead of array
					var dictionary = settings.dictionary[language.locale];
					settings.dictionary[language.locale] = {};
					_.each(dictionary, function(item) {
						settings.dictionary[language.locale][item.key] = item.value;
					});

					var sitenav = _.extend(language, settings.dictionary[language.locale]);
					sitenav.copyright = settings.copyright;
					sitenav.site_name = language.title;

					sitenav.items = unflatten(languageSpecific);
					var navId = 'sitenav_' + language.locale;

					pubdb.get(navId, function(err, existing) {
						if (existing)
							sitenav._rev = existing._rev;

						pubdb.insert(sitenav, navId, function(err, saved) {
							if (err)
								return callback(err);

							callback(null, saved);
						});
					});
				});
			});

			async.parallel(funcs, function(err, result) {
				if (err)
					return cb(err);

				return cb(null, result);
			});
		});

};

var updatePublishDate = function(page, user, cb) {
	db.get(page._id, function(err, page) {
		if (err)
			return cb(err);

		page.published = new Date();
		page.publisher = user.username;
		page.updatedBy = user.username;

		if (!validatePage(page))
			cb('Invalid page object');

		db.insert(page, page._id, function(err, saved) {
			if (err)
				return cb(err);

			cb(null, saved);
		});
	});
};


var mapPage = function(page) {
	page.locations = _.map(page.locations, function(location) {
		var contents = [];
		_.each(location.contents, function(content) {
			if (content && content._id)
				contents.push(content._id);
		});
		return {
			name: location.name,
			contents: contents
		};
	});

	if (page.template)
		page.template = page.template._id;

	if (page.parent)
		page.parent = page.parent._id;
	return page;
};

/**
 * Create a Page
 */
exports.create = function(req, res) {
	var page = req.body;
	page.model = 'Page';
	page.created = new Date();
	page.creator = req.user.username;
	page.updatedBy = req.user.username;

	page = mapPage(page);

	if (!validatePage(page))
		return res.status(400).send({
			message: 'Invalid page object'
		});

	db.insert(page, function(err, body) {
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
 * Show the current Page
 */
exports.read = function(req, res) {

	var page = req.page;

	// Populate content items, collections, template, parent
	async.parallel([
		function(callback) {
			if (!page.locations || page.locations.length === 0)
				return callback();

			var contentIds = [];
			_.each(page.locations, function(location) {
				contentIds = contentIds.concat(location.contents);
			});

			if (contentIds.length === 0)
				return callback();

			contentIds = _.filter(contentIds, function(id){
				return !_.isUndefined(id) && !_.isNull(id);
			});

			db.fetch({keys: contentIds}, function(err, results) {
				if (err)
					return callback();

				var contents      = [];
				var collectionIds = [];
				var collections   = [];

				var populateContents = function(items) {
					var itemsPopulated = [];
					collectionIds      = [];

					_.each(items, function(item) {
						if (item.doc) {

							var itemCollection = jspath.apply(
								'.languages..{.items}{.isCollection === true}.items', item.doc
							);

							// {list: {items: []}} structure check for backward compatibility
							itemCollection = _.merge(
								itemCollection, jspath.apply('.languages..list.items', item.doc)
							);

							itemCollection = _.flatten(_.uniq(
								_.filter(itemCollection, function(id) {
									return !_.isEmpty(id);
								})
							));

							if ( !_.isEmpty(itemCollection) )
								collectionIds = collectionIds.concat(itemCollection);

							itemsPopulated.push( _.assign(
								_.pick(item.doc, '_id', 'name', 'type'), {collection: itemCollection}
							) );

						} else if (item.collection) {

							if ( !_.isEmpty(item.collection) ) {
								var collectionArray = [];

								_.each(item.collection, function(collectionId) {
									var c = _.findWhere(collections, {_id: collectionId});

									if (c)
										collectionArray.push(c);

								});
								item.collection = collectionArray;

								if ( !_.isEmpty(item.collection) )
									item.collection = populateContents(item.collection);

							}
							itemsPopulated.push(item);

						}
					});

					collectionIds = _.uniq(collectionIds);
					return itemsPopulated;
				};

				async.waterfall([
					function(cb) {
						contents = populateContents(results.rows);

						async.whilst(
							function() {
								return !_.isEmpty(collectionIds);
							},
							function(getCollections) {
								db.fetch({keys: collectionIds}, function(err, results) {
									if (err)
										return callback();

									collections = collections.concat( populateContents(results.rows) );
									getCollections();
								});
							},
							function() {
								cb(null);
							}
						);
					},
					function(cb) {
						contents = populateContents(contents);

						cb(null);
					},
				],
				function() {
					var locations = [];

					if (contents && contents.length > 0) {
						locations = _.map(page.locations, function(location) {
							var contentArray = [];

							_.each(location.contents, function(contentId) {
								var c = _.findWhere(contents, {_id: contentId});

								if (c)
									contentArray.push(c);

							});

							return {name: location.name, contents: contentArray};
						});
					}

					return callback(null, locations);
				});
			});
		},
		// Get template
		function(callback) {
			if (!page.template || page.template.length === 0)
				return callback();

			db.get(page.template, function(err, template) {
				if (err || !template)
					return callback();

				return callback(null, {_id: template._id, name: template.name});
			});
		},
		// Get parent
		function(callback) {
			if (!page.parent || page.parent.length === 0)
				return callback(null, {_id: '', name: '<ROOT>'});

			db.get(page.parent, function(err, parent) {
				if (err || !parent)
					return callback();

				return callback(null, {_id: parent._id, name: parent.name});
			});
		}],
		function(err, results) {
			if (err)
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});

			page = _.assign(page, {locations: results[0], template: results[1], parent: results[2]});

			return res.jsonp(page);
		}
	);

};

/**
 * Update a Page
 */
exports.update = function(req, res) {
	delete req.body._rev;
	var page = _.extend(req.page, req.body);
	page.model = 'Page';
	page.updatedBy = req.user.username;
	page.updated = new Date();
	page = mapPage(page);

	if (!validatePage(page))
		return res.status(400).send({
			message: 'Invalid page object'
		});

	db.insert(page, page._id, function(err, saved) {
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
 * Delete a Page
 */
exports.delete = function(req, res) {
	db.destroy(req.page._id, req.page._rev, function(err, body) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// Delete from sitedb too
			pubdb.get(req.page._id, function(err, existing) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}

				pubdb.destroy(existing._id, existing._rev, function(err, body) {
					savePublishedNav(function() {
						res.jsonp(body);
					});
				});

			});
		}
	});
};

/**
 * List of Pages
 */
exports.list = function(req, res) {
	db.view('cms', 'by_model', {key: 'Page', include_docs: true}, function(err, response) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var docs = _.map(response.rows, function(row) {
				return _.extend(row.doc, _.pick(config.app, 'frontEndUrl'));
			});
			res.jsonp(docs);
		}
	});
};


exports.typeahead = function(req, res) {
	var query = req.query.q;
	if (!query)
		return res.jsonp( {});

	var start = [];
	start.push(query);
	var end = [];

	end.push(query + '\u9999');
	db.view('cms', 'pageSearch', {startkey: start, endkey: end}, function(err, response) {
		if (err)
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		var formatted = _.map(response.rows, function(row) {
			return {_id: row.id, name: row.key[1]};
		});

		var current = req.query.current;

		if (current) {
			// Filter current page
			formatted = _.filter(formatted, function(row) {
				return row.id !== current;
			});
		}

		// Add site root
		formatted.unshift({_id: '', name: '<ROOT>'});

		return res.jsonp(formatted);
	});
};

/**
 * Creates hierarchical object of pages and content items
 */
exports.getSiteTree = function(req, res) {
	db.view('cms', 'by_model', {key: 'Page', include_docs: true}, function(err, response) {
		if (err)
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		var pages = _.map(response.rows, function(row) {
			return _.pick(row.doc, '_id', 'page_title', 'name', 'parent', 'url', 'sort', 'locations');
		});

		pages = _.sortBy(pages, 'url');

		async.waterfall([
			function(cb) {
				var contentIds = [];

				_.each(pages, function(page) {
					contentIds = contentIds.concat( _.flatten( _.pluck(page.locations, 'contents') ) );
				});

				contentIds = _.uniq( _.filter(contentIds, function(id) {
					return !_.isUndefined(id) && !_.isNull(id);
				}) );

				db.fetch({keys: contentIds}, function(err, response) {
					if (!err) {
						var childrenIds = [];
						var contentItems = _.map(response.rows, function(row) {
							var itemData = _.pick(row.doc, '_id', 'type', 'name');
							var itemCollections = jspath.apply(
								'.languages..{.items}{.isCollection === true}.items', row.doc
							);

							// {list: {items: []}} structure check for backward compatibility
							itemCollections = _.merge(
								itemCollections, jspath.apply('.languages..list.items', row.doc)
							);

							itemData.collections = _.flatten( _.uniq(
								_.filter(itemCollections, function(id) {
									return !_.isEmpty(id);
								})
							) );
							childrenIds = childrenIds.concat(itemData.collections);

							return itemData;
						});

						childrenIds = _.uniq(childrenIds);

						cb(null, childrenIds, contentItems);
					}
				});
			}, function(childrenIds, contentItems, cb) {
				db.fetch({keys: childrenIds}, function(err, response) {
					if (!err) {
						var collections = _.map(response.rows, function(row) {
							return _.pick(row.doc, '_id', 'type', 'name');
						});

						_.each(pages, function(page) {
							page = _.assign(page, {
								'level':  (page.url === '/') ? 0 : page.url.split('/').length - 1,
								'isOpen': false
							});
							_.each(page.locations, function(location) {
								location.contents = _.map(location.contents, function(id) {
									var contentData = _.findWhere(contentItems, {'_id': id});

									/*if ( contentData.collections && !_.isEmpty(contentData.collections) ) {
										contentData.collections = _.map(
											contentData.collections, function(child_id) {
												return _.findWhere(collections, {'_id': child_id});
											}
										);
									}*/

									return contentData;
								});
							});
						});

						cb(null, {'pages': pages, 'collections': collections});
					}
				});
			}
		], function(err, results) {
			return res.jsonp(results);
		});

	});
};

exports.preview = function(req, res) {
	if (!req.page)
		return res.status(404).send('not found');

	var logMetadata = _.pick(req, 'user', 'url');

	generatePublishedPages(req.page, logMetadata, function(err, pages) {
		if (err)
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		// Make it look like a view
		var page = _.findWhere(pages, {locale: req.query.language});
		var doc = {rows: [{doc: page}]};
		res.jsonp(doc);
	});

};

exports.publish = function(req, res) {
	if (!req.page)
		return res.status(404).send('not found');

	var logMetadata = _.pick(req, 'user', 'url');

	// Generate page
	generatePublishedPages(req.page, logMetadata, function(err, pages) {
		if (err)
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		// Save page
		savePublishedPages(pages, function(err, saved) {
			if (err)
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});

			updatePublishDate(req.page, req.user, function(err, saved) {
				if (err)
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});

				// Generate and save nav
				savePublishedNav(function(err, nav) {
					if (err)
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});

					return res.jsonp('ok');
				});
			});
		});
	});
};


/**
 * Page middleware
 */
exports.pageByID = function(req, res, next, id) {
	db.get(id, {revs_info: false}, function(err, page) {
		if (err) return next(err);
		if (!page) return next(new Error('Failed to load page ' + id));

		req.page = _.extend(page, _.pick(config.app, 'frontEndUrl'));
		next();
	});
};

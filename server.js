'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	dbconfig = require('./config/dbconfig')(config);

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */


// Init the express application
var app = require('./config/express')();

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('CLEAN CMS application started on port ' + config.port);
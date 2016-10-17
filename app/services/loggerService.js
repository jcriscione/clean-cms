'use strict';

var winston = require('winston');
var logDate = new Date().toISOString().slice(0, 7);

/**
 * Configures info logging to file
 */
exports.auditLogger = new (winston.Logger)({
	transports: [
		new (winston.transports.File)({
			name:     'audit',
			filename: 'logs/audit-' + logDate + '.log',
			level:    'info'
		})
	]
});

/**
 * Configures error logging to file
 */
exports.errorLogger = new (winston.Logger)({
	transports: [
		new (winston.transports.File)({
			name:     'error',
			filename: 'logs/error-' + logDate + '.log',
			level:    'error'
		})
	]
});

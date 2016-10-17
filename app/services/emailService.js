'use strict';

var sendgrid = require('sendgrid');
var config = require('./../../config/config');
var _ = require('lodash');

var EmailService = module.exports = function EmailService(){

};


EmailService.prototype.sendMail = function(options, cb) {
	options = options || {};

	var sendgrid  = require('sendgrid')(config.mailer.user, config.mailer.pass),
		payload = _.extend(config.mailer, options);

	console.log('sending system email');
	console.log(payload);

	sendgrid.send(payload, function(err, json) {
		if (err) { 
			console.log('error sending email ' + err.message);
			return cb(err); 
		}
		else {
			console.log('sending system email successfully');
			return cb(null, json);
		}
	});

};
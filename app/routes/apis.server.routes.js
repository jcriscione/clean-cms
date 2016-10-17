'use strict';

module.exports = function(app) {
	var apis = require('../../app/controllers/apis');


	app.route('/api/site')
		.get(apis.getsite);

	app.route('/api/page')
		.get(apis.getpage);

};
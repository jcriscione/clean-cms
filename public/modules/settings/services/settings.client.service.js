'use strict';

//Settings service used to communicate Settings REST endpoints
angular.module('settings').factory('Settings', ['$resource',
	function($resource) {
		return $resource('settings', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
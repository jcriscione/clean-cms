'use strict';

//Pages service used to communicate Pages REST endpoints
angular.module('roles').factory('Roles', ['$resource',
	function($resource) {
		return $resource('roles/:roleId', { roleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
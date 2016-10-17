'use strict';

//Contenttypes service used to communicate Contenttypes REST endpoints
angular.module('contenttypes').factory('Contenttypes', ['$resource',
	function($resource) {
		return $resource('contenttypes/:contenttypeId', { contenttypeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
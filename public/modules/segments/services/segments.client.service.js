'use strict';

//segments service used to communicate segments REST endpoints
angular.module('segments').factory('Segments', ['$resource',
	function($resource) {
		return $resource('segments/:segmentId', { segmentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
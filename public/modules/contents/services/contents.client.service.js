'use strict';

//Contents service used to communicate Contents REST endpoints
angular.module('contents').factory('Contents', ['$resource',
	function($resource) {
		return $resource('contents/:contentId', { contentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
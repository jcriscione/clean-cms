'use strict';

//campaigns service used to communicate segments REST endpoints
angular.module('campaigns').factory('Campaigns', ['$resource',
	function($resource) {
		return $resource('campaigns/:campaignId', { campaignId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
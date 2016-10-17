'use strict';

//Setting up route
angular.module('settings').config(['$stateProvider',
	function($stateProvider) {
		// Settings state routing
		$stateProvider.
		state('viewSetting', {
			url: '/settings',
			templateUrl: 'modules/settings/views/list-setting.client.view.html'
		});
	}
]);
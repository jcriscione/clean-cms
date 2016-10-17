'use strict';

//Setting up route
angular.module('contents').config(['$stateProvider',
	function($stateProvider) {
		// Contents state routing
		$stateProvider.
		state('listContents', {
			url: '/contents',
			templateUrl: 'modules/contents/views/list-contents.client.view.html'
		}).
		state('createContent', {
			url: '/contents/create',
			templateUrl: 'modules/contents/views/create-content.client.view.html'
		}).
		state('viewContent', {
			url: '/contents/:contentId',
			templateUrl: 'modules/contents/views/view-content.client.view.html'
		}).
		state('editContent', {
			url: '/contents/:contentId/edit',
			templateUrl: 'modules/contents/views/edit-content.client.view.html'
		});
	}
]);
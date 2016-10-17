'use strict';

//Setting up route
angular.module('contenttypes').config(['$stateProvider',
	function($stateProvider) {
		// Contenttypes state routing
		$stateProvider.
		state('listContenttypes', {
			url: '/contenttypes',
			templateUrl: 'modules/contenttypes/views/list-contenttypes.client.view.html'
		}).
		state('createContenttype', {
			url: '/contenttypes/create',
			templateUrl: 'modules/contenttypes/views/create-contenttype.client.view.html'
		}).
		state('viewContenttype', {
			url: '/contenttypes/:contenttypeId',
			templateUrl: 'modules/contenttypes/views/view-contenttype.client.view.html'
		}).
		state('editContenttype', {
			url: '/contenttypes/:contenttypeId/edit',
			templateUrl: 'modules/contenttypes/views/edit-contenttype.client.view.html'
		});
	}
]);
'use strict';

// Configuring the Menu module
angular.module('contents').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Content Items', 'contents', 'dropdown', '/contents(/create)?', false, ['admin','editor']);
		Menus.addSubMenuItem('topbar', 'contents', 'List Content', 'contents');
		Menus.addSubMenuItem('topbar', 'contents', 'New Content', 'contents/create');
	}
]);
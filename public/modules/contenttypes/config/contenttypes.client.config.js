'use strict';

// Configuring the Articles module
angular.module('contenttypes').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Content Types', 'contenttypes', 'dropdown', '/contenttypes(/create)?', false, ['admin','editor']);
		Menus.addSubMenuItem('topbar', 'contenttypes', 'List Content Types', 'contenttypes');
		Menus.addSubMenuItem('topbar', 'contenttypes', 'New Content Type', 'contenttypes/create');
	}
]);
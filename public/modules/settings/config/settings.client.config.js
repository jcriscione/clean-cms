'use strict';

// Configuring the Articles module
angular.module('settings').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Settings', 'settings', 'item', '/settings', false, ['admin']);
	}
]);
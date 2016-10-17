'use strict';

// Configuring the Articles module
angular.module('segments').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Segments', 'segments', 'dropdown', '/segments(/create)?', false, ['admin']);
		//Menus.addSubMenuItem('topbar', 'segments', 'List Segments', 'segments');
		//Menus.addSubMenuItem('topbar', 'segments', 'New Segment', 'segments/create');
	}
]);
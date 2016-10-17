'use strict';

// Roles controller
angular.module('roles').controller('RolesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Roles', '_',
	function($scope, $stateParams, $location, Authentication, Roles, _ ) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.canEdit())
			$location.path('pages');
		
		$scope.role = {};
		$scope.fieldTypes = ['text', 'textarea', 'select', 'multi-select'];

		$scope.initNew = function(){
			$scope.loaded = true;
		};

		// Create new Role
		$scope.create = function() {
			// Create new Role object
			mapRole();
			var role = new Roles ($scope.role);

			// Redirect after save
			role.$save(function(response) {
				$location.path('roles/' + response.id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Confirm before removing
		$scope.confirmRemove = function( role ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');
			
			if (confirmed === true) {
				$scope.remove( role );
			}
		};

		// Remove existing Role
		$scope.remove = function( role ) {
			if ( role ) { role.$remove();

				for (var i in $scope.roles ) {
					if ($scope.roles [i] === role ) {
						$scope.roles.splice(i, 1);
					}
				}
			} else {
				$scope.role.$remove(function() {
					$location.path('roles');
				});
			}
		};

		var mapRole = function(){
			angular.forEach($scope.role.fields, function(field){
				field.type = field.type.selected;
			});
			
		};

		// Update existing Role
		$scope.update = function() {
			mapRole();
			var role = $scope.role;

			role.$update(function() {
				$location.path('roles/' + role.id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find a list of Roles
		$scope.find = function() {
			$scope.roles = Roles.query(function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		// Find existing Role
		$scope.findOne = function() {
			$scope.role = Roles.get({
				roleId: $stateParams.roleId
			},function(value, responseHeaders){
				$scope.loaded = true;
			});

			$scope.role.$promise.then(function(role){
				angular.forEach(role.fields, function(field){
					var t = _.find($scope.fieldTypes, function(f) { return f === field.type; });
					$scope.showOptions = (t.indexOf('select') !== -1);
					field.type = {};
					field.type.selected = t;
					
				});
				
			});
		};

		$scope.addNew = function(){
			
			if (!$scope.role.fields)
				$scope.role.fields = [];
			$scope.role.fields.push({name: 'New Field'});
		};

		$scope.removeField = function(s, index){
			if (s){
				s.fields.splice(index, 1);
				return;
			}
			this.fields.splice(index, 1);
		};

		$scope.changeTypes = function(t){
			$scope.showOptions = (t.indexOf('select') !== -1);
		};
	}
]);

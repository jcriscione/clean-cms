'use strict';

// Templates controller
angular.module('templates').controller('TemplatesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Templates', '_',
	function($scope, $stateParams, $location, Authentication, Templates, _ ) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.canEdit())
			$location.path('pages');
		
		$scope.template = {};

		// Create new Template
		$scope.create = function() {
			// Create new Template object
			var template = new Templates ($scope.template);

			// Redirect after save
			template.$save(function(response) {
				$location.path('templates/' + response.id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Confirm before removing
		$scope.confirmRemove = function( template ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');
			
			if (confirmed === true) {
				$scope.remove( template );
			}
		};

		// Remove existing Template
		$scope.remove = function( template ) {
			if ( template ) { template.$remove();

				for (var i in $scope.templates ) {
					if ($scope.templates [i] === template ) {
						$scope.templates.splice(i, 1);
					}
				}
			} else {
				$scope.template.$remove(function() {
					$location.path('templates');
				});
			}
		};

		// Update existing Template
		$scope.update = function() {
			var template = $scope.template ;

			template.$update(function() {
				$location.path('templates/' + template.id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find a list of Templates
		$scope.find = function() {
			$scope.templates = Templates.query(function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		// Find existing Template
		$scope.findOne = function() {
			$scope.template = Templates.get({ 
				templateId: $stateParams.templateId
			},function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		$scope.addNew = function(s){
			if (!$scope.template.locations)
				$scope.template.locations = [];
			$scope.template.locations.push({});
		};

		// Confirm before removing
		$scope.confirmRemoveLocation = function( index ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');
			
			if (confirmed === true) {
				$scope.removeLocation( index );
			}
		};

		$scope.removeLocation = function(index){
			$scope.template.locations.splice(index, 1);
		};

		$scope.moveLocationUp = function(index){
			index = parseInt(index);
			if (index === 0)
			 	return;

			var newPos = index - 1;
			$scope.template.locations.splice(newPos, 0, $scope.template.locations.splice(index, 1)[0]);
		};

		$scope.moveLocationDown = function(index){
			index = parseInt(index);
			if (index === ($scope.template.locations.length - 1))
				return;

			var newPos = index + 1;
			$scope.template.locations.splice(newPos, 0, $scope.template.locations.splice(index, 1)[0]);
		};

	}
]);

'use strict';

// Contenttypes controller
angular.module('contenttypes').controller('ContenttypesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Contenttypes', '_',
	function($scope, $stateParams, $location, Authentication, Contenttypes, _ ) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.canEdit())
			$location.path('pages');

		$scope.contenttype = {};
		$scope.fieldTypes = ['text', 'textarea', 'select', 'multi-select', 'image', 'collection'];

		$scope.initNew = function(){
			$scope.loaded = true;
		};

		// Create new Contenttype
		$scope.create = function() {
			// Create new Contenttype object
			mapContentType();
			var contenttype = new Contenttypes ($scope.contenttype);

			// Redirect after save
			contenttype.$save(function(response) {
				$location.path('contenttypes/' + response.id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Confirm before removing
		$scope.confirmRemove = function( contenttype ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');
			
			if (confirmed === true) {
				$scope.remove( contenttype );
			}
		};

		// Remove existing Contenttype
		$scope.remove = function( contenttype ) {
			if ( contenttype ) { contenttype.$remove();

				for (var i in $scope.contenttypes ) {
					if ($scope.contenttypes [i] === contenttype ) {
						$scope.contenttypes.splice(i, 1);
					}
				}
			} else {
				$scope.contenttype.$remove(function() {
					$location.path('contenttypes');
				});
			}
		};

		var mapContentType = function(){
			angular.forEach($scope.contenttype.fields, function(field){
				field.type = field.type.selected;
				if (field.options){
					field.options = field.options.replace(/[\s,]+/g, ',').split(',');
				}
			});
			
		};

		// Update existing Contenttype
		$scope.update = function() {
			mapContentType();
			var contenttype = $scope.contenttype;

			contenttype.$update(function() {
				$location.path('contenttypes/' + contenttype.id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find a list of Contenttypes
		$scope.find = function() {
			$scope.contenttypes = Contenttypes.query(function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		// Find existing Contenttype
		$scope.findOne = function() {
			$scope.contenttype = Contenttypes.get({ 
				contenttypeId: $stateParams.contenttypeId
			},function(value, responseHeaders){
				$scope.loaded = true;
			});

			$scope.contenttype.$promise.then(function(contenttype){
				angular.forEach(contenttype.fields, function(field){
					var t = _.find($scope.fieldTypes, function(f) { return f === field.type; });
					field.showOptions = (t.indexOf('select') !== -1);

					if (t === 'text') {
						field.showCharCount = true;
					} else {
						field.showCharCount = false;
					}

					field.type = {};
					field.type.selected = t;
					if (field.options)
						field.options = field.options.join(',');
					
				});
				
			});
		};

		$scope.addNew = function(){
			
			if (!$scope.contenttype.fields)
				$scope.contenttype.fields = [];
			$scope.contenttype.fields.push({name: 'New Field'});
		};

		// Confirm before removing field
		$scope.confirmRemoveField = function( index ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');
			
			if (confirmed === true) {
				$scope.removeField( index );
			}
		};

		$scope.removeField = function(index){
			$scope.contenttype.fields.splice(index, 1);
		};

		$scope.changeTypes = function(index, t){
			var field = $scope.contenttype.fields[index];

			field.showOptions = (t.indexOf('select') !== -1);

			if (t === 'text') {
				field.showCharCount = true;
			} else {
				field.showCharCount = false;
			}
		};

		$scope.moveItemUp = function(index){
			index = parseInt(index);
			if (index === 0)
			 	return;

			var newPos = index - 1;
			$scope.contenttype.fields.splice(newPos, 0, $scope.contenttype.fields.splice(index, 1)[0]);
		};

		$scope.moveItemDown = function(index){
			index = parseInt(index);
			if (index === ($scope.contenttype.fields.length - 1))
				return;

			var newPos = index + 1;
			$scope.contenttype.fields.splice(newPos, 0, $scope.contenttype.fields.splice(index, 1)[0]);
		};
	}
]);

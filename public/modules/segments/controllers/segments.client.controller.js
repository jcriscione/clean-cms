'use strict';

// Segments controller
angular.module('segments').controller('SegmentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Segments', '_',
	function($scope, $stateParams, $location, Authentication, Segments, _ ) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.canEdit())
			$location.path('pages');

		$scope.segment = {};
		$scope.fieldTypes = ['text', 'textarea', 'select', 'multi-select'];

		$scope.initNew = function(){
			$scope.loaded = true;
		};

		// Create new Segment
		$scope.create = function() {
			// Create new Segment object
			mapSegment();
			var segment = new Segments ($scope.segment);

			// Redirect after save
			segment.$save(function(response) {
				$location.path('segments/' + response.id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Confirm before removing
		$scope.confirmRemove = function( segment ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');
			
			if (confirmed === true) {
				$scope.remove( segment );
			}
		};

		// Remove existing Segment
		$scope.remove = function( segment ) {
			if ( segment ) { segment.$remove();

				for (var i in $scope.segments ) {
					if ($scope.segments [i] === segment ) {
						$scope.segments.splice(i, 1);
					}
				}
			} else {
				$scope.segment.$remove(function() {
					$location.path('segments');
				});
			}
		};

		var mapSegment = function(){
			angular.forEach($scope.segment.fields, function(field){
				field.type = field.type.selected;
			});
			
		};

		// Update existing Segment
		$scope.update = function() {
			mapSegment();
			var segment = $scope.segment;

			segment.$update(function() {
				$location.path('segments/' + segment.id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find a list of Segments
		$scope.find = function() {
			$scope.segments = Segments.query(function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		// Find existing Segment
		$scope.findOne = function() {
			$scope.segment = Segments.get({
				segmentId: $stateParams.segmentId
			},function(value, responseHeaders){
				$scope.loaded = true;
			});

			$scope.segment.$promise.then(function(segment){
				angular.forEach(segment.fields, function(field){
					var t = _.find($scope.fieldTypes, function(f) { return f === field.type; });
					$scope.showOptions = (t.indexOf('select') !== -1);
					field.type = {};
					field.type.selected = t;
					
				});
				
			});
		};

		$scope.addNew = function(){
			
			if (!$scope.segment.fields)
				$scope.segment.fields = [];
			$scope.segment.fields.push({name: 'New Field'});
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

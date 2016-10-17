'use strict';

// Campaigns controller
angular.module('campaigns').controller('CampaignsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Campaigns', '_',
	function($scope, $stateParams, $location, Authentication, Campaigns, _ ) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.canEdit())
		$location.path('pages');

		$scope.campaign = {};
		$scope.fieldTypes = ['text', 'textarea', 'select', 'multi-select'];

		$scope.initNew = function(){
			$scope.loaded = true;
		};

		// Create new Campaign
		$scope.create = function() {
			// Create new Campaign object
			mapCampaign();
			var campaign = new Campaigns ($scope.campaign);

			// Redirect after save
			campaign.$save(function(response) {
				$location.path('campaigns/' + response.id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// // Confirm before removing
		$scope.confirmRemove = function( campaign ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');
			
			if (confirmed === true) {
				$scope.remove( campaign );
			}
		};

		// // Remove existing Campaign
		$scope.remove = function( campaign ) {
			if ( campaign ) { campaign.$remove();

				for (var i in $scope.campaigns ) {
					if ($scope.campaigns [i] === campaign ) {
						$scope.campaigns.splice(i, 1);
					}
				}
			} else {
				$scope.campaign.$remove(function() {
					$location.path('campaigns');
				});
			}
		};

		var mapCampaign = function(){
			angular.forEach($scope.campaign.fields, function(field){
				field.type = field.type.selected;
			});
			
		};

		// // Update existing Segment
		$scope.update = function() {
			mapCampaign();
			var campaign = $scope.campaign;

			campaign.$update(function() {
				$location.path('campaigns/' + campaign.id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find a list of Campaigns
		$scope.find = function() {
			$scope.campaigns = Campaigns.query(function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		// Find existing Campaign
		$scope.findOne = function() {
			$scope.campaign = Campaigns.get({
				campaignId: $stateParams.campaignId
			},function(value, responseHeaders){
				$scope.loaded = true;
			});

			$scope.campaign.$promise.then(function(campaign){
				angular.forEach(campaign.fields, function(field){
					var t = _.find($scope.fieldTypes, function(f) { return f === field.type; });
					$scope.showOptions = (t.indexOf('select') !== -1);
					field.type = {};
					field.type.selected = t;
					
				});
				
			});
		};
	}
]);

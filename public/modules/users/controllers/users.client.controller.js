'use strict';

angular.module('users').controller('UserController', ['$scope', '$stateParams', '$location', '$q', 'Authentication', 'Users', '_',
	function($scope, $stateParams, $location, $q, Authentication, Users, _) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.isAdmin())
			$location.path('pages');

		$scope.user = {};
		$scope.roles = ['admin', 'editor', 'preview only', 'none'];

		function validatePassword(password, confirm, existing){
			if (existing && (!password || password.length === 0))
				return true;

			if ((!password || password.length === 0) || password !== confirm){
				$scope.error = 'Passwords must match.';
				return false;
			}

			return true;
		}

		$scope.initNew = function(){
			$scope.loaded = true;
		};

		var mapUser = function(){
			if ($scope.user.roles && $scope.user.roles.selected){
				$scope.user.roles = [$scope.user.roles.selected];
			}
		};

		$scope.create = function() {
			mapUser();
			var user = new Users($scope.user);
			if (validatePassword(user.password, $scope.confirmPassword, false)){
				user.$save(function(response) {
					$location.path('users/' + response.id);
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		// Confirm before removing
		$scope.confirmRemove = function( user ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');
			
			if (confirmed === true) {
				$scope.remove( user );
			}
		};

		$scope.remove = function(user) {
			if (user) {
				user.$remove();

				for (var i in $scope.users) {
					if ($scope.users[i] === user) {
						$scope.users.splice(i, 1);
					}
				}
			} else {
				$scope.user.$remove(function() {
					$location.path('users');
				});
			}
		};

		$scope.update = function() {
			mapUser();
			var user = $scope.user;
			if (validatePassword(user.password, $scope.confirmPassword, true)){
				user.$update(function() {
					$location.path('users/' + user.id);
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find a list of Users
		$scope.find = function() {
			$scope.users = Users.query();
		};

		// Find existing User
		$scope.findOne = function() {
			$scope.user = Users.get({
				userId: $stateParams.userId
			},function(value, responseHeaders){
				$scope.loaded = true;
			});

			$scope.user.$promise.then(function(user){
				if (user.roles && user.roles.length > 0){
					$scope.user.roles = { selected: user.roles[0] };
				}
			});				
		};

		
	}
]);

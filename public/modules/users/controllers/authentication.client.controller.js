'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('pages');

		function validatePassword(password, confirm){
			
			if ((!password || password.length === 0) || password !== confirm){
				$scope.error = 'Passwords must match.';
				return false;
			}

			return true;
		}

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('pages');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signup = function() {
			if (validatePassword($scope.credentials.password, $scope.confirmPassword)){
				$http.post('/auth/signup', $scope.credentials).success(function(response) {
					// And redirect to the thanks page
					$location.path('/thanks');
				}).error(function(response) {
					$scope.error = response.message;
				});
			}
		};
	}
]);
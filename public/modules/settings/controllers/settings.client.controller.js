'use strict';

// Settings controller
angular.module('settings').controller('SettingsController', ['$scope', '$stateParams', '$location', '$timeout', 'Authentication', 'Settings', '_',
	function($scope, $stateParams, $location, $timeout, Authentication, Settings, _) {
		$scope.authentication = Authentication;

		if (!$scope.authentication.canEdit())
			$location.path('pages');

		$scope.showEdit = false;
		$scope.settings = {};
		$scope.alerts = [];


		// Update existing Setting
		$scope.update = function() {
			var settings = angular.copy($scope.settings);

			settings.$update(function() {
				$scope.alerts.push({ type: 'success', msg: 'Settings have been updated!' });
				$timeout(function(){ $scope.alerts = []; }, 5000);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find existing Setting
		$scope.findOne = function() {
			$scope.settings = Settings.get({},function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		$scope.addLanguage = function(){
			var language = {name: $scope.language, locale: $scope.locale};
			$scope.settings.languages.push(language);
			$scope.settings.dictionary[$scope.locale] = [];
			for (var current in $scope.settings.dictionary){
				_.each($scope.settings.dictionary[current], $scope.pushKey(current));
				break;
			}


			
			$scope.locale = '';
			$scope.language = '';
			$scope.showEdit = false;
		};

        $scope.pushKey = function(item){
            $scope.settings.dictionary[$scope.locale].push({key: item.key, name: item.name, value: ''});
        };

		$scope.removeLanguage = function(index){
			$scope.settings.languages.splice(index, 1);
		};

		$scope.showEditor = function(){
			$scope.showEdit = true;
		};

		$scope.changeLanguage = function(language){
			$scope.activeLanguage = language.locale;
		};

		$scope.addKey = function(key){
			_.each($scope.settings.languages, function(language){
				$scope.settings.dictionary[language.locale].push(angular.copy(key));
			});
			
			key = {};
		};

		$scope.removeKey = function(key){
			_.each($scope.settings.languages, function(language){
				$scope.settings.dictionary[language.locale] = _.filter($scope.settings.dictionary[language.locale], function(item){
					return item.name !== key.name;
				});
			});
		};

		$scope.addFilter = function(){
			if (!$scope.settings.filters)
				$scope.settings.filters = [];

			$scope.settings.filters.push({});
		};

		$scope.removeFilter = function(index){
			$scope.settings.filters.splice(index, 1);
		};
	}
]);

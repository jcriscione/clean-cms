'use strict';

// Contents controller
angular.module('contents').controller('ContentsController', ['$scope', '$stateParams', '$location', '$q', 'Authentication', 'Contents', 'Contenttypes', 'Roles', 'Segments', 'Settings', 'Campaigns', '_',
	function($scope, $stateParams, $location, $q, Authentication, Contents, Contenttypes, Roles, Segments, Settings, Campaigns, _ ) {
		$scope.authentication = Authentication;
		$scope.content = { filters: {} };

		$scope.fields = [];

		var loadSettings = function(){
			var deferred = $q.defer();
			Settings.get({}, function(settings){
				$scope.settings = angular.copy(settings);
				$scope.activeLanguage = settings.languages[0];
				deferred.resolve();
				$scope.loaded = true;
			});
			return deferred.promise;
		};

		/*
		var loadRoles = function(){
			var deferred = $q.defer();
			Roles.query({}, function(roles){
				$scope.roles = angular.copy(roles);
				deferred.resolve();
			});
			return deferred.promise;
		};

		var loadCampaigns = function(){
			var deferred = $q.defer();
			Campaigns.query({}, function(campaigns){
				$scope.campaigns = angular.copy(campaigns);
				deferred.resolve();
			});
			return deferred.promise;
		};

		var loadSegments = function(){
			var deferred = $q.defer();
			Segments.query({}, function(segments){
				$scope.segments = angular.copy(segments);
				deferred.resolve();
			});
			return deferred.promise;
		};
		*/
		var loadContentTypes = function(){
			var deferred = $q.defer();
			Contenttypes.query({}, function(contenttypes){
				$scope.contenttypes = angular.copy(contenttypes);
				//console.log($scope.contenttypes);
				deferred.resolve();
			});
			return deferred.promise;
		};

		var validateFilters = function(){
			var valid = true;
			_.each($scope.settings.filters, function(val, key){
				if (val.required){
					if (!$scope.content.filters || !$scope.content.filters[val.name] || $scope.content.filters[val.name].length === 0){
						$scope.settings.filters[key].invalid = true;
						valid = false;
					}
				}
			});
			return valid;
		};

		var mapContent = function(){
			if (!$scope.content.filters)
				$scope.content.filters = {};
			/*
			if ($scope.content.filters.role && $scope.content.filters.role.selected)
				$scope.content.filters.role = $scope.content.filters.role.selected.name;
			if ($scope.content.filters.segment && $scope.content.filters.segment.selected)
				$scope.content.filters.segment = $scope.content.filters.segment.selected.name;
			if ($scope.content.filters.campaigns)
				$scope.content.filters.campaigns = _.map($scope.content.filters.campaigns, function(campaign){
					return campaign.filter_label;
				});
			*/
			_.each($scope.content.filters, function(val, key){
				if (_.isArray(val)){
					$scope.content.filters[key] = _.map(val, function(tag){
						if (tag && tag.text)
							return tag.text;
						else
							return tag;
					});
				}
			});
			$scope.content.type = $scope.content.type.selected.name;
		};

		var cloneCollections = function() {
			if (!$scope.content.languages || !$scope.settings.languages)
				return;

			var defaultLanguage = $scope.settings.languages[0].locale;
			var defaultCollections = {};

			_.each($scope.content.languages[defaultLanguage], function(val, key) {
				if (val.isCollection)
					defaultCollections[key] = val;

			});

			if ( _.isEmpty(defaultCollections) )
				return;

			_.each($scope.content.languages, function(fields, language) {
				if (language === defaultLanguage)
					return;

				_.each(defaultCollections, function(val, key) {
					if (fields[key] && fields[key].isUnique)
						return;

					fields[key] = val;
				});
			});
		};

		$scope.initNew = function(){
			loadSettings();
			//loadRoles();
			//loadSegments();
			//loadCampaigns();
			loadContentTypes();
		};

		// Create new Content
		$scope.create = function() {
			// Create new Content object
			if ( !validateFilters() ) {
				alert('Please enter the required content filters.');
				return;
			}

			mapContent();
			cloneCollections();

			var content = new Contents($scope.content);

			// Redirect after save
			content.$save(function(response) {
				$location.path('contents/' + response.id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Confirm before removing
		$scope.confirmRemove = function( content ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');

			if (confirmed === true) {
				$scope.remove( content );
			}
		};

		// Remove existing Content
		$scope.remove = function( content ) {
			if ( content ) { content.$remove();

				for (var i in $scope.contents ) {
					if ($scope.contents [i] === content ) {
						$scope.contents.splice(i, 1);
					}
				}
			} else {
				$scope.content.$remove(function() {
					$location.path('contents');
				});
			}
		};

		// Update existing Content
		$scope.update = function() {
			if ( !validateFilters() ) {
				alert('Please enter the required content filters.');
				return;
			}

			mapContent();
			cloneCollections();

			var content = $scope.content ;

			content.$update(function() {
				$location.path('contents/' + content.id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find a list of Contents
		$scope.find = function() {
			$scope.contents = Contents.query(function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		// Find existing Content
		$scope.findOne = function() {
			loadSettings().then(function(){
				$scope.content = Contents.get({
					contentId: $stateParams.contentId
				},function(value, responseHeaders){
					$scope.loaded = true;
				});
				$scope.content.$promise.then(function(content){
					//fix structure just in case
					if ($scope.content.data)
					{
						$scope.content.languages = {};
						angular.forEach($scope.settings.languages, function(language, i){
							if (i === 0)
								$scope.content.languages[language.locale] = $scope.content.data;
							else
								$scope.content.languages[language.locale] = {};
						});
						$scope.content.data = null;
					}
					if (!$scope.content.filters)
						$scope.content.filters = {};

					_.each($scope.settings.filters, function(filter){
						filter.tags = _.map(filter.tags, function(tag){
							if (_.isArray($scope.content.filters[filter.name]))
								return _.extend(tag, {ticked: _.contains($scope.content.filters[filter.name], tag.text)});
							else
								return _.extend(tag, {ticked: $scope.content.filters[filter.name] === tag.text});
						});
					});

					/*loadRoles().then(function(){
						var t = _.findWhere($scope.roles, {name: content.filters.role});
						$scope.content.filters.role = {};
						$scope.content.filters.role.selected = t;
					});
					loadSegments().then(function(){
						var t = _.findWhere($scope.segments, {name: content.filters.segment});
						$scope.content.filters.segment = {};
						$scope.content.filters.segment.selected = t;
					});*/
					loadContentTypes().then(function(){
						var t = _.findWhere($scope.contenttypes, {name: content.type});
						$scope.content.type = {};
						$scope.content.type.selected = t;
						$scope.fields = t.fields;
					});
					/*loadCampaigns().then(function(){
						if ($scope.content.filters && $scope.content.filters.campaigns){
							$scope.campaigns = _.map($scope.campaigns, function(campaign){
								return _.extend(campaign, {ticked: _.contains($scope.content.filters.campaigns, campaign.filter_label)});
							});
						}
					});*/
				});
			});

		};

		$scope.changeLanguage = function(language){
			$scope.activeLanguage = language;
		};

		$scope.changeContentType = function(contenttype){
			$scope.fields = contenttype.fields;
		};
	}
]);









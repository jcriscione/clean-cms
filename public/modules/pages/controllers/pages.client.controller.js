'use strict';

// Pages controller
angular.module('pages').controller('PagesController', ['$scope', '$stateParams', '$location', '$q', '$http', 'Authentication', 'Pages','Templates', 'Contents', 'Settings', '_',
	function($scope, $stateParams, $location, $q, $http, Authentication, Pages, Templates, Contents, Settings, _ ) {
		$scope.authentication = Authentication;
		$scope.page = {
			type: 'nww_site',
			sort: 0
		};

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

		$scope.initNew = function(){
			loadSettings();
		};

		$scope.dropdown = function(node){
			return {
		    text: 'Another action',
		    href: '#anotherAction'
		  };
		};

		// Create new Page
		$scope.create = function() {

			//mapPage();

			// Create new Page object
			var page = new Pages ($scope.page);

			// Redirect after save
			page.$save(function(response) {
				$location.path('pages/' + response.id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Confirm before removing
		$scope.confirmRemove = function( page ) {
			var confirmed = window.confirm('Are you sure you want to delete this item?');

			if (confirmed === true) {
				$scope.remove( page );
			}
		};

		// Remove existing Page
		$scope.remove = function( page ) {
			if ( page ) { page.$remove();

				for (var i in $scope.pages ) {
					if ($scope.pages [i] === page ) {
						$scope.pages.splice(i, 1);
					}
				}
			} else {
				$scope.page.$remove(function() {
					$location.path('pages');
				});
			}
		};

		// Update existing Page
		$scope.update = function() {
			//mapPage();
			var page = $scope.page ;

			page.$update(function() {
				$location.path('pages/' + page.id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//initial state for loader css class
		$scope.loaded = false;

		// Find a list of Pages
		$scope.find = function() {
			$scope.pages = Pages.query(function(value, responseHeaders){
				$scope.loaded = true;
			});
		};

		// Get a list of Pages for the tree view
		$scope.getSiteTree = function() {
			$scope.tree = Pages.tree(function(value, responseHeaders) {
				$scope.loaded = true;
			});
		};

		// AngularJS interface to Underscore/lodash's _.findWhere()
		$scope.findWhere = function(collection, search) {
			return _.findWhere(collection, search);
		};

		// Find existing Page
		$scope.findOne = function() {
			$scope.page = Pages.get({
				pageId: $stateParams.pageId
			},function(value, responseHeaders){
				$scope.loaded = true;
			});
			$scope.page.$promise.then(function(page){
				loadSettings().then(function(){
					//fix page structure
					if (!$scope.page.languages){
						$scope.page.languages = {};
						angular.forEach($scope.settings.languages, function(language, i){
							if (i === 0)
							$scope.page.languages[language.locale] = _.pick($scope.page, 'page_title', 'canonical_url', 'og_url', 'og_description', 'og_title', 'og_image', 'page_description', 'page_keywords');
						});
					}
				});
			});

		};

		$scope.getPages = function(val) {
		    return $http.get('/pages/typeahead', {
		      params: {
		        q: val
		      }
		    }).then(function(response){
		      return response.data;
		    });
		  };

		$scope.getTemplates = function(val) {
		    return $http.get('/templates/typeahead', {
		      params: {
		        q: val
		      }
		    }).then(function(response){
		      return response.data;
		    });
		  };

		$scope.getContent = function(val) {
		    return $http.get('/contents/typeahead', {
		      params: {
		        q: val
		      }
		    }).then(function(response){
		      return response.data;
		    });
		  };

		$scope.onContentSelect = function(item, locationIndex, contentIndex){
			$scope.page.locations[locationIndex].contents[contentIndex] = item;
		};

		$scope.onTemplateSelect = function(item){
			Templates.get({templateId: item._id}, function(t){
				$scope.page.locations = angular.copy(t.locations);
			});
		};

		$scope.publishPage = function(p){
			var page = new Pages (p);
			page.$publish({pageId: $scope.page._id}, function(result){

				alert('Successfully published!');
			});
		};


		$scope.changeTemplate = function(template){
			$scope.page.locations = angular.copy(template.locations);
		};

		$scope.addContentToLocation = function(index){
			if (!$scope.page.locations[index].contents)
				$scope.page.locations[index].contents = [];
			$scope.page.locations[index].contents.push({});
		};

		$scope.removeContentFromLocation = function(index, itemIndex){
			$scope.page.locations[index].contents.splice(itemIndex, 1);
		};

		$scope.moveItemUp = function(index, itemIndex){
			if (itemIndex === 0)
				return;

			var newPos = itemIndex - 1;
			$scope.page.locations[index].contents.splice(newPos, 0, $scope.page.locations[index].contents.splice(itemIndex, 1)[0]);
		};

		$scope.moveItemDown = function(index, itemIndex){
			if (itemIndex === ($scope.page.locations[index].contents.length - 1))
				return;

			var newPos = itemIndex + 1;
			$scope.page.locations[index].contents.splice(newPos, 0, $scope.page.locations[index].contents.splice(itemIndex, 1)[0]);
		};

		$scope.movePageUp = function(index){
			index = parseInt(index);
			if (index === 0)
				return;

			var newPos = index - 1;
			var pageToMoveUp = _.find($scope.pages, function(p){ return parseInt(p.sort) === index; });
			var pageToMoveDown = _.find($scope.pages, function(p){ return parseInt(p.sort) === newPos; });
			pageToMoveUp.sort = newPos;
			pageToMoveDown.sort = index;

			pageToMoveUp = angular.copy(pageToMoveUp);
			pageToMoveDown = angular.copy(pageToMoveDown);
			pageToMoveUp.$update();
			pageToMoveDown.$update();
		};

		$scope.movePageDown = function(index){
			index = parseInt(index);
			if (index === ($scope.pages.length - 1))
				return;

			var newPos = index + 1;
			var pageToMoveUp = _.find($scope.pages, function(p){ return parseInt(p.sort) === newPos; });
			var pageToMoveDown = _.find($scope.pages, function(p){ return parseInt(p.sort) === index; });
			pageToMoveUp.sort = index;
			pageToMoveDown.sort = newPos;

			pageToMoveUp = angular.copy(pageToMoveUp);
			pageToMoveDown = angular.copy(pageToMoveDown);
			pageToMoveUp.$update();
			pageToMoveDown.$update();
		};

		$scope.changeLanguage = function(language){
			$scope.activeLanguage = language.locale;
		};
	}
]);

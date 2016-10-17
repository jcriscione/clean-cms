'use strict';

(function() {
	// Contents Controller Spec
	describe('Contents Controller Tests', function() {
		// Initialize global variables
		var ContentsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Contents controller.
			ContentsController = $controller('ContentsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Content object fetched from XHR', inject(function(Contents) {
			// Create sample Content using the Contents service
			var sampleContent = new Contents({
				name: 'New Content'
			});

			// Create a sample Contents array that includes the new Content
			var sampleContents = [sampleContent];

			// Set GET response
			$httpBackend.expectGET('contents').respond(sampleContents);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.contents).toEqualData(sampleContents);
		}));

		it('$scope.findOne() should create an array with one Content object fetched from XHR using a contentId URL parameter', inject(function(Contents) {
			// Define a sample Content object
			var sampleContent = new Contents({
				name: 'New Content'
			});

			// Set the URL parameter
			$stateParams.contentId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/contents\/([0-9a-fA-F]{24})$/).respond(sampleContent);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.content).toEqualData(sampleContent);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Contents) {
			// Create a sample Content object
			var sampleContentPostData = new Contents({
				name: 'New Content'
			});

			// Create a sample Content response
			var sampleContentResponse = new Contents({
				_id: '525cf20451979dea2c000001',
				name: 'New Content'
			});

			// Fixture mock form input values
			scope.name = 'New Content';

			// Set POST response
			$httpBackend.expectPOST('contents', sampleContentPostData).respond(sampleContentResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Content was created
			expect($location.path()).toBe('/contents/' + sampleContentResponse._id);
		}));

		it('$scope.update() should update a valid Content', inject(function(Contents) {
			// Define a sample Content put data
			var sampleContentPutData = new Contents({
				_id: '525cf20451979dea2c000001',
				name: 'New Content'
			});

			// Mock Content in scope
			scope.content = sampleContentPutData;

			// Set PUT response
			$httpBackend.expectPUT(/contents\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/contents/' + sampleContentPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid contentId and remove the Content from the scope', inject(function(Contents) {
			// Create new Content object
			var sampleContent = new Contents({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Contents array and include the Content
			scope.contents = [sampleContent];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/contents\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleContent);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.contents.length).toBe(0);
		}));
	});
}());
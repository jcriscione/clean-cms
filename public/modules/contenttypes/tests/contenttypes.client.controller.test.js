'use strict';

(function() {
	// Contenttypes Controller Spec
	describe('Contenttypes Controller Tests', function() {
		// Initialize global variables
		var ContenttypesController,
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

			// Initialize the Contenttypes controller.
			ContenttypesController = $controller('ContenttypesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Contenttype object fetched from XHR', inject(function(Contenttypes) {
			// Create sample Contenttype using the Contenttypes service
			var sampleContenttype = new Contenttypes({
				name: 'New Contenttype'
			});

			// Create a sample Contenttypes array that includes the new Contenttype
			var sampleContenttypes = [sampleContenttype];

			// Set GET response
			$httpBackend.expectGET('contenttypes').respond(sampleContenttypes);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.contenttypes).toEqualData(sampleContenttypes);
		}));

		it('$scope.findOne() should create an array with one Contenttype object fetched from XHR using a contenttypeId URL parameter', inject(function(Contenttypes) {
			// Define a sample Contenttype object
			var sampleContenttype = new Contenttypes({
				name: 'New Contenttype'
			});

			// Set the URL parameter
			$stateParams.contenttypeId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/contenttypes\/([0-9a-fA-F]{24})$/).respond(sampleContenttype);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.contenttype).toEqualData(sampleContenttype);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Contenttypes) {
			// Create a sample Contenttype object
			var sampleContenttypePostData = new Contenttypes({
				name: 'New Contenttype'
			});

			// Create a sample Contenttype response
			var sampleContenttypeResponse = new Contenttypes({
				_id: '525cf20451979dea2c000001',
				name: 'New Contenttype'
			});

			// Fixture mock form input values
			scope.name = 'New Contenttype';

			// Set POST response
			$httpBackend.expectPOST('contenttypes', sampleContenttypePostData).respond(sampleContenttypeResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Contenttype was created
			expect($location.path()).toBe('/contenttypes/' + sampleContenttypeResponse._id);
		}));

		it('$scope.update() should update a valid Contenttype', inject(function(Contenttypes) {
			// Define a sample Contenttype put data
			var sampleContenttypePutData = new Contenttypes({
				_id: '525cf20451979dea2c000001',
				name: 'New Contenttype'
			});

			// Mock Contenttype in scope
			scope.contenttype = sampleContenttypePutData;

			// Set PUT response
			$httpBackend.expectPUT(/contenttypes\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/contenttypes/' + sampleContenttypePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid contenttypeId and remove the Contenttype from the scope', inject(function(Contenttypes) {
			// Create new Contenttype object
			var sampleContenttype = new Contenttypes({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Contenttypes array and include the Contenttype
			scope.contenttypes = [sampleContenttype];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/contenttypes\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleContenttype);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.contenttypes.length).toBe(0);
		}));
	});
}());
'use strict';

(function() {
	// Segments Controller Spec
	describe('Segments Controller Tests', function() {
		// Initialize global variables
		var SegmentsController,
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

			// Initialize the Pages controller.
			SegmentsController = $controller('SegmentsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Page object fetched from XHR', inject(function(Segments) {
			// Create sample Segment using the Segments service
			var sampleSegment = new Segments({
				name: 'New Segment'
			});

			// Create a sample Segments array that includes the new Segment
			var sampleSegments = [sampleSegment];

			// Set GET response
			$httpBackend.expectGET('segments').respond(sampleSegments);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.segments).toEqualData(sampleSegments);
		}));

		it('$scope.findOne() should create an array with one Segment object fetched from XHR using a segmentId URL parameter', inject(function(Segments) {
			// Define a sample Segment object
			var sampleSegment = new Segments({
				name: 'New Segment'
			});

			// Set the URL parameter
			$stateParams.segmentId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/segments\/([0-9a-fA-F]{24})$/).respond(sampleSegment);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.segment).toEqualData(sampleSegment);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Segments) {
			// Create a sample Segment object
			var sampleSegmentPostData = new Segments({
				name: 'New Segment'
			});

			// Create a sample Segment response
			var sampleSegmentResponse = new Segments({
				_id: '525cf20451979dea2c000001',
				name: 'New Segment'
			});

			// Fixture mock form input values
			scope.name = 'New Segment';

			// Set POST response
			$httpBackend.expectPOST('segments', sampleSegmentPostData).respond(sampleSegmentResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Segment was created
			expect($location.path()).toBe('/segments/' + sampleSegmentResponse._id);
		}));

		it('$scope.update() should update a valid Segment', inject(function(Segments) {
			// Define a sample Segment put data
			var sampleSegmentPutData = new Segments({
				_id: '525cf20451979dea2c000001',
				name: 'New Segment'
			});

			// Mock Page in scope
			scope.segment = sampleSegmentPutData;

			// Set PUT response
			$httpBackend.expectPUT(/pages\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/segments/' + sampleSegmentPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid segmentId and remove the Segment from the scope', inject(function(Segments) {
			// Create new Segment object
			var sampleSegment = new Segments({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Segments array and include the Segment
			scope.segments = [sampleSegment];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/segments\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSegment);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.segments.length).toBe(0);
		}));
	});
}());
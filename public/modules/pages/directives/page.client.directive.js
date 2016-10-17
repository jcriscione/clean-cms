'use strict';

/*angular.module('pages').directive('rightClick', function($parse) {
	return {
		scope: false,
		restrict: 'A',
		link: function(scope, element, attrs) {
			var fn = $parse(attrs.rightClick);
			element.bind('contextmenu', function(event) {
				scope.$apply(function() {
					event.preventDefault();
					fn(scope, {$event:event});
				});
			});
		}
	};
});*/


angular.module('pages').directive('treeCollections', function($parse, $compile, RecursionHelper) {
	return {
		priority: 10,
		restrict: 'A',
		replace:  true,
		scope:    {collection: '=model'},
		template:
			'<ul class="tree-collections list-unstyled">' +
			'	<li ng-repeat="content in collection">' +
			'		<span aria-hidden=true ng-if="content.collection.length" class="glyphicon"' +
			'			ng-class="{\'glyphicon-minus\': content.isOpen, \'glyphicon-plus\': !content.isOpen}"' +
			'			ng-click="content.isOpen = !content.isOpen">' +
			'		</span>' +
			'		<span aria-hidden=true ng-if="!content.collection.length"' +
			'			class="glyphicon glyphicon-minus tree-childless">' +
			'		</span>' +
			'		<a ui-sref="editContent({ contentId: content._id })">{{content.name}}</a>' +
			'		<span class="label label-default tree-item-type">' +
			'			<span ng-if="content.collection.length">collection:</span>' +
			'			<span ng-if="!content.collection.length">content:</span>' +
			'			{{content.type}}' +
			'		</span>' +
			'		<div tree-collections model="content.collection"' +
			'			ng-if="content.collection.length" ng-hide="!content.isOpen">' +
			'		</div>' +
			'	</li>' +
			'</ul>',
		compile: function(element) {
			return RecursionHelper.compile(element);
		}
	};
});

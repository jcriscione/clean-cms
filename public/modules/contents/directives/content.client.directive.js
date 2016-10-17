'use strict';

// Store the HTML template for each type of field in $templateCache.
angular.module('contents').run(['$templateCache', function ($templateCache) {
  $templateCache.put('text', '<ng-form name="myForm"><div class="form-group" ng-class="{ \'has-error\' : myForm.$invalid}"><label class="control-label" for="{{field.name}}">{{field.label}}</label><div class="controls"><input type="text" name="{{field.name}}" ng-model="$parent.model" ng-required="{{field.required}}" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" /><p ng-show="myForm.$invalid" class="help-block">{{field.label}} is required.</p></div></div></ng-form>');
  $templateCache.put('text-charcount', '<ng-form name="myForm"><div class="form-group" ng-class="{ \'has-error\' : myForm.$invalid}"><label class="control-label" for="{{field.name}}">{{field.label}}</label><div class="controls"><input type="text" ng-model="$parent.model" ng-required="{{field.required}}" ng-change="onMaxCountChange()" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right"  maxlength="{{field.char_count}}" /><p ng-show="myForm.$invalid" class="help-block">{{field.label}} is required.</p><p> {{ field.char_count - model.length }} chararcters remaining</p></div></div></ng-form>');
  $templateCache.put('textarea', '<ng-form name="myForm"><div class="form-group" ng-class="{ \'has-error\' : myForm.$invalid}"><label class="control-label" for="{{field.name}}">{{field.label}}</label><div class="controls"><textarea tinymce help="{{field.help}}" type="text" ng-required="{{field.required}}" ng-model="model" class="form-control"></textarea><p ng-show="myForm.$invalid" class="help-block">{{field.label}} is required.</p></div></div></ng-form>');
  $templateCache.put('select', '<ng-form name="myForm"><div class="form-group" ng-class="{ \'has-error\' : myForm.$invalid}"><label class="control-label" for="{{field.name}}">{{field.label}}</label><div class="controls"><select style="width: 90%" ng-model="$parent.model" ng-required="{{field.required}}" ng-options="option for option in field.options" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" ></select><p ng-show="myForm.$invalid" class="help-block">{{field.label}} is required.</p></div></div></ng-form>');
  $templateCache.put('multi-select', '<ng-form name="myForm"><div class="form-group" ng-class="{ \'has-error\' : myForm.$invalid}"><label class="control-label" for="{{field.name}}">{{field.label}}</label><div class="controls"><select style="width: 90%" multiple ng-model="$parent.model" ng-required="{{field.required}}" ng-options="option for option in field.options" class="form-control" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" ></select><p ng-show="myForm.$invalid" class="help-block">{{field.label}} is required.</p></div></div></ng-form>');
  $templateCache.put('image', '<div class="form-group">' + '<label class="control-label" for="{{field.name}}">{{field.label}}</label>' + '<div class="controls"><div class="form-group">' + '<label class="control-label" for="image1">XL Desktop Image - Standard</label>' + '<div class="controls"><input type="text" ng-model="$parent.model[\'XLdesktopStandard\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" ></div>' + '<label class="control-label" for="image1">XL Desktop Image - Retina</label>' + '<div class="controls"><input type="text" ng-model="$parent.model[\'XLdesktopRetina\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" ></div>' + '<label class="control-label" for="image1">Desktop Image - Standard</label>' + '<div class="controls"><input type="text" ng-model="$parent.model[\'desktopStandard\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" ></div>' + '</div><div class="form-group">' + '<label class="control-label" for="image2">Desktop Image - Retina</label><div class="controls"><input type="text" ng-model="$parent.model[\'desktopRetina\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" ></div></div><div class="form-group"><label class="control-label" for="image4">Tablet Image Standard</label><div class="controls"><input type="text" ng-model="$parent.model[\'tabletStandard\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right"></div></div><div class="form-group"><label class="control-label" for="image4">Tablet Image Retina</label><div class="controls"><input type="text" ng-model="$parent.model[\'tabletRetina\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right"></div></div><div class="form-group"><label class="control-label" for="image3">Mobile Image - Standard</label><div class="controls"><input type="text" ng-model="$parent.model[\'mobileStandard\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" ></div></div><div class="form-group"><label class="control-label" for="image4">Mobile Image Retina</label><div class="controls"><input type="text" ng-model="$parent.model[\'mobileRetina\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right"></div></div><div class="form-group"><label class="control-label" for="image4">Mobile Image Portrait</label><div class="controls"><input type="text" ng-model="$parent.model[\'mobilePortrait\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right"></div></div><div class="form-group"><label class="control-label" for="image4">Mobile Iphone Landscape</label><div class="controls"><input type="text" ng-model="$parent.model[\'mobileIphone\']" class="form-control" placeholder="{{field.placeholder}}" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right"></div></div><div class="form-group"><label class="control-label" for="alt">Alt Text</label><div class="controls"><input type="text" ng-model="$parent.model[\'altText\']" class="form-control" placeholder="Alt Text" tooltip="{{field.help}}" tooltip-trigger="focus" tooltip-placement="right" /></div></div></div></div>');
  $templateCache.put('collection',
      '<div class="form-group">' +
      '  <label class="control-label">{{field.label}}</label>' +
      '</div>' +
      '<div class="well clearfix">' +
      '  <div ng-if="!isDefaultLang()" class="form-group">' +
      '    <div class="checkbox"><label><input type="checkbox"' +
      '      ng-model="model.isUnique" ng-change="toggleUniqueCollection(model.isUnique)" />' +
      '      Enable unique content items for this language</label>' +
      '    </div>' +
      '  </div>' +
      '  <div ng-show="isDefaultLang() || (!isDefaultLang() && model.isUnique)" class="form-group">' +
      '    <label class="control-label" for="collectionType">Collection Type</label>' +
      '    <div class="controls"><select ng-model="model.collectionType"' +
      '      ng-options="option for option in collectionoptions" class="form-control"></select>' +
      '    </div>' +
      '  </div>' +
      '  <div ng-show="isDefaultLang() || (!isDefaultLang() && model.isUnique)" collection field="field" model="model" parent-content="[$parent.$parent.content]">' +
      '  </div>' +
      '</div>'
  );
}]);

angular.module('contents')
  .directive('dynamicField', function($parse, $compile, $templateCache) {
    return {
      priority: 10,
      restrict: 'A',
      replace: true,
      scope: {field: '=field', model: '=model', defaultLanguage: '=defaultLanguage',
        activeLanguage: '=activeLanguage'},
      //template: '<input type="text" ng-model="model"/>',
      link: function(scope, element, attrs) {

        scope.collectionoptions = ['article','sidebar','carousel', 'accordion', 'drawer','static', 'playlist', 'tile_1col', 'tile_2col', 'tile_3col', 'tile_4col', 'ordered_list', 'hero_carousel','grid','pushmepullyou','sidebar','tile-detail-carousel','flipper','labelled_list'];
        var tid = scope.field.type;

        if (tid === 'text' && scope.field.showCharCount && parseInt(scope.field.char_count) > 0) {
          tid = 'text-charcount';
        }

        var template = $templateCache.get(tid);

        element.html(template);

        $compile(element.contents())(scope);

        scope.onMaxCountChange = function() {
          var el_p = element[0].getElementsByTagName('p')[0];
          var el_i = element[0].getElementsByTagName('input')[0];

          var charsRemaining = scope.field.char_count - el_i.value.length;
          el_p.innerText = charsRemaining + ' characters remaining';
        };

        scope.isDefaultLang = function() {
          return scope.defaultLanguage === scope.activeLanguage;
        };

        scope.toggleUniqueCollection = function(isUnique) {
          scope.model = {'items': [], 'isUnique': isUnique, isCollection: true};
        };

      }
    };
  });


angular.module('contents')
  .directive('collection', ['$parse', '$compile', '$http', '_', function($parse, $compile, $http, _) {
    return {
      restrict: 'A',
      replace: true,
      scope: {field: '=', model: '=', parentContent: '='},
      template:
        '<div>' +
        '  <button type="button" class="btn btn-primary pull-right" ng-click="addContentToCollection()">' +
        '    Add Content</button>' +
        '  <div class="form-group" ng-class="{\'has-error\': myForm.$invalid}"' +
        '    ng-repeat="content in model.items track by $index"><br/>' +
        '    <ng-form name="myForm">' +
        '      <div class="controls">' +
        '        <div class="pull-right">' +
        '          <button type="button" class="btn-up" ng-click="moveContentUp($index)"' +
        '            ng-disabled="$first"></button>' +
        '          <button type="button" class="btn-down" ng-click="moveContentDown($index)"' +
        '            ng-disabled="$last"></button>' +
        '          <button type="button" class="btn-remove" ng-click="removeContent($index)">' +
        '            </button>' +
        '        </div>' +
        '        <div class="input-group">' +
        '          <input type="text" ng-model="content" placeholder="Enter a content item"' +
        '            typeahead="item as item.name for item in findContentByName($viewValue, parentContent)"' +
        '            typeahead-on-select="onContentSelect($item, $index, parentContent[0])"' +
        '            typeahead-editable="false" typeahead-input-formatter="$model.name"' +
        '            class="form-control" required />' +
        '          <span class="input-group-addon">' +
        '            <a ui-sref="editContent({contentId: content._id})" ng-if="content._id">' +
        '            <span aria-hidden=true class="glyphicon glyphicon-edit"></span>' +
        '          </a>' +
        '          <a ng-if="!content._id">' +
        '          <span aria-hidden=true class="glyphicon glyphicon-edit"></span></a></span>' +
        '        </div>' +
        '        <p ng-show="myForm.$invalid" class="help-block">Content is required.</p>' +
        '      </div>' +
        '    </ng-form>' +
        '  </div>' +
        '</div>',
      link: function(scope, element, attrs) {

        scope.addContentToCollection = function() {
          if (!scope.model)
            scope.model = {items: [{}], isCollection: true};

          if (scope.model.items)
            scope.model.items.push({});
          else
            scope.model.items = [{}];

        };

        scope.removeContent = function(itemIndex) {
          scope.model.items.splice(itemIndex, 1);
        };

        scope.moveContentUp = function(itemIndex) {
          if (itemIndex === 0)
            return;

          var newPos = itemIndex - 1;
          scope.model.items.splice(newPos, 0, scope.model.items.splice(itemIndex, 1)[0]);
        };

        scope.moveContentDown = function(itemIndex){
          if (itemIndex === (scope.model.items.length - 1))
            return;

          var newPos = itemIndex + 1;
          scope.model.items.splice(newPos, 0, scope.model.items.splice(itemIndex, 1)[0]);
        };

        scope.findContentByName = function(val, exclude) {
          return $http.get('/contents/typeahead', {
            params: {
              q: val
            }
          }).then(function(response) {
            if (angular.isArray(exclude) && exclude.length) {
              var excludeIds = _.pluck(exclude, '_id');

              return _.filter(response.data, function(content) {
                return !_.contains(excludeIds, content._id);
              });
            } else {
              return response.data;
            }
          });
        };

        scope.getContentById = function(id) {
          return $http.get('contents/' + id, {
          }).then(function(response) {
            return response.data;
          });
        };

        scope.onContentSelect = function(item, contentIndex, parentContent) {
          var activeLanguage = scope.$parent.activeLanguage || scope.$parent.defaultLanguage;
          var collectionIds  = [];

          var getCollectionIds = function(field, fieldKey) {
              // {list: {items: []}} structure check for backward compatibility
              if ( _.has(field, 'items') && (fieldKey === 'list' || field.isCollection) ) {
                collectionIds = collectionIds.concat( _.pluck(field.items, '_id') );

                _.each(field.items, function(item) {
                  _.each(item, function(itemField, itemFieldKey) {
                    getCollectionIds(itemField, itemFieldKey);
                  });
                });
              }
          };

          scope.getContentById(item._id).then(function(content) {
            if (!content.languages || !activeLanguage || !content.languages[activeLanguage]) {
              scope.model.items[contentIndex] = item;
            } else {
              _.each(content.languages[activeLanguage], function(val, key) {
                getCollectionIds(val, key);
              });

              collectionIds = _.uniq( _.filter(collectionIds, function(id) {
                return !_.isUndefined(id) && !_.isNull(id);
              }) );

              if ( _.contains(collectionIds, parentContent._id) ) {
                scope.content = {};
                scope.model.items[contentIndex] = {};
                alert('ERROR: "' + item.name + '" already has "' + parentContent.name + '" in a collection.');
              } else {
                scope.model.items[contentIndex] = item;
              }
            }
          });
        };

        if (!scope.model)
          scope.model = {items: [], isCollection: true};
        else if (!scope.model.isCollection)  // Backward compatibility
          scope.model.isCollection = true;

      }
    };
  }]);

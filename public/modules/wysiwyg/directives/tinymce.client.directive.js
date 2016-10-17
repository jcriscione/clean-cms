/**
 * @author sam.elwitt@ogilvy.com
 * refactor of angular-ui-tinymce
 */

'use strict';

/*globals tinymce*/

angular.module('wysiwyg').directive('tinymce', ['$timeout',
	function($timeout) {
		var defaultOptions = {
				toolbar: 'undo redo | bold italic superscript | bullist blockquote | link | code',
				menubar : false,
				width: '50%'
			},
			i = 0;
		return {
			require: 'ngModel',
			link: function (scope, elm, attrs, ngModel) {

				var inlineOptions = attrs.tinymce ? attrs.tinymce : {},
					options, tinyInstance, label, tooltip;

				if (!attrs.id) {
					attrs.$set('id', 'uiTinymce' + i++);
				}

				function strip_tags (str, allowed_tags)
				{

					var allowed = false,
						matches = [],
						allowed_array = [],
						allowed_tag = '',
						i = 0,
						k = '',
						html = '',
						replacer = function (search, replace, str) {
						return str.split(search).join(replace);
					};
					// Build allowes tags associative array
					if (allowed_tags) {
						allowed_array = allowed_tags.match(/([a-zA-Z0-9]+)/gi);
					}
					str += '';

					// Match tags
					matches = str.match(/(<\/?[\S][^>]*>)/gi);
					// Go through all HTML tags
					for (var key in matches) {
						if (isNaN(key)) {
							// IE7 Hack
							continue;
						}

						// Save HTML tag
						html = matches[key].toString();
						// Is tag not in allowed list? Remove from str!
						allowed = false;

						// Go through all allowed tags
						for (k in allowed_array) {            // Init
							allowed_tag = allowed_array[k];
							i = -1;

							if (i !== 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+'>');}
							if (i !== 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+' ');}
							if (i !== 0) { i = html.toLowerCase().indexOf('</'+allowed_tag)   ;}

							// Determine
							if (i === 0) {                allowed = true;
								break;
							}
						}
						if (!allowed) {
							str = replacer(html, '', str); // Custom replace. No regexing
						}
					}
					return str;
				}

				options = {

					// Update model when using the editor
					setup: function (ed) {

						ed.on('init', function(args) {
							ngModel.$render();

							if (attrs.help) {

								tooltip = '<div id="tooltip-' + ed.id +'" class="wysiwyg-tooltip tooltip right" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + attrs.help + '</div></div>';
								label = angular.element(ed.editorContainer).parent().parent().find('label');
								angular.element(label).before(tooltip);
							}
						});
						ed.on('focus', function (e) {
							angular.element(document.getElementById('tooltip-' + ed.id)).addClass('active');
						});
						ed.on('blur', function (e) {
							angular.element(document.getElementById('tooltip-' + ed.id)).removeClass('active');
						});
						ed.on('ExecCommand', function (e) {
							ed.save();
							updateView();
						});
						ed.on('KeyUp', function (e) {
							ed.save();
							updateView();
						});
						ed.on('SetContent', function (e) {
							if(!e.initial){
								ed.save();
								updateView();
							}
						});
						if (inlineOptions.setup) {
							scope.$eval(inlineOptions.setup);
							delete inlineOptions.setup;
						}
					},
					mode: 'exact',
					elements: attrs.id,
					plugins: 'paste,link,code',
					convert_urls: false,
					paste_preprocess : function(pl, o) {
						//example: keep bold,italic,underline and paragraphs
						//o.content = strip_tags( o.content,'<b><u><i><p>' );

						// remove all tags => plain text
						//o.content = strip_tags( o.content,'<p><sup>' );
					}
				};

				// extend options with initial defaultOptions and inline options from directive attribute value
				angular.extend(options, defaultOptions, inlineOptions);

				$timeout(function () {
					tinymce.init(options);
				});

				ngModel.$render = function() {
					if (!tinyInstance) {
						tinyInstance = tinymce.get(attrs.id);
					}
					if (tinyInstance) {
						tinyInstance.setContent(ngModel.$viewValue || '');
					}
				};

				function updateView() {
					ngModel.$setViewValue(elm.val());
					if (!scope.$root.$$phase) {
						scope.$apply();
					}
				}
			}
		};
	}
]);
'use strict';

module.exports = {
	app: {
		title: 'NewWayToWork',
		description: 'A New Way to Work',
		keywords: 'Mongo, Express, AngularJS, Node.js'
	},
	port: process.env.VCAP_APP_PORT || process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/angular-ui-select/dist/select.css',
				'public/js/angular.treeview/css/angular.treeview.css',
				'public/lib/isteven-angular-multiselect/isteven-multi-select.css',
				'public/lib/ng-tags-input/ng-tags-input.min.css'
			],
			js: [
				'public/lib/ng-file-upload/angular-file-upload-html5-shim.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-ui-select/dist/select.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/ng-file-upload/angular-file-upload.js',
				'public/lib/underscore/underscore.js',
				'public/lib/angular-underscore-module/angular-underscore-module.js',
				'public/js/angular.treeview/angular.treeview.js',
				'public/lib/angular-dynamic-forms/dynamic-forms.js',
				'public/lib/isteven-angular-multiselect/isteven-multi-select.js',
				'public/lib/tinymce/tinymce.min.js',
				'public/lib/ng-tags-input/ng-tags-input.min.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	},
	mailer: {
		user: 'JT35BVZmS3',
		pass: 'B4PE90bHde',
		to: 'jessica.criscione@ogilvy.com',
		from: 'do-not-reply@ogilvy.com',
		subject:  'System message from CLEAN CMS',
		text:     'This is a default message'
	}
};
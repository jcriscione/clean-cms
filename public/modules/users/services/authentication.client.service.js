'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['_',

	function(_) {
		var _this = this;

		_this._data = {
			user: window.user
		};

		_this._data.isAdmin = function(){
			return _.contains(_this._data.user.roles, 'admin');
		};

		_this._data.canEdit = function(){
			return _.contains(_this._data.user.roles, 'admin') || _.contains(_this._data.user.roles, 'editor');
		};

		return _this._data;
	}
]);


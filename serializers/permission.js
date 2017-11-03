'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function PermissionSerializer(user) {

  this.serialize = function () {
    return new JSONAPISerializer('permission', user.permissions, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['flow_id', 'perm'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/users', baseUrl_https, version)
		},
		dataLinks : {
			self : function(user) {
				return sprintf('%s/v%s/users/%s', baseUrl_https, version, user.id);
			},
		},
    });
  };
}

module.exports = PermissionSerializer;

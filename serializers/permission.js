'use strict';
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

function PermissionSerializer(user) {

  this.serialize = function () {
    return new JSONAPISerializer('permission', {
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
    }).serialize(user.permissions);
  };
}

module.exports = PermissionSerializer;

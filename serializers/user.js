'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function UserSerializer(user) {
  this.serialize = function () {
    return new JSONAPISerializer('user', user, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['firstName', 'lastName', 'login', 'email', 'subscription_date', 'update_date', 'permissions', 'gravatar'],
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

module.exports = UserSerializer;

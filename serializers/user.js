'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function UserSerializer(user) {
  this.serialize = function () {
    return new JSONAPISerializer('user', user, {
    	attributes: ['firstName', 'lastName', 'login', 'password', 'email', 'subscription_date', 'update_date', 'permissions'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/users', baseUrl, version)
		},
		dataLinks : {
			self : function(user) {
				return sprintf('%s/v%s/users/%s', baseUrl, version, user.id);
			},
		},
    });
  };
}

module.exports = UserSerializer;

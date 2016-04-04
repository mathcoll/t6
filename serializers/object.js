'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function ObjectTypeSerializer(object) {

  this.serialize = function () {
    return new JSONAPISerializer('object', object, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['name', 'user_id', 'type', 'description', 'position', 'ipv4', 'ipv6'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/objects', baseUrl, version)
		},
		dataLinks : {
			self : function(object) {
				return sprintf('%s/v%s/objects/%s', baseUrl, version, object.id);
			},
			user : function(object) {
				if ( object.user_id!='' ) {
					return sprintf('%s/v%s/users/%s', baseUrl, version, object.user_id);
				} else {
					return null;
				}
			}
		},
    });
  };
}

module.exports = ObjectTypeSerializer;
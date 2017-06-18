'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function ObjectTypeSerializer(object) {

  this.serialize = function () {
	//console.log(object);
    return new JSONAPISerializer('object', object, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['name', 'user_id', 'type', 'description', 'position', 'ipv4', 'ipv6', 'isPublic', 'longitude', 'latitude', 'meta', 'parameters'],
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
			},
			qrcode : {
				low: function(object) {
					return sprintf('%s/v%s/objects/%s/qrcode/8/L', baseUrl, version, object.id);
				},
				meddium: function(object) {
					return sprintf('%s/v%s/objects/%s/qrcode/8/M', baseUrl, version, object.id);
				},
				quality: function(object) {
					return sprintf('%s/v%s/objects/%s/qrcode/8/Q', baseUrl, version, object.id);
				},
				high: function(object) {
					return sprintf('%s/v%s/objects/%s/qrcode/8/H', baseUrl, version, object.id);
				}
			}
		},
    });
  };
}

module.exports = ObjectTypeSerializer;
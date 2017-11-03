'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function MqttTypeSerializer(mqtt) {

  this.serialize = function () {
    return new JSONAPISerializer('mqtt', mqtt, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['name', 'mqtt_id'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/mqtts', baseUrl_https, version)
		},
		dataLinks : {
			self : function(dashboard) {
				return sprintf('%s/v%s/mqtts/%s', baseUrl_https, version, mqtt.id);
			},
		},
    });
  };
}

module.exports = MqttTypeSerializer;
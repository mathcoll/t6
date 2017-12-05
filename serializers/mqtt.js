'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function MqttTypeSerializer(mqtt) {

  this.serialize = function () {
	return new JSONAPISerializer('mqtt', mqtt, {
		keyForAttribute: 'underscore_case',
		attributes: ['name', 'mqtt_id'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/mqtts', baseUrl_https, version),
			self : mqtt.pageSelf!==undefined?sprintf('%s/v%s/mqtts/?page=%s&size=%s', baseUrl_https, version, mqtt.pageSelf, mqtt.size):undefined,
			first : mqtt.pageFirst!==undefined?sprintf('%s/v%s/mqtts/?page=%s&size=%s', baseUrl_https, version, mqtt.pageFirst, mqtt.size):undefined,
			prev : mqtt.pagePrev!==undefined?sprintf('%s/v%s/mqtts/?page=%s&size=%s', baseUrl_https, version, mqtt.pagePrev, mqtt.size):undefined,
			last : mqtt.pageLast!==undefined?sprintf('%s/v%s/mqtts/?page=%s&size=%s', baseUrl_https, version, mqtt.pageLast, mqtt.size):undefined,
			next : mqtt.pageNext!==undefined?sprintf('%s/v%s/mqtts/?page=%s&size=%s', baseUrl_https, version, mqtt.pageNext, mqtt.size):undefined,
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
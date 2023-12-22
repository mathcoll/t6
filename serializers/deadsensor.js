"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function DeadsensorSerializer(deadsensor) {
	this.serialize = function() {
		return new JSONAPISerializer("deadsensor", {
			keyForAttribute: "underscore_case",
			attributes : [ "ttl", "name", "latest_value", "warning", "user_id", "dead_notification", "dead_notification_interval", "dead_notification_latest", "flow_id" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/objects/deadsensors", baseUrl_https, version),
				first : deadsensor.pageFirst!==undefined?sprintf("%s/v%s/objects/deadsensors/?page=%s&size=%s", baseUrl_https, version, deadsensor.pageFirst, deadsensor.size):undefined,
				prev : deadsensor.pagePrev!==undefined?sprintf("%s/v%s/objects/deadsensors/?page=%s&size=%s", baseUrl_https, version, deadsensor.pagePrev, deadsensor.size):undefined,
				next : deadsensor.pageNext!==undefined?sprintf("%s/v%s/objects/deadsensors/?page=%s&size=%s", baseUrl_https, version, deadsensor.pageNext, deadsensor.size):undefined,
				last : deadsensor.pageLast!==undefined?sprintf("%s/v%s/objects/deadsensors/?page=%s&size=%s", baseUrl_https, version, deadsensor.pageLast, deadsensor.size):undefined,
			},
			dataLinks : {
			}
		}).serialize(deadsensor);
	};
}

module.exports = DeadsensorSerializer;

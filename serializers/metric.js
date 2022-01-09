"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function MetricsSerializer(metrics) {
	this.serialize = function() {
		return new JSONAPISerializer("metric", {
			keyForAttribute: "underscore_case",
			attributes : [ "time", "timestamp", "name", "title", "text", "value" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/stories", baseUrl_https, version),
				"meta": {
					"created": metrics.created,
					"name": metrics.name,
					"start": metrics.start,
					"end": metrics.end,
					"retention": metrics.retention,
					"flow_id": metrics.flow_id
				}
			}
		}).serialize(metrics);
	};
}

module.exports = MetricsSerializer;

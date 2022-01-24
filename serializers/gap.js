"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function GapsSerializer(gaps) {
	this.serialize = function() {
		return new JSONAPISerializer("gap", {
			keyForAttribute: "underscore_case",
			attributes : [ "gap_duration", "gap", "end_time", "timestamp" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/stories", baseUrl_https, version),
				"meta": {
					"created": gaps.created,
					"name": gaps.name,
					"start": gaps.start,
					"end": gaps.end,
					"retention": gaps.retention,
					"flow_id": gaps.flow_id,
					"total_missing_values": gaps.total_missing_values
				}
			}
		}).serialize(gaps);
	};
}

module.exports = GapsSerializer;

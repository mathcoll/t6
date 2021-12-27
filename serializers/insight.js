"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function InsightSerializer(insights) {
	this.serialize = function() {
		return new JSONAPISerializer("insight", {
			keyForAttribute: "underscore_case",
			attributes : [ "time", "timestamp", "value", "title", "text", "type", "unit", "category_id", "story" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/stories", baseUrl_https, version),
				"meta": {
					"created": insights.created,
					"name": insights.name,
					"start": insights.start,
					"end": insights.end,
					"retention": insights.retention,
					"flow_id": insights.flow_id
				}
			}
		}).serialize(insights);
	};
}

module.exports = InsightSerializer;

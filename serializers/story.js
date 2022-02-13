"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function StorySerializer(stories) {
	this.serialize = function() {
		return new JSONAPISerializer("stories", {
			keyForAttribute: "underscore_case",
			attributes : [ "user_id", "flow_id", "name", "start", "end", "retention", "meta" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/stories", baseUrl_https, version),
			}
		}).serialize(stories);
	};
}

module.exports = StorySerializer;

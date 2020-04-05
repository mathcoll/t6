"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function ErrorSerializer(error) {
	this.serialize = function() {
		return new JSONAPISerializer("error", {
			keyForAttribute: "underscore_case",
			attributes : [ "code", "message", "details", "stack", "missing_builds" ],
		}).serialize(error);
	};
}

module.exports = ErrorSerializer;

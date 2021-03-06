"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function AccessTokenSerializer(accessToken) {
	this.serialize = function() {
		return new JSONAPISerializer("accessToken", {
			keyForAttribute: "underscore_case",
			attributes : [ "user_id", "key", "secret", "bearer", "memo", "expiration", "device", "user-agent", "geo" ],
		}).serialize(accessToken);
	};
}

module.exports = AccessTokenSerializer;

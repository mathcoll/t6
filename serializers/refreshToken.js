"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function RefreshTokenSerializer(refreshToken) {
	this.serialize = function() {
		return new JSONAPISerializer("refreshToken", {
			keyForAttribute: "underscore_case",
			attributes : [ "user_id", "refresh_token", "expiration", "user-agent", "device-type" ],
		}).serialize(refreshToken);
	};
}

module.exports = RefreshTokenSerializer;

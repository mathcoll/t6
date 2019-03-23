"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function AccessTokenSerializer(accessToken) {
	this.serialize = function() {
		return new JSONAPISerializer("accessToken", {
	    	keyForAttribute: "underscore_case",
			attributes : [ "user_id", "key", "secret", "memo", "expiration" ],
		}).serialize(accessToken);
	};
}

module.exports = AccessTokenSerializer;

"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function AuditSerializer(audit) {
	this.serialize = function() {
		return new JSONAPISerializer("audit", {
			keyForAttribute: "underscore_case",
			attributes : [ "time", "error_id", "status", "what", "where", "who", "result" ],
		}).serialize(audit);
	};
}

module.exports = AuditSerializer;

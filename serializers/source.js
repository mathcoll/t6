"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function SourceSerializer(source) {
	this.serialize = function() {
		return new JSONAPISerializer("source", {
			keyForAttribute: "underscore_case",
			attributes : [ "name", "user_id", "content", "version", "password", "meta" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/sources", baseUrl_https, version),
				self : source.pageSelf!==undefined?sprintf("%s/v%s/sources/?page=%s&size=%s", baseUrl_https, version, source.pageSelf, source.size):undefined,
				first : source.pageFirst!==undefined?sprintf("%s/v%s/sources/?page=%s&size=%s", baseUrl_https, version, source.pageFirst, source.size):undefined,
				prev : source.pagePrev!==undefined?sprintf("%s/v%s/sources/?page=%s&size=%s", baseUrl_https, version, source.pagePrev, source.size):undefined,
				next : source.pageNext!==undefined?sprintf("%s/v%s/sources/?page=%s&size=%s", baseUrl_https, version, source.pageNext, source.size):undefined,
				last : source.pageLast!==undefined?sprintf("%s/v%s/sources/?page=%s&size=%s", baseUrl_https, version, source.pageLast, source.size):undefined,
			}
		}).serialize(source);
	};
}

module.exports = SourceSerializer;

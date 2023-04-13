"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function ModelSerializer(models) {
	this.serialize = function() {
		return new JSONAPISerializer("model", {
			keyForAttribute: "underscore_case",
			attributes : [ "name" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/models", baseUrl_https, version),
				first : categories.pageFirst!==undefined?sprintf("%s/v%s/flows/?page=%s&size=%s", baseUrl_https, version, categories.pageFirst, categories.size):undefined,
				prev : categories.pagePrev!==undefined?sprintf("%s/v%s/flows/?page=%s&size=%s", baseUrl_https, version, categories.pagePrev, categories.size):undefined,
				next : categories.pageNext!==undefined?sprintf("%s/v%s/flows/?page=%s&size=%s", baseUrl_https, version, categories.pageNext, categories.size):undefined,
				last : categories.pageLast!==undefined?sprintf("%s/v%s/flows/?page=%s&size=%s", baseUrl_https, version, categories.pageLast, categories.size):undefined,
			},
			dataLinks : {
			},
			objects: {
				attributes : [],
				dataLinks: {}
			}
		}).serialize(models);
	};
}

module.exports = ModelSerializer;

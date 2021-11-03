"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function CategorySerializer(categories) {
	this.serialize = function() {
		return new JSONAPISerializer("category", {
			keyForAttribute: "underscore_case",
			attributes : [ "name", "color", "description", "meta" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/categories", baseUrl_https, version),
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
		}).serialize(categories);
	};
}

module.exports = CategorySerializer;

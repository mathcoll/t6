"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function ModelSerializer(models) {
	this.serialize = function() {
		return new JSONAPISerializer("model", {
			keyForAttribute: "underscore_case",
			attributes : [ "name", "datasets", "flow_ids", "training_size_ratio", "retention" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/models", baseUrl_https, version),
				first : categories.pageFirst!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageFirst, model.size):undefined,
				prev : categories.pagePrev!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pagePrev, model.size):undefined,
				next : categories.pageNext!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageNext, model.size):undefined,
				last : categories.pageLast!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageLast, model.size):undefined,
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

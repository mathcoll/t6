"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function ModelSerializer(model) {
	this.serialize = function() {
		return new JSONAPISerializer("model", {
			keyForAttribute: "underscore_case",
			attributes : [ "name", "datasets", "flow_ids", "validation_split", "batch_size", "epochs", "continuous_features", "categorical_features", "categorical_features_classes", "history", "current_status", "labels", "min", "max", "retention" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/models", baseUrl_https, version),
				first : model.pageFirst!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageFirst, model.size):undefined,
				prev : model.pagePrev!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pagePrev, model.size):undefined,
				next : model.pageNext!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageNext, model.size):undefined,
				last : model.pageLast!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageLast, model.size):undefined,
			},
			dataLinks : {
				self : function(model) {
					if ( typeof model.id!=="undefined" ) {
						return sprintf("%s/v%s/models/%s", baseUrl_https, version, model.id);
					} else {
						return null;
					}
				},
			},
			objects: {
				attributes : [],
				dataLinks: {}
			}
		}).serialize(model);
	};
}

module.exports = ModelSerializer;

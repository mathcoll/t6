"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function ModelSerializer(model) {
	this.serialize = function() {
		return new JSONAPISerializer("model", {
			keyForAttribute: "underscore_case",
			attributes : [ "name", "datasets", "normalize", "shuffle", "strategy", "data_length", "current_status", "current_status_last_update", "flow_ids", "compile", "validation_split", "batch_size", "epochs", "continuous_features", "categorical_features", "categorical_features_classes", "history", "current_status", "labels", "training_balance", "min", "max", "retention", "process", "notification", "layers", "window_time_frame" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/models", baseUrl_https, version),
				first : model.pageFirst!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageFirst, model.size):undefined,
				prev : model.pagePrev!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pagePrev, model.size):undefined,
				next : model.pageNext!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageNext, model.size):undefined,
				last : model.pageLast!==undefined?sprintf("%s/v%s/models/?page=%s&size=%s", baseUrl_https, version, model.pageLast, model.size):undefined,
			},
			dataLinks : {
				self : function(model) {
					return typeof model.id!=="undefined"?sprintf("%s/v%s/models/%s", baseUrl_https, version, model.id):null;
				},
				train : function(model) {
					return typeof model.id!=="undefined"?sprintf("%s/v%s/models/%s/train", baseUrl_https, version, model.id):null;
				},
				predict : function(model) {
					return typeof model.id!=="undefined"?sprintf("%s/v%s/models/%s/predict", baseUrl_https, version, model.id):null;
				},
				"explain-training" : function(model) {
					return typeof model.id!=="undefined"?sprintf("%s/v%s/models/%s/explain/training", baseUrl_https, version, model.id):null;
				},
				"explain-model" : function(model) {
					return typeof model.id!=="undefined"?sprintf("%s/v%s/models/%s/explain/model", baseUrl_https, version, model.id):null;
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
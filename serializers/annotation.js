"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function AnnotationSerializer(annotations) {
	this.serialize = function() {
		return new JSONAPISerializer("annotation", {
			keyForAttribute: "underscore_case",
			attributes : [ "from_ts", "to_ts", "user_id", "category_id", "flow_id", "meta" ],
			topLevelLinks : {
				parent : sprintf("%s/v%s/categories", baseUrl_https, version),
				first : annotations.pageFirst!==undefined?sprintf("%s/v%s/flows/?page=%s&size=%s", baseUrl_https, version, annotations.pageFirst, annotations.size):undefined,
				prev : annotations.pagePrev!==undefined?sprintf("%s/v%s/flows/?page=%s&size=%s", baseUrl_https, version, annotations.pagePrev, annotations.size):undefined,
				next : annotations.pageNext!==undefined?sprintf("%s/v%s/flows/?page=%s&size=%s", baseUrl_https, version, annotations.pageNext, annotations.size):undefined,
				last : annotations.pageLast!==undefined?sprintf("%s/v%s/flows/?page=%s&size=%s", baseUrl_https, version, annotations.pageLast, annotations.size):undefined,
			},
			dataLinks : {
			},
			objects: {
				attributes : [],
				dataLinks: {}
			}
		}).serialize(annotations);
	};
}

module.exports = AnnotationSerializer;

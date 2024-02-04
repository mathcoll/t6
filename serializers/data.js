"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function DataSerializer(data) {
	this.serialize = function() {
		return new JSONAPISerializer("datapoint", {
			keyForAttribute: "underscore_case",
			attributes : [ "time", "timestamp", "value", "meta", "preprocessor", "fusion", "category_id", "retention" ],
			topLevelLinks : {
				parent	: typeof data.parent!=="undefined"?sprintf("%s/v%s/flows/%s", baseUrl_https, version, data.flow_id):undefined,
				self	: data.pageSelf>0?sprintf("%s/v%s/data/%s?limit=%s&page=%s&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pageSelf, data.sort):undefined,
				first	: data.pageFirst>0?sprintf("%s/v%s/data/%s?limit=%s&page=1&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.sort):undefined,
				prev	: data.pagePrev>0?sprintf("%s/v%s/data/%s?limit=%s&page=%s&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pagePrev, data.sort):undefined,
				next	: data.pageNext>0?sprintf("%s/v%s/data/%s?limit=%s&page=%s&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pageNext, data.sort):undefined,
				last	: data.pageLast>0?sprintf("%s/v%s/data/%s?limit=%s&page=%s&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pageLast, data.sort):undefined,
				unit	: typeof data.unit_id!=="undefined"?sprintf("%s/v%s/units/%s", baseUrl_https, version, data.unit_id):undefined,
				unit_format: data.unit_format,
				category_id: data.category_id,
				datatype: typeof data.datatype_id!=="undefined"?sprintf("%s/v%s/datatypes/%s", baseUrl_https, version, data.datatype_id):undefined,
				title	: data.title,
				ttl		: data.ttl,
			},
			dataLinks : {
				self : function(d) {
					if ( typeof d.id!=="undefined" && d.save===true ) {
						return sprintf("%s/v%s/data/%s/%s", baseUrl_https, version, d.flow_id, d.id);
					} else {
						return undefined;
					}
				},
				category: function(d) {return typeof d.category_id!=="undefined"?sprintf("%s/v%s/classifications/categories/%s", baseUrl_https, version, d.category_id):undefined; },
				unit: function(d) {return typeof d.unit_id!=="undefined"?sprintf("%s/v%s/units/%s", baseUrl_https, version, d.unit_id):undefined; },
				datatype: function(d) {return typeof d.datatype_id!=="undefined"?sprintf("%s/v%s/datatypes/%s", baseUrl_https, version, d.datatype_id):undefined; },
			},
		}).serialize(data);
	};
}

module.exports = DataSerializer;

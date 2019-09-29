"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function DataSerializer(data) {
	this.serialize = function() {
		return new JSONAPISerializer("data", {
			keyForAttribute: "underscore_case",
			attributes : [ "time", "timestamp", "value" ],
			topLevelLinks : {
				parent	: data.parent>0?sprintf("%s/v%s/flows/%s", baseUrl_https, version, data.flow_id):undefined,
				self	: data.pageSelf>0?sprintf("%s/v%s/data/%s?limit=%s&page=%s&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pageSelf, data.sort):undefined,
				first	: data.pageFirst>0?sprintf("%s/v%s/data/%s?limit=%s&page=1&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pageFirst, data.sort):undefined,
				prev	: data.pagePrev>0?sprintf("%s/v%s/data/%s?limit=%s&page=%s&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pagePrev, data.sort):undefined,
				next	: data.pageNext>0?sprintf("%s/v%s/data/%s?limit=%s&page=%s&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pageNext, data.sort):undefined,
				last	: data.pageLast>0?sprintf("%s/v%s/data/%s?limit=%s&page=%s&sort=%s", baseUrl_https, version, data.flow_id, data.limit, data.pageLast, data.sort):undefined,
				title	: data.title,
				ttl		: data.ttl,
				unit	: data.unit,
				datatype: data.datatype,
			},
			dataLinks : {
				self : function(d) {
					if ( typeof d.id!=="undefined" ) {
						return sprintf("%s/v%s/data/%s", baseUrl_https, version, d.id);
					} else {
						return null;
					}
				},
			},
		}).serialize(data);
	};
}

module.exports = DataSerializer;

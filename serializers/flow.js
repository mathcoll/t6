'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function FlowSerializer(flow) {
	this.serialize = function() {
		return new JSONAPISerializer('flow', flow, {
	    	keyForAttribute: 'underscore_case',
			attributes : [ 'name', 'unit', 'objects', 'permission', 'data_type', 'mqtt_topic', 'meta' ],
			topLevelLinks : {
				parent : sprintf('%s/v%s/flows', baseUrl_https, version),
				self : flow.pageSelf!==undefined?sprintf('%s/v%s/flows/?page=%s&size=%s', baseUrl_https, version, flow.pageSelf, flow.size):undefined,
				first : flow.pageFirst!==undefined?sprintf('%s/v%s/flows/?page=%s&size=%s', baseUrl_https, version, flow.pageFirst, flow.size):undefined,
				prev : flow.pagePrev!==undefined?sprintf('%s/v%s/flows/?page=%s&size=%s', baseUrl_https, version, flow.pagePrev, flow.size):undefined,
				last : flow.pageLast!==undefined?sprintf('%s/v%s/flows/?page=%s&size=%s', baseUrl_https, version, flow.pageLast, flow.size):undefined,
				next : flow.pageNext!==undefined?sprintf('%s/v%s/flows/?page=%s&size=%s', baseUrl_https, version, flow.pageNext, flow.size):undefined,
			},
			dataLinks : {
				unit : function(flow) {
					if ( flow.unit_id!='' ) {
						return sprintf('%s/v%s/units/%s', baseUrl_https, version, flow.unit_id);
					} else {
						return null;
					}
				},
				data : function(flow) {
					if ( flow.id!='' ) {
						return sprintf('%s/v%s/data/%s', baseUrl_https, version, flow.id);
					} else {
						return null;
					}
				},
				self : function(flow) {
					if ( flow.id!='' ) {
						return sprintf('%s/v%s/flows/%s', baseUrl_https, version, flow.id);
					} else {
						return null;
					}
				},
			},
			objects: {
				attributes : [ 'object_id' ],
				dataLinks: {
					self: function (flow) {
						return sprintf('%s/v%s/objects/%s', baseUrl_https, version, flow.object_id);
					}
				}
			}
		});
	};
}

module.exports = FlowSerializer;

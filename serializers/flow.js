'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function FlowSerializer(flow) {
	this.serialize = function() {
		return new JSONAPISerializer('flow', flow, {
			attributes : [ 'name', 'unit', 'objects', 'permission' ],
			topLevelLinks : {
				parent : sprintf('%s/v%s/flows', baseUrl, version)
			},
			dataLinks : {
				unit : function(flow) {
					if ( flow.unit_id!='' ) {
						return sprintf('%s/v%s/units/%s', baseUrl, version, flow.unit_id);
					} else {
						return null;
					}
				},
				data : function(flow) {
					if ( flow.id!='' ) {
						return sprintf('%s/v%s/data/%s', baseUrl, version, flow.id);
					} else {
						return null;
					}
				},
				self : function(flow) {
					if ( flow.id!='' ) {
						return sprintf('%s/v%s/flows/%s', baseUrl, version, flow.id);
					} else {
						return null;
					}
				},
			},
			objects: {
				attributes : [ 'object_id' ],
				dataLinks: {
					self: function (flow) {
						return sprintf('%s/v%s/objects/%s', baseUrl, version, flow.object_id);
					}
				}
			}
		});
	};
}

module.exports = FlowSerializer;

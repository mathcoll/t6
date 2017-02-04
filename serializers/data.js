'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function DataSerializer(data) {
	this.serialize = function() {
		return new JSONAPISerializer('data', data, {
	    	keyForAttribute: 'underscore_case',
			attributes : [ 'id', 'flow_id', 'time', 'timestamp', 'value', 'publish', 'mqtt_topic', 'datatype' ],
			topLevelLinks : {
				parent	: data.parent>0?sprintf('%s/v%s/flows/%s', baseUrl, version, data.flow_id):null,
				first	: data.first>0?sprintf('%s/v%s/data/%s?limit=%s&page=1&order=%s', baseUrl, version, data.flow_id, data.limit, data.prev, data.order):null,
				prev	: data.prev>0?sprintf('%s/v%s/data/%s?limit=%s&page=%s&order=%s', baseUrl, version, data.flow_id, data.limit, data.prev, data.order):null,
				next	: data.next>0?sprintf('%s/v%s/data/%s?limit=%s&page=%s&order=%s', baseUrl, version, data.flow_id, data.limit, data.next, data.order):null,
				/*last	: data.last>0?sprintf('%s/v%s/data/%s/p5', baseUrl, version, data.flow_id, data.flow_id):null,*/
				title	: data.title,
				ttl		: data.ttl,
				unit	: data.unit,
				datatype: data.datatype,
			},
			dataLinks : {
				//self	:  sprintf('%s/v%s/data/%s/%s', baseUrl, version, data.flow_id, data.id)//TODO: this is too buggy
				
			},
		});
	};
}

module.exports = DataSerializer;

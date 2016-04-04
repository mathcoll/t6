'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function DataSerializer(data) {
	this.serialize = function() {
		return new JSONAPISerializer('data', data, {
	    	keyForAttribute: 'underscore_case',
			attributes : [ 'flow', 'flow_id', 'time', 'timestamp', 'value', 'publish' ],
			topLevelLinks : {
				parent	: function(data) {
					return data.parent>0?sprintf('%s/v%s/flows/%s', baseUrl, version, data.flow_id):null;
				},
				first	: function(data) {
					return data.first>0?sprintf('%s/v%s/data/%s?limit=%s&page=1&order=%s', baseUrl, version, data.flow_id, data.limit, data.prev, data.order):null;
				},
				prev	: function(data) {
					return data.prev>0?sprintf('%s/v%s/data/%s?limit=%s&page=%s&order=%s', baseUrl, version, data.flow_id, data.limit, data.prev, data.order):null;
				},
				next	: function(data) {
					return data.next>0?sprintf('%s/v%s/data/%s?limit=%s&page=%s&order=%s', baseUrl, version, data.flow_id, data.limit, data.next, data.order):null;
				},/*
				last	: function(data) {
					return data.last>0?sprintf('%s/v%s/data/%s/p5', baseUrl, version, data.flow_id, data.flow_id):null;
				},*/
			},
			dataLinks : {
				self	: function(data) {
					return sprintf('%s/v%s/data/%s/%s', baseUrl, version, data.flow_id, data.id);
				}
			},
		});
	};
}

module.exports = DataSerializer;

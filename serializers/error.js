'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function ErrorSerializer(error) {
	this.serialize = function() {
		return new JSONAPISerializer('error', error, {
	    	keyForAttribute: 'underscore_case',
			attributes : [ 'code', 'message', 'details', 'stack' ],
		});
	};
}

module.exports = ErrorSerializer;

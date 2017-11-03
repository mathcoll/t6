'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function DataTypeSerializer(datatype) {

  this.serialize = function () {
	return new JSONAPISerializer('datatype', datatype, {
    	keyForAttribute: 'underscore_case',
		attributes: ['name'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/datatypes', baseUrl_https, version)
		},
	});
  };

}

module.exports = DataTypeSerializer;
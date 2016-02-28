'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function DataTypeSerializer(datatype) {

  this.serialize = function () {
	return new JSONAPISerializer('datatype', datatype, {
		attributes: ['name'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/datatypes', baseUrl, version)
		},
	});
  };

}

module.exports = DataTypeSerializer;
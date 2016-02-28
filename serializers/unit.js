'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function UnitSerializer(unit) {

  this.serialize = function () {
    return new JSONAPISerializer('unit', unit, {
    	attributes: ['name', 'format', 'type'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/units', baseUrl, version)
		},
    });
  };

}

module.exports = UnitSerializer;
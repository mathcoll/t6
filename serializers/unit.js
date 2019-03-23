"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function UnitSerializer(unit) {

  this.serialize = function () {
    return new JSONAPISerializer("unit", {
    	keyForAttribute: "underscore_case",
    	attributes: ["name", "format", "type"],
		topLevelLinks : {
			parent : sprintf("%s/v%s/units", baseUrl_https, version)
		},
    }).serialize(unit);
  };

}

module.exports = UnitSerializer;
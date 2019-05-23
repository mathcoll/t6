"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function DataTypeSerializer(datatype) {

	this.serialize = function () {
		return new JSONAPISerializer("datatype", {
			keyForAttribute: "underscore_case",
			attributes: ["name"],
			topLevelLinks : {
				parent : sprintf("%s/v%s/datatypes", baseUrl_https, version)
			},
		}).serialize(datatype);
	};

}

module.exports = DataTypeSerializer;
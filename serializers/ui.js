"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function UITypeSerializer(ui) {
	this.serialize = function () {
		return new JSONAPISerializer("ui", {
			keyForAttribute: "underscore_case",
			attributes: ["user_id", "ui", "meta"],
			topLevelLinks : {
				parent : sprintf("%s/v%s/uis", baseUrl_https, version),
				self : ui.pageSelf!==undefined?sprintf("%s/v%s/uis/?page=%s&size=%s", baseUrl_https, version, ui.pageSelf, ui.size):undefined,
				first : ui.pageFirst!==undefined?sprintf("%s/v%s/uis/?page=%s&size=%s", baseUrl_https, version, ui.pageFirst, ui.size):undefined,
				prev : ui.pagePrev!==undefined?sprintf("%s/v%s/uis/?page=%s&size=%s", baseUrl_https, version, ui.pagePrev, ui.size):undefined,
				last : ui.pageLast!==undefined?sprintf("%s/v%s/uis/?page=%s&size=%s", baseUrl_https, version, ui.pageLast, ui.size):undefined,
				next : ui.pageNext!==undefined?sprintf("%s/v%s/uis/?page=%s&size=%s", baseUrl_https, version, ui.pageNext, ui.size):undefined,
			},
			dataLinks : {
				self : function(ui) {
					return sprintf("%s/v%s/uis/%s", baseUrl_https, version, ui.id);
				},
				user : function(ui) {
					if ( typeof ui.user_id !== "undefined" ) {
						return sprintf("%s/v%s/users/%s", baseUrl_https, version, ui.user_id);
					} else {
						return undefined;
					}
				},
				object : function(ui) {
					if ( typeof ui.object_id !== "undefined" ) {
						return sprintf("%s/v%s/objects/%s", baseUrl_https, version, ui.object_id);
					} else {
						return undefined;
					}
				},
			},
		}).serialize(ui);
	};
}

module.exports = UITypeSerializer;
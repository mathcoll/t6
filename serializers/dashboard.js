"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function DashboardTypeSerializer(dashboard) {

	this.serialize = function () {
		return new JSONAPISerializer("dashboard", {
			keyForAttribute: "underscore_case",
			attributes: ["name", "user_id", "description", "meta", "snippets"],
			topLevelLinks : {
				parent : sprintf("%s/v%s/dashboards", baseUrl_https, version),
				self : dashboard.pageSelf!==undefined?sprintf("%s/v%s/dashboards/?page=%s&size=%s", baseUrl_https, version, dashboard.pageSelf, dashboard.size):undefined,
				first : dashboard.pageFirst!==undefined?sprintf("%s/v%s/dashboards/?page=%s&size=%s", baseUrl_https, version, dashboard.pageFirst, dashboard.size):undefined,
				prev : dashboard.pagePrev!==undefined?sprintf("%s/v%s/dashboards/?page=%s&size=%s", baseUrl_https, version, dashboard.pagePrev, dashboard.size):undefined,
				last : dashboard.pageLast!==undefined?sprintf("%s/v%s/dashboards/?page=%s&size=%s", baseUrl_https, version, dashboard.pageLast, dashboard.size):undefined,
				next : dashboard.pageNext!==undefined?sprintf("%s/v%s/dashboards/?page=%s&size=%s", baseUrl_https, version, dashboard.pageNext, dashboard.size):undefined,
			},
			dataLinks : {
				self : function(dashboard) {
					return sprintf("%s/v%s/dashboards/%s", baseUrl_https, version, dashboard.id);
				},
				user : function(dashboard) {
					if ( dashboard.user_id!="" ) {
						return sprintf("%s/v%s/users/%s", baseUrl_https, version, dashboard.user_id);
					} else {
						return null;
					}
				}
			},
	    }).serialize(dashboard);
	};
}

module.exports = DashboardTypeSerializer;
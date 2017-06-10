'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function DashboardTypeSerializer(dashboard) {

  this.serialize = function () {
    return new JSONAPISerializer('dashboard', dashboard, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['name', 'user_id', 'description', 'meta', 'snippets'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/dashboards', baseUrl, version)
		},
		dataLinks : {
			self : function(dashboard) {
				return sprintf('%s/v%s/dashboards/%s', baseUrl, version, dashboard.id);
			},
			user : function(dashboard) {
				if ( dashboard.user_id!='' ) {
					return sprintf('%s/v%s/users/%s', baseUrl, version, dashboard.user_id);
				} else {
					return null;
				}
			}
		},
    });
  };
}

module.exports = DashboardTypeSerializer;
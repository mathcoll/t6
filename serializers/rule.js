'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function RuleTypeSerializer(rule) {

  this.serialize = function () {
    return new JSONAPISerializer('rule', rule, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['name', 'rule_id'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/rules', baseUrl_https, version)
		},
		dataLinks : {
			self : function(dashboard) {
				return sprintf('%s/v%s/rules/%s', baseUrl_https, version, rule.id);
			},
		},
    });
  };
}

module.exports = RuleTypeSerializer;
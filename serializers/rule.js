'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function RuleTypeSerializer(rule) {

  this.serialize = function () {
    return new JSONAPISerializer('rule', rule, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['name', 'rule_id'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/rules', baseUrl, version)
		},
		dataLinks : {
			self : function(dashboard) {
				return sprintf('%s/v%s/rules/%s', baseUrl, version, rule.id);
			},
		},
    });
  };
}

module.exports = RuleTypeSerializer;
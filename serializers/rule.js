'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function RuleTypeSerializer(rule) {

  this.serialize = function () {
    return new JSONAPISerializer('rule', rule, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['name', 'rule_id'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/rules', baseUrl_https, version),
			self : rule.pageSelf!==undefined?sprintf('%s/v%s/rules/?page=%s&size=%s', baseUrl_https, version, rule.pageSelf, rule.size):undefined,
			first : rule.pageFirst!==undefined?sprintf('%s/v%s/rules/?page=%s&size=%s', baseUrl_https, version, rule.pageFirst, rule.size):undefined,
			prev : rule.pagePrev!==undefined?sprintf('%s/v%s/rules/?page=%s&size=%s', baseUrl_https, version, rule.pagePrev, rule.size):undefined,
			last : rule.pageLast!==undefined?sprintf('%s/v%s/rules/?page=%s&size=%s', baseUrl_https, version, rule.pageLast, rule.size):undefined,
			next : rule.pageNext!==undefined?sprintf('%s/v%s/rules/?page=%s&size=%s', baseUrl_https, version, rule.pageNext, rule.size):undefined,
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
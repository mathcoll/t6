'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function SnippetTypeSerializer(snippet) {
	this.serialize = function () {
		return new JSONAPISerializer('snippet', snippet, {
			keyForAttribute: 'underscore_case',
			attributes: ['name', 'user_id', 'description', 'type', 'icon', 'color', 'flows', 'meta'],
			topLevelLinks : {
				parent : sprintf('%s/v%s/snippets', baseUrl_https, version)
			},
			dataLinks : {
				self : function(snippet) {
					return sprintf('%s/v%s/snippets/%s', baseUrl_https, version, snippet.id);
				},
				user : function(snippet) {
					if ( snippet.user_id!='' ) {
						return sprintf('%s/v%s/users/%s', baseUrl_https, version, snippet.user_id);
					} else {
						return null;
					}
				}
			},
		});
	};
}

module.exports = SnippetTypeSerializer;
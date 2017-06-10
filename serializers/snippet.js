'use strict';
var JSONAPISerializer = require('jsonapi-serializer');

function SnippetTypeSerializer(snippet) {

  this.serialize = function () {
    return new JSONAPISerializer('snippet', snippet, {
    	keyForAttribute: 'underscore_case',
    	attributes: ['name', 'user_id', 'description', 'type', 'icon', 'color', 'meta'],
		topLevelLinks : {
			parent : sprintf('%s/v%s/snippets', baseUrl, version)
		},
		dataLinks : {
			self : function(snippet) {
				return sprintf('%s/v%s/snippets/%s', baseUrl, version, snippet.id);
			},
			user : function(snippet) {
				if ( snippet.user_id!='' ) {
					return sprintf('%s/v%s/users/%s', baseUrl, version, snippet.user_id);
				} else {
					return null;
				}
			}
		},
    });
  };
}

module.exports = SnippetTypeSerializer;
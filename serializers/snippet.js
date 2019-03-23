"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function SnippetTypeSerializer(snippet) {
	this.serialize = function () {
		return new JSONAPISerializer("snippet", {
			keyForAttribute: "underscore_case",
			attributes: ["name", "user_id", "description", "type", "icon", "color", "flows", "meta"],
			topLevelLinks : {
				parent : sprintf("%s/v%s/snippets", baseUrl_https, version),
				self : snippet.pageSelf!==undefined?sprintf("%s/v%s/snippets/?page=%s&size=%s", baseUrl_https, version, snippet.pageSelf, snippet.size):undefined,
				first : snippet.pageFirst!==undefined?sprintf("%s/v%s/snippets/?page=%s&size=%s", baseUrl_https, version, snippet.pageFirst, snippet.size):undefined,
				prev : snippet.pagePrev!==undefined?sprintf("%s/v%s/snippets/?page=%s&size=%s", baseUrl_https, version, snippet.pagePrev, snippet.size):undefined,
				last : snippet.pageLast!==undefined?sprintf("%s/v%s/snippets/?page=%s&size=%s", baseUrl_https, version, snippet.pageLast, snippet.size):undefined,
				next : snippet.pageNext!==undefined?sprintf("%s/v%s/snippets/?page=%s&size=%s", baseUrl_https, version, snippet.pageNext, snippet.size):undefined,
			},
			dataLinks : {
				self : function(snippet) {
					return sprintf("%s/v%s/snippets/%s", baseUrl_https, version, snippet.id);
				},
				user : function(snippet) {
					if ( snippet.user_id!="" ) {
						return sprintf("%s/v%s/users/%s", baseUrl_https, version, snippet.user_id);
					} else {
						return null;
					}
				}
			},
		}).serialize(snippet);
	};
}

module.exports = SnippetTypeSerializer;
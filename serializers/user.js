"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function UserSerializer(user) {
	this.serialize = function () {
		return new JSONAPISerializer("user", {
			keyForAttribute: "underscore_case",
			attributes: ["firstName", "lastName", "login", "email", "role", "iftttCode", "iftttTrigger_identity", "location", "unsubscription", "unsubscription_token", "passwordLastUpdated", "reminderMail", "changePasswordMail", "subscription_date", "update_date", "permissions", "gravatar"],
			topLevelLinks : {
				parent : sprintf("%s/v%s/users", baseUrl_https, version)
			},
			dataLinks : {
				self : function(user) {
					return sprintf("%s/v%s/users/%s", baseUrl_https, version, user.id);
				},
			},
		}).serialize(user);
	};
}

module.exports = UserSerializer;

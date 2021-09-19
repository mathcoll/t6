"use strict";
var JSONAPISerializer = require("jsonapi-serializer").Serializer;

function UserSerializer(user) {
	this.serialize = function () {
		return new JSONAPISerializer("user", {
			keyForAttribute: "underscore_case",
			attributes: ["firstName", "lastName", "login", "email", "role", "iftttCode", "iftttTrigger_identity", "pushSubscription", "location", "subscription", "unsubscription", "unsubscription_token", "passwordLastUpdated", "reminderMail", "changePasswordMail", "subscription_date", "update_date", "permissions", "gravatar", "token"],
			topLevelLinks : {
				parent : sprintf("%s/v%s/users", baseUrl_https, version),
				meta: {
					count: user.totalcount,
					pageSelf: user.pageSelf,
					pageFirst: user.pageFirst,
					pageNext: user.pageNext,
					pagePrev: user.pagePrev,
					pageLast: user.pageLast,
				},
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

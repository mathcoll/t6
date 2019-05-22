"use strict";
var t6notifications = module.exports = {};

t6notifications.sendPush = function(subscriber, payload) {
	webpush.sendNotification(subscriber, payload, pushSubscriptionOptions);
};

module.exports = t6notifications;
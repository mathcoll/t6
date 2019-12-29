"use strict";
var t6notifications = module.exports = {};

t6notifications.sendPush = function(subscriber, payload) {
	if ( typeof payload === "object" ) {
		payload.type = typeof payload.type!=="undefined"?payload.type:"message";
		payload = JSON.stringify(payload);
	}
	console.log("t6notifications.sendPush", subscriber, payload);
	if ( subscriber.endpoint ) {
		webpush.setGCMAPIKey(pushSubscriptionOptions.gcmAPIKey);
		webpush.setVapidDetails(
				pushSubscriptionOptions.vapidDetails.subject,
				pushSubscriptionOptions.vapidDetails.publicKey,
				pushSubscriptionOptions.vapidDetails.privateKey
		);
		webpush.sendNotification(subscriber, payload, pushSubscriptionOptions);
	} else {
		console.log("t6notifications.sendPush", "failed with no endpoint. Didn't sent.");
	}
};

module.exports = t6notifications;
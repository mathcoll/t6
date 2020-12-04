"use strict";
var t6notifications = module.exports = {};
if (firebase.admin.serviceAccountFile) {
	var serviceAccount = require(firebase.admin.serviceAccountFile);
	
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(serviceAccount),
		databaseURL: "https://t6-app.firebaseio.com"
	});
	
	t6notifications.sendPush = function(subscriber, payload) {
		if ( typeof payload === "object" ) {
			payload.type = typeof payload.type!=="undefined"?payload.type:"message";
			payload = JSON.stringify(payload);
		}
		t6console.debug("t6notifications.sendPush", subscriber);
		t6console.debug("t6notifications.sendPush", payload);
		if ( subscriber.endpoint ) {
			webpush.setGCMAPIKey(pushSubscriptionOptions.gcmAPIKey);
			webpush.setVapidDetails(
				pushSubscriptionOptions.vapidDetails.subject,
				pushSubscriptionOptions.vapidDetails.publicKey,
				pushSubscriptionOptions.vapidDetails.privateKey
			);
			webpush.sendNotification(subscriber, payload, pushSubscriptionOptions);
		} else {
			t6console.warn("t6notifications.sendPush failed with no endpoint. Didn't sent.");
		}
	};
	t6notifications.sendFCM = function(subscriber, payload) {
		const registrationTokens = typeof subscriber!=="object"?[subscriber]:subscriber;
		const message = payload;
		message.tokens = registrationTokens;
		admin.messaging().sendMulticast(message)
		.then((response) => {
			if (response.failureCount > 0) {
				const failedTokens = [];
				response.responses.forEach((resp, idx) => {
					if (!resp.success) {
						failedTokens.push(registrationTokens[idx]);
					}
				});
				t6console.warn("t6notifications.sendFCM List of tokens that caused failures: " + failedTokens);
			}
		});
	};
}

module.exports = t6notifications;
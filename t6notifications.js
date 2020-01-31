"use strict";
var t6notifications = module.exports = {};
var admin = require("firebase-admin");
var serviceAccount = require("./data/certificates/t6-app-firebase-adminsdk-rw4am-8cd8dc25f3.json"); // https://console.firebase.google.com/u/0/project/t6-app/settings/serviceaccounts/adminsdk

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://t6-app.firebaseio.com"
});

t6notifications.sendPush = function(subscriber, payload) {
	if ( typeof payload === "object" ) {
		payload.type = typeof payload.type!=="undefined"?payload.type:"message";
		payload = JSON.stringify(payload);
	}
	console.log(moment().format("MMMM Do YYYY, H:mm:ss"), "t6notifications.sendPush", subscriber, payload);
	if ( subscriber.endpoint ) {
		webpush.setGCMAPIKey(pushSubscriptionOptions.gcmAPIKey);
		webpush.setVapidDetails(
			pushSubscriptionOptions.vapidDetails.subject,
			pushSubscriptionOptions.vapidDetails.publicKey,
			pushSubscriptionOptions.vapidDetails.privateKey
		);
		webpush.sendNotification(subscriber, payload, pushSubscriptionOptions);
	} else {
		console.log(moment().format("MMMM Do YYYY, H:mm:ss"), "t6notifications.sendPush", "failed with no endpoint. Didn't sent.");
	}
};
t6notifications.sendFCM = function(subscriber, payload) {
	const registrationTokens = typeof subscriber!=="object"?[subscriber]:subscriber;
	const message = {
		data: {score: '850', time: '2:45'},
		tokens: registrationTokens,
	}
	admin.messaging().sendMulticast(message)
	.then((response) => {
		if (response.failureCount > 0) {
			const failedTokens = [];
			response.responses.forEach((resp, idx) => {
				if (!resp.success) {
					failedTokens.push(registrationTokens[idx]);
				}
			});
			console.log(moment().format("MMMM Do YYYY, H:mm:ss"), "t6notifications.sendFCM", "List of tokens that caused failures: " + failedTokens);
		}
	});
};

module.exports = t6notifications;
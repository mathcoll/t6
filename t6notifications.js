"use strict";
var t6notifications = module.exports = {};
if (firebase.admin.serviceAccountFile) {
	var serviceAccount = require(firebase.admin.serviceAccountFile);
	
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(serviceAccount),
		databaseURL: "https://t6-app.firebaseio.com"
	});
	
	t6notifications.sendPush = (meta, payload) => new Promise((resolve, reject) => {
		if ( typeof payload === "object" ) {
			payload.type = typeof payload.type!=="undefined"?payload.type:"message";
			payload = JSON.stringify(payload);
		}
		let subscriber = meta.pushSubscription;
		let subscriber_id = meta.user_id;
		//t6console.debug("t6notifications.sendPush", meta);
		//t6console.debug("t6notifications.sendPush", payload);
		if ( subscriber && subscriber.endpoint ) {
			if ( process.env.NODE_ENV === "production" ) {
				webpush.setGCMAPIKey(pushSubscriptionOptions.gcmAPIKey);
				webpush.setVapidDetails(
					pushSubscriptionOptions.vapidDetails.subject,
					pushSubscriptionOptions.vapidDetails.publicKey,
					pushSubscriptionOptions.vapidDetails.privateKey
				);
				webpush.sendNotification(subscriber, payload, pushSubscriptionOptions).then((res) => {
					t6console.debug("t6notifications.sendPush Response:", res);
					t6events.add("t6App", "sendPush", subscriber_id, subscriber_id, {"endpoint": subscriber.endpoint, "success":  {"statusCode": res.statusCode}});
					resolve({"status": "info", "info": res});
				}).catch((err) => {
					t6events.add("t6App", "sendPush", subscriber_id, subscriber_id, {"endpoint": subscriber.endpoint, "error": {"statusCode": err.statusCode, "body": err.body}});
					t6console.error(err);
					if(err.statusCode === 404 || err.statusCode === 410) {
						// User subscription is expired ; we should remove endpoint and keys from Db
						// find user where "id" == subscriber_id and remove its pushSubscription from lokijs
						reject({"status": "error", "info": err});
						return err;
					}
				});
			} else {
				t6console.warn(`t6notifications.sendPush disabled on ${process.env.NODE_ENV}̀`);
				reject({"status": "warning", "info": `t6notifications.sendPush disabled on ${process.env.NODE_ENV}̀` });
			}
		} else {
			t6console.warn("t6notifications.sendPush failing with no endpoint. Can't send.");
			reject({"status": "warning", "info": "t6notifications.sendPush failing with no endpoint. Can't send." });
		}
	});

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
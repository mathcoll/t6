// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup

importScripts("//www.gstatic.com/firebasejs/8.0.0/firebase-app.js");
importScripts("//www.gstatic.com/firebasejs/8.0.0/firebase-analytics.js");
importScripts("//www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js");
var trackings = {
	gtm: "GTM-PH7923",
	googleSigninClientId: "91119083860-6eb566ij9t4n83dm21rcqgts0g5ood2o.apps.googleusercontent.com",
	ggads: "ca-pub-1540450623748539",
	firebaseConfig: {
		firebaseJsVersion: "8.0.0", // https://firebase.google.com/docs/web/setup
		web: {
			apiKey: "AIzaSyDI7z7R033CBz_4rWH8JA2TGmql2mw5v7A",
			authDomain: "t6-app.firebaseapp.com",
			databaseURL: "https://t6-app.firebaseio.com",
			projectId: "t6-app",
			storageBucket: "t6-app.appspot.com",
			messagingSenderId: "91119083860",
			appId: "1:91119083860:web:6dd721ddcbcbf5bb12e8c1",
			measurementId: "G-BTRBYTY541"
		},
		android: {
			apiKey: "AIzaSyDI7z7R033CBz_4rWH8JA2TGmql2mw5v7A",
			authDomain: "t6-app.firebaseapp.com",
			databaseURL: "https://t6-app.firebaseio.com",
			projectId: "t6-app",
			storageBucket: "t6-app.appspot.com",
			messagingSenderId: "91119083860",
			appId: "1:91119083860:android:f415d4e9bee89f1f",
			measurementId: "G-BTRBYTY541"
		}
	}
};
var firebaseConfig = trackings.firebaseConfig.web;
//trackings.firebaseConfig.web;

console.log("firebase.messaging-sw", "Loading Firebase Messaging SW");

firebase.initializeApp( firebaseConfig );

const messaging = firebase.messaging();
messaging.usePublicVapidKey("BHnrqPBEjHfdNIeFK5wdj0y7i5eGM2LlPn62zxmvN8LsBTFEQk1Gt2zrKknJQX91a8RR87w8KGP_1gDSy8x6U7s");

function showToken(currentToken) {
	console.log("firebase.messaging-sw", "showToken", currentToken);
}
function updateUIForPushPermissionRequired() {
	console.log("firebase.messaging-sw", "updateUIForPushPermissionRequired");
}

function isTokenSentToServer() {
	console.log("firebase.messaging-sw", "get sentToServer from LocalStorage", localStorage.getItem("sentToServer"));
	return localStorage.getItem("sentToServer") === "1";
}

function setTokenSentToServer(sent) {
	console.log("firebase.messaging-sw", "set sentToServer to LocalStorage");
	localStorage.setItem("sentToServer", sent ? "1" : "0");
}

//Send the Instance ID token your application server, so that it can:
//- send messages back to this app
//- subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
	if (!isTokenSentToServer()) {
		console.log("firebase.messaging-sw", "Sending token to server...");
		setTokenSentToServer(true);
	} else {
		console.log("firebase.messaging-sw", "Token already sent to server so won't send it again unless it changes");
	}
}

//Get Instance ID token. Initially this makes a network call, once retrieved
//subsequent calls to getToken will return from cache.
messaging.getToken().then((currentToken) => {
	if (currentToken) {
		sendTokenToServer(currentToken);
		updateUIForPushEnabled(currentToken);
	} else {
		// Show permission request.
		console.log("firebase.messaging-sw", "No Instance ID token available. Request permission to generate one.");
		// Show permission UI.
		updateUIForPushPermissionRequired();
		setTokenSentToServer(false);
	}
}).catch((err) => {
	console.log("firebase.messaging-sw", "An error occurred while retrieving token.", err);
	showToken("Error retrieving Instance ID token.", err);
	setTokenSentToServer(false);
});

messaging.setBackgroundMessageHandler(function(payload) {
	console.log("firebase.messaging-sw", "Received background message", payload);
	// Customize notification here
	const notificationTitle = "Background Message Title";
	const notificationOptions = {
		body: "Background Message body."
	};
	return self.registration.showNotification(notificationTitle, notificationOptions);
});

//Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(() => {
	messaging.getToken().then((refreshedToken) => {
		console.log("firebase.messaging-sw", "Token refreshed", refreshedToken);
		// Indicate that the new Instance ID token has not yet been sent to the
		// app server.
		setTokenSentToServer(false);
		// Send Instance ID token to app server.
		sendTokenToServer(refreshedToken);
		// ...
	}).catch((err) => {
		console.log("firebase.messaging-sw", "Unable to retrieve refreshed token", err);
		//showToken('Unable to retrieve refreshed token ', err);
	});
});

//Handle incoming messages. Called when:
//- a message is received while the app has focus
//- the user clicks on an app notification created by a service worker
//`messaging.setBackgroundMessageHandler` handler.
messaging.onMessage((payload) => {
	console.log("firebase.messaging-sw", "Message received.", payload);
});
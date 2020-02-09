firebase.initializeApp( {"messagingSenderId": "91119083860"} );

const messaging = firebase.messaging();
messaging.usePublicVapidKey("BHnrqPBEjHfdNIeFK5wdj0y7i5eGM2LlPn62zxmvN8LsBTFEQk1Gt2zrKknJQX91a8RR87w8KGP_1gDSy8x6U7s");

//Get Instance ID token. Initially this makes a network call, once retrieved
//subsequent calls to getToken will return from cache.
messaging.getToken().then((currentToken) => {
	if (currentToken) {
		sendTokenToServer(currentToken);
		updateUIForPushEnabled(currentToken);
	} else {
		// Show permission request.
		console.log("firebase.messaging-sw", 'No Instance ID token available. Request permission to generate one.');
		// Show permission UI.
		updateUIForPushPermissionRequired();
		setTokenSentToServer(false);
	}
}).catch((err) => {
	console.log("firebase.messaging-sw", 'An error occurred while retrieving token. ', err);
	showToken('Error retrieving Instance ID token. ', err);
	setTokenSentToServer(false);
});

messaging.setBackgroundMessageHandler(function(payload) {
	console.log("firebase.messaging-sw", "Received background message ", payload);
	// Customize notification here
	const notificationTitle = 'Background Message Title';
	const notificationOptions = {
		body: 'Background Message body.'
	};
	return self.registration.showNotification(notificationTitle, notificationOptions);
});

//Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(() => {
	messaging.getToken().then((refreshedToken) => {
		console.log("firebase.messaging-sw", 'Token refreshed.');
		// Indicate that the new Instance ID token has not yet been sent to the
		// app server.
		setTokenSentToServer(false);
		// Send Instance ID token to app server.
		sendTokenToServer(refreshedToken);
		// ...
	}).catch((err) => {
		console.log("firebase.messaging-sw", 'Unable to retrieve refreshed token ', err);
		showToken('Unable to retrieve refreshed token ', err);
	});
});

//Handle incoming messages. Called when:
//- a message is received while the app has focus
//- the user clicks on an app notification created by a service worker
//`messaging.setBackgroundMessageHandler` handler.
messaging.onMessage((payload) => {
	console.log("firebase.messaging-sw", 'Message received. ', payload);
	// ...
});
var dataCacheName= "t6-cache-91b975580faba19f04769adaac7c5c27";

var cacheName= dataCacheName;
var cacheWhitelist = ["internetcollaboratif.info", "css", "img", "js", "secure.gravatar.com", "fonts.g", "cdn.jsdelivr.net", "static-v.tawk.to", "cloudflare", "leaflet"];
var cacheBlacklist = ["v2", "authenticate", "users/me/token", "/mail/", "hotjar", "analytics", "gtm", "collect", "tawk"];
var filesToCache = [
	"/",
	"/img/opl_img3.webp",
	"/img/opl_img2.webp",
	"/img/opl_img.webp",
	"/img/icon.png",
	"/img/m/placeholder.png",
	"/img/m/welcome_card.jpg",
	"/img/m/side-nav-bg.webp",
	"/img/m/t6-play-screenshots0-sm.webp",
	"/img/m/icons/icon-128x128.png",
	"/img/m/icons/icon-16x16.png",
	"/img/arduinobuild-icon.png",
	"https://cdn.internetcollaboratif.info/js/t6app-min.js",
	"https://cdn.internetcollaboratif.info/js/thirdparty.min.js",
	"https://cdn.internetcollaboratif.info/css/t6app.min.css",
	"https://cdn.internetcollaboratif.info/img/icon.png",
	"https://cdn.internetcollaboratif.info/img/opl_img3.webp",
	"https://cdn.internetcollaboratif.info/img/opl_img2.webp",
	"https://cdn.internetcollaboratif.info/img/opl_img.webp",
	"https://cdn.internetcollaboratif.info/img/m/placeholder.png",
	"https://cdn.internetcollaboratif.info/img/m/welcome_card.jpg",
	"https://cdn.internetcollaboratif.info/img/m/side-nav-bg.webp",
	"https://cdn.internetcollaboratif.info/img/m/t6-play-screenshots0-sm.webp",
	"https://cdn.internetcollaboratif.info/img/m/icons/icon-128x128.png",
	"https://cdn.internetcollaboratif.info/img/m/icons/icon-16x16.png",
	"https://cdn.internetcollaboratif.info/img/arduinobuild-icon.png",
	"https://cdn.internetcollaboratif.info/fonts/Material-Icons.woff2",
	"https://fonts.googleapis.com/icon?family=Lato:100,100i,300,300i,400,400i,700,700i,900,900i&subset=latin-ext"
];
let debug = false;
let getVersionPort;
let currentOtpHash;
let originalRequest = null;
let originalBody = null;
let isOnline = true;
function refresh(response) {
	return self.clients.matchAll().then(function(clients) {
		clients.forEach(function(client) {
			var message = {
				type : "refresh",
				url : response.url,
				eTag : response.headers.get("ETag")
			};
			client.postMessage(JSON.stringify(message));
		});
	});
}
function Utf8ArrayToStr(array) {
	var out, i, len, c;
	var char2, char3;
	out = "";
	len = array.length;
	i = 0;
	while (i < len) {
		c = array[i++];
		switch (c >> 4) {
			case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
				// 0xxxxxxx
				out += String.fromCharCode(c);
				break;
			case 12: case 13:
				// 110x xxxx   10xx xxxx
				char2 = array[i++];
				out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
				break;
			case 14:
				// 1110 xxxx  10xx xxxx  10xx xxxx
				char2 = array[i++];
				char3 = array[i++];
				out += String.fromCharCode(((c & 0x0F) << 12) |
					((char2 & 0x3F) << 6) |
					((char3 & 0x3F) << 0));
				break;
		}
	}
	return out;
}
function precache() {
	if (debug) { console.log("[ServiceWorker]", "Running precache."); }
	return caches.open(cacheName).then(function (cache) {
		if (debug) { console.log("[ServiceWorker]", "open", cacheName); }
		return new Request(filesToCache, { mode: "no-cors" });
	});
}
function fromCache(request) {
	return caches.open(cacheName).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || Promise.reject("no-match");
		});
	});
}
function update(request) {
	return caches.open(cacheName).then(function (cache) {
		return fetch(request).then(function (response) {
			return cache.put(request, response);
		});
	});
}
function fromServer(request) {
	let clonedRequest = (request.clone());
	return fetch(request).then((response) => {
		if (response.status === 307) {
			response.clone().json().then((response) => {
				if( typeof response.hash!=="undefined" ) {
					const reader = (clonedRequest && clonedRequest.body!==null)?clonedRequest.body.getReader():null;
					if( reader ) {
						reader.read().then(({ done, value }) => {
							self.originalBody = JSON.stringify( JSON.parse( self.Utf8ArrayToStr(value) ));
							if (debug) { console.log("307 Restored request body", self.originalBody) };
							self.currentOtpHash = response.hash;
							self.originalRequest = {
								headers: {
									...request.headers,
									"authorization": request.headers.get("authorization"),
									"content-type": request.headers.get("content-type"),
									"x-hash": self.currentOtpHash,
								},
								method: request.method,
								url: request.url,
								body: self.originalBody,
							};
							location.hash = "#otp";
						});
					}
				}
			});
		}
		return response;
	}).catch((err) => {
		if (debug) { console.log("[ServiceWorker]", "Error", err); };
	});
}
self.addEventListener("message", (event) => {
	debug = (typeof event.data.debug!=="undefined" && event.data.debug===true)?true:self.debug;
	if (debug) { console.log("[ServiceWorker]", "debug event.data", event.data); };
	if (event.data && event.data.type === "INIT_PORT") {
		getVersionPort = event.ports[0];
	}
	if (event.data && event.data.type === "CHALLENGE_OTP") {
		self.originalRequest.headers["x-otp"] = event.data.otp.otp;
		fetch(self.originalRequest.url, self.originalRequest).then((response) => {
			getVersionPort.postMessage({ mainAppAction: "historyBack" });
			return response;
		}).catch((err) => {
			if (debug) { console.log("[ServiceWorker]", "Error", err); };
		});
	}
});
self.addEventListener("install", function(e) {
	if (debug) { console.log("[ServiceWorker]", "Installing"); }
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			if (debug) { console.log("[ServiceWorker]", "Caching to", cacheName); }
			return cache.addAll(filesToCache).then(function() {
				if (debug) { console.log("All resources have been fetched and cached."); }
			});
		}).then(function() {
			if (debug) { console.log("[ServiceWorker]", "Install completed"); }
		}).catch((error) => {
			if (debug) { console.log("[ServiceWorker]", "Error:", error); }
		})
	);
});
self.addEventListener("activate", function(e) {
	if (debug) { console.log("[ServiceWorker]", "Activate and cleaning old caches."); }
	e.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (cache !== cacheName) {
						return caches.delete(cache); //Deleting the cache
					}
				})
			);
		})
	);
	return self.clients.claim();
});
function matchInArray(string, expressions) {
	var len = expressions.length,
	i = 0;
	for (; i < len; i++) {
		if (string.match(expressions[i])) {
			return true;
		}
	}
	return false;
}
self.addEventListener("fetch", function(e) {
	if (isOnline) {
		if ( matchInArray(e.request.url, cacheBlacklist) ) {
			if (debug) { console.log("[ServiceWorker]", "Serving the asset from server (Blacklisted).", e.request.url); }
			e.respondWith(fromServer(e.request));
		} else if ( matchInArray(e.request.url, cacheWhitelist) ) {
			e.respondWith(
				caches.match(e.request).then(function(response) {
					if (debug) { console.log("[ServiceWorker]", "Serving the asset from cache (Whitelisted & found).", e.request.url); }
					caches.add(e.request.url).then(function() {
						if (debug) { console.log("[ServiceWorker]", "Added "+e.request.url+" to cached."); }
					});
					return response || fetch(e.request);
				})
				.catch(function() {
					if (debug) { console.log("[ServiceWorker]", "Serving the asset from server (Whitelisted but not found).", e.request.url); }
					return fromServer(e.request);
				})
			);
		} else {
			if (debug) { console.log("[ServiceWorker]", "Serving the asset from server directly.", e.request.url); }
			return fromServer(e.request);
		}
	} else {
		e.respondWith(
			caches.match(e.request).then(function(response) {
				if (debug) { console.log("[ServiceWorker]", "Serving the asset from cache because you are offline (Whitelisted & found).", e.request.url); }
				caches.add(e.request.url).then(function() {
					if (debug) { console.log("[ServiceWorker]", "Added "+e.request.url+" to cached."); }
				});
				return response || fetch(e.request);
			})
			.catch(function() {
				if (debug) { console.log("[ServiceWorker]", "Serving the asset from server (Whitelisted but not found).", e.request.url); }
				return fromServer(e.request);
			})
		);
	}
});
self.addEventListener("push", function(event) {
	if (debug) { console.log("[pushSubscription]", "push event", event); }
	if( event.data && event.data.text() ) {
		var notif = JSON.parse(event.data.text());
		const title = notif.title!==null?notif.title:"t6 notification";
		const body = notif.body!==null?notif.body:"Welcome to t6.";
		const icon = notif.icon!==null?notif.icon:"/img/m/icons/icon-128x128.png";
		const tag = notif.tag!==null?notif.tag:"t6notification";
		const actions = notif.actions!==null?notif.actions:[{action: "goObjects", title: "Go!", icon: "/img/m/icons/icon-128x128.png"}];
		const vibrate = notif.vibrate!==null?notif.vibrate:[200, 100, 200, 100, 200, 100, 200];
		const options = {
			body: body,
			icon: icon,
			actions: actions,
			tag: tag,
			vibrate: vibrate,
			requireInteraction: true,
			renotify: tag!==null?false:true
		};
		if (debug) { console.log("[pushSubscription]", "notif.type", notif.type); }
		if ( notif.type === "message" ) {
			event.waitUntil(self.registration.showNotification(title, options));
			if ( typeof firebase !== "undefined" ) {
				firebase.analytics().setUserProperties({"notification_receive": 1});
			}
		} else {
			if (debug) { console.log("[pushSubscription]", "notif", notif); }
		}
	}
});
self.addEventListener("message", function(event){
	if (debug) { console.log("[onMessage]", "onMessage=", event.data); }
	if ( event.data === "getDataCacheName" ) {
		if (debug) { console.log("returning", dataCacheName); }
		return dataCacheName;
	}
	if ( event.data === "setOffline" ) {
		isOnline = false;
		if (debug) { console.log("[Network] isOnline is now ", isOnline); }
	}
	if ( event.data === "setOnline" ) {
		isOnline = true;
		if (debug) { console.log("[Network] isOnline is now ", isOnline); }
	}
});
self.addEventListener("error", function(e) {
	if (debug) { console.log("[onError]", e.filename, e.lineno, e.colno, e.message); }
});
self.addEventListener("notificationclick", function(event) {
	if (typeof event.notification !== "undefined") {
		if (debug) { console.log("[pushSubscription]", "onNotificationClick = event.notification.actions", event.notification.actions); }
		if ( event.notification.actions[0].action === "goObjects" ) {
			clients.openWindow("/?utm_source=t6app&utm_medium=push&utm_campaign=notificationclick#objects");
			synchronizeReader();
		} else if( event.notification.actions[0].action === "goNews" ) {
			clients.openWindow("https://www.internetcollaboratif.info/features/?utm_source=t6app&utm_medium=push&utm_campaign=notificationclick#news");
			synchronizeReader();
		} else if( event.notification.actions[0].action === "goResetPassword" ) {
			clients.openWindow("/?utm_source=t6app&utm_medium=push&utm_campaign=notificationclick#forgot-password");
			synchronizeReader();
		} else if( event.notification.actions[0].action === "goSignIn" ) {
			clients.openWindow("/?utm_source=t6app&utm_medium=push&utm_campaign=notificationclick#login");
			synchronizeReader();
		} else if( event.notification.actions[0].action === "goSignUp" ) {
			clients.openWindow("/?utm_source=t6app&utm_medium=push&utm_campaign=notificationclick#signup");
			synchronizeReader();
		} else if( event.notification.actions[0].action === "goGooglePlay" ) {
			clients.openWindow("https://play.google.com/store/apps/details?id=info.internetcollaboratif.api&utm_source=notificationClick&utm_campaign=notification");
			synchronizeReader();
		} else if( event.notification.actions[0].action === "goExternal" && event.notification.actions[0].url ) {
			clients.openWindow(`${event.notification.actions[0].url}?utm_source=t6app&utm_medium=push&utm_campaign=notificationclick`);
			synchronizeReader();
		} else {
			clients.openWindow("/");
		}
		event.notification.close();
		if ( typeof firebase !== "undefined" ) {
			firebase.analytics().setUserProperties({"notification_click": 1});
		}
		event.notification.close();
	}
});
self.addEventListener("pushsubscriptionchange", function(event) {
	if (debug) { console.log("[pushSubscription]", "Subscription expired", event); }
	event.waitUntil(
		self.registration.pushManager.subscribe({ userVisibleOnly: true })
			.then(function(subscription) {
				if (debug) { console.log("[pushSubscription]", "pushsubscriptionchange: Subscribed after expiration", subscription.endpoint); }
				return fetch("register", {
					method: "post",
					headers: { "Content-type": "application/json" },
					body: JSON.stringify({ endpoint: subscription.endpoint })
				});
			})
	);
});

if ( typeof firebase !== "undefined" ) {
	// Get Instance ID token. Initially this makes a network call, once retrieved
	// subsequent calls to getToken will return from cache.
	firebase.messaging().getToken().then((currentToken) => {
		if (currentToken) {
			if (debug) { console.log("[pushSubscription]", "currentToken", currentToken); }
			sendTokenToServer(currentToken);
			updateUIForPushEnabled(currentToken);
		} else {
			// Show permission request.
			if (debug) { console.log("[pushSubscription]", "No Instance ID token available. Request permission to generate one."); }
			// Show permission UI.
			updateUIForPushPermissionRequired();
			setTokenSentToServer(false);
		}
	}).catch((err) => {
		if (debug) { console.log("[pushSubscription]", "An error occurred while retrieving token. ", err); }
		showToken("Error retrieving Instance ID token. ", err);
		setTokenSentToServer(false);
	});

	firebase.messaging().onTokenRefresh(() => {
		firebase.messaging().getToken().then((refreshedToken) => {
			if (debug) { console.log("[pushSubscription]", "Token refreshed."); }
			// Indicate that the new Instance ID token has not yet been sent to the
			// app server.
			setTokenSentToServer(false);
			// Send Instance ID token to app server.
			sendTokenToServer(refreshedToken);
			// ...
		}).catch((err) => {
			if (debug) { console.log("[pushSubscription]", "Unable to retrieve refreshed token ", err); }
			showToken("Unable to retrieve refreshed token ", err);
		});
	});
}
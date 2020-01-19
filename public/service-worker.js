var dataCacheName= 't6-cache-a91e310f69bb2878684a559b01b47f3e';
var cacheName= dataCacheName;
var cacheWhitelist = ["internetcollaboratif.info", "css", "img", "js", "secure.gravatar.com", "fonts.g", "cdn.jsdelivr.net", "static-v.tawk.to"];
var cacheBlacklist = ["v2", "authenticate", "users/me/token", "/mail/", "hotjar", "analytics", "gtm", "collect", "tawk"];
var filesToCache = [
	"/",
	"/applicationStart",
	"/networkError",
	"/manifest.json",
	"/css/t6app.min.css",
	"/js/t6app-min.js",
	"/js/vendor.min.js",
	"/img/opl_img3.webp",
	"/img/opl_img2.webp",
	"/img/opl_img.webp",
	"/img/m/placeholder.png",
	"/img/m/welcome_card.jpg",
	"/img/m/side-nav-bg.webp",
	"/img/m/icons/icon-128x128.png",/*
	"https://cdn.internetcollaboratif.info/css/t6app.min.css",
	"https://cdn.internetcollaboratif.info/js/t6app-min.js",
	"https://cdn.internetcollaboratif.info/js/vendor.min.js",
	"https://cdn.internetcollaboratif.info/img/opl_img3.webp",
	"https://cdn.internetcollaboratif.info/img/opl_img2.webp",
	"https://cdn.internetcollaboratif.info/img/opl_img.webp",
	"https://cdn.internetcollaboratif.info/img/m/placeholder.png",
	"https://cdn.internetcollaboratif.info/img/m/welcome_card.jpg",
	"https://cdn.internetcollaboratif.info/img/m/side-nav-bg.webp",
	"https://cdn.internetcollaboratif.info/img/m/icons/icon-128x128.png",*/
	"https://fonts.gstatic.com/s/materialicons/v29/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2",
	"https://fonts.googleapis.com/css?family=Lato:100,100i,300,300i,400,400i,700,700i,900,900i&subset=latin-ext"
];
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
function precache() {
	console.log("[ServiceWorker]", "Running precache.");
	return caches.open(cacheName).then(function (cache) {
		console.log("[ServiceWorker]", "open", cacheName);
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
function fromServer(request){
	return fetch(request).then(function(response){ return response; });
}
self.addEventListener("install", function(e) {
	console.log("[ServiceWorker]", "Installing");
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log("[ServiceWorker]", "Caching to", cacheName);
			return cache.addAll(filesToCache).then(function() {
				console.log("All resources have been fetched and cached.");
			});
		}).then(function() {
			console.log("[ServiceWorker]", "Install completed");
		}).catch((error) =>  {
			console.log("[ServiceWorker]", "Error:", error);
		})
	);
});
self.addEventListener("activate", function(e) {
	console.log("[ServiceWorker]", "Activate and cleaning old caches.");
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
};
self.addEventListener("fetch", function(e) {
	if ( matchInArray(e.request.url, cacheBlacklist) ) {
		console.log("[ServiceWorker]", "Serving the asset from server (Blacklisted).", e.request.url);
		e.respondWith(fromServer(e.request));
	} else if ( matchInArray(e.request.url, cacheWhitelist) ) {
		e.respondWith(
			caches.match(e.request).then(function(response) {
				console.log("[ServiceWorker]", "Serving the asset from cache (Whitelisted & found).", e.request.url);
				return response || fetch(e.request);
			})
			.catch(function() {
				caches.add(e.request.url).then(function() {
					console.log("[ServiceWorker]", "Added "+e.request.url+" to cached.");
				});
				console.log("[ServiceWorker]", "Serving the asset from server (Whitelisted but not found).", e.request.url);
				return fromServer(e.request);
			})
		);
	} else {
		console.log("[ServiceWorker]", "Serving the asset from server directly.", e.request.url);
		return fromServer(e.request);
	}
});
self.addEventListener("push", function(event) {
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
			renotify: true
		};
		console.log("[pushSubscription] notif.type", notif.type);
		if ( notif.type == "message" ) {
			event.waitUntil(self.registration.showNotification(title, options));
			if ( typeof firebase !== "undefined" ) {
				firebase.analytics().setUserProperties({'notification_receive': 1});
			}
		} else {
			console.log("[pushSubscription] notif", notif);
		}
	}
});
self.addEventListener("message", function(event){
	console.log("[onMessage]");
	if ( event.data === "getDataCacheName" ) {
		console.log("returning", dataCacheName);
		return dataCacheName;
	}
});
self.addEventListener("error", function(e) {
	console.log("[onError]", e.filename, e.lineno, e.colno, e.message);
});
self.addEventListener("notificationclick", function(event) {
	//console.log("[onNotificationClick]", event);
	//alert(event);
	event.notification.close();
	if ( event.action === "goObjects" ) {
		clients.openWindow("/#objects");
		synchronizeReader();
	} else if( event.action === "goSignUp" ) {
		clients.openWindow("/#signup");
		synchronizeReader();
	} else if( event.action === "goGooglePlay" ) {
		clients.openWindow("https://play.google.com/store/apps/details?id=info.internetcollaboratif.api&utm_source=notificationClick&utm_campaign=notification");
		synchronizeReader();
	} else {
		clients.openWindow("/");
	}
	if ( typeof firebase !== "undefined" ) {
		firebase.analytics().setUserProperties({'notification_click': 1});
	}
});

if ( typeof firebase !== "undefined" ) {
	// Get Instance ID token. Initially this makes a network call, once retrieved
	// subsequent calls to getToken will return from cache.
	firebase.messaging().getToken().then((currentToken) => {
		if (currentToken) {
			console.log("[pushSubscription] currentToken", currentToken);
			sendTokenToServer(currentToken);
			updateUIForPushEnabled(currentToken);
		} else {
			// Show permission request.
			console.log("[pushSubscription]", "No Instance ID token available. Request permission to generate one.");
			// Show permission UI.
			updateUIForPushPermissionRequired();
			setTokenSentToServer(false);
		}
	}).catch((err) => {
		console.log("[pushSubscription]", "An error occurred while retrieving token. ", err);
		showToken("Error retrieving Instance ID token. ", err);
		setTokenSentToServer(false);
	});

	firebase.messaging().onTokenRefresh(() => {
		firebase.messaging().getToken().then((refreshedToken) => {
			console.log("[pushSubscription]", "Token refreshed.");
			// Indicate that the new Instance ID token has not yet been sent to the
			// app server.
			setTokenSentToServer(false);
			// Send Instance ID token to app server.
			sendTokenToServer(refreshedToken);
			// ...
		}).catch((err) => {
			console.log("[pushSubscription]", "Unable to retrieve refreshed token ", err);
			showToken("Unable to retrieve refreshed token ", err);
		});
	});
}
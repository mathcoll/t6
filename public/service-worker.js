
var dataCacheName= 't6-cache-2019-01-10';
var cacheName= dataCacheName;
var cacheWhitelist = ['internetcollaboratif.info', 'css', 'img', 'js', 'gravatar'];
var cacheBlacklist = ['v2', 'authenticate', 'users/me/token', '/mail/'];
var filesToCache = [
	'/',
	'/applicationStart',
	'/networkError',
	'/manifest.json',
	'/css/t6App.min.css',
	'/img/opl_img3.jpg',
	'/img/opl_img2.jpg',
	'/img/opl_img.jpg',
	'/img/m/placeholder.png',
	'/img/m/welcome_card.jpg',
	'/img/m/side-nav-bg.jpg',
	'/img/m/icons/icon-128x128.png'
];
function refresh(response) {
	return self.clients.matchAll().then(function(clients) {
		clients.forEach(function(client) {
			var message = {
				type : 'refresh',
				url : response.url,
				eTag : response.headers.get('ETag')
			};
			client.postMessage(JSON.stringify(message));
		});
	});
}
function precache() {
	return caches.open(cacheName).then(function (cache) {
		return cache.addAll(filesToCache);
	});
}
function fromCache(request) {
	return caches.open(cacheName).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || Promise.reject('no-match');
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
self.addEventListener('install', function(e) {
	console.log('[ServiceWorker]', 'Install.');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker]', 'Caching app shell.', cacheName);
			return cache.addAll(filesToCache);
		})
	);
	e.waitUntil(precache().then(function() {
		console.log('[ServiceWorker]', 'Skip waiting on install');
		return self.skipWaiting();
	}));
});
self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker]', 'Activate.');
	console.log('[ServiceWorker]', 'Claiming clients for current page', self.clients.claim());
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
self.addEventListener('fetch', function(e) {
	if ( matchInArray(e.request.url, cacheBlacklist) ) {
		console.log('[ServiceWorker]', 'Serving the asset from server (Blacklisted).', e.request.url);
		e.respondWith(fromServer(e.request));
	} else if ( matchInArray(e.request.url, cacheWhitelist) ) {
		e.respondWith(
			caches.match(e.request).then(function(resp) {
				console.log('[ServiceWorker]', 'Serving the asset from cache (Whitelisted & found).', e.request.url);
				return resp || fetch(e.request)
			})
			.catch(function() {
				console.log('[ServiceWorker]', 'Serving the asset from server (Whitelisted but not found).', e.request.url);
				return fromServer(e.request);
			})
		);
	} else {
		console.log('[ServiceWorker]', 'Serving the asset from server directly.', e.request.url);
		fromServer(e.request);
	}
});
self.addEventListener('push', function(event) {
	if( event.data && event.data.text() ) {
		var notif = JSON.parse(event.data.text());
		const title = notif.title!==null?notif.title:'t6 notification';
		const options = {
			body: notif.body,
			icon: notif.icon!==null?notif.icon:'/img/m/icons/icon-128x128.png',
		};
		if ( notif.type == 'message' ) {
			event.waitUntil(self.registration.showNotification(title, options));
		} else {
			console.log('[pushSubscription]', notif);
		}
	}
});
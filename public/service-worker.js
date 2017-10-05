
var dataCacheName= 't6-cache-2017-09-06_2148';
var cacheName= 't6-cache-2017-09-06_2148';
var filesToCache = [
    '/m',
    '/manifest.json',
    '/m/applicationStart',
    
    '/js/m/material.min.js',
    '/js/m/t6app.js',
    '/js/m/toast.js',
    '/js/flot/jquery.flot.js',
    '/js/flot/jquery.flot.time.min.js',
    '/js/m/moment.min-2.18.1.js',
    '/js/OpenLayers/ol-4.1.1.min.js',
    
    '/css/m/inline.css',
    '/css/OpenLayers/ol-4.1.1.min.css',

    '/img/opl_img3.jpg',
    '/img/opl_img2.jpg',
    '/img/opl_img.jpg',
    '/img/m/welcome_card.jpg',
    '/img/m/side-nav-bg.jpg',
];

self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install.');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching app shell.');
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activate.');
	var cacheWhitelist = ['2.0.1'];
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (cacheWhitelist.indexOf(key) === -1) {
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
});

/*
self.addEventListener('fetch', function(e) {
	console.log('[ServiceWorker] The service worker is serving the asset.');
	if (e.request.url.indexOf('authenticate') > -1) {
		console.log('[ServiceWorker] Not cacheable.');
		// We should get the policy from server
		e.respondWith(fromServer(e.request));
	} else {
		e.respondWith(fromCache(e.request));
		e.waitUntil(
				update(e.request)
				.then(refresh)
		);
	}
});
*/

function fromServer(request) {
	console.log('[ServiceWorker] '+request.url+' from server.');
	return fetch(request).then(function (response) {
		return response;
	});
}

function fromCache(request) {
	console.log('[ServiceWorker] '+request.url+' from cache.');
	return caches.open(cacheName).then(function (cache) {
		return cache.match(request);
	});
}

function update(request) {
	console.log('[ServiceWorker] '+request.url+' from server.');
	return caches.open(cacheName).then(function (cache) {
		return fetch(request).then(function (response) {
			return cache.put(request, response.clone()).then(function () {
				return response;
			});
		});
	});
}

function refresh(response) {
	console.log('[ServiceWorker] Refresh Cache.');
	return self.clients.matchAll().then(function (clients) {
		clients.forEach(function (client) {
			var message = {
				type: 'refresh',
				url: response.url,
				eTag: response.headers.get('ETag')
			};
			client.postMessage(JSON.stringify(message));
		});
	});
}

self.addEventListener('push', function(event) {
	//console.log('[ServiceWorker] Push Received.');
	//console.log('[ServiceWorker] Push had this data: ', event);
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
			console.log(notif);
		}
	}
});

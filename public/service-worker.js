
var dataCacheName= 't6-cache-2017-06-20_2337';
var cacheName= 't6-cache-2017-06-20_2337';
var filesToCache = [
    '/m',
    '/manifest.json',
    '/js/m/material.min.js',
    '/js/m/t6app.js',
    '/js/m/menu.js',
    '/js/m/offline.js',
    '/js/m/toast.js',
    '/js/t6.min.js',
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

self.addEventListener('hashchange', function() {
    console.log('this view\'s id is ', location.hash.substr(1));
});

self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activate');
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key !== cacheName && key !== dataCacheName) {
					console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
	console.log('Handling fetch event for', event.request.url);
	if (event.request.url.indexOf('2.0.1') < -1) { //////////////////////////////////////// REMOVING CACHE
		event.respondWith(
			caches.match(event.request).then(function(response) {
				if (response) {
					console.log('Found response in cache');// , response
					return response;
				}
				console.log('No response found in cache. About to fetch from network...');
				//toast('No response found in cache. About to fetch from network...', 5000);
				return fetch(event.request).then(function(response) {
					/*
					caches.open(cacheName).then(function(cache) {
						console.log('About to put');
						cache.put(event.request, response.clone());
						console.log('Put is done');
						//toast('Put is done.', 5000);
					});
					*/
					caches.open(cacheName).then(function(cache) {
						return cache.addAll([event.request]);
					})
					return response;
				}).catch(function(error) {
					console.error('Fetching failed:', error);
					throw error;
				});
			})
		);
	} else {
		console.log('No caching on this file.');
	}
});

self.addEventListener('push', function(event) {
	//console.log('[ServiceWorker] Push Received.');
	//console.log('[ServiceWorker] Push had this data: ', event.data.text());
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
});

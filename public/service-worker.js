
var dataCacheName= 't6-cache-2017-06-01';
var cacheName= 't6-cache-2017-06-01';
var filesToCache = [
    '/css/m/inline.css',
    '/js/m/material.min.js',
    '/js/m/t6app.js',
    '/js/m/menu.js',
    '/js/m/offline.js',
    '/js/m/toast.js',

    '/img/opl_img3.jpg',
    '/img/opl_img2.jpg',
    '/img/opl_img.jpg',
    '/img/m/welcome_card.jpg',
    '/img/m/side-nav-bg.jpg',
];

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

self.addEventListener('fetch', function(e) {
	console.log('[Service Worker] Fetch', e.request.url);
	if (e.request.url.indexOf('2.0.1') > -1) {
		/*
		 * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
		 */
		console.log('[ServiceWorker] contains 2.0.1');
		e.respondWith(
			caches.open(dataCacheName).then(function(cache) {
				return fetch(e.request).then(function(response){
					cache.put(e.request.url, response.clone());
					return response;
				});
			})
		);
	} else {
		/*
		 * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
		 */
		console.log('[ServiceWorker] Cache, falling back to the network -> '+e.request.url);
		e.respondWith(
			caches.match(e.request).then(function(response) {
				return response || fetch(e.request);
			})
		);
	}
});


var dataCacheName= 't6-cache-2017-11-17_2007';
var cacheName= 't6-cache-2017-11-17_2007';
var cacheWhitelist = ['internetcollaboratif.info', 'localhost'];
var filesToCache = [
    //local
    '/manifest.json',
    '/m/applicationStart',
    '/',

    //local/javascripts
    '/js/m/vendor.min.js',
    '/js/m/t6app.js',
    //local/styles
    '/css/t6App.min.css',
    //local/images
    '/img/opl_img3.jpg',
    '/img/opl_img2.jpg',
    '/img/opl_img.jpg',
    '/img/m/welcome_card.jpg',
    '/img/m/side-nav-bg.jpg',
];

self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install.');
	/*
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching app shell.');
			return cache.addAll(filesToCache);
		})
	);
	*/
	e.waitUntil(precache().then(function() {
		console.log('[ServiceWorker] Skip waiting on install');
		return self.skipWaiting();
	}));
});

self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activate.');
	console.log('[ServiceWorker] Claiming clients for current page');
	return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
	console.log('The service worker is serving the asset.'+ e.request.url);
	if (cacheWhitelist.indexOf(e.request.url) !== -1) {
		e.respondWith(fromCache(e.request).catch(fromServer(e.request)));
		e.waitUntil(update(e.request));
	} else {
		e.respondWith(fromServer(e.request));
	}
});

self.addEventListener('fetch', function(e) {
	console.log('[ServiceWorker] The service worker is serving the asset.');
	if (e.request.url.indexOf('authenticate') > -1) {
		console.log('[ServiceWorker] Not cacheable.');
		// We should get the policy from server
		e.respondWith(fromServer(e.request));
	} else {
		e.respondWith(fromCache(e.request));
		e.waitUntil(
			update(e.request).then(refresh)
		);
	}
});

function precache() {
	return caches.open(cacheName).then(function (cache) {
		return cache.addAll(filesToCache);
	});
}

function fromCache(request) {
	//we pull files from the cache first thing so we can show them fast
	return caches.open(cacheName).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || Promise.reject('no-match');
		});
	});
}

function update(request) {
	//this is where we call the server to get the newest version of the 
	//file to use the next time we show view
	return caches.open(cacheName).then(function (cache) {
		return fetch(request).then(function (response) {
			return cache.put(request, response);
		});
	});
}

function fromServer(request){
	//this is the fallback if it is not in the cahche to go to the server and get it
	return fetch(request).then(function(response){ return response})
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

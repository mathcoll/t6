
var dataCacheName= 't6-cache-2018-06-31';
var cacheName= dataCacheName;
var cacheWhitelist = ['internetcollaboratif.info', 'css', 'img', 'js', 'gravatar', 'gstatic'];
var cacheBlacklist = ['v2', 'authenticate', 'users/me/token'];
var filesToCache = [
    //local
    '/',
    '/manifest.json',
    '/css/t6App.min.css',
    '/img/opl_img3.jpg',
    '/img/opl_img2.jpg',
    '/img/opl_img.jpg',
    '/img/m/welcome_card.jpg',
    '/img/m/side-nav-bg.jpg',
    '/img/m/icons/icon-128x128.png',
    //external/fonts
    '/fonts/Material-Icons.woff2',
    /*
    //cdn/javascripts
    '//cdn.internetcollaboratif.info/js/m/t6app.js',
    //cdn/styles
    '//cdn.internetcollaboratif.info/css/t6App.min.css',
    '//cdn.internetcollaboratif.info/js/m/vendor.min.js',
    //cdn/images
    '//cdn.internetcollaboratif.info/img/opl_img3.jpg',
    '//cdn.internetcollaboratif.info/img/opl_img2.jpg',
    '//cdn.internetcollaboratif.info/img/opl_img.jpg',
    '//cdn.internetcollaboratif.info/img/phone.jpg',
    '//cdn.internetcollaboratif.info/img/m/welcome_card.jpg',
    '//cdn.internetcollaboratif.info/img/m/side-nav-bg.jpg',
    '//cdn.internetcollaboratif.info/img/m/icons/icon-128x128.png',
     */
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
	//this is the fallback if it is not in the cache to go to the server and get it
	return fetch(request).then(function(response){ return response; });
}

self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install.');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching app shell.', cacheName);
			return cache.addAll(filesToCache);
		})
	);
	e.waitUntil(precache().then(function() {
		console.log('[ServiceWorker] Skip waiting on install');
		return self.skipWaiting();
	}));
});

self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activate.');
	console.log('[ServiceWorker] Claiming clients for current page', self.clients.claim());
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
		console.log('[ServiceWorker] Serving the asset from server (Blacklisted).', e.request.url);
		e.respondWith(fromServer(e.request));
	} else if ( matchInArray(e.request.url, cacheWhitelist) ) {
		console.log('[ServiceWorker] Serving the asset from cache (Whitelisted).', e.request.url);
		e.respondWith(fromCache(e.request).catch(fromServer(e.request)));
		e.waitUntil(update(e.request));
	} else {
		console.log('[ServiceWorker] from server directly.', e.request.url);
		fromServer(e.request);
	}
});

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

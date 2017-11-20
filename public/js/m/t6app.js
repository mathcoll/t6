var app = {
	api_version: 'v2.0.1',
	debug: false,
	baseUrl: '',
	baseUrlCdn: '//cdn.internetcollaboratif.info',
	bearer: '',
	auth: {},
	isLogged: false,
	autologin: false,
	RateLimit : {Limit: null, Remaining: null, Used: null},
	date_format: 'DD/MM/YYYY, HH:mm',
	cardMaxChars: 256,
	tawktoid: '58852788bcf30e71ac141187',
	hotjarid: 694506,
	applicationServerKey: 'BHa70a3DUtckAOHGltzLmQVI6wed8pkls7lOEqpV71uxrv7RrIY-KCjMNzynYGt4LJI9Dn2EVP3_0qFAnVxoy6I',
	icons: {
		'objects': 'devices_other',
		'flows': 'settings_input_component',
		'snippets': 'widgets',
		'dashboards': 'dashboards',
		'rules': 'call_split',
		'mqtts': 'volume_down',
		'login': 'email',
		'datapoints': 'filter_center_focus',
		'type': 'label',
		'description': 'label',
		'icon': 'label_outline',
		'settings': 'settings',
		'menu': 'menu',
		'name': 'list',
		'delete': 'delete',
		'edit': 'edit',
		'color': 'format_color_fill',
		'date': 'event',
		'update': 'update',
		'status': 'favorite',
		'terms': 'business_center',
		'docs': 'code',
		'delete_question': 'error_outline',
	},
	types: [
		{name: 'cast', value:'Cast'},
		{name: 'cast_connected', value:'Cast Connected'},
		{name: 'computer', value:'Computer'},
		{name: 'desktop_mac', value:'Desktop Mac'},
		{name: 'desktop_windows', value:'Desktop Windows'},
		{name: 'developer_board', value:'Developer Board'},
		{name: 'device_hub', value:'Device Hub'},
		{name: 'devices_other', value:'Devices Other'},
		{name: 'dock', value:'Dock'},
		{name: 'gamepad', value:'Gamepad'},
		{name: 'headset', value:'Headset'},
		{name: 'headset_mic', value:'Headset Mic'},
		{name: 'keyboard', value:'Keyboard'},
		{name: 'keyboard_voice', value:'Keyboard Voice'},
		{name: 'laptop', value:'Laptop'},
		{name: 'laptop_chromeboo', value:'Laptop Chromebook'},
		{name: 'laptop_mac', value:'Laptop Mac'},
		{name: 'laptop_windows', value:'Laptop Windows'},
		{name: 'memory', value:'Memory'},
		{name: 'mouse', value:'Mouse'},
		{name: 'phone_android', value:'Phone Android'},
		{name: 'phone_iphone', value:'Phone Iphone'},
		{name: 'phonelink', value:'Phonelink'},
		{name: 'router', value:'Router'},
		{name: 'scanner', value:'Scanner'},
		{name: 'security', value:'Security'},
		{name: 'sim_card', value:'Sim Card'},
		{name: 'smartphone', value:'Smartphone'},
		{name: 'speaker', value:'Speaker'},
		{name: 'speaker_group', value:'Speaker Group'},
		{name: 'tablet', value:'Tablet'},
		{name: 'tablet_android', value:'Tablet Android'},
		{name: 'tablet_mac', value:'Tablet Mac'},
		{name: 'toys', value:'Toys'},
		{name: 'tv', value:'Tv'},
		{name: 'videogame_asset', value:'Videogame Asset'},
		{name: 'watch', value:'Watch'},
	],
	defaultResources: {
		object: {id:'', attributes: {name: '', description: '', is_public: true, type: '', ipv4: '', ipv6: '', longitude: 0, latitude: 0, position: ''}},
		flow: {id:'', attributes: {name: '', mqtt_topic: ''}},
		dashboard: {id:'', attributes: {name: '', description: ''}},
		snippet: {id:'', attributes: {name: '', icon: '', color: ''}},
		rule: {id:'', attributes: {}},
	},
};

var buttons = {}; // see function app.refreshButtonsSelectors()
var containers = {
	spinner: document.querySelector('section#loading-spinner'),
	index: document.querySelector('section#index'),
	objects: document.querySelector('section#objects'),
	object: document.querySelector('section#object'),
	object_add: document.querySelector('section#object_add'),
	flows: document.querySelector('section#flows'),
	flow: document.querySelector('section#flow'),
	flow_add: document.querySelector('section#flow_add'),
	dashboards: document.querySelector('section#dashboards'),
	dashboard: document.querySelector('section#dashboard'),
	dashboard_add: document.querySelector('section#dashboard_add'),
	snippets: document.querySelector('section#snippets'),
	snippet: document.querySelector('section#snippet'),
	snippet_add: document.querySelector('section#snippet_add'),
	profile: document.querySelector('section#profile'),
	settings: document.querySelector('section#settings'),
	rules: document.querySelector('section#rules'),
	mqtts: document.querySelector('section#mqtts'),
	status: document.querySelector('section#status'),
	terms: document.querySelector('section#terms'),
	docs: document.querySelector('section#docs'),
};

(function (exports) {
	'use strict';
	function hex_md5(r){return rstr2hex(rstr_md5(str2rstr_utf8(r)))}function b64_md5(r){return rstr2b64(rstr_md5(str2rstr_utf8(r)))}function any_md5(r,t){return rstr2any(rstr_md5(str2rstr_utf8(r)),t)}function hex_hmac_md5(r,t){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)))}function b64_hmac_md5(r,t){return rstr2b64(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)))}function any_hmac_md5(r,t,d){return rstr2any(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)),d)}function md5_vm_test(){return"900150983cd24fb0d6963f7d28e17f72"==hex_md5("abc").toLowerCase()}function rstr_md5(r){return binl2rstr(binl_md5(rstr2binl(r),8*r.length))}function rstr_hmac_md5(r,t){var d=rstr2binl(r);d.length>16&&(d=binl_md5(d,8*r.length));for(var n=Array(16),_=Array(16),m=0;16>m;m++)n[m]=909522486^d[m],_[m]=1549556828^d[m];var f=binl_md5(n.concat(rstr2binl(t)),512+8*t.length);return binl2rstr(binl_md5(_.concat(f),640))}function rstr2hex(r){try{}catch(t){hexcase=0}for(var d,n=hexcase?"0123456789ABCDEF":"0123456789abcdef",_="",m=0;m<r.length;m++)d=r.charCodeAt(m),_+=n.charAt(d>>>4&15)+n.charAt(15&d);return _}function rstr2b64(r){try{}catch(t){b64pad=""}for(var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n="",_=r.length,m=0;_>m;m+=3)for(var f=r.charCodeAt(m)<<16|(_>m+1?r.charCodeAt(m+1)<<8:0)|(_>m+2?r.charCodeAt(m+2):0),h=0;4>h;h++)n+=8*m+6*h>8*r.length?b64pad:d.charAt(f>>>6*(3-h)&63);return n}function rstr2any(r,t){var d,n,_,m,f,h=t.length,e=Array(Math.ceil(r.length/2));for(d=0;d<e.length;d++)e[d]=r.charCodeAt(2*d)<<8|r.charCodeAt(2*d+1);var a=Math.ceil(8*r.length/(Math.log(t.length)/Math.log(2))),i=Array(a);for(n=0;a>n;n++){for(f=Array(),m=0,d=0;d<e.length;d++)m=(m<<16)+e[d],_=Math.floor(m/h),m-=_*h,(f.length>0||_>0)&&(f[f.length]=_);i[n]=m,e=f}var o="";for(d=i.length-1;d>=0;d--)o+=t.charAt(i[d]);return o}function str2rstr_utf8(r){for(var t,d,n="",_=-1;++_<r.length;)t=r.charCodeAt(_),d=_+1<r.length?r.charCodeAt(_+1):0,t>=55296&&56319>=t&&d>=56320&&57343>=d&&(t=65536+((1023&t)<<10)+(1023&d),_++),127>=t?n+=String.fromCharCode(t):2047>=t?n+=String.fromCharCode(192|t>>>6&31,128|63&t):65535>=t?n+=String.fromCharCode(224|t>>>12&15,128|t>>>6&63,128|63&t):2097151>=t&&(n+=String.fromCharCode(240|t>>>18&7,128|t>>>12&63,128|t>>>6&63,128|63&t));return n}function str2rstr_utf16le(r){for(var t="",d=0;d<r.length;d++)t+=String.fromCharCode(255&r.charCodeAt(d),r.charCodeAt(d)>>>8&255);return t}function str2rstr_utf16be(r){for(var t="",d=0;d<r.length;d++)t+=String.fromCharCode(r.charCodeAt(d)>>>8&255,255&r.charCodeAt(d));return t}function rstr2binl(r){for(var t=Array(r.length>>2),d=0;d<t.length;d++)t[d]=0;for(var d=0;d<8*r.length;d+=8)t[d>>5]|=(255&r.charCodeAt(d/8))<<d%32;return t}function binl2rstr(r){for(var t="",d=0;d<32*r.length;d+=8)t+=String.fromCharCode(r[d>>5]>>>d%32&255);return t}function binl_md5(r,t){r[t>>5]|=128<<t%32,r[(t+64>>>9<<4)+14]=t;for(var d=1732584193,n=-271733879,_=-1732584194,m=271733878,f=0;f<r.length;f+=16){var h=d,e=n,a=_,i=m;d=md5_ff(d,n,_,m,r[f+0],7,-680876936),m=md5_ff(m,d,n,_,r[f+1],12,-389564586),_=md5_ff(_,m,d,n,r[f+2],17,606105819),n=md5_ff(n,_,m,d,r[f+3],22,-1044525330),d=md5_ff(d,n,_,m,r[f+4],7,-176418897),m=md5_ff(m,d,n,_,r[f+5],12,1200080426),_=md5_ff(_,m,d,n,r[f+6],17,-1473231341),n=md5_ff(n,_,m,d,r[f+7],22,-45705983),d=md5_ff(d,n,_,m,r[f+8],7,1770035416),m=md5_ff(m,d,n,_,r[f+9],12,-1958414417),_=md5_ff(_,m,d,n,r[f+10],17,-42063),n=md5_ff(n,_,m,d,r[f+11],22,-1990404162),d=md5_ff(d,n,_,m,r[f+12],7,1804603682),m=md5_ff(m,d,n,_,r[f+13],12,-40341101),_=md5_ff(_,m,d,n,r[f+14],17,-1502002290),n=md5_ff(n,_,m,d,r[f+15],22,1236535329),d=md5_gg(d,n,_,m,r[f+1],5,-165796510),m=md5_gg(m,d,n,_,r[f+6],9,-1069501632),_=md5_gg(_,m,d,n,r[f+11],14,643717713),n=md5_gg(n,_,m,d,r[f+0],20,-373897302),d=md5_gg(d,n,_,m,r[f+5],5,-701558691),m=md5_gg(m,d,n,_,r[f+10],9,38016083),_=md5_gg(_,m,d,n,r[f+15],14,-660478335),n=md5_gg(n,_,m,d,r[f+4],20,-405537848),d=md5_gg(d,n,_,m,r[f+9],5,568446438),m=md5_gg(m,d,n,_,r[f+14],9,-1019803690),_=md5_gg(_,m,d,n,r[f+3],14,-187363961),n=md5_gg(n,_,m,d,r[f+8],20,1163531501),d=md5_gg(d,n,_,m,r[f+13],5,-1444681467),m=md5_gg(m,d,n,_,r[f+2],9,-51403784),_=md5_gg(_,m,d,n,r[f+7],14,1735328473),n=md5_gg(n,_,m,d,r[f+12],20,-1926607734),d=md5_hh(d,n,_,m,r[f+5],4,-378558),m=md5_hh(m,d,n,_,r[f+8],11,-2022574463),_=md5_hh(_,m,d,n,r[f+11],16,1839030562),n=md5_hh(n,_,m,d,r[f+14],23,-35309556),d=md5_hh(d,n,_,m,r[f+1],4,-1530992060),m=md5_hh(m,d,n,_,r[f+4],11,1272893353),_=md5_hh(_,m,d,n,r[f+7],16,-155497632),n=md5_hh(n,_,m,d,r[f+10],23,-1094730640),d=md5_hh(d,n,_,m,r[f+13],4,681279174),m=md5_hh(m,d,n,_,r[f+0],11,-358537222),_=md5_hh(_,m,d,n,r[f+3],16,-722521979),n=md5_hh(n,_,m,d,r[f+6],23,76029189),d=md5_hh(d,n,_,m,r[f+9],4,-640364487),m=md5_hh(m,d,n,_,r[f+12],11,-421815835),_=md5_hh(_,m,d,n,r[f+15],16,530742520),n=md5_hh(n,_,m,d,r[f+2],23,-995338651),d=md5_ii(d,n,_,m,r[f+0],6,-198630844),m=md5_ii(m,d,n,_,r[f+7],10,1126891415),_=md5_ii(_,m,d,n,r[f+14],15,-1416354905),n=md5_ii(n,_,m,d,r[f+5],21,-57434055),d=md5_ii(d,n,_,m,r[f+12],6,1700485571),m=md5_ii(m,d,n,_,r[f+3],10,-1894986606),_=md5_ii(_,m,d,n,r[f+10],15,-1051523),n=md5_ii(n,_,m,d,r[f+1],21,-2054922799),d=md5_ii(d,n,_,m,r[f+8],6,1873313359),m=md5_ii(m,d,n,_,r[f+15],10,-30611744),_=md5_ii(_,m,d,n,r[f+6],15,-1560198380),n=md5_ii(n,_,m,d,r[f+13],21,1309151649),d=md5_ii(d,n,_,m,r[f+4],6,-145523070),m=md5_ii(m,d,n,_,r[f+11],10,-1120210379),_=md5_ii(_,m,d,n,r[f+2],15,718787259),n=md5_ii(n,_,m,d,r[f+9],21,-343485551),d=safe_add(d,h),n=safe_add(n,e),_=safe_add(_,a),m=safe_add(m,i)}return Array(d,n,_,m)}function md5_cmn(r,t,d,n,_,m){return safe_add(bit_rol(safe_add(safe_add(t,r),safe_add(n,m)),_),d)}function md5_ff(r,t,d,n,_,m,f){return md5_cmn(t&d|~t&n,r,t,_,m,f)}function md5_gg(r,t,d,n,_,m,f){return md5_cmn(t&n|d&~n,r,t,_,m,f)}function md5_hh(r,t,d,n,_,m,f){return md5_cmn(t^d^n,r,t,_,m,f)}function md5_ii(r,t,d,n,_,m,f){return md5_cmn(d^(t|~n),r,t,_,m,f)}function safe_add(r,t){var d=(65535&r)+(65535&t),n=(r>>16)+(t>>16)+(d>>16);return n<<16|65535&d}function bit_rol(r,t){return r<<t|r>>>32-t}var hexcase=0,b64pad="";
	exports.hex_md5 = hex_md5; //Make this method available in global
	
	var toastContainer = document.querySelector('.toast__container');

	//To show notification
	function toast(msg, options) {
		if (!msg) return;

		options = options || {timeout:3000, type: 'info'};
		// type = error, done, warning, help, info
		options.timeout = options.timeout!==undefined?options.timeout:3000;
		options.type = options.type!==undefined?options.type:'info';

		var toastMsg = document.createElement('div');
		toastMsg.className = 'toast__msg '+options.type;
		var icon = document.createElement('i');
		icon.className = 'material-icons';
		icon.textContent = options.type;
		var span = document.createElement('span');
		span.textContent = msg;
		toastMsg.appendChild(icon);
		toastMsg.appendChild(span);
		toastContainer.appendChild(toastMsg);

		//Show toast for 3secs and hide it
		setTimeout(function () {
			toastMsg.classList.add('toast__msg--hide');
		}, options.timeout);

		//Remove the element after hiding
		toastMsg.addEventListener('transitionend', function (event) {
			event.target.parentNode.removeChild(event.target);
		});
	}
	exports.toast = toast; //Make this method available in global
	
	function getParameterByName(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
	exports.getParameterByName = getParameterByName; //Make this method available in global
})(typeof window === 'undefined' ? module.exports : window);
	
(function() {
	'use strict';

/* *********************************** General functions *********************************** */
	function setLoginAction() {	
		for (var i in buttons.loginButtons) {
			if ( buttons.loginButtons[i].childElementCount > -1 ) {
				buttons.loginButtons[i].removeEventListener('click', onLoginButtonClick, false);
				buttons.loginButtons[i].addEventListener('click', onLoginButtonClick, false);
			}
		}
	}; //setLoginAction
	
	function onLoginButtonClick(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var username = myForm.querySelector("form.signin input[name='username']").value;
		var password = myForm.querySelector("form.signin input[name='password']").value;
		app.auth = {"username":username, "password":password};
		app.authenticate();
		evt.preventDefault();
	}; //onLoginButtonClick
	
	function onStatusButtonClick(evt) {
		app.getStatus();
		app.setSection('status');
		if (evt) evt.preventDefault();
	}; //onStatusButtonClick
	
	function onDocsButtonClick(evt) {
		app.setSection('docs');
		if (evt) evt.preventDefault();
	}; //onDocsButtonClick
	
	function onTermsButtonClick(evt) {
		app.getTerms();
		app.setSection('terms');
		if (evt) evt.preventDefault();
	}; //onStatusButtonClick
	
	function setSignupAction() {
		for (var i in buttons.user_create) {
			if ( buttons.user_create[i].childElementCount > -1 ) {
				buttons.user_create[i].addEventListener('click', onSignupButtonClick, false);
			}
		}
	}; //setSignupAction
	
	function setPasswordResetAction() {
		for (var i in buttons.user_setpassword) {
			if ( buttons.user_setpassword[i].childElementCount > -1 ) {
				buttons.user_setpassword[i].addEventListener('click', onPasswordResetButtonClick, false);
			}
		}
	}; //setPasswordResetAction
	
	function setForgotAction() {
		for (var i in buttons.user_forgot) {
			if ( buttons.user_forgot[i].childElementCount > -1 ) {
				buttons.user_forgot[i].addEventListener('click', onForgotPasswordButtonClick, false);
			}
		}
	}; //setForgotAction
	
	function onSignupButtonClick(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode
		var email = myForm.querySelector("form.signup input[name='email']").value;
		var firstName = myForm.querySelector("form.signup input[name='firstName']").value;
		var lastName = myForm.querySelector("form.signup input[name='lastName']").value;
		var postData = {"email":email, "firstName":firstName, "lastName":lastName};
		if ( email ) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(postData) };
			var url = app.baseUrl+"/"+app.api_version+"/users";
			
			fetch(url, myInit)
			.then(
				fetchStatusHandler
			).then(function(fetchResponse){
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection('login');
				toast('Welcome, you should have received an email to set your password.', {timeout:3000, type: 'done'});
			})
			.catch(function (error) {
				toast('We can\'t process your signup. Please resubmit the form later!', {timeout:3000, type: 'warning'});
			});
		} else {
			toast('We can\'t process your signup.', {timeout:3000, type: 'warning'});
		}
		evt.preventDefault();
	}; //onSignupButtonClick
	
	function onPasswordResetButtonClick(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode
		var password = myForm.querySelector("form.resetpassword input[name='password']").value;
		var password2 = myForm.querySelector("form.resetpassword input[name='password2']").value;
		var token = getParameterByName('token');
		if ( token !== undefined && password == password2 ) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify({"password":password}) };
			var url = app.baseUrl+"/"+app.api_version+"/users/token/"+token;
			
			fetch(url, myInit)
			.then(
				fetchStatusHandler
			).then(function(fetchResponse){
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection('login');
				toast('Your password has been reset; please login again.', {timeout:3000, type: 'done'});
			})
			.catch(function (error) {
				toast('We can\'t process your password reset. Please resubmit the form later!', {timeout:3000, type: 'warning'});
			});
		} else {
			toast('We can\'t process your password reset.', {timeout:3000, type: 'warning'});
		}
		evt.preventDefault();
	}; //onPasswordResetButtonClick
	
	function onForgotPasswordButtonClick(evt) {
		/*
		 * NOT YET IMPLEMENTED
		evt.preventDefault();
		*/
	}; //onForgotPasswordButtonClick

	function urlBase64ToUint8Array(base64String) {
		const padding = '='.repeat((4 - base64String.length % 4) % 4);
		const base64 = (base64String + padding)  .replace(/\-/g, '+') .replace(/_/g, '/');
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (var i=0; i<rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); };
		return outputArray;
	}; //urlBase64ToUint8Array
	
	function askPermission() {
		return new Promise(function(resolve, reject) {
			const permissionResult = Notification.requestPermission(function(result) {
				resolve(result);
			});
			
			if (permissionResult) {
				permissionResult.then(resolve, reject);
			}
		})
		.then(function(permissionResult) {
			if (permissionResult !== 'granted') {
				throw new Error('We weren\'t granted permission.');
			}
		});
	}; //askPermission
	
	function registerServiceWorker() {
		return navigator.serviceWorker.register('/service-worker.js')
		.then(function(registration) {
			console.log('[ServiceWorker] Registered');
		    return registration;
		})
		.catch(function(err) {
			console.log('[ServiceWorker] error occured...'+ err);
		});
	}; //registerServiceWorker
	
	function subscribeUserToPush() {
		return registerServiceWorker()
		.then(function(registration) {
			const subscribeOptions = {
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(app.applicationServerKey)
			};
			if ( registration ) {
				return registration.pushManager.subscribe(subscribeOptions);
			} else {
				return false;
			}
		})
		.then(function(pushSubscription) {
			//console.log('Go to the settings to see the endpoints details for push notifications.');
			//console.log(pushSubscription);
			var settings = "";
			var j = JSON.parse(JSON.stringify(pushSubscription));
			if ( j && j.keys ) {
				settings += "<section class=\"mdl-grid mdl-cell--12-col\">";
				settings += app.getSubtitle('API Push');
				settings += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				settings += app.getField('cloud', 'Endpoint', j.endpoint, {type: 'input', isEdit: true});
				settings += app.getField('vpn_key', 'Key', j.keys.p256dh, {type: 'input', isEdit: true});
				settings += app.getField('vpn_lock', 'Auth', j.keys.auth, {type: 'input', isEdit: true});
				settings += "	</div>";
				settings += "</section>";
			}

			settings += "<section class=\"mdl-grid mdl-cell--12-col\">";
			settings += app.getSubtitle('Application');
			settings += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
			settings += app.getField('add_circle_outline', 'Floating Action Buttons', app.getSetting('settings.fab_position')!==undefined?app.getSetting('settings.fab_position'):'fab__bottom', {type: 'select', id: 'settings.fab_position', options: [ {name: 'fab__top', value:'Top'}, {name: 'fab__bottom', value:'Bottom'} ], isEdit: true });
			settings += app.getField('add_circle_outline', 'Notifications', app.getSetting('settings.notifications')!==undefined?app.getSetting('settings.notifications'):true, {type: 'switch', isEdit: true});
			settings += "	</div>";
			settings += "</section>";

			(containers.settings).querySelector('.page-content').innerHTML = settings;
			
			if ( document.getElementById('settings.fab_position') ) {
				document.getElementById('settings.fab_position').addEventListener('change', function(e) {
					app.setSetting('settings.fab_position', e.target.value);
					var fabs = document.querySelectorAll('.mdl-button--fab_flinger-container');
					if ( e.target.value == 'fab__top' ) {
						for (var f in fabs) {
							if ( (fabs[f]).childElementCount > -1 ) {
								(fabs[f]).classList.add('fab__top');
								(fabs[f]).classList.remove('fab__bottom');
							}
						}
					} else {
						for (var f in fabs) {
							if ( (fabs[f]).childElementCount > -1 ) {
								(fabs[f]).classList.remove('fab__top');
								(fabs[f]).classList.add('fab__bottom');
							}
						}
					}
				});
			}
			return pushSubscription;
		})
		.catch(function (error) {
			console.log(error);
		});
	}; //subscribeUserToPush

/* *********************************** Application functions *********************************** */
	app.onSaveObject = function(evt) {
		var object_id = evt.target.parentNode.getAttribute('data-id')?evt.target.parentNode.getAttribute('data-id'):evt.target.getAttribute('data-id');
		if ( !object_id ) {
			toast('No Object id found!', {timeout:3000, type: 'error'});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			var body = {
				type: myForm.querySelector("select[name='Type']").parentNode.querySelector(".mdl-selectfield__box-value").innerHTML,
				name: myForm.querySelector("input[name='Name']").value,
				description: myForm.querySelector("textarea[name='Description']").value,
				position: myForm.querySelector("input[name='Position']")!==null?myForm.querySelector("input[name='Position']").value:'',
				longitude: myForm.querySelector("input[name='Longitude']")!==null?myForm.querySelector("input[name='Longitude']").value:'',
				latitude: myForm.querySelector("input[name='Latitude']")!==null?myForm.querySelector("input[name='Latitude']").value:'',
				ipv4: myForm.querySelector("input[name='IPv4']")!==null?myForm.querySelector("input[name='IPv4']").value:'',
				ipv6: myForm.querySelector("input[name='IPv6']")!==null?myForm.querySelector("input[name='IPv6']").value:'',
				isPublic: myForm.querySelector("label.mdl-switch").classList.contains("is-checked")==true?'true':'false',
			};
	
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+app.bearer);
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'PUT', headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+'/'+app.api_version+'/objects/'+object_id;
			fetch(url, myInit)
			.then(
				fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				var objectContainer = document.querySelector("section#objects div[data-id='"+object_id+"']");
				app.setSection('objects');
				objectContainer.querySelector("h2").innerHTML = body.name;
				objectContainer.querySelector("div.mdl-list__item--three-line.small-padding span.mdl-list__item-sub-title").innerHTML = app.nl2br(body.description.substring(0, app.cardMaxChars));
				toast('Object has been saved.', {timeout:3000, type: 'done'});
			})
			.catch(function (error) {
				toast('Object has not been saved.', {timeout:3000, type: 'error'});
			});
			evt.preventDefault();
		}
	} //onSaveObject
	
	app.onAddObject = function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			type: myForm.querySelector("select[name='Type']").value,
			name: myForm.querySelector("input[name='Name']").value,
			description: myForm.querySelector("textarea[name='Description']").value,
			position: myForm.querySelector("input[name='Position']")!==null?myForm.querySelector("input[name='Position']").value:'',
			longitude: myForm.querySelector("input[name='Longitude']")!==null?myForm.querySelector("input[name='Longitude']").value:'',
			latitude: myForm.querySelector("input[name='Latitude']")!==null?myForm.querySelector("input[name='Latitude']").value:'',
			ipv4: myForm.querySelector("input[name='IPv4']")!==null?myForm.querySelector("input[name='IPv4']").value:'',
			ipv6: myForm.querySelector("input[name='IPv6']")!==null?myForm.querySelector("input[name='IPv6']").value:'',
			isPublic: myForm.querySelector("label.mdl-switch").classList.contains("is-checked")==true?'true':'false',
		};
		if ( app.debug === true ) {
			console.log(JSON.stringify(body));
		}

		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+'/'+app.api_version+'/objects/';
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection('objects');
			toast('Object has been added.', {timeout:3000, type: 'done'});
		})
		.catch(function (error) {
			toast('Object has not been added.', {timeout:3000, type: 'error'});
		});
		evt.preventDefault();
	} //onAddObject
	
	app.onAddFlow = function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			name: myForm.querySelector("input[name='Name']").value,
			mqtt_topic: myForm.querySelector("input[name='MQTT Topic']").value,
		};
		if ( app.debug === true ) {
			console.log(JSON.stringify(body));
		}
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+'/'+app.api_version+'/flows/';
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			toast('Flow has been added.', {timeout:3000, type: 'done'});
		})
		.catch(function (error) {
			toast('Flow has not been added.', {timeout:3000, type: 'error'});
		});
		evt.preventDefault();
	} //onAddFlow
	
	app.refreshButtonsSelectors = function() {
		if ( componentHandler ) componentHandler.upgradeDom();
		buttons = {
			//signin_button
			//logout_button
			notification: document.querySelector('button#notification'),

			menuTabBar: document.querySelectorAll('.mdl-layout__tab-bar a'),
			status: document.querySelectorAll('.statusButton'),
			docs: document.querySelectorAll('.docsButton'),
			terms: document.querySelectorAll('.termsButton'),
				
			loginButtons: document.querySelectorAll('form.signin button.login_button'),
			user_create: document.querySelectorAll('form.signup button.createUser'),
			user_setpassword: document.querySelectorAll('form.resetpassword button.setPassword'),
			user_forgot: document.querySelectorAll('form.forgotpassword button.forgotPassword'),
			expandButtons: document.querySelectorAll('.showdescription_button'),
			object_create: document.querySelectorAll('.showdescription_button'),
			
			deleteObject: document.querySelectorAll('#objects .delete-button'),
			deleteObject2: document.querySelectorAll('#objects .delete-button'),
			editObject: document.querySelectorAll('#objects .edit-button'),
			createObject: document.querySelector('#objects button#createObject'),
			saveObject: document.querySelector('#object section.fixedActionButtons button.save-button'),
			backObject: document.querySelector('#object section.fixedActionButtons button.back-button'),
			editObject2: document.querySelector('#object section.fixedActionButtons button.edit-button'),
			listObject: document.querySelector('#object section.fixedActionButtons button.list-button'),
			addObject: document.querySelector('#object_add section.fixedActionButtons button.add-button'),
			addObjectBack: document.querySelector('#object_add section.fixedActionButtons button.back-button'),
			
			deleteFlow: document.querySelectorAll('#flows .delete-button'),
			editFlow: document.querySelectorAll('#flows .edit-button'),
			createFlow: document.querySelector('#flows button#createFlow'),
			addFlow: document.querySelector('#flow_add section.fixedActionButtons button.add-button'),
			addFlowBack: document.querySelector('#flow_add section.fixedActionButtons button.back-button'),
			
			deleteDashboard: document.querySelectorAll('#dashboards .delete-button'),
			editDashboard: document.querySelectorAll('#dashboards .edit-button'),
			createDashboard: document.querySelector('#dashboards button#createDashboard'),
			
			deleteSnippet: document.querySelectorAll('#snippets .delete-button'),
			editSnippet: document.querySelectorAll('#snippets .edit-button'),
			createSnippet: document.querySelector('#snippets button#createSnippet'),
			
			deleteRule: document.querySelectorAll('#rules .delete-button'),
			editRule: document.querySelectorAll('#rules .edit-button'),
			createRule: document.querySelector('#rules button#createRule'),
			
			deleteMqtt: document.querySelectorAll('#mqtts .delete-button'),
			editMqtt: document.querySelectorAll('#mqtts .edit-button'),
			createMqtt: document.querySelector('#mqtts button#createMqtt'),
		};
	}
	
	app.nl2br = function (str, isXhtml) {
		var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	}; //nl2br

	app.setExpandAction = function() {
		componentHandler.upgradeDom();
		app.refreshButtonsSelectors();
		for (var i in buttons.expandButtons) {
			if ( (buttons.expandButtons[i]).childElementCount > -1 ) {
				(buttons.expandButtons[i]).addEventListener('click', function(evt) {
					var id = (evt.target.parentElement).getAttribute('for')!=null?(evt.target.parentElement).getAttribute('for'):(evt.target).getAttribute('for');
					if ( id != null ) {
						document.getElementById(id).classList.toggle('hidden');
						if ( evt.target.parentElement.querySelector('i.material-icons').innerHTML == 'expand_more' ) {
							evt.target.parentElement.querySelector('i.material-icons').innerHTML = 'expand_less';
						} else {
							evt.target.parentElement.querySelector('i.material-icons').innerHTML = 'expand_more';
						}
					}
				}, false);
			}
		}
	}; //setExpandAction
	
	app.setSection = function(section) {
		if ( app.debug === true ) {
			console.log("setSection: "+section);
		}
		if ( section === 'public-object' ) {
			var urlParams = new URLSearchParams(window.location.search); //.toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] ) {
					app.displayPublicObject(params['id'], false);
					section = 'object';
				}
			}
		} else if ( section === 'object' ) {
			var urlParams = new URLSearchParams(window.location.search); //.toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] ) {
					app.displayObject(params['id'], false);
				}
			}
		} else if ( section === 'edit-object' ) {
			var urlParams = new URLSearchParams(window.location.search); //.toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] ) {
					app.displayObject(params['id'], true);
				}
			}
		} else {
			window.location.hash = '#'+section;
			app.fetchItems(section);
		}
		window.scrollTo(0, 0);

		app.refreshButtonsSelectors();
		var act = document.querySelectorAll('section.is-active');
		for (var i in act) {
			if ( (act[i]).childElementCount > -1 ) {
				act[i].classList.remove('is-active');
				act[i].classList.add('is-inactive');
			}
		}
		for (var i in buttons.menuTabBar) {
			if ( (buttons.menuTabBar[i]).childElementCount > -1 ) {
				buttons.menuTabBar[i].classList.remove('is-active');
				if ( buttons.menuTabBar[i].getAttribute("for") == section || buttons.menuTabBar[i].getAttribute("for") == section+'s' ) {
					buttons.menuTabBar[i].classList.add('is-active');
				}
			}
		}
		document.querySelector('#'+section).classList.remove('is-inactive');
		document.querySelector('#'+section).classList.add('is-active');
		if ( !app.isLogged && ( !document.querySelector('#'+section).querySelector('.page-content form.signin') && section !== 'signup' && section !== 'reset-password' && section !== 'forgot-password') ) {
			app.displayLoginForm( document.querySelector('#'+section).querySelector('.page-content') );
		}
		if ( app.debug === true ) {
			console.log("end of setSection: "+section);
		}
	}; //setSection

	app.setItemsClickAction = function(type) {
		if ( app.debug === true ) {
			console.log('setItemsClickAction');
		}
		var items = document.querySelectorAll("[data-action='view']");
		for (var i in items) {
			if ( type == 'objects' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displayObject(item.dataset.id, false);
					evt.preventDefault();
				}, {passive: false,});
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('swl', function(evt) {
					app.displayEditObject(item.dataset.id);
					evt.style.left = (evt.pageX - 10) + 'px';
					evt.preventDefault();
				}, {passive: false,});
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('swr', function(evt) {
					app.onDeleteObject(item.dataset.id);
					evt.preventDefault();
				}, {passive: false,});
			} else if ( type == 'flows' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displayFlow(item.dataset.id);
					evt.preventDefault();
				}, {passive: false,});
			} else if ( type == 'dashboards' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displayDashboard(item.dataset.id);
					evt.preventDefault();
				}, {passive: false,});
			} else if ( type == 'snippets' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displaySnippet(item.dataset.id);
					evt.preventDefault();
				}, {passive: false,});
			}
		}
	}; //setItemsClickAction
	
	function fetchStatusHandler(response) {
		if ( response.headers.get('X-RateLimit-Limit') && response.headers.get('X-RateLimit-Remaining') ) {
			app.RateLimit.Limit = response.headers.get('X-RateLimit-Limit');
			app.RateLimit.Remaining = response.headers.get('X-RateLimit-Remaining');
			app.RateLimit.Used = app.RateLimit.Limit - app.RateLimit.Remaining;
		}
		if (response.status === 200 || response.status === 201) {
			return response;
		} else if (response.status === 401 || response.status === 403) {
			app.sessionExpired();
			throw new Error(response.statusText);
		} else {
			throw new Error(response.statusText);
		}
	}; //fetchStatusHandler
	
	app.showModal = function() {
		dialog.style.display = 'block';
		dialog.style.position = 'fixed';
		dialog.style.top = '20%';
		dialog.style.zIndex = '9999';
	}; // showModal
	
	app.hideModal = function() {
		dialog.style.display = 'none';
		dialog.style.zIndex = '-9999';
	}; // hideModal

	app.setListActions = function(type) {
		app.refreshButtonsSelectors();
		var dialog = document.getElementById('dialog');
		if ( type == 'objects' ) {
			for (var d=0;d<buttons.deleteObject.length;d++) {
				buttons.deleteObject[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete Object';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.currentTarget.dataset.name+'\"?</p>'; //
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					app.showModal();
					var myId = evt.currentTarget.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+app.bearer);
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/objects/'+myId;
						fetch(url, myInit)
						.then(
							fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							toast('Object has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Object has not been deleted.', {timeout:3000, type: 'error'});
						});
						evt.preventDefault();
					});
				});
			}
			for (var e=0;e<buttons.editObject.length;e++) {
				//console.log(buttons.editObject[e]);
				buttons.editObject[e].addEventListener('click', function(evt) {
					app.displayObject(evt.currentTarget.dataset.id, true);
					evt.preventDefault();
				});
			}
		} else if ( type == 'flows' ) {
			for (var d=0;d<buttons.deleteFlow.length;d++) {
				//console.log(buttons.deleteFlow[d]);
				buttons.deleteFlow[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete Flow';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.currentTarget.dataset.name+'\"? This action will remove all datapoints in the flow and can\'t be recovered.</p>';
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					app.showModal();
					var myId = evt.currentTarget.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+app.bearer);
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/flows/'+myId;
						fetch(url, myInit)
						.then(
							fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							toast('Flow has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Flow has not been deleted.', {timeout:3000, type: 'error'});
						});
						evt.preventDefault();
					});
				});
			}
			for (var e=0;e<buttons.editFlow.length;e++) {
				//console.log(buttons.editFlow[e]);
				buttons.editFlow[e].addEventListener('click', function(evt) {
					app.displayFlow(evt.currentTarget.dataset.id, true);
					evt.preventDefault();
				});
			}
		} else if ( type == 'dashboards' ) {
			for (var d=0;d<buttons.deleteDashboard.length;d++) {
				//console.log(buttons.deleteDashboard[d]);
				buttons.deleteDashboard[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete Dashboard';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.currentTarget.dataset.name+'\"?</p>';
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					app.showModal();
					var myId = evt.currentTarget.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+app.bearer);
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/dashboards/'+myId;
						fetch(url, myInit)
						.then(
							fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							toast('Dashboard has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Dashboard has not been deleted.', {timeout:3000, type: 'error'});
						});
						evt.preventDefault();
					});
				});
			}
			for (var d=0;d<buttons.editDashboard.length;d++) {
				//console.log(buttons.editDashboard[d]);
				buttons.editDashboard[d].addEventListener('click', function(evt) {
					app.displayDashboard(evt.currentTarget.dataset.id, true);
					evt.preventDefault();
				});
			}
		} else if ( type == 'snippets' ) {
			for (var d=0;d<buttons.deleteSnippet.length;d++) {
				//console.log(buttons.deleteSnippet[d]);
				buttons.deleteSnippet[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete Snippet';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.currentTarget.dataset.name+'\"? This action will remove all reference to the Snippet in Dashboards.</p>';
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					app.showModal();
					var myId = evt.currentTarget.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+app.bearer);
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/snippets/'+myId;
						fetch(url, myInit)
						.then(
							fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							toast('Snippet has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Snippet has not been deleted.', {timeout:3000, type: 'error'});
						});
						evt.preventDefault();
					});
				});
			}
			for (var s=0;s<buttons.editSnippet.length;s++) {
				//console.log(buttons.editSnippet[s]);
				buttons.editSnippet[s].addEventListener('click', function(evt) {
					app.displaySnippet(evt.currentTarget.dataset.id, true);
					evt.preventDefault();
				});
			}
		} else if ( type == 'rules' ) {
			// TODO
		} else if ( type == 'mqtts' ) {
			// TODO
		}
	} //setListActions

	app.displayPublicObject = function(id, isEdit) {
		window.scrollTo(0, 0);
		containers.spinner.removeAttribute('hidden');
		containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/objects/'+id+'/public';
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var object = response.data[i];
				var node = "";
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<i class=\"material-icons\">"+app.icons.objects+"</i>";
				node += "				<h2 class=\"mdl-card__title-text\">"+object.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+object.id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell--12-col hidden' id='description-"+object.id+"'>";

				node += app.getField(app.icons.objects, 'Id', object.id, {type: 'input'});
				if ( object.attributes.description || isEdit!=true ) {
					var description = app.nl2br(object.attributes.description);
					node += app.getField(null, null, description, {type: 'textarea'});
				}
				if ( object.attributes.meta.created ) {
					node += app.getField(app.icons.date, 'Created', moment(object.attributes.meta.created).format(app.date_format), {type: 'text'});
				}
				if ( object.attributes.meta.updated ) {
					node += app.getField(app.icons.date, 'Updated', moment(object.attributes.meta.updated).format(app.date_format), {type: 'text'});
				}
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle('Parameters');
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if ( object.attributes.type || isEdit==true ) {
					node += app.getField(app.icons.type, 'Type', object.attributes.type, {type: 'select - listOfIconsssssssssssssssssssssssssssssssssssssssssss'});
				}
				if ( object.attributes.ipv4 || isEdit==true ) {
					node += app.getField('my_location', 'IPv4', object.attributes.ipv4, {type: 'text'});
				}
				if ( object.attributes.ipv6 || isEdit==true ) {
					node += app.getField('my_location', 'IPv6', object.attributes.ipv6, {type: 'text'});
				}
				node += "	</div>";
				node += "</section>";

				if ( object.attributes.parameters && object.attributes.parameters.length > -1 ) { 
					node += app.getSubtitle('Custom Parameters');
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					for ( var i in object.attributes.parameters ) {
						node += app.getField('note', object.attributes.parameters[i].name, object.attributes.parameters[i].value, {type: 'text'});
					}
					node += "	</div>";
					node += "</section>";
				}

				if ( object.attributes.longitude || object.attributes.latitude || object.attributes.position ) {
					node += app.getSubtitle('Localization');
					node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					if ( object.attributes.longitude ) {
						node += app.getField('place', 'Longitude', object.attributes.longitude, {type: 'text'});
					}
					if ( object.attributes.latitude ) {
						node += app.getField('place', 'Latitude', object.attributes.latitude, {type: 'text'});
					}
					if ( object.attributes.position ) {
						node += app.getField('pin_drop', 'Position', object.attributes.position, {type: 'text'});
					}
					if ( object.attributes.longitude && object.attributes.latitude ) {
						node += app.getMap('my_location', 'osm', object.attributes.longitude, object.attributes.latitude, false, false, false);
					}
					node += "	</div>";
					node += "</section>";
				}

				(containers.object).querySelector('.page-content').innerHTML = node;
				componentHandler.upgradeDom();
				
				if ( object.attributes.longitude && object.attributes.latitude ) {
					/* Localization Map */
					var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point(new ol.proj.transform([object.attributes.longitude, object.attributes.latitude], 'EPSG:4326', 'EPSG:3857')),
						name: object.attributes.name,
						position: object.attributes.position,
					});
					var iconStyle = new ol.style.Style({
						image: new ol.style.Icon(({
							anchor: [12, 12],
							anchorXUnits: 'pixels',
							anchorYUnits: 'pixels',
							opacity: .8,
							size: [24, 24],
							src: app.baseUrl+'/js/OpenLayers/img/marker.png'
						}))
					});
					iconFeature.setStyle(iconStyle);
					var vectorSource = new ol.source.Vector({});
					vectorSource.addFeature(iconFeature);
					var vectorLayer = new ol.layer.Vector({
						source: vectorSource
					});
					var popup = new ol.Overlay({
						element: document.getElementById('popup'),
						//positioning: 'top',
						stopEvent: false
					});
					var map = new ol.Map({
						layers: [
							new ol.layer.Tile({ source: new ol.source.OSM() }),
							vectorLayer,
						],
						target: 'osm',
						interactions: [],
						view: new ol.View({
							center: ol.proj.fromLonLat([parseFloat(object.attributes.longitude), parseFloat(object.attributes.latitude)]),
							zoom: 18,
						}),
					});
					setTimeout(function() {map.updateSize();}, 1000);
					/* End Localization Map */
				}

				app.setExpandAction();
				//app.setSection('object');
			}
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('displayObject error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	} //displayPublicObject

	app.displayObject = function(id, isEdit) {
		window.scrollTo(0, 0);
		containers.spinner.removeAttribute('hidden');
		containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/objects/'+id;
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var object = response.data[i];
				var node = "";
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<i class=\"material-icons\">"+app.icons.objects+"</i>";
				node += "				<h2 class=\"mdl-card__title-text\">"+object.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+object.id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell--12-col hidden' id='description-"+object.id+"'>";

				node += app.getField(app.icons.objects, 'Id', object.id, {type: 'text'});
				if ( object.attributes.description && isEdit!=true ) {
					var description = app.nl2br(object.attributes.description);
					node += app.getField(null, null, description, {type: 'textarea'});
				}
				if ( object.attributes.meta.created ) {
					node += app.getField(app.icons.date, 'Created', moment(object.attributes.meta.created).format(app.date_format), {type: 'text'});
				}
				if ( object.attributes.meta.updated ) {
					node += app.getField(app.icons.date, 'Updated', moment(object.attributes.meta.updated).format(app.date_format), {type: 'text'});
				}
				if ( object.attributes.meta.revision ) {
					node += app.getField(app.icons.update, 'Revision', object.attributes.meta.revision, {type: 'text'});
				}
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle('Parameters');
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if ( isEdit==true ) {
					var description = object.attributes.description;
					node += app.getField(app.icons.objects, 'Name', object.attributes.name, {type: 'text', isEdit: isEdit});
					node += app.getField(app.icons.description, 'Description', description, {type: 'textarea', isEdit: isEdit});
				}
				if ( object.attributes.type || isEdit==true ) {
					node += app.getField(app.icons.type, 'Type', object.attributes.type, {type: 'select', isEdit: isEdit, id: 'Type', options: app.types });
				}
				if ( object.attributes.ipv4 || isEdit==true ) {
					node += app.getField('my_location', 'IPv4', object.attributes.ipv4, {type: 'text', isEdit: isEdit});
				}
				if ( object.attributes.ipv6 || isEdit==true ) {
					node += app.getField('my_location', 'IPv6', object.attributes.ipv6, {type: 'text', isEdit: isEdit});
				}
				if ( object.attributes.is_public == "true" && isEdit==false ) {
					node += app.getField('visibility', 'Visibility', object.attributes.is_public, {type: 'switch', isEdit: isEdit});
					node += app.getQrcodeImg(app.icons.date, '', object.id, {type: 'text', isEdit: isEdit});
					app.getQrcode(app.icons.date, '', object.id, {type: 'text', isEdit: isEdit});
				} else {
					node += app.getField('visibility_off', 'Visibility', object.attributes.is_public, {type: 'switch', isEdit: isEdit});
				}
				node += "	</div>";
				node += "</section>";

				if ( object.attributes.parameters && object.attributes.parameters.length > -1 ) { 
					node += app.getSubtitle('Custom Parameters');
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					for ( var i in object.attributes.parameters ) {
						node += app.getField('note', object.attributes.parameters[i].name, object.attributes.parameters[i].value, {type: 'text', isEdit: isEdit});
					}
					node += "	</div>";
					node += "</section>";
				}

				if ( object.attributes.longitude || object.attributes.latitude || object.attributes.position ) {
					node += app.getSubtitle('Localization');
					node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					if ( object.attributes.longitude ) {
						node += app.getField('place', 'Longitude', object.attributes.longitude, {type: 'text', isEdit: isEdit});
					}
					if ( object.attributes.latitude ) {
						node += app.getField('place', 'Latitude', object.attributes.latitude, {type: 'text', isEdit: isEdit});
					}
					if ( object.attributes.position ) {
						node += app.getField('pin_drop', 'Position', object.attributes.position, {type: 'text', isEdit: isEdit});
					}
					if ( object.attributes.longitude && object.attributes.latitude ) {
						node += app.getMap('my_location', 'osm', object.attributes.longitude, object.attributes.latitude, false, false, false);
					}
					node += "	</div>";
					node += "</section>";
				}
				
				if ( isEdit ) {
					node += "<section class='mdl-grid mdl-cell--12-col mdl-card__actions mdl-card--border fixedActionButtons' data-id='"+object.id+"'>";
					node += "	<div class='mdl-cell--6-col pull-left'>";
					node += "		<button class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>View</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--6-col pull-right'>";
					node += "		<button class='save-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>save</i>";
					node += "			<label>Save</label>";
					node += "		</button>";
					node += "	</div>";
					node += "</section>";
				} else {
					node += "<section class='mdl-grid mdl-cell--12-col mdl-card__actions mdl-card--border fixedActionButtons' data-id='"+object.id+"'>";
					node += "	<div class='mdl-cell--4-col pull-left'>";
					node += "		<button class='list-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>List</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--4-col'>";
					node += "		<button class='delete-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>delete</i>";
					node += "			<label>Delete</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--4-col pull-right'>";
					node += "		<button class='edit-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>edit</i>";
					node += "			<label>Edit</label>";
					node += "		</button>";
					node += "	</div>";
					node += "</section>";
				}

				(containers.object).querySelector('.page-content').innerHTML = node;
				componentHandler.upgradeDom();
				
				app.refreshButtonsSelectors();
				if ( isEdit ) {
					buttons.backObject.addEventListener('click', function(evt) { app.displayObject(object.id, false); }, false);
					buttons.saveObject.addEventListener('click', function(evt) { app.onSaveObject(evt); }, false);
				} else {
					buttons.listObject.addEventListener('click', function(evt) { app.setSection('objects'); evt.preventDefault(); }, false);
					//buttons.deleteObject2.addEventListener('click', function(evt) { console.log('SHOW MODAL AND CONFIRM!'); }, false);
					buttons.editObject2.addEventListener('click', function(evt) { app.displayObject(object.id, true); evt.preventDefault(); }, false);
				}
				
				if ( object.attributes.longitude && object.attributes.latitude ) {
					/* Localization Map */
					var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point(new ol.proj.transform([object.attributes.longitude, object.attributes.latitude], 'EPSG:4326', 'EPSG:3857')),
						name: object.attributes.name,
						position: object.attributes.position,
					});
					var iconStyle = new ol.style.Style({
						image: new ol.style.Icon(({
							anchor: [12, 12],
							anchorXUnits: 'pixels',
							anchorYUnits: 'pixels',
							opacity: .8,
							size: [24, 24],
							src: app.baseUrl+'/js/OpenLayers/img/marker.png'
						}))
					});
					iconFeature.setStyle(iconStyle);
					var vectorSource = new ol.source.Vector({});
					vectorSource.addFeature(iconFeature);
					var vectorLayer = new ol.layer.Vector({
						source: vectorSource
					});
					var popup = new ol.Overlay({
						element: document.getElementById('popup'),
						//positioning: 'top',
						stopEvent: false
					});
					var map = new ol.Map({
						layers: [
							new ol.layer.Tile({ source: new ol.source.OSM() }),
							vectorLayer,
						],
						target: 'osm',
						interactions: [],
						view: new ol.View({
							center: ol.proj.fromLonLat([parseFloat(object.attributes.longitude), parseFloat(object.attributes.latitude)]),
							zoom: 18,
						}),
					});
					setTimeout(function() {map.updateSize();}, 1000);
					/* End Localization Map */
				}

				app.setExpandAction();
				app.setSection('object');
			}
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('displayObject error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	}; //displayObject
	
	app.getSubtitle = function(subtitle) {
		var node = "<section class='mdl-grid mdl-cell--12-col md-primary md-subheader _md md-altTheme-theme sticky' role='heading'>";
		node += "	<div class='md-subheader-inner'>";
		node += "		<div class='mdl-subheader-content'>";
		node += "			<span class='ng-scope'>"+subtitle+"</span>";
		node += "		</div>";
		node += "	</div>";
		node += "</section>";
		return node;
	}; // getSubtitle

	app.displayAddObject = function(object) {
		var node = "";
		object.id = object.id!==""?object.id:app.getUniqueId();
		node += app.getSubtitle('Description');
		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.objects, 'Name', object.attributes.name, {type: 'text', isEdit: true});
		node += app.getField(app.icons.description, 'Description', app.nl2br(object.attributes.description), {type: 'textarea', isEdit: true});
		node += app.getField(app.icons.type, 'Type', object.attributes.type, {type: 'select', id: 'Type', options: app.types, isEdit: true });
		node += app.getField('my_location', 'IPv4', object.attributes.ipv4, {type: 'text', isEdit: true});
		node += app.getField('my_location', 'IPv6', object.attributes.ipv6, {type: 'text', isEdit: true});
		node += app.getField('visibility', 'Visibility', object.attributes.is_public, {type: 'switch', isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle('Custom Parameters');
		node += "<section class=\"mdl-grid mdl-cell--12-col\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField('note', '', '', {type: '2inputs', isEdit: true});
		node += "	</div>";
		node += "</section>";

		node += app.getSubtitle('Localization');
		node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField('place', 'Longitude', object.attributes.longitude, {type: 'text', isEdit: true});
		node += app.getField('place', 'Latitude', object.attributes.latitude, {type: 'text', isEdit: true});
		node += app.getField('pin_drop', 'Position', object.attributes.position, {type: 'text', isEdit: true});
		node += app.getMap('my_location', 'osm', object.attributes.longitude, object.attributes.latitude, false, false, false);
		node += "	</div>";
		node += "</section>";
		
		node += "<section class='mdl-grid mdl-cell--12-col mdl-card__actions mdl-card--border fixedActionButtons' data-id='"+object.id+"'>";
		node += "	<div class='mdl-cell--6-col pull-left'>";
		node += "		<button class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--6-col pull-right'>";
		node += "		<button class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "		</button>";
		node += "	</div>";
		node += "</section>";

		(containers.object_add).querySelector('.page-content').innerHTML = node;
		componentHandler.upgradeDom();

		app.getLocation();
		/* Localization Map */
		var iconFeature = new ol.Feature({
			geometry: new ol.geom.Point(new ol.proj.transform([parseFloat(app.defaultResources.object.attributes.longitude), parseFloat(app.defaultResources.object.attributes.latitude)], 'EPSG:4326', 'EPSG:3857')),
			name: '',
			position: '',
		});
		var iconStyle = new ol.style.Style({
			image: new ol.style.Icon(({
				anchor: [12, 12],
				anchorXUnits: 'pixels',
				anchorYUnits: 'pixels',
				opacity: .8,
				size: [24, 24],
				src: app.baseUrl+'/js/OpenLayers/img/marker.png'
			}))
		});
		iconFeature.setStyle(iconStyle);
		var vectorSource = new ol.source.Vector({});
		vectorSource.addFeature(iconFeature);
		var vectorLayer = new ol.layer.Vector({
			source: vectorSource
		});
		var popup = new ol.Overlay({
			element: document.getElementById('popup'),
			//positioning: 'top',
			stopEvent: false
		});
		var map = new ol.Map({
			layers: [
				new ol.layer.Tile({ source: new ol.source.OSM() }),
				vectorLayer,
			],
			target: 'osm',
			interactions: ol.interaction.defaults().extend([ new ol.interaction.DragRotateAndZoom() ]),
			view: new ol.View({
				center: ol.proj.fromLonLat([parseFloat(object.attributes.longitude), parseFloat(object.attributes.latitude)]),
				zoom: 18,
			}),
		});
		setTimeout(function() {map.updateSize();}, 1000);
		/* End Localization Map */
		
		app.refreshButtonsSelectors();
		buttons.addObjectBack.addEventListener('click', function(evt) { app.setSection('objects'); evt.preventDefault(); }, false);
		buttons.addObject.addEventListener('click', function(evt) { app.onAddObject(evt); }, false);

		app.setExpandAction();
		app.setSection('object_add');
	}; //displayAddObject
	
	app.displayAddFlow = function(flow) {
		var node = "";
		node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+flow.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.flows, 'Name', flow.attributes.name, {type: 'text', isEdit: true});
		node += app.getField(app.icons.mqtts, 'MQTT Topic', flow.attributes.mqtt_topic, {type: 'text', isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		node += "<section class='mdl-grid mdl-cell--12-col mdl-card__actions mdl-card--border fixedActionButtons' data-id='"+flow.id+"'>";
		node += "	<div class='mdl-cell--6-col pull-left'>";
		node += "		<button class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--6-col pull-right'>";
		node += "		<button class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "		</button>";
		node += "	</div>";
		node += "</section>";

		(containers.flow_add).querySelector('.page-content').innerHTML = node;
		componentHandler.upgradeDom();
		
		app.refreshButtonsSelectors();
		buttons.addFlowBack.addEventListener('click', function(evt) { app.setSection('flows'); evt.preventDefault(); }, false);
		buttons.addFlow.addEventListener('click', function(evt) { app.onAddFlow(evt); }, false);

		app.setExpandAction();
		app.setSection('flow_add');
	}; //displayAddFlow
	
	app.displayAddDashboard = function(dashboard) {
		var node = "";
		node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+dashboard.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.dashboards, 'Name', dashboard.attributes.name, {type: 'text', isEdit: true});
		node += app.getField(app.icons.description, 'Description', app.nl2br(dashboard.attributes.description), {type: 'textarea', isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		node += "<section class='mdl-grid mdl-cell--12-col mdl-card__actions mdl-card--border fixedActionButtons' data-id='"+flow.id+"'>";
		node += "	<div class='mdl-cell--6-col pull-left'>";
		node += "		<button class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--6-col pull-right'>";
		node += "		<button class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "		</button>";
		node += "	</div>";
		node += "</section>";
		
		node += "<div class='md-primary md-subheader _md md-altTheme-theme'>";
		node += "	<div class='md-subheader-inner'>";
		node += "		<div class='mdl-subheader-content'>";
		node += "			<span class='ng-scope'>Available Snippets</span>";
		node += "		</div>";
		node += "	</div>";
		node += "	<ul class='mdl-grid'>";
		
		// dropdown from the Api getSnippets
		
		node += "	</ul>";
		
		node += "</div>";
		
		node += "<div class='md-primary md-subheader _md md-altTheme-theme'>";
		node += "	<div class='md-subheader-inner'>";
		node += "		<div class='mdl-subheader-content'>";
		node += "			<span class='ng-scope'>Grid Parameters</span>";
		node += "		</div>";
		node += "	</div>";
		node += "</div>";
		node += "<section id='dashboard_grids' class='mdl-layout__content mdl-cell mdl-cell--12-col mdl-tabs mdl-js-tabs'>";
		node += "	<div class='mdl-tabs__tab-bar mdl-cell mdl-cell--12-col'>";
		node += "		<a href='#panel-1c' class='mdl-cell mdl-cell--6-col mdl-tabs__tab is-active'>1 column</a>";
		node += "		<a href='#panel-2cl' class='mdl-cell mdl-cell--6-col mdl-tabs__tab'>2 cols Left</a>";
		node += "	</div>"
		node += "	<div class='mdl-tabs__tab-bar mdl-cell mdl-cell--12-col'>";
		node += "		<a href='#panel-2cc' class='mdl-cell mdl-cell--6-col mdl-tabs__tab'>2 cols Centered</a>";
		node += "		<a href='#panel-2cr' class='mdl-cell mdl-cell--6-col mdl-tabs__tab'>2 cols Right</a>";
		node += "	</div>";
		
		node += "	<div class='mdl-grid mdl-tabs__panel is-active' id='panel-1c'>";
		node += "		<span class='mdl-card mdl-grid mdl-cell mdl-cell--12-col mdl-shadow--2dp'>";
		node += "			A";
		node += "		</span>";
		node += "	</div>";
		
		node += "	<div class='mdl-grid mdl-tabs__panel' id='panel-2cl'>";
		node += "		<span class='mdl-card mdl-grid mdl-cell mdl-cell--4-col mdl-shadow--2dp'>";
		node += "			A";
		node += "		</span>";
		node += "		<span class='mdl-card mdl-grid mdl-cell mdl-cell--8-col mdl-shadow--2dp'>";
		node += "			B";
		node += "		</span>";
		node += "	</div>";
		
		node += "	<div class='mdl-grid mdl-tabs__panel' id='panel-2cc'>";
		node += "		<span class='mdl-card mdl-grid mdl-cell mdl-cell--6-col mdl-shadow--2dp'>";
		node += "			A";
		node += "		</span>";
		node += "		<span class='mdl-card mdl-grid mdl-cell mdl-cell--6-col mdl-shadow--2dp'>";
		node += "			B";
		node += "		</span>";
		node += "	</div>";

		node += "	<div class='mdl-grid mdl-tabs__panel' id='panel-2cr'>";
		node += "		<span class='mdl-card mdl-grid mdl-cell mdl-cell--8-col mdl-shadow--2dp'>";
		node += "			A";
		node += "		</span>";
		node += "		<span class='mdl-card mdl-grid mdl-cell mdl-cell--4-col mdl-shadow--2dp'>";
		node += "			B";
		node += "		</span>";
		node += "	</div>";
		
		node += "	<div>&nbsp;</div>";
		
		node += "</section>";

		(containers.dashboard_add).querySelector('.page-content').innerHTML = node;
		componentHandler.upgradeDom();
		app.refreshButtonsSelectors();

		app.setExpandAction();
		app.setSection('dashboard_add');
	}; //displayAddDashboard

	app.displayAddRule = function(rule) {
	}; //displayAddRule

	app.displayAddSnippet = function(snippet) {
		var node = "";
		node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+snippet.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.snippets, 'Name', snippet.attributes.name, {type: 'text', isEdit: true});
		node += app.getField(app.icons.icon, 'Icon', snippet.attributes.icon, {type: 'select', isEdit: true, id: 'icon', options: app.types });
		node += app.getField(app.icons.color, 'Color', snippet.attributes.color, {type: 'text', isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle('Snippets');
		
		node += app.getField('add_circle_outline', 'Snippet', snippet.attributes.icon, {type: 'select', id: 'icon', options: [ {name: 'displayvalue', value:'Value Display'}, {name: 'displaygraph', value:'Graph Display'}, {name: 'simplerow', value:'Simple Row'} ], isEdit: true });
		
		node += "<div class='mdl-grid mdl-cell--12-col mdl-card__actions mdl-card--border fixedActionButtons' data-id='"+flow.id+"'>";
		node += "	<div class='mdl-cell--6-col pull-left'>";
		node += "		<button class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>add</i>";
		node += "			<label>Add</label>";
		node += "		</button>";
		node += "	</div>";
		node += "</div>";

		(containers.snippet_add).querySelector('.page-content').innerHTML = node;
		componentHandler.upgradeDom();
		app.refreshButtonsSelectors();

		app.setExpandAction();
		app.setSection('snippet_add');
	}; //displayAddSnippet
	
	app.getCard = function(card) {
		var output = "";
		card.titlecolor!==null?card.titlecolor: '#ffffff';
		output += "<div class=\"mdl-grid mdl-cell\">";
		output += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		if( card.image ) {
			output += "	<div class=\"mdl-card__title\" style=\"background:url("+card.image+") no-repeat 50% 50%;\">";
		} else {
			output += "	<div class=\"mdl-card__title\">";
		}
		output += "			<h2 class=\"mdl-card__title-text\" style=\"color:"+card.titlecolor+";\">" + card.title + "</h2>";
		output += "		</div>";
		output += "  	<div class=\"mdl-card__supporting-text mdl-card--expand\">" + card.description + "</div>";
		if ( card.url || card.secondaryaction || card.action ) {
			output += "  	<div class=\"mdl-card__actions mdl-card--border\">";
			if ( card.url ) {
				output += "		<a href=\""+ card.url +"\"> Get Started</a>";
			}
			if ( card.secondaryaction ) {
				output += "		<a href=\"#\" onclick=\"app.setSection('"+ card.secondaryaction.id +"');\" class=\"mdl-button mdl-button--colored\"> "+ card.secondaryaction.label +"</a>&nbsp;";
			}
			if ( card.action && !card.internalAction ) {
				output += "		<button class=\"mdl-button mdl-js-button mdl-js-ripple-effect\" onclick=\"app.setSection('"+ card.action.id +"');\"> "+ card.action.label +"</button>";
			}
			if ( card.internalAction ) {
				output += "		<button class=\"mdl-button mdl-js-button mdl-js-ripple-effect\" onclick=\""+ card.internalAction +"\"> "+ card.action.label +"</button>";
			}
			output += "		</div>";
		}
		output += "		</div>";
		output += "</div>";
		return output;
	} //getCard

	app.displayFlow = function(id) {
		window.scrollTo(0, 0);
		containers.spinner.removeAttribute('hidden');
		containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/flows/'+id;
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var flow = response.data[i];
				((containers.flow).querySelector('.page-content')).innerHTML = '';
				var datapoints = "";
				
				var node = "";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<i class=\"material-icons\">"+app.icons.flows+"</i>";
				node += "				<h2 class=\"mdl-card__title-text\">"+flow.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
				node += app.getField(app.icons.flows, 'Id', flow.id, {type: 'text', isEdit: false});
				if ( flow.attributes.description ) {
					node += app.getField(null, null, app.nl2br(flow.attributes.description), {type: 'textarea', isEdit: false});
				}
				if ( flow.attributes.meta.created ) {
					node += app.getField(app.icons.date, 'Created', moment(flow.attributes.meta.created).format(app.date_format), {type: 'text', isEdit: false});
				}
				if ( flow.attributes.meta.updated ) {
					node += app.getField(app.icons.date, 'Updated', moment(flow.attributes.meta.updated).format(app.date_format), {type: 'text', isEdit: false});
				}
				if ( flow.attributes.meta.revision ) {
					node += app.getField(app.icons.update, 'Revision', flow.attributes.meta.revision, {type: 'text', isEdit: false});
				}
				if ( flow.attributes.type ) {
					node += app.getField('extension', 'Type', flow.attributes.type, {type: 'text', isEdit: false});
				}
				if ( flow.attributes.mqtt_topic ) {
					node += app.getField(app.icons.mqtts, 'Mqtt', flow.attributes.mqtt_topic, {type: 'text', isEdit: false});
				}
				if ( flow.attributes.ttl ) {
					node += app.getField('schedule', 'Time To Live (TTL)', flow.attributes.ttl, {type: 'text', isEdit: false});
				}
				if ( flow.attributes.unit ) {
					node += app.getField('', 'unit', flow.attributes.unit, {type: 'text', isEdit: false});
				}
				if ( flow.attributes.permission ) {
					node += app.getField('visibility', 'Permission', flow.attributes.permission, {type: 'text', isEdit: false});
				}
				node += "	</div>";
				node += "</div>";
				
				node += "<div class='mdl-grid mdl-cell--12-col' id='"+flow.id+"'>";
				node += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
				node += "		<span class='mdl-list__item mdl-list__item--two-line'>";
				node += "			<span class='mdl-list__item-primary-content'>";
				node +=	"				<span>"+flow.attributes.name+" ("+flow.attributes.unit+")</span>";
				node +=	"				<span class='mdl-list__item-sub-title' id='flow-graph-time-"+flow.id+"'></span>";
				node +=	"			</span>";
				node +=	"		</span>";
				node += "		<span class='mdl-list__item' id='flow-graph-"+flow.id+"' style='width:100%; height:200px;'>";
				node += "			<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text'></span>";
				node += "		</span>";
				var options = {
					series: { lines : { show: true, fill: 'false', lineWidth: 3, steps: false } },
					colors: [flow.attributes.color!==''?flow.attributes.color:'#000000'],
					points : { show : true },
					legend: { show: true, position: "sw" },
					grid: {
						borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
						borderColor: { top: "", right: "", bottom: "", left: "" },
						// markings: weekendAreas,
						clickable: true,
						hoverable: true,
						autoHighlight: true,
						mouseActiveRadius: 5
					},
					xaxis: { mode: "time", autoscale: true, timeformat: "%d/%m/%Y<br/>%Hh%M" },
					yaxis: [ { autoscale: true, position: "left" }, { autoscale: true, position: "right" } ],
				};

				var my_flow_data_url = app.baseUrl+'/'+app.api_version+'/data/'+flow.id+'?limit=100&sort=desc';
				fetch(my_flow_data_url, myInit)
				.then(
					fetchStatusHandler
				).then(function(fetchResponse){ 
					return fetchResponse.json();
				})
				.then(function(data) {
					datapoints += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
					datapoints += "		<div class='mdl-list__item small-padding'>";
					datapoints += "			<span class='mdl-list__item-primary-content'>";
					datapoints += "				<i class='material-icons'>"+app.icons.datapoints+"</i>";
					datapoints += "				Data Points";
					datapoints += "			</span>";
					datapoints += "			<span class='mdl-list__item-secondary-action'>";
					datapoints += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='datapoints-"+flow.id+"'>";
					datapoints += "					<i class='material-icons'>expand_more</i>";
					datapoints += "				</button>";
					datapoints += "			</span>";
					datapoints += "		</div>";
					datapoints += "		<div class='mdl-cell mdl-cell--12-col hidden' id='datapoints-"+flow.id+"'>";
					var dataset = [data.data.map(function(i) {
						datapoints += app.getField(app.icons.datapoints, moment(i.attributes.timestamp).format(app.date_format), i.attributes.value+flow.attributes.unit, {type: 'text', isEdit: false});
						return [i.attributes.timestamp, i.attributes.value];
				    })];
					componentHandler.upgradeDom();
					$.plot($('#flow-graph-'+flow.id), dataset, options);
					datapoints += "		</div>";
					datapoints += "	</div>";
					
					var dtps = document.createElement('div');
					dtps.className = "mdl-grid mdl-cell--12-col";
					dtps.dataset.id = "last-datapoints_"+flow.id;
					dtps.innerHTML = datapoints;
					((containers.flow).querySelector('.page-content')).appendChild(dtps);
					app.setExpandAction();
					
				})
				.catch(function (error) {
					if (error == 'Error: Not Found') {
						toast('No data found, graph remain empty.', {timeout:3000, type: 'warning'});
					} else {
						if ( app.debug === true ) {
							toast('displayFlow error out...' + error, {timeout:3000, type: 'error'});
						}
					}
				});
				node +=	"	</div>";
				node +=	"</div>";
				
				var c = document.createElement('section');
				c.className = "mdl-grid mdl-cell--12-col";
				c.dataset.id = flow.id;
				c.innerHTML = node;
				((containers.flow).querySelector('.page-content')).appendChild(c);
				componentHandler.upgradeDom();
				app.setSection('flow');
			}
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('displayFlow error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	}; //displayFlow

	app.displayDashboard = function(id) {
		window.scrollTo(0, 0);
		containers.spinner.removeAttribute('hidden');
		containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/dashboards/'+id;
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var dashboard = response.data[i];
				var node;
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<h2 class=\"mdl-card__title-text\">"+dashboard.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
				if ( dashboard.attributes.description ) {
					node += app.getField(null, null, app.nl2br(dashboard.attributes.description), {type: 'textarea', isEdit: false});
				}
				if ( dashboard.attributes.meta.created ) {
					node += app.getField(app.icons.date, 'Created', moment(dashboard.attributes.meta.created).format(app.date_format), {type: 'text', isEdit: false});
				}
				if ( dashboard.attributes.meta.updated ) {
					node += app.getField(app.icons.date, 'Updated', moment(dashboard.attributes.meta.updated).format(app.date_format), {type: 'text', isEdit: false});
				}
				if ( dashboard.attributes.meta.revision ) {
					node += app.getField(app.icons.update, 'Revision', dashboard.attributes.meta.revision, {type: 'text', isEdit: false});
				}
				node += "		</div>";
				node += "	</div>";
				node += "</section>";
				(containers.dashboard).querySelector('.page-content').innerHTML = node;
				app.setExpandAction();
				componentHandler.upgradeDom();

				for ( var i=0; i < dashboard.attributes.snippets.length; i++ ) {
					app.getSnippet(app.icons.snippets, dashboard.attributes.snippets[i], (containers.dashboard).querySelector('.page-content'));
				}

				app.setSection('dashboard');
			}
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('displayDashboard error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	}; //displayDashboard

	app.displaySnippet = function(id) {
		window.scrollTo(0, 0);
		containers.spinner.removeAttribute('hidden');
		containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/snippets/'+id;
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var snippet = response.data[i];
				var node = "";
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<h2 class=\"mdl-card__title-text\">";
				node += "					<i class=\"material-icons\">"+app.icons.snippets+"</i>";
				node += "					"+snippet.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
				if ( snippet.attributes.description ) {
					node += app.getField(null, null, app.nl2br(snippet.attributes.description), {type: 'textarea', isEdit: false});
				}
				if ( snippet.attributes.meta.created ) {
					node += app.getField(app.icons.date, 'Created', moment(snippet.attributes.meta.created).format(app.date_format), {type: 'text', isEdit: false});
				}
				if ( snippet.attributes.meta.updated ) {
					node += app.getField(app.icons.date, 'Updated', moment(snippet.attributes.meta.updated).format(app.date_format), {type: 'text', isEdit: false});
				}
				if ( snippet.attributes.meta.revision ) {
					node += app.getField(app.icons.update, 'Revision', snippet.attributes.meta.revision, {type: 'text', isEdit: false});
				}
				node += app.getField(app.icons.name, 'Name', snippet.attributes.name, {type: 'text', isEdit: false});
				node += app.getField(app.icons.type, 'Type', snippet.attributes.type, {type: 'text', isEdit: false});
				node += app.getField(app.icons.icon, 'Icon', snippet.attributes.icon, {type: 'text', isEdit: false});
				node += app.getField(app.icons.flows, 'Linked Flows #', snippet.attributes.flows.length, {type: 'text', isEdit: false});
				node += app.getField(app.icons.color, 'Color', snippet.attributes.color, {type: 'text', isEdit: false});
				node += "		</div>";
				node += "	</div>";
				node +=	"</section>";
				
				app.getSnippet(app.icons.snippets, snippet.id, (containers.snippet).querySelector('.page-content'));

				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<h2 class=\"mdl-card__title-text\">";
				node += "					<i class=\"material-icons\">"+app.icons.flows+"</i>";
				node += "					Flows";
				node += "				</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='snippetflows-"+id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-list mdl-cell mdl-cell--12-col hidden' id='snippetflows-"+id+"'>";
				for ( i=0; i<snippet.attributes.flows.length; i++ ) {
					//node += "		<a href=\"#\" onclick=\";\" class=\"mdl-list__item mdl-cell--12-col\">";
					node += app.getField(null, snippet.attributes.flows[i], null, false, {type: 'text', action: function() {app.displayFlow(snippet.attributes.flows[i])}, isEdit: false });
					//node += "		</a>";
				}
				node += "		</div>";
				node += "	</div>";
				node +=	"</section>";
				

				(containers.snippet).querySelector('.page-content').innerHTML = node;
				app.setExpandAction();
				componentHandler.upgradeDom();
				app.setSection('snippet');
			}
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('displaySnippet error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	}; //displaySnippet

	app.displayListItem = function(type, width, iconName, item) {
		var name = item.attributes.name!==undefined?item.attributes.name:"";
		var description = item.attributes.description!==undefined?item.attributes.description.substring(0, app.cardMaxChars):'';
		var attributeType = item.attributes.type!==undefined?item.attributes.type:'';
		var element = "";
		element += "<div class=\"mdl-grid mdl-cell\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+item.id+"\">";
		element += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		element += "		<div class=\"mdl-card__title mdl-js-button mdl-js-ripple-effect\">";
		element += "			<i class=\"material-icons\">"+iconName+"</i>";
		element += "			<h2 class=\"mdl-card__title-text\">"+name+"</h2>";
		element += "		</div>";
		element += app.getField(null, null, description, {type: 'textarea', isEdit: false});
		element += "		<div class=\"mdl-card__actions mdl-card--border\">";
		element += "			<span class=\"pull-left mdl-card__date\">Created on "+moment(item.attributes.meta.created).format(app.date_format)+"</span>";
		element += "			<button id=\"menu_"+item.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "				<i class=\"material-icons\">"+app.icons.menu+"</i>";
		element += "			</button>";
		element += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+item.id+"\">";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+item.id+"\" data-name=\""+name+"\">"+app.icons.delete+"</i>Delete</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+item.id+"\" data-name=\""+name+"\">"+app.icons.edit+"</i>Edit</a>";
		element += "				</li>";
		element += "			</ul>";
		element += "		</div>";
		element += "	</div>";
		element += "</div>";
		
		return element;
	} //displayListItem

	app.fetchItems = function(type, filter) {
		let promise = new Promise((resolve, reject) => {
			if( type !== 'objects' && type !== 'flows' && type !== 'dashboards' && type !== 'snippets' && type !== 'rules' && type !== 'mqtts' ) {
				resolve();
				return false;
			}
			
			containers.spinner.removeAttribute('hidden');
			containers.spinner.classList.remove('hidden');
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+app.bearer);
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var defaultCard = {};
	
			if (type == 'objects') {
				var icon = app.icons.objects;
				var container = (containers.objects).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/objects';
				if ( filter !== undefined ) {
					url += "?name="+escape(filter);
				}
				var title = 'My Objects';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any Object yet.', internalAction: app.displayAddObject(app.defaultResources.object), action: {id: 'object_add', label: '<i class=\'material-icons\'>add</i>Add my first Object'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Connected Objects', titlecolor: '#ffffff', description: 'Embedded, Automatization, Domotic, Sensors, any Objects can be connected and communicate to t6 via API.'}; //, action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}
				
			} else if (type == 'flows') {
				var icon = app.icons.flows;
				var container = (containers.flows).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/flows';
				if ( filter !== undefined ) {
					url += "?name="+escape(filter);
				}
				var title = 'My Flows';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img2.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any Flow yet.', internalAction: app.displayAddFlow(app.defaultResources.flow), action: {id: 'flow_add', label: '<i class=\'material-icons\'>add</i>Add my first Flow'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Data Flows as Time-series', titlecolor: '#ffffff', description: 'Communication becomes easy in the platform with Timestamped values. Flows allows to retrieve and classify data.'}; //, action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}

			} else if (type == 'dashboards') {
				var icon = app.icons.dashboards;
				var container = (containers.dashboards).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/dashboards';
				var title = 'My Dashboards';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any dashboard yet.', internalAction: app.displayAddDashboard(app.defaultResources.dashboard), action: {id: 'dashboard_add', label: '<i class=\'material-icons\'>add</i>Add my first Dashboard'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Dashboards', titlecolor: '#ffffff', description: 'Graphics, data-management, Monitoring, Reporting'}; //, action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}
				
			} else if (type == 'snippets') {
				var icon = app.icons.snippets;
				var container = (containers.snippets).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/snippets';
				var title = 'My Snippets';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any snippet yet.', internalAction: app.displayAddSnippet(app.defaultResources.snippet), action: {id: 'snippet_add', label: '<i class=\'material-icons\'>add</i>Add my first Snippet'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Customize Snippets', titlecolor: '#ffffff', description: 'Snippets are components to embed into your dashboards and displays your data'}; //, action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}
				
			} else if (type == 'rules') {
				var icon = app.icons.snippets;
				var container = (containers.rules).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/rules';
				var title = 'My Rules';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img2.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any rule yet.', internalAction: app.displayAddRule(app.defaultResources.rule), action: {id: 'rule_add', label: '<i class=\'material-icons\'>add</i>Add my first Rule'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Decision Rules to get smart', titlecolor: '#ffffff', description: 'Trigger action from Mqtt and decision-tree. Let\'s your Objects talk to the platform as events.'}; //, action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}
				
			} else if (type == 'mqtts') {
				var icon = app.icons.mqtts;
				var container = (containers.mqtts).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/mqtts';
				var title = 'My Mqtts';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any mqtt topic yet.', action: {id: 'mqtt_add', label: '<i class=\'material-icons\'>add</i>Add my first Mqtt'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.'}; //, action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}
				
			} else if (type == 'tokens') {
				var icon = app.icons.tokens;
				var container = (containers.tokens).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/tokens';
				var title = 'My tokens';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any token yet.', action: {id: 'token_add', label: '<i class=\'material-icons\'>add</i>Add my first Token'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.'}; //, action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}
				
			} else if (type == 'status') {
				var icon = app.icons.status;
				var container = (containers.status).querySelector('.page-content');
				defaultCard = {};
				app.getStatus();
				
			} else {
				if ( app.debug === true ) {
					console.log('Error no Type defined: '+type);
					toast('Error no Type defined.', {timeout:3000, type: 'error'});
				}
				type=undefined;
			}

			if ( app.isLogged && type !== undefined ) {
				fetch(url, myInit)
				.then(
					fetchStatusHandler
				).then(function(fetchResponse){
					return fetchResponse.json();
				})
				.then(function(response) {
					container.innerHTML = "";
					if ( (response.data).length == 0 ) {
						container.innerHTML = app.getCard(defaultCard);
						app.displayLoginForm( container );
					} else {
						for (var i=0; i < (response.data).length ; i++ ) {
							container.innerHTML += app.displayListItem(type, 12, icon, response.data[i]);
						}
						app.showAddFAB(type);
						componentHandler.upgradeDom();
						app.setItemsClickAction(type);
						app.setListActions(type);
					}
					resolve();
				})
				.catch(function (error) {
					if ( app.debug === true ) {
						toast('fetchItems '+type+' error occured...'+ error, {timeout:3000, type: 'error'});
					}
				});
			} else {
				container.innerHTML = app.getCard(defaultCard);
				resolve();
			}
		});
			
		containers.spinner.setAttribute('hidden', true);
		return promise;
	}; //fetchItems

	app.fetchProfile = function() {
		containers.spinner.removeAttribute('hidden');
		containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (containers.profile).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/users/me/token';
		var title = 'My Profile';

		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			var user = response.data;
			var gravatar = user.attributes.gravatar.entry[0];
			var node = "";
			node += "<section class=\"mdl-grid mdl-cell--12-col\">";
			node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp card card-user\">";
			if (gravatar.profile_background) {
				node += "	<div class=\"card-heading heading-left\" style=\"background: url('"+gravatar.profile_background.url+"') 50% 50% !important\">";
			} else {
				node += "	<div class=\"card-heading heading-left\" style=\"background: url('"+app.baseUrlCdn+"/img/opl_img.jpg') 50% 50% !important\">";
			}
			node += "		<img src=\"https://gravatar.com/avatar/"+hex_md5(user.attributes.email)+"\" alt=\"\" class=\"user-image\">";
			node += "		<h3 class=\"card-title text-color-white\">"+user.attributes.first_name+" "+user.attributes.last_name+"</h3>";
			if (gravatar.current_location) {
				node += "		<div class=\"subhead\">";
				node += 			gravatar.current_location;
				node += "		</div>";
			}
			node += "	</div>";
			node += "	<div class=\"card-body\">";
			for (var phone in gravatar.phone_numbers) {
				node += app.getField('phone', gravatar.phone_numbers[phone].type, gravatar.phone_numbers[phone].value, {type: 'text', isEdit: false});
			}
			node += "		<ul class=\"social-links\">";
			for (var account in gravatar.accounts) {
				node += "		<li><a href=\""+gravatar.accounts[account].url+"\"><i class=\"material-icons mdl-textfield__icon\">link</i><span class=\"mdl-list__item-sub-title\">" + gravatar.accounts[account].shortname + "</span></a></li>";
			}
			node += "		</ul>";
			node += "		<ul class='social-links'>"; 
			for (var url in gravatar.urls) {
				node += "  		<li><a href=\""+gravatar.urls[url].value+"\" target=\"_blank\"><i class=\"material-icons\">bookmark</i><span class=\"mdl-list__item-sub-title\">" + gravatar.urls[url].title + "</span></a></li>";
			}
			node += "  		</ul>";
			node += "	</div>";
			node += "	<div class=\"mdl-card__actions mdl-card--border\">";
			node += "		<a href=\"#\" class=\"pull-left\"></a>";
			node += "		<a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" href=\""+gravatar.profile_url+"\" target=\"_blank\">Edit</a>";
			node += "	</div>";
			node += "</div>";
			container.innerHTML = node;
			
			// Profile Storage
			localStorage.setItem("currentUserName", user.attributes.first_name+" "+user.attributes.last_name);
			localStorage.setItem("currentUserEmail", user.attributes.email);
			localStorage.setItem("currentUserHeader", gravatar.photos[0].value);
			app.setDrawer();
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('fetchProfile error out...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	}; //fetchProfile
	
	app.setSetting = function(name, value) {
		localStorage.setItem(name, value);
	}
	
	app.getSetting = function(name) {
		return localStorage.getItem(name);
	}
	
	app.setDrawer = function() {
		if ( localStorage.getItem("currentUserName") !== null ) { document.getElementById("currentUserName").innerHTML = localStorage.getItem("currentUserName") }
		else { document.getElementById("currentUserName").innerHTML = "t6 IoT App"; }
		if ( localStorage.getItem("currentUserEmail") !== null ) { document.getElementById("currentUserEmail").innerHTML = localStorage.getItem("currentUserEmail") }
		else { document.getElementById("currentUserEmail").innerHTML = ""; }
		if ( localStorage.getItem("currentUserHeader") !== null ) { document.getElementById("currentUserHeader").setAttribute('src', localStorage.getItem("currentUserHeader")) }
		else { document.getElementById("currentUserHeader").setAttribute('src', app.baseUrlCdn+"/img/m/icons/icon-128x128.png"); }
	}
	
	app.resetDrawer = function() {
		localStorage.removeItem("currentUserName");
		localStorage.removeItem("currentUserEmail");
		localStorage.removeItem("currentUserHeader");
		app.setDrawer();
	}

	app.displayLoginForm = function(container) {
		if ( app.isLogged === false ) {
			var pattern = {
				username: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
				password: ".{4,}",
			};
			var login = "<section class='content-grid mdl-grid'>" +
			"	<div class='mdl-layout-spacer'></div>" +
			"	<form class='signin'>" +
			"		<div class='mdl-card mdl-shadow--2dp'>" +
			"			<div class='mdl-card__supporting-text'>" +
			"				Connect your Objects to collect their data and show your own Dashboards." +
			"			</div>" +
			"			<div class='mdl-card__supporting-text'>" +
			"				<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>" +
			"					<i class='material-icons mdl-textfield__icon'>lock</i>" +
			"					<input name='username' pattern=\""+pattern.username+"\" class='mdl-textfield__input' type='text'>" +
			"					<label for='username' class='mdl-textfield__label'>Username</label>" +
			"					<span class='mdl-textfield__error'>Username should be your email address</span>" +
			"				</div>" +
			"				<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>" +
			"					<i class='material-icons mdl-textfield__icon'>vpn_key</i>" +
			"					<input name='password' pattern=\""+pattern.password+"\" class='mdl-textfield__input' type='password'>" +
			"					<label for='password' class='mdl-textfield__label'>Password</label>" +
			"					<span class='mdl-textfield__error'>Password must be provided</span>" +
			"				</div>" +
			"			</div>" +
			"			<div class='mdl-card__actions mdl-card--border'>" +
			"				<a onclick=\"app.setSection('signup');\" href='#' class='mdl-button mdl-button--colored'>Create an account</a>" +
			"				<button class='login_button mdl-button mdl-js-button mdl-js-ripple-effect'>" +
			"					<i class='material-icons'>lock</i>Log in" +
			"				</button>" +
			"			</div>" +
			"		</div>" +
			"	</form>" +
			"	<div class='mdl-layout-spacer'></div>" +
			"</section>";
			container.innerHTML += login;
			componentHandler.upgradeDom();
			
			var updated = document.querySelectorAll('.page-content form div.mdl-js-textfield');
			for (var i=0; i<updated.length;i++) {
				updated[i].classList.remove('is-upgraded');
				updated[i].removeAttribute('data-upgraded');
			}
			app.refreshButtonsSelectors();
			setLoginAction();
			setSignupAction();
		}
	} //displayLoginForm

	app.fetchIndex = function() {
		containers.spinner.removeAttribute('hidden');
		containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (containers.index).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/index';
		var title = '';

		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			var node = "";
			for (var i=0; i < (response).length ; i++ ) {
				node += app.getCard(response[i]);
            }
			container.innerHTML = node;
		})
		.catch(function (error) {
			container.innerHTML = app.getCard( {image: app.baseUrlCdn+'/img/opl_img2.jpg', title: 'Oops, something has not been loaded correctly..', titlecolor: '#ffffff', description: 'We are sorry, the content cannot be loaded, please try again later, there might a temporary network outage. :-)'} );
			app.displayLoginForm(container);
			if ( app.debug === true ) {
				toast('fetchIndex error out...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	}; //fetchIndex

	app.showAddFAB = function(type) {
		var container;
		var showFAB = false;
		if( type == 'objects' ) {
			var id = 'createObject';
			container = (containers.objects).querySelector('.page-content');
			showFAB = true;
		}
		if( type == 'flows' ) {
			var id = 'createFlow';
			container = (containers.flows).querySelector('.page-content');
			showFAB = true;
		}
		if( type == 'dashboards' ) {
			var id = 'createDashboard';
			container = (containers.dashboards).querySelector('.page-content');
			showFAB = true;
		}
		if( type == 'snippets' ) {
			var id = 'createSnippet';
			container = (containers.snippets).querySelector('.page-content');
			showFAB = true;
		}
		if ( showFAB  && container ) {
			var fabClass = app.getSetting('settings.fab_position')!==undefined?app.getSetting('settings.fab_position'):'fab__bottom';
			var fab = "<div class='mdl-button--fab_flinger-container "+fabClass+"'>";
			fab += "	<button id='"+id+"' class='mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored mdl-shadow--8dp'>";
			fab += "		<i class='material-icons'>add</i>";
			fab += "		<span class='mdl-button__ripple-container'>";
			fab += "			<span class='mdl-ripple'></span>";
			fab += "		</span>";
			fab += "	</button>";
			fab += "</div>";
			container.innerHTML += fab;
			componentHandler.upgradeDom();
			
			app.refreshButtonsSelectors();
			if ( buttons.createObject ) buttons.createObject.addEventListener('click', function() {app.displayAddObject(app.defaultResources.object);}, false);
			if ( buttons.createFlow ) buttons.createFlow.addEventListener('click', function() {app.displayAddFlow(app.defaultResources.flow);}, false);
			if ( buttons.createSnippet ) buttons.createSnippet.addEventListener('click', function() {app.displayAddSnippet(app.defaultResources.snippet);}, false);
			if ( buttons.createDashboard ) buttons.createDashboard.addEventListener('click', function() {app.displayAddDashboard(app.defaultResources.dashboard);}, false);
			if ( buttons.createRule ) buttons.createRule.addEventListener('click', function() {app.displayAddRule(app.defaultResources.rule);}, false);
			if ( buttons.createMqtt ) buttons.createMqtt.addEventListener('click', function() {app.setSection('mqtt_add')}, false);
		}
	} // showAddFAB

	app.getUniqueId = function() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	} // getUniqueId
	
	app.getField = function(icon, label, value, options) {
		var hidden = options.isVisible!==false?"":" hidden";
		var expand = options.isExpand===false?"":" mdl-card--expand";
		var field = "";
		field += "<div class='mdl-list__item--three-line small-padding "+hidden+expand+"'>";

		if ( typeof options === 'object' ) {
			var id = options.id!==null?options.id:app.getUniqueId();
			
			if ( options.type === 'input' || options.type === 'text' ) {
				if ( options.isEdit == true ) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
					field += "	<input type='text' value='"+value+"' class='mdl-textfield__input' name='"+label+"' id='"+id+"' />";
					if (label) field += "	<label class='mdl-textfield__label' for='"+id+"'>"+label+"</label>";
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'textarea' ) {
				if ( options.isEdit == true ) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
					field += "	<textarea style='width:100%; height:100%;' type='text' rows='3' class='mdl-textfield__input' name='"+label+"' id='"+id+"'>"+value+"</textarea>";
					if (label) field += "	<label class='mdl-textfield__label' for='"+id+"'>"+label+"</label>";
					field += "</div>";
				} else {
					if (value ) field += "<span class='mdl-list__item-sub-title'>"+value+"</span>";
				}
			} else if ( options.type === 'radio' ) {
				if ( options.isEdit == true ) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'> /!\ radio "+icon+"</i>";
					if (label) field += "	<label class='mdl-textfield__label'> /!\ radio "+label+"</label>";
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'checkbox' ) {
				if ( options.isEdit == true ) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'> /!\ checkbox "+icon+"</i>";
					if (label) field += "	<label class='mdl-list__item-sub-title'> /!\ checkbox "+label+"</label>";
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'switch' ) {
				if ( options.isEdit == true ) {
					var checked = value=='true'?'checked':'';
					field += "<label class='mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-textfield--floating-label' for='switch-"+id+"' data-id='switch-"+id+"'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
					field += "	<input type='checkbox' id='switch-"+id+"' class='mdl-switch__input' "+checked+" name='"+label+"' placeholder='"+label+"'>";
					if (label) field += "	<div class='mdl-switch__label'>"+label+"</div>";
					field += "</label>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'select' ) {
				if ( options.isEdit == true ) {
					field += "<div class='mdl-selectfield mdl-js-selectfield mdl-textfield--floating-label'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
					field += "	<select class='mdl-selectfield__select' name='"+label+"' id='"+id+"'>";
					for (var n=0; n<options.options.length; n++) {
						var selected = value==options.options[n].value?'selected':'';
						field += "	<option "+selected+" value='"+options.options[n].name+"'>"+options.options[n].value+"</option>";
					}
					field += "	</select>";
					if (label) field += "	<label class='mdl-selectfield__label' for='"+id+"'>"+label+"</label>";
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'progress-status' ) {
				field += "<span class='mdl-progress mdl-js-progress' id='progress-status' title=''><br />"+value+"</span>";
			}
		} else {
			console.log("Error on options: ", options);
		}

		if ( options.action !== undefined ) {
			field += "	<span class='mdl-list__item-secondary-action'>";
			field += "		<a href='#' "+options.action+">";
			field += "			<i class='material-icons'>chevron_right</i>";
			field += "		</a>";
			field += "	</span>";
		}
		field += "</div>";
		return field;
	} // getField

	app.getSnippet = function(icon, snippet_id, container) {
		containers.spinner.removeAttribute('hidden');
		containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var myContainer = container!=null?container:(containers.dashboard).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/snippets/'+snippet_id;
		
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			var my_snippet = response.data[0];
			var width = 6; // TODO: should be a parameter in the flow

			//var snippet = "<section class='mdl-grid mdl-cell--12-col' id='"+my_snippet.id+"'>";
			var snippet = "";
			if ( my_snippet.attributes.type == 'valuedisplay' ) {
				snippet += "	<div class=\"valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp\">";
				snippet += "		<div class=\"contextual\">";
				snippet += "			<div class='mdl-list__item-primary-content'>";
				snippet += "				<i class='material-icons'>"+icon+"</i>";
				snippet += "				<span class=\"heading\">"+my_snippet.attributes.name+"</span>";
				snippet += "			</div>";
				snippet += "			<div class='mdl-list__item-secondary-content'>";
				snippet += "				<span class='snippet-value1' id='snippet-value1-"+my_snippet.id+"'>-</span>";
				snippet += "				<span class='snippet-unit1' id='snippet-unit1-"+my_snippet.id+"'>n/a</span>";
				snippet += "				<hr style='' />";
				snippet += "				<span class='snippet-value2' id='snippet-value2-"+my_snippet.id+"'>-</span>";
				snippet += "				<span class='snippet-unit2' id='snippet-unit2-"+my_snippet.id+"'>n/a</span>";
				snippet += "				<hr style='' />";
				snippet += "				<span class='snippet-value3' id='snippet-value3-"+my_snippet.id+"'>-</span>";
				snippet += "				<span class='snippet-unit3' id='snippet-unit3-"+my_snippet.id+"'>n/a</span>";
				snippet += "			</div>";
				snippet += "		</div>";
				snippet += "		<div class='mdl-list__item-sub-title' id='snippet-time-"+my_snippet.id+"'></span>";
				snippet += "		<div class=\"chart without-time chart-balance\"></div>";
				snippet += "	</div>";
				
			} else if ( my_snippet.attributes.type == 'sparkline' ) {
				width = 12;
				snippet += "	<div class=\"sparkline tile card-sparkline material-animate margin-top-4 material-animated mdl-shadow--2dp\">";
				snippet += "		<span class='mdl-list__item mdl-list__item--two-line'>";
				snippet += "			<span class='mdl-list__item-primary-content'>";
				snippet += "				<i class='material-icons'>"+icon+"</i>";
				snippet += "				<span class=\"heading\">"+my_snippet.attributes.name+"</span>";
				snippet += "				<span class='mdl-list__item-sub-title' id='snippet-time-"+my_snippet.id+"'></span>";
				snippet += "			</span>";
				snippet += "			<span class='mdl-list__item-secondary-content'>";
				snippet += "				<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text' id='snippet-value-"+my_snippet.id+"'></span>";
				snippet += "			</span>";
				snippet += "			<span class='mdl-list__item' id='snippet-sparkline-"+my_snippet.id+"' style='width:100%; height:200px;'>";
				snippet += "				<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text'>sparkline</span>";
				snippet += "			</span>";
				snippet += "		</span>";
				snippet += "	</div>";
				
			} else if ( my_snippet.attributes.type == 'simplerow' ) {
				width = 12;
				/*
				if( !Array.isArray(my_snippet.attributes.flows.isArray) ) { // WTF
					my_snippet.attributes.flows[0] = my_snippet.attributes.flows;
				}
				*/
				for (var f=0; f<(my_snippet.attributes.flows).length; f++) {
					var flow_id = my_snippet.attributes.flows[f];
					snippet += "	<div class=\"simplerow tile card-simplerow material-animate margin-top-4 material-animated mdl-shadow--2dp\">";
					snippet += "		<span class='mdl-list__item mdl-list__item--two-line'>";
					snippet += "			<span class='mdl-list__item-primary-content'>";
					snippet += "				<i class='material-icons'>"+icon+"</i>";
					snippet += "				<span class=\"heading\">"+flow_id+"</span>";
					snippet += "				<span class='mdl-list__item-sub-title' id='snippet-time-"+flow_id+"'></span>";
					snippet += "			</span>";
					snippet += "			<span class='mdl-list__item-secondary-content'>";
					snippet += "				<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text' id='snippet-value-"+flow_id+"'></span>";
					snippet += "			</span>";
					snippet += "		</span>";
					snippet += "	</div>";
					
					//var flow_id = my_snippet.attributes.flows[f];
					var url_snippet = app.baseUrl+"/"+app.api_version+'/data/'+flow_id+'?sort=desc&limit=1';
					fetch(url_snippet, myInit)
					.then(
						fetchStatusHandler
					).then(function(fetchResponse){ 
						return fetchResponse.json();
					})
					.then(function(response) {
						//console.log("Get data from Flow: "+ flow_id);
						var id = response.data[0].attributes.id;
						var time = response.data[0].attributes.time;
						var value = response.data[0].attributes.value;
						var unit = response.links.unit!==undefined?response.links.unit:'';
						var ttl = response.links.ttl;
						if (document.getElementById('snippet-value-'+flow_id)) {
							document.getElementById('snippet-value-'+flow_id).innerHTML = value;
						}
						if (document.getElementById('snippet-unit-'+flow_id)) {
							document.getElementById('snippet-unit-'+flow_id).innerHTML = unit;
						}
						if (document.getElementById('snippet-time-'+flow_id)) {
							document.getElementById('snippet-time-'+flow_id).innerHTML = moment(time).format(app.date_format) + "<small>, " + moment(time).fromNow() + "</small>";
						}
						setInterval(function() {app.refreshFromNow('snippet-time-'+flow_id, time)}, 10000);
					})
					.catch(function (error) {
						if ( app.debug === true ) {
							toast('getSnippet Inside error...' + error, {timeout:3000, type: 'error'});
						}
					});
				}
			} else if ( my_snippet.attributes.type == 'flowgraph' ) {
				width = 12;
				snippet += "	<div class=\"flowgraph tile card-flowgraph material-animate margin-top-4 material-animated mdl-shadow--2dp\">";
				snippet += "		<div class=\"contextual\">";
				snippet += "			<div class='mdl-list__item-primary-content'>";
				snippet += "				<i class='material-icons'>"+icon+"</i>";
				snippet += "				<span class=\"heading\">"+my_snippet.attributes.name+"</span>";
				snippet += "			</div>";
				snippet += "		</div>";
				snippet += "		<div class='mdl-list__item-primary-content'>";
				snippet += "			<div class='mdl-list__item' id='snippet-graph-"+my_snippet.id+"' style='width:100%; height:200px;'>";
				snippet += "				<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text'></span>";
				snippet += "			</span>";
				snippet += "		</div>";
				snippet += "		<div class='mdl-list__item-sub-title' id='snippet-time-"+my_snippet.id+"'></span>";
				snippet += "	</div>";
				
				var options = {
					series: { lines : { show: true, fill: 'false', lineWidth: 3, steps: false } },
					colors: [my_snippet.attributes.color!==''?my_snippet.attributes.color:'#000000'],
					points : { show : true },
					legend: { show: true, position: "sw" },
					grid: {
						borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
						borderColor: { top: "", right: "", bottom: "", left: "" },
						// markings: weekendAreas,
						clickable: true,
						hoverable: true,
						autoHighlight: true,
						mouseActiveRadius: 5
					},
					xaxis: { mode: "time", autoscale: true, timeformat: "%d/%m/%Y<br/>%Hh%M" },
					yaxis: [ { autoscale: true, position: "left" }, { autoscale: true, position: "right" } ],
				};

				var my_snippet_data_url = app.baseUrl+'/'+app.api_version+'/data/'+my_snippet.attributes.flows[0]+'?limit=100&sort=desc';
				fetch(my_snippet_data_url, myInit)
				.then(
					fetchStatusHandler
				).then(function(fetchResponse){ 
					return fetchResponse.json();
				})
				.then(function(data) {
					var id = data.data[0].attributes.id;
					var time = data.data[0].attributes.time;
					var value = data.data[0].attributes.value;
					var unit = data.links.unit!==undefined?response.links.unit:'';
					var ttl = data.links.ttl;
					if ( moment().subtract(ttl, 'seconds') > moment(time) ) {
						document.getElementById('snippet-time-'+my_snippet.id).parentNode.parentNode.parentNode.classList.remove('is-ontime');
						document.getElementById('snippet-time-'+my_snippet.id).parentNode.parentNode.parentNode.classList.add('is-outdated');
					} else {
						document.getElementById('snippet-time-'+my_snippet.id).parentNode.parentNode.parentNode.classList.remove('is-outdated');
						document.getElementById('snippet-time-'+my_snippet.id).parentNode.parentNode.parentNode.classList.add('is-ontime');
					}
					var dataset = [data.data.map(function(i) {
						return [i.attributes.timestamp, i.attributes.value];
					})];
					$.plot($('#snippet-graph-'+my_snippet.id), dataset, options);
					document.getElementById('snippet-time-'+my_snippet.id).innerHTML = moment(dataset[0][0][0]).format(app.date_format) + ", " + moment(dataset[0][0][0]).fromNow();
				})
				.catch(function (error) {
					if ( app.debug === true ) {
						toast('fetchIndex error out...' + error, {timeout:3000, type: 'error'});
					}
				});
			} else if ( my_snippet.attributes.type == 'clock' ) {
				width = 12;
				snippet += "	<div class=\"clock tile card-simpleclock material-animate margin-top-4 material-animated\">";
				snippet += "		<span class='mdl-list__item mdl-list__item--two-line'>";
				snippet += "			<span class='mdl-list__item-primary-content'>";
				snippet += "				<i class='material-icons'>alarm</i>";
				snippet += "				<span class=\"heading\"></span>";
				snippet += "				<span class='mdl-list__item-sub-title' id='snippet-time-"+my_snippet.id+"'></span>";
				snippet += "			</span>";
				snippet += "			<span class='mdl-list__item-secondary-content'>";
				snippet += "				<span class='mdl-list__item'>";
				snippet += "					<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text' id='snippet-clock-"+my_snippet.id+"'>"+moment().format(app.date_format)+"</span>";
				snippet += "				</span>";
				snippet += "			</span>";
				snippet += "		</span>";
				snippet += "	</div>";
				setInterval(function() {app.refreshFromNow('snippet-clock-'+my_snippet.id, moment(), null)}, 3600);
			} else {
				snippet += "	<div class=\" tile card-dashboard-graph material-animate margin-top-4 material-animated\">";
				snippet += "		<span class='mdl-list__item-secondary-content'>";
				snippet += "		<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text' id='snippet-value-"+my_snippet.attributes.type+"'>"+my_snippet.attributes.type+" is not implemented yet.</span>";				snippet += "		</span>";
				snippet += "	</div>";
			}

			//snippet += "</section>";
			//var c = document.createElement('div');
			//c.innerHTML = snippet;
			
			var c= document.createElement("div");
			c.setAttribute('class','mdl-grid mdl-cell--'+width+'-col');
			c.setAttribute('id',my_snippet.id);
			c.innerHTML = snippet;
			
			myContainer.appendChild(c);
			componentHandler.upgradeDom();
			
			if ( my_snippet.attributes.type == 'simplerow' ) {
				var url_snippet = app.baseUrl+"/"+app.api_version+'/data/'+my_snippet.attributes.flows[0]+'?sort=desc&limit=1';
				fetch(url_snippet, myInit)
				.then(
					fetchStatusHandler
				).then(function(fetchResponse){
					return fetchResponse.json();
				})
				.then(function(response) {
					//console.log("Get data from Flow: "+ url_snippet);
					var id = response.data[0].attributes.id;
					var time = response.data[0].attributes.time;
					var value = response.data[0].attributes.value;
					var unit = response.links.unit!==undefined?response.links.unit:'';
					var ttl = response.links.ttl;
					document.getElementById('snippet-value-'+my_snippet.id).innerHTML = value;
					document.getElementById('snippet-unit-'+my_snippet.id).innerHTML = unit;
					document.getElementById('snippet-time-'+my_snippet.id).innerHTML = moment(time).format(app.date_format) + "<small>, " + moment(time).fromNow() + "</small>";
					setInterval(function() {app.refreshFromNow('snippet-time-'+my_snippet.id, time)}, 10000);
				})
				.catch(function (error) {
					if ( app.debug === true ) {
						toast('getSnippet Inside error...' + error, {timeout:3000, type: 'error'});
					}
				});
			} else if ( my_snippet.attributes.type == 'valuedisplay' ) {
				var url_snippet = app.baseUrl+"/"+app.api_version+'/data/'+my_snippet.attributes.flows[0]+'?sort=desc&limit=3';
				fetch(url_snippet, myInit)
				.then(
					fetchStatusHandler
				).then(function(fetchResponse){
					return fetchResponse.json();
				})
				.then(function(response) {
					//console.log("Get data from Flow: "+ url_snippet);
					var id = response.data[0].attributes.id;
					var time = response.data[0].attributes.time;
					
 					var value1 = response.data[0].attributes.value;
					var unit = response.links.unit!==undefined?response.links.unit:'';
					var ttl = response.links.ttl;
					if ( value1 == response.data[1].attributes.value ) {
						value1 = "<i class='material-icons'>trending_flat</i> " + value1;
					} else if( value1 < response.data[1].attributes.value ) {
						value1 = "<i class='material-icons'>trending_down</i> " + value1;
					} else if( value1 > response.data[1].attributes.value ) {
						value1 = "<i class='material-icons'>trending_up</i> " + value1;
					}
					if ( moment().subtract(ttl, 'seconds') > moment(time) ) {
						document.getElementById('snippet-value1-'+my_snippet.id).parentNode.parentNode.parentNode.classList.remove('is-ontime');
						document.getElementById('snippet-value1-'+my_snippet.id).parentNode.parentNode.parentNode.classList.add('is-outdated');
					} else {
						document.getElementById('snippet-value1-'+my_snippet.id).parentNode.parentNode.parentNode.classList.remove('is-outdated');
						document.getElementById('snippet-value1-'+my_snippet.id).parentNode.parentNode.parentNode.classList.add('is-ontime');
					}
					document.getElementById('snippet-value1-'+my_snippet.id).innerHTML = value1;
					document.getElementById('snippet-unit1-'+my_snippet.id).innerHTML = unit;
					
					var value2 = response.data[1].attributes.value;
					var unit = response.links.unit!==undefined?response.links.unit:'';
					var ttl = response.links.ttl;
					if ( value2 == response.data[2].attributes.value ) {
						value2 = "<i class='material-icons'>trending_flat</i> " + value2;
					} else if( value2 < response.data[2].attributes.value ) {
						value2 = "<i class='material-icons'>trending_down</i> " + value2;
					} else if( value2 > response.data[2].attributes.value ) {
						value2 = "<i class='material-icons'>trending_up</i> " + value2;
					}
					document.getElementById('snippet-value2-'+my_snippet.id).innerHTML = value2;
					document.getElementById('snippet-unit2-'+my_snippet.id).innerHTML = unit;
					
					var value3 = response.data[2].attributes.value;
					var unit = response.links.unit!==undefined?response.links.unit:'';
					var ttl = response.links.ttl;
					document.getElementById('snippet-value3-'+my_snippet.id).innerHTML = value3;
					document.getElementById('snippet-unit3-'+my_snippet.id).innerHTML = unit;
										
					document.getElementById('snippet-time-'+my_snippet.id).innerHTML = moment(time).format(app.date_format) + "<small>, " + moment(time).fromNow() + "</small>";
					setInterval(function() {app.refreshFromNow('snippet-time-'+my_snippet.id, time)}, 10000);
				})
				.catch(function (error) {
					if ( app.debug === true ) {
						toast('getSnippet Inside error...' + error, {timeout:3000, type: 'error'});
					}
				});
			}
			//console.log(myContainer);
			//return snippet;
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('getSnippet error out...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	} //getSnippet
	
	app.refreshFromNow = function(id, time, fromNow) {
		if (document.getElementById(id)) {
			document.getElementById(id).innerHTML = moment(time).format(app.date_format);
			if ( fromNow !== null ) {
				document.getElementById(id).innerHTML += "<small>, " + moment(time).fromNow() + "</small>";
			}
		}
	} //refreshFromNow

	app.getQrcodeImg = function(icon, label, id) {
		var field = "<div class='mdl-list__item small-padding'>";
		field += "		<span class='mdl-list__item-primary-content'>";
		field += "			<i class='material-icons'>link</i>";
		field += "			<span class=\"heading\">QR Code<sup>TM</sup></span>";
		field += "		</span>";
		field += "		<span class='mdl-list__item-secondary-content'>";
		field += "			<img src='' id='qr-"+id+"' class='img-responsive' style='margin:0 auto;' />";
		field += "		</span>";
		field += "</div>";
		return field;
	} //getQrcodeImg

	app.getQrcode = function(icon, label, id) {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/objects/"+id+"/qrcode/18/H";
		
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( response ) {
				var container = document.getElementById('qr-'+id);
				container.setAttribute('src', response.data);
			}
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('fetch Qrcode error out...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	} //getQrcode

	app.getMap = function(icon, id, longitude, latitude, isEditable, isActionable) {
		var field = "<div class='mdl-list__item'>";
		field += "	<span class='mdl-list__item-primary-content map' id='"+id+"' style='width:100%; height:400px;'></span>";
		field += "</div>";
		return field;
	} //getMap
	
	app.authenticate = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(app.auth) };
		var url = app.baseUrl+"/"+app.api_version+"/authenticate";
		
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( app.bearer = response.token ) {
				app.isLogged = true;
				app.resetSections();
				//app.getAllUserData();
				app.fetchProfile();
				if ( window.location.hash && window.location.hash.substr(1) !== 'login' ) {
					app.setSection(window.location.hash.substr(1));
				} else {
					app.setSection('index');
				}
				app.setHiddenElement("signin_button"); 
				app.setVisibleElement("logout_button");
				
				toast('Hey. Welcome Back! :-)', {timeout:3000, type: 'done'});
				app.addJWT(app.bearer);
			} else {
				if ( app.debug === true ) {
					toast('Auth internal error', {timeout:3000, type: 'error'});
				}
				app.resetDrawer();
			}
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('We can\'t process your identification. Please resubmit your credentials!', {timeout:3000, type: 'warning'});
			}
		});
		app.auth = {};
	} //authenticate
	
	function chainError(error) {
		console.log(error);
		throw(error);
		return Promise.reject(error)
	}

	app.getAllUserData = function() {
		app.fetchItems('objects')
			.then(app.fetchItems('flows')
				.then(app.fetchItems('dashboards')
					.then(app.fetchItems('snippets')
						.then(app.fetchItems('rules')
							.then(app.fetchItems('mqtts')
								.then(app.fetchProfile(),
								chainError).catch(chainError),
							chainError).catch(chainError),
						chainError).catch(chainError),
					chainError).catch(chainError),
				chainError).catch(chainError),
			chainError).catch(chainError);
	} //getAllUserData

	app.getStatus = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/status";
		
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			var status = "";
			status += "<section class=\"mdl-grid mdl-cell--12-col\">";
			status += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
			status += "		<div class=\"mdl-list__item\">";
			status += "			<span class='mdl-list__item-primary-content'>";
			status += "				<h2 class=\"mdl-card__title-text\">";
			status += "					<i class=\"material-icons\">"+app.icons.status+"</i>";
			status += "					API Status";
			status += "				</h2>";
			status += "			</span>";
			status += "			<span class='mdl-list__item-secondary-action'>";
			status += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='status-details'>";
			status += "					<i class='material-icons'>expand_more</i>";
			status += "				</button>";
			status += "			</span>";
			status += "		</div>";
			status += "		<div class='mdl-cell--12-col' id='status-details'>";
			status += app.getField('thumb_up', 'Name', response.appName, {type: 'text', isEdit: false});
			status += app.getField('verified_user', 'Version', response.version, {type: 'text', isEdit: false});
			status += app.getField(app.icons.status, 'Status', response.status, {type: 'text', isEdit: false});
			status += app.getField(app.icons.mqtts, 'Mqtt Topic Info', response.mqtt_info, {type: 'text', isEdit: false});
			status += app.getField('alarm', 'Last Update', response.started_at, {type: 'text', isEdit: false});
			status += "		</div>";
			status += "	</div>";
			status += "</section>";
			
			if ( app.RateLimit.Limit && app.RateLimit.Remaining ) {
				status += "<section class=\"mdl-grid mdl-cell--12-col\">";
				status += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				status += "		<div class=\"mdl-list__item\">";
				status += "			<span class='mdl-list__item-primary-content'>";
				status += "				<h2 class=\"mdl-card__title-text\">";
				status += "					<i class=\"material-icons\">crop_free</i>";
				status += "					API Usage";
				status += "				</h2>";
				status += "			</span>";
				status += "			<span class='mdl-list__item-secondary-action'>";
				status += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='status-usage'>";
				status += "					<i class='material-icons'>expand_more</i>";
				status += "				</button>";
				status += "			</span>";
				status += "		</div>";
				status += "		<div class='mdl-cell--12-col' id='status-usage'>";
				if ( app.RateLimit.Used && app.RateLimit.Limit ) {
					status += app.getField('center_focus_weak', 'Used', app.RateLimit.Used + '/' +app.RateLimit.Limit, {type: 'progress-status', isEdit: false});
				}
				status += "		</div>";
				status += "	</div>";
				status += "</section>";
			}

			(containers.status).querySelector('.page-content').innerHTML = status;
			if ( app.RateLimit.Used && app.RateLimit.Limit ) {
				var rate = Math.ceil((app.RateLimit.Used * 100 / app.RateLimit.Limit)/10)*10;
				document.querySelector('#progress-status').addEventListener('mdl-componentupgraded', function() {
					this.MaterialProgress.setProgress(rate);
				});
			}
			app.setExpandAction();
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('Can\'t display Status...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	} //getStatus

	app.getTerms = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/terms";
		
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			var terms = "";
			terms += "<section class=\"mdl-grid mdl-cell--12-col\">";
			terms += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
			for (var i=0; i < (response).length ; i++ ) {
				if( response[i].title ) {
					terms += "	<div class=\"mdl-grid\">";
					terms += "		<h3 class=\"mdl-typography--headline\">"+response[i].title+"</h3>";
					terms += "	</div>";
				}
				terms += "	<div class=\"mdl-card__supporting-text no-padding\">";
				terms += response[i].description;
				terms += "	</div>";
            }
			terms += "	</div>";
			terms += "</section>";

			(containers.terms).querySelector('.page-content').innerHTML = terms;
			if ( !app.isLogged ) {
				app.displayLoginForm( (containers.terms).querySelector('.page-content') );
			}
		})
		.catch(function (error) {
			if ( app.debug === true ) {
				toast('Can\'t display Terms...' + error, {timeout:3000, type: 'error'});
			}
		});
		containers.spinner.setAttribute('hidden', true);
	} //getTerms
	
	app.toggleElement = function(id) {
		document.querySelector('#'+id).classList.toggle('hidden');
	} //toggleElement
	
	app.setHiddenElement = function(id) {
		document.querySelector('#'+id).classList.add('hidden');
	} //setHiddenElement
	
	app.setVisibleElement = function(id) {
		document.querySelector('#'+id).classList.remove('hidden');
	} //setVisibleElement

	app.showNotification = function() {
		toast('You are offline.', {timeout:3000, type: 'warning'});
		//app.setHiddenElement("notification");
	} //showLatestNotification
	
	app.sessionExpired = function() {
		app.bearer = '';
		app.auth = {};
		app.RateLimit = {Limit: null, Remaining: null, Used: null};
		if ( !app.isLogged ) toast('Your session has expired. You must sign-in again.', {timeout:3000, type: 'error'});
		app.isLogged = false;
		app.resetDrawer();
		
		app.setVisibleElement("signin_button"); 
		app.setHiddenElement("logout_button");
		app.setDrawer();

		app.refreshButtonsSelectors();
		componentHandler.upgradeDom();

		(containers.objects).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Connected Objects', titlecolor: '#ffffff', description: 'Embedded, Automatization, Domotic, Sensors, any Objects can be connected and communicate to t6 via API.'}); //, action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}
		//app.displayLoginForm( (containers.objects) );
		
		(containers.flows).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Data Flows as Time-series', titlecolor: '#ffffff', description: 'Communication becomes easy in the platform with Timestamped values. Flows allows to retrieve and classify data.', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		//app.displayLoginForm( (containers.flows) );

		(containers.dashboards).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Dashboards', titlecolor: '#ffffff', description: 'Graphics, data-management, Monitoring, Reporting', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		//app.displayLoginForm( (containers.dashboards) );

		(containers.snippets).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Snippets', titlecolor: '#ffffff', description: 'Snippets are components to embed into your dashboards and displays your data', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		//app.displayLoginForm( (containers.snippets) );
		
		(containers.rules).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Decision Rules to get smart', titlecolor: '#ffffff', description: 'Trigger action from Mqtt and decision-tree. Let\'s your Objects talk to the platform as events.', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		(containers.mqtts).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});

		var updated = document.querySelectorAll('.page-content form div.mdl-js-textfield');
		for (var i=0; i<updated.length;i++) {
			updated[i].classList.remove('is-upgraded');
			updated[i].removeAttribute('data-upgraded');
		}
		
		componentHandler.upgradeDom();
		app.refreshButtonsSelectors();
		setLoginAction();
		setSignupAction();
	}//sessionExpired
	
	app.resetSections = function() {
		/* reset views to default */
		if (app.debug === true) { console.log('resetSections()'); }
		(containers.objects).querySelector('.page-content').innerHTML = '';
		(containers.object).querySelector('.page-content').innerHTML = '';
		(containers.flows).querySelector('.page-content').innerHTML = '';
		(containers.flow).querySelector('.page-content').innerHTML = '';
		(containers.dashboards).querySelector('.page-content').innerHTML = '';
		(containers.dashboard).querySelector('.page-content').innerHTML = '';
		(containers.snippets).querySelector('.page-content').innerHTML = '';
		(containers.snippet).querySelector('.page-content').innerHTML = '';
		(containers.profile).querySelector('.page-content').innerHTML = '';
		(containers.rules).querySelector('.page-content').innerHTML = '';
		(containers.mqtts).querySelector('.page-content').innerHTML = '';
	} //resetSections

	/* *********************************** indexedDB *********************************** */
	var db;
	var idbkr;
	var objectStore;
	
	function singleExec(fn) {
	    let lock;
	    return async function () { 
	        lock = lock || fn();
	        r = await lock;
	        lock = undefined;
	        return r;
	    }
	}
	
	app.clearJWT = function() {
		var jwt;
		var tx = db.transaction(["jwt"], "readwrite");
		var request = tx.objectStore("jwt");
		var objectStoreRequest = request.clear();
	}
	
	app.addJWT = function(jwt) {
		var item = { token: jwt, exp: moment().add(5, 'minute').unix() };
		var transaction = db.transaction(['jwt'], 'readwrite');
		var store = transaction.objectStore('jwt');
		var request = store.add(item);
		//var request = db.transaction(["jwt"], "readwrite").objectStore("jwt").add(item);
		request.onsuccess = function(event) {
			if ( app.debug === true ) {
				console.log("add(): onsuccess.");
			}
		}
		request.onerror = function(event) {
			if ( app.debug === true ) {
				console.log("add(): onerror.");
				console.log(event);
			}
		}
		//return;
	}
	
	app.searchJWT = function() {
		var jwt;
		var tx = db.transaction(["jwt"], "readonly");
		var request = tx.objectStore("jwt").index("exp");

		var toDate = moment().unix();
		//console.log(toDate);
		var range = idbkr.upperBound(""+toDate, false);
		request.openCursor(range, 'prev').onsuccess = function(e) {
			var cursor = e.target.result;
			if(cursor && cursor.value['token']) {
				jwt = cursor.value['token'];
				//console.log(parseInt(cursor.value['exp']));
				if ( app.debug == true ) {
					console.log('Using JWT expiring on '+moment(parseInt(cursor.value['exp']*1000)).format(app.date_format));
				}
				app.bearer = jwt;
				app.resetSections();
				// // //app.getAllUserData();
				app.setSection('index');
				app.setHiddenElement("signin_button"); 
				app.setVisibleElement("logout_button");
				if ( app.debug === true ) {
					console.log("Autologin completed. Using JWT:");
					console.log(jwt);
				}
				toast('Still here! :-)', {timeout:3000, type: 'done'});
				
				return jwt;
				//cursor.continue();
			}
		}
		tx.onabort = function() {
			if ( app.debug === true ) {
				console.log("searchJWT(): tx onerror.");
				console.log(tx.error);
			}
		}
		request.openCursor(range, 'prev').onerror = function(e) {
			if ( app.debug === true ) {
				console.log("openCursor: onerror.");
			}
		}
		request.onsuccess = function(event) {
			if ( app.debug === true ) {
				console.log("searchJWT(): onsuccess.");
			}
		};
		request.onerror = function(event) {
			if ( app.debug === true ) {
				console.log("searchJWT(): onerror.");
				console.log(event);
			}
		}
		return jwt;
	}

	app.showOrientation = function() {
		if ( app.debug === true ) {
			toast("Orientation: " + screen.orientation.type + " - " + screen.orientation.angle + "°.", {timeout:3000, type: 'info'});
		}
	}
	
	function setPosition(position) {
		app.defaultResources.object.attributes.longitude = position.coords.longitude;
		app.defaultResources.object.attributes.latitude = position.coords.latitude;
		if ( app.debug === true ) {
			toast("Geolocation (Accuracy="+position.coords.accuracy+") is set to: L"+position.coords.longitude+" - l"+position.coords.latitude, {timeout:3000, type: 'info'});
		}
	}
	
	function setPositionError(error) {
		switch (error.code) {
			case error.TIMEOUT:
				if ( app.debug === true ) {
					toast("Browser geolocation error !\n\nTimeout.", {timeout:3000, type: 'error'});
				}
				break;
			case error.POSITION_UNAVAILABLE:
				// dirty hack for safari
				if(error.message.indexOf("Origin does not have permission to use Geolocation service") == 0) {
					if ( app.debug === true ) {
						toast("Origin does not have permission to use Geolocation service - no fallback.", {timeout:3000, type: 'error'});
					}
				} else {
					if ( app.debug === true ) {
						toast("Browser geolocation error !\n\nPosition unavailable.", {timeout:3000, type: 'error'});
					}
				}
				break;
			case error.PERMISSION_DENIED:
				if(error.message.indexOf("Only secure origins are allowed") == 0) {
					if ( app.debug === true ) {
						toast("Only secure origins are allowed - no fallback.", {timeout:3000, type: 'error'});
					}
				}
				break;
			case error.UNKNOWN_ERROR:
				if ( app.debug === true ) {
					toast("Can't find your position - no fallback.", {timeout:3000, type: 'error'});
				}
				break;
		}
	}
	
	app.getLocation = function() {
		if (navigator.geolocation) {
			var options = { enableHighAccuracy: false, timeout: 200000, maximumAge: 500000 };
			navigator.geolocation.getCurrentPosition(setPosition, setPositionError, options);
		} else {
			if ( app.debug === true ) {
				toast("Geolocation is not supported by this browser.", {timeout:3000, type: 'warning'});
			}
		}
	}
	
	app.getScrollPercent = function() {
	  return ( (document.documentElement.scrollTop || document.body.scrollTop) / ( (document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight) * 100 );
	}
	
	/* *********************************** Run the App *********************************** */
	if ( window.location.hash ) {
		var p = window.location.hash.substr(1);
		if ( p === 'login' ) {
			app.displayLoginForm( document.querySelector('#login').querySelector('.page-content') );
			app.setSection('login');
		}else if ( p === 'terms' ) {
			 onTermsButtonClick();
		} else if ( p === 'docs' ) {
			onDocsButtonClick();
		} else if ( p === 'status' ) {
			onStatusButtonClick();
		} else {
			app.setSection(p);
		}
	}
	app.fetchIndex('index');

	if( !app.bearer || app.auth.username == null ) {
		app.sessionExpired();
	} else if( app.auth.username && app.auth.password ) {
		// // //app.getAllUserData();
	}
	
	app.refreshButtonsSelectors();
	if ( document.querySelector('.sticky') ) {
		if (!window.getComputedStyle(document.querySelector('.sticky')).position.match('sticky')) {
			if ( app.debug === true ) {
				toast("Your browser does not support 'position: sticky'!!.", {timeout:3000, type: 'info'});
			}
		}
	}
	document.getElementById('search-exp').addEventListener('keypress', function(e) {
		if(e.keyCode === 13) {
			e.preventDefault();
			var input = this.value;
			if ( app.debug === true ) {
				alert("Searching for "+input);
			}
		}
	});
	
	/*
	window.addEventListener('hashchange', function() {
		if( window.history && window.history.pushState ) {
			history.pushState( { section: window.location.hash.substr(1) }, window.location.hash.substr(1), '#'+window.location.hash.substr(1));
			app.setSection(window.location.hash.substr(1));
			if ( app.debug === true ) {
				console.log('history+=\"', window.location.hash.substr(1), '\"');
			}
		}
	}, false);
	*/
	
	document.getElementById('filter-exp').addEventListener('keypress', function(e) {
		if(e.keyCode === 13) {
			e.preventDefault();
			var input = this.value;
			var type = 'objects';
			if ( document.querySelector('section#objects').classList.contains('is-active') ) {
				type = 'objects';
			} else if ( document.querySelector('section#flows').classList.contains('is-active') ) {
				type = 'flows';
			}
			app.fetchItems(type, this.value);
		}
	});
	
	for (var i in buttons.status) {
		if ( buttons.status[i].childElementCount > -1 ) {
			buttons.status[i].removeEventListener('click', onStatusButtonClick, false);
			buttons.status[i].addEventListener('click', onStatusButtonClick, false);
		}
	}
	for (var i in buttons.docs) {
		if ( buttons.docs[i].childElementCount > -1 ) {
			buttons.docs[i].removeEventListener('click', onDocsButtonClick, false);
			buttons.docs[i].addEventListener('click', onDocsButtonClick, false);
		}
	}
	for (var i in buttons.terms) {
		if ( buttons.terms[i].childElementCount > -1 ) {
			buttons.terms[i].removeEventListener('click', onTermsButtonClick, false);
			buttons.terms[i].addEventListener('click', onTermsButtonClick, false);
		}
	}

	var ce=function(e,n){var a=document.createEvent("CustomEvent");a.initCustomEvent(n,true,true,e.target);e.target.dispatchEvent(a);a=null;return false},
	nm=true,sp={x:0,y:0},ep={x:0,y:0},
	touch={
		touchstart:function(e){sp={x:e.touches[0].pageX,y:e.touches[0].pageY}},
		touchmove:function(e){nm=false;ep={x:e.touches[0].pageX,y:e.touches[0].pageY}},
		touchend:function(e){if(nm){ce(e,'fc')}else{var x=ep.x-sp.x,xr=Math.abs(x),y=ep.y-sp.y,yr=Math.abs(y);if(Math.max(xr,yr)>20){ce(e,(xr>yr?(x<0?'swl':'swr'):(y<0?'swu':'swd')))}};nm=true},
		touchcancel:function(e){nm=false}
	};
	for(var a in touch){document.addEventListener(a,touch[a],false);}
	var h=function(e){console.log(e.type,e)};

	if (!('serviceWorker' in navigator)) {
		if ( app.debug === true ) {
			console.log('Service Worker isn\'t supported on this browser, disable or hide UI.');
		}
		return;
	} else {
		//registerServiceWorker();
		if (!('PushManager' in window)) {
			if ( app.debug === true ) {
				console.log('Push isn\'t supported on this browser, disable or hide UI.');
			}
			return;
		} else {
			askPermission();
			subscribeUserToPush();
		}
	};
	screen.orientation.addEventListener("change", app.showOrientation);
	screen.orientation.unlock();
	
	if (!('indexedDB' in window)) {
		if ( app.debug === true ) {
			console.log('This browser doesn\'t support IndexedDB.');
		}
	} else {
		db = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		idbkr = window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
		var request = db.open('t6-app', 1, function(upgradeDb) {
			if (!upgradeDb.objectStoreNames.contains('jwt')) {
				objectStore = upgradeDb.createObjectStore('jwt', { keyPath: 'exp', autoIncrement: true });
				objectStore.createIndex("exp", "exp", { unique: false, autoIncrement: true });
			}
		});
		request.onerror = function(event) {
			if ( app.debug === true ) {
				alert('Database is on-error: ' + event.target.errorCode);
			}
		};
		request.onsuccess = function(event) {
			db = request.result;
			if ( app.debug === true ) {
				console.log('Database is on-success');
				console.log('searchJWT(): ');
			}
			if ( app.autologin === true ) {
				app.searchJWT();
			}
		};
		request.onupgradeneeded = function(event) {
			db = event.target.result;
			objectStore = db.createObjectStore("jwt", {keyPath: "exp", autoIncrement: true});
			objectStore.createIndex("exp", "exp", { unique: false, autoIncrement: true });
			if ( app.debug === true ) {
				console.log('Database is on-upgrade-needed');
				//console.log('searchJWT(): '+ app.searchJWT());
			}
		};
	}

	/* *********************************** Menu *********************************** */
	var menuIconElement = document.querySelector('.mdl-layout__drawer-button');
	var menuElement = document.getElementById('drawer');
	var menuOverlayElement = document.querySelector('.menu__overlay');
	var drawerObfuscatorElement = document.getElementsByClassName('mdl-layout__obfuscator')[0];
	var menuItems = document.querySelectorAll('.mdl-layout__drawer nav a.mdl-navigation__link');
	var menuTabItems = document.querySelectorAll('.mdl-layout__tab-bar a.mdl-navigation__link.mdl-layout__tab');
	var touchStartPoint, touchMovePoint;

	app.showMenu = function() {
		menuElement.style.transform = "translateX(0)";
		menuElement.classList.add('menu--show');
		menuOverlayElement.classList.add('menu__overlay--show');
		drawerObfuscatorElement.remove();
	}
	app.hideMenu = function() {
		menuElement.style.transform = "translateX(-120%)";
		menuElement.classList.remove('menu--show');
		menuOverlayElement.classList.add('menu__overlay--hide');
		menuOverlayElement.classList.remove('menu__overlay--show');
		menuElement.addEventListener('transitionend', app.onTransitionEnd, false);
		menuElement.classList.remove('is-visible');
	}
	app.onTransitionEnd = function() {
		if (touchStartPoint < 10) {
			menuElement.style.transform = "translateX(0)";
			menuOverlayElement.classList.add('menu__overlay--show');
			menuElement.removeEventListener('transitionend', app.onTransitionEnd, false);
		}
	}
	
	app.refreshButtonsSelectors();
	setPasswordResetAction();
	setForgotAction();
	settings_button.addEventListener('click', function(evt) {
		app.setSection((evt.currentTarget.querySelector('a').getAttribute('hash')!==null?evt.currentTarget.querySelector('a').getAttribute('hash'):evt.currentTarget.querySelector('a').getAttribute('href')).substr(1));
	}, false);
	logout_button.addEventListener('click', function(evt) {
		app.auth={};
		app.clearJWT();
		app.resetDrawer();
		app.sessionExpired();
		toast('You have been disconnected :-(', {timeout:3000, type: 'done'});
		app.setSection((evt.currentTarget.querySelector('a').getAttribute('hash')!==null?evt.currentTarget.querySelector('a').getAttribute('hash'):evt.currentTarget.querySelector('a').getAttribute('href')).substr(1));
	}, false);
	signin_button.addEventListener('click', function(evt) {
		app.auth={}; app.setSection('login');
	}, false);
	buttons.notification.addEventListener('click', function(evt) {
		app.showNotification();
	}, false);
	profile_button.addEventListener('click', function(evt) {
		if ( app.isLogged ) {
			app.setSection((evt.currentTarget.querySelector('a').getAttribute('hash')!==null?evt.currentTarget.querySelector('a').getAttribute('hash'):evt.currentTarget.querySelector('a').getAttribute('href')).substr(1));
		} else {
			app.setSection('login');
		}
	}, false);
	app.setHiddenElement("notification");

	menuIconElement.addEventListener('click', app.showMenu, false);
	menuOverlayElement.addEventListener('click', app.hideMenu, false);
	menuElement.addEventListener('transitionend', app.onTransitionEnd, false);
	for (var item in menuItems) {
		if ( menuItems[item].childElementCount > -1 ) {
			(menuItems[item]).addEventListener('click', function(evt) {app.setSection((evt.target.getAttribute('hash')!==null?evt.target.getAttribute('hash'):evt.target.getAttribute('href')).substr(1)); app.hideMenu()}, false);
		}
	};
	for (var item in menuTabItems) {
		if ( menuTabItems[item].childElementCount > -1 ) {
			(menuTabItems[item]).addEventListener('click', function(evt) {app.setSection((evt.target.parentNode.getAttribute('hash')!==null?evt.target.parentNode.getAttribute('hash'):evt.target.parentNode.getAttribute('href')).substr(1));}, false);
		}
	};
	document.body.addEventListener('touchstart', function(event) {
		touchStartPoint = event.changedTouches[0].pageX;
		touchMovePoint = touchStartPoint;
	}, false);
	document.body.addEventListener('touchmove', function(event) {
		touchMovePoint = event.touches[0].pageX;
		if (touchStartPoint < 10 && touchMovePoint > 100) {
			menuElement.style.transform = "translateX(0)";
		}
	}, false);
	
	document.body.addEventListener('touchstart', function(event) {
		var fabs = document.querySelectorAll('section.is-active div.page-content.mdl-grid .mdl-button--fab');
		for (var f in fabs) {
			if ( fabs[f].classList ) {
				fabs[f].classList.remove('is-here');
				fabs[f].classList.add('is-not-here');
			}
		}
	}, false);
	document.body.addEventListener('touchend', function(event) {
		var fabs = document.querySelectorAll('section.is-active div.page-content.mdl-grid .mdl-button--fab');
		for (var f in fabs) {
			if ( fabs[f].classList ) {
				fabs[f].classList.remove('is-not-here');
				fabs[f].classList.add('is-here');
			}
		}
	}, false);
	var pMatches = document.querySelectorAll('.passmatch');
	for (var p in pMatches) {
		if ( (pMatches[p]).childElementCount > -1 ) {
			(pMatches[p]).addEventListener('input', function(event) {
				if( document.querySelector('#p2').value != '' && document.querySelector('#p1').value != document.querySelector('#p2').value ) {
					document.querySelector('#p2').parentNode.classList.add('is-invalid');
					document.querySelector('#p2').parentNode.classList.add('is-dirty');
				} else {
					document.querySelector('#p2').parentNode.classList.remove('is-invalid');
					document.querySelector('#p2').parentNode.classList.remove('is-dirty');
				}
			});
		}
	}

	app.setDrawer();
	
	if ( app.tawktoid ) {
		var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
		(function(){
			var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
			s1.async=true;
			s1.async='async';
			s1.src='//embed.tawk.to/'+app.tawktoid+'/default';
			s1.charset='UTF-8';
			s1.setAttribute('crossorigin','*');
			s0.parentNode.insertBefore(s1,s0);
		})();
	}
	if ( app.hotjarid ) {
		(function(h,o,t,j,a,r){
			h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
			h._hjSettings={hjid:app.hotjarid,hjsv:6};
			a=o.getElementsByTagName('head')[0];
			r=o.createElement('script');r.async=1;
			r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
			a.appendChild(r);
		})(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');
	}

	/* *********************************** Offline *********************************** */
	document.addEventListener('DOMContentLoaded', function(event) {
		if (!navigator.onLine) { updateNetworkStatus(); }
		window.addEventListener('online', updateNetworkStatus, false);
		window.addEventListener('offline', updateNetworkStatus, false);
	});

	//To update network status
	function updateNetworkStatus() {
		if (navigator.onLine) {
			toast('You are now online...', {timeout:3000, type: 'done'});
			app.setHiddenElement("notification");
		}
		else {
			toast('You are now offline...', {timeout:3000, type: 'warning'});
			app.setVisibleElement("notification");
		}
	}
})();
/*
 * Debug console filters
 * DEBUG
 * [gtm]
 * [indexedDB]
 * [JWT]
 * [History]
 * [Orientation]
 * [pushSubscription]
 * [ServiceWorker]
 * [setSection]
 */
"use strict";
var app = {
	api_version: "v2.0.1",
	debug: false,
	baseUrl: "",
	baseUrlCdn: "//cdn.internetcollaboratif.info",
	bearer: "",
	auth: {},
	isLogged: false,
	autologin: false,
	RateLimit : {Limit: null, Remaining: null, Used: null},
	date_format: "DD/MM/YYYY, HH:mm",
	cardMaxChars: 256,
	cookieconsent: 30,
	refreshExpiresInSeconds: 280000,
	itemsSize: {objects: 15, flows: 15, snippets: 15, dashboards: 15, mqtts: 15, rules: 15},
	itemsPage: {objects: 1, flows: 1, snippets: 1, dashboards: 1, mqtts: 1, rules: 1},
	currentSection: "index",
	tawktoid: "58852788bcf30e71ac141187",
	gtm: "GTM-PH7923",
	applicationServerKey: "BHa70a3DUtckAOHGltzLmQVI6wed8pkls7lOEqpV71uxrv7RrIY-KCjMNzynYGt4LJI9Dn2EVP3_0qFAnVxoy6I",
	defaultPageTitle: "t6 IoT App",
	sectionsPageTitles: {
		"index": "t6 IoT App",
		"profile": "t6 profile",
		"object": "t6 Object %s",
		"object_add": "Add Object to t6",
		"objects": "t6 Objects",
		"flow": "t6 Flow %s",
		"flows": "t6 Flows",
		"flow_add": "Add Flow to t6",
		"dashboard": "t6 Dashboard %s",
		"dashboards": "t6 Dashboards",
		"dashboard_add": "Add Dashboard to t6",
		"snippet": "t6 Snippet %s",
		"snippets": "t6 Snippets",
		"snippet_add": "Add Snippet to t6",
		"rule": "t6 Rule %s",
		"rules": "t6 Rules",
		"rule_add": "Add Rule to t6",
		"mqtt": "t6 Mqtt topic %s",
		"mqtts": "t6 Mqtt topics",
		"mqtt_add": "Add Mqtt topic to t6",
		"settings": "t6 Settings",
		"signin": "Signin to t6",
		"login": "Signin to t6",
		"signup": "Signup to t6",
		"forgot-password": "Forgot your t6 password?",
		"reset-password": "Reset your t6 password",
		"status": "t6 Api status",
		"terms": "t6 Terms of Service and License Agreement",
		"docs": "t6 Api first documentation",
		"users-list": "t6 Users Accounts",
	},
	icons: {
		"color": "format_color_fill",
		"copy": "content_copy",
		"dashboards": "dashboard",
		"datapoints": "filter_center_focus",
		"datatypes": "build",
		"date": "event",
		"delete": "delete",
		"delete_question": "error_outline",
		"description": "label",
		"docs": "code",
		"edit": "edit",
		"flows": "settings_input_component",
		"icon": "label_outline",
		"login": "email",
		"menu": "menu",
		"mqtts": "volume_down",
		"name": "list",
		"objects": "devices_other",
		"rules": "call_split",
		"settings": "settings",
		"snippets": "widgets",
		"status": "favorite",
		"terms": "business_center",
		"type": "label",
		"units": "hourglass_empty",
		"update": "update",
	},
	types: [
		{name: "cast", value:"Cast"},
		{name: "cast_connected", value:"Cast Connected"},
		{name: "computer", value:"Computer"},
		{name: "desktop_mac", value:"Desktop Mac"},
		{name: "desktop_windows", value:"Desktop Windows"},
		{name: "developer_board", value:"Developer Board"},
		{name: "device_hub", value:"Device Hub"},
		{name: "devices_other", value:"Devices Other"},
		{name: "dock", value:"Dock"},
		{name: "gamepad", value:"Gamepad"},
		{name: "headset", value:"Headset"},
		{name: "headset_mic", value:"Headset Mic"},
		{name: "keyboard", value:"Keyboard"},
		{name: "keyboard_voice", value:"Keyboard Voice"},
		{name: "laptop", value:"Laptop"},
		{name: "laptop_chromebook", value:"Laptop Chromebook"},
		{name: "laptop_mac", value:"Laptop Mac"},
		{name: "laptop_windows", value:"Laptop Windows"},
		{name: "memory", value:"Memory"},
		{name: "mouse", value:"Mouse"},
		{name: "phone_android", value:"Phone Android"},
		{name: "phone_iphone", value:"Phone Iphone"},
		{name: "phonelink", value:"Phonelink"},
		{name: "router", value:"Router"},
		{name: "scanner", value:"Scanner"},
		{name: "security", value:"Security"},
		{name: "sim_card", value:"Sim Card"},
		{name: "smartphone", value:"Smartphone"},
		{name: "speaker", value:"Speaker"},
		{name: "speaker_group", value:"Speaker Group"},
		{name: "tablet", value:"Tablet"},
		{name: "tablet_android", value:"Tablet Android"},
		{name: "tablet_mac", value:"Tablet Mac"},
		{name: "toys", value:"Toys"},
		{name: "tv", value:"Tv"},
		{name: "videogame_asset", value:"Videogame Asset"},
		{name: "watch", value:"Watch"},
	],
	snippetTypes: [],
	EventTypes: [{name: "mqttPublish", value:"mqtt Publish"}, {name: "email", value:"Email"}, {name: "httpWebhook", value:"http(s) Webhook"}, {name: "sms", value:"Sms/Text message"}, {name: "serial", value:"Serial using Arduino CmdMessenger"}],
	units: [],
	datatypes: [],
	flows: [],
	snippets: [],
	defaultResources: {
		object: {id:"", attributes: {name: "", description: "", is_public: false, type: "", ipv4: "", ipv6: "", longitude: "", latitude: "", position: ""}},
		flow: {id:"", attributes: {name: "", mqtt_topic: "", require_signed: false, require_encrypted: false}},
		dashboard: {id:"", attributes: {name: "", description: ""}},
		snippet: {id:"", attributes: {name: "", icon: "", color: ""}},
		mqtt: {id:"", attributes: {name: ""}},
		rule: {id:'', active: true, attributes: {name: '', priority: 1, event: {type:"email", conditions: '{"all":[ { "fact":"environment", "operator":"equal", "value":"production" }]}', parameters: "{}"}}},
	},
	offlineCard: {},
	patterns: {
		name: ".{3,}",
		ipv4: "((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}(:[0-9]{1,6})?",
		ipv6: "/^(?>(?>([a-f0-9]{1,4})(?>:(?1)){7}|(?!(?:.*[a-f0-9](?>:|$)){8,})((?1)(?>:(?1)){0,6})?::(?2)?)|(?>(?>(?1)(?>:(?1)){5}:|(?!(?:.*[a-f0-9]:){6,})(?3)?::(?>((?1)(?>:(?1)){0,4}):)?)?(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(?>\.(?4)){3}))$",
		longitude: "^[-+]?[0-9]{0,3}\.[0-9]{1,7}$",
		latitude: "^[-+]?[0-9]{0,3}\.[0-9]{1,7}$",
		position: ".{3,255}",
		username: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
		password: ".{4,}",
		cardMaxChars: "^[0-9]+$",
		customAttributeName: "^[a-zA-Z0-9_]+$",
		customAttributeValue: "^.*?$",
		secret_key: "^.*?$",
		secret_key_crypt: "^.*?$",
		integerNotNegative: "[1-999]+",
		meta_revision: "^[0-9]{1,}$",
	},
	resources: {},
	buttons: {}, // see function app.refreshButtonsSelectors()
	containers: {}, // see function app.refreshContainers()
};
app.offlineCard = {image: app.baseUrlCdn+"/img/opl_img3.jpg", title: "Offline", titlecolor: "#ffffff", description: "Offline mode, Please connect to internet in order to see your resources."};

var Tawk_API;
var touchStartPoint, touchMovePoint;

(function (exports) {
	"use strict";
	function hex_md5(r){return rstr2hex(rstr_md5(str2rstr_utf8(r)))}function b64_md5(r){return rstr2b64(rstr_md5(str2rstr_utf8(r)))}function any_md5(r,t){return rstr2any(rstr_md5(str2rstr_utf8(r)),t)}function hex_hmac_md5(r,t){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)))}function b64_hmac_md5(r,t){return rstr2b64(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)))}function any_hmac_md5(r,t,d){return rstr2any(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)),d)}function md5_vm_test(){return"900150983cd24fb0d6963f7d28e17f72"==hex_md5("abc").toLowerCase()}function rstr_md5(r){return binl2rstr(binl_md5(rstr2binl(r),8*r.length))}function rstr_hmac_md5(r,t){var d=rstr2binl(r);d.length>16&&(d=binl_md5(d,8*r.length));for(var n=Array(16),_=Array(16),m=0;16>m;m++)n[m]=909522486^d[m],_[m]=1549556828^d[m];var f=binl_md5(n.concat(rstr2binl(t)),512+8*t.length);return binl2rstr(binl_md5(_.concat(f),640))}function rstr2hex(r){try{}catch(t){hexcase=0}for(var d,n=hexcase?"0123456789ABCDEF":"0123456789abcdef",_="",m=0;m<r.length;m++)d=r.charCodeAt(m),_+=n.charAt(d>>>4&15)+n.charAt(15&d);return _}function rstr2b64(r){try{}catch(t){b64pad=""}for(var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n="",_=r.length,m=0;_>m;m+=3)for(var f=r.charCodeAt(m)<<16|(_>m+1?r.charCodeAt(m+1)<<8:0)|(_>m+2?r.charCodeAt(m+2):0),h=0;4>h;h++)n+=8*m+6*h>8*r.length?b64pad:d.charAt(f>>>6*(3-h)&63);return n}function rstr2any(r,t){var d,n,_,m,f,h=t.length,e=Array(Math.ceil(r.length/2));for(d=0;d<e.length;d++)e[d]=r.charCodeAt(2*d)<<8|r.charCodeAt(2*d+1);var a=Math.ceil(8*r.length/(Math.log(t.length)/Math.log(2))),i=Array(a);for(n=0;a>n;n++){for(f=Array(),m=0,d=0;d<e.length;d++)m=(m<<16)+e[d],_=Math.floor(m/h),m-=_*h,(f.length>0||_>0)&&(f[f.length]=_);i[n]=m,e=f}var o="";for(d=i.length-1;d>=0;d--)o+=t.charAt(i[d]);return o}function str2rstr_utf8(r){for(var t,d,n="",_=-1;++_<r.length;)t=r.charCodeAt(_),d=_+1<r.length?r.charCodeAt(_+1):0,t>=55296&&56319>=t&&d>=56320&&57343>=d&&(t=65536+((1023&t)<<10)+(1023&d),_++),127>=t?n+=String.fromCharCode(t):2047>=t?n+=String.fromCharCode(192|t>>>6&31,128|63&t):65535>=t?n+=String.fromCharCode(224|t>>>12&15,128|t>>>6&63,128|63&t):2097151>=t&&(n+=String.fromCharCode(240|t>>>18&7,128|t>>>12&63,128|t>>>6&63,128|63&t));return n}function str2rstr_utf16le(r){for(var t="",d=0;d<r.length;d++)t+=String.fromCharCode(255&r.charCodeAt(d),r.charCodeAt(d)>>>8&255);return t}function str2rstr_utf16be(r){for(var t="",d=0;d<r.length;d++)t+=String.fromCharCode(r.charCodeAt(d)>>>8&255,255&r.charCodeAt(d));return t}function rstr2binl(r){for(var t=Array(r.length>>2),d=0;d<t.length;d++)t[d]=0;for(var d=0;d<8*r.length;d+=8)t[d>>5]|=(255&r.charCodeAt(d/8))<<d%32;return t}function binl2rstr(r){for(var t="",d=0;d<32*r.length;d+=8)t+=String.fromCharCode(r[d>>5]>>>d%32&255);return t}function binl_md5(r,t){r[t>>5]|=128<<t%32,r[(t+64>>>9<<4)+14]=t;for(var d=1732584193,n=-271733879,_=-1732584194,m=271733878,f=0;f<r.length;f+=16){var h=d,e=n,a=_,i=m;d=md5_ff(d,n,_,m,r[f+0],7,-680876936),m=md5_ff(m,d,n,_,r[f+1],12,-389564586),_=md5_ff(_,m,d,n,r[f+2],17,606105819),n=md5_ff(n,_,m,d,r[f+3],22,-1044525330),d=md5_ff(d,n,_,m,r[f+4],7,-176418897),m=md5_ff(m,d,n,_,r[f+5],12,1200080426),_=md5_ff(_,m,d,n,r[f+6],17,-1473231341),n=md5_ff(n,_,m,d,r[f+7],22,-45705983),d=md5_ff(d,n,_,m,r[f+8],7,1770035416),m=md5_ff(m,d,n,_,r[f+9],12,-1958414417),_=md5_ff(_,m,d,n,r[f+10],17,-42063),n=md5_ff(n,_,m,d,r[f+11],22,-1990404162),d=md5_ff(d,n,_,m,r[f+12],7,1804603682),m=md5_ff(m,d,n,_,r[f+13],12,-40341101),_=md5_ff(_,m,d,n,r[f+14],17,-1502002290),n=md5_ff(n,_,m,d,r[f+15],22,1236535329),d=md5_gg(d,n,_,m,r[f+1],5,-165796510),m=md5_gg(m,d,n,_,r[f+6],9,-1069501632),_=md5_gg(_,m,d,n,r[f+11],14,643717713),n=md5_gg(n,_,m,d,r[f+0],20,-373897302),d=md5_gg(d,n,_,m,r[f+5],5,-701558691),m=md5_gg(m,d,n,_,r[f+10],9,38016083),_=md5_gg(_,m,d,n,r[f+15],14,-660478335),n=md5_gg(n,_,m,d,r[f+4],20,-405537848),d=md5_gg(d,n,_,m,r[f+9],5,568446438),m=md5_gg(m,d,n,_,r[f+14],9,-1019803690),_=md5_gg(_,m,d,n,r[f+3],14,-187363961),n=md5_gg(n,_,m,d,r[f+8],20,1163531501),d=md5_gg(d,n,_,m,r[f+13],5,-1444681467),m=md5_gg(m,d,n,_,r[f+2],9,-51403784),_=md5_gg(_,m,d,n,r[f+7],14,1735328473),n=md5_gg(n,_,m,d,r[f+12],20,-1926607734),d=md5_hh(d,n,_,m,r[f+5],4,-378558),m=md5_hh(m,d,n,_,r[f+8],11,-2022574463),_=md5_hh(_,m,d,n,r[f+11],16,1839030562),n=md5_hh(n,_,m,d,r[f+14],23,-35309556),d=md5_hh(d,n,_,m,r[f+1],4,-1530992060),m=md5_hh(m,d,n,_,r[f+4],11,1272893353),_=md5_hh(_,m,d,n,r[f+7],16,-155497632),n=md5_hh(n,_,m,d,r[f+10],23,-1094730640),d=md5_hh(d,n,_,m,r[f+13],4,681279174),m=md5_hh(m,d,n,_,r[f+0],11,-358537222),_=md5_hh(_,m,d,n,r[f+3],16,-722521979),n=md5_hh(n,_,m,d,r[f+6],23,76029189),d=md5_hh(d,n,_,m,r[f+9],4,-640364487),m=md5_hh(m,d,n,_,r[f+12],11,-421815835),_=md5_hh(_,m,d,n,r[f+15],16,530742520),n=md5_hh(n,_,m,d,r[f+2],23,-995338651),d=md5_ii(d,n,_,m,r[f+0],6,-198630844),m=md5_ii(m,d,n,_,r[f+7],10,1126891415),_=md5_ii(_,m,d,n,r[f+14],15,-1416354905),n=md5_ii(n,_,m,d,r[f+5],21,-57434055),d=md5_ii(d,n,_,m,r[f+12],6,1700485571),m=md5_ii(m,d,n,_,r[f+3],10,-1894986606),_=md5_ii(_,m,d,n,r[f+10],15,-1051523),n=md5_ii(n,_,m,d,r[f+1],21,-2054922799),d=md5_ii(d,n,_,m,r[f+8],6,1873313359),m=md5_ii(m,d,n,_,r[f+15],10,-30611744),_=md5_ii(_,m,d,n,r[f+6],15,-1560198380),n=md5_ii(n,_,m,d,r[f+13],21,1309151649),d=md5_ii(d,n,_,m,r[f+4],6,-145523070),m=md5_ii(m,d,n,_,r[f+11],10,-1120210379),_=md5_ii(_,m,d,n,r[f+2],15,718787259),n=md5_ii(n,_,m,d,r[f+9],21,-343485551),d=safe_add(d,h),n=safe_add(n,e),_=safe_add(_,a),m=safe_add(m,i)}return Array(d,n,_,m)}function md5_cmn(r,t,d,n,_,m){return safe_add(bit_rol(safe_add(safe_add(t,r),safe_add(n,m)),_),d)}function md5_ff(r,t,d,n,_,m,f){return md5_cmn(t&d|~t&n,r,t,_,m,f)}function md5_gg(r,t,d,n,_,m,f){return md5_cmn(t&n|d&~n,r,t,_,m,f)}function md5_hh(r,t,d,n,_,m,f){return md5_cmn(t^d^n,r,t,_,m,f)}function md5_ii(r,t,d,n,_,m,f){return md5_cmn(d^(t|~n),r,t,_,m,f)}function safe_add(r,t){var d=(65535&r)+(65535&t),n=(r>>16)+(t>>16)+(d>>16);return n<<16|65535&d}function bit_rol(r,t){return r<<t|r>>>32-t}var hexcase=0,b64pad="";
	exports.hex_md5 = hex_md5; // Make this method available in global
	
	var toastContainer = document.querySelector(".toast__container");

	// To show notification
	function toast(msg, options) {
		if (!msg) return;

		options = options || {timeout:3000, type: "info"};
		// type = error, done, warning, help, info
		options.timeout = options.timeout!==undefined?options.timeout:3000;
		options.type = options.type!==undefined?options.type:"info";

		var toastMsg = document.createElement("div");
		toastMsg.className = "toast__msg "+options.type;
		var icon = document.createElement("i");
		icon.className = "material-icons";
		icon.textContent = options.type;
		var span = document.createElement("span");
		span.textContent = msg;
		toastMsg.appendChild(icon);
		toastMsg.appendChild(span);
		toastContainer.appendChild(toastMsg);

		// Show toast for 3secs and hide it
		setTimeout(function () {
			toastMsg.classList.add("toast__msg--hide");
		}, options.timeout);

		// Remove the element after hiding
		toastMsg.addEventListener("transitionend", function (event) {
			event.target.parentNode.removeChild(event.target);
		});
	}
	exports.toast = toast; // Make this method available in global
	
	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return "";
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
	exports.getParameterByName = getParameterByName; // Make this method available in global
	
	function sprintf(string, options) {
		return string.replace(/%s/g, options);
	}
	exports.sprintf = sprintf; // Make this method available in global
})(typeof window === 'undefined' ? module.exports : window);
	
(function() {
	"use strict";
/*
 * *********************************** Tooling functions ***********************************
 */
	app.isLtr = function() {
		return app.getSetting('settings.isLtr')!==null?!!JSON.parse(String( app.getSetting('settings.isLtr') ).toLowerCase()):true;
	};

	app.preloadImage = function(img) {
		img.setAttribute('src', img.getAttribute('data-src'));
	};

	app.urlBase64ToUint8Array = function(base64String) {
		const padding = '='.repeat((4 - base64String.length % 4) % 4);
		const base64 = (base64String + padding)  .replace(/\-/g, '+') .replace(/_/g, '/');
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (var i=0; i<rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); };
		return outputArray;
	};
	
	app.nl2br = function (str, isXhtml) {
		var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	};
	
	app.fetchStatusHandler = function(response) {
		if ( response.headers.get('X-RateLimit-Limit') && response.headers.get('X-RateLimit-Remaining') ) {
			app.RateLimit.Limit = response.headers.get('X-RateLimit-Limit');
			app.RateLimit.Remaining = response.headers.get('X-RateLimit-Remaining');
			app.RateLimit.Used = app.RateLimit.Limit - app.RateLimit.Remaining;
		}
		if (response.status === 200 || response.status === 201) {
			return response;
		} else if (response.status === 204) {
			return response;
		} else if (response.status === 400) {
			toast("Bad Request.", {timeout:3000, type: "error"});
			return response;
			//throw new Error('Bad Request.');
		} else if (response.status === 401 || response.status === 403) {
			app.sessionExpired();
			return response;
			//throw new Error(response.statusText);
		} else if (response.status === 404) {
			toast("There is an unknown resource that can't be loaded.", {timeout:3000, type: "error"});
			return response;
			//throw new Error(response.statusText);
		} else if (response.status === 409) {
			toast("Revision is conflictual.", {timeout:3000, type: "error"});
			return response;
			//throw new Error('Revision is conflictual.');
		} else if (response.status === 429) {
			toast("Oups, over quota.", {timeout:3000, type: "error"});
			return response;
		} else {
			throw new Error(response.statusText);
		}
	};
	
	app.fetchStatusHandlerOnUser = function(response) {
		if ( response.headers.get('X-RateLimit-Limit') && response.headers.get('X-RateLimit-Remaining') ) {
			app.RateLimit.Limit = response.headers.get('X-RateLimit-Limit');
			app.RateLimit.Remaining = response.headers.get('X-RateLimit-Remaining');
			app.RateLimit.Used = app.RateLimit.Limit - app.RateLimit.Remaining;
		}
		if (response.status === 200 || response.status === 201) {
			return response;
		} else if (response.status === 409) {
			throw new Error('Email already exists on t6, please Sign in.');
		} else {
			throw new Error(response.statusText);
		}
	};

	app.getUniqueId = function() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};
	
	app.setSetting = function(name, value) {
		localStorage.setItem(name, value);
	};
	
	app.getSetting = function(name) {
		return localStorage.getItem(name);
	};

/*
 * *********************************** Application functions ***********************************
 */
	app.setLoginAction = function() {
		for (var i in app.buttons.loginButtons) {
			if ( app.buttons.loginButtons[i].childElementCount > -1 ) {
				app.buttons.loginButtons[i].removeEventListener('click', app.onLoginButtonClick, false);
				app.buttons.loginButtons[i].addEventListener('click', app.onLoginButtonClick, false);
			}
		}
	};
	
	app.onLoginButtonClick = function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		//myForm.querySelector("form.signin button.login_button").insertAdjacentHTML("afterbegin", "<span class='mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active'></span>");
		myForm.querySelector("form.signin button.login_button i.material-icons").textContent = "cached";
		myForm.querySelector("form.signin button.login_button i.material-icons").classList.add("animatedIcon");
		componentHandler.upgradeDom();
		
		var username = myForm.querySelector("form.signin input[name='username']").value;
		var password = myForm.querySelector("form.signin input[name='password']").value;
		app.auth = {"username":username, "password":password};
		app.authenticate();
		evt.preventDefault();
	};
	
	app.onStatusButtonClick = function(evt) {
		app.getStatus();
		app.setSection('status');
		if (evt) evt.preventDefault();
	};
	
	app.onSettingsButtonClick = function(evt) {
		app.setSection('settings');
		if (evt) evt.preventDefault();
	};
	
	app.onDocsButtonClick = function(evt) {
		app.setSection('docs');
		if (evt) evt.preventDefault();
	};
	
	app.onTermsButtonClick = function(evt) {
		app.getTerms();
		app.setSection('terms');
		if (evt) evt.preventDefault();
	};
	
	app.setSignupAction = function() {
		for (var i in app.buttons.user_create) {
			if ( app.buttons.user_create[i].childElementCount > -1 ) {
				app.buttons.user_create[i].addEventListener('click', app.onSignupButtonClick, false);
			}
		}
	};
	
	app.setPasswordResetAction = function() {
		for (var i in app.buttons.user_setpassword) {
			if ( app.buttons.user_setpassword[i].childElementCount > -1 ) {
				app.buttons.user_setpassword[i].addEventListener('click', app.onPasswordResetButtonClick, false);
			}
		}
	};
	
	app.setForgotAction = function() {
		for (var i in app.buttons.user_forgot) {
			if ( app.buttons.user_forgot[i].childElementCount > -1 ) {
				app.buttons.user_forgot[i].addEventListener('click', app.onForgotPasswordButtonClick, false);
			}
		}
	};
	
	app.onSignupButtonClick = function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		//myForm.querySelector("form.signup button.createUser").insertAdjacentHTML("afterbegin", "<span class='mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active'></span>");
		myForm.querySelector("form.signup button.createUser i.material-icons").textContent = "cached";
		myForm.querySelector("form.signup button.createUser i.material-icons").classList.add("animatedIcon");
		componentHandler.upgradeDom();
		
		var email = myForm.querySelector("form.signup input[name='email']").value;
		var terms = myForm.querySelector("form.signup input[name='terms']").checked;
		if ( email && email.match(app.patterns.username) ) {
			if ( terms ) {
				var firstName = myForm.querySelector("form.signup input[name='firstName']").value;
				var lastName = myForm.querySelector("form.signup input[name='lastName']").value;
				var postData = {"email":email, "firstName":firstName, "lastName":lastName};
				var myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/json");
				var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(postData) };
				var url = app.baseUrl+"/"+app.api_version+"/users";
				
				fetch(url, myInit)
				.then(
					app.fetchStatusHandlerOnUser
				).then(function(fetchResponse){
					return fetchResponse.json();
				})
				.then(function(response) {
					app.setSetting('notifications.email', response.user.data.attributes.email);
					app.setSetting('notifications.unsubscription_token', response.user.data.attributes.unsubscription_token);
					toast('Welcome, you should have received an email to set your password.', {timeout:3000, type: 'done'});
					app.setSection('manage_notifications');
				})
				.catch(function (error) {
					toast('We can\'t process your signup. Please resubmit the form later! '+error, {timeout:3000, type: 'warning'});
				});
			} else {
				toast('Please read Terms & Conditions, you will be able to manage your privacy in the step right after.', {timeout:3000, type: 'warning'});
				document.querySelectorAll(".mdl-spinner").forEach( function(e) { e.parentNode.removeChild(e);} );
			}
		} else {
			toast('We can\'t process your signup. Please check your inputs.', {timeout:3000, type: 'warning'});
			document.querySelectorAll(".mdl-spinner").forEach( function(e) { e.parentNode.removeChild(e);} );
		}
		evt.preventDefault();
	};
	
	app.onPasswordResetButtonClick = function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		//myForm.querySelector("form.resetpassword button.setPassword").insertAdjacentHTML("afterbegin", "<span class='mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active'></span>");
		myForm.querySelector("form.resetpassword button.setPassword i.material-icons").textContent = "cached";
		myForm.querySelector("form.resetpassword button.setPassword i.material-icons").classList.add("animatedIcon");
		componentHandler.upgradeDom();
		
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
				app.fetchStatusHandler
			).then(function(fetchResponse){
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection('login');
				toast('Your password has been reset; please login again.', {timeout:3000, type: 'done'});
			})
			.catch(function (error) {
				if ( dataLayer !== undefined ) {
					dataLayer.push({
						'eventCategory': 'Interaction',
						'eventAction': 'password',
						'eventLabel': 'reset',
						'eventValue': 'We can\'t process your password reset. Please resubmit the form later!',
						'event': 'Error'
					});
				}
				toast('We can\'t process your password reset. Please resubmit the form later!', {timeout:3000, type: 'warning'});
			});
		} else {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					'eventCategory': 'Interaction',
					'eventAction': 'password',
					'eventLabel': 'reset',
					'eventValue': 'We can\'t process your password reset.',
					'event': 'Error'
				});
			}
			toast('We can\'t process your password reset.', {timeout:3000, type: 'warning'});
			document.querySelectorAll(".mdl-spinner").forEach( function(e) { e.parentNode.removeChild(e);} );
		}
		evt.preventDefault();
	};
	
	app.onForgotPasswordButtonClick = function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		//myForm.querySelector("form.forgotpassword button.forgotPassword").insertAdjacentHTML("afterbegin", "<span class='mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active'></span>");
		myForm.querySelector("form.forgotpassword button.forgotPassword i.material-icons").textContent = "cached";
		myForm.querySelector("form.forgotpassword button.forgotPassword i.material-icons").classList.add("animatedIcon");
		componentHandler.upgradeDom();
		
		var email = myForm.querySelector("form.forgotpassword input[name='email']").value;
		if ( email && email.match(app.patterns.username) ) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify({"email":email}) };
			var url = app.baseUrl+"/"+app.api_version+"/users/instruction/";
			
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection('login');
				toast('Instructions has been sent to your email.', {timeout:3000, type: 'done'});
			})
			.catch(function (error) {
				if ( dataLayer !== undefined ) {
					dataLayer.push({
						'eventCategory': 'Interaction',
						'eventAction': 'password',
						'eventLabel': 'forgot',
						'eventValue': 'We can\'t process your password reset. Please resubmit the form later!',
						'event': 'Error'
					});
				}
				toast('We can\'t process your request. Please resubmit the form later!', {timeout:3000, type: 'warning'});
			});
		} else {
			toast('We can\'t send the instructions. Please check your inputs.', {timeout:3000, type: 'warning'});
			document.querySelectorAll(".mdl-spinner").forEach( function(e) { e.parentNode.removeChild(e);} );
		}
		evt.preventDefault();
	};
	
	app.askPermission = function() {
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
	};
	
	app.registerServiceWorker = function() {
		return navigator.serviceWorker.register('/service-worker.js')
		.then(function(registration) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[ServiceWorker] Registered');
			}
			return registration;
		})
		.catch(function(err) {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					'eventCategory': 'Interaction',
					'eventAction': 'ServiceWorker',
					'eventLabel': 'registration',
					'eventValue': '[ServiceWorker] error occured...',
					'event': 'Error'
				});
			}
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[ServiceWorker] error occured...'+ err);
			}
		});
	};
	
	app.subscribeUserToPush = function() {
		return app.registerServiceWorker()
		.then(function(registration) {
			const subscribeOptions = {
				userVisibleOnly: true,
				applicationServerKey: app.urlBase64ToUint8Array(app.applicationServerKey)
			};
			if ( registration ) {
				return registration.pushManager.subscribe(subscribeOptions);
			} else {
				return false;
			}
		})
		.then(function(pushSubscription) {
			var j = JSON.parse(JSON.stringify(pushSubscription));
			if ( j && j.keys ) {
				app.setSetting('settings.pushSubscription.endpoint', j.endpoint);
				app.setSetting('settings.pushSubscription.keys.p256dh', j.keys.p256dh);
				app.setSetting('settings.pushSubscription.keys.auth', j.keys.auth);
			}
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[pushSubscription]', j);
			}
			return pushSubscription;
		})
		.catch(function (error) {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					'eventCategory': 'Interaction',
					'eventAction': 'pushSubscription',
					'eventLabel': 'pushSubscription',
					'eventValue': 'error',
					'event': 'Error'
				});
			}
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[pushSubscription]', 'subscribeUserToPush'+error);
			}
		});
	};
	
	app.onSaveProfileButtonClick = function(evt) {
		var firstName = document.getElementById("firstName").value;
		var lastName = document.getElementById("lastName").value;

		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'PUT', headers: myHeaders, body: JSON.stringify({"firstName":firstName, "lastName":lastName}) };
		var url = app.baseUrl+"/"+app.api_version+"/users/"+localStorage.getItem('currentUserId');
		
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			localStorage.setItem('currentUserName', firstName+" "+lastName);
			app.setDrawer();
			toast('Your details have been updated.', {timeout:3000, type: 'done'});
		})
		.catch(function (error) {
			toast('We can\'t process your modifications. Please resubmit the form later!', {timeout:3000, type: 'warning'});
		});
	};
	
	app.refreshButtonsSelectors = function() {
		if ( componentHandler ) componentHandler.upgradeDom();
		app.buttons = {
			// signin_button
			// _button
			notification: document.querySelector('button#notification'),

			menuTabBar: document.querySelectorAll('.mdl-layout__tab-bar a'),
			status: document.querySelectorAll('.statusButton'),
			settings: document.querySelectorAll('.settingsButton'),
			docs: document.querySelectorAll('.docsButton'),
			terms: document.querySelectorAll('.termsButton'),
			notifications: document.querySelectorAll('form.notifications input.mdl-checkbox__input'),
				
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
			saveFlow: document.querySelector('#flow section.fixedActionButtons button.save-button'),
			backFlow: document.querySelector('#flow section.fixedActionButtons button.back-button'),
			editFlow2: document.querySelector('#flow section.fixedActionButtons button.edit-button'),
			listFlow: document.querySelector('#flow section.fixedActionButtons button.list-button'),
			
			deleteDashboard: document.querySelectorAll('#dashboards .delete-button'),
			editDashboard: document.querySelectorAll('#dashboards .edit-button'),
			createDashboard: document.querySelector('#dashboards button#createDashboard'),
			addDashboard: document.querySelector('#dashboard_add section.fixedActionButtons button.add-button'),
			addDashboardBack: document.querySelector('#dashboard_add section.fixedActionButtons button.back-button'),
			backDashboard: document.querySelector('#dashboard section.fixedActionButtons button.back-button'),
			saveDashboard: document.querySelector('#dashboard section.fixedActionButtons button.save-button'),
			editDashboard2: document.querySelector('#dashboard section.fixedActionButtons button.edit-button'),
			listDashboard: document.querySelector('#dashboard section.fixedActionButtons button.list-button'),
			
			deleteSnippet: document.querySelectorAll('#snippets .delete-button'),
			editSnippet: document.querySelectorAll('#snippets .edit-button'),
			createSnippet: document.querySelector('#snippets button#createSnippet'),
			addSnippet: document.querySelector('#snippet_add section.fixedActionButtons button.add-button'),
			addSnippetBack: document.querySelector('#snippet_add section.fixedActionButtons button.back-button'),
			backSnippet: document.querySelector('#snippet section.fixedActionButtons button.back-button'),
			saveSnippet: document.querySelector('#snippet section.fixedActionButtons button.save-button'),
			listSnippet: document.querySelector('#snippet section.fixedActionButtons button.list-button'),
			editSnippet2: document.querySelector('#snippet section.fixedActionButtons button.edit-button'),
			
			deleteRule: document.querySelectorAll('#rules .delete-button'),
			editRule: document.querySelectorAll('#rules .edit-button'),
			createRule: document.querySelector('#rules button#createRule'),
			addRule: document.querySelector('#rule_add section.fixedActionButtons button.add-button'),
			addRuleBack: document.querySelector('#rule_add section.fixedActionButtons button.back-button'),
			backRule: document.querySelector('#rule section.fixedActionButtons button.back-button'),
			saveRule: document.querySelector('#rule section.fixedActionButtons button.save-button'),
			listRule: document.querySelector('#rule section.fixedActionButtons button.list-button'),
			editRule2: document.querySelector('#rule section.fixedActionButtons button.edit-button'),
			
			deleteMqtt: document.querySelectorAll('#mqtts .delete-button'),
			editMqtt: document.querySelectorAll('#mqtts .edit-button'),
			createMqtt: document.querySelector('#mqtts button#createMqtt'),
		};
	};
	
	app.refreshContainers = function() {
		app.containers = {
			spinner: document.querySelector('section#loading-spinner'),
			index: document.querySelector('section#index'),
			profile: document.querySelector('section#profile'),
			settings: document.querySelector('section#settings'),
			status: document.querySelector('section#status'),
			terms: document.querySelector('section#terms'),
			docs: document.querySelector('section#docs'),
			usersList: document.querySelector('section#users-list'),
			
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
			
			rules: document.querySelector('section#rules'),
			rule: document.querySelector('section#rule'),
			rule_add: document.querySelector('section#rule_add'),
			
			mqtts: document.querySelector('section#mqtts'),
			mqtt: document.querySelector('section#mqtt'),
			mqtt_add: document.querySelector('section#mqtt_add'),
			
			menuIconElement: document.querySelector('.mdl-layout__drawer-button'),
			menuElement: document.getElementById('drawer'),
			menuOverlayElement: document.querySelector('.menu__overlay'),
			drawerObfuscatorElement: document.getElementsByClassName('mdl-layout__obfuscator')[0],
			menuItems: document.querySelectorAll('.mdl-layout__drawer nav a.mdl-navigation__link'),
			menuTabItems: document.querySelectorAll('.mdl-layout__tab-bar a.mdl-navigation__link.mdl-layout__tab'),
		}
	};
	app.refreshContainers();

	app.setExpandAction = function() {
		componentHandler.upgradeDom();
		app.refreshButtonsSelectors();
		for (var i in app.buttons.expandButtons) {
			if ( (app.buttons.expandButtons[i]).childElementCount > -1 ) {
				(app.buttons.expandButtons[i]).addEventListener('click', app.expand, false);
			}
		}
	};
	
	app.expand = function(evt) {
		var id = (evt.target.parentElement).getAttribute('for')!=null?(evt.target.parentElement).getAttribute('for'):(evt.target).getAttribute('for');
		if ( id != null ) {
			document.getElementById(id).classList.toggle('hidden');
			if ( evt.target.parentElement.querySelector('i.material-icons').innerHTML == 'expand_more' ) {
				evt.target.parentElement.querySelector('i.material-icons').innerHTML = 'expand_less';
			} else {
				evt.target.parentElement.querySelector('i.material-icons').innerHTML = 'expand_more';
			}
		}
	};
	
	app.setSection = function(section, direction) {
		section = section.split("?")[0];
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('[setSection]', section);
		}
		window.scrollTo(0, 0);
		if ( section === 'public-object' ) {
			var urlParams = new URLSearchParams(window.location.search); // .toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] == "" ) {
					app.setSection('objects'); // TODO, recursive?
				} else if (params['id'] ) {
					app.resources.objects.display(params['id'], false, false, true);
				}
			}
		} else if ( section === 'object' ) {
			var urlParams = new URLSearchParams(window.location.search); // .toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] == "" ) {
					app.setSection('objects'); // TODO, recursive?
				} else if (params['id'] ) {
					app.resources.objects.display(params['id'], false, false, false);
				}
			}
		} else if ( section === 'object_add' ) {
			app.resources.objects.displayAdd(app.defaultResources.object, true, false, false);
		} else if ( section === 'edit-object' ) {
			var urlParams = new URLSearchParams(window.location.search); // .toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] == "" ) {
					app.setSection('objects'); // TODO, recursive?
				} else if (params['id'] ) {
					app.resources.objects.display(params['id'], false, true, false);
				}
			}
		} else if ( section === 'flow' ) {
			var urlParams = new URLSearchParams(window.location.search); // .toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] == "" ) {
					app.setSection('flows'); // TODO, recursive?
				} else if (params['id'] ) {
					app.resources.flows.display(params['id'], false, false, false);
				}
			}
		} else if ( section === 'flow_add' ) {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			app.resources.flows.displayAdd(app.defaultResources.flow, true, false, false);
		} else if ( section === 'snippet' ) {
			var urlParams = new URLSearchParams(window.location.search); // .toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] == "" ) {
					app.setSection('snippets'); // TODO, recursive?
				} else if (params['id'] ) {
					app.resources.dashboards.display(params['id'], false, false, false);
				}
			}
		} else if ( section === 'snippet_add' ) {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			app.resources.snippets.displayAdd(app.defaultResources.snippet, true, false, false);
		} else if ( section === 'dashboard' ) {
			var urlParams = new URLSearchParams(window.location.search); // .toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] == "" ) {
					app.setSection('dashboards'); // TODO, recursive?
				} else if (params['id'] ) {
					app.resources.dashboards.display(params['id'], false, false, false);
				}
			}
		} else if ( section === 'dashboard_add' ) {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			app.resources.dashboards.displayAdd(app.defaultResources.dashboard, true, false, false);
		} else if ( section === 'rule' ) {
			var urlParams = new URLSearchParams(window.location.search); // .toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] == "" ) {
					app.setSection('rules'); // TODO, recursive?
				} else if (params['id'] ) {
					app.resources.rules.display(params['id'], false, false, false);
				}
			}
		} else if ( section === 'rule_add' ) {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			app.resources.rules.displayAdd(app.defaultResources.rule, true, false, false);
		} else if ( section === 'mqtt' ) {
			var urlParams = new URLSearchParams(window.location.search); // .toString();
			var params = {};
			if ( Array.from(urlParams).length > -1 ) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if ( params['id'] == "" ) {
					app.setSection('mqtts'); // TODO, recursive?
				} else if (params['id'] ) {
					app.resources.mqtts.display(params['id'], false, false, false);
				}
			}
		} else if ( section === 'mqtt_add' ) {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			app.resources.mqtts.displayAdd(app.defaultResources.mqtt, true, false, false);
		} else if ( section === 'profile' ) {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			(app.containers.profile).querySelector('.page-content').innerHTML = "";
			app.fetchProfile();
		} else if ( section === 'settings' ) {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			app.getSettings();
		}  else if ( section === 'login' ) {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			app.displayLoginForm( document.querySelector('#login').querySelector('.page-content') );
		} else if ( section === 'users-list' ) {
			app.getUsersList();
		} else {
			document.title = app.sectionsPageTitles[section]!==undefined?app.sectionsPageTitles[section]:app.defaultPageTitle;
			window.location.hash = '#'+section;
			app.fetchItemsPaginated(section, undefined, app.itemsPage[section], app.itemsSize[section]);
		}

		app.refreshButtonsSelectors();
		var act = document.querySelectorAll('section.is-active');
		for (var i in act) {
			if ( (act[i]).childElementCount > -1 ) {
				act[i].classList.remove('is-active');
				act[i].classList.add('is-inactive');
			}
		}
		for (var i in app.buttons.menuTabBar) {
			if ( (app.buttons.menuTabBar[i]).childElementCount > -1 ) {
				app.buttons.menuTabBar[i].classList.remove('is-active');
				if ( app.buttons.menuTabBar[i].getAttribute("for") == section || app.buttons.menuTabBar[i].getAttribute("for") == section+'s' ) {
					app.buttons.menuTabBar[i].classList.add('is-active');
				}
			}
		}
		if ( document.querySelector('#'+section) ) {
			if ( direction == 'ltr' ) {
				document.querySelector('#'+section).style.transform = "translateX(-120%) !important";
			} else {
				document.querySelector('#'+section).style.transform = "translateX(120%) !important";
			}
			document.querySelector('#'+section).classList.remove('is-inactive');
			document.querySelector('#'+section).classList.add('is-active');
			if ( !app.isLogged && (
					!document.querySelector('#'+section).querySelector('.page-content form.signin') &&
					section !== 'signup' &&
					section !== 'reset-password' &&
					section !== 'forgot-password' &&
					section !== 'settings' &&
					section !== 'docs' &&
					section !== 'terms' &&
					section !== 'manage_notifications'
				)
			) {
				app.displayLoginForm( document.querySelector('#'+section).querySelector('.page-content') );
			}
		}
		app.currentSection = section;
	};

	app.setItemsClickAction = function(type) {
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('DEBUG setItemsClickAction', type);
		}
		var items = document.querySelectorAll("[data-action='view']");
		for (var i in items) {
			if ( type == 'objects' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.currentTarget.parentNode.parentNode;
					item.classList.add('is-hover');
					app.resources.objects.display(item.dataset.id, false, false, false);
					evt.preventDefault();
				}, {passive: false,});
				
				var divs = (items[i]).querySelectorAll("div.mdl-list__item--three-line");
				Array.from(divs).forEach( function(div) {
					(div).addEventListener('click', function(evt) {
						var item = evt.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.objects.display(item.dataset.id, false, false, false);
						evt.preventDefault();
					}, {passive: false,});
				});
			} else if ( type == 'flows' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.currentTarget.parentNode.parentNode;
					item.classList.add('is-hover');
					app.resources.flows.display(item.dataset.id, false, false, false);
					evt.preventDefault();
				}, {passive: false,});
				
				var divs = (items[i]).querySelectorAll("div.mdl-list__item--three-line");
				Array.from(divs).forEach( function(div) {
					(div).addEventListener('click', function(evt) {
						var item = evt.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.flows.display(item.dataset.id, false, false, false);
						evt.preventDefault();
					}, {passive: false,});
				});
			} else if ( type == 'dashboards' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.currentTarget.parentNode.parentNode;
					item.classList.add('is-hover');
					app.resources.dashboards.display(item.dataset.id, false, false, false);
					evt.preventDefault();
				}, {passive: false,});
				
				var divs = (items[i]).querySelectorAll("div.mdl-list__item--three-line");
				Array.from(divs).forEach( function(div) {
					(div).addEventListener('click', function(evt) {
						var item = evt.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.dashboards.display(item.dataset.id, false, false, false);
						evt.preventDefault();
					}, {passive: false,});
				});
			} else if ( type == 'snippets' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.currentTarget.parentNode.parentNode;
					item.classList.add('is-hover');
					app.resources.snippets.display(item.dataset.id, false, false, false);
					evt.preventDefault();
				}, {passive: false,});
				
				var divs = (items[i]).querySelectorAll("div.mdl-list__item--three-line");
				Array.from(divs).forEach( function(div) {
					(div).addEventListener('click', function(evt) {
						var item = evt.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.snippets.display(item.dataset.id, false, false, false);
						evt.preventDefault();
					}, {passive: false,});
				});
			} else if ( type == 'rules' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.currentTarget.parentNode.parentNode;
					item.classList.add('is-hover');
					app.resources.rules.display(item.dataset.id, false, false, false);
					evt.preventDefault();
				}, {passive: false,});
				
				var divs = (items[i]).querySelectorAll("div.mdl-list__item--three-line");
				Array.from(divs).forEach( function(div) {
					(div).addEventListener('click', function(evt) {
						var item = evt.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.rules.display(item.dataset.id, false, false, false);
						evt.preventDefault();
					}, {passive: false,});
				});
			}
		};
		// swapDate
		var swaps = document.querySelectorAll("button.swapDate");
		for (var s in swaps) {
			if ( (swaps[s]) !== undefined && (swaps[s]).childElementCount > -1 ) {
				(swaps[s]).addEventListener('click', function(evt) {
					var datasetid = evt.currentTarget.dataset.id;
					var createdElement = document.querySelector("div[data-id='"+datasetid+"'] span[data-date='created']").classList;
					var updatedElement = document.querySelector("div[data-id='"+datasetid+"'] span[data-date='updated']").classList;
					if ( createdElement.contains("visible") ) {
						createdElement.add('hidden');
						createdElement.remove('visible');
						updatedElement.add('visible');
						updatedElement.remove('hidden');
					} else {
						createdElement.add('visible');
						createdElement.remove('hidden');
						updatedElement.add('hidden');
						updatedElement.remove('visible');
					}
	
				}, {passive: false,});
			}
		};
		
		var lazys = document.querySelectorAll("button.lazyloading");
		for (var l in lazys) {
			if ( (lazys[l]) !== undefined && (lazys[l]).childElementCount > -1 ) {
				(lazys[l]).addEventListener('click', function(evt) {
					var size = evt.currentTarget.dataset.size;
					var page = evt.currentTarget.dataset.page;
					var type = evt.currentTarget.dataset.type;
					
					app.itemsPage[type] = page;
					app.itemsSize[type] = size;
					app.fetchItemsPaginated(type, undefined, app.itemsPage[type], app.itemsSize[type]);
				}, {passive: false,});
			}
		};
	};
	
	app.showModal = function() {
		dialog.style.display = 'block';
		dialog.style.position = 'fixed';
		dialog.style.top = '20%';
		dialog.style.zIndex = '9999';
	};
	
	app.hideModal = function() {
		dialog.style.display = 'none';
		dialog.style.zIndex = '-9999';
	};
	
	app.copyTextToClipboard = function(text, evt) {
		if ( !navigator.clipboard ) {
			var copyTextarea = evt.currentTarget.parentNode.querySelector('.copytextarea');
				copyTextarea.focus();
				copyTextarea.select();
			if ( document.execCommand('copy') ) {
				toast(text+' has been copied to clipboard.', {timeout:3000, type: 'done'});
				return true;
			} else {
				toast('Could not copy text: '+text, {timeout:5000, type: 'warning'});
				return false;
			}
		} else {
			navigator.clipboard.writeText(text).then(function() {
				toast(text+' has been copied to clipboard.', {timeout:3000, type: 'done'});
				return true;
			}, function(err) {
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					console.log('DEBUG clipboard', 'Could not copy text: ', err);
				}
				toast('Could not copy text: '+text, {timeout:5000, type: 'warning'});
				return false;
			});
		}
	};

	app.setListActions = function(type) {
		app.refreshButtonsSelectors();
		var dialog = document.getElementById('dialog');
		var copyButtons = document.querySelectorAll('.copy-button');
		
		for (var c=0;c<copyButtons.length;c++) {
			copyButtons[c].addEventListener('click', function(evt) {
				var myId = evt.currentTarget.dataset.id;
				app.copyTextToClipboard(myId, evt);
				evt.preventDefault();
			});
		}
		
		if ( type == 'objects' ) {
			for (var d=0;d<app.buttons.deleteObject.length;d++) {
				app.buttons.deleteObject[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete Object';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.target.parentNode.dataset.name+'\"?</p>'; //
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					app.showModal();
					var myId = evt.target.parentNode.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/objects/'+myId;
						fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							toast('Object has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Object has not been deleted.', {timeout:3000, type: "error"});
						});
						evt.preventDefault();
					});
				});
			}
			for (var e=0;e<app.buttons.editObject.length;e++) {
				//console.log(buttons.editObject[e]);
				app.buttons.editObject[e].addEventListener('click', function(evt) {
					app.resources.objects.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if ( type == 'flows' ) {
			for (var d=0;d<app.buttons.deleteFlow.length;d++) {
				//console.log(buttons.deleteFlow[d]);
				app.buttons.deleteFlow[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete Flow';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.target.parentNode.dataset.name+'\"? This action will remove all datapoints in the flow and can\'t be recovered.</p>';
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					app.showModal();
					var myId = evt.target.parentNode.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/flows/'+myId;
						fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							app.resources.flows.onDelete(myId);
							toast('Flow has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Flow has not been deleted.', {timeout:3000, type: "error"});
						});
						evt.preventDefault();
					});
				});
			}
			for (var e=0;e<app.buttons.editFlow.length;e++) {
				//console.log(buttons.editFlow[e]);
				app.buttons.editFlow[e].addEventListener('click', function(evt) {
					app.resources.flows.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if ( type == 'dashboards' ) {
			for (var d=0;d<app.buttons.deleteDashboard.length;d++) {
				//console.log(buttons.deleteDashboard[d]);
				app.buttons.deleteDashboard[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete Dashboard';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.target.parentNode.dataset.name+'\"?</p>';
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					app.showModal();
					var myId = evt.target.parentNode.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/dashboards/'+myId;
						fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							toast('Dashboard has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Dashboard has not been deleted.', {timeout:3000, type: "error"});
						});
						evt.preventDefault();
					});
				});
			}
			for (var d=0;d<app.buttons.editDashboard.length;d++) {
				//console.log(buttons.editDashboard[d]);
				app.buttons.editDashboard[d].addEventListener('click', function(evt) {
					app.resources.dashboards.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if ( type == 'snippets' ) {
			for (var d=0;d<app.buttons.deleteSnippet.length;d++) {
				app.buttons.deleteSnippet[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete Snippet';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.target.parentNode.dataset.name+'\"? This action will remove all reference to the Snippet in Dashboards.</p>';
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					app.showModal();
					var myId = evt.target.parentNode.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/snippets/'+myId;
						fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							app.resources.snippets.onDelete(myId);
							toast('Snippet has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Snippet has not been deleted.', {timeout:3000, type: "error"});
						});
						evt.preventDefault();
					});
				});
			}
			for (var s=0;s<app.buttons.editSnippet.length;s++) {
				app.buttons.editSnippet[s].addEventListener('click', function(evt) {
					app.resources.snippets.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if ( type == 'rules' ) {
			for (var d=0;d<app.buttons.deleteRule.length;d++) {
				app.buttons.deleteRule[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">'+app.icons.delete_question+'</i> Delete rule';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.target.parentNode.dataset.name+'\"? This action will remove all reference to the Rule in t6.</p>';
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button btn danger yes-button">Yes</button> <button class="mdl-button cancel-button">No, Cancel</button>';
					
					app.showModal();
					var myId = evt.target.parentNode.dataset.id;
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(e) {
						app.hideModal();
						evt.preventDefault();
					});
					dialog.querySelector('.yes-button').addEventListener('click', function(e) {
						app.hideModal();
						var myHeaders = new Headers();
						myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = app.baseUrl+'/'+app.api_version+'/rules/'+myId;
						fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse){ 
							return fetchResponse.json();
						})
						.then(function(response) {
							document.querySelector('[data-id="'+myId+'"]').classList.add('removed');
							toast('Rule has been deleted.', {timeout:3000, type: 'done'});
						})
						.catch(function (error) {
							toast('Rule has not been deleted.', {timeout:3000, type: "error"});
						});
						evt.preventDefault();
					});
				});
			}
			for (var s=0;s<app.buttons.editRule.length;s++) {
				app.buttons.editRule[s].addEventListener('click', function(evt) {
					app.resources.rules.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if ( type == 'mqtts' ) {
			// TODO
		}
	};
	
	app.getSubtitle = function(subtitle) {
		var node = "<section class='mdl-grid mdl-cell--12-col md-primary md-subheader _md md-altTheme-theme sticky' role='heading'>";
		node += "	<div class='md-subheader-inner'>";
		node += "		<div class='mdl-subheader-content'>";
		node += "			<span class='ng-scope'>"+subtitle+"</span>";
		node += "		</div>";
		node += "	</div>";
		node += "</section>";
		return node;
	};
	
	app.getUnits = function() {
		if ( localStorage.getItem('units') == 'null' || !JSON.parse(localStorage.getItem('units')) ) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var url = app.baseUrl+'/'+app.api_version+'/units/';
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				if ( response.data ) {
					for (var i=0; i < (response.data).length ; i++ ) {
						var u = response.data[i];
						app.units.push( {name: u.id, value:u.attributes.type+' '+u.attributes.name, format: u.attributes.format} );
					}
					localStorage.setItem('units', JSON.stringify(app.units));
				}
			});
		}
	};
	
	app.getFlows = function() {
		if ( app.flows.length == 0 && (app.isLogged || localStorage.getItem('bearer')) ) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
			var myInit = { method: 'GET', headers: myHeaders };
			var url = app.baseUrl+'/'+app.api_version+'/flows/?size=99999';
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				if ( response.data ) {
					for (var i=0; i < (response.data).length ; i++ ) {
						var f = response.data[i];
						app.flows.push( {id: f.id, name:f.attributes.name, type: 'flows'} );
					}
					localStorage.setItem('flows', JSON.stringify(app.flows));
				}
			});
		}
	};
	
	app.getSnippets = function() {
		if ( app.snippets.length == 0 && (app.isLogged || localStorage.getItem('bearer')) ) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
			var myInit = { method: 'GET', headers: myHeaders };
			var url = app.baseUrl+'/'+app.api_version+'/snippets/?size=99999';
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				if ( response.data ) {
					for (var i=0; i < (response.data).length ; i++ ) {
						var s = response.data[i];
						app.snippets.push( {id: s.id, name:s.attributes.name, sType:s.attributes.type, type: 'snippets'} );
					}
					localStorage.setItem('snippets', JSON.stringify(app.snippets));
				}
			});
		}
	};
	
	app.getDatatypes = function() {
		if ( app.datatypes.length == 0 ) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var url = app.baseUrl+'/'+app.api_version+'/datatypes/';
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				if ( response.data ) {
					for (var i=0; i < (response.data).length ; i++ ) {
						var d = response.data[i];
						app.datatypes.push( {name: d.id, value:d.attributes.name} );
					}
					localStorage.setItem('datatypes', JSON.stringify(app.datatypes));
				}
			});
		}
	};
	
	app.getCard = function(card) {
		var output = "";
		output += "<div class=\"mdl-grid mdl-cell\">";
		output += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		if( card.image ) {
			output += "	<div class=\"mdl-card__title\" style=\"background:url("+card.image+") no-repeat 50% 50%;\">";
		} else {
			output += "	<div class=\"mdl-card__title\">";
		}
		output += "			<h3 class=\"mdl-card__title-text\">" + card.title + "</h3>";
		output += "		</div>";
		output += "  	<div class=\"mdl-card__supporting-text mdl-card--expand\">" + card.description + "</div>";
		if ( card.url || card.secondaryaction || card.action ) {
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
	};
	
	app.displayChip = function(chip) {
		var chipElt = document.createElement('div');
			chipElt.setAttribute('class', 'mdl-chip');
			chipElt.setAttribute('data-id', chip.id);
			chipElt.innerHTML = "<i class='material-icons md-18'>"+app.icons[chip.type]+"</i>"+chip.name+"<i class='material-icons close'>close</i>";
			chipElt.querySelector('i.close').addEventListener('click', function(evt) {
				evt.preventDefault();
				evt.target.parentNode.remove();
			}, false);
		return chipElt;
	};
	
	app.addChipTo = function(container, chip) {
		document.getElementById(container).append(app.displayChip(chip));
	};
	
	app.displayChipSnippet = function(chipSnippet) {
		var displayChipSnippet = document.createElement('div');
		displayChipSnippet.setAttribute('class', 'mdl-chip mdl-list__item');
		displayChipSnippet.setAttribute('style', 'width: 100%; text-overflow: ellipsis; display: flex;');
		displayChipSnippet.setAttribute('draggable', true);
		displayChipSnippet.setAttribute('data-id', chipSnippet.id);
		displayChipSnippet.setAttribute('data-stype', chipSnippet.sType);
		displayChipSnippet.innerHTML = "<i class='md-36 grippy'></i>" +
				"<i class='material-icons md-36' id='type-"+chipSnippet.id+"'>"+app.icons[chipSnippet.type]+"</i> <div class='mdl-tooltip mdl-tooltip--top' for='type-"+chipSnippet.id+"'>"+chipSnippet.type+" ("+chipSnippet.sType+")</div>" +
				"<span>"+chipSnippet.name+" ("+chipSnippet.sType+")</span>" +
				"<i class='material-icons close mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect' id='remove-"+chipSnippet.id+"'>close</i> <div class='mdl-tooltip mdl-tooltip--top' for='remove-"+chipSnippet.id+"'>Remove this "+chipSnippet.type+"</div>" +
				"<i class='material-icons edit mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect' id='edit-"+chipSnippet.id+"'>edit</i> <div class='mdl-tooltip mdl-tooltip--top' for='edit-"+chipSnippet.id+"'>Edit this "+chipSnippet.type+"</div>";
		displayChipSnippet.querySelector('i.close').addEventListener('click', function(evt) {
			evt.preventDefault();
			evt.target.parentNode.parentNode.remove();
		}, false);
		displayChipSnippet.querySelector('i.edit').addEventListener('click', function(evt) {
			evt.preventDefault();
			app.resources.snippets.display(
				app.getSnippetIdFromIndex( evt.target.parentNode.parentNode.getAttribute('data-id') ),
				false,
				true,
				false
			);
		}, false);
			
		return displayChipSnippet;
	};
	
	/* Sort Snippets */
	var dragSrcEl = null;
	app.handleDragStart = function(e) {
		// Target (this) element is the source node.
		dragSrcEl = this;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.outerHTML);
		this.classList.add('dragElem');
	};
	app.handleDragOver = function(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Necessary. Allows us to drop.
		}
		this.classList.add('over');
		e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.
		return false;
	};
	app.handleDragEnter = function(e) {
		// this / e.target is the current hover target.
	};
	app.handleDragLeave = function(e) {
		this.classList.remove('over'); // this / e.target is previous target element.
	}
	app.handleDrop = function(e) {
		// this/e.target is current target element.
		if (e.stopPropagation) {
			e.stopPropagation(); // Stops some browsers from redirecting.
		}
		// Don't do anything if dropping the same column we're dragging.
		if (dragSrcEl != this) {
			// Set the source column's HTML to the HTML of the column we dropped on.
			//alert(this.outerHTML);
			//dragSrcEl.innerHTML = this.innerHTML;
			//this.innerHTML = e.dataTransfer.getData('text/html');
			this.parentNode.removeChild(dragSrcEl);
			var dropHTML = e.dataTransfer.getData('text/html');
			this.insertAdjacentHTML('beforebegin',dropHTML);
			var dropElem = this.previousSibling;
			app.addDnDHandlers(dropElem);
		}
		this.classList.remove('over');
		return false;
	};
	app.handleDragEnd = function(e) {
		// this/e.target is the source node.
		this.classList.remove('over');
		/*[].forEach.call(cols, function (col) {
			col.classList.remove('over');
		});*/
	};
	app.addDnDHandlers = function(e) {
		e.addEventListener('dragstart', app.handleDragStart, false);
		e.addEventListener('dragenter', app.handleDragEnter, false)
		e.addEventListener('dragover', app.handleDragOver, false);
		e.addEventListener('dragleave', app.handleDragLeave, false);
		e.addEventListener('drop', app.handleDrop, false);
		e.addEventListener('dragend', app.handleDragEnd, false);
	};
	/* END Sorting */

	app.addChipSnippetTo = function(container, chipSnippet) {
		document.getElementById(container).append(app.displayChipSnippet(chipSnippet));
	};
	app.getSnippetIdFromIndex = function(index) {
		return ((JSON.parse(localStorage.getItem('snippets')))[index]).id;
	};

	app.fetchItemsPaginated = function(type, filter, page, size) {
		let promise = new Promise((resolve, reject) => {
			if( type !== 'objects' && type !== 'flows' && type !== 'dashboards' && type !== 'snippets' && type !== 'rules' && type !== 'mqtts' ) {
				resolve();
				return false;
			}

			size = size!==undefined?size:app.itemsSize[type];
			page = page!==undefined?page:app.itemsPage[type];
			
			app.containers.spinner.removeAttribute('hidden');
			app.containers.spinner.classList.remove('hidden');
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var defaultCard = {};

			if (type == 'objects') {
				var container = (app.containers.objects).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/objects';

				if ( page || size || filter ) {
					url += '?';
					if ( filter !== undefined ) {
						url += 'name='+escape(filter)+'&';
					}
					if ( page !== undefined ) {
						url += 'page='+page+'&';
					}
					if ( size !== undefined ) {
						url += 'size='+size+'&';
					}
				}
				var title = 'My Objects';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any Object yet.', internalAction: false, action: {id: 'object_add', label: '<i class=\'material-icons\'>add</i>Add my first Object'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Connected Objects', titlecolor: '#ffffff', description: 'Connecting anything physical or virtual to t6 Api without any hassle. Embedded, Automatization, Domotic, Sensors, any Objects or Devices can be connected and communicate to t6 via RESTful API. Unic and dedicated application to rules them all and designed to simplify your journey.'}; // ,
			
			} else if (type == 'flows') {
				var container = (app.containers.flows).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/flows';
				if ( page || size || filter ) {
					url += '?';
					if ( filter !== undefined ) {
						url += 'name='+escape(filter)+'&';
					}
					if ( page !== undefined ) {
						url += 'page='+page+'&';
					}
					if ( size !== undefined ) {
						url += 'size='+size+'&';
					}
				}
				var title = 'My Flows';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img2.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any Flow yet.', internalAction: false, action: {id: 'flow_add', label: '<i class=\'material-icons\'>add</i>Add my first Flow'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Time-series Datapoints', titlecolor: '#ffffff', description: 'Communication becomes easy in the platform with Timestamped values. Flows allows to retrieve and classify data.'}; // ,
																																																																			// action:
			} else if (type == 'dashboards') {
				var container = (app.containers.dashboards).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/dashboards';
				if ( page || size ) {
					url += '?';
					if ( page !== undefined ) {
						url += 'page='+page+'&';
					}
					if ( size !== undefined ) {
						url += 'size='+size+'&';
					}
				}
				var title = 'My Dashboards';
				if ( app.isLogged ) {
					defaultCard = {image: app.baseUrlCdn+'/img/opl_img.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any dashboard yet.', internalAction: false, action: {id: 'dashboard_add', label: '<i class=\'material-icons\'>add</i>Add my first Dashboard'}};
				} else {
					defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Dashboards', titlecolor: '#ffffff', description: 't6 support multiple Snippets to create your own IoT Dashboards for data visualization. Snippets are ready to Use Html components integrated into the application. Dashboards allows to empower your data-management by Monitoring and Reporting activities.'};
				}
			} else if (type == 'snippets') {
				var container = (app.containers.snippets).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/snippets';
				if ( page || size ) {
					url += '?';
					if ( page !== undefined ) {
						url += 'page='+page+'&';
					}
					if ( size !== undefined ) {
						url += 'size='+size+'&';
					}
				}
				var title = 'My Snippets';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any snippet yet.', internalAction: false, action: {id: 'snippet_add', label: '<i class=\'material-icons\'>add</i>Add my first Snippet'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Customize Snippets', titlecolor: '#ffffff', description: 'Snippets are components to embed into your dashboards and displays your data'}; // ,
				
			} else if (type == 'rules') {
				var container = (app.containers.rules).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/rules';
				if ( page || size ) {
					url += '?';
					if ( page !== undefined ) {
						url += 'page='+page+'&';
					}
					if ( size !== undefined ) {
						url += 'size='+size+'&';
					}
				}
				var title = 'My Rules';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img2.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any rule yet.', internalAction: false, action: {id: 'rule_add', label: '<i class=\'material-icons\'>add</i>Add my first Rule'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Decision Rules to get smart', titlecolor: '#ffffff', description: 'Trigger action from Mqtt and decision-tree. Let\'s your Objects talk to the platform as events.'}; // ,

			} else if (type == 'mqtts') {
				var container = (app.containers.mqtts).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/mqtts';
				if ( page || size ) {
					url += '?';
					if ( page !== undefined ) {
						url += 'page='+page+'&';
					}
					if ( size !== undefined ) {
						url += 'size='+size+'&';
					}
				}
				var title = 'My Mqtts';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any mqtt topic yet.', action: {id: 'mqtt_add', label: '<i class=\'material-icons\'>add</i>Add my first Mqtt'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.'}; // ,
				
			} else if (type == 'tokens') {
				var container = (app.containers.tokens).querySelector('.page-content');
				var url = app.baseUrl+'/'+app.api_version+'/tokens';
				if ( page || size ) {
					url += '?';
					if ( page !== undefined ) {
						url += 'page='+page+'&';
					}
					if ( size !== undefined ) {
						url += 'size='+size+'&';
					}
				}
				var title = 'My tokens';
				if ( app.isLogged ) defaultCard = {image: app.baseUrlCdn+'/img/opl_img.jpg', title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any token yet.', action: {id: 'token_add', label: '<i class=\'material-icons\'>add</i>Add my first Token'}};
				else defaultCard = {image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.'}; // ,
				
			} else if (type == 'status') {
				var icon = app.icons.status;
				var container = (app.containers.status).querySelector('.page-content');
				defaultCard = {};
				app.getStatus();
				
			} else {
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					console.log('DEBUG Error no Type defined: '+type);
					toast('Error no Type defined.', {timeout:3000, type: "error"});
				}
				type=undefined;
			}

			if ( !navigator.onLine ) {
				container.innerHTML = app.getCard(app.offlineCard);
			} else {
				if ( app.isLogged && type !== undefined ) {
					fetch(url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(fetchResponse){
						return fetchResponse.json();
					})
					.then(function(response) {
						if ( page==1 ) {
							container.innerHTML = "";
						}
						if ( !response.data || (response.data && (response.data).length == 0 )) {
							container.innerHTML = app.getCard(defaultCard);
							app.displayLoginForm( container );
						} else {
							for (var i=0; i < (response.data).length ; i++ ) {
								container.innerHTML += (app.resources)[type].displayItem(response.data[i]);
							}
							app.showAddFAB(type);
							componentHandler.upgradeDom();
							app.setItemsClickAction(type);
							app.setListActions(type);
							if ( type == 'snippets' ) {
								app.snippets = [];
								(response.data).map(function(snippet) {
									app.snippets.push( {id: snippet.id, name:snippet.attributes.name, sType:snippet.attributes.type, type: snippets.attributes.type} );
								});
								localStorage.setItem('snippets', JSON.stringify(app.snippets));
							} else if ( type == 'flows' ) {
								app.flows = [];
								(response.data).map(function(flow) {
									app.flows.push( {id: flow.id, name:flow.attributes.name, type: flow.attributes.type} );
								});
								localStorage.setItem('flows', JSON.stringify(app.flows));
							}
						}
						resolve();
					})
					.catch(function (error) {
						if ( localStorage.getItem('settings.debug') == 'true' ) {
							toast('fetchItemsPaginated '+type+' error occured...'+ error, {timeout:3000, type: "error"});
						}
					});
				} else {
					container.innerHTML = app.getCard(defaultCard);
					resolve();
				}
			}
		});
			
		app.containers.spinner.setAttribute('hidden', true);
		return promise;
	};
	
	app.getUsersList = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (app.containers.usersList).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/users/list';
		var title = 'Users List';

		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			var usersList = "";
			document.title = app.sectionsPageTitles['users-list'];
			for (var i=0; i < (response.data).length ; i++ ) {
				var user = response.data[i];
				var num = (response.data).length-i;
				usersList += "<div class=\"mdl-grid mdl-cell\" data-action=\"nothing\" data-type=\"user\" data-id=\""+user.id+"\">";
				usersList += "	<div class=\"mdl-card mdl-shadow--2dp\">";
				usersList += "		<div class=\"mdl-card__title\">";
				usersList += "			<i class=\"material-icons\">perm_identity</i>";
				usersList += "			<h3 class=\"mdl-card__title-text\">"+num+". "+user.attributes.first_name + " " + user.attributes.last_name+"</h3>";
				usersList += "		</div>";
				usersList += app.getField('card_membership', 'User id', user.id, {type: 'text', isEdit: false });
				usersList += app.getField('mail', 'Email', user.attributes.email, {type: 'text', isEdit: false });
				if ( user.attributes.location ) {
					if ( user.attributes.location.geo ) {
						usersList += app.getField('dns', 'Location', user.attributes.location.geo.city+" ("+user.attributes.location.geo.country+")", {type: 'text', isEdit: false });
					}
					if ( user.attributes.location.ip ) {
						usersList += app.getField('dns', 'IP address', user.attributes.location.ip, {type: 'text', isEdit: false });
					}
				}
				usersList += app.getField('contact_mail', 'Password last update', moment((user.attributes.password_last_updated)/1).format(app.date_format), {type: 'text', isEdit: false });
				usersList += app.getField('contact_mail', 'Reminder Email', moment((user.attributes.reminder_mail)/1).format(app.date_format), {type: 'text', isEdit: false });
				usersList += app.getField('change_history', 'Password reset request', moment((user.attributes.change_password_mail)/1).format(app.date_format), {type: 'text', isEdit: false });
				
				usersList += "		<div class=\"mdl-card__actions mdl-card--border\">";
				usersList += "			<span class=\"pull-left mdl-card__date\">";
				usersList += "				<button data-id=\""+user.id+"\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
				usersList += "					<i class=\"material-icons\">update</i>";
				usersList += "				</button>";
				usersList += "				<span data-date=\"created\" class=\"visible\">Subscribed on "+moment((user.attributes.subscription_date)/1).format(app.date_format) + "</span>";
				usersList += "				<span data-date=\"updated\" class=\"hidden\">Password last update on "+moment((user.attributes.password_last_updated)/1).format(app.date_format) + "</span>";
				usersList += "			</span>";
				usersList += "		</div>";
				usersList += "	</div>";
				usersList += "</div>";
			}
			container.innerHTML = usersList;
			
			componentHandler.upgradeDom();
			app.setItemsClickAction('usersList');
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('getUsersList error out...' + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	};
	
	app.fetchProfile = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (app.containers.profile).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/users/me/token';
		var title = 'My Profile';

		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( !navigator.onLine ) {
				container.innerHTML = app.getCard(app.offlineCard);
			} else {
				var user = response.data;
				var gravatar = user.attributes.gravatar.entry[0];
				var node = "";
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp card card-user\">";
				if (gravatar.profileBackground) {
					node += "	<div class=\"card-heading heading-left\" style=\"background: url('"+gravatar.profileBackground.url+"') 50% 50% !important\">";
				} else {
					node += "	<div class=\"card-heading heading-left\" style=\"background: url('"+app.baseUrlCdn+"/img/opl_img.jpg') 50% 50% !important\">";
				}
				node += "		<img src=\"//secure.gravatar.com/avatar/"+hex_md5(user.attributes.email)+"\" alt=\"\" class=\"user-image\">";
				node += "		<h3 class=\"card-title text-color-white\">"+user.attributes.first_name+" "+user.attributes.last_name+"</h3>";
				if (gravatar.currentLocation) {
					node += "		<div class=\"subhead\">";
					node += 			gravatar.currentLocation;
					node += "		</div>";
				}
				node += "	</div>";
				
				node += "	<div class=\"card-header heading-left\">&nbsp;</div>";
				node += "	<div class=\"card-body\">";
				node += app.getField('face', 'First name', user.attributes.first_name, {type: 'input', id:'firstName', isEdit: true, pattern: app.patterns.name, error:'Must be greater than 3 chars.'});
				node += app.getField('face', 'Last name', user.attributes.last_name, {type: 'input', id:'lastName', isEdit: true, pattern: app.patterns.name, error:'Must be greater than 3 chars.'});
				node += app.getField('lock', 'Email', user.attributes.email, {type: 'text', id:'email', style:'text-transform: none !important;', isEdit: false});
				node += "	</div>";
				node += "	<div class=\"mdl-card__actions mdl-card--border\">";
				node += "		<a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" id=\"saveProfileButton\"><i class=\"material-icons\">edit</i>Save t6 profile</a>";
				node += "	</div>";
				node += "</div>";
				node += "</section>";
				
				node += app.getSubtitle('Gravatar contacts');
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp card card-user\">";
				node += "	<div class=\"card-header heading-left\">&nbsp;</div>";
				node += "	<div class=\"card-body\">";
				for (var phone in gravatar.phoneNumbers) {
					node += app.getField('phone', gravatar.phoneNumbers[phone].type, gravatar.phoneNumbers[phone].value, {type: 'text', isEdit: false});
				}
				node += "		<ul class=\"social-links\">";
				for (var account in gravatar.accounts) {
					node += "		<li><a href=\""+gravatar.accounts[account].url+"\"><i class=\"material-icons mdl-textfield__icon\">link</i><span class=\"mdl-list__item-sub-title\">" + gravatar.accounts[account].shortname + "</span></a></li>";
				}
				node += "		</ul>";
				node += "		<ul class='social-links'>"; 
				for (var url in gravatar.urls) {
					node += "		<li><a href=\""+gravatar.urls[url].value+"\" target=\"_blank\"><i class=\"material-icons\">bookmark</i><span class=\"mdl-list__item-sub-title\">" + gravatar.urls[url].title + "</span></a></li>";
				}
				node += "		</ul>";
				node += "	</div>";
				node += "	<div class=\"mdl-card__actions mdl-card--border\">";
				node += "		<a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" href=\""+gravatar.profileUrl+"\" target=\"_blank\"><i class=\"material-icons\">launch</i>Edit my gravatar</a>";
				node += "	</div>";
				node += "</div>";
				node += "</section>";
				
				container.innerHTML = node;
				componentHandler.upgradeDom();
				// Profile Storage
				localStorage.setItem('currentUserId', user.id);
				localStorage.setItem("currentUserName", user.attributes.first_name+" "+user.attributes.last_name);
				localStorage.setItem("currentUserEmail", user.attributes.email);
				localStorage.setItem("notifications.email", user.attributes.email);
				localStorage.setItem("notifications.unsubscription_token", user.attributes.unsubscription_token);
				localStorage.setItem("currentUserHeader", gravatar.photos[0].value);
				if ( gravatar.profileBackground && gravatar.profileBackground.url ) {
					localStorage.setItem("currentUserBackground", gravatar.profileBackground.url);
				}
				app.setDrawer();
				app.fetchUnsubscriptions();
				app.displayUnsubscriptions((app.containers.profile).querySelector('.page-content'));
				
				document.getElementById("saveProfileButton").addEventListener("click", function(evt) {
					app.onSaveProfileButtonClick();
					evt.preventDefault();
				});
				
				if ( user.attributes.role == 'admin' ) {
					localStorage.setItem("role", 'admin');
					app.addMenuItem('Users Accounts', 'supervisor_account', '#users-list', null);
				}
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('fetchProfile error out...' + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	};
	
	app.fetchUnsubscriptions = function() {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/notifications/list/unsubscribed';
		
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			var notifications = response.unsubscription!==undefined?response.unsubscription:{};
			localStorage.setItem("notifications.unsubscribed", JSON.stringify(notifications));
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('fetchUnsubscriptions error' + error, {timeout:3000, type: "error"});
			}
		});
	};
	
	app.displayUnsubscriptions = function(container) {
		var notifications = JSON.parse(app.getSetting('notifications.unsubscribed'));
		var node = "";
		node += app.getSubtitle('Email Notifications');
		node += "<section class=\"mdl-grid mdl-cell--12-col\">";
		node += "<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp card card-user\">";
		node += "	<div class=\"card-header heading-left\">&nbsp;</div>";
		node += "	<div class=\"card-body\">";
		var value;
		var isEdit = true;
		value = notifications.reminder!==null?'false':'true';
		node += app.getField('mail_outline', 'Reminder Welcome email', value, {type: 'switch', id:'profile.notifications.reminder', isEdit: isEdit});
		
		value = notifications.changePassword!==null?'false':'true';
		node += app.getField('mail_outline', 'Reminder to change Password', value, {type: 'switch', id:'profile.notifications.changePassword', isEdit: isEdit});
		
		value = notifications.newsletter!==null?'false':'true';
		node += app.getField('mail_outline', 't6 Newsletter', value, {type: 'switch', id:'profile.notifications.newsletter', isEdit: isEdit});
		
		node += app.getField('mail_outline', 'Security notification related to your account', true, {type: 'switch', id:'profile.notifications.security', isEdit: false});
		node += "	</div>";
		node += "</section>";
		
		container.innerHTML += node;
		componentHandler.upgradeDom();

		let element1 = document.getElementById('switch-profile.notifications.reminder').parentNode;
		if ( element1 ) {
			element1.addEventListener('change', function(e) {
				if ( app.getSetting('notifications.email') && app.getSetting('notifications.unsubscription_token') ) {
					var name = 'reminder';
					var type = element1.classList.contains('is-checked')!==false?'subscribe': 'unsubscribe';
					var myHeaders = new Headers();
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: 'GET', headers: myHeaders };
					var url = app.baseUrl+'/mail/'+app.getSetting('notifications.email')+'/'+type+'/'+name+'/'+app.getSetting('notifications.unsubscription_token')+'/';
					
					fetch(url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(response) {
						toast('Subscription '+name+' ('+type+') updated.', {timeout:3000, type: 'done'});
					})
					.catch(function (error) {
						if ( localStorage.getItem('settings.debug') == 'true' ) {
							toast('Error occured on saving Notifications...' + error, {timeout:3000, type: "error"});
						}
					});
				} else {
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast('Error occured on saving Notifications...', {timeout:3000, type: "error"});
					}
				}
			});
		}

		var element2 = document.getElementById('switch-profile.notifications.changePassword').parentNode;
		if ( element2 ) {
			element2.addEventListener('change', function(e) {
				if ( app.getSetting('notifications.email') && app.getSetting('notifications.unsubscription_token') ) {
					var name = 'changePassword';
					var type = element2.classList.contains('is-checked')!==false?'subscribe': 'unsubscribe';
					var myHeaders = new Headers();
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: 'GET', headers: myHeaders };
					var url = app.baseUrl+'/mail/'+app.getSetting('notifications.email')+'/'+type+'/'+name+'/'+app.getSetting('notifications.unsubscription_token')+'/';
					
					fetch(url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(response) {
						/*
						if (type == 'unsubscribe') {
							app.setSetting('notifications.unsubscribed', {'reminder': app.getSetting('notifications.unsubscribed.reminder'), 'changePassword': 1234});
						} else {
							app.setSetting('notifications.unsubscribed.changePassword', {'reminder': app.getSetting('notifications.unsubscribed.reminder'), 'changePassword': null});
						}
						*/
						toast('Subscription '+name+' ('+type+') updated.', {timeout:3000, type: 'done'});
					})
					.catch(function (error) {
						if ( localStorage.getItem('settings.debug') == 'true' ) {
							toast('Error occured on saving Notifications...' + error, {timeout:3000, type: "error"});
						}
					});
				} else {
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast('Error occured on saving Notifications...', {timeout:3000, type: "error"});
					}
				}
			});
		}

		let element3 = document.getElementById('switch-profile.notifications.newsletter').parentNode;
		if ( element3 ) {
			element3.addEventListener('change', function(e) {
				if ( app.getSetting('notifications.email') && app.getSetting('notifications.unsubscription_token') ) {
					var name = 'newsletter';
					var type = element3.classList.contains('is-checked')!==false?'subscribe': 'unsubscribe';
					var myHeaders = new Headers();
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: 'GET', headers: myHeaders };
					var url = app.baseUrl+'/mail/'+app.getSetting('notifications.email')+'/'+type+'/'+name+'/'+app.getSetting('notifications.unsubscription_token')+'/';
					
					fetch(url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(response) {
						toast('Subscription '+name+' ('+type+') updated.', {timeout:3000, type: 'done'});
					})
					.catch(function (error) {
						if ( localStorage.getItem('settings.debug') == 'true' ) {
							toast('Error occured on saving Notifications...' + error, {timeout:3000, type: "error"});
						}
					});
				} else {
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast('Error occured on saving Notifications...', {timeout:3000, type: "error"});
					}
				}
			});
		}
	};
	
	app.setDrawer = function() {
		if ( localStorage.getItem("currentUserName") != 'null' ) { document.getElementById("currentUserName").innerHTML = localStorage.getItem("currentUserName") }
		else { document.getElementById("currentUserName").innerHTML = "t6 IoT App"; }
		if ( localStorage.getItem("currentUserEmail") != 'null' ) { document.getElementById("currentUserEmail").innerHTML = localStorage.getItem("currentUserEmail") }
		else { document.getElementById("currentUserEmail").innerHTML = ""; }
		if ( document.getElementById("imgIconMenu") && localStorage.getItem("currentUserHeader") != 'null' && localStorage.getItem("currentUserHeader") ) {
			document.getElementById("currentUserHeader").setAttribute('src', localStorage.getItem("currentUserHeader"));
			document.getElementById("imgIconMenu").outerHTML = "<img id=\"imgIconMenu\" src=\""+localStorage.getItem("currentUserHeader")+"\" alt=\"Current user avatar\" style=\"border-radius: 50%; width: 30px; padding: 0px;border: 1px solid #fff;margin: 0px 0px;\">";
		}
		else { document.getElementById("currentUserHeader").setAttribute('src', app.baseUrlCdn+"/img/m/icons/icon-128x128.png"); }
		if ( localStorage.getItem("currentUserBackground") !== null ) { document.getElementById("currentUserBackground").style.background="#795548 url("+localStorage.getItem("currentUserBackground")+") 50% 50% / cover" }
		else { document.getElementById("currentUserBackground").style.background="#795548 url("+app.baseUrlCdn+"/img/m/side-nav-bg.jpg) 50% 50% / cover" }
	};

	app.resetDrawer = function() {
		localStorage.removeItem("currentUserName");
		localStorage.removeItem("currentUserEmail");
		localStorage.removeItem("currentUserHeader");
		localStorage.removeItem("currentUserBackground");
		if (document.getElementById("imgIconMenu")) document.getElementById("imgIconMenu").outerHTML = "<i id=\"imgIconMenu\" class=\"material-icons\">menu</i>";
		app.setDrawer();
	};

	app.displayLoginForm = function(container) {
		container.querySelectorAll('form.signin').forEach( function(e) { if (e) { e.parentNode.remove(); }} );
		if ( app.isLogged === false ) {
			var login = "<section class='content-grid mdl-grid'>" +
			"	<div class='mdl-layout-spacer'></div>" +
			"	<form class='signin'>" +
			"		<div class='mdl-card mdl-card__title mdl-shadow--2dp'>" +
			"			<img src='"+app.baseUrlCdn+"/img/opl_img.jpg' alt='t6 Connect your Objects' aria-hidden='true'>" +
			"			<div class='mdl-card__title'>" +
			"				Connect your Objects to collect their data and show your own Dashboards." +
			"			</div>" +
			"			<div class='mdl-card__supporting-text'>" +
			"				<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>" +
			"					<i class='material-icons mdl-textfield__icon'>lock</i>" +
			"					<input name='username' pattern=\""+app.patterns.username+"\" class='mdl-textfield__input' type='text' id='signin.username'>" +
			"					<label for='signin.username' class='mdl-textfield__label'>Username</label>" +
			"					<span class='mdl-textfield__error'>Username should be your email address</span>" +
			"				</div>" +
			"				<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>" +
			"					<i class='material-icons mdl-textfield__icon'>vpn_key</i>" +
			"					<input name='password' pattern=\""+app.patterns.password+"\" class='mdl-textfield__input' type='password' id='signin.password'>" +
			"					<label for='signin.password' class='mdl-textfield__label'>Password</label>" +
			"					<span class='mdl-textfield__error'>Password must be provided</span>" +
			"				</div>" +
			"			</div>" +
			"			<div class='mdl-card__supporting-text mdl-grid'>" +
			"				<span class='mdl-layout-spacer'></span>" +
			"				<button class='login_button mdl-button mdl-js-button mdl-js-ripple-effect'>" +
			"					<i class='material-icons'>lock</i>Log in" +
			"				</button>" +
			"			</div>" +
			"			<div class='mdl-card__actions mdl-card--border'>" +
			"				<span class='mdl-layout-spacer'></span>" +
			"				<a onclick=\"app.setSection('signup');\" href='#signup' class='mdl-button small'>Sign Up</a> or " +
			"				<a onclick=\"app.setSection('forgot-password');\" href='#forgot-password' class='mdl-button small'>Reset password</a>" +
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
			app.setLoginAction();
			app.setSignupAction();
		}
	};

	app.fetchIndex = function() {
		var node = "";
		var container = (app.containers.index).querySelector('.page-content');
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		if ( !localStorage.getItem('index') ) {
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var url = app.baseUrl+'/'+app.api_version+'/index';
			var title = '';

			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				for (var i=0; i < (response).length ; i++ ) {
					node += app.getCard(response[i]);
				}
				localStorage.setItem('index', JSON.stringify(response));
				container.innerHTML = node;
			})
			.catch(function (error) {
				container.innerHTML = app.getCard( {image: app.baseUrlCdn+'/img/opl_img2.jpg', title: 'Oops, something has not been loaded correctly..', titlecolor: '#ffffff', description: 'We are sorry, the content cannot be loaded, please try again later, there might a temporary network outage. :-)'} );
				app.displayLoginForm(container);
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					toast('fetchIndex error out...' + error, {timeout:3000, type: "error"});
				}
			});
		} else {
			var index = JSON.parse(localStorage.getItem('index'));
			for (var i=0; i < index.length ; i++ ) {
				node += app.getCard(index[i]);
			}
			container.innerHTML = node;
		}
		app.containers.spinner.setAttribute('hidden', true);
	};

	app.showAddFAB = function(type) {
		var container;
		var showFAB = false;
		if( type == 'objects' ) {
			var id = 'createObject';
			container = (app.containers.objects).querySelector('.page-content');
			showFAB = true;
		}
		if( type == 'flows' ) {
			var id = 'createFlow';
			container = (app.containers.flows).querySelector('.page-content');
			showFAB = true;
		}
		if( type == 'dashboards' ) {
			var id = 'createDashboard';
			container = (app.containers.dashboards).querySelector('.page-content');
			showFAB = true;
		}
		if( type == 'snippets' ) {
			var id = 'createSnippet';
			container = (app.containers.snippets).querySelector('.page-content');
			showFAB = true;
		}
		if( type == 'rules' ) {
			var id = 'createRule';
			container = (app.containers.rules).querySelector('.page-content');
			showFAB = true;
		}
		if( type == 'mqtts' ) {
			var id = 'createMqtt';
			container = (app.containers.mqtts).querySelector('.page-content');
			showFAB = true;
		}
		if ( showFAB  && container ) {
			var fabClass = app.getSetting('settings.fab_position')!==null?app.getSetting('settings.fab_position'):'fab__bottom';
			var fab = "<div class='mdl-button--fab_flinger-container "+fabClass+"'>";
			fab += "	<button id='"+id+"' class='mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored mdl-shadow--8dp'>";
			fab += "		<i class='material-icons'>add</i>";
			fab += "		<div class='mdl-tooltip mdl-tooltip--top' for='"+id+"'>Add a new "+type.slice(0, -1)+"</label>";
			fab += "	</button>";
			fab += "</div>";
			
			// Add spacer
			var from = (parseInt(app.itemsPage[type])*parseInt(app.itemsSize[type]))+1;
			var to = (parseInt(app.itemsPage[type])+1)*parseInt(app.itemsSize[type]);
			var page = parseInt(app.itemsPage[type])+1;
			var max = 5; // hardcoded! # TODO
			//if ( to < max ) {
			fab += "<div class='mdl-grid mdl-cell mdl-cell--12-col spacer'>";
			fab += "	<span class='mdl-layout-spacer'></span>";
			fab += "		<button data-size='"+parseInt(app.itemsSize[type])+"' data-page='"+page+"' data-type='"+type+"' class='lazyloading mdl-cell--12-col mdl-button mdl-js-button mdl-js-ripple-effect'>";
			fab += "			<i class='material-icons'>expand_more</i>";
			fab += "		</button>";
			fab += "	<span class='mdl-layout-spacer'></span>";
			fab += "</div>";
			//}
			container.innerHTML += fab;
			componentHandler.upgradeDom();
			
			app.refreshButtonsSelectors();
			if ( app.buttons.createObject ) app.buttons.createObject.addEventListener('click', function() {app.setSection('object_add');}, false);
			if ( app.buttons.createFlow ) app.buttons.createFlow.addEventListener('click', function() {app.setSection('flow_add');}, false);
			if ( app.buttons.createSnippet ) app.buttons.createSnippet.addEventListener('click', function() {app.setSection('snippet_add');}, false);
			if ( app.buttons.createDashboard ) app.buttons.createDashboard.addEventListener('click', function() {app.setSection('dashboard_add');}, false);
			if ( app.buttons.createRule ) app.buttons.createRule.addEventListener('click', function() {app.setSection('rule_add');}, false);
			if ( app.buttons.createMqtt ) app.buttons.createMqtt.addEventListener('click', function() {app.setSection('mqtt_add')}, false);
		}
	};
	
	app.getField = function(icon, label, value, options) {
		if ( options.type === 'hidden' ) {
			options.isVisible = false;
		}
		var hidden = options.isVisible!==false?"":" hidden";
		var expand = options.isExpand===false?"":" mdl-card--expand";
		var field = "";
		field += "<div class='mdl-list__item--three-line small-padding "+hidden+expand+"'>";
		if ( typeof options === 'object' ) {
			var id = options.id!==null?options.id:app.getUniqueId();
			
			if ( options.type === 'input' || options.type === 'text' ) {
				var style = options.style!==undefined?"style='"+options.style+"'":"";
				if ( options.isEdit == true ) {
					var pattern = options.pattern!==undefined?"pattern='"+options.pattern+"'":"";
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
					field += "	<input type='text' "+style+" value='"+value+"' "+pattern+" class='mdl-textfield__input' name='"+label+"' id='"+id+"' />";
					if (label) field += "	<label class='mdl-textfield__label' for='"+id+"'>"+label+"</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>"+options.error+"</span>";
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (label) field += "	<label class='mdl-textfield__label'>"+label+"</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title' "+style+">"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'container' ) {
				field += "<div class='mdl-list__item-sub-title'>";
				field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>view_module</i>";
				if (label) field += "	<label class='mdl-textfield__label' for='"+id+"'>"+label+"</label>";
				field += "	<div class='' id='"+id+"'></div>";
				field += "</div>";
			} else if ( options.type === 'hidden' ) {
				var pattern = options.pattern!==undefined?"pattern='"+options.pattern+"'":"";
				field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
				if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
				field += "	<input type='hidden' value='"+value+"' "+pattern+" class='mdl-textfield__input' name='"+label+"' id='"+id+"' />";
				if (label) field += "	<label class='mdl-textfield__label' for='"+id+"'>"+label+"</label>";
				if (options.error) field += "	<span class='mdl-textfield__error'>"+options.error+"</span>";
				field += "</div>";
			} else if ( options.type === 'textarea' ) {
				if ( options.isEdit == true ) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
					field += "	<textarea style='width:100%; height:100%;' type='text' rows='3' class='mdl-textfield__input' name='"+label+"' id='"+id+"'>"+value+"</textarea>";
					if (label) field += "	<label class='mdl-textfield__label' for='"+id+"'>"+label+"</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>"+options.error+"</span>";
					field += "</div>";
				} else {
					if (value ) field += "<span class='mdl-list__item-sub-title'>"+value+"</span>";
				}
			} else if ( options.type === 'radio' ) {
				if ( options.isEdit == true ) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'> /!\ radio "+icon+"</i>";
					if (label) field += "	<label class='mdl-textfield__label'> /!\ radio "+label+"</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>"+options.error+"</span>";
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (label) field += "	<label class='mdl-radio__label'>"+label+"</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'checkbox' ) {
				if ( options.isEdit == true ) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'> /!\ checkbox "+icon+"</i>";
					if (label) field += "	<label class='mdl-list__item-sub-title'> /!\ checkbox "+label+"</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>"+options.error+"</span>";
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (label) field += "	<label class='mdl-checkbox__label'>"+label+"</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'switch' ) {
				var isChecked = value==true||value=='true'?' checked':'';
				var className = value==true||value=='true'?'is-checked':'';
				if ( options.isEdit == true ) {
					field += "<label class='mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-textfield--floating-label "+className+"' for='switch-"+id+"' data-id='switch-"+id+"'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
					field += "	<input type='checkbox' id='switch-"+id+"' class='mdl-switch__input' name='"+label+"' value='"+value+"' placeholder='"+label+"' "+isChecked+">";
					if (label) field += "	<div class='mdl-switch__label'>"+label+"</div>";
					field += "</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>"+options.error+"</span>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (label) field += "	<label class='mdl-switch__label'>"+label+"</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === 'select' ) {
				if ( options.isEdit == true ) {
					var isMultiple = options.isMultiple==true?'multiple':'';
					
					field += "<div class='mdl-selectfield mdl-js-selectfield mdl-textfield--floating-label'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id+"'>"+icon+"</i>";
					if (label) field += "	<label class='mdl-selectfield__label' for='"+id+"'>"+label+"</label>";
					field += "	<select class='mdl-textfield__input mdl-selectfield__select' name='"+label+"' id='"+id+"' "+isMultiple+">";
					for (var n=0; n<options.options.length; n++) {
						var selected = value==options.options[n].name?'selected':'';
						field += "	<option "+selected+" value='"+options.options[n].name+"' data-stype='"+options.options[n].sType+"'>"+options.options[n].value+"</option>";
					}
					field += "	</select>";
					if (options.error) field += "	<span class='mdl-textfield__error'>"+options.error+"</span>";
					field += "</div>";
				} else {
					var selectedValue = (options.options.filter(function(cur) {return cur.name === value}));
					selectedValue = selectedValue[0]!==undefined?selectedValue[0].value:'';
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>"+icon+"</i>";
					if (label) field += "	<label class='mdl-selectfield__label'>"+label+"</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>"+value+"</span>";
					field += "</div>";
				}
			} else if ( options.type === '2inputs' ) {
				var pattern = new Array();
					pattern[0] = options.pattern[0]!==undefined?"pattern='"+options.pattern[0]+"'":"";
					pattern[1] = options.pattern[1]!==undefined?"pattern='"+options.pattern[1]+"'":"";
				if ( options.isEdit == true ) {
					field += "<div class='half mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title' style='width: calc(50% - 20px) !important;'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='"+id[0]+"'>"+icon+"</i>";

					field += "	<input type='text' value='"+value[0]+"'"+pattern[0]+" class='mdl-textfield__input' name='"+id[0]+"' id='"+id[0]+"' />";
					if (label[0]) field += "	<label class='mdl-textfield__label' for='"+id[0]+"'>"+label[0]+"</label>";
					if (options.error[0]) field += "	<span class='mdl-textfield__error'>"+options.error[0]+"</span>";
					field += "</div>";

					field += "<div class='half mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title' style='width: calc(50% - 20px) !important;'>";
					field += "	<input type='text' value='"+value[1]+"'"+pattern[1]+" class='mdl-textfield__input' name='"+id[1]+"' id='"+id[1]+"' />";
					if (label[1]) field += "	<label class='mdl-textfield__label' for='"+id[1]+"'>"+label[1]+"</label>";
					if (options.error[1]) field += "	<span class='mdl-textfield__error'>"+options.error[1]+"</span>";
					field += "</div>";
					
					field += "<div class='half mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title' style='width: 40px !important;'>";
					field += "	<button class='mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' style='position: absolute; bottom: -10px;'><i class='material-icons'>add</i></button>";
					field += "</div>";
					
				} else {
					value = (options.options.filter(function(cur) {return cur.name === value}))[0].value;
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
	};

	app.getSnippet = function(icon, snippet_id, container) {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var myContainer = container!=null?container:(app.containers.dashboard).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/snippets/'+snippet_id;
		
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( response.data[0] ) {
				var my_snippet = response.data[0];
				var s = app.snippetTypes.find(function(snippet) {
					return (snippet.name).toLowerCase()===(my_snippet.attributes.type).toLowerCase();
				});
				var snippet = s.getHtml({name: my_snippet.attributes.name, id: my_snippet.id, icon: my_snippet.attributes.icon});
				
				var c= document.createElement("div");
				c.setAttribute('class','mdl-grid mdl-cell');
				c.innerHTML = snippet;
				myContainer.appendChild(c);
				componentHandler.upgradeDom();
				
				my_snippet.flowNames=[];
				my_snippet.attributes.flows.map(function(f) {
					if ( localStorage.getItem('flows') != 'null' && JSON.parse(localStorage.getItem('flows')) ) {
						var theFlow = (JSON.parse(localStorage.getItem('flows'))).find(function(storedF) { return storedF.id == f; });
						if ( theFlow ) {
							my_snippet.flowNames.push(theFlow.name);
						}
					}
				});
				s.activateOnce(my_snippet);
				
				// Set the buttons on edit Snippets
				var editSnippetButtons = document.querySelectorAll(".edit-snippet");
				for (var b in editSnippetButtons) {
					if ( (editSnippetButtons[b]).childElementCount > -1 ) {
						(editSnippetButtons[b]).addEventListener("click", function(evt) {
							app.resources.snippets.display(evt.target.getAttribute("data-snippet-id"), false, true, false);
							evt.preventDefault();
						});
					}
				}
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem("settings.debug") == "true" ) {
				toast("getSnippet error out..." + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	};

	app.refreshFromNow = function(id, time, fromNow) {
		if (document.getElementById(id)) {
			document.getElementById(id).innerHTML = moment(time).format(app.date_format);
			if ( fromNow !== null ) {
				document.getElementById(id).innerHTML += "<small>, " + moment(time).fromNow() + "</small>";
			}
		}
	};

	app.getQrcodeImg = function(icon, label, id) {
		var field = "<div class='mdl-list__item small-padding'>";
		field += "		<span class='mdl-list__item-primary-content'>";
		field += "			<i class='material-icons mdl-textfield__icon'>link</i>";
		field += "			<label class=\"mdl-switch__label\">QR Code<sup>TM</sup></label>";
		field += "		</span>";
		field += "		<span class='mdl-list__item-secondary-content'>";
		field += "			<img src='' id='qr-"+id+"' class='img-responsive' style='margin:0 auto;' />";
		field += "		</span>";
		field += "</div>";
		return field;
	};

	app.getQrcode = function(icon, label, id) {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/objects/"+id+"/qrcode/8/H";
		
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( response ) {
				var container = document.getElementById('qr-'+id);
				container.setAttribute('src', (new DOMParser()).parseFromString(response.data, "text/html").images[0].src);
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('fetch Qrcode error out...' + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	};

	app.getMap = function(icon, id, longitude, latitude, isEditable, isActionable) {
		var field = "<div class='mdl-list__item'>";
		field += "	<span class='mdl-list__item-primary-content map' id='"+id+"' style='width:100%; height:400px;'></span>";
		field += "</div>";
		return field;
	};
	
	app.authenticate = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(app.auth) };
		var url = app.baseUrl+"/"+app.api_version+"/authenticate";
		
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( response.token && response.refresh_token && response.refreshTokenExp ) {
				localStorage.setItem('bearer', response.token);
				localStorage.setItem('refresh_token', response.refresh_token);
				localStorage.setItem('refreshTokenExp', response.refreshTokenExp);
				app.isLogged = true;
				app.resetSections();
				app.fetchProfile();
				app.fetchUnsubscriptions();
				if ( window.location.hash && window.location.hash.substr(1) === 'object_add' ) {
					app.displayAddObject(app.defaultResources.object);
				} else if ( window.location.hash && window.location.hash.substr(1) === 'flow_add' ) {
					app.displayAddFlow(app.defaultResources.flow);
				} else if ( window.location.hash && window.location.hash.substr(1) === 'dashboard_add' ) {
					app.displayAddDashboard(app.defaultResources.dashboard);
				} else if ( window.location.hash && window.location.hash.substr(1) === 'snippet_add' ) {
					app.displayAddSnippet(app.defaultResources.snippet);
				} else if ( window.location.hash && window.location.hash.substr(1) === 'rule_add' ) {
					app.displayAddRule(app.defaultResources.rule);
				} else if ( window.location.hash && window.location.hash.substr(1) === 'mqtt_add' ) {
					app.displayAddMqtt(app.defaultResources.mqtt);
				} else if ( window.location.hash && window.location.hash.substr(1) !== 'login' ) {
					app.setSection(window.location.hash.substr(1));
				} else {
					app.setSection('index');
				}
				app.setHiddenElement("signin_button"); 
				app.setVisibleElement("logout_button");
				
				toast('Hey. Welcome Back! :-)', {timeout:3000, type: 'done'});
				if ( Tawk_API && typeof Tawk_API.setAttributes == 'function' ) {
					Tawk_API.setAttributes({
						'name' : localStorage.getItem('currentUserName')?localStorage.getItem('currentUserName'):null,
						'email': localStorage.getItem('currentUserEmail')?localStorage.getItem('currentUserEmail'):null
					}, function (error) {
						console.log("DEBUG", error);
					});
				}
				setInterval(app.refreshAuthenticate, app.refreshExpiresInSeconds);
				app.getUnits();
				app.getDatatypes();
				app.getFlows();
				app.getSnippets();
			} else {
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					toast('Auth internal error', {timeout:3000, type: "error"});
				}
				app.resetDrawer();
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('We can\'t process your identification. Please resubmit your credentials!', {timeout:3000, type: 'warning'});
				document.querySelectorAll(".mdl-spinner").forEach( function(e) {e.parentNode.removeChild(e);} );
			}
		});
		app.auth = {};
	};
	
	app.refreshAuthenticate = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var refreshPOST = {"grant_type": "refresh_token", "refresh_token": localStorage.getItem('refresh_token')};
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(refreshPOST) };
		var url = app.baseUrl+"/"+app.api_version+"/authenticate";
		
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( response.token && response.refresh_token && response.refreshTokenExp ) {
				localStorage.setItem('bearer', response.token);
				localStorage.setItem('refresh_token', response.refresh_token);
				localStorage.setItem('refreshTokenExp', response.refreshTokenExp);
				
				app.isLogged = true;
				//app.resetSections();

				app.setHiddenElement("signin_button"); 
				app.setVisibleElement("logout_button");
			} else {
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					toast('Auth internal error', {timeout:3000, type: "error"});
				}
				app.resetDrawer();
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('We can\'t process your identification. Please resubmit your credentials on login page!', {timeout:3000, type: 'warning'});
				document.querySelectorAll(".mdl-spinner").forEach( function(div) {e.parentNode.removeChild(e);} );
			}
		});
		app.auth = {};
	};

	app.addMenuItem = function(title, icon, link, position) {
		var menuElt = document.createElement("a");
			menuElt.setAttribute('href', link);
			menuElt.setAttribute('class', 'mdl-navigation__link');
		var iconElt = document.createElement("i");
			iconElt.setAttribute('class', 'material-icons');
			iconElt.appendChild(document.createTextNode(icon));
		menuElt.appendChild(iconElt);
		menuElt.appendChild(document.createTextNode(title));
		menuElt.addEventListener('click', function(evt) {
			app.setSection((evt.target.getAttribute('hash')!==null?evt.target.getAttribute('hash'):evt.target.getAttribute('href')).substr(1));
			app.hideMenu();
		}, false);
		
		if ( position && position > -1 ) {
			
		} else {
			document.querySelector('#drawer nav.mdl-navigation.menu__list').appendChild(menuElt);
		}
	};

	app.getSettings = function() {
		var settings = "";
		
		settings += app.getSubtitle('Application settings');
		settings += "<section class=\"mdl-grid mdl-cell--12-col\">";
		settings += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		settings += "	<div class=\"card-header heading-left\">&nbsp;</div>";
		settings += app.getField('radio_button_checked', 'Floating Action Buttons', app.getSetting('settings.fab_position')!==null?app.getSetting('settings.fab_position'):'fab__bottom', {type: 'select', id: 'settings.fab_position', options: [ {name: 'fab__top', value:'Top position'}, {name: 'fab__bottom', value:'Bottom position'} ], isEdit: true });
		settings += app.getField('format_textdirection_l_to_r', 'Action buttons', app.getSetting('settings.isLtr')!==null?app.getSetting('settings.isLtr'):true, {type: 'select', id: 'settings.isLtr', options: [ {name: 'true', value:'Aligned to the right'}, {name: 'false', value:'Aligned to the left'} ], isEdit: true });
		settings += app.getField('date_range', 'Date Format', app.getSetting('settings.date_format')!==null?app.getSetting('settings.date_format'):app.date_format, {type: 'input', id:'settings.date_format', isEdit: true});
		settings += app.getField('subject', 'Card Chars Limit', app.getSetting('settings.cardMaxChars')!==null?app.getSetting('settings.cardMaxChars'):app.cardMaxChars, {type: 'input', id:'settings.cardMaxChars', isEdit: true, pattern: app.patterns.cardMaxChars, error:'Must be an Integer.'});
		settings += app.getField('room', app.getSetting('settings.geolocalization')!='false'?"Geolocalization is enabled":"Geolocalization is disabled", app.getSetting('settings.geolocalization')!==null?app.getSetting('settings.geolocalization'):true, {type: 'switch', id:'settings.geolocalization', isEdit: true});
		settings += app.getField('bug_report', app.getSetting('settings.debug')!='false'?"Debug is enabled":"Debug is disabled", app.getSetting('settings.debug')!==null?app.getSetting('settings.debug'):app.debug, {type: 'switch', id: 'settings.debug', options: [ {name: 'true', value:'True'}, {name: 'false', value:'False'} ], isEdit: true });
		settings += app.getField('voice_over_off', 'Do Not Track (DNT) header', navigator.doNotTrack=='1'?"Enabled, you are not being tracked. This setting is customized on your browser.":"Disabled, you are tracked :-) and it can be customized on your browser settings.", {type: 'switch', isEdit: false});
		settings += "	</div>";
		settings += "</section>";
		
		settings += app.getSubtitle('API Notifications');
		settings += "<section class=\"mdl-grid mdl-cell--12-col\">";
		settings += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		settings += "	<div class=\"card-header heading-left\">&nbsp;</div>";
		settings += app.getField('notifications', app.getSetting('settings.notifications')!='false'?"Notifications are enabled":"Notifications are disabled", app.getSetting('settings.notifications')!==undefined?app.getSetting('settings.notifications'):true, {type: 'switch', id:'settings.notifications', isEdit: true});
		if ( app.getSetting('settings.pushSubscription.keys.p256dh') ) {
			settings += app.getField('cloud', 'Endpoint', app.getSetting('settings.pushSubscription.endpoint'), {type: 'input', id:'settings.pushSubscription.endpoint', isEdit: true});
			settings += app.getField('vpn_key', 'Key', app.getSetting('settings.pushSubscription.keys.p256dh'), {type: 'input', id:'settings.pushSubscription.keys.p256dh', isEdit: true});
			settings += app.getField('vpn_lock', 'Auth', app.getSetting('settings.pushSubscription.keys.auth'), {type: 'input', id:'settings.pushSubscription.keys.auth', isEdit: true});
		}
		settings += "	</div>";
		settings += "</section>";
		
		(app.containers.settings).querySelector('.page-content').innerHTML = settings;
		componentHandler.upgradeDom();
		
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
					toast('Floating Button are aligned Top.', {timeout:3000, type: 'done'});
				} else {
					for (var f in fabs) {
						if ( (fabs[f]).childElementCount > -1 ) {
							(fabs[f]).classList.remove('fab__top');
							(fabs[f]).classList.add('fab__bottom');
						}
					}
					toast('Floating Button are aligned Bottom.', {timeout:3000, type: 'done'});
				}
			});
		}
		if ( document.getElementById('settings.isLtr') ) {
			document.getElementById('settings.isLtr').addEventListener('change', function(e) {
				app.setSetting('settings.isLtr', e.target.value);
				var fabs = document.querySelectorAll('.mdl-button--fab_flinger-container');
				if ( e.target.value == 'true' ) {
					app.setSetting('settings.isLtr', true);
					toast('Action buttons are aligned to the right.', {timeout:3000, type: 'done'});
				} else {
					app.setSetting('settings.isLtr', false);
					toast('Action buttons are aligned to the left.', {timeout:3000, type: 'done'});
				}
			});
		}
		if ( document.getElementById('switch-settings.notifications') ) {
			document.getElementById('switch-settings.notifications').addEventListener('change', function(e) {
				var label = e.target.parentElement.querySelector('div.mdl-switch__label');
				if ( document.getElementById('switch-settings.notifications').checked == true ) {
					app.setSetting('settings.notifications', true);
					app.askPermission();
					app.subscribeUserToPush();
					label.innerText = "Notifications are enabled";
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast('Awsome, Notifications are enabled.', {timeout:3000, type: 'done'});
					}
				} else {
					label.innerText = "Notifications are disabled";
					app.setSetting('settings.notifications', false);
					toast('Notifications are disabled.', {timeout:3000, type: 'done'});
				}
			});
		}
		if ( document.getElementById('switch-settings.geolocalization') ) {
			document.getElementById('switch-settings.geolocalization').addEventListener('change', function(e) {
				var label = e.target.parentElement.querySelector('div.mdl-switch__label');
				if ( document.getElementById('switch-settings.geolocalization').checked == true ) {
					app.setSetting('settings.geolocalization', true);
					label.innerText = "Geolocalization is enabled";
					app.getLocation();
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast('Awsome, Geolocalization is enabled.', {timeout:3000, type: 'done'});
					}
				} else {
					app.setSetting('settings.geolocalization', false);
					label.innerText = "Geolocalization is disabled";
					toast('Geolocalization is disabled.', {timeout:3000, type: 'done'});
				}
			});
		}
		if ( document.getElementById('switch-settings.debug') ) {
			document.getElementById('switch-settings.debug').addEventListener('change', function(e) {
				var label = e.target.parentElement.querySelector('div.mdl-switch__label');
				if ( document.getElementById('switch-settings.debug').checked == true ) {
					app.setSetting('settings.debug', true);
					label.innerText = "Debug is enabled";
					app.debug = true;
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast('Awsome, Debug mode is activated.', {timeout:3000, type: 'done'});
					}
				} else {
					app.setSetting('settings.debug', false);
					label.innerText = "Debug is disabled";
					app.debug = false;
					toast('Debug mode is disabled.', {timeout:3000, type: 'done'});
				}
			});
		}
		if ( document.getElementById('settings.date_format') ) {
			document.getElementById('settings.date_format').addEventListener('keyup', function(e) {
				app.setSetting('settings.date_format', document.getElementById('settings.date_format').value);
				app.date_format = document.getElementById('settings.date_format').value;
				toast('Date Format has been updated on '+moment().format(app.date_format), {timeout:3000, type: 'done'});
			});
		}
		if ( document.getElementById('settings.cardMaxChars') ) {
			document.getElementById('settings.cardMaxChars').addEventListener('keyup', function(e) {
				if ( (document.getElementById('settings.cardMaxChars').value).match(app.patterns.cardMaxChars) ) {
					app.setSetting('settings.cardMaxChars', document.getElementById('settings.cardMaxChars').value);
					app.cardMaxChars = document.getElementById('settings.cardMaxChars').value;
					toast('Card Limit is set to '+app.cardMaxChars+'.', {timeout:3000, type: 'done'});
				} else {
					toast('Card Limit remain '+app.cardMaxChars+'.', {timeout:3000, type: 'done'});
				}
			});
		}
	};

	app.getStatus = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/status";
		
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( !navigator.onLine ) {
				(app.containers.status).querySelector('.page-content').innerHTML = app.getCard(app.offlineCard);
			} else {
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
				status += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='status-details'>";
				status += "					<i class='material-icons'>expand_more</i>";
				status += "				</button>";
				status += "			</span>";
				status += "		</div>";
				status += "		<div class=\"card-body\">";
				status += "			<div class='mdl-list__item--three-line small-padding  mdl-card--expand' id='status-details'>";
				status += app.getField('thumb_up', 'Name', response.appName, {type: 'text', isEdit: false});
				status += app.getField('verified_user', 'Version', response.version, {type: 'text', isEdit: false});
				status += app.getField(app.icons.status, 'Status', response.status, {type: 'text', isEdit: false});
				status += app.getField(app.icons.mqtts, 'Mqtt Topic Info', response.mqttInfo, {type: 'text', isEdit: false});
				status += app.getField('alarm', 'Last Update', response.started_at, {type: 'text', isEdit: false});
				status += "			</div>";
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
					status += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='status-usage'>";
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
				
				(app.containers.status).querySelector('.page-content').innerHTML = status;
				if ( app.RateLimit.Used && app.RateLimit.Limit ) {
					var rate = Math.ceil((app.RateLimit.Used * 100 / app.RateLimit.Limit)/10)*10;
					document.querySelector('#progress-status').addEventListener('mdl-componentupgraded', function() {
						this.MaterialProgress.setProgress(rate);
					});
				}
				app.setExpandAction();
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('Can\'t display Status...' + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	};

	app.getTerms = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/terms";
		
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			var terms = "";
			for (var i=0; i < (response).length ; i++ ) {
				terms += "<section class=\"mdl-grid mdl-cell--12-col\">";
				terms += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if( response[i].title ) {
					terms += "	<div class=\"mdl-card__title\">";
					terms += "		<span class=\"mdl-typography--headline\">";
					terms += "			<i class=\"material-icons md-48\">business_center</i>"+response[i].title+"</span>";
					terms += "	</div>";
				}
				terms += "		<div class=\"mdl-card__supporting-text no-padding\">";
				terms += response[i].description;
				terms += "		</div>";
				terms += "	</div>";
				terms += "</section>";
			}
			
			(app.containers.terms).querySelector('.page-content').innerHTML = terms;
			if ( !app.isLogged ) {
				app.displayLoginForm( (app.containers.terms).querySelector('.page-content') );
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('Can\'t display Terms...' + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	};
	
	app.toggleElement = function(id) {
		document.querySelector('#'+id).classList.toggle('hidden');
	};
	
	app.setHiddenElement = function(id) {
		document.querySelector('#'+id).classList.add('hidden');
	};
	
	app.setVisibleElement = function(id) {
		document.querySelector('#'+id).classList.remove('hidden');
	};

	app.showNotification = function() {
		toast('You are offline.', {timeout:3000, type: 'warning'});
	};
	
	app.sessionExpired = function() {
		localStorage.setItem('bearer', null);
		localStorage.setItem('refresh_token', null);
		localStorage.setItem('refreshTokenExp', null);
		localStorage.setItem('flows', null);
		localStorage.setItem('snippets', null);
		localStorage.setItem('currentUserId', null);
		localStorage.setItem('currentUserName', null);
		localStorage.setItem('currentUserEmail', null);
		localStorage.setItem('currentUserHeader', null);
		localStorage.setItem('notifications.unsubscribed', null);
		localStorage.setItem('notifications.unsubscription_token', null);
		localStorage.setItem('notifications.email', null);
		localStorage.setItem('role', null);
		(app.containers.profile).querySelector('.page-content').innerHTML = "";
		
		app.auth = {};
		app.RateLimit = {Limit: null, Remaining: null, Used: null};
		app.itemsSize = {objects: 15, flows: 15, snippets: 15, dashboards: 15, mqtts: 15, rules: 15};
		app.itemsPage = {objects: 1, flows: 1, snippets: 1, dashboards: 1, mqtts: 1, rules: 1};
		if ( !app.isLogged ) toast('Your session has expired. You must sign-in again.', {timeout:3000, type: "error"});
		app.isLogged = false;
		app.resetDrawer();
		
		app.setVisibleElement("signin_button"); 
		app.setHiddenElement("logout_button");
		app.setDrawer();

		app.refreshButtonsSelectors();
		componentHandler.upgradeDom();

		(app.containers.objects).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Connected Objects', titlecolor: '#ffffff', description: 'Connecting anything physical or virtual to t6 Api without any hassle. Embedded, Automatization, Domotic, Sensors, any Objects or Devices can be connected and communicate to t6 via RESTful API. Unic and dedicated application to rules them all and designed to simplify your journey.'}); // ,
		app.displayLoginForm( (app.containers.objects).querySelector('.page-content') );
		(app.containers.flows).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Time-series Datapoints', titlecolor: '#ffffff', description: 'Communication becomes easy in the platform with Timestamped values. Flows allows to retrieve and classify data.', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		app.displayLoginForm( (app.containers.flows).querySelector('.page-content') );
		(app.containers.dashboards).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Dashboards', titlecolor: '#ffffff', description: 't6 support multiple Snippets to create your own IoT Dashboards for data visualization. Snippets are ready to Use Html components integrated into the application. Dashboards allows to empower your data-management by Monitoring and Reporting activities.', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		app.displayLoginForm( (app.containers.dashboards).querySelector('.page-content') );
		(app.containers.snippets).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Snippets', titlecolor: '#ffffff', description: 'Snippets are components to embed into your dashboards and displays your data', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		app.displayLoginForm( (app.containers.snippets).querySelector('.page-content') );
		(app.containers.rules).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Decision Rules to get smart', titlecolor: '#ffffff', description: 'Trigger action from Mqtt and decision-tree. Let\'s your Objects talk to the platform as events.', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		app.displayLoginForm( (app.containers.rules).querySelector('.page-content') );
		(app.containers.mqtts).querySelector('.page-content').innerHTML = app.getCard({image: app.baseUrlCdn+'/img/opl_img3.jpg', title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.', action: {id: 'login', label: 'Sign-In'}, secondaryaction: {id: 'signup', label: 'Create an account'}});
		app.displayLoginForm( (app.containers.mqtts).querySelector('.page-content') );
		
		var updated = document.querySelectorAll('.page-content form div.mdl-js-textfield');
		for (var i=0; i<updated.length;i++) {
			updated[i].classList.remove('is-upgraded');
			updated[i].removeAttribute('data-upgraded');
		}
		
		componentHandler.upgradeDom();
		app.refreshButtonsSelectors();
		app.setLoginAction();
		app.setSignupAction();
	};
	
	app.resetSections = function() {
		/* reset views to default */
		if (localStorage.getItem('settings.debug') == 'true') { console.log('DEBUG resetSections()'); }
		(app.containers.objects).querySelector('.page-content').innerHTML = '';
		(app.containers.object).querySelector('.page-content').innerHTML = '';
		(app.containers.flows).querySelector('.page-content').innerHTML = '';
		(app.containers.flow).querySelector('.page-content').innerHTML = '';
		(app.containers.dashboards).querySelector('.page-content').innerHTML = '';
		(app.containers.dashboard).querySelector('.page-content').innerHTML = '';
		(app.containers.snippets).querySelector('.page-content').innerHTML = '';
		(app.containers.snippet).querySelector('.page-content').innerHTML = '';
		(app.containers.profile).querySelector('.page-content').innerHTML = '';
		(app.containers.rules).querySelector('.page-content').innerHTML = '';
		(app.containers.rule).querySelector('.page-content').innerHTML = '';
		(app.containers.mqtts).querySelector('.page-content').innerHTML = '';
		(app.containers.mqtt).querySelector('.page-content').innerHTML = '';
	};

	/*
	 * *********************************** indexedDB ***********************************
	 */
	var db;
	var idbkr;
	var objectStore;
	
	app.clearJWT = function() {
		var jwt;
		var tx = db.transaction(["jwt"], "readwrite");
		var request = tx.objectStore("jwt");
		var objectStoreRequest = request.clear();
	};
	
	app.addJWT = function(jwt) {
		var item = { token: jwt, exp: moment().add(5, 'minute').unix() };
		var transaction = db.transaction(['jwt'], 'readwrite');
		var store = transaction.objectStore('jwt');
		var request = store.add(item);
		request.onsuccess = function(event) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log("DEBUG", "add(): onsuccess.");
			}
		}
		request.onerror = function(event) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log("DEBUG", "add(): onerror.");
				console.log(event);
			}
		}
	};
	
	app.searchJWT = function() {
		var jwt;
		var tx = db.transaction(["jwt"], "readonly");
		var request = tx.objectStore("jwt").index("exp");

		var toDate = moment().unix();
		var range = idbkr.upperBound(""+toDate, false);
		request.openCursor(range, 'prev').onsuccess = function(e) {
			var cursor = e.target.result;
			if(cursor && cursor.value['token']) {
				jwt = cursor.value['token'];
				if ( app.debug == true ) {
					console.log('Using JWT expiring on '+moment(parseInt(cursor.value['exp']*1000)).format(app.date_format));
				}
				localStorage.setItem('bearer', jwt);
				app.resetSections();
				app.setSection('index');
				app.setHiddenElement("signin_button"); 
				app.setVisibleElement("logout_button");
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					console.log("[JWT]", "Autologin completed. Using JWT:");
					console.log(jwt);
				}
				toast('Still here! :-)', {timeout:3000, type: 'done'});
				
				return jwt;
			}
		}
		tx.onabort = function() {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log("[JWT]", "searchJWT(): tx onerror.");
				console.log(tx.error);
			}
		}
		request.openCursor(range, 'prev').onerror = function(e) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log("[JWT]", "openCursor: onerror.");
			}
		}
		request.onsuccess = function(event) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log("[JWT]", "searchJWT(): onsuccess.");
			}
		};
		request.onerror = function(event) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log("[JWT]", "searchJWT(): onerror.");
				console.log(event);
			}
		}
		return jwt;
	};

	app.showOrientation = function() {
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			toast("[Orientation]", screen.orientation.type + " - " + screen.orientation.angle + "°.", {timeout:3000, type: 'info'});
		}
	};
	
	app.setPosition = function(position) {
		app.defaultResources.object.attributes.longitude = position.coords.longitude;
		app.defaultResources.object.attributes.latitude = position.coords.latitude;
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			toast("Geolocation (Accuracy="+position.coords.accuracy+") is set to: L"+position.coords.longitude+" - l"+position.coords.latitude, {timeout:3000, type: 'info'});
		}
	};
	
	app.setPositionError = function(error) {
		switch (error.code) {
			case error.TIMEOUT:
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					toast("Browser geolocation error !\n\nTimeout.", {timeout:3000, type: "error"});
				}
				break;
			case error.POSITION_UNAVAILABLE:
				// dirty hack for safari
				if(error.message.indexOf("Origin does not have permission to use Geolocation service") == 0) {
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast("Origin does not have permission to use Geolocation service - no fallback.", {timeout:3000, type: "error"});
					}
				} else {
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast("Browser geolocation error !\n\nPosition unavailable.", {timeout:3000, type: "error"});
					}
				}
				break;
			case error.PERMISSION_DENIED:
				if(error.message.indexOf("Only secure origins are allowed") == 0) {
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast("Only secure origins are allowed - no fallback.", {timeout:3000, type: "error"});
					}
				}
				break;
			case error.UNKNOWN_ERROR:
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					toast("Can't find your position - no fallback.", {timeout:3000, type: "error"});
				}
				break;
		}
	};
	
	app.getLocation = function() {
		if (navigator.geolocation) {
			var options = { enableHighAccuracy: false, timeout: 200000, maximumAge: 500000 };
			navigator.geolocation.getCurrentPosition(app.setPosition, app.setPositionError, options);
		} else {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast("Geolocation is not supported by this browser.", {timeout:3000, type: 'warning'});
			}
		}
	};
	
	app.getCookie = function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	};
	
	/*
	 * *********************************** Run the App ***********************************
	 */
	if ( localStorage.getItem('refresh_token') !== null && localStorage.getItem('refreshTokenExp') !== null && localStorage.getItem('refreshTokenExp') > moment().unix() ) {
		app.isLogged = true;
	}
	
	document.addEventListener("DOMContentLoaded", function() {
		var currentPage = localStorage.getItem("currentPage");
		if ( window.location.hash ) {
			currentPage = window.location.hash.substr(1);
			if ( currentPage === 'terms' ) {
				app.onTermsButtonClick();
			} else if ( currentPage === 'docs' ) {
				app.onDocsButtonClick();
			} else if ( currentPage === 'status' ) {
				app.onStatusButtonClick();
			} else if ( currentPage === 'settings' ) {
				app.onSettingsButtonClick();
			} else if ( currentPage === 'login' ) {
				app.isLogged = false;
				localStorage.setItem("bearer", null);
				app.setSection(currentPage);
			} else {
				app.setSection(currentPage);
			}
		} else if ( currentPage ) {
			if ( (currentPage === 'object' || currentPage === 'objects') ) {
				app.setSection('objects');
			} else if ( (currentPage === 'flow' || currentPage === 'flows') ) {
				app.setSection('flows');
			} else if ( (currentPage === 'dashboard' || currentPage === 'dashboards') ) {
				app.setSection('dashboards');
			} else if ( (currentPage === 'snippet' || currentPage === 'snippets') ) {
				app.setSection('snippets');
			} else if ( (currentPage === 'rule' || currentPage === 'rules') ) {
				app.setSection('rules');
			} else if ( (currentPage === 'mqtt' || currentPage === 'mqtts') ) {
				app.setSection('mqtts');
			} else {
				app.setSection(currentPage);
			}
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast("Back to last page view if available in browser storage", {timeout:3000, type: 'info'});
			}
		} else {
			app.setSection('index');
		}
	});
	app.fetchIndex('index');
	app.refreshButtonsSelectors();
	app.setLoginAction();
	app.setSignupAction();
	app.refreshButtonsSelectors();
	app.setPasswordResetAction();
	app.setForgotAction();
	
	if( !app.isLogged || app.auth.username === undefined ) {
		if ( localStorage.getItem('refresh_token') !== null && localStorage.getItem('refreshTokenExp') !== null && localStorage.getItem('refreshTokenExp') > moment().unix() ) {
			app.refreshAuthenticate();

			app.setHiddenElement("signin_button");
			app.setVisibleElement("logout_button");
			app.getUnits();
			app.getDatatypes();
			app.getSnippets();
			app.getFlows();
			setInterval(app.refreshAuthenticate, app.refreshExpiresInSeconds);
			if ( localStorage.getItem('role') == 'admin' ) {
				app.addMenuItem('Users Accounts', 'supervisor_account', '#users-list', null);
			}
		} else {
			app.sessionExpired();
		}
	}

	// Notifications
	for (var i in app.buttons.notifications) {
		if ( app.buttons.notifications[i].childElementCount > -1 ) {
			app.buttons.notifications[i].addEventListener('click', function(e) {
				var email = "";
				var token = "";
				if ( getParameterByName("email", null) ) {
					email = decodeURI(getParameterByName("email", null));
				} else {
					email = app.getSetting("notifications.email");
				}
				if ( getParameterByName("token", null) ) {
					token = decodeURI(getParameterByName("token", null));
				} else {
					token = app.getSetting("notifications.unsubscription_token");
				}
				if ( email && token ) {
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "GET", headers: myHeaders };
					var type = e.target.parentNode.classList.contains("is-checked")?"unsubscribe": "subscribe";
					var url = app.baseUrl+"/mail/"+email+"/"+type+"/"+e.target.getAttribute("name")+"/"+token+"/";
					fetch(url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(fetchResponse){ 
						return fetchResponse.json();
					})
					.then(function(response) {
						console.log(response);
						toast('Settings updated.', {timeout:3000, type: 'done'});
					})
					.catch(function (error) {
						if ( localStorage.getItem('settings.debug') == 'true' ) {
							toast('Error occured on saving Notifications...' + error, {timeout:3000, type: "error"});
						}
					});
				} else {
					if ( localStorage.getItem('settings.debug') == 'true' ) {
						toast('Error occured on saving Notifications...' + error, {timeout:3000, type: "error"});
					}
				}
			}, false);
		}
	}
	
	app.refreshButtonsSelectors();
	if ( document.querySelector('.sticky') ) {
		if (!window.getComputedStyle(document.querySelector('.sticky')).position.match('sticky')) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast("Your browser does not support 'position: sticky'!!.", {timeout:3000, type: 'info'});
			}
		}
	}
	if ( document.getElementById('search-exp') ) {
		document.getElementById('search-exp').addEventListener('keypress', function(e) {
			if(e.keyCode === 13) {
				e.preventDefault();
				var input = this.value;
				if ( localStorage.getItem('settings.debug') == 'true' ) {
					alert("Searching for "+input);
				}
			}
		});
	}

	if ( document.getElementById('filter-exp') ) {
		document.getElementById('filter-exp').addEventListener('keypress', function(e) {
			if(e.keyCode === 13) {
				e.preventDefault();
				var input = this.value;
				var type = 'objects';
				var size;
				if ( document.querySelector('section#objects').classList.contains('is-active') ) {
					type = 'objects';
					size = app.itemsSize.objects;
				} else if ( document.querySelector('section#flows').classList.contains('is-active') ) {
					type = 'flows';
					size = app.itemsSize.flows;
				}
				app.fetchItemsPaginated(type, this.value, 1, size);
			}
		});
	}
	
	window.addEventListener('hashchange', function() {
		if( window.history && window.history.pushState ) {
			localStorage.setItem("currentPage", window.location.hash.substr(1));
			var id = getParameterByName('id');
			var id2 = window.location.hash;
			if ( id ) {
				localStorage.setItem("currentResourceId", id);
			} else {
				localStorage.setItem("currentResourceId", null);
			}
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[History]', 'hashchange');
				console.log('[History]', window.location.hash.substr(1));
				console.log('[History]', 'resource id', id2);
			}
		}
	}, false);
	
	for (var i in app.buttons.status) {
		if ( app.buttons.status[i].childElementCount > -1 ) {
			app.buttons.status[i].removeEventListener('click', app.onStatusButtonClick, false);
			app.buttons.status[i].addEventListener('click', app.onStatusButtonClick, false);
		}
	}
	for (var i in app.buttons.settings) {
		if ( app.buttons.settings[i].childElementCount > -1 ) {
			app.buttons.settings[i].removeEventListener('click', app.onSettingsButtonClick, false);
			app.buttons.settings[i].addEventListener('click', app.onSettingsButtonClick, false);
		}
	}
	for (var i in app.buttons.docs) {
		if ( app.buttons.docs[i].childElementCount > -1 ) {
			app.buttons.docs[i].removeEventListener('click', app.onDocsButtonClick, false);
			app.buttons.docs[i].addEventListener('click', app.onDocsButtonClick, false);
		}
	}
	for (var i in app.buttons.terms) {
		if ( app.buttons.terms[i].childElementCount > -1 ) {
			app.buttons.terms[i].removeEventListener('click', app.onTermsButtonClick, false);
			app.buttons.terms[i].addEventListener('click', app.onTermsButtonClick, false);
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
	screen.orientation.addEventListener("change", app.showOrientation);
	//screen.orientation.unlock();
	if (!('indexedDB' in window)) {
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('[indexedDB]', 'This browser doesn\'t support IndexedDB.');
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
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[indexedDB]', 'Database is on-error: ' + event.target.errorCode);
			}
		};
		request.onsuccess = function(event) {
			db = request.result;
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[indexedDB]', 'Database is on-success');
				console.log('[indexedDB]', 'searchJWT(): ');
			}
			if ( app.autologin === true ) {
				app.searchJWT();
			}
		};
		request.onupgradeneeded = function(event) {
			db = event.target.result;
			objectStore = db.createObjectStore("jwt", {keyPath: "exp", autoIncrement: true});
			objectStore.createIndex("exp", "exp", { unique: false, autoIncrement: true });
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[indexedDB]', 'Database is on-upgrade-needed');
			}
		};
	}
	
	// Cookie Consent
	var d = new Date();
	d.setTime(d.getTime() + (app.cookieconsent * 24*60*60*1000));
	document.getElementById('cookieconsent.agree').addEventListener('click', function(evt) {
		document.getElementById('cookieconsent').classList.add('hidden');
		document.cookie = "cookieconsent=true;expires=" + d.toUTCString() + ";path=/";
		document.cookie = "cookieconsentNoGTM=false;expires=" + d.toUTCString() + ";path=/";
		evt.preventDefault();
	}, false);
	document.getElementById('cookieconsent.noGTM').addEventListener('click', function(evt) {
		document.getElementById('cookieconsent').classList.add('hidden');
		document.cookie = "cookieconsent=true;expires=" + d.toUTCString() + ";path=/";
		document.cookie = "cookieconsentNoGTM=true;expires=" + d.toUTCString() + ";path=/";
		evt.preventDefault();
	}, false);
	document.getElementById('cookieconsent.read').addEventListener('click', function(evt) {
		app.getTerms();
		app.setSection('terms');
		evt.preventDefault();
	}, false);
	if ( app.getCookie('cookieconsent') !== "true" ) {
		document.getElementById('cookieconsent').classList.add('is-visible');
		document.getElementById('cookieconsent').classList.remove('hidden');
	} else {
		document.getElementById('cookieconsent').classList.add('hidden');
		document.getElementById('cookieconsent').classList.remove('is-visible');
	}

	/*
	 * *********************************** Menu ***********************************
	 */
	app.showMenu = function() {
		app.containers.menuElement.style.transform = "translateX(0) !important";
		app.containers.menuElement.classList.add('menu--show');
		app.containers.menuOverlayElement.classList.add('menu__overlay--show');
		app.containers.drawerObfuscatorElement.remove();
		if ( dataLayer !== undefined ) {
			dataLayer.push({
				'eventCategory': 'Interaction',
				'eventAction': 'change',
				'eventLabel': 'show',
				'eventValue': '1',
				'event': 'Menu'
			});
		}
	};
	app.hideMenu = function() {
		app.containers.menuElement.style.transform = "translateX(-120%) !important";
		app.containers.menuElement.classList.remove('menu--show');
		app.containers.menuOverlayElement.classList.add('menu__overlay--hide');
		app.containers.menuOverlayElement.classList.remove('menu__overlay--show');
		app.containers.menuElement.addEventListener('transitionend', app.onTransitionEnd, false);
		app.containers.menuElement.classList.remove('is-visible');
		if ( dataLayer !== undefined ) {
			dataLayer.push({
				'eventCategory': 'Interaction',
				'eventAction': 'change',
				'eventLabel': 'hide',
				'eventValue': '1',
				'event': 'Menu'
			});
		}
	};
	app.onTransitionEnd = function() {
		if (touchStartPoint < 10) {
			app.containers.menuElement.style.transform = "translateX(0)";
			app.containers.menuOverlayElement.classList.add('menu__overlay--show');
			app.containers.menuElement.removeEventListener('transitionend', app.onTransitionEnd, false);
		}
	};
	logout_button.addEventListener('click', function(evt) {
		app.auth={};
		app.clearJWT();
		app.resetDrawer();
		app.sessionExpired();
		toast('You have been disconnected :-(', {timeout:3000, type: 'done'});
		app.setSection((evt.currentTarget.querySelector('a').getAttribute('hash')!==null?evt.currentTarget.querySelector('a').getAttribute('hash'):evt.currentTarget.querySelector('a').getAttribute('href')).substr(1));
	}, false);
	signin_button.addEventListener('click', function(evt) {
		app.auth={};
		app.setSection('login');
	}, false);
	app.buttons.notification.addEventListener('click', function(evt) {
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

	app.refreshContainers();
	if ( app.containers.menuIconElement ) {
		app.containers.menuIconElement.addEventListener('click', app.showMenu, false);
		app.containers.menuIconElement.querySelector('i.material-icons').setAttribute('id', 'imgIconMenu');
		app.containers.menuOverlayElement.addEventListener('click', app.hideMenu, false);
		app.containers.menuElement.addEventListener('transitionend', app.onTransitionEnd, false);
		for (var item in app.containers.menuItems) {
			if ( app.containers.menuItems[item].childElementCount > -1 ) {
				(app.containers.menuItems[item]).addEventListener('click', function(evt) {
					app.setSection((evt.currentTarget.getAttribute('href')).substr(1));
					app.hideMenu();
				}, false);
			}
		};
	}
	for (var item in app.containers.menuTabItems) {
		if ( app.containers.menuTabItems[item].childElementCount > -1 ) {
			(app.containers.menuTabItems[item]).addEventListener('click', function(evt) {
				app.setSection((evt.target.parentNode.getAttribute('hash')!==null?evt.target.parentNode.getAttribute('hash'):evt.target.parentNode.getAttribute('href')).substr(1));
			}, false);
		}
	};
	document.body.addEventListener('touchstart', function(event) {
		touchStartPoint = event.changedTouches[0].pageX;
		touchMovePoint = touchStartPoint;

		var fabs = document.querySelectorAll('section.is-active div.page-content.mdl-grid .mdl-button--fab');
		for (var f in fabs) {
			if ( fabs[f].classList ) {
				fabs[f].classList.remove('is-here');
				fabs[f].classList.add('is-not-here');
			}
		}
	}, false);
	document.body.addEventListener('touchmove', function(event) {
		touchMovePoint = event.touches[0].pageX;
		if (touchStartPoint < 10 && touchMovePoint > 100) {
			app.containers.menuElement.classList.add('is-visible');
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
	/*
	document.querySelector('.mdl-layout__content').addEventListener('touchend', function(event) {
		if(event.handled !== true) {
			//console.log(touchStartPoint, touchMovePoint, touchStartPoint-touchMovePoint);
			if ( touchMovePoint < touchStartPoint && touchMovePoint-touchStartPoint < -50 ) {
				// swipe left
				if ( app.currentSection === 'index' ) {
					app.setSection('objects', 'ltr');
				} else if ( app.currentSection === 'objects' || app.currentSection === 'object' || app.currentSection === 'object_add' ) {
					app.setSection('flows', 'ltr');
				} else if ( app.currentSection === 'flows' || app.currentSection === 'flow' || app.currentSection === 'flow_add' ) {
					app.setSection('dashboards', 'ltr');
				} else if ( app.currentSection === 'dashboards' || app.currentSection === 'dashboard' || app.currentSection === 'dashboard_add' ) {
					app.setSection('snippets', 'ltr');
				} else if ( app.currentSection === 'snippets' || app.currentSection === 'snippet' || app.currentSection === 'snippet_add' ) {
					app.setSection('rules', 'ltr');
				} else if ( app.currentSection === 'rules' || app.currentSection === 'rule' || app.currentSection === 'rule_add' ) {
					app.setSection('mqtts', 'ltr');
				} else if ( app.currentSection === 'mqtts' || app.currentSection === 'mqtt' || app.currentSection === 'mqtt_add' ) {
				}
			} else if ( touchMovePoint-touchStartPoint > 50 ) {
				// swipe right
				if ( app.currentSection === 'index' ) {
				} else if ( app.currentSection === 'objects' || app.currentSection === 'object' || app.currentSection === 'object_add' ) {
					app.setSection('index', 'rtl');
				} else if ( app.currentSection === 'flows' || app.currentSection === 'flow' || app.currentSection === 'flow_add' ) {
					app.setSection('objects', 'rtl');
				} else if ( app.currentSection === 'dashboards' || app.currentSection === 'dashboard' || app.currentSection === 'dashboard_add' ) {
					app.setSection('flows', 'rtl');
				} else if ( app.currentSection === 'snippets' || app.currentSection === 'snippet' || app.currentSection === 'snippet_add' ) {
					app.setSection('dashboards', 'rtl');
				} else if ( app.currentSection === 'rules' || app.currentSection === 'rule' || app.currentSection === 'rule_add' ) {
					app.setSection('snippets', 'rtl');
				} else if ( app.currentSection === 'mqtts' || app.currentSection === 'mqtt' || app.currentSection === 'mqtt_add' ) {
					app.setSection('rules', 'rtl');
				}
			}
			event.handled = true;
		}
	}, false);
	*/

	/* Lazy loading */
	var paginatedContainer = Array(Array(app.containers.objects, 'objects'), Array(app.containers.flows, 'flows'), Array(app.containers.snippets, 'snippets'), Array(app.containers.dashboards, 'dashboards'), Array(app.containers.mqtts, 'mqtts'), Array(app.containers.rules, 'rules'));
	paginatedContainer.map(function(c) {
		c[0].addEventListener('DOMMouseScroll', function(event) {
			var height = (document.body.scrollHeight || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
			var bottom = (document.querySelector('section#'+c[1])).getBoundingClientRect().bottom;
			if ( bottom <= height && c[0].classList.contains('is-active') ) {
				//console.log("Lazy loading -->", c[0].offsetHeight, height, bottom);
				//console.log('Lazy loading page=', ++(app.itemsPage[c[1]]));
			}
		});
	}); // Lazy loading
	
	/* Lazy loading on images */
	if (!('IntersectionObserver' in window)) {
		var LL = document.querySelectorAll('img.lazyloading');
		for (var image in LL) {
			if ( (LL[image]).childElementCount > -1 ) {
				app.preloadImage(LL[image]);
			}
		}
	} else {
		var io = new IntersectionObserver(
			entries => {
				entries.map(function(IOentry) {
					if (IOentry.intersectionRatio > 0 && navigator.onLine) {
						io.unobserve(IOentry.target);
						app.preloadImage(IOentry.target);
					}
				});
			}, {}
		);
		var LL = document.querySelectorAll('img.lazyloading');
		for (var image in LL) {
			if ( (LL[image]).childElementCount > -1 ) {
				(LL[image]).src = app.baseUrlCdn + '/img/m/placeholder.png';
				io.observe(LL[image]);
			}
		}
	} // Lazy loading on images
	
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
	
	if ( app.gtm && app.getCookie('cookieconsentNoGTM') !== "true" ) {
		(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
			new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
			j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
			'//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
			})(window,document,'script','dataLayer',app.gtm);
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('[gtm]', 'gtm.start');
		}
	}

	if (!('serviceWorker' in navigator)) {
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('[ServiceWorker]', 'Service Worker isn\'t supported on this browser.');
		}
		return;
	} else {
		if (!('PushManager' in window)) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[pushSubscription]', 'Push isn\'t supported on this browser.');
			}
			return;
		} else {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('[pushSubscription]', 'askPermission && subscribeUserToPush');
			}
			app.askPermission();
			app.subscribeUserToPush();
		}
	};

	/*
	 * *********************************** Offline ***********************************
	 */
	document.addEventListener('DOMContentLoaded', function(event) {
		if (!navigator.onLine) { updateNetworkStatus(); }
		window.addEventListener('online', updateNetworkStatus, false);
		window.addEventListener('offline', updateNetworkStatus, false);
	});
	function updateNetworkStatus() {
		var msg = ''; var type= '';
		if (navigator.onLine) {
			msg = 'You are now online...';
			type: 'done';
			app.setHiddenElement("notification");
			if ( self.dataLayer !== undefined ) {
				self.dataLayer.push({
					'eventCategory': 'navigator.onLine',
					'eventAction': 'change',
					'eventLabel': msg,
					'event': true
				});
			}
		}
		else {
			msg = 'You are now offline...';
			type: 'warning';
			app.setVisibleElement("notification");
		}
		
		var spacers = document.querySelectorAll(".spacer");
		for (var s in spacers) {
			if ( (spacers[s]).childElementCount > -1 ) {
				spacers[s].innerHTML = msg;
			}
		}
	}
})();
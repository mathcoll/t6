/*
 * Debug console filters:
 *  DEBUG
 *  [gtm]
 *  [indexedDB]
 *  [JWT]
 *  [History]
 *  [Orientation]
 *  [pushSubscription]
 *  [ServiceWorker]
 *  [setSection]
 *  [Network]
 */
"use strict";

if (localStorage.getItem("settings.debug") == "true") {
	var beginTime = new Date();
	console.log("DEBUG", "begin time: ", beginTime - startTime, "ms", " (begin",  moment(beginTime).format("hh:mm:ss,SSS"), "ms.)");
}
var app = {
	api_version: "v2.0.1",
	debug: false,
	baseUrl: "",
	baseUrlCdn: "//cdn.internetcollaboratif.info",
	bearer: "",
	auth: {},
	isLogged: false,
	autologin: false,
	RateLimit: { Limit: null, Remaining: null, Used: null },
	date_format: "DD/MM/YYYY, HH:mm",
	cardMaxChars: 256,
	cookieconsent: 30,
	refreshExpiresInSeconds: 280000,
	toastDuration: 3000,
	itemsSize: { objects: 15, flows: 15, snippets: 15, dashboards: 15, mqtts: 15, rules: 15, sources: 15 },
	itemsPage: { objects: 1, flows: 1, snippets: 1, dashboards: 1, mqtts: 1, rules: 1, sources: 1, },
	currentSection: "index",
	tawktoid: "58852788bcf30e71ac141187",
	gtm: "GTM-PH7923",
	applicationServerKey: "BHnrqPBEjHfdNIeFK5wdj0y7i5eGM2LlPn62zxmvN8LsBTFEQk1Gt2zrKknJQX91a8RR87w8KGP_1gDSy8x6U7s",
	registration: null,
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
		"source": "t6 Source %s",
		"sources": "t6 Sources",
		"source_add": "Add Source to t6",
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
		"compatible-devices": "t6 Compatible Devices",
		"openSourceLicenses": "Open-Source licenses",
		"exploration": "Data Exploration",
		"objects-maps": "Objects Maps",
		"manage_notifications": "Customize notifications",
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
		"link_off": "link_off",
		"login": "email",
		"menu": "menu",
		"mqtts": "volume_down",
		"sources": "code",
		"code": "code",
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
		"version": "linear_scale",
	},
	types: [
		{ name: "cast", value: "Cast" },
		{ name: "cast_connected", value: "Cast Connected" },
		{ name: "computer", value: "Computer" },
		{ name: "desktop_mac", value: "Desktop Mac" },
		{ name: "desktop_windows", value: "Desktop Windows" },
		{ name: "developer_board", value: "Developer Board" },
		{ name: "device_hub", value: "Device Hub" },
		{ name: "devices_other", value: "Devices Other" },
		{ name: "device_unknown", value: "Devices Unknown" },
		{ name: "dock", value: "Dock" },
		{ name: "earbuds", value: "Earbuds" },
		{ name: "gamepad", value: "Gamepad" },
		{ name: "headset", value: "Headset" },
		{ name: "headset_mic", value: "Headset Mic" },
		{ name: "home_mini", value: "Home mini" },
		{ name: "keyboard", value: "Keyboard" },
		{ name: "keyboard_voice", value: "Keyboard Voice" },
		{ name: "laptop", value: "Laptop" },
		{ name: "laptop_chromebook", value: "Laptop Chromebook" },
		{ name: "laptop_mac", value: "Laptop Mac" },
		{ name: "laptop_windows", value: "Laptop Windows" },
		{ name: "memory", value: "Memory" },
		{ name: "monitor", value: "Monitor" },
		{ name: "mouse", value: "Mouse" },
		{ name: "point_of_sale", value: "Point of sale" },
		{ name: "phone_android", value: "Phone Android" },
		{ name: "phone_iphone", value: "Phone Iphone" },
		{ name: "phonelink", value: "Phonelink" },
		{ name: "router", value: "Router" },
		{ name: "scanner", value: "Scanner" },
		{ name: "security", value: "Security" },
		{ name: "sim_card", value: "Sim Card" },
		{ name: "smartphone_display", value: "Smar Display" },
		{ name: "smart_screen", value: "Smart Screen" },
		{ name: "smart_toy", value: "Smart Toy" },
		{ name: "smartphone", value: "Smartphone" },
		{ name: "speaker", value: "Speaker" },
		{ name: "speaker_group", value: "Speaker Group" },
		{ name: "tablet", value: "Tablet" },
		{ name: "tablet_android", value: "Tablet Android" },
		{ name: "tablet_mac", value: "Tablet Mac" },
		{ name: "toys", value: "Toys" },
		{ name: "tv", value: "Tv" },
		{ name: "videogame_asset", value: "Videogame Asset" },
		{ name: "watch", value: "Watch" },
	],
	snippetTypes: [],
	EventTypes: [{ name: "mqttPublish", value: "mqtt Publish" }, { name: "email", value: "Email" }, { name: "webPush", value: "Notification webPush (beta)" }, { name: "httpWebhook", value: "http(s) Webhook" }, { name: "sms", value: "Sms/Text message" }, { name: "ifttt", value: "Trigger event to Ifttt" }, { name: "serial", value: "Serial using Arduino CmdMessenger" }],
	units: [],
	datatypes: [],
	flows: [],
	sources: [],
	snippets: [],
	defaultResources: {
		object: { id: "", attributes: { name: "", description: "", is_public: false, type: "", ipv4: "", ipv6: "", longitude: 0, latitude: 0, position: "", source_id: "-", ui_id: "" } },
		flow: { id: "", attributes: { name: "", mqtt_topic: "", require_signed: false, require_encrypted: false } },
		dashboard: { id: "", attributes: { name: "", description: "" } },
		snippet: { id: "", attributes: { name: "", icon: "", color: "" } },
		mqtt: { id: "", attributes: { name: "" } },
		source: { id: "", attributes: { name: "" } },
		rule: { id: '', active: true, attributes: { name: '', priority: 1, event: { type: "email", conditions: '{"all":[ { "fact":"environment", "operator":"equal", "value":"production" }]}', parameters: "{}" } } },
	},
	offlineCard: {},
	patterns: {
		name: ".{3,}",
		ipv4: "((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}(:[0-9]{1,6})?",
		ipv6: "/^(?>(?>([a-f0-9]{1,4})(?>:(?1)){7}|(?!(?:.*[a-f0-9](?>:|$)){8,})((?1)(?>:(?1)){0,6})?::(?2)?)|(?>(?>(?1)(?>:(?1)){5}:|(?!(?:.*[a-f0-9]:){6,})(?3)?::(?>((?1)(?>:(?1)){0,4}):)?)?(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(?>\.(?4)){3}))$",
		longitude: "^[-+]?[0-9]{0,3}\.[0-9]{1,7}$",
		latitude: "^[-+]?[0-9]{0,3}\.[0-9]{1,7}$",
		position: ".{3,255}",
		username: "[a-z0-9!#$%&*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
		password: ".{4,}",
		cardMaxChars: "^[0-9]+$",
		customAttributeName: "^[a-zA-Z0-9_]+$",
		customAttributeValue: "^.*?$",
		secret_key: "^.*?$",
		secret_key_crypt: "^[a-fA-F0-9]{64}$",
		integerNotNegative: "^[^a-zA-Z]{1,4}$",
		meta_revision: "^[0-9]{1,}$",
		ttl: "^[1-9]+$",
		uuidv4: "^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$",
		date: "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1]) ([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
	},
	resources: {},
	buttons: {}, // see function app.refreshButtonsSelectors()
	containers: {}, // see function app.refreshContainers()
	summaryResults: {
		"first": "Returns the field value with the oldest timestamp.",
		"last": "Returns the field value with the most recent timestamp.",
		"count": "Returns the number of non-null field values.",
		"mean": "Returns the arithmetic mean (average) of field values.",
		"std_dev": "Returns the standard deviation of field values.",
		"minimum": "Returns the lowest field value.",
		"maximum": "Returns the greatest field value.",
		"spread": "Returns the difference between the minimum and maximum field values.",
		"mode": "Returns the most frequent value in a list of field values.",
		"median": "Returns the middle value from a sorted list of field values.",
		"quantile1": "Returns the 1st percentile field value.",
		"quantile2": "Returns the 2nd percentile field value.",
		"quantile3": "Returns the 3rd percentile field value.",
		"start_date": "Date from.",
		"end_date": "Date to.",
	},
};
app.offlineCard = { title: "Offline", titlecolor: "#ffffff", description: "Offline mode, Please connect to internet in order to see your resources." };

var Tawk_API;
var touchStartPoint, touchMovePoint;

(function(exports) {
	"use strict";
	function hex_md5(r) { return rstr2hex(rstr_md5(str2rstr_utf8(r))) } function b64_md5(r) { return rstr2b64(rstr_md5(str2rstr_utf8(r))) } function any_md5(r, t) { return rstr2any(rstr_md5(str2rstr_utf8(r)), t) } function hex_hmac_md5(r, t) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(r), str2rstr_utf8(t))) } function b64_hmac_md5(r, t) { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(r), str2rstr_utf8(t))) } function any_hmac_md5(r, t, d) { return rstr2any(rstr_hmac_md5(str2rstr_utf8(r), str2rstr_utf8(t)), d) } function md5_vm_test() { return "900150983cd24fb0d6963f7d28e17f72" == hex_md5("abc").toLowerCase() } function rstr_md5(r) { return binl2rstr(binl_md5(rstr2binl(r), 8 * r.length)) } function rstr_hmac_md5(r, t) { var d = rstr2binl(r); d.length > 16 && (d = binl_md5(d, 8 * r.length)); for (var n = Array(16), _ = Array(16), m = 0; 16 > m; m++)n[m] = 909522486 ^ d[m], _[m] = 1549556828 ^ d[m]; var f = binl_md5(n.concat(rstr2binl(t)), 512 + 8 * t.length); return binl2rstr(binl_md5(_.concat(f), 640)) } function rstr2hex(r) { try { } catch (t) { hexcase = 0 } for (var d, n = hexcase ? "0123456789ABCDEF" : "0123456789abcdef", _ = "", m = 0; m < r.length; m++)d = r.charCodeAt(m), _ += n.charAt(d >>> 4 & 15) + n.charAt(15 & d); return _ } function rstr2b64(r) { try { } catch (t) { b64pad = "" } for (var d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", n = "", _ = r.length, m = 0; _ > m; m += 3)for (var f = r.charCodeAt(m) << 16 | (_ > m + 1 ? r.charCodeAt(m + 1) << 8 : 0) | (_ > m + 2 ? r.charCodeAt(m + 2) : 0), h = 0; 4 > h; h++)n += 8 * m + 6 * h > 8 * r.length ? b64pad : d.charAt(f >>> 6 * (3 - h) & 63); return n } function rstr2any(r, t) { var d, n, _, m, f, h = t.length, e = Array(Math.ceil(r.length / 2)); for (d = 0; d < e.length; d++)e[d] = r.charCodeAt(2 * d) << 8 | r.charCodeAt(2 * d + 1); var a = Math.ceil(8 * r.length / (Math.log(t.length) / Math.log(2))), i = Array(a); for (n = 0; a > n; n++) { for (f = Array(), m = 0, d = 0; d < e.length; d++)m = (m << 16) + e[d], _ = Math.floor(m / h), m -= _ * h, (f.length > 0 || _ > 0) && (f[f.length] = _); i[n] = m, e = f } var o = ""; for (d = i.length - 1; d >= 0; d--)o += t.charAt(i[d]); return o } function str2rstr_utf8(r) { for (var t, d, n = "", _ = -1; ++_ < r.length;)t = r.charCodeAt(_), d = _ + 1 < r.length ? r.charCodeAt(_ + 1) : 0, t >= 55296 && 56319 >= t && d >= 56320 && 57343 >= d && (t = 65536 + ((1023 & t) << 10) + (1023 & d), _++), 127 >= t ? n += String.fromCharCode(t) : 2047 >= t ? n += String.fromCharCode(192 | t >>> 6 & 31, 128 | 63 & t) : 65535 >= t ? n += String.fromCharCode(224 | t >>> 12 & 15, 128 | t >>> 6 & 63, 128 | 63 & t) : 2097151 >= t && (n += String.fromCharCode(240 | t >>> 18 & 7, 128 | t >>> 12 & 63, 128 | t >>> 6 & 63, 128 | 63 & t)); return n } function str2rstr_utf16le(r) { for (var t = "", d = 0; d < r.length; d++)t += String.fromCharCode(255 & r.charCodeAt(d), r.charCodeAt(d) >>> 8 & 255); return t } function str2rstr_utf16be(r) { for (var t = "", d = 0; d < r.length; d++)t += String.fromCharCode(r.charCodeAt(d) >>> 8 & 255, 255 & r.charCodeAt(d)); return t } function rstr2binl(r) { for (var t = Array(r.length >> 2), d = 0; d < t.length; d++)t[d] = 0; for (var d = 0; d < 8 * r.length; d += 8)t[d >> 5] |= (255 & r.charCodeAt(d / 8)) << d % 32; return t } function binl2rstr(r) { for (var t = "", d = 0; d < 32 * r.length; d += 8)t += String.fromCharCode(r[d >> 5] >>> d % 32 & 255); return t } function binl_md5(r, t) { r[t >> 5] |= 128 << t % 32, r[(t + 64 >>> 9 << 4) + 14] = t; for (var d = 1732584193, n = -271733879, _ = -1732584194, m = 271733878, f = 0; f < r.length; f += 16) { var h = d, e = n, a = _, i = m; d = md5_ff(d, n, _, m, r[f + 0], 7, -680876936), m = md5_ff(m, d, n, _, r[f + 1], 12, -389564586), _ = md5_ff(_, m, d, n, r[f + 2], 17, 606105819), n = md5_ff(n, _, m, d, r[f + 3], 22, -1044525330), d = md5_ff(d, n, _, m, r[f + 4], 7, -176418897), m = md5_ff(m, d, n, _, r[f + 5], 12, 1200080426), _ = md5_ff(_, m, d, n, r[f + 6], 17, -1473231341), n = md5_ff(n, _, m, d, r[f + 7], 22, -45705983), d = md5_ff(d, n, _, m, r[f + 8], 7, 1770035416), m = md5_ff(m, d, n, _, r[f + 9], 12, -1958414417), _ = md5_ff(_, m, d, n, r[f + 10], 17, -42063), n = md5_ff(n, _, m, d, r[f + 11], 22, -1990404162), d = md5_ff(d, n, _, m, r[f + 12], 7, 1804603682), m = md5_ff(m, d, n, _, r[f + 13], 12, -40341101), _ = md5_ff(_, m, d, n, r[f + 14], 17, -1502002290), n = md5_ff(n, _, m, d, r[f + 15], 22, 1236535329), d = md5_gg(d, n, _, m, r[f + 1], 5, -165796510), m = md5_gg(m, d, n, _, r[f + 6], 9, -1069501632), _ = md5_gg(_, m, d, n, r[f + 11], 14, 643717713), n = md5_gg(n, _, m, d, r[f + 0], 20, -373897302), d = md5_gg(d, n, _, m, r[f + 5], 5, -701558691), m = md5_gg(m, d, n, _, r[f + 10], 9, 38016083), _ = md5_gg(_, m, d, n, r[f + 15], 14, -660478335), n = md5_gg(n, _, m, d, r[f + 4], 20, -405537848), d = md5_gg(d, n, _, m, r[f + 9], 5, 568446438), m = md5_gg(m, d, n, _, r[f + 14], 9, -1019803690), _ = md5_gg(_, m, d, n, r[f + 3], 14, -187363961), n = md5_gg(n, _, m, d, r[f + 8], 20, 1163531501), d = md5_gg(d, n, _, m, r[f + 13], 5, -1444681467), m = md5_gg(m, d, n, _, r[f + 2], 9, -51403784), _ = md5_gg(_, m, d, n, r[f + 7], 14, 1735328473), n = md5_gg(n, _, m, d, r[f + 12], 20, -1926607734), d = md5_hh(d, n, _, m, r[f + 5], 4, -378558), m = md5_hh(m, d, n, _, r[f + 8], 11, -2022574463), _ = md5_hh(_, m, d, n, r[f + 11], 16, 1839030562), n = md5_hh(n, _, m, d, r[f + 14], 23, -35309556), d = md5_hh(d, n, _, m, r[f + 1], 4, -1530992060), m = md5_hh(m, d, n, _, r[f + 4], 11, 1272893353), _ = md5_hh(_, m, d, n, r[f + 7], 16, -155497632), n = md5_hh(n, _, m, d, r[f + 10], 23, -1094730640), d = md5_hh(d, n, _, m, r[f + 13], 4, 681279174), m = md5_hh(m, d, n, _, r[f + 0], 11, -358537222), _ = md5_hh(_, m, d, n, r[f + 3], 16, -722521979), n = md5_hh(n, _, m, d, r[f + 6], 23, 76029189), d = md5_hh(d, n, _, m, r[f + 9], 4, -640364487), m = md5_hh(m, d, n, _, r[f + 12], 11, -421815835), _ = md5_hh(_, m, d, n, r[f + 15], 16, 530742520), n = md5_hh(n, _, m, d, r[f + 2], 23, -995338651), d = md5_ii(d, n, _, m, r[f + 0], 6, -198630844), m = md5_ii(m, d, n, _, r[f + 7], 10, 1126891415), _ = md5_ii(_, m, d, n, r[f + 14], 15, -1416354905), n = md5_ii(n, _, m, d, r[f + 5], 21, -57434055), d = md5_ii(d, n, _, m, r[f + 12], 6, 1700485571), m = md5_ii(m, d, n, _, r[f + 3], 10, -1894986606), _ = md5_ii(_, m, d, n, r[f + 10], 15, -1051523), n = md5_ii(n, _, m, d, r[f + 1], 21, -2054922799), d = md5_ii(d, n, _, m, r[f + 8], 6, 1873313359), m = md5_ii(m, d, n, _, r[f + 15], 10, -30611744), _ = md5_ii(_, m, d, n, r[f + 6], 15, -1560198380), n = md5_ii(n, _, m, d, r[f + 13], 21, 1309151649), d = md5_ii(d, n, _, m, r[f + 4], 6, -145523070), m = md5_ii(m, d, n, _, r[f + 11], 10, -1120210379), _ = md5_ii(_, m, d, n, r[f + 2], 15, 718787259), n = md5_ii(n, _, m, d, r[f + 9], 21, -343485551), d = safe_add(d, h), n = safe_add(n, e), _ = safe_add(_, a), m = safe_add(m, i) } return Array(d, n, _, m) } function md5_cmn(r, t, d, n, _, m) { return safe_add(bit_rol(safe_add(safe_add(t, r), safe_add(n, m)), _), d) } function md5_ff(r, t, d, n, _, m, f) { return md5_cmn(t & d | ~t & n, r, t, _, m, f) } function md5_gg(r, t, d, n, _, m, f) { return md5_cmn(t & n | d & ~n, r, t, _, m, f) } function md5_hh(r, t, d, n, _, m, f) { return md5_cmn(t ^ d ^ n, r, t, _, m, f) } function md5_ii(r, t, d, n, _, m, f) { return md5_cmn(d ^ (t | ~n), r, t, _, m, f) } function safe_add(r, t) { var d = (65535 & r) + (65535 & t), n = (r >> 16) + (t >> 16) + (d >> 16); return n << 16 | 65535 & d } function bit_rol(r, t) { return r << t | r >>> 32 - t } var hexcase = 0, b64pad = "";
	exports.hex_md5 = hex_md5; // Make this method available in global

	var toastContainer = document.querySelector(".toast__container");

	// To show notification
	function toast(msg, options) {
		if (!msg) return;
		options = options || { timeout: app.toastDuration, type: "info" };
		// type = error, done, warning, help, info
		options.timeout = typeof options.timeout !== undefined ? options.timeout : 3000;
		options.type = typeof options.type !== undefined ? options.type : "info";

		var toastMsg = document.createElement("div");
		toastMsg.className = "toast__msg " + options.type;
		var icon = document.createElement("i");
		icon.className = "material-icons";
		icon.textContent = options.type;
		var span = document.createElement("span");
		var dismiss = document.createElement("a");
		span.textContent = msg;
		dismiss.textContent = "Dismiss";
		dismiss.className = "mdl-button";
		toastMsg.appendChild(icon);
		toastMsg.appendChild(span);
		toastMsg.appendChild(dismiss);
		let tc = toastContainer!==null?toastContainer.appendChild(toastMsg):null;
		dismiss.addEventListener("click", function(event) {
			event.target.parentNode.classList.add("toast__msg--hide");
			event.target.parentNode.remove(1);
		});
		setTimeout(function() {
			toastMsg.classList.add("toast__msg--hide");
			toastMsg.remove(1);
		}, options.timeout);
	}
	exports.toast = toast;

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
		return app.getSetting('settings.isLtr') !== null ? !!JSON.parse(String(app.getSetting('settings.isLtr')).toLowerCase()) : true;
	};

	app.preloadImage = function(img) {
		img.setAttribute('src', img.getAttribute('data-src'));
	};

	app.escapeHtml = function(text) {
		if (typeof text === "string") {
			text = text
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
		}
		return text;
	};

	app.urlBase64ToUint8Array = function(base64String) {
		const padding = '='.repeat((4 - base64String.length % 4) % 4);
		const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (var i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); };
		return outputArray;
	};

	app.nl2br = function(str, isXhtml) {
		var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	};

	app.fetchStatusHandler = function(response) {
		if (response.headers.get('X-RateLimit-Limit') && response.headers.get('X-RateLimit-Remaining')) {
			app.RateLimit.Limit = response.headers.get('X-RateLimit-Limit');
			app.RateLimit.Remaining = response.headers.get('X-RateLimit-Remaining');
			app.RateLimit.Used = app.RateLimit.Limit - app.RateLimit.Remaining;
		}
		if (response.status === 200 || response.status === 201) {
			return response;
		} else if (response.status === 204) {
			return response;
		} else if (response.status === 400) {
			toast("Bad Request.", { timeout: app.toastDuration, type: "error" });
			return response;
		} else if (response.status === 401 || response.status === 403) {
			app.sessionExpired();
			return response;
		} else if (response.status === 404) {
			toast("There is an unknown resource that can't be loaded.", { timeout: app.toastDuration, type: "error" });
			return response;
		} else if (response.status === 409) {
			toast("Revision is conflictual.", { timeout: app.toastDuration, type: "error" });
			return response;
		} else if (response.status === 412) {
			toast("Precondition Failed", { timeout: app.toastDuration, type: "error" });
			return response;
		} else if (response.status === 429) {
			toast("Oups, over quota.", { timeout: app.toastDuration, type: "error" });
			return response;
		} else {
			throw new Error(response.statusText);
		}
	};

	app.fetchStatusHandlerOnUser = function(response) {
		if (response.headers.get('X-RateLimit-Limit') && response.headers.get('X-RateLimit-Remaining')) {
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

	app.setLoginAction = function() {
		for (var i in app.buttons.loginButtons) {
			if (app.buttons.loginButtons[i].childElementCount > -1) {
				app.buttons.loginButtons[i].removeEventListener('click', app.onLoginButtonClick, false);
				app.buttons.loginButtons[i].addEventListener('click', app.onLoginButtonClick, false);
			}
		}
	};

	app.onLoginButtonClick = function(evt) {
		if (navigator.onLine) {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			myForm.querySelector("form.signin button.login_button i.material-icons").textContent = "cached";
			myForm.querySelector("form.signin button.login_button i.material-icons").classList.add("animatedIcon");
			componentHandler.upgradeDom();

			var username = myForm.querySelector("form.signin input[name='username']").value;
			var password = myForm.querySelector("form.signin input[name='password']").value;
			app.auth = { "username": username, "password": password };
			app.authenticate();
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		evt.preventDefault();
	};

	app.onStatusButtonClick = function(evt) {
		if (navigator.onLine) {
			app.getStatus();
			app.setSection('status');
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		if (evt) evt.preventDefault();
	};

	app.onFeaturesButtonClick = function(evt) {
		if (navigator.onLine) {
			app.setSection('features');
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		if (evt) evt.preventDefault();
	};

	app.onSettingsButtonClick = function(evt) {
		if (navigator.onLine) {
			app.setSection('settings');
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		if (evt) evt.preventDefault();
	};

	app.onDocsButtonClick = function(evt) {
		if (navigator.onLine) {
			app.setSection('docs');
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		if (evt) evt.preventDefault();
	};

	app.onTermsButtonClick = function(evt) {
		if (navigator.onLine) {
			app.getTerms();
			app.setSection('terms');
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		if (evt) evt.preventDefault();
	};

	app.setSignupAction = function() {
		for (var i in app.buttons.user_create) {
			if (app.buttons.user_create[i].childElementCount > -1) {
				app.buttons.user_create[i].addEventListener('click', app.onSignupButtonClick, false);
			}
		}
	};

	app.setPasswordResetAction = function() {
		for (var i in app.buttons.user_setpassword) {
			if (app.buttons.user_setpassword[i].childElementCount > -1) {
				app.buttons.user_setpassword[i].addEventListener('click', app.onPasswordResetButtonClick, false);
			}
		}
	};

	app.setForgotAction = function() {
		for (var i in app.buttons.user_forgot) {
			if (app.buttons.user_forgot[i].childElementCount > -1) {
				app.buttons.user_forgot[i].addEventListener('click', app.onForgotPasswordButtonClick, false);
			}
		}
	};

	app.onSignupButtonClick = function(evt) {
		if (navigator.onLine) {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			myForm.querySelector("form.signup button.createUser i.material-icons").textContent = "cached";
			myForm.querySelector("form.signup button.createUser i.material-icons").classList.add("animatedIcon");
			componentHandler.upgradeDom();

			var email = myForm.querySelector("form.signup input[name='email']").value;
			var terms = myForm.querySelector("form.signup input[name='terms']").checked;
			if (email && email.match(app.patterns.username)) {
				if (terms) {
					var firstName = myForm.querySelector("form.signup input[name='firstName']").value;
					var lastName = myForm.querySelector("form.signup input[name='lastName']").value;
					var postData = { "email": email, "firstName": firstName, "lastName": lastName };
					if (app.getSetting('settings.pushSubscription.endpoint') && app.getSetting('settings.pushSubscription.keys.auth') && app.getSetting('settings.pushSubscription.keys.p256dh')) {
						postData.pushSubscription = {
							endpoint: app.getSetting('settings.pushSubscription.endpoint'),
							keys: {
								auth: app.getSetting('settings.pushSubscription.keys.auth'),
								p256dh: app.getSetting('settings.pushSubscription.keys.p256dh')
							}
						};
					}
					var myHeaders = new Headers();
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(postData) };
					var url = `${app.baseUrl}/${app.api_version}/users`;

					fetch(url, myInit)
						.then(
							app.fetchStatusHandlerOnUser
						).then(function(fetchResponse) {
							return fetchResponse.json();
						})
						.then(function(response) {
							app.setSetting('notifications.email', response.user.data.attributes.email);
							app.setSetting('notifications.unsubscription_token', response.user.data.attributes.unsubscription_token);
							toast('Welcome, you should have received an email to set your password.', { timeout: app.toastDuration, type: "done" });
							if (typeof firebase !== "undefined") {
								firebase.analytics().logEvent('sign_up');
							}
							app.setSection('manage_notifications');
						})
						.catch(function(error) {
							toast('We can\'t process your signup. Please resubmit the form later! ' + error, { timeout: app.toastDuration, type: "warning" });
						});
				} else {
					toast('Please read Terms & Conditions, you will be able to manage your privacy in the step right after.', { timeout: app.toastDuration, type: "warning" });
				}
			} else {
				toast('We can\'t process your signup. Please check your inputs.', { timeout: app.toastDuration, type: "warning" });
			}
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		evt.preventDefault();
	};

	app.onPasswordResetButtonClick = function(evt) {
		if (navigator.onLine) {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			myForm.querySelector("form.resetpassword button.setPassword i.material-icons").textContent = "cached";
			myForm.querySelector("form.resetpassword button.setPassword i.material-icons").classList.add("animatedIcon");
			componentHandler.upgradeDom();

			var password = myForm.querySelector("form.resetpassword input[name='password']").value;
			var password2 = myForm.querySelector("form.resetpassword input[name='password2']").value;
			var token = getParameterByName('token');
			if (token !== undefined && password == password2) {
				var myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/json");
				var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify({ "password": password }) };
				var url = `${app.baseUrl}/${app.api_version}/users/token/${token}`;

				fetch(url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(fetchResponse) {
						return fetchResponse.json();
					})
					.then(function() {
						app.setSection('login');
						toast('Your password has been reset; please login again.', { timeout: app.toastDuration, type: "done" });
					})
					.catch(function(error) {
						toast('We can\'t process your password reset. Please resubmit the form later!', { timeout: app.toastDuration, type: "warning" });
					});
			} else {
				toast('We can\'t process your password reset.', { timeout: app.toastDuration, type: "warning" });
			}
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		evt.preventDefault();
	};

	app.onForgotPasswordButtonClick = function(evt) {
		if (navigator.onLine) {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			myForm.querySelector("form.forgotpassword button.forgotPassword i.material-icons").textContent = "cached";
			myForm.querySelector("form.forgotpassword button.forgotPassword i.material-icons").classList.add("animatedIcon");
			componentHandler.upgradeDom();

			var email = myForm.querySelector("form.forgotpassword input[name='email']").value;
			if (email && email.match(app.patterns.username)) {
				var myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/json");
				var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify({ "email": email }) };
				var url = `${app.baseUrl}/${app.api_version}/users/instruction/`;

				fetch(url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(fetchResponse) {
						return fetchResponse.json();
					})
					.then(function() {
						app.setSection('login');
						toast('Instructions has been sent to your email.', { timeout: app.toastDuration, type: "done" });
					})
					.catch(function(error) {
						toast('We can\'t process your request. Please resubmit the form later!', { timeout: app.toastDuration, type: "warning" });
					});
			} else {
				toast('We can\'t send the instructions. Please check your inputs.', { timeout: app.toastDuration, type: "warning" });
			}
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
		evt.preventDefault();
	};

	app.onSaveProfileButtonClick = function(evt) {
		if (navigator.onLine) {
			var firstName = document.getElementById("firstName").value;
			var lastName = document.getElementById("lastName").value;

			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'PUT', headers: myHeaders, body: JSON.stringify({ "firstName": firstName, "lastName": lastName }) };
			var url = `${app.baseUrl}/${app.api_version}/users/${localStorage.getItem('currentUserId')}`;

			fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse) {
					return fetchResponse.json();
				})
				.then(function() {
					localStorage.setItem('currentUserName', firstName + " " + lastName);
					app.setDrawer();
					toast('Your details have been updated.', { timeout: app.toastDuration, type: "done" });
				})
				.catch(function(error) {
					toast("We can't process your modifications. Please resubmit the form later!", { timeout: app.toastDuration, type: "warning" });
				});
		} else {
			toast("No Network detected, please check your connexion.", { timeout: app.toastDuration, type: "warning" });
		}
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
		return navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
			.then(function(registration) {
				if (localStorage.getItem("settings.debug") == "true") {
					console.log('[ServiceWorker] Registered with scope:', registration.scope);
				}
				if ((typeof firebase !== "object" || typeof firebase === "undefined") && typeof firebase.apps !== "object" && typeof firebase.apps.length !== "number") {
					//console.log("firebase", "Should Initialize Firebase");
					firebase.initializeApp(firebaseConfig);
					firebase.messaging().useServiceWorker(registration);
					firebase.analytics();
					if (localStorage.getItem("settings.debug") == "true") {
						//console.log("firebase.messaging-sw", "Should load Firebase Messaging SW");
						console.log("[ServiceWorker]", "getToken()", firebase.messaging().getToken());
					}
				}
				return registration;
			})
			.catch(function(err) {
				if (localStorage.getItem("settings.debug") == "true") {
					console.log("[ServiceWorker]", "error occured...", err);
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
				if (registration) {
					return registration.pushManager.subscribe(subscribeOptions);
				} else {
					if (localStorage.getItem("settings.debug") == "true") {
						console.log("[pushSubscription]", "subscribeUserToPush registration", registration);
					}
					return false;
				}
			})
			.then(function(pushSubscription) {
				var j = JSON.parse(JSON.stringify(pushSubscription));
				if (j && j.keys) {
					app.setSetting('settings.pushSubscription.endpoint', j.endpoint);
					app.setSetting('settings.pushSubscription.keys.p256dh', j.keys.p256dh);
					app.setSetting('settings.pushSubscription.keys.auth', j.keys.auth);
				}
				if (localStorage.getItem("settings.debug") == "true") {
					console.log("[pushSubscription]", "subscribeUserToPush pushSubscription", pushSubscription);
				}
				return pushSubscription;
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					console.log("[pushSubscription]", 'subscribeUserToPush error', error);
				}
			});
	};

	app.refreshButtonsSelectors = function() {
		if (componentHandler) componentHandler.upgradeDom();
		app.buttons = {
			// signin_button
			// _button
			notification: document.querySelector('button#notification'),

			menuTabBar: document.querySelectorAll('.mdl-layout__tab-bar a'),
			status: document.querySelectorAll('.statusButton'),
			features: document.querySelectorAll('.featuresButton'),
			settings: document.querySelectorAll('.settingsButton'),
			docs: document.querySelectorAll('.docsButton'),
			terms: document.querySelectorAll('.termsButton'),
			notifications: document.querySelectorAll('form.notifications input.mdl-checkbox__input'),

			loginButtons: document.querySelectorAll('form.signin button.login_button'),
			user_create: document.querySelectorAll('form.signup button.createUser'),
			user_setpassword: document.querySelectorAll('form.resetpassword button.setPassword'),
			user_forgot: document.querySelectorAll('form.forgotpassword button.forgotPassword'),
			expandButtons: document.querySelectorAll('.showdescription_button'),
			expandSourceButtons: document.querySelectorAll('.showsource_button'),
			object_create: document.querySelectorAll('.showdescription_button'),

			deleteObject: document.querySelectorAll('#objects .delete-button'),
			deleteObject2: document.querySelectorAll('#objects .delete-button'),
			editObject: document.querySelectorAll('#objects .edit-button'),
			createObject: document.querySelector('#objects button#createObject'),
			saveObject: document.querySelector('#object section.fixedActionButtons button.save-button'),
			backObject: document.querySelector('#object section.fixedActionButtons button.back-button'),
			editObject2: document.querySelector('#object section.fixedActionButtons button.edit-button'),
			listObject: document.querySelector('#object section.fixedActionButtons button.list-button'),
			viewuiObject: document.querySelector('#object section.fixedActionButtons button.viewui-button'),
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

			deleteSource: document.querySelectorAll('#sources .delete-button'),
			editSource: document.querySelectorAll('#sources .edit-button'),
			createSource: document.querySelector('#sources button#createSource'),
			addSource: document.querySelector('#source_add section.fixedActionButtons button.add-button'),
			addSourceBack: document.querySelector('#source_add section.fixedActionButtons button.back-button'),
			backSource: document.querySelector('#source section.fixedActionButtons button.back-button'),
			saveSource: document.querySelector('#source section.fixedActionButtons button.save-button'),
			listSource: document.querySelector('#source section.fixedActionButtons button.list-button'),
			editSource2: document.querySelector('#source section.fixedActionButtons button.edit-button'),
			buildSource: document.querySelector('#source section.fixedActionButtons button.build-button'),
			deploySource: document.querySelector('#source section.fixedActionButtons button.deploy-button'),
			editSourceChild: document.querySelectorAll('#source section button.child_edit_btn'),
			link_offSourceObject: document.querySelectorAll('#source section button.object_link_off_btn'),
			editSourceObject: document.querySelectorAll('#source section button.object_edit_btn'),
			deploySourceObject: document.querySelectorAll('#source section button.object_deploy_btn, #object section button.object_deploy_btn'),
			buildSourceObject: document.querySelectorAll('#source section button.object_build_btn, #object section button.object_build_btn'),
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
			exploration: document.querySelector('section#exploration'),
			usersList: document.querySelector('section#users-list'),
			compatibleDevices: document.querySelector('section#compatible-devices'),
			openSourceLicenses: document.querySelector('section#openSourceLicenses'),
			objectsMaps: document.querySelector('section#objects-maps'),

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

			sources: document.querySelector('section#sources'),
			source: document.querySelector('section#source'),
			source_add: document.querySelector('section#source_add'),

			menuIconElement: document.querySelector('.mdl-layout__drawer-button'),
			menuElement: document.getElementById('drawer'),
			menuOverlayElement: document.querySelector('.menu__overlay'),
			drawerObfuscatorElement: document.getElementsByClassName('mdl-layout__obfuscator')[0],
			menuItems: document.querySelectorAll('.mdl-layout__drawer nav a.mdl-navigation__link'),
			menuTabItems: document.querySelectorAll('.mdl-layout__tab-bar a.mdl-navigation__link.mdl-layout__tab'),
		}
	};

	app.setExpandAction = function() {
		componentHandler.upgradeDom();
		app.refreshButtonsSelectors();
		for (var i in app.buttons.expandButtons) {
			if ((app.buttons.expandButtons[i]).childElementCount > -1) {
				(app.buttons.expandButtons[i]).addEventListener('click', app.expand, false);
			}
		}
	};

	app.expand = function(evt) {
		var id = (evt.target.parentElement).getAttribute('for') != null ? (evt.target.parentElement).getAttribute('for') : (evt.target).getAttribute('for');
		if (id != null) {
			document.getElementById(id).classList.toggle('hidden');
			if (evt.target.parentElement.querySelector('i.material-icons').innerHTML == 'expand_more') {
				evt.target.parentElement.querySelector('i.material-icons').innerHTML = 'expand_less';
			} else {
				evt.target.parentElement.querySelector('i.material-icons').innerHTML = 'expand_more';
			}
		}
	};

	app.findDataType = function(id) {
		if(typeof id==="undefined" || id === null || id==="") {return "";}
		return JSON.parse(localStorage.getItem("datatypes")).find(function(d) { return d.name === id; });
	};

	app.initNewSection = function(section) {
		if (!document.getElementById(section)) {
			let newSection = document.createElement("section");
			newSection.setAttribute("id", section);
			newSection.classList.add("mdl-tabs__panel", "mdl-layout__tab-panel", "is-inactive");
			if (app.sectionsPageTitles[section]) {
				let h2 = document.createElement("h2");
				h2.classList.add("mdl-card__title-text", "mdl-subheader-content");
				var title = document.createTextNode((app.sectionsPageTitles[section]).replace(/%s/g, ""));
				h2.appendChild(title);
				let divH2 = document.createElement("div");
				divH2.classList.add("mdl-grid", "mdl-cell--12-col");
				divH2.appendChild(h2);
				newSection.appendChild(divH2);
			}
			let divContent = document.createElement("div");
			divContent.classList.add("page-content", "mdl-grid", "mdl-grid--no-spacing");
			newSection.appendChild(divContent);

			let main = document.getElementsByClassName("mdl-layout__content")[0];
			main.appendChild(newSection);

			app.refreshContainers();
		}
	};

	app.setSection = function(section, direction) {
		section = section.split("?")[0].replace(/\/$/, "");
		window.location.hash = '#' + section;
		let url = (window.location.hash.substr(1).split("?"))[1];  // TODO, recursive?
		//let url = window.location.search;  // 
		window.scrollTo(0, 0);
		app.initNewSection(section);
		if (localStorage.getItem("settings.debug") == "true") {
			console.log('[setSection]', section);
		}
		if (section === 'public-object') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('objects'); // TODO, recursive?
				} else if (params['id']) {
					app.resources.objects.display(params['id'], false, false, true);
				}
			}
		} else if (section === 'object') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			console.log('DEBUG', "urlParams",urlParams);
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('objects'); // TODO, recursive?
				} else if (params['id']) {
					console.log('DEBUG', params['id']);
					app.resources.objects.display(params['id'], false, false, false);
				}
			}
		} else if (section === 'edit-object') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('objects'); // TODO, recursive?
				} else if (params['id']) {
					app.resources.objects.display(params['id'], false, true, false);
				}
			}
		} else if (section === 'flow') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('flows'); // TODO, recursive?
				} else if (params['id']) {
					app.resources.flows.display(params['id'], false, false, false);
				}
			}
		} else if (section === 'snippet') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('snippets'); // TODO, recursive?
				} else if (params['id']) {
					app.resources.dashboards.display(params['id'], false, false, false);
				}
			}
		} else if (section === 'dashboard') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('dashboards'); // TODO, recursive?
				} else if (params['id']) {
					app.resources.dashboards.display(params['id'], false, false, false);
				}
			}
		} else if (section === 'rule') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('rules'); // TODO, recursive?
				} else if (params['id']) {
					app.resources.rules.display(params['id'], false, false, false);
				}
			}
		} else if (section === 'mqtt') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('mqtts'); // TODO, recursive?
				} else if (params['id']) {
					app.resources.mqtts.display(params['id'], false, false, false);
				}
			}
		} else if (section === 'source') {
			var urlParams = new URLSearchParams(url);
			var params = {};
			if (Array.from(urlParams).length > -1) {
				for (let p of urlParams) {
					var n = p[0];
					params[n] = p[1];
				}
				if (params['id'] == "") {
					app.setSection('sources'); // TODO, recursive?
				} else if (params['id']) {
					app.resources.sources.display(params['id'], false, false, false);
				}
			}
		} else if (section === 'object_add') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.resources.objects.displayAdd(app.defaultResources.object, true, false, false);
		} else if (section === 'flow_add') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.resources.flows.displayAdd(app.defaultResources.flow, true, false, false);
		} else if (section === 'snippet_add') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.resources.snippets.displayAdd(app.defaultResources.snippet, true, false, false);
		} else if (section === 'dashboard_add') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.resources.dashboards.displayAdd(app.defaultResources.dashboard, true, false, false);
		} else if (section === 'rule_add') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.resources.rules.displayAdd(app.defaultResources.rule, true, false, false);
		} else if (section === 'mqtt_add') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.resources.mqtts.displayAdd(app.defaultResources.mqtt, true, false, false);
		} else if (section === 'source_add') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.resources.sources.displayAdd(app.defaultResources.source, true, false, false);
		} else if (section === 'profile') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			(app.containers.profile).querySelector('.page-content').innerHTML = "";
			app.fetchProfile();
		} else if (section === 'settings') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.getSettings();
		} else if (section === 'login') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.displayLoginForm(document.querySelector('#login').querySelector('.page-content'));
		} else if (section === 'users-list') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.getUsersList();
		} else if (section === 'compatible-devices') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.getCompatibleDevices();
		} else if (section === 'openSourceLicenses') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.getOpenSourceLicenses();
		} else if (section === 'objects-maps') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.getObjectsMaps();
		} else if (section === 'manage_notifications') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			if (typeof firebase !== "undefined") {
				firebase.analytics().logEvent('manage_notifications');
			}
		} else if (section === 'exploration') {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
		} else {
			document.title = app.sectionsPageTitles[section] !== undefined ? app.sectionsPageTitles[section] : app.defaultPageTitle;
			app.fetchItemsPaginated(section, undefined, app.itemsPage[section], app.itemsSize[section]);
		}
		app.refreshButtonsSelectors();
		var act = document.querySelectorAll('section.is-active');
		for (var i in act) {
			if ((act[i]).childElementCount > -1) {
				act[i].classList.remove('is-active');
				act[i].classList.add('is-inactive');
			}
		}
		for (var i in app.buttons.menuTabBar) {
			if ((app.buttons.menuTabBar[i]).childElementCount > -1) {
				app.buttons.menuTabBar[i].classList.remove('is-active');
				if (app.buttons.menuTabBar[i].getAttribute("for") == section || app.buttons.menuTabBar[i].getAttribute("for") == section + 's') {
					app.buttons.menuTabBar[i].classList.add('is-active');
				}
			}
		}
		if (document.querySelector('#' + section)) {
			if (direction == 'ltr') {
				document.querySelector('#' + section).style.transform = "translateX(-120%) !important";
			} else {
				document.querySelector('#' + section).style.transform = "translateX(120%) !important";
			}
			document.querySelector('#' + section).classList.remove('is-inactive');
			document.querySelector('#' + section).classList.add('is-active');
			if (!app.isLogged && (
				!document.querySelector('#' + section).querySelector('.page-content form.signin') &&
				section !== 'signup' &&
				section !== 'reset-password' &&
				section !== 'forgot-password' &&
				section !== 'settings' &&
				section !== 'docs' &&
				section !== 'terms' &&
				section !== 'compatible-devices' &&
				section !== 'openSourceLicenses' &&
				section !== 'manage_notifications' &&
				section !== 'use-cases' &&
				section !== 'news'
			)
			) {
				app.displayLoginForm(document.querySelector('#' + section).querySelector('.page-content'));
			}
		}
		app.currentSection = section;
		if (typeof firebase === "undefined") {
			var firebase = {};
		}
		if (typeof firebase !== "object" && typeof firebase.apps !== "object" && typeof firebase.apps.length !== "number") {
			firebase.analytics().setCurrentScreen(section, null);
		}
		if (typeof Tawk_API !== "undefined" && typeof Tawk_API.setAttributes === "function") {
			Tawk_API.addEvent("setCurrentScreen", { "screen": section }, function(error) { });
		}
	};

	app.setItemsClickAction = function(type) {
		if (localStorage.getItem("settings.debug") == "true") {
			console.log('DEBUG setItemsClickAction', type);
		}
		var items = document.querySelectorAll("[data-action='view']");
		for (var i in items) {
			if (type == 'objects' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type) {
				(items[i]).querySelectorAll("div.mdl-card__title, div.mdl-list__item--three-line").forEach(div => {
					div.addEventListener("click", (event) => {
						let item = event.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.objects.display(item.dataset.id, false, false, false);
						event.preventDefault();
					});
				});
			} else if (type == 'flows' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type) {
				(items[i]).querySelectorAll("div.mdl-card__title, div.mdl-list__item--three-line").forEach(div => {
					div.addEventListener("click", (event) => {
						let item = event.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.flows.display(item.dataset.id, false, false, false);
						event.preventDefault();
					});
				});
			} else if (type == 'dashboards' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type) {
				(items[i]).querySelectorAll("div.mdl-card__title, div.mdl-list__item--three-line").forEach(div => {
					div.addEventListener("click", (event) => {
						let item = event.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.dashboards.display(item.dataset.id, false, false, false);
						event.preventDefault();
					});
				});
			} else if (type == 'snippets' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type) {
				(items[i]).querySelectorAll("div.mdl-card__title, div.mdl-list__item--three-line").forEach(div => {
					div.addEventListener("click", (event) => {
						let item = event.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.snippets.display(item.dataset.id, false, false, false);
						event.preventDefault();
					});
				});
			} else if (type == 'rules' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type) {
				(items[i]).querySelectorAll("div.mdl-card__title, div.mdl-list__item--three-line").forEach(div => {
					div.addEventListener("click", (event) => {
						let item = event.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.rules.display(item.dataset.id, false, false, false);
						event.preventDefault();
					});
				});
			} else if (type == 'sources' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type) {
				(items[i]).querySelectorAll("div.mdl-card__title, div.mdl-list__item--three-line").forEach(div => {
					div.addEventListener("click", (event) => {
						let item = event.currentTarget.parentNode.parentNode;
						item.classList.add('is-hover');
						app.resources.sources.display(item.dataset.id, false, false, false);
						event.preventDefault();
					});
				});
			}
		};
		// swapDate
		var swaps = document.querySelectorAll("button.swapDate");
		for (var s in swaps) {
			if ((swaps[s]) !== undefined && (swaps[s]).childElementCount > -1) {
				(swaps[s]).addEventListener('click', function(evt) {
					var datasetid = evt.currentTarget.dataset.id;
					var createdElement = document.querySelector("div[data-id='" + datasetid + "'] span[data-date='created']").classList;
					var updatedElement = document.querySelector("div[data-id='" + datasetid + "'] span[data-date='updated']").classList;
					if (createdElement.contains("visible")) {
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

				}, { passive: false, });
			}
		};

		var lazys = document.querySelectorAll("button.lazyloading");
		for (var l in lazys) {
			if ((lazys[l]) !== undefined && (lazys[l]).childElementCount > -1) {
				(lazys[l]).addEventListener('click', function(evt) {
					var size = evt.currentTarget.dataset.size;
					var page = evt.currentTarget.dataset.page;
					var type = evt.currentTarget.dataset.type;

					app.itemsPage[type] = page;
					app.itemsSize[type] = size;
					app.fetchItemsPaginated(type, undefined, app.itemsPage[type], app.itemsSize[type]);
				}, { passive: false, });
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
		if (!navigator.clipboard) {
			var copyTextarea = evt.currentTarget.parentNode.querySelector('.copytextarea');
			copyTextarea.focus();
			copyTextarea.select();
			if (document.execCommand('copy')) {
				toast(text + ' has been copied to clipboard.', { timeout: app.toastDuration, type: "done" });
				return true;
			} else {
				toast('Could not copy text: ' + text, { timeout: app.toastDuration, type: "warning" });
				return false;
			}
		} else {
			navigator.clipboard.writeText(text).then(function() {
				toast(text + ' has been copied to clipboard.', { timeout: app.toastDuration, type: "done" });
				return true;
			}, function(err) {
				if (localStorage.getItem("settings.debug") == "true") {
					console.log('DEBUG clipboard', 'Could not copy text: ', err);
				}
				toast('Could not copy text: ' + text, { timeout: app.toastDuration, type: "warning" });
				return false;
			});
		}
	};

	app.setListActions = function(type) {
		app.refreshButtonsSelectors();
		var dialog = document.getElementById('dialog');
		var copyButtons = document.querySelectorAll('.copy-button');

		for (var c = 0; c < copyButtons.length; c++) {
			copyButtons[c].addEventListener('click', function(evt) {
				var myId = evt.currentTarget.dataset.id;
				app.copyTextToClipboard(myId, evt);
				evt.preventDefault();
			});
		}

		if (type === "objects") {
			for (var d = 0; d < app.buttons.deleteObject.length; d++) {
				app.buttons.deleteObject[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">' + app.icons.delete_question + '</i> Delete Object';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"' + evt.target.parentNode.dataset.name + '\"?</p>'; //
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
						myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = `${app.baseUrl}/${app.api_version}/objects/${myId}`;
						fetch(url, myInit)
							.then(
								app.fetchStatusHandler
							).then(function(fetchResponse) {
								return fetchResponse.json();
							})
							.then(function(response) {
								document.querySelector('[data-id="' + myId + '"]').classList.add('removed');
								toast("Object has been deleted.", { timeout: app.toastDuration, type: "done" });
							})
							.catch(function(error) {
								toast("Object has not been deleted.", { timeout: app.toastDuration, type: "error" });
							});
						evt.preventDefault();
					});
				});
			}
			for (var e = 0; e < app.buttons.editObject.length; e++) {
				//console.log(buttons.editObject[e]);
				app.buttons.editObject[e].addEventListener('click', function(evt) {
					app.resources.objects.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if (type === "flows") {
			for (var d = 0; d < app.buttons.deleteFlow.length; d++) {
				//console.log(buttons.deleteFlow[d]);
				app.buttons.deleteFlow[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">' + app.icons.delete_question + '</i> Delete Flow';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"' + evt.target.parentNode.dataset.name + '\"? This action will remove all datapoints in the flow and can\'t be recovered.</p>';
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
						myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = `${app.baseUrl}/${app.api_version}/flows/${myId}`;
						fetch(url, myInit)
							.then(
								app.fetchStatusHandler
							).then(function(fetchResponse) {
								return fetchResponse.json();
							})
							.then(function(response) {
								document.querySelector('[data-id="' + myId + '"]').classList.add('removed');
								app.resources.flows.onDelete(myId);
								toast('Flow has been deleted.', { timeout: app.toastDuration, type: "done" });
							})
							.catch(function(error) {
								toast('Flow has not been deleted.', { timeout: app.toastDuration, type: "error" });
							});
						evt.preventDefault();
					});
				});
			}
			for (var e = 0; e < app.buttons.editFlow.length; e++) {
				//console.log(buttons.editFlow[e]);
				app.buttons.editFlow[e].addEventListener('click', function(evt) {
					app.resources.flows.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if (type === "dashboards") {
			for (var d = 0; d < app.buttons.deleteDashboard.length; d++) {
				//console.log(buttons.deleteDashboard[d]);
				app.buttons.deleteDashboard[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">' + app.icons.delete_question + '</i> Delete Dashboard';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"' + evt.target.parentNode.dataset.name + '\"?</p>';
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
						myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = `${app.baseUrl}/${app.api_version}/dashboards/${myId}`;
						fetch(url, myInit)
							.then(
								app.fetchStatusHandler
							).then(function(fetchResponse) {
								return fetchResponse.json();
							})
							.then(function(response) {
								document.querySelector('[data-id="' + myId + '"]').classList.add('removed');
								toast('Dashboard has been deleted.', { timeout: app.toastDuration, type: "done" });
							})
							.catch(function(error) {
								toast('Dashboard has not been deleted.', { timeout: app.toastDuration, type: "error" });
							});
						evt.preventDefault();
					});
				});
			}
			for (var d = 0; d < app.buttons.editDashboard.length; d++) {
				//console.log(buttons.editDashboard[d]);
				app.buttons.editDashboard[d].addEventListener('click', function(evt) {
					app.resources.dashboards.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if (type === "snippets") {
			for (var d = 0; d < app.buttons.deleteSnippet.length; d++) {
				app.buttons.deleteSnippet[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">' + app.icons.delete_question + '</i> Delete Snippet';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"' + evt.target.parentNode.dataset.name + '\"? This action will remove all reference to the Snippet in Dashboards.</p>';
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
						myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = `${app.baseUrl}/${app.api_version}/snippets/${myId}`;
						fetch(url, myInit)
							.then(
								app.fetchStatusHandler
							).then(function(fetchResponse) {
								return fetchResponse.json();
							})
							.then(function(response) {
								document.querySelector('[data-id="' + myId + '"]').classList.add('removed');
								app.resources.snippets.onDelete(myId);
								toast('Snippet has been deleted.', { timeout: app.toastDuration, type: "done" });
							})
							.catch(function(error) {
								toast('Snippet has not been deleted.', { timeout: app.toastDuration, type: "error" });
							});
						evt.preventDefault();
					});
				});
			}
			for (var s = 0; s < app.buttons.editSnippet.length; s++) {
				app.buttons.editSnippet[s].addEventListener('click', function(evt) {
					app.resources.snippets.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if (type === "rules") {
			for (var d = 0; d < app.buttons.deleteRule.length; d++) {
				app.buttons.deleteRule[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">' + app.icons.delete_question + '</i> Delete rule';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"' + evt.target.parentNode.dataset.name + '\"? This action will remove all reference to the Rule in t6.</p>';
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
						myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = `${app.baseUrl}/${app.api_version}/rules/${myId}`;
						fetch(url, myInit)
							.then(
								app.fetchStatusHandler
							).then(function(fetchResponse) {
								return fetchResponse.json();
							})
							.then(function(response) {
								document.querySelector('[data-id="' + myId + '"]').classList.add('removed');
								toast('Rule has been deleted.', { timeout: app.toastDuration, type: "done" });
							})
							.catch(function(error) {
								toast('Rule has not been deleted.', { timeout: app.toastDuration, type: "error" });
							});
						evt.preventDefault();
					});
				});
			}
			for (var s = 0; s < app.buttons.editRule.length; s++) {
				app.buttons.editRule[s].addEventListener('click', function(evt) {
					app.resources.rules.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		} else if (type === "mqtts") {
			// TODO
		} else if (type === "sources") {
			for (var d = 0; d < app.buttons.deleteSource.length; d++) {
				app.buttons.deleteSource[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = '<i class="material-icons md-48">' + app.icons.delete_question + '</i> Delete source';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"' + evt.target.parentNode.dataset.name + '\"? This action will remove all reference to the Source in t6.</p>';
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
						myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
						myHeaders.append("Content-Type", "application/json");
						var myInit = { method: 'DELETE', headers: myHeaders };
						var url = `${app.baseUrl}/${app.api_version}/sources/${myId}`;
						fetch(url, myInit)
							.then(
								app.fetchStatusHandler
							).then(function(fetchResponse) {
								return fetchResponse.json();
							})
							.then(function(response) {
								document.querySelector('[data-id="' + myId + '"]').classList.add('removed');
								toast('Source has been deleted.', { timeout: app.toastDuration, type: "done" });
							})
							.catch(function(error) {
								toast('Source has not been deleted.', { timeout: app.toastDuration, type: "error" });
							});
						evt.preventDefault();
					});
				});
			}
			for (var s = 0; s < app.buttons.editSource.length; s++) {
				app.buttons.editSource[s].addEventListener('click', function(evt) {
					app.resources.sources.display(evt.currentTarget.dataset.id, false, true, false);
					evt.preventDefault();
				});
			}
		}
	};

	app.getSubtitle = function(subtitle) {
		var node = `<section class="mdl-grid mdl-cell--12-col md-primary md-subheader _md md-altTheme-theme sticky" role="heading">
			<div class="md-subheader-inner">
				<div class="mdl-subheader-content">
					<span class="ng-scope">${subtitle}</span>
				</div>
			</div>
		</section>`;
		return node;
	};

	app.getUnits = function() {
		if (localStorage.getItem('units') == 'null' || !JSON.parse(localStorage.getItem('units'))) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var url = `${app.baseUrl}/${app.api_version}/units/`;
			fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse) {
					return fetchResponse.json();
				})
				.then(function(response) {
					if (response.data) {
						for (var i = 0; i < (response.data).length; i++) {
							var u = response.data[i];
							app.units.push({ name: u.id, value: u.attributes.type + ' - ' + u.attributes.name, format: u.attributes.format, system: u.attributes.system, description: u.attributes.description });
						}
						(app.units) = (app.units).sort(function(a, b) {
							if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; }
							if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; }
							return 0;
						});
						localStorage.setItem('units', JSON.stringify(app.units));
					}
				});
		}
	};

	app.getFlows = function() {
		if (app.flows.length == 0 && (app.isLogged || localStorage.getItem('bearer'))) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
			var myInit = { method: 'GET', headers: myHeaders };
			var url = `${app.baseUrl}/${app.api_version}/flows/?size=99999`;
			fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse) {
					return fetchResponse.json();
				})
				.then(function(response) {
					if (response.data) {
						for (var i = 0; i < (response.data).length; i++) {
							var f = response.data[i];
							app.flows.push({ id: f.id, name: f.attributes.name, type: 'flows' });
						}
						localStorage.setItem('flows', JSON.stringify(app.flows));
					}
				});
		}
	};

	app.getSnippets = function() {
		if (app.snippets.length == 0 && (app.isLogged || localStorage.getItem('bearer'))) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
			var myInit = { method: 'GET', headers: myHeaders };
			var url = `${app.baseUrl}/${app.api_version}/snippets/?size=99999`;
			fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse) {
					return fetchResponse.json();
				})
				.then(function(response) {
					if (response.data) {
						for (var i = 0; i < (response.data).length; i++) {
							var s = response.data[i];
							app.snippets.push({ id: s.id, name: s.attributes.name, sType: s.attributes.type, type: 'snippets' });
						}
						localStorage.setItem('snippets', JSON.stringify(app.snippets));
					}
				});
		}
	};

	app.getDatatypes = function() {
		if (app.datatypes.length == 0) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var url = `${app.baseUrl}/${app.api_version}/datatypes/`;
			fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse) {
					return fetchResponse.json();
				})
				.then(function(response) {
					if (response.data) {
						for (var i = 0; i < (response.data).length; i++) {
							var d = response.data[i];
							app.datatypes.push({ name: d.id, value: d.attributes.name, classification: d.attributes.classification, type: d.attributes.type });
						}
						(app.datatypes) = (app.datatypes).sort(function(a, b) {
							if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; }
							if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; }
							return 0;
						});
						localStorage.setItem('datatypes', JSON.stringify(app.datatypes));
					}
				});
		}
	};

	app.getSources = function() {
		if ((app.isLogged || localStorage.getItem('bearer'))) {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
			var myInit = { method: 'GET', headers: myHeaders };
			var url = `${app.baseUrl}/${app.api_version}/sources/?size=99999`;
			fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse) {
					return fetchResponse.json();
				})
				.then(function(response) {
					if (response.data) {
						app.sources = new Array();
						for (var i = 0; i < (response.data).length; i++) {
							var s = response.data[i];
							app.sources.push({ id: s.id, name: s.attributes.name, version: s.attributes.version, subversions: s.attributes.subversions });
						}
						localStorage.setItem('sources', JSON.stringify(app.sources));
					}
				});
		}
	};

	app.getCard = function(card) {
		var output = "";
		if (typeof card.className !== "undefined") {
			output += "<div class=\"" + card.className + "\">";
		} else {
			output += "<div class=\"mdl-grid mdl-cell\">";
		}
		output += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		if (card.image) {
			output += "	<div class=\"mdl-card__title\" style=\"background:url(" + card.image + ") no-repeat 50% 50%;\">";
		} else {
			output += "	<div class=\"mdl-card__title\">";
		}
		output += "			<h3 class=\"mdl-card__title-text\">" + card.title + "</h3>";
		output += "		</div>";
		output += "  	<div class=\"mdl-card__supporting-text mdl-card--expand\">" + card.description + "</div>";
		if (card.url || card.secondaryaction || card.action) {
			output += "  	<div class=\"mdl-card__actions mdl-card--border\">";
			if (card.url) {
				output += "		<a href=\"" + card.url + "\"> Get Started</a>";
			}
			if (card.secondaryaction) {
				output += "		<a href=\"#\" onclick=\"app.setSection('" + card.secondaryaction.id + "');\" class=\"mdl-button mdl-button--colored\"> " + card.secondaryaction.label + "</a>&nbsp;";
			}
			if (card.action && !card.internalAction) {
				output += "		<button class=\"mdl-button mdl-js-button mdl-js-ripple-effect\" onclick=\"app.setSection('" + card.action.id + "');\"> " + card.action.label + "</button>";
			}
			if (card.internalAction) {
				output += "		<button class=\"mdl-button mdl-js-button mdl-js-ripple-effect\" onclick=\"" + card.internalAction + "\"> " + card.action.label + "</button>";
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
		chipElt.innerHTML = "<i class='material-icons md-18'>" + app.icons[chip.type] + "</i>" + chip.name + "<i class='material-icons close'>close</i>";
		chipElt.querySelector('i.close').addEventListener('click', function(evt) {
			evt.preventDefault();
			evt.target.parentNode.remove();
		}, false);
		return chipElt;
	};

	app.addChipTo = function(container, chip) {
		document.getElementById(container).append(app.displayChip(chip));
	};

	app.removeChipFrom = function(container) {
		while (document.getElementById(container).firstChild) { document.getElementById(container).removeChild(document.getElementById(container).firstChild); }
	};

	app.displayChipSnippet = function(chipSnippet) {
		var displayChipSnippet = document.createElement('div');
		displayChipSnippet.setAttribute('class', 'mdl-chip mdl-list__item');
		displayChipSnippet.setAttribute('style', 'width: 100%; text-overflow: ellipsis; display: flex;');
		displayChipSnippet.setAttribute('draggable', true);
		displayChipSnippet.setAttribute('data-id', chipSnippet.id);
		displayChipSnippet.setAttribute('data-stype', chipSnippet.sType);
		displayChipSnippet.innerHTML = "<i class='md-36 grippy'></i>" +
			"<i class='material-icons md-36' id='type-" + chipSnippet.id + "'>" + app.icons[chipSnippet.type] + "</i> <div class='mdl-tooltip mdl-tooltip--top' for='type-" + chipSnippet.id + "'>" + chipSnippet.type + " (" + chipSnippet.sType + ")</div>" +
			"<span>" + chipSnippet.name + " (" + chipSnippet.sType + ")</span>" +
			"<i class='material-icons close mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect' id='remove-" + chipSnippet.id + "'>close</i> <div class='mdl-tooltip mdl-tooltip--top' for='remove-" + chipSnippet.id + "'>Remove this " + chipSnippet.type + "</div>" +
			"<i class='material-icons edit mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect' id='edit-" + chipSnippet.id + "'>edit</i> <div class='mdl-tooltip mdl-tooltip--top' for='edit-" + chipSnippet.id + "'>Edit this " + chipSnippet.type + "</div>";
		displayChipSnippet.querySelector('i.close').addEventListener('click', function(evt) {
			evt.preventDefault();
			evt.target.parentNode.parentNode.remove();
		}, false);
		displayChipSnippet.querySelector('i.edit').addEventListener('click', function(evt) {
			evt.preventDefault();
			app.resources.snippets.display(
				app.getSnippetIdFromIndex(evt.target.parentNode.parentNode.getAttribute('data-id')),
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
			this.insertAdjacentHTML('beforebegin', dropHTML);
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
			if (type !== "objects" && type !== "flows" && type !== "dashboards" && type !== "snippets" && type !== "rules" && type !== "mqtts" && type !== "sources") {
				resolve();
				return false;
			}
			app.initNewSection(type);

			size = size !== undefined ? size : app.itemsSize[type];
			page = page !== undefined ? page : app.itemsPage[type];

			app.containers.spinner.removeAttribute('hidden');
			app.containers.spinner.classList.remove('hidden');
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var defaultCard = {};

			if (type == 'objects') {
				var container = (app.containers.objects).querySelector('.page-content');
				var url = `${app.baseUrl}/${app.api_version}/objects`;

				if (page || size || filter) {
					url += '?';
					if (filter !== undefined) {
						url += 'name=' + escape(filter) + '&';
					}
					if (page !== undefined) {
						url += 'page=' + page + '&';
					}
					if (size !== undefined) {
						url += 'size=' + size + '&';
					}
				}
				var title = 'My Objects';
				if (app.isLogged) defaultCard = { title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any Object yet.', internalAction: false, action: { id: 'object_add', label: '<i class=\'material-icons\'>add</i>Add my first Object' }, className: "mdl-grid mdl-cell mdl-cell--12-col" };
				else defaultCard = { title: 'Connected Objects', titlecolor: '#ffffff', description: 'Connecting anything physical or virtual to t6 Api without any hassle. Embedded, Automatization, Domotic, Sensors, any Objects or Devices can be connected and communicate to t6 via RESTful API. Unic and dedicated application to rules them all and designed to simplify your journey.', className: "mdl-grid mdl-cell mdl-cell--12-col" }; // ,

			} else if (type == 'flows') {
				var container = (app.containers.flows).querySelector('.page-content');
				var url = `${app.baseUrl}/${app.api_version}/flows`;
				if (page || size || filter) {
					url += '?';
					if (filter !== undefined) {
						url += 'name=' + escape(filter) + '&';
					}
					if (page !== undefined) {
						url += 'page=' + page + '&';
					}
					if (size !== undefined) {
						url += 'size=' + size + '&';
					}
				}
				var title = 'My Flows';
				if (app.isLogged) defaultCard = { title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any Flow yet.', internalAction: false, action: { id: 'flow_add', label: '<i class=\'material-icons\'>add</i>Add my first Flow' }, className: "mdl-grid mdl-cell mdl-cell--12-col" };
				else defaultCard = { title: 'Time-series Datapoints', titlecolor: '#ffffff', description: 'Communication becomes easy in the platform with Timestamped values. Flows allows to retrieve and classify data.', className: "mdl-grid mdl-cell mdl-cell--12-col" };
			} else if (type == 'dashboards') {
				var container = (app.containers.dashboards).querySelector('.page-content');
				var url = `${app.baseUrl}/${app.api_version}/dashboards`;
				if (page || size) {
					url += '?';
					if (page !== undefined) {
						url += 'page=' + page + '&';
					}
					if (size !== undefined) {
						url += 'size=' + size + '&';
					}
				}
				var title = 'My Dashboards';
				if (app.isLogged) {
					defaultCard = { title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any dashboard yet.', internalAction: false, action: { id: 'dashboard_add', label: '<i class=\'material-icons\'>add</i>Add my first Dashboard' }, className: "mdl-grid mdl-cell mdl-cell--12-col" };
				} else {
					defaultCard = { title: 'Dashboards', titlecolor: '#ffffff', description: 't6 support multiple Snippets to create your own IoT Dashboards for data visualization. Snippets are ready to Use Html components integrated into the application. Dashboards allows to empower your data-management by Monitoring and Reporting activities.', className: "mdl-grid mdl-cell mdl-cell--12-col" };
				}
			} else if (type == 'snippets') {
				var container = (app.containers.snippets).querySelector('.page-content');
				var url = `${app.baseUrl}/${app.api_version}/snippets`;
				if (page || size) {
					url += '?';
					if (page !== undefined) {
						url += 'page=' + page + '&';
					}
					if (size !== undefined) {
						url += 'size=' + size + '&';
					}
				}
				var title = 'My Snippets';
				if (app.isLogged) defaultCard = { title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any snippet yet.', internalAction: false, action: { id: 'snippet_add', label: '<i class=\'material-icons\'>add</i>Add my first Snippet' } };
				else defaultCard = { title: 'Customize Snippets', titlecolor: '#ffffff', description: 'Snippets are components to embed into your dashboards and displays your data', className: "mdl-grid mdl-cell mdl-cell--12-col" }; // ,

			} else if (type == 'rules') {
				var container = (app.containers.rules).querySelector('.page-content');
				var url = `${app.baseUrl}/${app.api_version}/rules`;
				if (page || size) {
					url += '?';
					if (page !== undefined) {
						url += 'page=' + page + '&';
					}
					if (size !== undefined) {
						url += 'size=' + size + '&';
					}
				}
				var title = 'My Rules';
				if (app.isLogged) defaultCard = { title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any rule yet.', internalAction: false, action: { id: 'rule_add', label: '<i class=\'material-icons\'>add</i>Add my first Rule' }, className: "mdl-grid mdl-cell mdl-cell--12-col" };
				else defaultCard = { title: 'Decision Rules to get smart', titlecolor: '#ffffff', description: 'Trigger action from Mqtt and decision-tree. Let\'s your Objects talk to the platform as events.', className: "mdl-grid mdl-cell mdl-cell--12-col" }; // ,

			} else if (type == 'mqtts') {
				var container = (app.containers.mqtts).querySelector('.page-content');
				var url = `${app.baseUrl}/${app.api_version}/mqtts`;
				if (page || size) {
					url += '?';
					if (page !== undefined) {
						url += 'page=' + page + '&';
					}
					if (size !== undefined) {
						url += 'size=' + size + '&';
					}
				}
				var title = 'My Mqtts';
				if (app.isLogged) defaultCard = { title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any mqtt topic yet.', action: { id: 'mqtt_add', label: '<i class=\'material-icons\'>add</i>Add my first Mqtt' }, className: "mdl-grid mdl-cell mdl-cell--12-col" };
				else defaultCard = { title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.', className: "mdl-grid mdl-cell mdl-cell--12-col" }; // ,

			} else if (type == 'sources') {
				var container = (app.containers.sources).querySelector('.page-content');
				var url = `${app.baseUrl}/${app.api_version}/sources`;
				if (page || size) {
					url += '?';
					if (page !== undefined) {
						url += 'page=' + page + '&';
					}
					if (size !== undefined) {
						url += 'size=' + size + '&';
					}
				}
				var title = 'My Sources';
				if (app.isLogged) defaultCard = { title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any source yet.', action: { id: 'source_add', label: '<i class=\'material-icons\'>add</i>Add my first Source' }, className: "mdl-grid mdl-cell mdl-cell--12-col" };
				else defaultCard = { title: 'Code Source', titlecolor: '#ffffff', description: 'Deploy Arduino source Over The Air.', className: "mdl-grid mdl-cell mdl-cell--12-col" }; // ,

			} else if (type == 'tokens') {
				var container = (app.containers.tokens).querySelector('.page-content');
				var url = `${app.baseUrl}/${app.api_version}/tokens`;
				if (page || size) {
					url += '?';
					if (page !== undefined) {
						url += 'page=' + page + '&';
					}
					if (size !== undefined) {
						url += 'size=' + size + '&';
					}
				}
				var title = 'My tokens';
				if (app.isLogged) defaultCard = { title: title, titlecolor: '#ffffff', description: 'Hey, it looks you don\'t have any token yet.', action: { id: 'token_add', label: '<i class=\'material-icons\'>add</i>Add my first Token' }, className: "mdl-grid mdl-cell mdl-cell--12-col" };
				else defaultCard = { title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.', className: "mdl-grid mdl-cell mdl-cell--12-col" }; // ,

			} else if (type == 'status') {
				var icon = app.icons.status;
				var container = (app.containers.status).querySelector('.page-content');
				defaultCard = {};
				app.getStatus();

			} else {
				if (localStorage.getItem("settings.debug") == "true") {
					console.log('DEBUG Error no Type defined: ' + type);
					toast('Error no Type defined.', { timeout: app.toastDuration, type: "error" });
				}
				type = undefined;
			}

			if (!navigator.onLine) {
				container.innerHTML = app.getCard(app.offlineCard);
			} else {
				if (app.isLogged && type !== undefined) {
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse) {
							return fetchResponse.json();
						})
						.then(function(response) {
							if (page == 1) {
								container.innerHTML = "";
							}
							if (!response.data || (response.data && (response.data).length == 0)) {
								container.innerHTML = app.getCard(defaultCard);
								app.displayLoginForm(container);
							} else {
								for (var i = 0; i < (response.data).length; i++) {
									container.innerHTML += (app.resources)[type].displayItem(response.data[i]);
								}
								app.showAddFAB(type);
								componentHandler.upgradeDom();
								app.setItemsClickAction(type);
								app.setListActions(type);
								if (type == 'snippets') {
									app.snippets = [];
									(response.data).map(function(snippet) {
										app.snippets.push({ id: snippet.id, name: snippet.attributes.name, sType: snippet.attributes.type, type: snippets.attributes.type });
									});
									localStorage.setItem('snippets', JSON.stringify(app.snippets));
								} else if (type == 'flows') {
									app.flows = [];
									(response.data).map(function(flow) {
										app.flows.push({ id: flow.id, name: flow.attributes.name, type: flow.attributes.type });
									});
									localStorage.setItem('flows', JSON.stringify(app.flows));
								}
							}
							app.containers.spinner.setAttribute('hidden', true);
							app.containers.spinner.classList.add('hidden');
							resolve();
						})
						.catch(function(error) {
							if (localStorage.getItem("settings.debug") == "true") {
								toast('fetchItemsPaginated ' + type + ' error occured...' + error, { timeout: app.toastDuration, type: "error" });
							}
						});
				} else {
					container.innerHTML = app.getCard(defaultCard);
					resolve();
				}
			}
		});
		return promise;
	};

	app.getObjectsMaps = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		app.getLocation();
		
		var container = (app.containers.objectsMaps).querySelector('.page-content');
		let objectsMaps = "";
		objectsMaps += app.getSubtitle("Locate Objects");
		objectsMaps += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
		objectsMaps += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		objectsMaps += "	<div class=\"card-header heading-left\">&nbsp;</div>";
		objectsMaps += app.getMap("my_location", "osmLocateObjects", parseFloat(app.defaultResources.object.attributes.longitude), parseFloat(app.defaultResources.object.attributes.latitude), false, false, false);
		objectsMaps += "	</div>";
		objectsMaps += "</section>";
		container.innerHTML = objectsMaps;
		
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = `${app.baseUrl}/${app.api_version}/objects/`;
		var map;
		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				if (response.data) {
					let objectsLocation = [];
					for (var i = 0; i < (response.data).length; i++) {
						var object = response.data[i];
						if (object.attributes.latitude && object.attributes.longitude) {
							objectsLocation.push({ id: object.id, name: object.attributes.name, latitude: object.attributes.latitude, longitude: object.attributes.longitude });
						}
					}
		
					var container = L.DomUtil.get("osmLocateObjects");
					if(typeof container !== "undefined") {
						container._leaflet_id = null;
					}
					map = L.map("osmLocateObjects").setView([parseFloat(app.defaultResources.object.attributes.latitude), parseFloat(app.defaultResources.object.attributes.longitude)], 13);
					L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
						attribution: '© <a href="//osm.org/copyright">OpenStreetMap</a>',
						minZoom: 1,
						maxZoom: 20,
						trackResize: true,
						dragging: true
					}).addTo(map);
					let popup = L.popup();
					let CustomIcon = L.Icon.extend({
						options: {
							shadowUrl:		"/img/m/marker-shadow.png",
							iconSize:		[25, 41],
							shadowSize:		[41, 41],
							iconAnchor:		[20, 20],
							shadowAnchor:	[20, 20],
							popupAnchor:	[0, -20]
						}
					});
					let bounds = new L.LatLngBounds();
					let mIcon = new CustomIcon({iconUrl: "/img/m/marker-icon.png"});
					objectsLocation.map(function(obj) {
						let marker = L.marker([parseFloat(obj.latitude), parseFloat(obj.longitude)], {icon: mIcon, draggable: false}).bindPopup(`${obj.name}<br /><a href="javascript:app.resources.objects.display('${obj.id}', false, false, false);">Details</a>`).addTo(map);
						bounds.extend(marker.getLatLng());
					});
					map.fitBounds(bounds);
					setTimeout(function() {map.invalidateSize(true);}, 1000);
				}
			});

		componentHandler.upgradeDom();
		app.containers.spinner.setAttribute('hidden', true);
		app.containers.spinner.classList.add('hidden');
		
	};

	app.getUsersList = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (app.containers.usersList).querySelector('.page-content');
		var url = `${app.baseUrl}/${app.api_version}/users/list`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				var usersList = "";
				document.title = app.sectionsPageTitles['users-list'];
				for (var i = 0; i < (response.data).length; i++) {
					var user = response.data[i];
					var num = (response.links.meta.count) - i;
					usersList += "<div class=\"mdl-grid mdl-cell\" data-action=\"nothing\" data-type=\"user\" data-id=\"" + user.id + "\">";
					usersList += "	<div class=\"mdl-card mdl-shadow--2dp\">";
					usersList += "		<div class=\"mdl-card__title\">";
					usersList += "			<i class=\"material-icons\">perm_identity</i>";
					usersList += "			<h3 class=\"mdl-card__title-text\">" + num + ". " + user.attributes.first_name + " " + user.attributes.last_name + "</h3>";
					usersList += "		</div>";
					usersList += "		<div class=\"mdl-card__title\"><img src=\"//secure.gravatar.com/avatar/" + hex_md5(user.attributes.email) + "\" alt=\"\" class=\"user-image\"></div>";
					usersList += app.getField('card_membership', 'User id', user.id, { type: 'text', style: "text-transform: none !important;", isEdit: false });
					usersList += app.getField('mail', 'Email', user.attributes.email, { type: 'text', style: "text-transform: none !important;", isEdit: false });
					if (user.attributes.push_subscription && typeof user.attributes.push_subscription === "object" && typeof user.attributes.push_subscription.keys === "object" && typeof user.attributes.push_subscription.keys.auth === "string") {
						usersList += app.getField('sms', 'Push notification Auth', user.attributes.push_subscription.keys.auth, { type: 'text', style: "text-transform: none !important;", isEdit: false });
					}
					if (user.attributes.location) {
						if (user.attributes.location.geo) {
							usersList += app.getField('my_location', 'Location', user.attributes.location.geo.city + " (" + user.attributes.location.geo.country + ")", { type: 'text', isEdit: false });
						}
						if (user.attributes.location.ip) {
							usersList += app.getField('dns', 'IP address', user.attributes.location.ip, { type: 'text', isEdit: false });
						}
					}
					usersList += app.getField('contact_mail', 'Password last update', moment((user.attributes.password_last_updated) / 1).format(app.date_format), { type: 'text', isEdit: false });
					usersList += app.getField('contact_mail', 'Reminder Email', moment((user.attributes.reminder_mail) / 1).format(app.date_format), { type: 'text', isEdit: false });
					usersList += app.getField('change_history', 'Password reset request', moment((user.attributes.change_password_mail) / 1).format(app.date_format), { type: 'text', isEdit: false });
					usersList += app.getField('new_releases', 'Newsletter', ((user.attributes.unsubscription) && (typeof user.attributes.unsubscription.newsletter !== "undefined")) ? "Unsubscribed " + moment((user.attributes.unsubscription.newsletter) / 1).format(app.date_format) : "Subscribed", { type: 'text', isEdit: false });

					usersList += "		<div class=\"mdl-card__actions mdl-card--border\">";
					usersList += "			<span class=\"pull-left mdl-card__date\">";
					usersList += "				<button data-id=\"" + user.id + "\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
					usersList += "					<i class=\"material-icons\">update</i>";
					usersList += "				</button>";
					usersList += "				<span data-date=\"created\" class=\"visible\">Subscribed on " + moment((user.attributes.subscription_date) / 1).format(app.date_format) + "</span>";
					usersList += "				<span data-date=\"updated\" class=\"hidden\">Password last update on " + moment((user.attributes.password_last_updated) / 1).format(app.date_format) + "</span>";
					usersList += "			</span>";
					usersList += "		</div>";
					usersList += "	</div>";
					usersList += "</div>";
				}
				container.innerHTML += usersList;

				componentHandler.upgradeDom();
				app.setItemsClickAction('usersList');
				app.containers.spinner.setAttribute('hidden', true);
				app.containers.spinner.classList.add('hidden');
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('getUsersList error out...' + error, { timeout: app.toastDuration, type: "error" });
				}
			});
	};

	app.fetchProfile = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		app.initNewSection("profile");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (app.containers.profile).querySelector('.page-content');
		var url = `${app.baseUrl}/${app.api_version}/users/me/token`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				if (!navigator.onLine) {
					container.innerHTML = app.getCard(app.offlineCard);
				} else {
					var user = response.data;
					var gravatar = user.attributes.gravatar.entry[0];
					var node = "";
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp card card-user\">";
					if (gravatar.profileBackground) {
						node += "	<div class=\"card-heading heading-left\" style=\"background: url('" + gravatar.profileBackground.url + "') 50% 50% !important\">";
					} else {
						node += "	<div class=\"card-heading heading-left\" style=\"background: url('" + app.baseUrlCdn + "/img/opl_img.webp') 50% 50% !important\">";
					}
					node += "		<img src=\"//secure.gravatar.com/avatar/" + hex_md5(user.attributes.email) + "\" alt=\"\" class=\"user-image\">";
					node += "		<h3 class=\"card-title text-color-white\">" + user.attributes.first_name + " " + user.attributes.last_name + "</h3>";
					if (gravatar.currentLocation) {
						node += "		<div class=\"subhead\">";
						node += gravatar.currentLocation;
						node += "		</div>";
					}
					node += "	</div>";

					node += "	<div class=\"card-body\">";
					node += app.getField('face', 'First name', user.attributes.first_name, { type: 'input', id: 'firstName', isEdit: true, pattern: app.patterns.name, error: 'Must be greater than 3 chars.' });
					node += app.getField('face', 'Last name', user.attributes.last_name, { type: 'input', id: 'lastName', isEdit: true, pattern: app.patterns.name, error: 'Must be greater than 3 chars.' });
					node += app.getField('lock', 'Email', user.attributes.email, { type: 'text', id: 'email', style: 'text-transform: none !important;', isEdit: false });
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
						node += app.getField('phone', gravatar.phoneNumbers[phone].type, gravatar.phoneNumbers[phone].value, { type: 'text', isEdit: false });
					}
					node += "		<ul class=\"social-links\">";
					for (var account in gravatar.accounts) {
						node += "		<li><a href=\"" + gravatar.accounts[account].url + "\"><i class=\"material-icons mdl-textfield__icon\">link</i><span class=\"mdl-list__item-sub-title\">" + gravatar.accounts[account].shortname + "</span></a></li>";
					}
					node += "		</ul>";
					node += "		<ul class='social-links'>";
					for (var url in gravatar.urls) {
						node += "		<li><a href=\"" + gravatar.urls[url].value + "\" target=\"_blank\"><i class=\"material-icons\">bookmark</i><span class=\"mdl-list__item-sub-title\">" + gravatar.urls[url].title + "</span></a></li>";
					}
					node += "		</ul>";
					node += "	</div>";
					node += "	<div class=\"mdl-card__actions mdl-card--border\">";
					node += "		<a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" href=\"" + gravatar.profileUrl + "\" target=\"_blank\"><i class=\"material-icons\">launch</i>Edit my gravatar</a>";
					node += "	</div>";
					node += "</div>";
					node += "</section>";

					container.innerHTML = node;
					componentHandler.upgradeDom();
					// Profile Storage
					localStorage.setItem('currentUserId', user.id);
					localStorage.setItem("currentUserName", user.attributes.first_name + " " + user.attributes.last_name);
					localStorage.setItem("currentUserEmail", user.attributes.email);
					localStorage.setItem("notifications.email", user.attributes.email);
					localStorage.setItem("notifications.unsubscription_token", user.attributes.unsubscription_token);
					localStorage.setItem("currentUserHeader", gravatar.photos[0].value);
					if (gravatar.profileBackground && gravatar.profileBackground.url) {
						localStorage.setItem("currentUserBackground", gravatar.profileBackground.url);
					}
					if (app.gtm && app.getCookie('cookieconsentNoGTM') !== "true" && typeof self.dataLayer !== "undefined" && firebaseConfig) {
						self.dataLayer.push({
							"userEmail": user.attributes.email,
							"userRole": user.attributes.role,
							"userId": user.id
						});
						if(typeof gtag === "function") {
							gtag("config", firebaseConfig.measurementId, { 'user_id': user.id });
						}
						if (typeof firebase !== "undefined" && !firebase.apps.length) {
							firebase.analytics().setUserProperties({ 'userId': user.id });
							firebase.analytics().setUserProperties({ 'userRole': user.attributes.role });
						}
						if (typeof Tawk_API !== "undefined" && typeof Tawk_API.setAttributes === "function") {
							Tawk_API.setAttributes({
								'name': user.attributes.first_name + " " + user.attributes.last_name,
								'email': user.attributes.email
							}, function(error) { });
						}
					}
					app.setDrawer();
					app.fetchUnsubscriptions();
					app.displayUnsubscriptions((app.containers.profile).querySelector('.page-content'));

					document.getElementById("saveProfileButton").addEventListener("click", function(evt) {
						app.onSaveProfileButtonClick();
						evt.preventDefault();
					});

					if (user.attributes.role === "admin" && !document.querySelector('#drawer nav a.mdl-navigation__link[href="#users-list"]')) {
						localStorage.setItem("role", 'admin');
						app.addMenuItem('Users Accounts', 'supervisor_account', '#users-list', null);
					}
				}
				app.containers.spinner.setAttribute('hidden', true);
				app.containers.spinner.classList.add('hidden');
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('fetchProfile error out...' + error, { timeout: app.toastDuration, type: "error" });
				}
			});
	};

	app.fetchUnsubscriptions = function() {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = `${app.baseUrl}/${app.api_version}/notifications/list/unsubscribed`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				var notifications = response.unsubscription !== undefined ? response.unsubscription : {};
				localStorage.setItem("notifications.unsubscribed", JSON.stringify(notifications));
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('fetchUnsubscriptions error' + error, { timeout: app.toastDuration, type: "error" });
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
		value = notifications.reminder !== null ? 'false' : 'true';
		node += app.getField('mail_outline', 'Reminder Welcome email', value, { type: 'switch', id: 'profile.notifications.reminder', isEdit: isEdit });

		value = notifications.changePassword !== null ? 'false' : 'true';
		node += app.getField('mail_outline', 'Reminder to change Password', value, { type: 'switch', id: 'profile.notifications.changePassword', isEdit: isEdit });

		value = notifications.newsletter !== null ? 'false' : 'true';
		node += app.getField('mail_outline', 't6 Newsletter', value, { type: 'switch', id: 'profile.notifications.newsletter', isEdit: isEdit });

		node += app.getField('mail_outline', 'Security notification related to your account', true, { type: 'switch', id: 'profile.notifications.security', isEdit: false });
		node += "	</div>";
		node += "</section>";

		container.innerHTML += node;
		componentHandler.upgradeDom();

		let element1 = document.getElementById('switch-profile.notifications.reminder').parentNode;
		if (element1) {
			element1.addEventListener('change', function(e) {
				if (app.getSetting('notifications.email') && app.getSetting('notifications.unsubscription_token')) {
					var name = 'reminder';
					var type = element1.classList.contains('is-checked') !== false ? 'subscribe' : 'unsubscribe';
					var myHeaders = new Headers();
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: 'GET', headers: myHeaders };
					var url = app.baseUrl + '/mail/' + app.getSetting('notifications.email') + '/' + type + '/' + name + '/' + app.getSetting('notifications.unsubscription_token') + '/';

					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(response) {
							toast('Subscription ' + name + ' (' + type + ') updated.', { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							if (localStorage.getItem("settings.debug") == "true") {
								toast('Error occured on saving Notifications...' + error, { timeout: app.toastDuration, type: "error" });
							}
						});
				} else {
					if (localStorage.getItem("settings.debug") == "true") {
						toast('Error occured on saving Notifications...', { timeout: app.toastDuration, type: "error" });
					}
				}
			});
		}

		var element2 = document.getElementById('switch-profile.notifications.changePassword').parentNode;
		if (element2) {
			element2.addEventListener('change', function(e) {
				if (app.getSetting('notifications.email') && app.getSetting('notifications.unsubscription_token')) {
					var name = 'changePassword';
					var type = element2.classList.contains('is-checked') !== false ? 'subscribe' : 'unsubscribe';
					var myHeaders = new Headers();
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: 'GET', headers: myHeaders };
					var url = app.baseUrl + '/mail/' + app.getSetting('notifications.email') + '/' + type + '/' + name + '/' + app.getSetting('notifications.unsubscription_token') + '/';

					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(response) {
							toast('Subscription ' + name + ' (' + type + ') updated.', { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							if (localStorage.getItem("settings.debug") == "true") {
								toast('Error occured on saving Notifications...' + error, { timeout: app.toastDuration, type: "error" });
							}
						});
				} else {
					if (localStorage.getItem("settings.debug") == "true") {
						toast('Error occured on saving Notifications...', { timeout: app.toastDuration, type: "error" });
					}
				}
			});
		}

		let element3 = document.getElementById('switch-profile.notifications.newsletter').parentNode;
		if (element3) {
			element3.addEventListener('change', function(e) {
				if (app.getSetting('notifications.email') && app.getSetting('notifications.unsubscription_token')) {
					var name = 'newsletter';
					var type = element3.classList.contains('is-checked') !== false ? 'subscribe' : 'unsubscribe';
					var myHeaders = new Headers();
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: 'GET', headers: myHeaders };
					var url = app.baseUrl + '/mail/' + app.getSetting('notifications.email') + '/' + type + '/' + name + '/' + app.getSetting('notifications.unsubscription_token') + '/';
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(response) {
							toast('Subscription ' + name + ' (' + type + ') updated.', { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							if (localStorage.getItem("settings.debug") == "true") {
								toast('Error occured on saving Notifications...' + error, { timeout: app.toastDuration, type: "error" });
							}
						});
				} else {
					if (localStorage.getItem("settings.debug") == "true") {
						toast('Error occured on saving Notifications...', { timeout: app.toastDuration, type: "error" });
					}
				}
			});
		}
	};

	app.setDrawer = function() {
		if (localStorage.getItem("currentUserName") != 'null') { document.getElementById("currentUserName").innerHTML = localStorage.getItem("currentUserName") }
		else { document.getElementById("currentUserName").innerHTML = "t6 IoT App"; }
		if (localStorage.getItem("currentUserEmail") != 'null') { document.getElementById("currentUserEmail").innerHTML = localStorage.getItem("currentUserEmail") }
		else { document.getElementById("currentUserEmail").innerHTML = ""; }
		if (document.getElementById("imgIconMenu") && localStorage.getItem("currentUserHeader") != 'null' && localStorage.getItem("currentUserHeader")) {
			document.getElementById("currentUserHeader").setAttribute('src', localStorage.getItem("currentUserHeader"));
			document.getElementById("imgIconMenu").outerHTML = "<img id=\"imgIconMenu\" src=\"" + localStorage.getItem("currentUserHeader") + "\" alt=\"Current user avatar\" style=\"border-radius: 50%; width: 30px; height: 30px; padding: 0px;border: 2px solid #fff;margin: 0px 0px;\">";
		}
		else { document.getElementById("currentUserHeader").setAttribute('src', app.baseUrlCdn + "/img/m/icons/icon-128x128.png"); }
		if (localStorage.getItem("currentUserBackground") !== null) { document.getElementById("currentUserBackground").style.background = "#795548 url(" + localStorage.getItem("currentUserBackground") + ") 50% 50% / cover" }
		else { document.getElementById("currentUserBackground").style.background = "#795548 url(" + app.baseUrlCdn + "/img/m/side-nav-bg.webp) 50% 50% / cover" }
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
		container.querySelectorAll('form.signin').forEach(function(e) { if (e) { e.parentNode.remove(); } });
		if (app.isLogged === false) {
			var login = "<section class='content-grid mdl-grid'>" +
				"	<div class='mdl-layout-spacer'></div>" +
				"	<form class='signin'>" +
				"		<div class='mdl-card mdl-card__title mdl-shadow--2dp'>" +
				"			<img src='" + app.baseUrlCdn + "/img/opl_img.webp' alt='t6 Connect your Objects' aria-hidden='true'>" +
				"			<div class='mdl-card__title'>" +
				"				Connect your Objects to collect their data and show your own Dashboards." +
				"			</div>" +
				"			<div class='mdl-card__supporting-text'>" +
				"				<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>" +
				"					<i class='material-icons mdl-textfield__icon'>lock</i>" +
				"					<input name='username' inputmode='email' autocomplete='username email' pattern=\"" + app.patterns.username + "\" class='mdl-textfield__input' type='text' id='signin.username'>" +
				"					<label for='signin.username' class='mdl-textfield__label'>Username</label>" +
				"					<span class='mdl-textfield__error'>Username should be your email address</span>" +
				"				</div>" +
				"				<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>" +
				"					<i class='material-icons mdl-textfield__icon'>vpn_key</i>" +
				"					<input name='password' pattern=\"" + app.patterns.password + "\" class='mdl-textfield__input' type='password' autocomplete='current-password' id='signin.password'>" +
				"					<label for='signin.password' class='mdl-textfield__label'>Password</label>" +
				"					<span class='mdl-textfield__error'>Password must be provided</span>" +
				"				</div>" +
				"			</div>" +
				"			<div class='mdl-card__supporting-text'>" +
				//app.getField(null, "Notifications", app.getSetting('settings.notifications')!==undefined?app.getSetting('settings.notifications'):true, {type: 'switch', id:'login.notifications', isEdit: true}) +
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
			for (var i = 0; i < updated.length; i++) {
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
		var container = app.containers.index!==null?(app.containers.index).querySelector('.page-content'):null;
		//app.containers.spinner.removeAttribute('hidden');
		//app.containers.spinner.classList.remove('hidden');
		if (!localStorage.getItem('index')) {
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'GET', headers: myHeaders };
			var url = `${app.baseUrl}/${app.api_version}/index`;

			fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse) {
					return fetchResponse.json();
				})
				.then(function(response) {
					for (var i = 0; i < (response).length; i++) {
						node += app.getCard(response[i]);
					}
					localStorage.setItem('index', JSON.stringify(response));
					container.innerHTML = node;
					app.imageLazyLoading();
					app.containers.spinner.setAttribute('hidden', true);
					app.containers.spinner.classList.add('hidden');
				})
				.catch(function(error) {
					container.innerHTML = app.getCard({ image: app.baseUrlCdn + '/img/opl_img2.webp', title: 'Oops, something has not been loaded correctly..', titlecolor: '#ffffff', description: 'We are sorry, the content cannot be loaded, please try again later, there might a temporary network outage. :-)' });
					app.displayLoginForm(container);
					if (localStorage.getItem("settings.debug") == "true") {
						toast('fetchIndex error out...' + error, { timeout: app.toastDuration, type: "error" });
					}
				});
		} else {
			var index = JSON.parse(localStorage.getItem('index'));
			for (var i = 0; i < index.length; i++) {
				node += app.getCard(index[i]);
			}
			if(container!==null) {
				container.innerHTML = node;
			}
		}
	};

	app.showAddFAB = function(type) {
		let container;
		let fabs = new Array();
		if (type === 'objects') {
			fabs.push({id: "locateObject", icon: "place", tooltip: "Locate Objects"});
			fabs.push({id: "createObject", icon: "add", tooltip: "Add a new object"});
			container = (app.containers.objects).querySelector('.page-content');
		}
		if (type === 'flows') {
			fabs.push({id: "DataExploration", icon: "flare", tooltip: "Data Exploration"});
			fabs.push({id: "createFlow", icon: "add", tooltip: "Add a new flow"});
			container = (app.containers.flows).querySelector('.page-content');
		}
		if (type === 'dashboards') {
			fabs.push({id: "createDashboard", icon: "add", tooltip: "Add a new dashboard"});
			container = (app.containers.dashboards).querySelector('.page-content');
		}
		if (type === 'snippets') {
			fabs.push({id: "createSnippet", icon: "add", tooltip: "Add a new snippet"});
			container = (app.containers.snippets).querySelector('.page-content');
		}
		if (type === 'rules') {
			fabs.push({id: "createRule", icon: "add", tooltip: "Add a new rule"});
			container = (app.containers.rules).querySelector('.page-content');
		}
		if (type === 'mqtts') {
			fabs.push({id: "createMqtt", icon: "add", tooltip: "Add a new mqtt"});
			container = (app.containers.mqtts).querySelector('.page-content');
		}
		if (type === 'sources') {
			fabs.push({id: "createSource", icon: "add", tooltip: "Add a new source"});
			container = (app.containers.sources).querySelector('.page-content');
		}
		if (type === 'exploration') {
			fabs.push({id: "exploreFlows", icon: "flare", tooltip: "Explore"});
			container = (app.containers.exploration).querySelector('.page-content');
		}
		if (container && fabs.length > -1) {
			let fabClass = app.getSetting('settings.fab_position') !== null ? app.getSetting('settings.fab_position') : "fab__bottom";
			fabClass += app.getSetting('settings.isLtr') === "true" ? " pull-right" : " pull-left";
			let tooltipClass = app.getSetting('settings.isLtr') === "true" ? "mdl-tooltip--left" : "mdl-tooltip--right";
			let fab = `<div class="mdl-button--fab_flinger-container ${fabClass}">`;
			fabs.map(function(button) {
				fab += `	<button id="${button.id}" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored mdl-shadow--8dp">
								<i class='material-icons'>${button.icon}</i>
								<div class="mdl-tooltip ${tooltipClass}" for="${button.id}">${button.tooltip}</label>
							</button>`;
			});
			fab += "</div>";

			// Add spacer
			var from = (parseInt(app.itemsPage[type]) * parseInt(app.itemsSize[type])) + 1;
			var to = (parseInt(app.itemsPage[type]) + 1) * parseInt(app.itemsSize[type]);
			var page = parseInt(app.itemsPage[type]) + 1;
			var max = 5; // hardcoded! # TODO
			//if ( to < max ) {
			fab += "<div class='mdl-grid mdl-cell mdl-cell--12-col spacer'>";
			fab += "	<span class='mdl-layout-spacer'></span>";
			fab += "		<button data-size='" + parseInt(app.itemsSize[type]) + "' data-page='" + page + "' data-type='" + type + "' class='lazyloading mdl-cell--12-col mdl-button mdl-js-button mdl-js-ripple-effect'>";
			fab += "			<i class='material-icons'>expand_more</i>";
			fab += "		</button>";
			fab += "	<span class='mdl-layout-spacer'></span>";
			fab += "</div>";
			//}
			container.innerHTML += fab;
			componentHandler.upgradeDom();

			app.refreshButtonsSelectors();
			if (document.getElementById("exploreFlows")) {
				document.getElementById("exploreFlows").addEventListener("click", function(evt) { app.eda(evt); evt.preventDefault(); }, false);
			}
			if (document.getElementById("locateObject")) {
				document.getElementById("locateObject").addEventListener("click", function(evt) { app.setSection("objects-maps"); evt.preventDefault(); }, false);
			}
			if (document.getElementById("DataExploration")) {
				document.getElementById("DataExploration").addEventListener("click", function(evt) { app.setSection("exploration"); evt.preventDefault(); }, false);
			}
			if (app.buttons.createObject) {
				app.buttons.createObject.addEventListener("click", function(evt) { app.setSection("object_add"); evt.preventDefault(); }, false);
			}
			if (app.buttons.createFlow) {
				app.buttons.createFlow.addEventListener("click", function(evt) { app.setSection("flow_add"); evt.preventDefault(); }, false);
			}
			if (app.buttons.createSnippet) {
				app.buttons.createSnippet.addEventListener("click", function(evt) { app.setSection("snippet_add"); evt.preventDefault(); }, false);
			}
			if (app.buttons.createDashboard) {
				app.buttons.createDashboard.addEventListener("click", function(evt) { app.setSection("dashboard_add"); evt.preventDefault(); }, false);
			}
			if (app.buttons.createRule) {
				app.buttons.createRule.addEventListener("click", function(evt) { app.setSection("rule_add"); evt.preventDefault(); }, false);
			}
			if (app.buttons.createMqtt) {
				app.buttons.createMqtt.addEventListener("click", function(evt) { app.setSection("mqtt_add"); evt.preventDefault(); }, false);
			}
			if (app.buttons.createSource) {
				app.buttons.createSource.addEventListener("click", function(evt) { app.setSection("source_add"); evt.preventDefault(); }, false);
			}
		}
	};

	app.getWidth = function(margin=0) {
		return typeof document.querySelector(".is-active .page-content section")!=="undefined"?(document.querySelector(".is-active .page-content section").offsetWidth)-margin:0;
	}

	app.eda = function(evt) {
		let myForm = (app.containers.exploration);
		let my_flow_id = Array.prototype.map.call(myForm.querySelectorAll(".mdl-chips .mdl-chip"), function(flow) { return ((JSON.parse(localStorage.getItem("flows")))[flow.getAttribute("data-id")]).id; });
		let start = "&start=" + myForm.querySelector("#start").value;
		let end = "&end=" + myForm.querySelector("#end").value;
		let sel_summary = myForm.querySelector("#switch-ExplorationSummary").parentNode.classList.contains("is-checked");
		let sel_head = myForm.querySelector("#switch-ExplorationHead").parentNode.classList.contains("is-checked");
		let sel_tail = myForm.querySelector("#switch-ExplorationTail").parentNode.classList.contains("is-checked");
		let sel_boxplot = myForm.querySelector("#switch-ExplorationBoxplot").parentNode.classList.contains("is-checked");
		let sel_frequency = myForm.querySelector("#switch-ExplorationFrequency").parentNode.classList.contains("is-checked");
		let sel_line = myForm.querySelector("#switch-ExplorationLine").parentNode.classList.contains("is-checked");
		let sel_loess = myForm.querySelector("#switch-ExplorationLoess").parentNode.classList.contains("is-checked");
		let sel_trend = myForm.querySelector("#switch-ExplorationTrend").parentNode.classList.contains("is-checked");
		
		
		if (!(sel_summary || sel_head || sel_tail || sel_boxplot || sel_frequency || sel_line || sel_loess || sel_trend )) {
			toast("Please select at least one output.", { timeout: app.toastDuration, type: "error" });
			return;
		}
		
		if (my_flow_id.length>0) {
			if (start && end) {
				app.containers.spinner.removeAttribute('hidden');
				app.containers.spinner.classList.remove('hidden');
				toast("Exploring... Please wait.", { timeout: app.toastDuration, type: "info" });

				if (sel_summary) {
					if (!myForm.querySelector(".page-content #exploreSummaryResults")) {
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", app.getSubtitle("Exploration Summary Statistics"));
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", `<section class="mdl-grid mdl-cell--12-col">
												<div class="mdl-cell--12-col mdl-card mdl-shadow--2dp">
													<div>&nbsp;</div>
													<div class="mdl-list__item--three-line small-padding" id="exploreSummaryResults"></div>
													<div>&nbsp;</div>
												</div>
											</section>`);
						
					} else {
						myForm.querySelector("#exploreSummaryResults").innerHTML = "";
					}
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer " + localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "GET", headers: myHeaders };
					var url = `${app.baseUrl}/${app.api_version}/exploration/summary?flow_id=${my_flow_id}${start}${end}`;
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse) {
							return fetchResponse.json();
						})
						.then(function(response) {
							myForm.querySelector("#exploreSummaryResults").innerHTML += app.getField("timeline", "Data Type", `${response.data_type.name} ${response.data_type.type} (${response.data_type.classification})`, { type: "text" });
							for (const [key, value] of Object.entries(response)) {
								if (typeof value !== "object") {
									myForm.querySelector("#exploreSummaryResults").innerHTML += app.getField("bubble_chart", key, value, { type: "text", tooltip: typeof app.summaryResults[key]!=="undefined"?app.summaryResults[key]:undefined });
								}
							};
							componentHandler.upgradeDom();
							toast("Data exploration updated", { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							toast("Exploring error.", { timeout: app.toastDuration, type: "error" });
						});
					
					app.containers.spinner.setAttribute('hidden', true);
					app.containers.spinner.classList.add('hidden');
					evt.preventDefault();
				}

				if (sel_head) {
					if (!myForm.querySelector(".page-content #exploreHeadResults")) {
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", app.getSubtitle("Exploration Head"));
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", `<section class="mdl-grid mdl-cell--12-col">
												<div class="mdl-cell--12-col mdl-card mdl-shadow--2dp">
													<div>&nbsp;</div>
													<div class="mdl-list__item--three-line small-padding" id="exploreHeadResults"></div>
													<div>&nbsp;</div>
												</div>
											</section>`);
						
					} else {
						myForm.querySelector("#exploreHeadResults").innerHTML = "";
					}
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer " + localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "GET", headers: myHeaders };
					var url = `${app.baseUrl}/${app.api_version}/exploration/head?flow_id=${my_flow_id}${start}${end}&n=1`;
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse) {
							return fetchResponse.json();
						})
						.then(function(response) {
							for (const [key, value] of Object.entries(response[0])) {
								if (typeof value !== "object") {
									myForm.querySelector("#exploreHeadResults").innerHTML += app.getField("bubble_chart", key, value, { type: "text" });
								}
							};
							toast("Data exploration updated", { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							toast("Exploring error.", { timeout: app.toastDuration, type: "error" });
						});
					
					app.containers.spinner.setAttribute('hidden', true);
					app.containers.spinner.classList.add('hidden');
					evt.preventDefault();
				}

				if (sel_tail) {
					if (!myForm.querySelector(".page-content #exploreTailResults")) {
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", app.getSubtitle("Exploration Tail"));
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", `<section class="mdl-grid mdl-cell--12-col">
												<div class="mdl-cell--12-col mdl-card mdl-shadow--2dp">
													<div>&nbsp;</div>
													<div class="mdl-list__item--three-line small-padding" id="exploreTailResults"></div>
													<div>&nbsp;</div>
												</div>
											</section>`);
						
					} else {
						myForm.querySelector("#exploreTailResults").innerHTML = "";
					}
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer " + localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "GET", headers: myHeaders };
					var url = `${app.baseUrl}/${app.api_version}/exploration/tail?flow_id=${my_flow_id}${start}${end}&n=1`;
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						).then(function(fetchResponse) {
							return fetchResponse.json();
						})
						.then(function(response) {
							for (const [key, value] of Object.entries(response[0])) {
								if (typeof value !== "object") {
									myForm.querySelector("#exploreTailResults").innerHTML += app.getField("bubble_chart", key, value, { type: "text" });
								}
							};
							toast("Data exploration updated", { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							toast("Exploring error.", { timeout: app.toastDuration, type: "error" });
						});
					
					app.containers.spinner.setAttribute('hidden', true);
					app.containers.spinner.classList.add('hidden');
					evt.preventDefault();
				}

				if (sel_boxplot) {
					if (!myForm.querySelector(".page-content #exploreBoxplotResults")) {
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", app.getSubtitle("Exploration Boxplot"));
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", `<section class="mdl-grid mdl-cell--12-col">
												<div class="mdl-cell--12-col mdl-card mdl-shadow--2dp">
													<div>&nbsp;</div>
													<div class="mdl-list__item--three-line small-padding" id="exploreBoxplotResults"></div>
													<div>&nbsp;</div>
												</div>
											</section>`);
						
					} else {
						myForm.querySelector("#exploreBoxplotResults").innerHTML = "";
					}
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer " + localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "GET", headers: myHeaders };
					var url = `${app.baseUrl}/${app.api_version}/exploration/boxplot?flow_id=${my_flow_id}&width=${app.getWidth(64)}&height=200&xAxis=Boxplot${start}${end}`;
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						)
						.then(response => response.text())
						.then(function(svg) {
							document.getElementById("exploreBoxplotResults").innerHTML = svg;
							toast("Data exploration updated", { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							toast("Exploring error.", { timeout: app.toastDuration, type: "error" });
						});
					
					app.containers.spinner.setAttribute('hidden', true);
					app.containers.spinner.classList.add('hidden');
					evt.preventDefault();
				}

				if (sel_line) {
					if (!myForm.querySelector(".page-content #exploreLineResults")) {
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", app.getSubtitle("Plot Line"));
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", `<section class="mdl-grid mdl-cell--12-col">
												<div class="mdl-cell--12-col mdl-card mdl-shadow--2dp">
													<div>&nbsp;</div>
													<div class="mdl-list__item--three-line small-padding" id="exploreLineResults"></div>
													<div>&nbsp;</div>
												</div>
											</section>`);
						
					} else {
						myForm.querySelector("#exploreLineResults").innerHTML = "";
					}
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer " + localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "GET", headers: myHeaders };
					var url = `${app.baseUrl}/${app.api_version}/exploration/line?flow_id=${my_flow_id}&width=${app.getWidth(64)}&height=200&xAxis=Plot Line&limit=10000${start}${end}`;
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						)
						.then(response => response.text())
						.then(function(svg) {
							document.getElementById("exploreLineResults").innerHTML = svg;
							toast("Data exploration updated", { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							toast("Exploring error.", { timeout: app.toastDuration, type: "error" });
						});
					
					app.containers.spinner.setAttribute('hidden', true);
					app.containers.spinner.classList.add('hidden');
					evt.preventDefault();
				}

				if (sel_frequency) {
					if (!myForm.querySelector(".page-content #exploreFrequencyResults")) {
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", app.getSubtitle("Exploration Frequency Distribution"));
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", `<section class="mdl-grid mdl-cell--12-col">
												<div class="mdl-cell--12-col mdl-card mdl-shadow--2dp">
													<div>&nbsp;</div>
													<div class="mdl-list__item--three-line small-padding" id="exploreFrequencyResults"></div>
													<div>&nbsp;</div>
												</div>
											</section>`);
						
					} else {
						myForm.querySelector("#exploreFrequencyResults").innerHTML = "";
					}
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer " + localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "GET", headers: myHeaders };
					var url = `${app.baseUrl}/${app.api_version}/exploration/${my_flow_id}/exploration?graphType=kernelDensityEstimation&select=mean&group=30d&width=${app.getWidth(64)}&height=250&xAxis=Distribution${start}${end}`;
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						)
						.then(response => response.text())
						.then(function(svg) {
							document.getElementById("exploreFrequencyResults").innerHTML = svg;
							toast("Data exploration updated", { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							toast("Exploring error.", { timeout: app.toastDuration, type: "error" });
						});
					
					app.containers.spinner.setAttribute('hidden', true);
					app.containers.spinner.classList.add('hidden');
					evt.preventDefault();
				}

				if (sel_loess) {
					if (!myForm.querySelector(".page-content #ExplorationLoess")) {
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", app.getSubtitle("Loess Regression"));
						myForm.querySelector('.page-content').insertAdjacentHTML("beforeend", `<section class="mdl-grid mdl-cell--12-col">
												<div class="mdl-cell--12-col mdl-card mdl-shadow--2dp">
													<div>&nbsp;</div>
													<div class="mdl-list__item--three-line small-padding" id="ExplorationLoess"></div>
													<div>&nbsp;</div>
												</div>
											</section>`);
						
					} else {
						myForm.querySelector("#ExplorationLoess").innerHTML = "";
					}
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer " + localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "GET", headers: myHeaders };
					var url = `${app.baseUrl}/${app.api_version}/exploration/loess?flow_id=${my_flow_id}&limit=1000&width=${app.getWidth(64)}&height=200&xAxis=&degree=linear&span=0.15&band=0.7${start}${end}`;
					fetch(url, myInit)
						.then(
							app.fetchStatusHandler
						)
						.then(response => response.text())
						.then(function(svg) {
							document.getElementById("ExplorationLoess").innerHTML = svg;
							toast("Data exploration updated", { timeout: app.toastDuration, type: "done" });
						})
						.catch(function(error) {
							toast("Exploring error.", { timeout: app.toastDuration, type: "error" });
						});
					
					app.containers.spinner.setAttribute('hidden', true);
					app.containers.spinner.classList.add('hidden');
					evt.preventDefault();
				}

				if (sel_trend) {
					
				}
				
			} else {
				toast("Missing information in filters.", { timeout: app.toastDuration, type: "error" });
			}
		} else {
			toast("Missing Flow, please select at least one flow.", { timeout: app.toastDuration, type: "error" });
		}
	};

	app.getField = function(icon, label, value, options) {
		if (options.type === 'hidden') {
			options.isVisible = false;
		}
		var hidden = options.isVisible !== false ? "" : " hidden";
		var expand = options.isExpand === false ? "" : " mdl-card--expand";
		var enterkeyhint = typeof options.enterkeyhint !== "undefined" ? sprintf(" enterkeyhint=\"%s\"", options.enterkeyhint) : "";
		var inputmode = typeof options.inputmode !== "undefined" ? sprintf(" inputmode=\"%s\"", options.inputmode) : "";
		var field = "";
		field += "<div class='mdl-list__item--three-line small-padding " + hidden + expand + "'>";
		if (typeof options === 'object') {
			var id = options.id !== null ? options.id : app.getUniqueId();

			if (options.type === 'input' || options.type === 'text') {
				var style = options.style !== undefined ? "style='" + options.style + "'" : "";
				if (options.isEdit === true) {
					var pattern = options.pattern !== undefined ? "pattern='" + options.pattern + "'" : "";
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='" + id + "'>" + icon + "</i>";
					field += "	<input type='text' " + style + " " + inputmode + " " + enterkeyhint + " value='" + app.escapeHtml(value) + "' " + pattern + " class='mdl-textfield__input' name='" + label + "' id='" + id + "' />";
					if (label) field += "	<label class='mdl-textfield__label' for='" + id + "'>" + label + "</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>" + options.error + "</span>";
					let tooltipId = app.getUniqueId();
					if (options.tooltip) field += `<i class="material-icons dialog-buttons" id="tooltip-${tooltipId}">help</i> <div class="mdl-tooltip mdl-tooltip--left" for="tooltip-${tooltipId}">${options.tooltip}</div>`;
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>" + icon + "</i>";
					if (label) field += "	<label class='mdl-textfield__label'>" + label + "</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title' " + style + ">" + app.escapeHtml(value) + "</span>";
					let tooltipId = app.getUniqueId();
					if (options.tooltip) field += `<i class="material-icons dialog-buttons mdl-tooltip--left" id="tooltip-${tooltipId}">help</i> <div class="mdl-tooltip mdl-tooltip--left" for="tooltip-${tooltipId}">${options.tooltip}</div>`;
					field += "</div>";
				}
			} else if (options.type === 'container') {
				field += "<div class='mdl-list__item-sub-title'>";
				field += "	<i class='material-icons mdl-textfield__icon' for='" + id + "'>view_module</i>";
				if (label) field += "	<label class='mdl-textfield__label' for='" + id + "'>" + label + "</label>";
				field += "	<div class='' id='" + id + "'></div>";
				field += "</div>";
			} else if (options.type === 'hidden') {
				var pattern = options.pattern !== undefined ? "pattern='" + options.pattern + "'" : "";
				field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
				if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='" + id + "'>" + icon + "</i>";
				field += "	<input type='hidden' value='" + value + "' " + pattern + " class='mdl-textfield__input' name='" + label + "' id='" + id + "' />";
				if (label) field += "	<label class='mdl-textfield__label' for='" + id + "'>" + label + "</label>";
				if (options.error) field += "	<span class='mdl-textfield__error'>" + options.error + "</span>";
				field += "</div>";
			} else if (options.type === 'textarea') {
				if (options.isEdit === true) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='" + id + "'>" + icon + "</i>";
					field += "	<textarea style='width:100%; height:100%;' type='text' rows='3' class='mdl-textfield__input' name='" + label + "' id='" + id + "'>" + value + "</textarea>";
					if (label) field += "	<label class='mdl-textfield__label' for='" + id + "'>" + label + "</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>" + options.error + "</span>";
					field += "</div>";
				} else {
					if (value) field += "<span class='mdl-list__item-sub-title'>" + value + "</span>";
				}
			} else if (options.type === 'radio') {
				if (options.isEdit === true) {
					field += "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'> /!\ radio " + icon + "</i>";
					if (label) field += "	<label class='mdl-textfield__label'> /!\ radio " + label + "</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>" + options.error + "</span>";
					field += "</div>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>" + icon + "</i>";
					if (label) field += "	<label class='mdl-radio__label'>" + label + "</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>" + value + "</span>";
					field += "</div>";
				}
			} else if (options.type === 'checkbox') {
				var isChecked = value === true || value === "true" ? " checked" : "";
				var className = value === true || value === "true" ? "is-checked" : "";
				if (options.isEdit === true) {
					field += "<label class='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-textfield--floating-label " + className + "' for='checkbox-" + id + "' data-id='checkbox-" + id + "'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='" + id + "'>" + icon + "</i>";
					field += "	<input type='checkbox' id='checkbox-" + id + "' class='mdl-checkbox__input' name='" + label + "' value='" + value + "' placeholder='" + label + "' " + isChecked + ">";
					if (label) field += "	<div class='mdl-checkbox__label'>" + label + "</div>";
					field += "</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>" + options.error + "</span>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>" + icon + "</i>";
					if (label) field += "	<label class='mdl-switch__label'>" + label + "</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>" + value + "</span>";
					field += "</div>";
				}
			} else if (options.type === 'switch') {
				var isChecked = value === true || value === "true" ? " checked" : "";
				var className = value === true || value === "true" ? "is-checked" : "";
				if (options.isEdit === true || options.isEdit === "disabled") {
					let disabledOpt = options.isEdit === "disabled" ? "disabled='true'" : "";
					field += "<label class='mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-textfield--floating-label " + className + "' for='switch-" + id + "' data-id='switch-" + id + "'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='" + id + "'>" + icon + "</i>";
					field += "	<input type='checkbox' id='switch-" + id + "' " + disabledOpt + " class='mdl-switch__input' name='" + label + "' value='" + value + "' placeholder='" + label + "' " + isChecked + ">";
					if (label) field += "	<div class='mdl-switch__label'>" + label + "</div>";
					field += "</label>";
					if (options.error) field += "	<span class='mdl-textfield__error'>" + options.error + "</span>";
				} else {
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>" + icon + "</i>";
					if (label) field += "	<label class='mdl-switch__label'>" + label + "</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>" + value + "</span>";
					field += "</div>";
				}
			} else if (options.type === 'select') {
				if (options.isEdit == true) {
					var isMultiple = options.isMultiple == true ? 'multiple' : '';

					field += "<div class='mdl-selectfield mdl-js-selectfield mdl-textfield--floating-label'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='" + id + "'>" + icon + "</i>";
					if (label) field += "	<label class='mdl-selectfield__label' for='" + id + "'>" + label + "</label>";
					field += "	<select class='mdl-textfield__input mdl-selectfield__select' name='" + label + "' id='" + id + "' " + isMultiple + ">";
					if (options.options) {
						for (var n = 0; n < options.options.length; n++) {
							let selected = value == options.options[n].name ? 'selected' : '';
							let displayName = options.options[n].value;
							if (typeof options.options[n].type !== "undefined") {
								displayName += ` (${options.options[n].type}, ${options.options[n].classification})`;
							}
							field += "	<option " + selected + " value='" + options.options[n].name + "' data-stype='" + options.options[n].sType + "'>" + displayName + "</option>";
						}
					}
					field += "	</select>";
					if (options.error) field += "	<span class='mdl-textfield__error'>" + options.error + "</span>";
					field += "</div>";
				} else {
					var selectedValue = (options.options.filter(function(cur) { return cur.name === value }));
					selectedValue = selectedValue[0] !== undefined ? selectedValue[0].value : '';
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>" + icon + "</i>";
					if (label) field += "	<label class='mdl-selectfield__label'>" + label + "</label>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>" + value + "</span>";
					field += "</div>";
				}
			} else if (options.type === '2inputs') {
				var pattern = new Array();
				pattern[0] = options.pattern[0] !== undefined ? "pattern='" + options.pattern[0] + "'" : "";
				pattern[1] = options.pattern[1] !== undefined ? "pattern='" + options.pattern[1] + "'" : "";
				if (options.isEdit == true) {
					field += "<div class='half mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title' style='width: calc(50% - 20px) !important;'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon' for='" + id[0] + "'>" + icon + "</i>";

					field += "	<input type='text' value='" + value[0] + "'" + pattern[0] + " class='mdl-textfield__input' name='" + id[0] + "' id='" + id[0] + "' />";
					if (label[0]) field += "	<label class='mdl-textfield__label' for='" + id[0] + "'>" + label[0] + "</label>";
					if (options.error[0]) field += "	<span class='mdl-textfield__error'>" + options.error[0] + "</span>";
					field += "</div>";

					field += "<div class='half mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title' style='width: calc(50% - 20px) !important;'>";
					field += "	<input type='text' value='" + value[1] + "'" + pattern[1] + " class='mdl-textfield__input' name='" + id[1] + "' id='" + id[1] + "' />";
					if (label[1]) field += "	<label class='mdl-textfield__label' for='" + id[1] + "'>" + label[1] + "</label>";
					if (options.error[1]) field += "	<span class='mdl-textfield__error'>" + options.error[1] + "</span>";
					field += "</div>";

					field += "<div class='half mdl-textfield mdl-js-textfield mdl-textfield--floating-label mdl-list__item-sub-title' style='width: 40px !important;'>";
					field += "	<button class='mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' style='position: absolute; bottom: -10px;'><i class='material-icons'>add</i></button>";
					field += "</div>";

				} else {
					value = (options.options.filter(function(cur) { return cur.name === value }))[0].value;
					field += "<div class='mdl-list__item-sub-title'>";
					if (icon) field += "	<i class='material-icons mdl-textfield__icon'>" + icon + "</i>";
					if (value) field += "	<span class='mdl-list__item-sub-title'>" + value + "</span>";
					field += "</div>";
				}
			} else if (options.type === 'progress-status') {
				field += "<span class='mdl-progress mdl-js-progress' id='progress-status' title=''><br />" + value + "</span>";
			}
		} else {
			console.log("Error on options: ", options);
		}

		if (options.action !== undefined) {
			field += "	<span class='mdl-list__item-secondary-action'>";
			field += "		<a href='#' " + options.action + ">";
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
		myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var myContainer = container != null ? container : (app.containers.dashboard).querySelector('.page-content');
		var url = `${app.baseUrl}/${app.api_version}/snippets/${snippet_id}`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				if (response.data[0]) {
					var my_snippet = response.data[0];
					var s = app.snippetTypes.find(function(snippet) {
						return (snippet.name).toLowerCase() === (my_snippet.attributes.type).toLowerCase();
					});
					var snippet = s.getHtml({ name: my_snippet.attributes.name, id: my_snippet.id, icon: my_snippet.attributes.icon, color: my_snippet.attributes.color });

					var c = document.createElement("div");
					c.setAttribute('class', 'mdl-grid mdl-cell');
					c.innerHTML = snippet;
					myContainer.appendChild(c);
					componentHandler.upgradeDom();

					my_snippet.flowNames = [];
					my_snippet.attributes.flows.map(function(f) {
						if (localStorage.getItem('flows') != 'null' && JSON.parse(localStorage.getItem('flows'))) {
							var theFlow = (JSON.parse(localStorage.getItem('flows'))).find(function(storedF) { return storedF.id == f; });
							if (theFlow) {
								my_snippet.flowNames.push(theFlow.name);
							}
						}
					});
					if (typeof my_snippet.attributes.options !== "undefined") {
						s.setOptions(my_snippet.attributes.options);
					}
					s.activateOnce(my_snippet);

					// Set the buttons on edit Snippets
					var editSnippetButtons = document.querySelectorAll(".edit-snippet");
					for (var b in editSnippetButtons) {
						if ((editSnippetButtons[b]).childElementCount > -1) {
							(editSnippetButtons[b]).addEventListener("click", function(evt) {
								app.resources.snippets.display(evt.target.parentNode.getAttribute("data-snippet-id"), false, true, false);
								evt.preventDefault();
							});
						}
					}
				}
				app.containers.spinner.setAttribute('hidden', true);
				app.containers.spinner.classList.add('hidden');
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast("getSnippet error out..." + error, { timeout: app.toastDuration, type: "error" });
				}
			});
	};

	app.refreshFromNow = function(id, time, fromNow) {
		if (document.getElementById(id)) {
			document.getElementById(id).innerHTML = moment(time).format(app.date_format);
			if (fromNow !== null) {
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
		field += "			<img src='' id='qr-" + id + "' class='img-responsive' style='margin:0 auto;' />";
		field += "		</span>";
		field += "</div>";
		return field;
	};

	app.getQrcode = function(icon, label, id) {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer " + localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = `${app.baseUrl}/${app.api_version}/objects/${id}/qrcode/8/M`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				if (response) {
					var container = document.getElementById('qr-' + id);
					container.setAttribute('src', (new DOMParser()).parseFromString(response.data, "text/html").images[0].src);
				}
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('fetch Qrcode error out...' + error, { timeout: app.toastDuration, type: "error" });
				}
			});
		app.containers.spinner.setAttribute('hidden', true);
	};

	app.getMap = function(icon, id, longitude, latitude, isEditable, isActionable) {
		var field = "<div class='mdl-list__item'>";
		field += "	<span class='mdl-list__item-primary-content map' id='" + id + "' style='width:100%; height:400px;'></span>";
		field += "</div>";
		return field;
	};

	app.authenticate = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		app.auth.pushSubscription = {
			endpoint: app.getSetting('settings.pushSubscription.endpoint'),
			keys: {
				auth: app.getSetting('settings.pushSubscription.keys.auth'),
				p256dh: app.getSetting('settings.pushSubscription.keys.p256dh')
			}
		};
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(app.auth) };
		var url = `${app.baseUrl}/${app.api_version}/authenticate`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				if (response.token && response.refresh_token && response.refreshTokenExp) {
					localStorage.setItem('bearer', response.token);
					localStorage.setItem('refresh_token', response.refresh_token);
					localStorage.setItem('refreshTokenExp', response.refreshTokenExp);
					app.isLogged = true;
					app.resetSections();
					app.fetchProfile();
					app.fetchUnsubscriptions();
					if (window.location.hash && window.location.hash.substr(1) === 'object_add') {
						app.displayAddObject(app.defaultResources.object);
					} else if (window.location.hash && window.location.hash.substr(1) === 'flow_add') {
						app.displayAddFlow(app.defaultResources.flow);
					} else if (window.location.hash && window.location.hash.substr(1) === 'dashboard_add') {
						app.displayAddDashboard(app.defaultResources.dashboard);
					} else if (window.location.hash && window.location.hash.substr(1) === 'snippet_add') {
						app.displayAddSnippet(app.defaultResources.snippet);
					} else if (window.location.hash && window.location.hash.substr(1) === 'rule_add') {
						app.displayAddRule(app.defaultResources.rule);
					} else if (window.location.hash && window.location.hash.substr(1) === 'mqtt_add') {
						app.displayAddMqtt(app.defaultResources.mqtt);
					} else if (window.location.hash && window.location.hash.substr(1) === 'source_add') {
						app.displayAddSource(app.defaultResources.source);
					} else if (window.location.hash && window.location.hash.substr(1) !== 'login') {
						app.setSection(window.location.hash.substr(1));
					} else {
						app.setSection('index');
					}
					app.setHiddenElement("signin_button");
					app.setVisibleElement("logout_button");

					toast('Hey. Welcome Back! :-)', { timeout: app.toastDuration, type: "done" });
					if (typeof firebase !== "undefined") {
						firebase.analytics().setUserProperties({ 'isLoggedIn': 1 });
						firebase.analytics().logEvent('login');
					}
					setInterval(app.refreshAuthenticate, app.refreshExpiresInSeconds);
					app.getUnits();
					app.getDatatypes();
					app.getFlows();
					app.getSnippets();
					app.getSources();
				} else {
					if (localStorage.getItem("settings.debug") == "true") {
						toast('Auth internal error', { timeout: app.toastDuration, type: "error" });
					}
					app.resetDrawer();
				}
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('We can\'t process your identification. Please resubmit your credentials!', { timeout: app.toastDuration, type: "warning" });
					document.querySelectorAll(".mdl-spinner").forEach(function(e) { e.parentNode.removeChild(e); });
				}
			});
		app.auth = {};
	};

	app.refreshAuthenticate = function() {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		app.auth.pushSubscription = {
			endpoint: app.getSetting('settings.pushSubscription.endpoint'),
			keys: {
				auth: app.getSetting('settings.pushSubscription.keys.auth'),
				p256dh: app.getSetting('settings.pushSubscription.keys.p256dh')
			}
		};
		if (localStorage.getItem('refresh_token') !== "null") {
			var refreshPOST = { "grant_type": "refresh_token", "refresh_token": localStorage.getItem('refresh_token'), pushSubscription: app.auth.pushSubscription };
			var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(refreshPOST) };
			var url = `${app.baseUrl}/${app.api_version}/authenticate`;
	
			fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse) {
					return fetchResponse.json();
				})
				.then(function(response) {
					if (response.token && response.refresh_token && response.refreshTokenExp) {
						localStorage.setItem('bearer', response.token);
						localStorage.setItem('refresh_token', response.refresh_token);
						localStorage.setItem('refreshTokenExp', response.refreshTokenExp);
	
						app.isLogged = true;
						if (typeof firebase !== "undefined") {
							firebase.initializeApp(firebaseConfig);
							firebase.analytics().setUserProperties({ 'isLoggedIn': 1 });
							firebase.analytics().logEvent('refreshAuthenticate');
						}
						app.fetchProfile();
	
						app.setHiddenElement("signin_button");
						app.setVisibleElement("logout_button");
					} else {
						if (localStorage.getItem("settings.debug") == "true") {
							toast('Auth internal error', { timeout: app.toastDuration, type: "error" });
						}
						app.resetDrawer();
					}
				})
				.catch(function(error) {
					if (localStorage.getItem("settings.debug") == "true") {
						toast('We can\'t process your identification. Please resubmit your credentials on login page!', { timeout: app.toastDuration, type: "warning" });
					}
				});
			app.auth = {};
		} else {
			if (localStorage.getItem("settings.debug") == "true") {
				toast('Please resubmit your credentials on login page!', { timeout: app.toastDuration, type: "error" });
			}
		}
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
			app.setSection((evt.target.getAttribute('hash') !== null ? evt.target.getAttribute('hash') : evt.target.getAttribute('href')).substr(1));
			app.hideMenu();
		}, false);

		if (position && position > -1) {

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
		settings += app.getField('radio_button_checked', 'Floating Action Buttons', app.getSetting('settings.fab_position') !== null ? app.getSetting('settings.fab_position') : 'fab__bottom', { type: 'select', id: 'settings.fab_position', options: [{ name: 'fab__top', value: 'Top position' }, { name: 'fab__bottom', value: 'Bottom position' }], isEdit: true });
		settings += app.getField('format_textdirection_l_to_r', 'Action buttons', app.getSetting('settings.isLtr') !== null ? app.getSetting('settings.isLtr') : true, { type: 'select', id: 'settings.isLtr', options: [{ name: 'true', value: 'Aligned to the right' }, { name: 'false', value: 'Aligned to the left' }], isEdit: true });
		settings += app.getField('date_range', 'Date Format', app.getSetting('settings.date_format') !== null ? app.getSetting('settings.date_format') : app.date_format, { type: 'input', id: 'settings.date_format', isEdit: true });
		settings += app.getField('subject', 'Card Chars Limit', app.getSetting('settings.cardMaxChars') !== null ? app.getSetting('settings.cardMaxChars') : app.cardMaxChars, { type: 'input', id: 'settings.cardMaxChars', isEdit: true, pattern: app.patterns.cardMaxChars, error: 'Must be an Integer.' });
		settings += app.getField('room', app.getSetting('settings.geolocalization') != 'false' ? "Geolocalization is enabled" : "Geolocalization is disabled", app.getSetting('settings.geolocalization') !== null ? app.getSetting('settings.geolocalization') : true, { type: 'switch', id: 'settings.geolocalization', isEdit: true });
		settings += app.getField('bug_report', app.getSetting('settings.debug') != 'false' ? "Debug is enabled" : "Debug is disabled", app.getSetting('settings.debug') !== null ? app.getSetting('settings.debug') : app.debug, { type: 'switch', id: 'settings.debug', options: [{ name: 'true', value: 'True' }, { name: 'false', value: 'False' }], isEdit: true });
		settings += app.getField('voice_over_off', 'Do Not Track (DNT) header', navigator.doNotTrack == '1' ? "Enabled, you are not being tracked. This setting is customized on your browser." : "Disabled, you are tracked :-) and it can be customized on your browser settings.", { type: 'switch', isEdit: false });
		settings += "	</div>";
		settings += "</section>";

		settings += app.getSubtitle('API Notifications');
		settings += "<section class=\"mdl-grid mdl-cell--12-col\">";
		settings += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		settings += "	<div class=\"card-header heading-left\">&nbsp;</div>";
		settings += app.getField('notifications', app.getSetting('settings.notifications') != 'false' ? "Notifications are enabled" : "Notifications are disabled", app.getSetting('settings.notifications') !== undefined ? app.getSetting('settings.notifications') : true, { type: 'switch', id: 'settings.notifications', isEdit: true });
		if (app.getSetting('settings.pushSubscription.keys.p256dh') && app.getSetting('settings.notifications') != "false" && app.getSetting('settings.debug') != "false") {
			settings += app.getField('cloud', 'Endpoint', app.getSetting('settings.pushSubscription.endpoint'), { type: 'input', id: 'settings.pushSubscription.endpoint', isEdit: true, style: "text-transform: none !important;" });
			settings += app.getField('vpn_key', 'Key', app.getSetting('settings.pushSubscription.keys.p256dh'), { type: 'input', id: 'settings.pushSubscription.keys.p256dh', isEdit: true, style: "text-transform: none !important;" });
			settings += app.getField('vpn_lock', 'Auth', app.getSetting('settings.pushSubscription.keys.auth'), { type: 'input', id: 'settings.pushSubscription.keys.auth', isEdit: true, style: "text-transform: none !important;" });
		}
		settings += "	</div>";
		settings += "</section>";

		(app.containers.settings).querySelector('.page-content').innerHTML = settings;
		componentHandler.upgradeDom();

		if (document.getElementById('settings.fab_position')) {
			document.getElementById('settings.fab_position').addEventListener('change', function(e) {
				app.setSetting('settings.fab_position', e.target.value);
				var fabs = document.querySelectorAll('.mdl-button--fab_flinger-container');
				if (e.target.value == 'fab__top') {
					for (var f in fabs) {
						if ((fabs[f]).childElementCount > -1) {
							(fabs[f]).classList.add('fab__top');
							(fabs[f]).classList.remove('fab__bottom');
						}
					}
					toast('Floating Button are aligned Top.', { timeout: app.toastDuration, type: "done" });
				} else {
					for (var f in fabs) {
						if ((fabs[f]).childElementCount > -1) {
							(fabs[f]).classList.remove('fab__top');
							(fabs[f]).classList.add('fab__bottom');
						}
					}
					toast('Floating Button are aligned Bottom.', { timeout: app.toastDuration, type: "done" });
				}
			});
		}
		if (document.getElementById('settings.isLtr')) {
			document.getElementById('settings.isLtr').addEventListener('change', function(e) {
				app.setSetting('settings.isLtr', e.target.value);
				var fabs = document.querySelectorAll('.mdl-button--fab_flinger-container');
				if (e.target.value == 'true') {
					app.setSetting('settings.isLtr', true);
					toast('Action buttons are aligned to the right.', { timeout: app.toastDuration, type: "done" });
				} else {
					app.setSetting('settings.isLtr', false);
					toast('Action buttons are aligned to the left.', { timeout: app.toastDuration, type: "done" });
				}
			});
		}
		if (document.getElementById('switch-settings.notifications')) {
			document.getElementById('switch-settings.notifications').addEventListener('change', function(e) {
				var label = e.target.parentElement.querySelector('div.mdl-switch__label');
				if (document.getElementById('switch-settings.notifications').checked === true) {
					app.setSetting('settings.notifications', true);
					app.askPermission();
					app.subscribeUserToPush();
					label.innerText = "Notifications are enabled";
					if (localStorage.getItem("settings.debug") == "true") {
						toast('Awsome, Notifications are enabled.', { timeout: app.toastDuration, type: "done" });
					}
				} else {
					label.innerText = "Notifications are disabled";
					app.setSetting('settings.notifications', false);
					toast('Notifications are disabled.', { timeout: app.toastDuration, type: "done" });
				}
			});
		}
		if (document.getElementById('switch-settings.geolocalization')) {
			document.getElementById('switch-settings.geolocalization').addEventListener('change', function(e) {
				var label = e.target.parentElement.querySelector('div.mdl-switch__label');
				if (document.getElementById('switch-settings.geolocalization').checked === true) {
					app.setSetting('settings.geolocalization', true);
					label.innerText = "Geolocalization is enabled";
					app.getLocation();
					if (localStorage.getItem("settings.debug") == "true") {
						toast('Awsome, Geolocalization is enabled.', { timeout: app.toastDuration, type: "done" });
					}
				} else {
					app.setSetting('settings.geolocalization', false);
					label.innerText = "Geolocalization is disabled";
					toast('Geolocalization is disabled.', { timeout: app.toastDuration, type: "done" });
				}
			});
		}
		if (document.getElementById('switch-settings.debug')) {
			document.getElementById('switch-settings.debug').addEventListener('change', function(e) {
				var label = e.target.parentElement.querySelector('div.mdl-switch__label');
				if (document.getElementById('switch-settings.debug').checked === true) {
					app.setSetting('settings.debug', true);
					label.innerText = "Debug is enabled";
					document.dispatchEvent(new Event("clearCache"));
					app.debug = true;
					if (localStorage.getItem("settings.debug") == "true") {
						toast('Awsome, Debug mode is activated and cache is now cleared.', { timeout: app.toastDuration, type: "done" });
					}
				} else {
					app.setSetting('settings.debug', false);
					label.innerText = "Debug is disabled";
					app.debug = false;
					toast('Debug mode is disabled.', { timeout: app.toastDuration, type: "done" });
				}
			});
		}
		if (document.getElementById('settings.date_format')) {
			document.getElementById('settings.date_format').addEventListener('keyup', function(e) {
				app.setSetting('settings.date_format', document.getElementById('settings.date_format').value);
				app.date_format = document.getElementById('settings.date_format').value;
				toast('Date Format has been updated on ' + moment().format(app.date_format), { timeout: app.toastDuration, type: "done" });
			});
		}
		if (document.getElementById('settings.cardMaxChars')) {
			document.getElementById('settings.cardMaxChars').addEventListener('keyup', function(e) {
				if ((document.getElementById('settings.cardMaxChars').value).match(app.patterns.cardMaxChars)) {
					app.setSetting('settings.cardMaxChars', document.getElementById('settings.cardMaxChars').value);
					app.cardMaxChars = document.getElementById('settings.cardMaxChars').value;
					toast('Card Limit is set to ' + app.cardMaxChars + '.', { timeout: app.toastDuration, type: "done" });
				} else {
					toast('Card Limit remain ' + app.cardMaxChars + '.', { timeout: app.toastDuration, type: "done" });
				}
			});
		}
	};

	app.getStatus = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = `${app.baseUrl}/${app.api_version}/status`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				if (!navigator.onLine) {
					(app.containers.status).querySelector('.page-content').innerHTML = app.getCard(app.offlineCard);
				} else {
					var status = "";
					status += "<section class=\"mdl-grid mdl-cell--12-col\">";
					status += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					status += "		<div class=\"mdl-list__item\">";
					status += "			<span class='mdl-list__item-primary-content'>";
					status += "				<i class=\"material-icons\">" + app.icons.status + "</i>";
					status += "				<h3 class=\"mdl-card__title-text\">" + app.sectionsPageTitles.status + "</h3>";
					status += "			</span>";
					status += "			<span class='mdl-list__item-secondary-action'>";
					status += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='status-details'>";
					status += "					<i class='material-icons'>expand_more</i>";
					status += "				</button>";
					status += "			</span>";
					status += "		</div>";
					status += "		<div class=\"card-body\">";
					status += "			<div class='mdl-list__item--three-line small-padding  mdl-card--expand' id='status-details'>";
					status += app.getField('thumb_up', 'Application Name', response.appName, { type: 'text', style: 'text-transform: none !important;', isEdit: false });
					status += app.getField('favorite', 'Status', response.status, { type: 'text', isEdit: false });
					status += app.getField('volume_down', 'Mqtt Topic Info', response.mqttInfo, { type: 'text', style: 'text-transform: none !important;', isEdit: false });
					status += app.getField('verified_user', 'Api Version', response.version, { type: 'text', style: 'text-transform: none !important;', isEdit: false });
					status += app.getField('verified_user', 'Build Version', response.t6BuildVersion, { type: 'text', style: 'text-transform: none !important;', isEdit: false });
					status += app.getField('alarm', 'Build Date', moment(response.t6BuildDate, "DD/MM/YYYY HH:mm:ss").format(app.date_format), { type: 'text', style: 'text-transform: none !important;', isEdit: false });
					status += app.getField('alarm', 'Server Last Update', `${moment(response.started_at, "DD/MM/YYYY HH:mm:ss").format(app.date_format)} ; Loaded in ${response.startProcessTime}ms (incl. ${response.moduleLoadTime}ms to load modules)`, { type: 'text', isEdit: false });
					status += app.getField('trip_origin', 'appId', firebaseConfig.appId, { type: 'text', isEdit: false });
					status += "			</div>";
					status += "		</div>";
					status += "	</div>";
					status += "</section>";

					if (app.RateLimit.Limit && app.RateLimit.Remaining) {
						status += "<section class=\"mdl-grid mdl-cell--12-col\">";
						status += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
						status += "		<div class=\"mdl-list__item\">";
						status += "			<span class='mdl-list__item-primary-content'>";
						status += "				<i class=\"material-icons\">crop_free</i>";
						status += "				<h3 class=\"mdl-card__title-text\">API Usage</h3>";
						status += "			</span>";
						status += "			<span class='mdl-list__item-secondary-action'>";
						status += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='status-usage'>";
						status += "					<i class='material-icons'>expand_more</i>";
						status += "				</button>";
						status += "			</span>";
						status += "		</div>";
						status += "		<div class='mdl-cell--12-col' id='status-usage'>";
						if (app.RateLimit.Used && app.RateLimit.Limit) {
							status += app.getField('center_focus_weak', 'Used', app.RateLimit.Used + '/' + app.RateLimit.Limit, { type: 'progress-status', isEdit: false });
						}
						status += "		</div>";
						status += "	</div>";
						status += "</section>";
					}

					(app.containers.status).querySelector('.page-content').innerHTML = status;
					if (app.RateLimit.Used && app.RateLimit.Limit) {
						var rate = Math.ceil((app.RateLimit.Used * 100 / app.RateLimit.Limit) / 10) * 10;
						document.querySelector('#progress-status').addEventListener('mdl-componentupgraded', function() {
							this.MaterialProgress.setProgress(rate);
						});
					}
					app.setExpandAction();
				}
				app.containers.spinner.setAttribute('hidden', true);
				app.containers.spinner.classList.add('hidden');
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('Can\'t display Status...' + error, { timeout: app.toastDuration, type: "error" });
				}
			});
	};

	app.getTerms = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = `${app.baseUrl}/${app.api_version}/terms`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				var terms = "";
				for (var i = 0; i < (response).length; i++) {
					terms += "<section class=\"mdl-grid mdl-cell--12-col\">";
					terms += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					if (response[i].title) {
						terms += "	<div class=\"mdl-card__title\">";
						terms += "		<i class=\"material-icons\">business_center</i></span>";
						terms += "		<h3 class=\"mdl-card__title-text\">" + response[i].title + "</h3>";
						terms += "	</div>";
					}
					terms += "		<div class=\"mdl-card__supporting-text no-padding\">";
					terms += response[i].description;
					terms += "		</div>";
					terms += "	</div>";
					terms += "</section>";
				}
				(app.containers.terms).querySelector('.page-content').innerHTML = terms;
				app.containers.spinner.setAttribute('hidden', true);
				app.containers.spinner.classList.add('hidden');
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('Can\'t display Terms...' + error, { timeout: app.toastDuration, type: "error" });
				}
			});
	};

	app.getCompatibleDevices = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var url = `${app.baseUrl}/${app.api_version}/compatible-devices`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				var compatibledevices = "";
				for (var i = 0; i < (response).length; i++) {
					compatibledevices += "<section class=\"mdl-grid mdl-cell--12-col\">";
					compatibledevices += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					if (response[i].title) {
						compatibledevices += "	<div class=\"mdl-card__title\">";
						compatibledevices += "		<i class=\"material-icons\">devices_other</i>";
						compatibledevices += "		<h3 class=\"mdl-card__title-text\">" + response[i].title + "</h3>";
						compatibledevices += "	</div>";
					}
					compatibledevices += "		<div class=\"mdl-card__supporting-text no-padding\">";
					compatibledevices += "			<img src=\"/img/m/placeholder.png\" class=\"lazyloading img-responsive\" data-src=\"" + app.baseUrlCdn + response[i].image + "\" align=\"left\" style=\"margin-right: 5px;\" width=\"100\" alt=\"" + app.baseUrlCdn + response[i].title + "\" />"
					compatibledevices += response[i].description;
					compatibledevices += "		</div>";
					compatibledevices += "	</div>";
					compatibledevices += "</section>";
				}
				(app.containers.compatibleDevices).querySelector('.page-content').innerHTML = compatibledevices;
				app.imageLazyLoading();
				app.containers.spinner.setAttribute('hidden', true);
				app.containers.spinner.classList.add('hidden');
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('Can\'t display compatible devices...' + error, { timeout: app.toastDuration, type: "error" });
				}
			});
	};

	app.getOpenSourceLicenses = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = `${app.baseUrl}/${app.api_version}/open-source-licenses`;

		fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse) {
				return fetchResponse.json();
			})
			.then(function(response) {
				var openSourceLicenses = "";
				for (var i = 0; i < (response).length; i++) {
					openSourceLicenses += "<section class=\"mdl-grid mdl-cell--12-col\">";
					openSourceLicenses += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					if (response[i].title) {
						openSourceLicenses += "	<div class=\"mdl-card__title\">";
						openSourceLicenses += "		<i class=\"material-icons\">book</i>";
						openSourceLicenses += "		<h3 class=\"mdl-card__title-text\">" + response[i].title + "</h3>";
						openSourceLicenses += "		<p>" + response[i].license + "</p>";
						openSourceLicenses += "	</div>";
					}
					openSourceLicenses += "		<div class=\"mdl-card__supporting-text no-padding\">";
					openSourceLicenses += response[i].description;
					openSourceLicenses += "		</div>";
					if (response[i].dependencies) {
						openSourceLicenses += "		<pre>";
						openSourceLicenses += response[i].dependencies;
						openSourceLicenses += "		</pre>";
					}
					openSourceLicenses += "		<div class=\"mdl-card__actions mdl-card--border\">";
					openSourceLicenses += "			<button class=\"mdl-button mdl-js-button mdl-js-ripple-effect\" onclick=\"document.location.href=\'" + response[i].linkFullReport + "\';\"> Get dependencies full report</button>";
					openSourceLicenses += "		</div>";
					openSourceLicenses += "	</div>";
					openSourceLicenses += "</section>";
				}
				(app.containers.openSourceLicenses).querySelector('.page-content').innerHTML = openSourceLicenses;
				app.imageLazyLoading();
				app.containers.spinner.setAttribute('hidden', true);
				app.containers.spinner.classList.add('hidden');
			})
			.catch(function(error) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast('Can\'t display Open-Source Licenses...' + error, { timeout: app.toastDuration, type: "error" });
				}
			});
	};

	app.getExploration = function() {
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		if (app.isLogged) {
			let explorationNode = "";
			explorationNode += app.getSubtitle('Filters');
			explorationNode += "<section class='mdl-grid mdl-cell--12-col'>";
			explorationNode += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
			explorationNode += "		<div>&nbsp;</div>";
			explorationNode += app.getField(app.icons.date, "From date", moment().subtract(7, "days").format("YYYY-MM-DD HH:mm:ss"), { type: "text", id: "start", pattern: app.patterns.date, isEdit: true });
			explorationNode += app.getField(app.icons.date, "To date", moment().format("YYYY-MM-DD HH:mm:ss"), { type: "text", id: "end", pattern: app.patterns.date, isEdit: true });
			explorationNode += "		<div>&nbsp;</div>";
			if (localStorage.getItem("flows") != "null") {
				var flows = JSON.parse(localStorage.getItem("flows")).map(function(flow) {
					return { value: flow.name, name: flow.id };
				});
				explorationNode += app.getField(app.icons.flows, "Flows to explore", "", { type: "select", id: "flowsChipsSelect", isEdit: true, options: flows });
			} else {
				app.getFlows();
				explorationNode += app.getField(app.icons.flows, "Flows to explore", "", { type: "select", id: "flowsChipsSelect", isEdit: true, options: {} });
			}
			explorationNode += "		<div class='mdl-list__item--three-line small-padding  mdl-card--expand mdl-chips chips-initial input-field' id='flowsChips'>";
			explorationNode += "			<span class='mdl-chips__arrow-down__container mdl-selectfield__arrow-down__container'><span class='mdl-chips__arrow-down'></span></span>";
			explorationNode += "		</div>";
			explorationNode += "		<div>&nbsp;</div>";
			explorationNode += "	</div>";
			explorationNode += "</section>";			
			
			explorationNode += app.getSubtitle('Non graphical output');
			explorationNode += "<section class='mdl-grid mdl-cell--12-col'>";
			explorationNode += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
			explorationNode += "		<div>&nbsp;</div>";
			explorationNode += app.getField("local_play", "Summary Statistics", true, { type: "switch", id: "ExplorationSummary", isEdit: true, options: {} });
			explorationNode += app.getField("first_page", "Head", false, { type: "switch", id: "ExplorationHead", isEdit: true, options: {} });
			explorationNode += app.getField("last_page", "Tail", false, { type: "switch", id: "ExplorationTail", isEdit: true, options: {} });
			explorationNode += app.getField("dehaze", "List Distinct Facts", false, { type: "switch", id: "ExplorationListFacts", isEdit: "disabled", options: {} });
			explorationNode += app.getField("dehaze", "List Distinct Categories", false, { type: "switch", id: "ExplorationListCategories", isEdit: "disabled", options: {} });
			explorationNode += "	</div>";
			explorationNode += "</section>";
			
			explorationNode += app.getSubtitle('Graphical output');
			explorationNode += "<section class='mdl-grid mdl-cell--12-col'>";
			explorationNode += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
			explorationNode += "		<div>&nbsp;</div>";
			explorationNode += app.getField("bar_chart", "Frequency shape distribution", false, { type: "switch", id: "ExplorationFrequency", isEdit: true, options: {} });
			explorationNode += app.getField("double_arrow", "Boxplot", false, { type: "switch", id: "ExplorationBoxplot", isEdit: true, options: {} });
			explorationNode += app.getField("show_chart", "Plot Line", false, { type: "switch", id: "ExplorationLine", isEdit: true, options: {} });
			explorationNode += app.getField("trending_up", "Loess", false, { type: "switch", id: "ExplorationLoess", isEdit: true, options: {} });
			explorationNode += "	</div>";
			explorationNode += "</section>";
			
			
			explorationNode += app.getSubtitle('TimeSeries decomposition');
			explorationNode += "<section class='mdl-grid mdl-cell--12-col'>";
			explorationNode += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
			explorationNode += "		<div>&nbsp;</div>";
			explorationNode += app.getField("trending_up", "Trend", false, { type: "switch", id: "ExplorationTrend", isEdit: "disabled", options: {} });
			explorationNode += app.getField("timeline", "Seasonality", false, { type: "switch", id: "ExplorationSeasonality", isEdit: "disabled", options: {} });
			explorationNode += app.getField("swap_calls", "Noise/Remainder", false, { type: "switch", id: "ExplorationRemainder", isEdit: "disabled", options: {} });
			explorationNode += "	</div>";
			explorationNode += "</section>";

			(app.containers.exploration).querySelector('.page-content').innerHTML = explorationNode;
			app.showAddFAB("exploration");
			componentHandler.upgradeDom();
			document.getElementById("flowsChipsSelect").parentNode.querySelector("div.mdl-selectfield__list-option-box ul").addEventListener("click", function(evt) {
				var id = evt.target.getAttribute("data-value");
				var name = evt.target.innerText;
				app.removeChipFrom("flowsChips");
				app.addChipTo("flowsChips", { name: name, id: id, type: "flows" });
				evt.preventDefault();
			}, false);
		}
		app.containers.spinner.setAttribute('hidden', true);
	};

	app.toggleElement = function(id) {
		document.querySelector('#' + id).classList.toggle('hidden');
	};

	app.setHiddenElement = function(id) {
		document.querySelector('#' + id).classList.add('hidden');
	};

	app.setVisibleElement = function(id) {
		document.querySelector('#' + id).classList.remove('hidden');
	};

	app.showNotification = function() {
		toast('You are offline.', { timeout: app.toastDuration, type: "warning" });
	};

	app.sessionExpired = function() {
		localStorage.setItem('bearer', null);
		localStorage.setItem('refresh_token', null);
		localStorage.setItem('refreshTokenExp', null);
		localStorage.setItem('flows', null);
		localStorage.setItem('snippets', null);
		localStorage.setItem('sources', null);
		localStorage.setItem('currentUserId', null);
		localStorage.setItem('currentUserName', null);
		localStorage.setItem('currentUserEmail', null);
		localStorage.setItem('currentUserHeader', null);
		localStorage.setItem('notifications.unsubscribed', null);
		localStorage.setItem('notifications.unsubscription_token', null);
		localStorage.setItem('notifications.email', null);
		localStorage.setItem('role', null);

		app.auth = {};
		app.RateLimit = { Limit: null, Remaining: null, Used: null };
		app.itemsSize = { objects: 15, flows: 15, snippets: 15, dashboards: 15, mqtts: 15, rules: 15, sources: 15 };
		app.itemsPage = { objects: 1, flows: 1, snippets: 1, dashboards: 1, mqtts: 1, rules: 1, sources: 1 };
		if (!app.isLogged) toast('Your session has expired. You must sign-in again.', { timeout: app.toastDuration, type: "error" });
		app.isLogged = false;
		app.resetDrawer();

		app.setVisibleElement("signin_button");
		app.setHiddenElement("logout_button");
		app.setDrawer();

		app.refreshButtonsSelectors();
		componentHandler.upgradeDom();

		if (app.containers.profile) {
			(app.containers.profile).querySelector('.page-content').innerHTML = "";
		}
		if (app.containers.objects) {
			(app.containers.objects).querySelector('.page-content').innerHTML = app.getCard({ title: 'Connected Objects', titlecolor: '#ffffff', description: 'Connecting anything physical or virtual to t6 Api without any hassle. Embedded, Automatization, Domotic, Sensors, any Objects or Devices can be connected and communicate to t6 via RESTful API. Unic and dedicated application to rules them all and designed to simplify your journey.' });
			app.displayLoginForm((app.containers.objects).querySelector('.page-content'));
		}
		if (app.containers.flows) {
			(app.containers.flows).querySelector('.page-content').innerHTML = app.getCard({ title: 'Time-series Datapoints', titlecolor: '#ffffff', description: 'Communication becomes easy in the platform with Timestamped values. Flows allows to retrieve and classify data.', action: { id: 'login', label: 'Sign-In' }, secondaryaction: { id: 'signup', label: 'Create an account' } });
			app.displayLoginForm((app.containers.flows).querySelector('.page-content'));
		}
		if (app.containers.dashboards) {
			(app.containers.dashboards).querySelector('.page-content').innerHTML = app.getCard({ title: 'Dashboards', titlecolor: '#ffffff', description: 't6 support multiple Snippets to create your own IoT Dashboards for data visualization. Snippets are ready to Use Html components integrated into the application. Dashboards allows to empower your data-management by Monitoring and Reporting activities.', action: { id: 'login', label: 'Sign-In' }, secondaryaction: { id: 'signup', label: 'Create an account' } });
			app.displayLoginForm((app.containers.dashboards).querySelector('.page-content'));
		}
		if (app.containers.snippets) {
			(app.containers.snippets).querySelector('.page-content').innerHTML = app.getCard({ title: 'Snippets', titlecolor: '#ffffff', description: 'Snippets are components to embed into your dashboards and displays your data', action: { id: 'login', label: 'Sign-In' }, secondaryaction: { id: 'signup', label: 'Create an account' } });
			app.displayLoginForm((app.containers.snippets).querySelector('.page-content'));
		}
		if (app.containers.rules) {
			(app.containers.rules).querySelector('.page-content').innerHTML = app.getCard({ title: 'Decision Rules to get smart', titlecolor: '#ffffff', description: 'Trigger action from Mqtt and decision-tree. Let\'s your Objects talk to the platform as events.', action: { id: 'login', label: 'Sign-In' }, secondaryaction: { id: 'signup', label: 'Create an account' } });
			app.displayLoginForm((app.containers.rules).querySelector('.page-content'));
		}
		if (app.containers.mqtts) {
			(app.containers.mqtts).querySelector('.page-content').innerHTML = app.getCard({ title: 'Sense events', titlecolor: '#ffffff', description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.', action: { id: 'login', label: 'Sign-In' }, secondaryaction: { id: 'signup', label: 'Create an account' } });
			app.displayLoginForm((app.containers.mqtts).querySelector('.page-content'));
		}
		if (app.containers.sources) {
			(app.containers.sources).querySelector('.page-content').innerHTML = app.getCard({ title: 'Code Source', titlecolor: '#ffffff', description: 'Deploy Arduino source Over The Air.', action: { id: 'login', label: 'Sign-In' }, secondaryaction: { id: 'signup', label: 'Create an account' } });
			app.displayLoginForm((app.containers.sources).querySelector('.page-content'));
		}

		var updated = document.querySelectorAll('.page-content form div.mdl-js-textfield');
		for (var i = 0; i < updated.length; i++) {
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
		if (localStorage.getItem("settings.debug") == "true") { console.log('DEBUG', 'resetSections()'); }
		if (app.containers.objects) { (app.containers.objects).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.object) { (app.containers.object).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.flows) { (app.containers.flows).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.flow) { (app.containers.flow).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.dashboards) { (app.containers.dashboards).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.dashboard) { (app.containers.dashboard).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.snippets) { (app.containers.snippets).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.snippet) { (app.containers.snippet).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.profile) { (app.containers.profile).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.rules) { (app.containers.rules).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.rule) { (app.containers.rule).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.mqtts) { (app.containers.mqtts).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.mqtt) { (app.containers.mqtt).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.sources) { (app.containers.sources).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.source) { (app.containers.source).querySelector('.page-content').innerHTML = ''; }
		if (app.containers.objectsMaps) { (app.containers.objectsMaps).querySelector('.page-content').innerHTML = ''; }
	};

	app.showOrientation = function() {
		if (localStorage.getItem("settings.debug") == "true") {
			toast(screen.orientation.type + " - " + screen.orientation.angle + "°.", { timeout: app.toastDuration, type: "info" });
		}
	};

	app.setPosition = function(position) {
		app.defaultResources.object.attributes.longitude = position.coords.longitude;
		app.defaultResources.object.attributes.latitude = position.coords.latitude;
		if (localStorage.getItem("settings.debug") == "true") {
			toast("Geolocation (Accuracy=" + position.coords.accuracy + ") is set to: L" + position.coords.longitude + " - l" + position.coords.latitude, { timeout: app.toastDuration, type: "info" });
		}
	};

	app.setPositionError = function(error) {
		switch (error.code) {
			case error.TIMEOUT:
				if (localStorage.getItem("settings.debug") == "true") {
					toast("Browser geolocation error !\n\nTimeout.", { timeout: app.toastDuration, type: "error" });
				}
				break;
			case error.POSITION_UNAVAILABLE:
				// dirty hack for safari
				if (error.message.indexOf("Origin does not have permission to use Geolocation service") == 0) {
					if (localStorage.getItem("settings.debug") == "true") {
						toast("Origin does not have permission to use Geolocation service - no fallback.", { timeout: app.toastDuration, type: "error" });
					}
				} else {
					if (localStorage.getItem("settings.debug") == "true") {
						toast("Browser geolocation error !\n\nPosition unavailable.", { timeout: app.toastDuration, type: "error" });
					}
				}
				break;
			case error.PERMISSION_DENIED:
				if (error.message.indexOf("Only secure origins are allowed") == 0) {
					if (localStorage.getItem("settings.debug") == "true") {
						toast("Only secure origins are allowed - no fallback.", { timeout: app.toastDuration, type: "error" });
					}
				}
				break;
			case error.UNKNOWN_ERROR:
				if (localStorage.getItem("settings.debug") == "true") {
					toast("Can't find your position - no fallback.", { timeout: app.toastDuration, type: "error" });
				}
				break;
		}
	};

	app.getLocation = function() {
		if (navigator.geolocation) {
			var options = { enableHighAccuracy: false, timeout: 200000, maximumAge: 500000 };
			navigator.geolocation.getCurrentPosition(app.setPosition, app.setPositionError, options);
		} else {
			if (localStorage.getItem("settings.debug") == "true") {
				toast("Geolocation is not supported by this browser.", { timeout: app.toastDuration, type: "warning" });
			}
		}
	};

	app.getCookie = function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
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

	app.showMenu = function() {
		app.containers.menuElement.style.transform = "translateX(0) !important";
		app.containers.menuElement.classList.add('menu--show');
		app.containers.menuOverlayElement.classList.add('menu__overlay--show');
		if (typeof app.containers.drawerObfuscatorElement !== "undefined") {
			app.containers.drawerObfuscatorElement.remove();
		}
	};

	app.hideMenu = function() {
		app.containers.menuElement.style.transform = "translateX(-120%) !important";
		app.containers.menuElement.classList.remove('menu--show');
		app.containers.menuOverlayElement.classList.add('menu__overlay--hide');
		app.containers.menuOverlayElement.classList.remove('menu__overlay--show');
		app.containers.menuElement.addEventListener('transitionend', app.onTransitionEnd, false);
		app.containers.menuElement.classList.remove('is-visible');
	};

	app.onTransitionEnd = function() {
		if (touchStartPoint < 10) {
			app.containers.menuElement.style.transform = "translateX(0)";
			app.containers.menuOverlayElement.classList.add('menu__overlay--show');
			app.containers.menuElement.removeEventListener('transitionend', app.onTransitionEnd, false);
		}
	};

	app.updateNetworkStatus = function() {
		let msg = "";
		let type = "";
		if (navigator.onLine) {
			msg = "You are now online...";
			type = "done";
			app.setHiddenElement("notification");
			navigator.serviceWorker.controller.postMessage("setOnline");
		}
		else {
			msg = "You are now offline...";
			type = "warning";
			app.setVisibleElement("notification");
			navigator.serviceWorker.controller.postMessage("setOffline");
		}
		toast(msg, { timeout: app.toastDuration, type: type });
	};

	app.clearCache = function() {
		toast("Please clear cache manually... :-)", { timeout: app.toastDuration, type: "warning" });
		if (localStorage.getItem("settings.debug") == "true") {
			console.log("[clearCache]", "Please clear cache manually... :-)");
		}
	};

	app.imageLazyLoading = function() {
		if (!('IntersectionObserver' in window)) {
			var LL = document.querySelectorAll('img.lazyloading');
			for (var image in LL) {
				if ((LL[image]).childElementCount > -1) {
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
				if ((LL[image]).childElementCount > -1) {
					(LL[image]).src = app.baseUrlCdn + '/img/m/placeholder.png';
					io.observe(LL[image]);
				}
			}
		}
	};

	app.managePage = function() {
		var currentPage = localStorage.getItem("currentPage");
		if (window.location.hash) {
			currentPage = window.location.hash.substr(1);
			if (currentPage === 'terms') {
				app.onTermsButtonClick();
			} else if (currentPage === 'compatible-devices') {
				app.getCompatibleDevices();
				app.setSection('compatible-devices');
			} else if (currentPage === 'openSourceLicenses') {
				app.getOpenSourceLicenses();
				app.setSection('openSourceLicenses');
			} else if (currentPage === 'objects-maps') {
				//app.getObjectsMaps();
				app.setSection('objects-maps');
			} else if (currentPage === 'docs') {
				app.onDocsButtonClick();
			} else if (currentPage === 'status') {
				app.onStatusButtonClick();
			} else if (currentPage === 'settings') {
				app.onSettingsButtonClick();
			} else if (currentPage === 'exploration') {
				app.setSection('exploration');
				app.getExploration();
			} else if (currentPage === 'login') {
				app.isLogged = false;
				localStorage.setItem("bearer", null);
				app.setSection(currentPage);
			} else {
				//let section = currentPage.split("?")[0];
				app.setSection(currentPage);
			}
		} else if (currentPage) {
			if (currentPage === 'objects') {
				app.setSection('objects');
			} else if (currentPage === 'flows') {
				app.setSection('flows');
			} else if (currentPage === 'dashboards') {
				app.setSection('dashboards');
			} else if (currentPage === 'snippets') {
				app.setSection('snippets');
			} else if (currentPage === 'rules') {
				app.setSection('rules');
			} else if (currentPage === 'mqtts') {
				app.setSection('mqtts');
			} else if (currentPage === 'sources') {
				app.setSection('sources');
			} else {
				app.setSection(currentPage);
			}
			if (localStorage.getItem("settings.debug") == "true") {
				toast("Back to last page view if available in browser storage", { timeout: app.toastDuration, type: "info" });
			}
		} else {
			app.setSection('index');
		}
	};

	app.setInteractiveLinks = function() {
		app.refreshContainers();
		app.refreshButtonsSelectors();
		app.setLoginAction();
		app.setSignupAction();
		app.setForgotAction();
		app.setPasswordResetAction();
		logout_button.addEventListener('click', function(evt) {
			app.auth = {};
			app.resetDrawer();
			app.sessionExpired();
			toast('You have been disconnected :-(', { timeout: app.toastDuration, type: "done" });
			app.setSection((evt.currentTarget.querySelector('a').getAttribute('hash') !== null ? evt.currentTarget.querySelector('a').getAttribute('hash') : evt.currentTarget.querySelector('a').getAttribute('href')).substr(1));
		}, false);
		signin_button.addEventListener('click', function(evt) {
			app.auth = {};
			app.setSection('login');
		}, false);
		app.buttons.notification.addEventListener('click', function(evt) {
			app.showNotification();
		}, false);
		profile_button.addEventListener('click', function(evt) {
			if (app.isLogged) {
				app.setSection((evt.currentTarget.querySelector('a').getAttribute('hash') !== null ? evt.currentTarget.querySelector('a').getAttribute('hash') : evt.currentTarget.querySelector('a').getAttribute('href')).substr(1));
			} else {
				app.setSection('login');
			}
		}, false);
		if (document.querySelector('.sticky')) {
			if (!window.getComputedStyle(document.querySelector('.sticky')).position.match('sticky')) {
				if (localStorage.getItem("settings.debug") == "true") {
					toast("Your browser does not support 'position: sticky'!!.", { timeout: app.toastDuration, type: "info" });
				}
			}
		}
		if (app.containers.menuIconElement && app.containers.menuOverlayElement) {
			app.containers.menuIconElement.addEventListener('click', app.showMenu, false);
			app.containers.menuIconElement.querySelector('i.material-icons').setAttribute('id', 'imgIconMenu');
			app.containers.menuOverlayElement.addEventListener('click', app.hideMenu, false);
			app.containers.menuElement.addEventListener('transitionend', app.onTransitionEnd, false);
			for (var item in app.containers.menuItems) {
				if (app.containers.menuItems[item].childElementCount > -1) {
					(app.containers.menuItems[item]).addEventListener('click', function(evt) {
						app.setSection((evt.currentTarget.getAttribute('href')).substr(1));
						app.hideMenu();
					}, false);
				}
			};
		}
		var pMatches = document.querySelectorAll('.passmatch');
		for (var p in pMatches) {
			if ((pMatches[p]).childElementCount > -1) {
				(pMatches[p]).addEventListener('input', function(event) {
					if (document.querySelector('#p2').value != '' && document.querySelector('#p1').value != document.querySelector('#p2').value) {
						document.querySelector('#p2').parentNode.classList.add('is-invalid');
						document.querySelector('#p2').parentNode.classList.add('is-dirty');
					} else {
						document.querySelector('#p2').parentNode.classList.remove('is-invalid');
						document.querySelector('#p2').parentNode.classList.remove('is-dirty');
					}
				});
			}
		}
		for (var item in app.containers.menuTabItems) {
			if (app.containers.menuTabItems[item].childElementCount > -1) {
				app.initNewSection(app.containers.menuTabItems[item].getAttribute("for"));
				//initNewSection
				(app.containers.menuTabItems[item]).addEventListener('click', function(evt) {
					app.setSection((evt.target.parentNode.getAttribute('hash') !== null ? evt.target.parentNode.getAttribute('hash') : evt.target.parentNode.getAttribute('href')).substr(1));
				}, false);
			}
		};
		for (var i in app.buttons.status) {
			if (app.buttons.status[i].childElementCount > -1) {
				app.buttons.status[i].removeEventListener('click', app.onStatusButtonClick, false);
				app.buttons.status[i].addEventListener('click', app.onStatusButtonClick, false);
			}
		};
		for (var i in app.buttons.features) {
			if (app.buttons.features[i].childElementCount > -1) {
				app.buttons.features[i].removeEventListener('click', app.onFeaturesButtonClick, false);
				app.buttons.features[i].addEventListener('click', app.onFeaturesButtonClick, false);
			}
		};
		for (var i in app.buttons.settings) {
			if (app.buttons.settings[i].childElementCount > -1) {
				app.buttons.settings[i].removeEventListener('click', app.onSettingsButtonClick, false);
				app.buttons.settings[i].addEventListener('click', app.onSettingsButtonClick, false);
			}
		};
		for (var i in app.buttons.docs) {
			if (app.buttons.docs[i].childElementCount > -1) {
				app.buttons.docs[i].removeEventListener('click', app.onDocsButtonClick, false);
				app.buttons.docs[i].addEventListener('click', app.onDocsButtonClick, false);
			}
		}
		for (var i in app.buttons.terms) {
			if (app.buttons.terms[i].childElementCount > -1) {
				app.buttons.terms[i].removeEventListener('click', app.onTermsButtonClick, false);
				app.buttons.terms[i].addEventListener('click', app.onTermsButtonClick, false);
			}
		};
		// Search
		if (document.getElementById('search-exp')) {
			document.getElementById('search-exp').addEventListener('keypress', function(e) {
				if (e.keyCode === 13) {
					e.preventDefault();
					var input = this.value;
					if (localStorage.getItem("settings.debug") == "true") {
						alert("Searching for " + input);
					}
				}
			});
		};
		// Filter
		if (document.getElementById('filter-exp')) {
			document.getElementById('filter-exp').addEventListener('keypress', function(e) {
				if (e.keyCode === 13) {
					e.preventDefault();
					var input = this.value;
					var type = 'objects';
					var size;
					if (document.querySelector('section#objects').classList.contains('is-active')) {
						type = 'objects';
						size = app.itemsSize.objects;
					} else if (document.querySelector('section#flows').classList.contains('is-active')) {
						type = 'flows';
						size = app.itemsSize.flows;
					}
					app.fetchItemsPaginated(type, this.value, 1, size);
				}
			});
		};
		// Lazy loading
		var paginatedContainer = Array(Array(app.containers.objects, 'objects'), Array(app.containers.flows, 'flows'), Array(app.containers.snippets, 'snippets'), Array(app.containers.dashboards, 'dashboards'), Array(app.containers.mqtts, 'mqtts'), Array(app.containers.sources, 'sources'), Array(app.containers.rules, 'rules'));
		paginatedContainer.map(function(c) {
			if (c[0]) {
				c[0].addEventListener('DOMMouseScroll', function(event) {
					var height = (document.body.scrollHeight || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
					var bottom = (document.querySelector('section#' + c[1])).getBoundingClientRect().bottom;
					if (bottom <= height && c[0].classList.contains('is-active')) {
						//console.log("Lazy loading -->", c[0].offsetHeight, height, bottom);
						//console.log('Lazy loading page=', ++(app.itemsPage[c[1]]));
					}
				});
			}
		});
		// Cookie Consent
		var d = new Date();
		d.setTime(d.getTime() + (app.cookieconsent * 24 * 60 * 60 * 1000));
		if(document.getElementById('cookieconsent.agree')) {
			document.getElementById('cookieconsent.agree').addEventListener('click', function(evt) {
				document.getElementById('cookieconsent').remove();
				document.cookie = "cookieconsent=true;expires=" + d.toUTCString() + ";path=/";
				document.cookie = "cookieconsentNoGTM=false;expires=" + d.toUTCString() + ";path=/";
				evt.preventDefault();
			}, false);
			document.getElementById('cookieconsent.noGTM').addEventListener('click', function(evt) {
				document.getElementById('cookieconsent').remove();
				document.cookie = "cookieconsent=true;expires=" + d.toUTCString() + ";path=/";
				document.cookie = "cookieconsentNoGTM=true;expires=" + d.toUTCString() + ";path=/";
				if (typeof mixpanel !== "undefined") {
					mixpanel.opt_out_tracking();
				}
				evt.preventDefault();
			}, false);
			document.getElementById('cookieconsent.read').addEventListener('click', function(evt) {
				app.getTerms();
				app.setSection('terms');
				evt.preventDefault();
			}, false);
			if (app.getCookie('cookieconsent') !== "true") {
				document.getElementById('cookieconsent').classList.add('is-visible');
				document.getElementById('cookieconsent').classList.remove('hidden');
			} else {
				document.getElementById('cookieconsent').classList.add('hidden');
				document.getElementById('cookieconsent').classList.remove('is-visible');
			}
		}
	};

	app.setServiceWorker = function() {
		if (!('serviceWorker' in navigator)) {
			if (localStorage.getItem("settings.debug") == "true") {
				console.log('[ServiceWorker]', 'Service Worker isn\'t supported on this browser.');
			}
			return;
		} else {
			if (!('PushManager' in window)) {
				if (localStorage.getItem("settings.debug") == "true") {
					console.log("[pushSubscription]", 'Push isn\'t supported on this browser.');
				}
				return;
			} else {
				if (localStorage.getItem("settings.debug") == "true") {
					console.log("[pushSubscription]", 'askPermission && subscribeUserToPush');
				}
				app.askPermission();
				app.subscribeUserToPush();
			}
		};
	};

	/*
	 * *********************************** Run the App ***********************************
	 */
	document.addEventListener("readystatechange", event => {
		var changedTime = new Date();
		if (event.target.readyState === "loading") {
			if (localStorage.getItem("settings.debug") == "true") {
				var loadingTime = new Date();
				console.log("DEBUG", "loading time: ", loadingTime - startTime, "ms", " (begin", moment(loadingTime).format("hh:mm:ss,SSS"), "ms. lasted ", loadingTime - changedTime, "ms)");
			}
		} else if (event.target.readyState === "interactive") {
			if (localStorage.getItem("settings.debug") == "true") {
				var interactiveTime = new Date();
				console.log("DEBUG", "interactive time: ", interactiveTime - startTime, "ms", " (begin",  moment(interactiveTime).format("hh:mm:ss,SSS"), "ms. lasted ", interactiveTime - changedTime, "ms)");
			}
		} else if (event.target.readyState === "complete") {
			if (localStorage.getItem('refresh_token') !== null && localStorage.getItem('refreshTokenExp') !== null && localStorage.getItem('refreshTokenExp') > moment().unix()) {
				app.isLogged = true;
			}
			if (!app.isLogged || app.auth.username === undefined) {
				if (localStorage.getItem('refresh_token') !== null && localStorage.getItem('refreshTokenExp') !== null && localStorage.getItem('refreshTokenExp') > moment().unix()) {
					app.refreshAuthenticate();
		
					app.setHiddenElement("signin_button");
					app.setVisibleElement("logout_button");
					app.getUnits();
					app.getDatatypes();
					app.getSnippets();
					app.getFlows();
					app.getSources();
					setInterval(app.refreshAuthenticate, app.refreshExpiresInSeconds);
					if (localStorage.getItem('role') == 'admin') {
						app.addMenuItem('Users Accounts', 'supervisor_account', '#users-list', null);
					}
				} else {
					app.sessionExpired();
				}
			}

			app.refreshContainers();
			app.managePage();
			app.fetchIndex('index');
			app.setInteractiveLinks();
			app.refreshButtonsSelectors();
			app.imageLazyLoading();
			app.setDrawer();
			app.setHiddenElement("notification");
			app.setServiceWorker();

			if (typeof screen.orientation !== "undefined") {
				screen.orientation.addEventListener("change", app.showOrientation);
			}
			
			window.addEventListener("online", app.updateNetworkStatus, false);
			window.addEventListener("offline", app.updateNetworkStatus, false);
			window.addEventListener("clearCache", app.clearCache, false);
			window.addEventListener("hashchange", function() {
				if (localStorage.getItem("settings.debug") == "true") {
					console.log("DEBUG", "hashchange", window.location.hash);
				}
				if (window.history && window.history.pushState) {
					localStorage.setItem("currentPage", window.location.hash.substr(1));
					var id = getParameterByName('id', null);
					var id2 = window.location.hash;
					if (id) {
						localStorage.setItem("currentResourceId", id);
					} else {
						localStorage.setItem("currentResourceId", null);
					}
					app.managePage();
				}
				if (localStorage.getItem("settings.debug") == "true") {
					console.log('[History]', 'hashchange');
					console.log('[History]', 'resource id', id2);
				}
			}, false);
			if (app.gtm !== "" && app.getCookie('cookieconsentNoGTM') !== "true") {
				(function(w, d, s, l, i) {
					w[l] = w[l] || []; w[l].push({
						'gtm.start':
							new Date().getTime(), event: 'gtm.js'
					}); var f = d.getElementsByTagName(s)[0],
						j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
							'//www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
				})(window, document, 'script', 'dataLayer', app.gtm);
				if (localStorage.getItem("settings.debug") == "true") {
					console.log('[gtm]', 'gtm.start');
				}
			}
			
			// Notifications
			for (var i in app.buttons.notifications) {
				if (app.buttons.notifications[i].childElementCount > -1) {
					app.buttons.notifications[i].addEventListener('click', function(e) {
						let email, token;
						if (getParameterByName("email", null)) {
							email = decodeURI(getParameterByName("email", null));
						} else {
							email = app.getSetting("notifications.email");
						}
						if (getParameterByName("token", null)) {
							token = decodeURI(getParameterByName("token", null));
						} else {
							token = app.getSetting("notifications.unsubscription_token");
						}
						if (email !== null && token !== null) {
							var myHeaders = new Headers();
							myHeaders.append("Authorization", "Bearer " + localStorage.getItem("bearer"));
							myHeaders.append("Content-Type", "application/json");
							var myInit = { method: "GET", headers: myHeaders };
							var type = e.target.parentNode.classList.contains("is-checked") ? "unsubscribe" : "subscribe";
							var url = `${app.baseUrl}/mail/${email}/${type}/${e.target.getAttribute("name")}/${token}/`;
							fetch(url, myInit)
								.then(
									app.fetchStatusHandler
								).then(function(fetchResponse) {
									return fetchResponse.json();
								})
								.then(function(response) {
									console.log(response);
									toast('Settings updated.', { timeout: app.toastDuration, type: "done" });
								})
								.catch(function(error) {
									if (localStorage.getItem("settings.debug") == "true") {
										toast('Error occured on saving Notifications...' + error, { timeout: app.toastDuration, type: "error" });
									}
								});
						} else {
							if (localStorage.getItem("settings.debug") == "true") {
								toast("Error occured on saving Notifications. Missing parameter.", { timeout: app.toastDuration, type: "error" });
							}
						}
					}, false);
				}
			}
		
			var ce = function(e, n) { var a = document.createEvent("CustomEvent"); a.initCustomEvent(n, true, true, e.target); e.target.dispatchEvent(a); a = null; return false },
				nm = true, sp = { x: 0, y: 0 }, ep = { x: 0, y: 0 },
				touch = {
					touchstart: function(e) { sp = { x: e.touches[0].pageX, y: e.touches[0].pageY } },
					touchmove: function(e) { nm = false; ep = { x: e.touches[0].pageX, y: e.touches[0].pageY } },
					touchend: function(e){if(nm){ce(e,'fc')}else{var x=ep.x-sp.x,xr=Math.abs(x),y=ep.y-sp.y,yr=Math.abs(y);if(Math.max(xr,yr)>20){ce(e,(xr>yr?(x<0?'swl':'swr'):(y<0?'swu':'swd')))}};nm=true},
					touchcancel: function(e) { nm = false }
				};
			for (var a in touch) { document.addEventListener(a, touch[a], false); }
			document.body.addEventListener('touchstart', function(event) {
				touchStartPoint = event.changedTouches[0].pageX;
				touchMovePoint = touchStartPoint;
		
				var fabs = document.querySelectorAll('section.is-active div.page-content.mdl-grid .mdl-button--fab, div.play-fab');
				for (var f in fabs) {
					if (fabs[f].classList) {
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
				var fabs = document.querySelectorAll('section.is-active div.page-content.mdl-grid .mdl-button--fab, div.play-fab');
				for (var f in fabs) {
					if (fabs[f].classList) {
						fabs[f].classList.remove('is-not-here');
						fabs[f].classList.add('is-here');
					}
				}
			}, false);
			/*
			console.log("DEBUG", "devicelight event");
			let body = document.body;
			if ("ondevicelight" in window) {
				window.addEventListener("devicelight", function(event) {
					if (event.value < 50) {
						body.classList.add("darklight");
						body.classList.remove("brightlight");
					} else {
						body.classList.add("brightlight");
						body.classList.remove("darklight");
					}
				});
				if (localStorage.getItem("settings.debug") == "true") {
					toast("devicelight event is activated", { timeout: app.toastDuration, type: "info" });
				}
			} else {
				console.log("DEBUG", "devicelight event is not supported");
				if (localStorage.getItem("settings.debug") == "true") {
					toast("devicelight event is not supported", { timeout: app.toastDuration, type: "info" });
				}
				body.classList.add("brightlight");
				body.classList.remove("darklight");
			}
			*/

			if (localStorage.getItem("settings.debug") == "true") {
				var completeTime = new Date();
				console.log("DEBUG", "complete time: ", completeTime - startTime, "ms", " (begin",  moment(completeTime).format("hh:mm:ss,SSS"), "ms. lasted ", completeTime - changedTime, "ms)");
			}
		}
	});
})();
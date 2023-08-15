/*
 * 
 * 
 */
let start = new Date();

moduleLoadTime = new Date();
require("cache-require-paths");
global.os				= require("os");
global.fs				= require("fs");
global.path				= require("path");
global.session			= require("express-session");
global.FileStore		= require("session-file-store")(session);
global.firebaseAdmin	= require("firebase-admin");

global.annotate = function(user_id, from_ts, to_ts, flow_id, category_id, rule_id=null) {
	annotations	= db_classifications.getCollection("annotations");
	let annotation_id = uuid.v4();
	let newAnnotation = {
		id:			annotation_id,
		user_id:	user_id,
		from_ts:	parseInt(from_ts, 10),
		to_ts:		parseInt(to_ts, 10),
		flow_id:	flow_id,
		category_id:category_id,
	};
	let eName = rule_id!==null?"Annotation added from Rule":"Annotation added from custom";
	t6events.addStat("t6Api", eName, newAnnotation.id, user_id, {"user_id": user_id, annotation_id: newAnnotation.id, flow_id: newAnnotation.flow_id, category_id: newAnnotation.category_id, rule_id: rule_id});
	annotations.insert(newAnnotation);
	return newAnnotation;
};
global.getJson = function(v) {
	try {
		return JSON.parse(v);
	} catch (e) {
		return v;
	}
};
global.getFieldsFromDatatype = function(datatype, asValue, includeTime=true) {
	let fields = "";
	if( includeTime ) {
		fields += "time, ";
	}
	switch(datatype) {
		case "boolean": 
			fields += "valueBoolean";
			break;
		case "date": 
			fields += "valueDate";
			break;
		case "integer": 
			fields += "valueInteger";
			break;
		case "json": 
			fields += "valueJson";
			break;
		case "time": 
			fields += "valueTime";
			break;
		case "float": 
			fields += "valueFloat";
			break;
		case "geo": 
			fields += "valueGeo";
			break;
		case "image": 
			fields += "valueImage";
			break;
		case "string": 
		default: 
			fields += "valueString";
			break;
	}
	if( asValue ) {
		fields += " as value";
	}
	return fields;
};
global.str2bool = function(v) {
	return [true, "yes", "true", "t", "1", "y", "yeah", "on", "yup", "certainly", "uh-huh"].indexOf(v)>-1?true:false;
};
global.smartTrim = function(string, maxLength) {
	if (!string) return string;
	if (maxLength < 1) return string;
	if (string.length <= maxLength) return string;
	if (maxLength === 1) return string.substring(0, 1) + "...";

	var midpoint = Math.ceil(string.length / 2);
	var toremove = string.length - maxLength;
	var lstrip = Math.ceil(toremove / 2);
	var rstrip = toremove - lstrip;
	return string.substring(0, midpoint - lstrip) + "..." + string.substring(midpoint + rstrip);
};
global.getRandomSample = function(arr, size) {
	let shuffled = arr.slice(0), i = arr.length, temp, index;
	while (i--) {
		index = Math.floor((i + 1) * Math.random());
		temp = shuffled[index];
		shuffled[index] = shuffled[i];
		shuffled[i] = temp;
	}
	return [shuffled.slice(0, size), shuffled.slice(size, arr.length)];
};
global.shuffle = function(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		let temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

/* Environment settings */
require(`./data/settings-${os.hostname()}.js`);
global.VERSION			= require("./package.json").version;
global.appName			= require("./package.json").name;
global.appStarted		= start;
global.t6BuildVersion	= require("./t6BuildVersion.json").t6BuildVersion;
global.t6BuildDate		= require("./t6BuildVersion.json").t6BuildDate;
global.t6decisionrules	= require("./t6decisionrules");
global.t6mqtt			= require("./t6mqtt");
global.t6mailer			= require("./t6mailer");
global.t6notifications	= require("./t6notifications");
global.t6events			= require("./t6events");
global.t6console		= require("./t6console");
global.t6otahistory		= require("./t6otahistory");
global.t6preprocessor	= require("./t6preprocessor");
global.t6jobs			= require("./t6jobs");
global.t6imagesprocessing = require("./t6imagesprocessing");
global.t6machinelearning = require("./t6machinelearning");
global.t6websockets		= require("./t6websockets");
global.t6databases		= require("./t6databases");
global.monitor			= require("./t6monitor");

global.url				= require("node:url");
global.express			= require("express");
global.timeout			= require("connect-timeout");
global.morgan			= require("morgan");
global.cookieParser		= require("cookie-parser");
global.bcrypt			= require("bcrypt");
global.bodyParser		= require("body-parser");
global.imageType		= require("image-type");
global.pug				= require("pug");
global.compression		= require("compression");
global.colors			= require("colors");
global.changeCase		= require("change-case");
global.exec				= require("child_process").exec;
global.crypto			= require("crypto");
global.D3Node			= require("d3-node");
var { expressjwt: jwt } = require("express-jwt");
global.expressJwt = jwt;
global.geodist			= require("geodist");
global.geoip			= require("geoip-lite");
global.jsonwebtoken		= require("jsonwebtoken");
global.nmap				= require("libnmap");
global.Loess			= require("loess");
global.loki				= require("lokijs");
global.passgen			= require("passgen");
global.md5				= require("md5");
global.moment			= require("moment");
global.mqtt				= require("mqtt");
global.multer			= require("multer");
global.nodeunits		= require("node-units");
global.uuid				= require("uuid");
global.nodemailer		= require("nodemailer");
global.otpGen			= require("otp-generator");
global.otpTool			= require("otp-without-db"); 
global.outlier			= require("outlier");
global.qrCode			= require("qrcode-npm");
global.request			= require("request");
global.Sentiment		= require("sentiment");
global.serialport		= require("serialport");
global.favicon			= require("serve-favicon");
global.statistics		= require("simple-statistics");
global.sprintf			= require("sprintf-js").sprintf;
global.slayer			= require("slayer");
global.strength			= require("strength");
global.stringformat		= require("string-format");
global.SunCalc			= require("suncalc");
global.twilio			= require("twilio");
global.textToSpeech		= require("@google-cloud/text-to-speech");
global.util				= require("util");
global.useragent		= require("useragent");
global.validator		= require("validator");
global.webpush			= require("web-push");
global.WebSocketServer	= require("ws").WebSocketServer;
global.algorithm		= "aes-256-cbc";
global.t6events.setMeasurement("events");
global.t6events.setRP(typeof influxSettings.retentionPolicies.events!=="undefined"?influxSettings.retentionPolicies.events:"autogen");
global.t6mailer.setBcc(bcc);
global.t6ConnectedObjects = [];
if( db_type.influxdb === true ) {
	//var {InfluxDB} = require("@influxdata/influxdb-client"); // Should use "writeApi"
	var {InfluxDB} = require("influx");
	var dbStringInfluxDB	= `${influxSettings.influxdb.protocol}://${influxSettings.influxdb.host}:${influxSettings.influxdb.port}/${influxSettings.database}`;
	//dbInfluxDB		= new InfluxDB(dbStringInfluxDB);
	dbInfluxDB = new InfluxDB({ database: influxSettings.database, host: influxSettings.influxdb.host, port: influxSettings.influxdb.port, username: influxSettings.username, password: influxSettings.password});
}
if( db_type.telegraf === true ) {
	var dbStringTelegraf	= `${influxSettings.telegraf.protocol}://${influxSettings.telegraf.host}:${influxSettings.telegraf.port}/${influxSettings.database}`;
	dbTelegraf		= new InfluxDB(dbStringTelegraf);
}
moduleLoadEndTime = new Date();
t6console.log(`Modules load time: ${moduleLoadEndTime-moduleLoadTime}ms`);

/* Logging */
var error = fs.createWriteStream(logErrorFile, { flags: "a" });
process.stdout.write = process.stderr.write = error.write.bind(error);
process.on("uncaughtException", function(err) {
	t6console.error((err && err.stack) ? err.stack : err);
});
t6console.log("");
t6console.log("===========================================================");
t6console.log(`============================ ${appName} ===========================`);
t6console.log("===========================================================");
t6console.log(`Starting ${appName} v${VERSION}`);
t6console.log(`Node: v${process.versions.node}`);
t6console.log(`Build: v${t6BuildVersion}`);
t6console.log(`Access Logs: ${logAccessFile}`);
t6console.log(`Error Logs: ${logErrorFile}`);
t6console.log(`Log level: ${logLevel}`);
t6console.log(`Environment: ${process.env.NODE_ENV}`);

t6databases.init();

if(dbInfluxDB) {
	dbInfluxDB.getDatabaseNames().then((name) => {
		t6console.log("");
		t6console.log("===========================================================");
		t6console.log("========================== influxdb =======================");
		t6console.log("===========================================================");
		t6console.log(`Activated influxdb for reading: ${dbStringInfluxDB}`);
		t6console.log("influxdb Databases: ", name);
		t6console.log("influxdb Retention Policies :");
		t6console.log("-requests:", `${influxSettings.retentionPolicies.requests}`);
		t6console.log("-events:", `${influxSettings.retentionPolicies.events}`);
		t6console.log("-data:",  `${influxSettings.retentionPolicies.data}`);
	});
}
if(dbTelegraf) {
	t6console.log(`Activated telegraf for writing: ${dbStringTelegraf}`);
}

routesLoadTime = new Date();
t6console.log("");
t6console.log("===========================================================");
t6console.log("===================== Loading routes... ===================");
t6console.log("===========================================================");
var indexRoute				= require("./routes/index");
var objectsRoute			= require("./routes/objects");
var dashboardsRoute			= require("./routes/dashboards");
var snippetsRoute			= require("./routes/snippets");
var rulesRoute				= require("./routes/rules");
var mqttsRoute				= require("./routes/mqtts");
var usersRoute				= require("./routes/users");
var dataRoute				= require("./routes/data");
var flowsRoute				= require("./routes/flows");
var unitsRoute				= require("./routes/units");
var datatypesRoute			= require("./routes/datatypes");
var pwaRoute				= require("./routes/pwa");
var notificationsRoute		= require("./routes/notifications");
var oauthRoute				= require("./routes/oauth");
var modelsRoute				= require("./routes/models");
var iftttRoute				= require("./routes/ifttt");
var otaRoute				= require("./routes/ota");
var sourcesRoute			= require("./routes/sources");
var storiesRoute			= require("./routes/stories");
var uisRoute				= require("./routes/uis");
var newsRoute				= require("./routes/news");
var explorationRoute		= require("./routes/exploration");
var jobsRoute				= require("./routes/jobs");
var classificationsRoute	= require("./routes/classifications");
var auditsRoute				= require("./routes/audits");
app							= express();
if(enableMonitoring) {
	monitor(app);
	t6console.log("");
	t6console.log("===========================================================");
	t6console.log("================== Initialize monitoring... ===============");
	t6console.log("===========================================================");
	t6console.log(`${appName} is being monitored.`);
}
app.set("port", process.env.PORT);
app.listen(process.env.PORT, () => {
	t6events.addStat("t6App", "start", "self", t6BuildVersion);
	t6console.log("App is instanciated.");
	t6console.log(`${appName} http(s) listening to ${baseUrl_https}.`);
});

routesLoadEndTime = new Date();
t6console.log(`Modules load time: ${moduleLoadEndTime-moduleLoadTime}ms`);
t6console.log(`Routes loaded in ${routesLoadEndTime-routesLoadTime}ms.`);

var CrossDomain = function(req, res, next) {
	if (req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Content-Length, X-Requested-With");
		res.status(200).send("");
	} else {
		res.header("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Content-Length, X-Requested-With");
		res.header("Feature-Policy", "accelerometer: 'none'; unsized-media: 'none'; ambient-light-sensor: 'self'; camera: 'none'; encrypted-media: 'none'; fullscreen: 'self'; geolocation: 'self'; gyroscope: 'none'; magnetometer: 'none'; picture-in-picture: 'self'; microphone: 'none'; sync-xhr: 'self'; usb: 'none'; vr: 'none'");
		res.header("Referrer-Policy", "origin-when-cross-origin");
		res.header("Strict-Transport-Security", "max-age=5184000; includeSubDomains");
		res.header("X-Frame-Options", "SAMEORIGIN");
		res.header("X-Content-Type-Options", "nosniff");
		if (req.url.match(/^\/(css|js|img|font|woff2|ttf|ico|map|txt|gz|svg|webp)\/.+/)) {
			res.setHeader("Cache-Control", `public, max-age=${30*24*3600}`);
		}
		next();
	}
};
app.use(CrossDomain);
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({extended: true, limit: "50mb"}));
app.enable("trust proxy");
app.use(compression());
app.use(morgan(logFormat, {stream: fs.createWriteStream(logAccessFile, {flags: "a"})}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(timeout(timeoutDuration));
app.use(favicon(__dirname + "/public/img/favicon.ico"));
app.disable("x-powered-by");
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "pug");
app.use(session(sessionSettings));
app.use(express.static(path.join(__dirname, "/public"), staticOptions));
app.use(express.static(path.join(__dirname, "/docs"), staticOptions));
app.use("/.well-known", express.static(path.join(__dirname, "/.well-known"), staticOptions));
app.use("/v"+version, indexRoute);
app.use("/v"+version+"/users", usersRoute);
app.use("/v"+version+"/objects", objectsRoute);
app.use("/v"+version+"/dashboards", dashboardsRoute);
app.use("/v"+version+"/rules", rulesRoute);
app.use("/v"+version+"/mqtts", mqttsRoute);
app.use("/v"+version+"/snippets", snippetsRoute);
app.use("/v"+version+"/flows", flowsRoute);
app.use("/v"+version+"/data", dataRoute);
app.use("/v"+version+"/units", unitsRoute);
app.use("/v"+version+"/datatypes", datatypesRoute);
app.use("/v"+version+"/models", modelsRoute);
app.use("/v"+version+"/notifications", notificationsRoute);
app.use("/v"+version+"/OAuth2", oauthRoute);
app.use("/v"+version+"/ifttt", iftttRoute);
app.use("/v"+version+"/ota", otaRoute);
app.use("/v"+version+"/sources", sourcesRoute);
app.use("/v"+version+"/stories", storiesRoute);
app.use("/v"+version+"/uis", uisRoute);
app.use("/v"+version+"/exploration", explorationRoute);
app.use("/v"+version+"/jobs", jobsRoute);
app.use("/v"+version+"/classifications", classificationsRoute);
app.use("/v"+version+"/audits", auditsRoute);
app.use("/news", newsRoute);
app.use("/", pwaRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	res.status(err.status || 500).render(""+err.status, {
		title : "Not Found",
		user: req.session.user,
		currentUrl: req.path,
		err: app.get("env")==="development"?err:{status: err.status, stack: err.stack}
	});
	//next(err);
});

if ( logLevel.indexOf("INFO") > -1 ) {
	request.debug = true;
}
if (app.get("env") === "development") {
	app.use(function(err, req, res, next) {
		if (err.name === "UnauthorizedError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token "+err.message, "stack": err.stack });
		} else if (err.name === "TokenExpiredError") {
			res.status(410).send({ "code": err.status, "error": "Unauthorized: expired token "+err.message, "stack": err.stack });
		} else if (err.name === "JsonWebTokenError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token "+err.message, "stack": err.stack });
		} else if (err.name === "NotBeforeError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token "+err.message, "stack": err.stack });
		} else {
			t6console.critical(`Uncatch Error on ${app.get("env")}: ${err.message}`, err.status, err.name, err);
			t6console.error(`Uncatch Error on ${app.get("env")}: ${err.message}`, err.status, err.name, err.stack, req.body, req);
			res.status(err.status || 500).send({ "code": err.status, "error": err.message, "stack": err.stack });
		}
		t6events.addStat("t6App", `Error ${err.status} ${err.name}`, "self", t6BuildVersion);
	});
} else {
	app.use(function(err, req, res, next) {
		if (err.name === "UnauthorizedError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token" });
		} else if (err.name === "TokenExpiredError") {
			res.status(410).send({ "code": err.status, "error": "Unauthorized: expired token" });
		} else if (err.name === "JsonWebTokenError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token" });
		} else if (err.name === "NotBeforeError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token" });
		} else {
			t6console.critical(`Uncatch Error on ${app.get("env")}: ${err.message}`, err.status, err.name, err);
			res.status(err.status || 500).send({ "code": err.status, "error": err.message });
		}
		t6events.addStat("t6App", `Error ${err.status} ${err.name}`, "self", t6BuildVersion);
	});
}

global.t6mqtt.init();
global.t6websockets.init();
global.startProcessTime = new Date()-start;

t6console.log(`Start process duration: ${(startProcessTime)/1000}s.`);
module.exports = app;
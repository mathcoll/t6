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

/* Environment settings */
require(`./data/settings-${os.hostname()}.js`);
global.VERSION			= require("./package.json").version;
global.appName			= require("./package.json").name;
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

var express				= require("express");
var timeout				= require("connect-timeout");
var morgan				= require("morgan");
var cookieParser		= require("cookie-parser");
var bodyParser			= require("body-parser");
var bearer				= require("bearer");
var pug					= require("pug");
var compression			= require("compression");
var colors				= require("colors");
global.bcrypt			= require("bcrypt");
global.crypto			= require("crypto");
global.expressJwt		= require("express-jwt");
global.geoip			= require("geoip-lite");
global.jwt				= require("jsonwebtoken");
global.loki				= require("lokijs");
global.passgen			= require("passgen");
global.md5				= require("md5");
global.moment			= require("moment");
global.mqtt				= require("mqtt");
global.uuid				= require("node-uuid");
global.nodemailer		= require("nodemailer");
global.qrCode			= require("qrcode-npm");
global.request			= require("request");
global.serialport		= require("serialport");
global.favicon			= require("serve-favicon");
global.sprintf			= require("sprintf-js").sprintf;
global.strength			= require("strength");
global.stringformat		= require("string-format");
global.util				= require("util");
global.useragent		= require("useragent");
global.webpush			= require("web-push");
global.nmap				= require("libnmap");
global.statistics		= require("simple-statistics");
global.Loess			= require("loess");
global.D3Node			= require("d3-node");
global.exec				= require("child_process").exec;
global.changeCase		= require("change-case");
global.validator		= require("validator");
global.units			= require("node-units");
global.t6events.setMeasurement("events");
global.t6events.setRP(typeof influxSettings.retentionPolicies.events!=="undefined"?influxSettings.retentionPolicies.events:"autogen");
global.algorithm		= "aes-256-cbc";
global.t6ConnectedObjects = [];
if( db_type.influxdb === true ) {
	//var {InfluxDB} = require("@influxdata/influxdb-client"); // Should use "writeApi"
	var {InfluxDB} = require("influx");
	var dbStringInfluxDB	= `${influxSettings.influxdb.protocol}://${influxSettings.influxdb.host}:${influxSettings.influxdb.port}/${influxSettings.database}`;
	dbInfluxDB		= new InfluxDB(dbStringInfluxDB);
}
if( db_type.telegraf === true ) {
	var dbStringTelegraf	= `${influxSettings.telegraf.protocol}://${influxSettings.telegraf.host}:${influxSettings.telegraf.port}/${influxSettings.database}`;
	dbTelegraf		= new InfluxDB(dbStringTelegraf);
}
moduleLoadEndTime = new Date();

/* Logging */
var error = fs.createWriteStream(logErrorFile, { flags: "a" });
process.stdout.write = process.stderr.write = error.write.bind(error);
process.on("uncaughtException", function(err) {
	t6console.error((err && err.stack) ? err.stack : err);
});
t6console.log(`Starting ${appName} v${VERSION}`);
t6console.log(`Node: v${process.versions.node}`);
t6console.log(`Build: v${t6BuildVersion}`);
t6console.log(`Access Logs: ${logAccessFile}`);
t6console.log(`Error Logs: ${logErrorFile}`);
t6console.log(`Log level: ${logLevel}`);
t6console.log(`Environment: ${process.env.NODE_ENV}`);
t6console.log(`Modules load time: ${moduleLoadEndTime-moduleLoadTime}ms`);
if(dbTelegraf) {
	t6console.log(`Activated telegraf for writing: ${dbStringTelegraf}`);
}
if(dbInfluxDB) {
	t6console.log(`Activated influxdb for reading: ${dbStringInfluxDB}`);
}

/* Main Database settings */
var initDbMain = function() {
	if ( db.getCollection("objects") === null ) {
		t6console.error("- Collection Objects is failing");
	} else {
		t6console.log(db.getCollection("objects").count(), "resources in Objects collection.");
	}
	if ( db.getCollection("flows") === null ) {
		t6console.error("- Collection Flows is failing");
	} else {
		t6console.log(db.getCollection("flows").count(), "resources in Flows collection.");
	}
	if ( db.getCollection("users") === null ) {
		t6console.error("- Collection Users is failing");
	} else {
		t6console.info(db.getCollection("users").count(), "resources in Users collection.");
	}
	if ( db.getCollection("tokens") === null ) {
		t6console.error("- Collection Tokens is failing");
	} else {
		/* Some optimization */
		let tokens	= db.getCollection("tokens");
		let expired = tokens.find( { "$and": [ { "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } }]} );
		if ( expired ) { tokens.remove(expired); db.save(); }
		t6console.log(db.getCollection("tokens").count(), "resources in Tokens collection (in db).");
	}
	if ( db.getCollection("units") === null ) {
		t6console.error("- Collection Units is failing");
	} else {
		t6console.log(db.getCollection("units").count(), "resources in Units collection.");
	}
	if ( db.getCollection("datatypes") === null ) {
		t6console.error("- Collection Datatypes is failing");
	} else {
		t6console.log(db.getCollection("datatypes").count(), "resources in Datatypes collection.");
	}
}
var initDbRules = function() {
	if ( dbRules === null ) {
		t6console.error("db Rules is failing");
	}
	if ( dbRules.getCollection("rules") === null ) {
		t6console.error("- Collection Rules is failing");
	} else {
		t6console.log(dbRules.getCollection("rules").count(), "resources in Rules collection.");
	}
}
var initDbSnippets = function() {
	if ( dbSnippets === null ) {
		t6console.error("db Snippets is failing");
	}
	if ( dbSnippets.getCollection("snippets") === null ) {
		t6console.error("- Collection Snippets is failing");
	} else {
		t6console.log(dbSnippets.getCollection("snippets").count(), "resources in Snippets collection.");
	}
}
var initDbDashboards = function() {
	if ( dbDashboards === null ) {
		t6console.error("db Dashboards is failing");
	}
	if ( dbDashboards.getCollection("dashboards") === null ) {
		t6console.error("- Collection Dashboards is failing");
	} else {
		t6console.log(dbDashboards.getCollection("dashboards").count(), "resources in Dashboards collection.");
	}
}
var initDbTokens = function() {
	if ( dbTokens === null ) {
		t6console.error("db Tokens is failing");
	}
	if ( dbTokens.getCollection("tokens") === null ) {
		t6console.error("- Collection Tokens is failing");
	} else {
		/* Some optimization */
		let tokens	= dbTokens.getCollection("tokens");
		let expired = tokens.find( { "$and": [ { "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } }]} );
		if ( expired ) { tokens.remove(expired); db.save(); }
		t6console.log(dbTokens.getCollection("tokens").count(), "resources in Tokens collection (in separate db).");
	}
}
var initDbSources = function() {
	if ( dbSources === null ) {
		t6console.error("db Sources is failing");
	}
	if ( dbSources.getCollection("sources") === null ) {
		t6console.error("- Collection Sources is failing");
	} else {
		t6console.log(dbSources.getCollection("sources").count(), "resources in Sources collection.");
	}
}
var initDbOtaHistory = function() {
	if ( dbOtaHistory === null ) {
		t6console.error("db OtaHistory is failing");
	}
	if ( dbOtaHistory.getCollection("otahistory") === null ) {
		t6console.error("- Collection OtaHistory is failing");
	} else {
		t6console.log(dbOtaHistory.getCollection("otahistory").count(), "resources in OtaHistory collection.");
	}
}
var initDbUis = function() {
	if ( dbUis === null ) {
		t6console.error("db UIs is failing");
	}
	if ( dbUis.getCollection("uis") === null ) {
		t6console.error("- Collection UIs is failing");
	} else {
		t6console.log(dbUis.getCollection("uis").count(), "resources in UIs collection.");
	}
};

t6console.info("Setting correct permission on Databases...");
let dbs = [
	path.join(__dirname, "data", `db-${os.hostname()}.json`),
	path.join(__dirname, "data", `rules-${os.hostname()}.json`),
	path.join(__dirname, "data", `snippets-${os.hostname()}.json`),
	path.join(__dirname, "data", `dashboards-${os.hostname()}.json`),
	path.join(__dirname, "data", `tokens-${os.hostname()}.json`),
	path.join(__dirname, "data", `sources-${os.hostname()}.json`),
	path.join(__dirname, "data", `otahistory-${os.hostname()}.json`),
	path.join(__dirname, "data", `uis-${os.hostname()}.json`),
];
dbs.forEach(file => {
	fs.chmod(file, 0o600 , err => {
		if(err) {
			t6console.warn(`- ${file} ${err ? "can't be chmoded" : "is 0600 now."}`);
		}
	});
});

t6console.info("Initializing Databases...");
dbLoadTime = new Date();
db = new loki(path.join(__dirname, "data", `db-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbMain});
dbRules = new loki(path.join(__dirname, "data", `rules-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbRules});
dbSnippets = new loki(path.join(__dirname, "data", `snippets-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbSnippets});
dbDashboards = new loki(path.join(__dirname, "data", `dashboards-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbDashboards});
dbTokens = new loki(path.join(__dirname, "data", `tokens-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbTokens});
dbSources = new loki(path.join(__dirname, "data", `sources-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbSources});
dbOtaHistory = new loki(path.join(__dirname, "data", `otahistory-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbOtaHistory});
dbUis = new loki(path.join(__dirname, "data", `uis-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbUis});

t6console.info("Loading routes...");
routesLoadTime = new Date();
var index			= require("./routes/index");
var objects			= require("./routes/objects");
var dashboards		= require("./routes/dashboards");
var snippets		= require("./routes/snippets");
var rules			= require("./routes/rules");
var mqtts			= require("./routes/mqtts");
var users			= require("./routes/users");
var data			= require("./routes/data");
var flows			= require("./routes/flows");
var units			= require("./routes/units");
var datatypes		= require("./routes/datatypes");
var pwa				= require("./routes/pwa");
var notifications	= require("./routes/notifications");
var ifttt			= require("./routes/ifttt");
var ota				= require("./routes/ota");
var sources			= require("./routes/sources");
var uis				= require("./routes/uis");
var news			= require("./routes/news");
var exploration		= require("./routes/exploration");
app					= express();
routesLoadEndTime = new Date();
t6console.info(`Routes loaded in ${routesLoadEndTime-routesLoadTime}ms.`);

var CrossDomain = function(req, res, next) {
	if (req.method == "OPTIONS") {
		//res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Content-Length, X-Requested-With");
		res.status(200).send("");
	} else {
		res.setHeader("X-Powered-By", appName+"@"+version);
		//res.header("Access-Control-Allow-Origin", "*");
		res.header("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Content-Length, X-Requested-With");
		res.header("Feature-Policy", "accelerometer: 'none'; unsized-media: 'none'; ambient-light-sensor: 'self'; camera: 'none'; encrypted-media: 'none'; fullscreen: 'self'; geolocation: 'self'; gyroscope: 'none'; magnetometer: 'none'; picture-in-picture: 'self'; microphone: 'none'; sync-xhr: 'self'; usb: 'none'; vr: 'none'");
		res.header("Referrer-Policy", "strict-origin-when-cross-origin");
		res.header("Strict-Transport-Security", "max-age=5184000; includeSubDomains");
		res.header("X-Frame-Options", "SAMEORIGIN");
		res.header("X-Content-Type-Options", "nosniff");
		if (req.url.match(/^\/(css|js|img|font)\/.+/)) {
			res.setHeader("Cache-Control", "public, max-age=3600");
		}
		next();
	}
};

app.use(CrossDomain);
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
app.use("/v"+version, index);
app.use("/v"+version+"/users", users);
app.use("/v"+version+"/objects", objects);
app.use("/v"+version+"/dashboards", dashboards);
app.use("/v"+version+"/rules", rules);
app.use("/v"+version+"/mqtts", mqtts);
app.use("/v"+version+"/snippets", snippets);
app.use("/v"+version+"/flows", flows);
app.use("/v"+version+"/data", data);
app.use("/v"+version+"/units", units);
app.use("/v"+version+"/datatypes", datatypes);
app.use("/v"+version+"/notifications", notifications);
app.use("/v"+version+"/ifttt", ifttt);
app.use("/v"+version+"/ota", ota);
app.use("/v"+version+"/sources", sources);
app.use("/v"+version+"/uis", uis);
app.use("/v"+version+"/exploration", exploration);
app.use("/news", news);
app.use("/", pwa);
t6console.info("App is instanciated.");

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

if ( logLevel.indexOf("DEBUG") > -1 ) {
	request.debug = true;
}
if (app.get("env") === "development") {
	app.use(function(err, req, res, next) {
		if (err.name === "UnauthorizedError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token "+err.message, "stack": err.stack });
			res.end();
		} else if (err.name === "TokenExpiredError") {
			res.status(410).send({ "code": err.status, "error": "Unauthorized: expired token "+err.message, "stack": err.stack });
			res.end();
		} else if (err.name === "JsonWebTokenError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token "+err.message, "stack": err.stack });
			res.end();
		} else if (err.name === "NotBeforeError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token "+err.message, "stack": err.stack });
			res.end();
		} else {
			res.status(err.status || 500).send({ "code": err.status, "error": err.message, "stack": err.stack });
			res.end();
		}
		t6console.error(err.status + err.name);
		t6events.add("t6App", `Error ${err.status} ${err.name}`, "self", t6BuildVersion);
	});
} else {
	app.use(function(err, req, res, next) {
		if (err.name === "UnauthorizedError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token" }).end();
		} else if (err.name === "TokenExpiredError") {
			res.status(410).send({ "code": err.status, "error": "Unauthorized: expired token" }).end();
		} else if (err.name === "JsonWebTokenError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token" }).end();
		} else if (err.name === "NotBeforeError") {
			res.status(401).send({ "code": err.status, "error": "Unauthorized: invalid token" }).end();
		} else {
			res.status(err.status || 500).send({ "code": err.status, "error": err.message }).end();
		}
		t6console.error(err.status + err.name);
		t6events.add("t6App", `Error ${err.status} ${err.name}`, "self", t6BuildVersion);
	});
}

t6events.add("t6App", "start", "self", t6BuildVersion);
t6console.log(`${appName} has started and is listening to ${process.env.BASE_URL_HTTPS}.`);

mqttClient = mqtt.connect({ port: mqttPort, host: mqttHost, keepalive: 10000 });
mqttClient.on("connect", function () {
	t6mqtt.publish(null, mqttInfo, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": "Hello mqtt, "+appName+" just have started. :-)", "environment": process.env.NODE_ENV}), false);
	t6console.log(sprintf("Connected to Mqtt broker on %s:%s - %s", mqttHost, mqttPort, mqttRoot));
	mqttClient.subscribe("objects/status/#", function (err) {
		if (!err) {
			t6console.log("Subscribed to Mqtt topic \"objects/status/#\"");
		}
	})
});
mqttClient.on("message", function (topic, message) {
	let object = topic.toString().split("objects/status/")[1];
	let stat = message.toString();
	t6console.log(sprintf("Object Status Changed: %s is %s", object, stat==="1"?"visible":"hidden"), "("+message+")");
	if ( stat === "1" && t6ConnectedObjects.indexOf(object)<0 ) {
		t6ConnectedObjects.push(object);
	} else {
		let i = t6ConnectedObjects.indexOf(object);
		if (i > -1) {
			t6ConnectedObjects.splice(i, 1);
		}
	}
	t6console.log(sprintf("Connected Objects: %s", t6ConnectedObjects));
});
global.startProcessTime = new Date()-start;
t6console.log(sprintf("Start process duration: %ss.", (startProcessTime)/1000));
module.exports = app;
/*
 * 
 * 
 */
var express				= require("express");
var timeout				= require("connect-timeout");
var morgan				= require("morgan");
var cookieParser		= require("cookie-parser");
var bodyParser			= require("body-parser");
var bearer				= require("bearer");
var pug					= require("pug");
var compression			= require("compression");

global.bcrypt			= require("bcrypt");
global.crypto			= require("crypto");
global.expressJwt		= require("express-jwt");
global.session			= require("express-session");
global.fs				= require("fs");
global.geoip			= require("geoip-lite");
global.jwt				= require("jsonwebtoken");
global.loki				= require("lokijs");
global.passgen			= require("passgen");
global.path				= require("path");
global.md5				= require("md5");
global.moment			= require("moment");
global.mqtt				= require("mqtt");
global.uuid				= require("node-uuid");
global.nodemailer		= require("nodemailer");
global.os				= require("os");
global.qrCode			= require("qrcode-npm");
global.request			= require("request");
global.serialport		= require("serialport");
global.favicon			= require("serve-favicon");
global.FileStore		= require("session-file-store")(session);
global.sprintf			= require("sprintf-js").sprintf;
global.strength			= require("strength");
global.stringformat		= require("string-format");
global.util				= require("util");
global.useragent		= require("useragent");
global.webpush			= require("web-push");

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
global.t6events.setMeasurement("events");
global.t6events.setRP("autogen");
global.algorithm		= "aes-256-cbc";
global.t6ConnectedObjects = [];

/* Environment settings */
require(sprintf("./data/settings-%s.js", os.hostname()));
if( db_type.influxdb === true ) {
	var influx		= require("influx");
	var dbString	= influxSettings.protocol+"://"+influxSettings.host+":"+influxSettings.port+"/"+influxSettings.database;
	dbInfluxDB		= new influx.InfluxDB(dbString);
	t6console.info("Activating influxdb: "+dbString);
}

/* Logging */
var error = fs.createWriteStream(logErrorFile, { flags: "a" });
process.stdout.write = process.stderr.write = error.write.bind(error);
process.on("uncaughtException", function(err) {
	t6console.error((err && err.stack) ? err.stack : err);
});
t6console.info(sprintf("Starting %s v%s", appName, VERSION));
t6console.info(sprintf("Using node v%s", process.versions.node));
t6console.info(sprintf("Setting Access Logs to %s", logAccessFile));
t6console.info(sprintf("Setting Error Logs to %s", logErrorFile));

t6console.info("Initializing Database...");
/* Main Database settings */
db = new loki(path.join(__dirname, "data", "db-"+os.hostname()+".json"), {autoload: true, autosave: true});
//db.loadDatabase({}, function() {
	if ( db.getCollection("objects") === null ) {
		t6console.warn("- Collection Objects is failing");
	}
	if ( db.getCollection("flows") === null ) {
		t6console.warn("- Collection Flows is failing");
	}
	if ( db.getCollection("users") === null ) {
		t6console.warn("- Collection Users is failing");
	}
	if ( db.getCollection("tokens") === null ) {
		t6console.warn("- Collection Keys is failing");
	}
	if ( db.getCollection("units") === null ) {
		t6console.warn("- Collection Units is failing");
	}
	if ( db.getCollection("datatypes") === null ) {
		t6console.warn("- Collection Datatypes is failing");
	}
	if ( db.getCollection("users") === null ) {
		t6console.warn("- Collection Users is failing");
	}
	t6console.info("- Db Main is loaded");
//});

/* Rules settings */
dbRules = new loki(path.join(__dirname, "data", "rules-"+os.hostname()+".json"), {autoload: true, autosave: true});
//dbRules.loadDatabase({}, function() {
	if ( dbRules === null ) {
		t6console.warn("db Rules is failing");
	}
	if ( dbRules.getCollection("rules") === null ) {
		t6console.warn("- Collection Rules is failing");
	}
	t6console.info("- Db Rules is loaded");
//});

/* Snippets settings */
dbSnippets = new loki(path.join(__dirname, "data", "snippets-"+os.hostname()+".json"), {autoload: true, autosave: true});
//dbSnippets.loadDatabase({}, function() {
	if ( dbSnippets === null ) {
		console.warn("db Snippets is failing");
	}
	if ( dbSnippets.getCollection("snippets") === null ) {
		t6console.warn("- Collection Snippets is failing");
	}
	t6console.info("- Db Snippets is loaded");
//});

/* Dashboards settings */
dbDashboards = new loki(path.join(__dirname, "data", "dashboards-"+os.hostname()+".json"), {autoload: true, autosave: true});
//dbDashboards.loadDatabase({}, function() {
	if ( dbDashboards === null ) {
		t6console.warn("db Dashboards is failing");
	}
	if ( dbDashboards.getCollection("dashboards") === null ) {
		t6console.warn("- Collection Dashboards is failing");
	}
	t6console.info("- Db Dashboards is loaded");
//});

/* Tokens settings */
dbTokens = new loki(path.join(__dirname, "data", "tokens-"+os.hostname()+".json"), {autoload: true, autosave: true});
//dbTokens.loadDatabase({}, function() {
	if ( dbTokens === null ) {
		t6console.warn("db Tokens is failing");
	}
	if ( dbTokens.getCollection("tokens") === null ) {
		t6console.warn("- Collection Tokens is failing");
	}
	t6console.info("- Db Tokens is loaded");
//});

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
app					= express();

var CrossDomain = function(req, res, next) {
	if (req.method == "OPTIONS") {
		//res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Content-Length, X-Requested-With");
		res.status(200).send("");
	}
	else {
		res.setHeader("X-Powered-By", appName+"@"+version);
		//res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Content-Length, X-Requested-With");
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
app.use("/", pwa);

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

if (app.get("env") === "development") {
	request.debug = true;
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
	});
}
t6events.add("t6App", "start", "self");
t6console.info(sprintf("%s has started and listening to %s (using Build-Version=%s)", appName, process.env.BASE_URL_HTTPS, t6BuildVersion));

mqttClient = mqtt.connect({ port: mqttPort, host: mqttHost, keepalive: 10000 });
mqttClient.on("connect", function () {
	mqttClient.publish(mqttInfo, JSON.stringify({"dtepoch": moment().format("x"), message: "Hello mqtt, "+appName+" just have started. :-)", environment: process.env.NODE_ENV}), {retain: false});
	t6console.info(sprintf("Connected to Mqtt broker on %s:%s - %s", mqttHost, mqttPort, mqttRoot));
	mqttClient.subscribe("objects/status/#", function (err) {
		if (!err) {
			t6console.info("Subscribed to Mqtt topic \"objects/status/#\"");
		}
	})
});
mqttClient.on("message", function (topic, message) {
	let object = topic.toString().split("objects/status/")[1];
	let stat = message.toString();
	t6console.info(sprintf("Object Status Changed: %s is %s", object, stat==="1"?"connected":"disconnected"), "("+message+")");
	if ( stat === "1" && t6ConnectedObjects.indexOf(object)<0 ) {
		t6ConnectedObjects.push(object);
	} else {
		let i = t6ConnectedObjects.indexOf(object);
		if (i > -1) {
			t6ConnectedObjects.splice(i, 1);
		}
	}
	t6console.info(sprintf("Connected Objects: %s", t6ConnectedObjects));
})

module.exports = app;
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

annotate = function(user_id, from_ts, to_ts, flow_id, category_id) {
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
	t6events.addStat("t6Api", "annotation add", newAnnotation.id, user_id);
	annotations.insert(newAnnotation);
	return newAnnotation;
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
global.monitor			= require("./t6monitor");

global.async			= require("async");
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
global.jwt				= require("jsonwebtoken");
global.nmap				= require("libnmap");
global.Loess			= require("loess");
global.loki				= require("lokijs");
global.passgen			= require("passgen");
global.md5				= require("md5");
global.moment			= require("moment");
global.mqtt				= require("mqtt");
global.nodeunits		= require("node-units");
global.uuid				= require("uuid");
global.nodemailer		= require("nodemailer");
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
global.util				= require("util");
global.useragent		= require("useragent");
global.validator		= require("validator");
global.webpush			= require("web-push");
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
t6console.log("===========================================================");

str2bool = function(v) {
	return [true, "yes", "true", "t", "1", "y", "yeah", "on", "yup", "certainly", "uh-huh"].indexOf(v)>-1?true:false;
};

var initDbRules = function() {
	if ( db_rules === null ) {
		t6console.error("db Rules is failing");
	}
	if ( db_rules.getCollection("rules") === null ) {
		t6console.error("- Collection Rules is failing");
		db_rules.addCollection("rules");
	} else {
		global.rules = db_rules.getCollection("rules");
		t6console.log(db_rules.getCollection("rules").count(), "resources in Rules collection.");
	}
};
var initDbSnippets = function() {
	if ( dbSnippets === null ) {
		t6console.error("db Snippets is failing");
	}
	if ( dbSnippets.getCollection("snippets") === null ) {
		t6console.error("- Collection Snippets is failing");
	} else {
		t6console.log(dbSnippets.getCollection("snippets").count(), "resources in Snippets collection.");
	}
};
var initDbDashboards = function() {
	if ( dbDashboards === null ) {
		t6console.error("db Dashboards is failing");
	}
	if ( dbDashboards.getCollection("dashboards") === null ) {
		t6console.error("- Collection Dashboards is failing");
	} else {
		t6console.log(dbDashboards.getCollection("dashboards").count(), "resources in Dashboards collection.");
	}
};
var initDbSources = function() {
	if ( dbSources === null ) {
		t6console.error("db Sources is failing");
	}
	if ( dbSources.getCollection("sources") === null ) {
		t6console.error("- Collection Sources is failing");
	} else {
		t6console.log(dbSources.getCollection("sources").count(), "resources in Sources collection.");
	}
};
var initDbOtaHistory = function() {
	if ( dbOtaHistory === null ) {
		t6console.error("db OtaHistory is failing");
	}
	if ( dbOtaHistory.getCollection("otahistory") === null ) {
		t6console.error("- Collection OtaHistory is failing");
	} else {
		t6console.log(dbOtaHistory.getCollection("otahistory").count(), "resources in OtaHistory collection.");
	}
};
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
var initDbJobs = function() {
	if ( db_jobs === null ) {
		t6console.error("db Jobs is failing");
	}
	if ( db_jobs.getCollection("jobs") === null ) {
		t6console.error("- Collection Jobs is created");
		db_jobs.addCollection("jobs");
	} else {
		global.jobs = db_jobs.getCollection("jobs");
		t6console.log(db_jobs.getCollection("jobs").count(), "resources in Jobs collection.");
	}
};
var initDbFusionBuffer = function() {
	if ( dbFusionBuffer === null ) {
		t6console.error("db FusionBuffer is failing");
	}
	if ( dbFusionBuffer.getCollection("measures") === null ) {
		t6console.error("- Collection FusionBuffer is failing");
	} else {
		t6console.log(dbFusionBuffer.getCollection("measures").count(), "resources in FusionBuffer collection.");
	}
};
var initDbFlows = function() {
	if ( db_flows === null ) {
		t6console.error("db flows is failing");
	}
	if ( db_flows.getCollection("flows") === null ) {
		t6console.error("- Collection flows is created");
		db_flows.addCollection("flows");
	} else {
		global.flows = db_flows.getCollection("flows");
		t6console.log(db_flows.getCollection("flows").count(), "resources in flows collection.");
	}
};
var initDbObjects = function() {
	if ( db_objects === null ) {
		t6console.error("db objects is failing");
	}
	if ( db_objects.getCollection("objects") === null ) {
		t6console.error("- Collection objects is created");
		db_objects.addCollection("objects");
	} else {
		global.objects = db_objects.getCollection("objects");
		t6console.log(db_objects.getCollection("objects").count(), "resources in objects collection.");
	}
};
var initDbUsers = function() {
	if ( db_users === null ) {
		t6console.error("db users is failing");
	}
	if ( db_users.getCollection("users") === null ) {
		t6console.error("- Collection users is created");
		db_users.addCollection("users");
	} else {
		global.users = db_users.getCollection("users");
		t6console.log(db_users.getCollection("users").count(), "resources in users collection.");
		
		/* One shot Db cleaning */
		/*
		t6console.debug("Cleaning Database for Users");
		(global.users).chain().update(
			function(user){
				delete user.data;
				delete user.quotausage;
				delete user.quota;
				delete user.permissions;
				user.subscription = {
					"changePassword": (typeof user.unsubscription!=="undefined" && typeof user.unsubscription.changePassword!=="undefined")?null:user.subscription_date,
					"newsletter": (typeof user.unsubscription!=="undefined" && typeof user.unsubscription.newsletter!=="undefined")?null:user.subscription_date,
					"monthlyreport": (typeof user.unsubscription!=="undefined" && typeof user.unsubscription.monthlyreport!=="undefined")?null:user.subscription_date,
					"reminder": (typeof user.unsubscription!=="undefined" && typeof user.unsubscription.reminder!=="undefined")?null:user.subscription_date,
				}
				// reminderMail => date à laquelle un reminder email à été envoyé
			}
		);
		db_users.save();
		t6console.debug(global.users.data[0]);
		*/
		/* One shot Db cleaning */
	}
};
var initDbAccessTokens = function() {
	if ( db_access_tokens === null ) {
		t6console.error("db AccessTokens is failing");
	}
	if ( db_access_tokens.getCollection("accesstokens") === null ) {
		t6console.error("- Collection AccessTokens is failing");
		db_access_tokens.addCollection("accesstokens");
	} else {
		global.access_tokens = db_access_tokens.getCollection("accesstokens");
		let expired = access_tokens.find( { "$and": [ { "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } }]} );
		if ( expired ) { access_tokens.remove(expired); db_access_tokens.save(); }
		t6console.log(db_access_tokens.getCollection("accesstokens").count(), "resources in AccessTokens collection.");
	}
};
var initDbTokens = function() {
	if ( db_tokens === null ) {
		t6console.error("db tokens is failing");
	}
	if ( db_tokens.getCollection("tokens") === null ) {
		t6console.error("- Collection tokens is created");
		db_tokens.addCollection("tokens");
	} else {
		global.tokens = db_tokens.getCollection("tokens");
		let expired = tokens.find( { "$and": [ { "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } }]} );
		if ( expired ) { tokens.remove(expired); db_tokens.save(); }
		t6console.log(db_tokens.getCollection("tokens").count(), "resources in tokens collection.");
	}
};
var initDbStories = function() {
	if ( db_stories === null ) {
		t6console.error("db stories is failing");
	}
	if ( db_stories.getCollection("stories") === null ) {
		t6console.error("- Collection stories is created");
		db_stories.addCollection("stories");
	} else {
		global.stories = db_stories.getCollection("stories");
		t6console.log(db_stories.getCollection("stories").count(), "resources in Stories collection.");
	}
};
var initDbUnits = function() {
	if ( db_units === null ) {
		t6console.error("db units is failing");
	}
	if ( db_units.getCollection("units") === null ) {
		t6console.error("- Collection units is created");
		db_units.addCollection("units");
	} else {
		global.units = db_units.getCollection("units");
		t6console.log(db_units.getCollection("units").count(), "resources in units collection.");
	}
};
var initDbDatatypes = function() {
	if ( db_datatypes === null ) {
		t6console.error("db datatypes is failing");
	}
	if ( db_datatypes.getCollection("datatypes") === null ) {
		t6console.error("- Collection datatypes is created");
		db_datatypes.addCollection("datatypes");
	} else {
		global.datatypes = db_datatypes.getCollection("datatypes");
		t6console.log(db_datatypes.getCollection("datatypes").count(), "resources in datatypes collection.");
	}
};
var initDbClassifications = function() {
	if ( db_classifications === null ) {
		t6console.error("db classifications is failing");
	}
	if ( db_classifications.getCollection("categories") === null ) {
		t6console.error("- Collection categories is created");
		db_classifications.addCollection("categories");
	} else {
		global.categories = db_classifications.getCollection("categories");
		t6console.log(db_classifications.getCollection("categories").count(), "resources in categories collection.");
	}
	if ( db_classifications.getCollection("annotations") === null ) {
		t6console.error("- Collection annotations is created");
		db_classifications.addCollection("annotations");
	} else {
		global.annotations = db_classifications.getCollection("annotations");
		t6console.log(db_classifications.getCollection("annotations").count(), "resources in annotations collection.");
	}
};

t6console.info("Setting correct permission on Databases...");
let dbs = [
	path.join(__dirname, "data", `db-${os.hostname()}.json`),
	path.join(__dirname, "data", `snippets-${os.hostname()}.json`),
	path.join(__dirname, "data", `dashboards-${os.hostname()}.json`),
	path.join(__dirname, "data", `sources-${os.hostname()}.json`),
	path.join(__dirname, "data", `otahistory-${os.hostname()}.json`),
	path.join(__dirname, "data", `uis-${os.hostname()}.json`),
	path.join(__dirname, "data", `fusion-buffer-${os.hostname()}.json`),
	
	path.join(__dirname, "data", `t6db-accessTokens__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-datatypes__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-flows__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-jobs__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-objects__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-rules__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-tokens__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-users__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-units__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-classifications__${os.hostname()}.json`),
	path.join(__dirname, "data", `t6db-stories__${os.hostname()}.json`),
];
dbs.forEach((file) => {
	fs.chmod(file, 0o600 , (err) => {
		if(err) {
			t6console.warn(`- ${file} ${err ? "can't be chmoded" : "is 0600 now."}`);
		}
	});
});

t6console.info("Initializing Databases...");
dbLoadTime = new Date();

global.db_objects = new loki(path.join(__dirname, "data", `t6db-objects__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbObjects});
global.db_flows = new loki(path.join(__dirname, "data", `t6db-flows__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbFlows});
global.db_users = new loki(path.join(__dirname, "data", `t6db-users__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbUsers});
global.db_tokens = new loki(path.join(__dirname, "data", `t6db-tokens__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbTokens});
global.db_access_tokens = new loki(path.join(__dirname, "data", `t6db-accessTokens__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbAccessTokens});
global.db_units = new loki(path.join(__dirname, "data", `t6db-units__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbUnits});
global.db_datatypes = new loki(path.join(__dirname, "data", `t6db-datatypes__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbDatatypes});
global.db_rules = new loki(path.join(__dirname, "data", `t6db-rules__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbRules});
global.db_classifications = new loki(path.join(__dirname, "data", `t6db-classifications__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbClassifications});

dbSnippets = new loki(path.join(__dirname, "data", `snippets-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbSnippets});
dbDashboards = new loki(path.join(__dirname, "data", `dashboards-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbDashboards});
dbSources = new loki(path.join(__dirname, "data", `sources-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbSources});
dbOtaHistory = new loki(path.join(__dirname, "data", `otahistory-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbOtaHistory});
dbUis = new loki(path.join(__dirname, "data", `uis-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbUis});
db_jobs = new loki(path.join(__dirname, "data", `t6db-jobs__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbJobs});
db_stories = new loki(path.join(__dirname, "data", `t6db-stories__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbStories});
dbFusionBuffer = new loki(path.join(__dirname, "data", `fusion-buffer-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: initDbFusionBuffer});

if(dbTelegraf) {
	t6console.log(`Activated telegraf for writing: ${dbStringTelegraf}`);
}
if(dbInfluxDB) {
	t6console.log(`Activated influxdb for reading: ${dbStringInfluxDB}`);
	t6console.log("Retention Policies :");
	t6console.log("-requests:", `${influxSettings.retentionPolicies.requests}`);
	t6console.log("-events:", `${influxSettings.retentionPolicies.events}`);
	t6console.log("-data:",  `${influxSettings.retentionPolicies.data}`);
}
t6console.log("===========================================================");

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
var stories			= require("./routes/stories");
var uis				= require("./routes/uis");
var news			= require("./routes/news");
var exploration		= require("./routes/exploration");
var jobs			= require("./routes/jobs");
var classifications	= require("./routes/classifications");
app					= express();
if(enableMonitoring) {
	monitor(app);
	t6console.log(`${appName} is being monitored.`);
}
app.set("port", process.env.PORT);
app.listen(process.env.PORT, () => {
	t6events.addStat("t6App", "start", "self", t6BuildVersion);
	t6console.log("App is instanciated.");
	t6console.log(`${appName} started / listening to ${baseUrl_https}.`);
})

routesLoadEndTime = new Date();
t6console.log(`Modules load time: ${moduleLoadEndTime-moduleLoadTime}ms`);
t6console.log(`Routes loaded in ${routesLoadEndTime-routesLoadTime}ms.`);
var CrossDomain = function(req, res, next) {
	if (req.method === "OPTIONS") {
		//res.header("Access-Control-Allow-Origin", req.header("origin") || "*");
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Content-Length, X-Requested-With");
		res.status(200).send("");
	} else {
		//res.header("Access-Control-Allow-Origin", req.header("origin") || "*");
		res.header("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Content-Length, X-Requested-With");
		res.header("Feature-Policy", "accelerometer: 'none'; unsized-media: 'none'; ambient-light-sensor: 'self'; camera: 'none'; encrypted-media: 'none'; fullscreen: 'self'; geolocation: 'self'; gyroscope: 'none'; magnetometer: 'none'; picture-in-picture: 'self'; microphone: 'none'; sync-xhr: 'self'; usb: 'none'; vr: 'none'");
		res.header("Referrer-Policy", "origin-when-cross-origin");
		res.header("Strict-Transport-Security", "max-age=5184000; includeSubDomains");
		res.header("X-Frame-Options", "SAMEORIGIN");
		res.header("X-Content-Type-Options", "nosniff");
		if (req.url.match(/^\/(css|js|img|font|woff2)\/.+/)) {
			res.setHeader("Cache-Control", `public, max-age=${30*24*3600}`);
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
app.use("/v"+version+"/stories", stories);
app.use("/v"+version+"/uis", uis);
app.use("/v"+version+"/exploration", exploration);
app.use("/v"+version+"/jobs", jobs);
app.use("/v"+version+"/classifications", classifications);
app.use("/news", news);
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

mqttClient = mqtt.connect({ port: mqttPort, host: mqttHost, keepalive: 10000 });
mqttClient.on("connect", function () {
	t6mqtt.publish(null, mqttInfo, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": "Hello mqtt, "+appName+" just have started. :-)", "environment": process.env.NODE_ENV}), false);
	t6console.log("===========================================================");
	t6console.log(sprintf("Connected to Mqtt broker on %s:%s - %s", mqttHost, mqttPort, mqttRoot));
	mqttClient.subscribe("objects/status/#", function (err) {
		if (!err) {
			t6console.log("Subscribed to Mqtt topic \"objects/status/#\"");
		}
	});
});
mqttClient.on("message", function (topic, message) {
	let object = topic.toString().split("objects/status/")[1];
	let stat = message.toString();
	t6console.info(sprintf("Object Status Changed: %s is %s", object, stat==="1"?"visible":"hidden"), "("+message+")");
	if ( stat === "1" && t6ConnectedObjects.indexOf(object)<0 ) {
		t6ConnectedObjects.push(object);
	} else {
		let i = t6ConnectedObjects.indexOf(object);
		if (i > -1) {
			t6ConnectedObjects.splice(i, 1);
		}
	}
	t6console.info(sprintf("Connected Objects: %s", t6ConnectedObjects));
});
global.startProcessTime = new Date()-start;

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
t6console.log(sprintf("Start process duration: %ss.", (startProcessTime)/1000));
t6console.log("===========================================================");
module.exports = app;
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
global.expressJwt		= require("express-jwt");
global.jwt				= require("jsonwebtoken");
global.crypto			= require("crypto");
global.favicon			= require("serve-favicon");
global.request			= require("request");
global.path				= require("path");	
global.mqtt				= require("mqtt");
global.loki				= require("lokijs");
global.sprintf			= require("sprintf-js").sprintf;
global.moment			= require("moment");
global.passgen			= require("passgen");
global.md5				= require("md5");
global.bcrypt			= require("bcrypt");
global.squel			= require("squel");
global.uuid				= require("node-uuid");
global.os				= require("os");
global.qrCode			= require("qrcode-npm");
global.fs				= require("fs");
global.util				= require("util");
global.geoip			= require("geoip-lite");
global.device			= require("device");
global.useragent		= require("useragent");
global.strength			= require("strength");
global.stringformat		= require("string-format");
global.serialport		= require("serialport");

global.VERSION			= require("./package.json").version;
global.appName			= require("./package.json").name;
global.t6decisionrules	= require('./t6decisionrules');
global.t6mqtt			= require('./t6mqtt');
global.t6mailer			= require('./t6mailer');
global.t6events			= require('./t6events');
global.t6events.setMeasurement('events');
global.t6events.setRP('autogen');

/* Environment settings */
require(sprintf('./data/settings-%s.js', os.hostname()));
if ( db_type.sqlite3 == true ) {
	var sqlite3	= require('sqlite3').verbose();
	dbSQLite3		= new sqlite3.Database(SQLite3Settings);
	console.log('Activating sqlite3');
}
if( db_type.influxdb == true ) {
	var influx		= require('influx');
	var dbString	= influxSettings.protocol+'://'+influxSettings.host+':'+influxSettings.port+'/'+influxSettings.database;
	dbInfluxDB		= new influx.InfluxDB(dbString);
	console.log('Activating influxdb: '+dbString);
}

/* Logging */
var error = fs.createWriteStream(logErrorFile, { flags: 'a' });
process.stdout.write = process.stderr.write = error.write.bind(error);
process.on('uncaughtException', function(err) {
	console.error(moment().format('MMMM Do YYYY, H:mm:ss'), (err && err.stack) ? err.stack : err);
});
console.log(sprintf('%s Starting %s v%s', moment().format('MMMM Do YYYY, H:mm:ss'), appName, VERSION));
console.log(sprintf('%s Using node v%s', moment().format('MMMM Do YYYY, H:mm:ss'), process.versions.node));
console.log(moment().format('MMMM Do YYYY, H:mm:ss'), 'Setting Access Logs to', logAccessFile);
console.log(moment().format('MMMM Do YYYY, H:mm:ss'), 'Setting Error Logs to', logErrorFile);

console.log(moment().format('MMMM Do YYYY, H:mm:ss'), 'Initializing Database...');
/* Main Database settings */
db = new loki(path.join(__dirname, 'data', 'db-'+os.hostname()+'.json'), {autoload: true, autosave: true});
//db.loadDatabase({}, function() {
	if ( db.getCollection('objects') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Objects is failing');
	if ( db.getCollection('flows') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Flows is failing');
	if ( db.getCollection('users') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Users is failing');
	if ( db.getCollection('tokens') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Keys is failing');
	if ( db.getCollection('units') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Units is failing');
	if ( db.getCollection('datatypes') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Datatypes is failing');
	if ( db.getCollection('users') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Users is failing');
	console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Db Main is loaded');
//});

/* Rules settings */
dbRules = new loki(path.join(__dirname, 'data', 'rules-'+os.hostname()+'.json'), {autoload: true, autosave: true});
//dbRules.loadDatabase({}, function() {
	if ( dbRules === null ) console.log('db Rules is failing');
	if ( dbRules.getCollection('rules') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Rules is failing');
	console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Db Rules is loaded');
//});

/* Snippets settings */
dbSnippets = new loki(path.join(__dirname, 'data', 'snippets-'+os.hostname()+'.json'), {autoload: true, autosave: true});
//dbSnippets.loadDatabase({}, function() {
	if ( dbSnippets === null ) console.error('db Snippets is failing');
	if ( dbSnippets.getCollection('snippets') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Snippets is failing');
	console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Db Snippets is loaded');
//});

/* Dashboards settings */
dbDashboards = new loki(path.join(__dirname, 'data', 'dashboards-'+os.hostname()+'.json'), {autoload: true, autosave: true});
//dbDashboards.loadDatabase({}, function() {
	if ( dbDashboards === null ) console.log('db Dashboards is failing');
	if ( dbDashboards.getCollection('dashboards') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Dashboards is failing');
	console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Db Dashboards is loaded');
//});

/* Tokens settings */
dbTokens = new loki(path.join(__dirname, 'data', 'tokens-'+os.hostname()+'.json'), {autoload: true, autosave: true});
//dbTokens.loadDatabase({}, function() {
	if ( dbTokens === null ) console.log('db Tokens is failing');
	if ( dbTokens.getCollection('tokens') === null ) console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Collection Tokens is failing');
	console.error(moment().format('MMMM Do YYYY, H:mm:ss'), '- Db Tokens is loaded');
//});

var index			= require('./routes/index');
var objects			= require('./routes/objects');
var dashboards		= require('./routes/dashboards');
var snippets		= require('./routes/snippets');
var rules			= require('./routes/rules');
var mqtts			= require('./routes/mqtts');
var users			= require('./routes/users');
var data			= require('./routes/data');
var flows			= require('./routes/flows');
var units			= require('./routes/units');
var datatypes		= require('./routes/datatypes');
var pwa				= require('./routes/pwa');
var notifications	= require('./routes/notifications');
app					= express();

var CrossDomain = function(req, res, next) {
	if (req.method == 'OPTIONS') {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, Content-Length, X-Requested-With');
		res.status(200).send('');
	}
	else {
		res.setHeader('X-Powered-By', appName+'@'+version);
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, Content-Length, X-Requested-With');
		if (req.url.match(/^\/(css|js|img|font)\/.+/)) {
			res.setHeader('Cache-Control', 'public, max-age=3600');
		}
		next();
	}
};

app.use(CrossDomain);
app.enable('trust proxy');
app.use(compression());
app.use(morgan(logFormat, {stream: fs.createWriteStream(logAccessFile, {flags: 'a'})}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(timeout(timeoutDuration));
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.disable('x-powered-by');
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');
app.use(session(sessionSettings));
app.use(express.static(path.join(__dirname, '/public'), staticOptions));
app.use(express.static(path.join(__dirname, '/docs'), staticOptions));
app.use('/.well-known', express.static(path.join(__dirname, '/.well-known'), staticOptions));
app.use('/v'+version, index);
app.use('/v'+version+'/users', users);
app.use('/v'+version+'/objects', objects);
app.use('/v'+version+'/dashboards', dashboards);
app.use('/v'+version+'/rules', rules);
app.use('/v'+version+'/mqtts', mqtts);
app.use('/v'+version+'/snippets', snippets);
app.use('/v'+version+'/flows', flows);
app.use('/v'+version+'/data', data);
app.use('/v'+version+'/units', units);
app.use('/v'+version+'/datatypes', datatypes);
app.use('/v'+version+'/notifications', notifications);
app.use('/', pwa);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	res.status(err.status || 500).render(""+err.status, {
		title : 'Not Found',
		user: req.session.user,
		currentUrl: req.path,
		err: app.get('env')==='development'?err:{status: err.status, stack: err.stack}
	});
	//next(err);
});

if (app.get('env') === 'development') {
	request.debug = true;
	app.use(function(err, req, res, next) {
		console.log("DEBUG in development", req.headers.authorization);
		if (err.name === 'UnauthorizedError') {
			res.status(401).send({ 'code': err.status, 'error': 'Unauthorized: invalid token...'+err.message, 'stack': err.stack });
			res.end();
		} else if (err.name === 'TokenExpiredError') {
			res.status(410).send({ 'code': err.status, 'error': 'Unauthorized: expired token...'+err.message, 'stack': err.stack });
			res.end();
		} else if (err.name === 'JsonWebTokenError') {
			res.status(401).send({ 'code': err.status, 'error': 'Unauthorized: invalid token...'+err.message, 'stack': err.stack });
			res.end();
		} else if (err.name === 'NotBeforeError') {
			res.status(401).send({ 'code': err.status, 'error': 'Unauthorized: invalid token...'+err.message, 'stack': err.stack });
			res.end();
		} else {
			res.status(err.status || 500).send({ 'code': err.status, 'error': err.message, 'stack': err.stack });
			res.end();
		}
	});
} else {
	app.use(function(err, req, res, next) {
		if (err.name === 'UnauthorizedError') {
			res.status(401).send({ 'code': err.status, 'error': 'Unauthorized: invalid token' }).end();
		} else if (err.name === 'TokenExpiredError') {
			res.status(410).send({ 'code': err.status, 'error': 'Unauthorized: expired token' }).end();
		} else if (err.name === 'JsonWebTokenError') {
			res.status(401).send({ 'code': err.status, 'error': 'Unauthorized: invalid token' }).end();
		} else if (err.name === 'NotBeforeError') {
			res.status(401).send({ 'code': err.status, 'error': 'Unauthorized: invalid token' }).end();
		} else {
			res.status(err.status || 500).send({ 'code': err.status, 'error': err.message }).end();
		}
	});
}

t6events.add('t6App', 'start', 'self');
console.log(sprintf('%s %s has started and listening to %s', moment().format('MMMM Do YYYY, H:mm:ss'), appName, process.env.BASE_URL_HTTPS));

mqtt_client = mqtt.connect('mqtt://'+mqtt_host+':'+mqtt_port);
mqtt_client.on("connect", function () {
	mqtt_client.publish(mqtt_info, JSON.stringify({"dtepoch": moment().format('x'), message: "Hello mqtt, "+appName+" just have started. :-)", environment: process.env.NODE_ENV}), {retain: false});
	console.log(sprintf('%s Connected to Mqtt broker on %s:%s - %s', moment().format('MMMM Do YYYY, H:mm:ss'), mqtt_host, mqtt_port, mqtt_root));
});

module.exports = app;
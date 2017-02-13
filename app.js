/*
 * 
 * 
 */
var express			= require('express');
var timeout			= require('connect-timeout');
var morgan			= require('morgan');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var bearer			= require('bearer');
var jade			= require('jade');
var compression		= require('compression');
favicon				= require('serve-favicon');
request				= require('request');
path				= require('path');	
mqtt				= require('mqtt');
loki				= require('lokijs');
sprintf				= require('sprintf-js').sprintf;
moment				= require('moment');
passgen				= require('passgen');
md5					= require('md5');
squel				= require('squel');
uuid				= require('node-uuid');
os					= require('os');
qrCode				= require('qrcode-npm');
striptags			= require('striptags');
fs					= require('fs');
util				= require('util');

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

/* Main Database settings */
db	= new loki(path.join(__dirname, 'data', 'db-'+os.hostname()+'.json'), {autoload: true, autosave: true});
db.loadDatabase(path.join(__dirname, 'data', 'db-'+os.hostname()+'.json'));
if ( db === null ) console.log('db is failing');
if ( db.getCollection('objects') === null ) console.log('Collection Objects is failing');
if ( db.getCollection('flows') === null ) console.log('Collection Flows is failing');
if ( db.getCollection('users') === null ) console.log('Collection Users is failing');
if ( db.getCollection('tokens') === null ) console.log('Collection Keys is failing');

/* Rules settings */
dbRules	= new loki(path.join(__dirname, 'data', 'rules-'+os.hostname()+'.json'), {autoload: true, autosave: true});
dbRules.loadDatabase(path.join(__dirname, 'data', 'rules-'+os.hostname()+'.json'));
if ( dbRules === null ) console.log('db Rules is failing');
if ( dbRules.getCollection('rules') === null ) console.log('Collection Rules is failing');

/* Quota settings */
//dbQuota	= new loki(path.join(__dirname, 'data', 'quota-'+os.hostname()+'.json'), {autoload: true, autosave: true});
//dbQuota.loadDatabase(path.join(__dirname, 'data', 'quota-'+os.hostname()+'.json'));
//if ( dbQuota === null ) console.log('db Quota is failing');
//if ( dbQuota.getCollection('quota') === null ) console.log('Collection Quota is failing');

/* Snippets settings */
dbSnippets	= new loki(path.join(__dirname, 'data', 'snippets-'+os.hostname()+'.json'), {autoload: true, autosave: true});
dbSnippets.loadDatabase(path.join(__dirname, 'data', 'snippets-'+os.hostname()+'.json'));
if ( dbSnippets === null ) console.log('db Snippets is failing');
if ( dbSnippets.getCollection('snippets') === null ) console.log('db Snippets is failing');

/* Dashboards settings */
dbDashboards	= new loki(path.join(__dirname, 'data', 'dashboards-'+os.hostname()+'.json'), {autoload: true, autosave: true});
dbDashboards.loadDatabase(path.join(__dirname, 'data', 'dashboards-'+os.hostname()+'.json'));
if ( dbDashboards === null ) console.log('db Dashboards is failing');
if ( dbDashboards.getCollection('dashboards') === null ) console.log('Collection Dashboards is failing');

client.on("connect", function () {
	client.publish(mqtt_info, JSON.stringify({"dtepoch": moment().format('x'), message: "Hello mqtt, "+appName+" just have started. :-)"}), {retain: false});
});

var index			= require('./routes/index');
var objects			= require('./routes/objects');
var users			= require('./routes/users');
var data			= require('./routes/data');
var flows			= require('./routes/flows');
var units			= require('./routes/units');
var datatypes		= require('./routes/datatypes');
var www				= require('./routes/www');
var app				= express();

/* Logging */
console.log('Setting Access Logs to', logAccessFile);
console.log('Setting Error Logs to', logErrorFile);
var error = fs.createWriteStream(logErrorFile, { flags: 'a' });
process.stdout.write = process.stderr.write = error.write.bind(error);
process.on('uncaughtException', function(err) {
	console.error((err && err.stack) ? err.stack : err);
});

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
app.set('view engine', 'jade');
app.use(session(sessionSettings));
app.use(express.static(path.join(__dirname, '/public'), staticOptions));
app.use(express.static(path.join(__dirname, '/docs'), staticOptions));
app.use('/v'+version, index);
app.use('/v'+version+'/users', users);
app.use('/v'+version+'/objects', objects);
app.use('/v'+version+'/flows', flows);
app.use('/v'+version+'/data', data);
app.use('/v'+version+'/units', units);
app.use('/v'+version+'/datatypes', datatypes);
app.use('/', www);

app.use(function(req, res, next) {
	res.setHeader('X-Powered-By', appName+'@'+version);
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	if (req.url.match(/^\/(css|js|img|font)\/.+/)) {
		res.setHeader('Cache-Control', 'public, max-age=3600');
	}
	next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	res.status(err.status || 500).render(err.status, {
		title : 'Not Found',
		user: req.session.user,
		currentUrl: req.path,
		err: app.get('env')==='development'?err:{status: err.status, stack: null}
	});
	//next(err);
});

if (app.get('env') === 'development') {
	// development error handler
	app.use(function(err, req, res, next) {
		res.status(err.status || 500).send({ 'code': err.status, 'error': err.message, 'stack': err.stack }).end();
	});
} else {
	// production error handler
	app.use(function(err, req, res, next) {
		res.status(err.status || 500).send({ 'code': err.status, 'error': err.message }).end();
	});
}

module.exports = app;
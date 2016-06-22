/*
 * 
 * 
 */
var express			= require('express');
var timeout			= require('connect-timeout');
var logger			= require('morgan');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var bearer			= require('bearer');
var jade			= require('jade');
var compression		= require('compression');
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

/* Environment settings */
require(sprintf('./data/settings-%s.js', os.hostname()));
if ( db_type === "sqlite3" ) {
	var sqlite3	= require('sqlite3').verbose();
	dbSQLite3		= new sqlite3.Database(SQLite3Settings);
} else if( db_type === "influxdb" ) {
	var influx		= require('influx');
	dbInfluxDB	= influx(influxSettings);
}

var index			= require('./routes/index');
var objects			= require('./routes/objects');
var users			= require('./routes/users');
var data			= require('./routes/data');
var flows			= require('./routes/flows');
var units			= require('./routes/units');
var datatypes		= require('./routes/datatypes');
var modules			= require('./routes/modules');
var dashboard		= require('./routes/dashboard');
var app				= express();

client.on("connect", function () {
	client.publish(mqtt_info, JSON.stringify({"dtepoch": moment().format('x'), message: "Hello mqtt, "+appName+" just have started. :-)"}), {retain: false});
});

app.use(compression());
app.use(logger(logFormat));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(timeout('10s'));
app.disable('x-powered-by');

var staticOptions = {
    etag: true,
    maxAge: 86400000, //oneDay
};

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
app.use(session(sessionSettings));
app.use(express.static(path.join(__dirname, '/public'), staticOptions));
app.use('/v'+version, index);
app.use('/v'+version+'/users', users);
app.use('/v'+version+'/objects', objects);
app.use('/v'+version+'/flows', flows);
app.use('/v'+version+'/data', data);
app.use('/v'+version+'/units', units);
app.use('/v'+version+'/datatypes', datatypes);
app.use('/modules', modules);
app.use('/', dashboard);

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
	res.render(err.status, {
		title : 'Easy-IOT',
		user: req.session.user
	});
	next(err);
});

// development error handler
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500).send({ 'code': err.status, 'error': err.message, 'stack': err.stack });
	});
}

// production error handler
app.use(function(err, req, res, next) {
	res.status(err.status || 500).send({ 'code': err.status, 'error': err.message });
});

module.exports = app;
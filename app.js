/*
 * 
 * 
 */
var express			= require('express');
var timeout			= require('connect-timeout');
var path			= require('path');
var logger			= require('morgan');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var bearer			= require('bearer');
var mqtt			= require('mqtt');
var loki			= require('lokijs');
sprintf				= require('sprintf-js').sprintf;
moment				= require('moment');
passgen				= require('passgen');
squel				= require('squel');
uuid				= require('node-uuid');
os					= require('os');
client				= mqtt.connect('mqtt://192.168.0.7:1883');
mqtt_info			= 'couleurs/'+os.hostname()+'/api';
db_type				= 'sqlite3'; // sqlite3 | influxdb
version				= '2.0.1';
appName				= process.env.NAME;
baseUrl				= process.env.BASE_URL;


if ( db_type === "sqlite3" ) {
	var sqlite3	= require('sqlite3').verbose();
	dbSQLite3		= new sqlite3.Database(path.join(__dirname, 'data/data.db'));
} else if( db_type === "influxdb" ) {
	var influx		= require('influx');
	dbInfluxDB	= influx({ host : 'localhost', port : 8086, protocol : 'http', username : 'datawarehouse', password : 'datawarehouse', database : 'datawarehouse' });
}

db	= new loki(path.join(__dirname, 'data/db.json'), {autoload: true, autosave: true});
db.loadDatabase(path.join(__dirname, 'data/db.json'));

/* temporary debug */
console.log(uuid.v4());

var index			= require('./routes/index');
var objects			= require('./routes/objects');
var users			= require('./routes/users');
var data			= require('./routes/data');
var flows			= require('./routes/flows');
var units			= require('./routes/units');
var datatypes		= require('./routes/datatypes');
var app				= express();

client.on("connect", function () {
	client.publish(mqtt_info, JSON.stringify({"dtepoch": moment().format('x'), message: "Hello mqtt, "+appName+" just have started. :-)"}), {retain: false});
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(timeout('10s'));
app.disable('x-powered-by');
app.use(function (req, res, next) { res.setHeader('X-Powered-By', appName+'@'+version); next(); });

app.use(express.static(path.join(__dirname, '/public/www/production/')));
app.use('/v'+version, index);
app.use('/v'+version+'/users', users);
app.use('/v'+version+'/objects', objects);
app.use('/v'+version+'/flows', flows);
app.use('/v'+version+'/data', data);
app.use('/v'+version+'/units', units);
app.use('/v'+version+'/datatypes', datatypes);

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// development error handler
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.send({ 'code': err.status, 'error': err.message, 'stack': err.stack });
	});
}

// production error handler
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send({ 'code': err.status, 'error': err.message });
});

module.exports = app;

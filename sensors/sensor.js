'use strict';
var exec		= require('exec');
var moment		= require('moment');
var request		= require('request');
var exec		= require('child_process').exec;
var sprintf		= require('sprintf-js').sprintf;
var path		= require('path');
var os			= require('os');
var config		= require(sprintf('../data/sensors-%s', os.hostname()));
var argv		= require('minimist')(process.argv.slice(2));
console.log("Reading config from file: \""+sprintf('sensors-%s', os.hostname())+".js\".");
var auth = config.auth;
config = config.sensors[argv.run]!==undefined?config.sensors[argv.run]:null;

if ( argv.run === undefined ) {
	console.log('Please use the "--run" parameter to set your setting. e.g.:');
	console.log('$ nodejs '+path.join(__filename)+' --run "$configId"\n');
	process.exit(1);
}
if ( config === null ) {
	console.log('Config is not found for '+argv.run);
	process.exit(1);
}

var bearer		= '';
var timestamp = moment().format('x');

if ( config.exec ) {
	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	var df = exec(config.exec, function(error, stdout, stderr) {
	    if (error !== null) {
	    	console.log('exec error: ' + error + stderr);
	    	process.exit(1);
	    } else if( stdout ) {
	    	request({
	    		url: config.api+'authenticate',
	    		method: 'POST',
	    		json: true,
	    		headers: {
	    			'User-Agent': "t6 javascript file "+argv.run,
	    			'Accept': 'application/json',
	    			'Content-Type': 'application/json',
	    		},
	    		body: auth
	    	}, function (error, response, body) {
	    		bearer = body.token;
	    		if ( bearer && !error ) {
	    			var body = {flow_id: config.flow_id, value: stdout, timestamp: timestamp, publish: config.publish, save: config.save, unit: config.unit, mqtt_topic: config.mqtt_topic, };
	    	    	request({
	    	    		url: config.api+'data/',
	    	    		method: 'POST',
	    	    		json: true,
	    	    		headers: {
	    	    			'User-Agent': "t6 javascript file "+argv.run,
	    	    			'Accept': 'application/json',
	    	    			'Content-Type': 'application/json',
	    	    			'Authorization': 'Bearer '+bearer,
	    	    		},
	    	    		body: body
	    	    	}, function (error, response, body){
	    	    		console.log(response.headers.location);
	    	    	});
	    		} else {
	    	    	console.log('JWT error: ' + bearer);
	    	    	process.exit(1);
	    	    }
	    	});
	    } else {
	    	console.log('exec error: ' + error + stderr);
	    	process.exit(1);
	    }
	});
}
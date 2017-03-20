'use strict';
var exec		= require('exec');
var moment		= require('moment');
var request		= require('request');
var os			= require('os');
var exec		= require('child_process').exec;

var bearer		= '';
var api			= 'http://127.0.0.1:3000/v2.0.1/data/';
var flow_id		= '';
var publish		= true;
var save		= true;
var mqtt_topic	= '';
var unit		= 'byte';
var timestamp = moment().format('x');

var df = exec('df | grep \'dev/root\' | tail -1 | cut -d: -f2 | awk \'{ print $4}\' ORS=\'\'', function(error, stdout, stderr) {
    if (error !== null) {
    	//console.log('exec error: ' + error + stderr);
    } else if( stdout ) {
    	var body = {flow_id: flow_id, value:stdout, timestamp: timestamp, publish: publish, save: save, unit: unit, mqtt_topic: mqtt_topic};
    	//console.log(body);
    	request({
    		url: api,
    		method: 'POST',
    		json: true,
    		headers: {
    			'User-Agent': "t6 javascript file",
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
    			'Authorization': 'Bearer '+bearer,
    		},
    		body: body
    	}, function (error, response, body){
    		//console.log(response);
    	});
    } else {
    	//console.log('exec error: ' + error + stderr);
    }
});
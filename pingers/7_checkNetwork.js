'use strict';
var exec		= require('exec');
var moment		= require('moment');
var request		= require('request');
var os			= require('os');
var exec		= require('child_process').exec;
var sprintf		= require('sprintf-js').sprintf;

var bearer		= '!VQJUWMjxdurf5s&6!#9bnTWTK2&xze76B3wARNS4E-%!EwtA$mF+A3Hw+5Y+Mvw';
var api			= 'http://127.0.0.1:3000/v2.0.1/data/';
var flow_id		= '7'; // Data Logger
var publish		= true;
var save		= true;
var ipv4		= process.argv.slice(2);
var mqtt_topic	= 'couleurs/'+os.hostname()+'/checkNetwork/'+ipv4;
var unit		= 'Boolean'; // looks to fail with real Boolean value, need to post them as String with a value 'true' or 'false'
var timestamp	= moment().format('x');
if ( ipv4.length <= 0 ) process.exit(1);


var text;
var value;
var df = exec(sprintf('ping %s -c 1', ipv4), function(error, stdout, stderr) {
    if (error !== null) {
    	text = sprintf('%s is inactive in LAN.', ipv4);
        value = 'false'; // looks to fail with real Boolean value, need to post them as String with a value 'true' or 'false'
    } else if( stdout ) {
    	text = sprintf('%s is active in LAN.', ipv4);
        value = 'true'; // looks to fail with real Boolean value, need to post them as String with a value 'true' or 'false'
    }
	var body = {flow_id: flow_id, value:value, text: text, timestamp: timestamp, publish: publish, save: save, unit: unit, mqtt_topic: mqtt_topic};
	//console.log(body);
	request({
		url: api,
		method: 'POST',
		json: true,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer '+bearer,
		},
		body: body
	}, function (error, response, body){
		//console.log(body);
	});
});
'use strict';
var exec		= require('exec');
var moment		= require('moment');
var request		= require('request');
var yoctolib	= require('yoctolib');

var bearer		= '!VQJUWMjxdurf5s&6!#9bnTWTK2&xze76B3wARNS4E-%!EwtA$mF+A3Hw+5Y+Mvw';
var api			= 'http://127.0.0.1:3000/v2.0.1/data/';
var flow_id		= '5';
var publish		= true;
var save		= true;
var mqtt_topic	= 'couleurs/yoctovoc/voc';
var unit		= 'ppm';
var timestamp	= moment().format('x');

var YAPI = yoctolib.YAPI;
var YVoc = yoctolib.YVoc;

var res =YAPI.RegisterHub('http://192.168.0.7:4444/'); //127.0.0.1
var sensor;

if(process.argv.length < 3 ||  process.argv[2]=="any" ) {
    sensor  = YVoc.FirstVoc();   
    if (sensor==null ) {
        console.log("No module connected (check USB cable)\n");
        process.exit(1);
    }
} else {
    var target = process.argv[2];
    sensor  = YVoc.FindVoc(target+".voc");   
}

var value = '';
if(!sensor.isOnline()) {
    console.log("Module not connected (check identification and USB cable)\n");
    process.exit(1);
} else {
	value = sensor.get_currentValue();
	//console.log(value);
	
	request({
		url: api,
		method: 'POST',
		json: true,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer '+bearer,
		},
		body: {flow_id: flow_id, value:value, timestamp: timestamp, publish: publish, save: save, unit: unit, mqtt_topic: mqtt_topic}
	}, function (error, response, body){
		//console.log(body);
	});
}
#!/usr/bin/env nodejs

"use strict";
var exec		= require('exec');
var moment		= require('moment');
var request		= require('request');
var yoctolib	= require('yoctolib');
var YAPI = yoctolib.YAPI;
var YVoc = yoctolib.YVoc;

var res =YAPI.RegisterHub('http://192.168.0.22:4444/'); //127.0.0.1
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
	console.log(value);
    process.exit(0);
}
"use strict";
var os			= require("os");
var sprintf		= require("sprintf-js").sprintf;
var argv		= require("minimist")(process.argv.slice(2));
var defaultAPI = "http://127.0.0.1:3000/v2.0.1/";

var config = {
	/* JWT Auth */
		auth: { "api_key": "xxxxxxxxx", "api_secret": "xxxxxxxxx", "grant_type": "access_token" },
		// either you can also use our own credentials 
		//auth: { "username": "", "password": "", "grant_type": "password" },
	sensors: {
		"config-name-1": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "/freespace",
			"unit": "byte",
			"exec": 'df | grep \'dev/root\' | tail -1 | cut -d: -f2 | awk \'{ print $4}\' ORS=\'\''
		},
		"config-name-2": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "/hddtemp",
			"unit": "Float",
			"exec": "/usr/sbin/hddtemp -u C -n -q /dev/sda"
		},
		"config-name-3": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "/memory_usage",
			"unit": "%",
			'exec': 'ps aux | awk \'{sum +=$4}; END {print sum}\''
		},
		"config-name-4": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "/load_average",
			"unit": "%",
			'exec': 'uptime | awk -F\'load average:\' \'{ print $2}\'| awk -F\' \' \'{ print $3}\''
		},
		"config-name-5": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "yoctovoc/voc",
			"unit": "ppm",
			"exec": "./yoctovoc.js"
		},
		"config-name-6": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "/cpu_usage",
			"unit": "%",
			'exec': 'ps aux | awk \'{sum +=$3}; END {print sum}\''
		},
		"config-name-7": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "yahoo/temperature",
			"unit": "°C",
			"exec": "./meteoyahoo.js"
		},
		"config-name-8": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "/auth_log",
			"unit": "",
			"exec": "./authlogs.sh"
		},
		"config-name-9": {
			"api": defaultAPI,
			"flow_id": "<ADD_HERE-YOUR-FLOW_ID>",
			"publish": true,
			"save": true,
			"mqtt_topic": "/checkNetwork",
			"unit": "Boolean",
			"exec": sprintf("ping %s -c 1", argv._[0]) // nodejs sensor.js --run "7" 192.168.0.100
		},
	}
};

module.exports = config;
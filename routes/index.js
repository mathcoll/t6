'use strict';
var express = require('express');
var router = express.Router();

router.get('/status', function(req, res, next) {
	var status = {
		links: {
			root: {
				baseUrl: baseUrl,
				description: ''
			},
			users: {
				baseUrl: baseUrl+'/'+version+'/users',
				description: ''
			},
			data: {
				baseUrl: baseUrl+'/'+version+'/data',
				description: ''
			},
			objects: {
				baseUrl: baseUrl+'/'+version+'/objects',
				description: ''
			},
			datatypes: {
				baseUrl: baseUrl+'/'+version+'/datatypes',
				description: ''
			},
			flows: {
				baseUrl: baseUrl+'/'+version+'/flows',
				description: ''
			},
			units: {
				baseUrl: baseUrl+'/'+version+'/units',
				description: ''
			},
		},
		version: version,
		status: 'running',
		mqtt_info: mqtt_info,
		appName: process.env.NAME,
		started_at: moment(process.env.STARTED*1000).format('DD/MM/Y H:m:s'),
	};
	res.send(status);
});

module.exports = router;

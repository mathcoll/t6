'use strict';
var express = require('express');
var router = express.Router();



router.get('/authenticate', function (req, res) {
	// todo
	// should refresh the Bearer for 1 hour then Bearer is not valid anymore
});

router.get('/status', function(req, res, next) {
	var status = {
		links: {
			self: {
				baseUrl: baseUrl+'/status',
				description: 'Get Server status and basic documentation.',
				permissions: '',
				verbs: ['GET'],
			},
			users: {
				baseUrl: baseUrl+'/'+version+'/users',
				description: 'User API to create, modify or delete a user.',
				permissions: '',
				verbs: ['GET', 'POST', 'PUT', 'DELETE'],
			},
			data: {
				baseUrl: baseUrl+'/'+version+'/data',
				description: 'Data API to create, modify or delete data.',
				permissions: '',
				verbs: ['GET', 'POST'],
			},
			objects: {
				baseUrl: baseUrl+'/'+version+'/objects',
				description: 'Object API to create, modify or delete an object.',
				permissions: '',
				verbs: ['GET', 'POST', 'PUT', 'DELETE'],
			},
			datatypes: {
				baseUrl: baseUrl+'/'+version+'/datatypes',
				description: 'Datatype API to create, modify or delete a data-type.',
				permissions: '',
				verbs: ['GET', 'POST', 'PUT', 'DELETE'],
			},
			flows: {
				baseUrl: baseUrl+'/'+version+'/flows',
				description: 'Flow API to create, modify or delete a flow.',
				permissions: '',
				verbs: ['GET', 'POST', 'PUT', 'DELETE'],
			},
			units: {
				baseUrl: baseUrl+'/'+version+'/units',
				description: 'Unit API to create, modify or delete a unit.',
				permissions: '',
				verbs: ['GET'],
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

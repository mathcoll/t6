'use strict';
var express = require('express');
var router = express.Router();

//catch API calls for quotas
router.get('*', function (req, res, next) {
	var bearerHeader = req.headers['authorization'];
	if ( bearerHeader ) {
		var bearer = bearerHeader.split(" "); // TODO split with Bearer as prefix!
		req.session.bearer = { token: bearer[1], key: '' };
	} else {
		req.session.bearer = { token: req.session.bearer, key: req.session.key };
	}
	var o = {
		key: req.session.bearer.key,
		secret: req.session.bearer.secret,
		token: req.session.bearer.token,
		user_id: req.session.bearer.user_id,
	};
	console.log('API has been called on ');
	console.log(o);
	if( false ) {
		// TODO: when limit is reach
		//res.status(429).send(new ErrorSerializer({'id': 99, 'code': 429, 'message': 'Too Many Requests'}));
	} else {
		next();
	}
});

router.get('/authenticate', function (req, res) {
	// TODO
	// should refresh the Bearer for 1 hour then Bearer is not valid anymore
});

router.get('/status', function(req, res, next) {
	var status = {
		links: {
			self: {
				baseUrl: baseUrl+'/v'+version+'/status',
				description: 'Get Server status and basic documentation.',
				permissions: '',
				verbs: ['GET'],
			},
			users: {
				baseUrl: baseUrl+'/v'+version+'/users',
				description: 'User API to create, modify or delete a user.',
				permissions: '',
				verbs: ['GET', 'POST', 'PUT', 'DELETE'],
			},
			data: {
				baseUrl: baseUrl+'/v'+version+'/data',
				description: 'Data API to create, modify or delete data.',
				permissions: '',
				verbs: ['GET', 'POST'],
			},
			objects: {
				baseUrl: baseUrl+'/v'+version+'/objects',
				description: 'Object API to create, modify or delete an object.',
				permissions: '',
				verbs: ['GET', 'POST', 'PUT', 'DELETE'],
			},
			datatypes: {
				baseUrl: baseUrl+'/v'+version+'/datatypes',
				description: 'Datatype API to create, modify or delete a data-type.',
				permissions: '',
				verbs: ['GET', 'POST', 'PUT', 'DELETE'],
			},
			flows: {
				baseUrl: baseUrl+'/v'+version+'/flows',
				description: 'Flow API to create, modify or delete a flow.',
				permissions: '',
				verbs: ['GET', 'POST', 'PUT', 'DELETE'],
			},
			units: {
				baseUrl: baseUrl+'/v'+version+'/units',
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

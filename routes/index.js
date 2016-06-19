'use strict';
var express = require('express');
var router = express.Router();
var ErrorSerializer = require('../serializers/error');
var tokens;
var qt;

//catch API calls for quotas
router.all('*', function (req, res, next) {
	tokens	= db.getCollection('tokens');
	qt = dbQuota.getCollection('quota');
	var bearerHeader = req.headers['authorization'];
	if ( bearerHeader ) {
		var bearer = bearerHeader.split(" ");// TODO split with Bearer as prefix!
		req.token = bearer[1];
		req.bearer = tokens.findOne(
			{ '$and': [
	           {'token': { '$eq': req.token }},
	           {'expiration': { '$gte': moment().format('x') }},
			]}
		);
	}
	
	var o = {
		key:		req.bearer!==undefined?req.bearer.key:req.session.bearer!==undefined?req.session.bearer.key:null,
		secret:		req.bearer!==undefined?req.bearer.secret:req.session.bearer!==undefined?req.session.bearer.secret:null,
		user_id:	req.bearer!==undefined?req.bearer.user_id:req.session.bearer!==undefined?req.session.bearer.user_id:null,
		session_id:	req.bearer!==undefined?req.bearer.session_id:req.session.bearer!==undefined?req.session.bearer.session_id:null,
		verb:		req.method,
		url:		req.originalUrl,
		date:		moment().format('x')
	};
	
	var queryQ = { '$and': [
       {'user_id' : req.bearer!==undefined?req.bearer.user_id:req.session.bearer!==undefined?req.session.bearer.user_id:null},
       {'date': { '$gte': moment().subtract(7, 'days').format('x') }},
	]};
	var i = (qt.find(queryQ)).length;
	if( i >= quota.admin.calls ) { //TODO, not only Admins as role!
		res.status(429).send(new ErrorSerializer({'id': 99, 'code': 429, 'message': 'Too Many Requests'}));
	} else {
		qt.insert(o);
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
	res.status(200).send(status);
});

module.exports = router;

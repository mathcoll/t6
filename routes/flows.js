'use strict';
var express = require('express');
var router = express.Router();
var FlowSerializer = require('../serializers/flow');
var ErrorSerializer = require('../serializers/error');
var flows;
var users;
var tokens;

router.get('/:flow_id([0-9a-z\-]+)?', bearerAuthToken, function (req, res) {
	var results = Array();
	var flow_id = req.params.flow_id;
	if ( req.token !== undefined && req.user !== undefined ) {
		flows	= db.getCollection('flows');
		users	= db.getCollection('users');
		
		var permissions = (req.bearer.permissions);
		permissions.map(function(permission) {
			if ( permission.permission == '644' || permission.permission == '600' ) { // TODO: if Owner: then should be >= 4, etc ...
				var flow = flows.findOne({'id': permission.flow_id });
				if ( flow && flow_id && flow_id == permission.flow_id ) results.push(flow);
				else if ( flow && !flow_id ) results.push(flow);
			}
		});
		
		if ( results.length > 0 ) {
			res.status(200).send(new FlowSerializer(results).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({'id': 36, 'code': 404, 'message': 'Not Found'}).serialize());
		}	
	} else {
		res.status(401).send(new ErrorSerializer({'id': 37, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

router.post('/', bearerAuthToken, function (req, res) {
	flows	= db.getCollection('flows');
	/* Check for quota limitation */
	var queryQ = { 'user_id' : req.token.user_id };
	var i = (flows.find(queryQ)).length;
	if( i >= (quota[req.session.user.role]).flows ) {
		res.status(429).send(new ErrorSerializer({'id': 129, 'code': 429, 'message': 'Too Many Requests: Over Quota!'}).serialize());
	} else {
		if ( req.token !== undefined ) {
			var permission = req.body.permission!==undefined?req.body.permission:'600'; // default to Owner: Read+Write
			if ( permission < 600 ) {
				res.status(400).send(new ErrorSerializer({'id': 38, 'code': 400, 'message': 'Bad Request', details: 'Permission must be greater than 600!'}).serialize());
			} else {
				var flow_id = uuid.v4();
				var new_flow = {
					id:			flow_id,
					user_id:	req.token.user_id,
					name: 		req.body.name!==undefined?req.body.name:'unamed',
					data_type:	req.body.data_type!==undefined?req.body.data_type:'',
					unit:  		req.body.unit!==undefined?req.body.unit:'',
					theme:  	req.body.theme!==undefined?req.body.theme:'',
					permission:	permission,
					objects:	req.body.objects!==undefined?req.body.objects:new Array(),
				};
				flows.insert(new_flow);
				//console.log(flows);
				
				res.status(201).send({ 'code': 201, message: 'Created', flow: new FlowSerializer(new_flow).serialize() }); // TODO: missing serializer
			}
		}
	}
});

router.put('/:flow_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	if ( req.token !== undefined ) {
		var flow_id = req.params.flow_id;
		var permission = req.body.permission!==undefined?req.body.permission:undefined;
		if ( permission < 600 ) {
			res.status(400).send(new ErrorSerializer({'id': 39, 'code': 400, 'message': 'Bad Request', 'details': 'Permission must be greater than 600!'}).serialize());
		} else {
			flows	= db.getCollection('flows');
			var flow = flows.findOne( {'id': flow_id} );
			if ( flow ) {
				var flow_user_id = flow.user_id
				// Check if Token is allowed (write permission) to modify the Flow
				// Token can be from the Owner, the Group, or Other
				var permissions = (req.bearer.permissions);
				var p = permissions.filter(function(p) { // TODO /var/log/node/t6-error.log => TypeError: permissions.filter is not a function
				    return p.flow_id == flow_id; 
				})[0];
				var OwnerPerm = ((p.permission).split(''))[0];
				var GroupPerm = ((p.permission).split(''))[1]; // Not really used yet
				var OtherPerm = ((p.permission).split(''))[2];
				
				if ( (req.bearer.user_id == flow_user_id && OwnerPerm >= 4 ) || (req.bearer.user_id != flow_user_id && OtherPerm >= 4 ) ) { // TODO sur about that ????????
					var result;
					flows.findAndUpdate(
						function(i){return i.id==flow_id},
						function(item){
							item.name		= req.body.name!==undefined?req.body.name:item.name;
							item.unit		= req.body.unit!==undefined?req.body.unit:item.unit;
							item.data_type	= req.body.data_type!==undefined?req.body.data_type:item.data_type;
							item.permission	= permission!==undefined?permission:item.permission;
							item.objects	= req.body.objects!==undefined?req.body.objects:item.objects;
							result = item;
						}
					);
					//console.log(flows);
					if ( result !== undefined ) {
						db.save();
						res.status(200).send({ 'code': 200, message: 'Successfully updated', flow: new FlowSerializer(result).serialize() }); // TODO: missing serializer
					} else {
						res.status(404).send(new ErrorSerializer({'id': 40, 'code': 404, 'message': 'Not Found'}).serialize());
					}
				} else {
					res.status(403).send(new ErrorSerializer({'id': 41, 'code': 403, 'message': 'Forbidden'}).serialize());
				}
			} else {
				res.status(401).send(new ErrorSerializer({'id': 42, 'code': 401, 'message': 'Forbidden ??'}).serialize());
			}
		}
	}
});

router.delete('/:flow_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	// TODO
	// TODO: delete all data related to that flow?
	res.status(404).send(new ErrorSerializer({'id': 43, 'code': 404, 'message': 'Not Found', details: 'Not yet implemented... Sorry.'}).serialize());
});

function bearerAuth(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers['authorization'];
	users	= db.getCollection('users');
	if ( typeof bearerHeader !== 'undefined' ) {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;
		req.user = (users.find({'token': { '$eq': req.token }}))[0];
		next();
	} else {
		res.status(403).send(new ErrorSerializer({'id': 44, 'code': 403, 'message': 'Forbidden'}).serialize());
	}
}

function bearerAuthToken(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers['authorization'];
	tokens	= db.getCollection('tokens');
	users	= db.getCollection('users');
	if ( typeof bearerHeader !== 'undefined' || req.session.bearer ) {
		if ( req.session && !bearerHeader ) { // Login using the session
			req.user = req.session.user;
			req.token = req.session.token;
			req.bearer = req.session.bearer;
		} else {
			var bearer = bearerHeader.split(" ");// TODO split with Bearer as prefix!
			bearerToken = bearer[1];
			req.token = bearerToken;
			req.bearer = tokens.findOne(
				{ '$and': [
		           {'token': { '$eq': req.token }},
		           {'expiration': { '$gte': moment().format('x') }},
				]}
			);
		}
		
		if ( !req.bearer ) {
			res.status(403).send(new ErrorSerializer({'id': 45, 'code': 403, 'message': 'Forbidden'}).serialize());
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }}) ) { // TODO: in case of Session, should be removed !
				req.user.permissions = req.bearer.permissions;
				req.session.user = req.user;
				next();
			} else {
				res.status(404).send(new ErrorSerializer({'id': 46, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 44, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
}

module.exports = router;

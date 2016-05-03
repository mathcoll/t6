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
	if ( req.token !== undefined && req.user !== undefined) {
		flows	= db.getCollection('flows');
		users	= db.getCollection('users');
		
		var permissions = (req.bearer.permissions);
		permissions.map(function(permission) {
			if ( permission.permission == '644' ) { // TODO: if Owner: then should be >= 4, etc ...
				var flow = flows.findOne({'id': permission.flow_id });
				if ( flow && flow_id && flow_id == permission.flow_id ) results.push(flow);
				else if ( flow && !flow_id ) results.push(flow);
			}
		});
		
		if ( results.length > 0 ) {
			res.send(new FlowSerializer(results).serialize());
		} else {
			res.send(new ErrorSerializer({'id': 36, 'code': 404, 'message': 'Not Found'}).serialize(), 404);
		}	
	} else {
		res.send(new ErrorSerializer({'id': 37, 'code': 401, 'message': 'Unauthorized'}).serialize(), 401);
	}
});

router.post('/', bearerAuthToken, function (req, res) {
	if ( req.token !== undefined ) {
		var permission = req.body.permission!==undefined?req.body.permission:'600'; // default to Owner: Read+Write
		if ( permission < 600 ) {
			res.send(new ErrorSerializer({'id': 38, 'code': 400, 'message': 'Bad Request', details: 'Permission must be greater than 600!'}).serialize(), 400);
		} else {
			flows	= db.getCollection('flows');
			var flow_id = uuid.v4();
			var new_flow = {
				id:			flow_id,
				user_id:	req.token.user_id,
				name: 		req.body.name!==undefined?req.body.name:'unamed',
				data_type:	req.body.data_type!==undefined?req.body.data_type:'',
				unit:  		req.body.unit!==undefined?req.body.unit:'',
				permission:	permission,
				objects:	req.body.objects!==undefined?req.body.objects:new Array(),
			};
			flows.insert(new_flow);
			//console.log(flows);
			
			res.send({ 'code': 201, message: 'Created', flow: new FlowSerializer(new_flow).serialize() }, 201);
		}
	}
});

router.put('/:flow_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	if ( req.token !== undefined ) {
		var flow_id = req.params.flow_id;
		var permission = req.body.permission!==undefined?req.body.permission:undefined;
		if ( permission < 600 ) {
			res.send(new ErrorSerializer({'id': 39, 'code': 400, 'message': 'Bad Request', 'details': 'Permission must be greater than 600!'}).serialize(), 400);
		} else {
			flows	= db.getCollection('flows');
			var flow = flows.findOne( {'id': flow_id} );
			if ( flow ) {
				var flow_user_id = flow.user_id
				// Check if Token is allowed (write permission) to modify the Flow
				// Token can be from the Owner, the Group, or Other
				var permissions = (req.bearer.permissions);
				var p = permissions.filter(function(p) { 
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
						res.send({ 'code': 200, message: 'Successfully updated', flow: new FlowSerializer(result).serialize() }, 200);
					} else {
						res.send({ 'code': 404, message: 'Not Found' }, 404);
						res.send(new ErrorSerializer({'id': 40, 'code': 404, 'message': 'Not Found'}).serialize(), 404);
					}
				} else {
					res.send(new ErrorSerializer({'id': 41, 'code': 403, 'message': 'Forbidden'}).serialize(), 403);
				}
			} else {
				res.send(new ErrorSerializer({'id': 42, 'code': 401, 'message': 'Forbidden ??'}).serialize(), 401);
			}
		}
	}
});

router.delete('/:flow_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	// TODO
	// TODO: delete all data related to that flow?
	res.send(new ErrorSerializer({'id': 43, 'code': 404, 'message': 'Not Found', details: 'Not yet implemented... Sorry.'}).serialize(), 404);
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
		res.send(new ErrorSerializer({'id': 44, 'code': 403, 'message': 'Forbidden'}).serialize(), 403);
	}
}

function bearerAuthToken(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers['authorization'];
	tokens	= db.getCollection('tokens');
	users	= db.getCollection('users');
	if ( typeof bearerHeader !== 'undefined' ) {
		var bearer = bearerHeader.split(" ");// TODO split with Bearer as prefix!
		bearerToken = bearer[1];
		req.token = bearerToken;
		req.bearer = tokens.findOne(
			{ '$and': [
	           {'token': { '$eq': req.token }},
	           {'expiration': { '$gte': moment().format('x') }},
			]}
		);
		if ( !req.bearer ) {
			res.send(new ErrorSerializer({'id': 45, 'code': 403, 'message': 'Forbidden'}).serialize(), 403);
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }}) ) {
				req.user.permissions = req.bearer.permissions;
				next();
			} else {
				res.send(new ErrorSerializer({'id': 46, 'code': 404, 'message': 'Not Found'}).serialize(), 404);
			}
		}
	} else {
		res.send(new ErrorSerializer({'id': 44, 'code': 401, 'message': 'Unauthorized'}).serialize(), 401);
	}
}

module.exports = router;

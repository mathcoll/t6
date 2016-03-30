'use strict';
var express = require('express');
var router = express.Router();
var FlowSerializer = require('../serializers/flow');
var flows;
var users;

router.get('/', bearerAuth, function (req, res) {
	var results = Array();
	if ( req.token !== undefined && req.user !== undefined) {
		flows	= db.getCollection('flows');
		users	= db.getCollection('users');
		req.user.permissions.map(function(permission) {
			if ( permission.perm == 'r' || permission.perm == 'rw' ) { // TODO: if Owner: then should be >= 4, etc ...
				var f = flows.find( {id: permission.flow_id } );
				if ( f.length > 0 ) {
					f = f[0];
					results.push({ id: f.id, name: f.name, user_id: f.user_id, unit_id: f.unit_id, unit: f.unit, datatype: f.datatype, objects: f.objects, perm: f.perm });
				}
			}
		});		
	}
	if ( results.length > 0 ) {
		res.send(new FlowSerializer(results).serialize());
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
	}
});

router.get('/:flow_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	var flow_id = req.params.flow_id;
	var json;
	if ( req.token !== undefined ) {
		flows	= db.getCollection('flows');
		var query = {
			'$and': [
				// TODO: must have permission to read flow (at least) !
				{ 'id' : ''+flow_id },
			]
		};
		//console.log(query);
		json = flows.find(query);
	}
	if ( json.length > 0 ) {
		res.send(new FlowSerializer(json).serialize());
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
	}
});

router.post('/', bearerAuth, function (req, res) {
	if ( req.token !== undefined ) {
		var permission = req.body.permission!==undefined?req.body.permission:'600'; // default to Owner: Read+Write
		if ( permission < 600 ) {
			res.send({ 'code': 400, message: 'Bad Request', details: 'Permission must be greater than 600!' }, 400);
		} else {
			flows	= db.getCollection('flows');
			var flow_id = uuid.v4();
			var new_flow = {
				id:			flow_id,
				name: 		req.body.name!==undefined?req.body.name:'unamed',
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

router.put('/:flow_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	if ( req.token !== undefined ) {
		var flow_id = req.params.flow_id;
		var permission = req.body.permission!==undefined?req.body.permission:'600'; // default to Owner: Read+Write
		if ( permission < 600 ) {
			res.send({ 'code': 400, message: 'Bad Request', details: 'Permission must be greater than 600!' }, 400);
		} else {
			flows	= db.getCollection('flows');
			//console.log(flows);
			var result;
			flows.findAndUpdate(
				function(i){return i.id==flow_id},
				function(item){
					item.name		= req.body.name!==undefined?req.body.name:item.name;
					item.unit		= req.body.unit!==undefined?req.body.unit:item.unit;
					item.permission	= permission;
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
			}
		}
	}
});

router.delete('/:flow_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	//TODO
	res.send({ 'code': 404, message: 'Not Found', details: 'Not yet implemented... Sorry.' }, 404);
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
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
}

module.exports = router;

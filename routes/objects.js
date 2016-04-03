'use strict';
var express = require('express');
var router = express.Router();
var ObjectSerializer = require('../serializers/object');
var objects;
var users;
var tokens;

router.get('/', bearerAuthToken, function (req, res) {
	if ( req.token !== undefined ) {
		objects	= db.getCollection('objects');
		var json = new ObjectSerializer(objects.find({'user_id': { '$eq': req.user.id }})).serialize();
		if ( json !== undefined ) {
			res.send(json, 200);
		} else {
			res.send({ 'code': 404, message: 'Not Found' }, 404);
		}
	} else {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
});

router.get('/:object_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var object_id = req.params.object_id; //TODO: can be an Integer !!!
	if ( req.token !== undefined ) {
		objects	= db.getCollection('objects');
		var query = {
			'$and': [
				{ 'user_id' : req.user.id }, // returns only object from current user
				{ 'id' : object_id },
			]
		};
		var json = objects.find(query);
		//console.log(json);
		if ( json.length > 0 ) {
			res.send(new ObjectSerializer(json).serialize());
		} else {
			res.send({ 'code': 404, message: 'Not Found' }, 404);
		}
	} else {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
});

router.post('/', bearerAuthToken, function (req, res) {
	if ( req.token !== undefined ) {
		objects	= db.getCollection('objects');
		var new_object = {
			id:				uuid.v4(),
			type:  			req.body.type!==undefined?req.body.type:'default',
			name:			req.body.name!==undefined?req.body.name:'unamed',
			description:	req.body.description!==undefined?req.body.description:'',
			position: 	 	req.body.position!==undefined?req.body.position:'',
			ipv4:  			req.body.ipv4!==undefined?req.body.ipv4:'',
			ipv6:			req.body.ipv6!==undefined?req.body.ipv6:'',
			user_id:		req.user.id,
		};
		objects.insert(new_object);
		//console.log(objects);
		res.send({ 'code': 201, message: 'Created', object: new ObjectSerializer(new_object).serialize() }, 201);
	} else {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
});

router.put('/:object_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	if ( req.token !== undefined ) {
	var object_id = req.params.object_id;
		objects	= db.getCollection('objects');
		//console.log(objects);
		var result;
		objects.findAndUpdate(
			function(i){return i.id==object_id},
			function(item){
				item.type				= req.body.type!==undefined?req.body.type:item.type;
				item.name				= req.body.name!==undefined?req.body.name:item.name;
				item.description		= req.body.description!==undefined?req.body.description:item.description;
				item.position			= req.body.position!==undefined?req.body.position:item.position;
				item.ipv4				= req.body.ipv4!==undefined?req.body.ipv4:item.ipv4;
				item.ipv6				= req.body.ipv6!==undefined?req.body.ipv6:item.ipv6;
				result = item;
			}
		);
		//console.log(objects);
		db.save();
		res.send({ 'code': 200, message: 'Successfully updated', object: new ObjectSerializer(result).serialize() }, 200);
	} else {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
});

router.delete('/:object_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var object_id = req.params.object_id; //TODO: can be an Integer !!!
	if ( req.token !== undefined ) {
		objects	= db.getCollection('objects');
		var query = {
			'$and': [
				{ 'user_id' : req.user.id }, // delete only object from current user
				{ 'id' : object_id },
			]
		};
		var o = objects.find(query);
		//console.log(o);
		if ( o.length > 0 ) {
			objects.remove(o);
			db.saveDatabase();
			res.send({ 'code': 200, message: 'Successfully deleted', removed_id: object_id }, 200); // TODO: missing serializer
		} else {
			res.send({ 'code': 404, message: 'Not Found' }, 404);
		}
	} else {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
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
			res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }}) ) {
				req.user.permissions = req.bearer.permissions;
				next();
			} else {
				res.send({ 'code': 404, 'error': 'Not Found' }, 404);
			}
		}
	} else {
		res.send({ 'code': 401, 'error': 'Unauthorized' }, 401);
	}
}

module.exports = router;

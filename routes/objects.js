'use strict';
var express = require('express');
var router = express.Router();
var ObjectSerializer = require('../serializers/object');
var ErrorSerializer = require('../serializers/error');
var objects;
var users;
var tokens;

router.get('/(:object_id([0-9a-z\-]+))?', bearerAuthToken, function (req, res) {
	var object_id = req.params.object_id;
	var name = req.query.name;
	if ( req.token !== undefined ) {
		objects	= db.getCollection('objects');
		var query;
		if ( object_id !== undefined ) {
			query = {
			'$and': [
					{ 'user_id' : req.user.id },
					{ 'id' : object_id },
				]
			};
		} else {
			if ( name !== undefined ) {
				query = {
				'$and': [
						{ 'user_id' : req.user.id },
						{ 'name': { '$regex': [name, 'i'] } }
					]
				};
			} else {
				query = {
				'$and': [
						{ 'user_id' : req.user.id },
					]
				};
			}
		}
		var json = objects.find(query);
		//console.log(query);
		if ( json.length > 0 ) {
			res.status(200).send(new ObjectSerializer(json).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({'id': 27, 'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({'id': 28, 'code': 403, 'message': 'Forbidden'}).serialize());
	}
});

router.post('/', bearerAuthToken, function (req, res) {
	objects	= db.getCollection('objects');
	/* Check for quota limitation */
	var queryQ = { 'user_id' : req.user.id };
	var i = (objects.find(queryQ)).length;
	if( i >= (quota[req.session.user.role]).objects ) {
		res.status(429).send(new ErrorSerializer({'id': 129, 'code': 429, 'message': 'Too Many Requests: Over Quota!'}).serialize());
	} else {
		if ( req.token !== undefined ) {
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
			res.status(201).send({ 'code': 201, message: 'Created', object: new ObjectSerializer(new_object).serialize() });
		} else {
			res.status(403).send(new ErrorSerializer({'id': 29, 'code': 403, 'message': 'Forbidden'}).serialize());
		}
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
		res.status(200).send({ 'code': 200, message: 'Successfully updated', object: new ObjectSerializer(result).serialize() });
	} else {
		res.status(403).send(new ErrorSerializer({'id': 30, 'code': 403, 'message': 'Forbidden'}).serialize());
	}
});

router.delete('/:object_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var object_id = req.params.object_id;
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
			res.status(200).send({ 'code': 200, message: 'Successfully deleted', removed_id: object_id }); // TODO: missing serializer
		} else {
			res.status(404).send(new ErrorSerializer({'id': 31, 'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({'id': 32, 'code': 403, 'message': 'Forbidden'}).serialize());
	}
});

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
			res.status(403).send(new ErrorSerializer({'id': 33, 'code': 403, 'message': 'Forbidden'}).serialize());
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }}) ) { // TODO: in case of Session, should be removed !
				req.user.permissions = req.bearer.permissions;
				req.session.user = req.user;
				next();
			} else {
				res.status(404).send(new ErrorSerializer({'id': 34, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 35, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
}

module.exports = router;

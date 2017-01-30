'use strict';
var express = require('express');
var router = express.Router();
var ObjectSerializer = require('../serializers/object');
var ErrorSerializer = require('../serializers/error');
var objects;
var users;
var tokens;

/**
 * @api {get} /objects/:object_id Get Object(s)
 * @apiName Get Object(s)
 * @apiGroup Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * @apiParam {String} [name] Object Name you want to search for; this is using an case-insensitive regexp
 * 
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
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

/**
 * @api {post} /objects Add an Object
 * @apiName Add an Object
 * @apiGroup Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Object Name
 * @apiParam {String} [type=default] Object Type, to customize icon on the List
 * @apiParam {String{1024}} [description] Object Description
 * @apiParam {String} [position] Object Location Name
 * @apiParam {String} [longitude] Object Location Longitude
 * @apiParam {String} [latitude] Object Location Latitude
 * @apiParam {String} [ipv4] Object IP v4
 * @apiParam {String} [ipv6] Object IP v6
 * @apiParam {Boolean} [isPublic=false] Flag to allow dedicated page to be viewable from anybody
 * 
 * @apiUse 403
 * @apiUse 429
 */
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
				description:	req.body.description!==undefined?(req.body.description).substring(0, 1024):'',
				position: 	 	req.body.position!==undefined?req.body.position:'',
				longitude:		req.body.longitude!==undefined?req.body.longitude:'',
				latitude:		req.body.latitude!==undefined?req.body.latitude:'',
				isPublic:		req.body.isPublic!==undefined?req.body.isPublic:'false',
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

/**
 * @api {put} /objects/:object_id Edit an Object
 * @apiName Edit an Object
 * @apiGroup Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * @apiParam {String} [name] Object Name
 * @apiParam {String} [type] Object Type, to customize icon on the List
 * @apiParam {String{1024}} [description] Object Description
 * @apiParam {String} [position] Object Location Name
 * @apiParam {String} [longitude] Object Location Longitude
 * @apiParam {String} [latitude] Object Location Latitude
 * @apiParam {String} [ipv4] Object IP v4
 * @apiParam {String} [ipv6] Object IP v6
 * @apiParam {Boolean} [isPublic=false] Flag to allow dedicated page to be viewable from anybody
 * 
 * @apiUse 403
 */
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
				item.description		= req.body.description!==undefined?(req.body.description).substring(0, 1024):item.description;
				item.position			= req.body.position!==undefined?req.body.position:item.position;
				item.longitude			= req.body.longitude!==undefined?req.body.longitude:item.longitude;
				item.latitude			= req.body.latitude!==undefined?req.body.latitude:item.latitude;
				item.isPublic			= req.body.isPublic!==undefined?req.body.isPublic:item.isPublic;
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

/**
 * @api {delete} /objects Delete an Object
 * @apiName Delete an Object
 * @apiGroup Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * 
 * @apiUse 403
 * @apiUse 404
 */
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

/**
 * @api {put} /objects/:object_id/:pName Edit Object Custom Parameter
 * @apiName Edit Object Custom Parameter
 * @apiGroup Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * @apiParam {String} pName Customer Parameter Name
 * @apiParam {String} value Customer Parameter Value
 * 
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 */
router.put('/:object_id([0-9a-z\-]+)/:pName/?', bearerAuthToken, function (req, res) {
	var object_id = req.params.object_id;
	var pName = req.params.pName;
	if ( !object_id ) {
		res.status(405).send(new ErrorSerializer({'id': 33, 'code': 405, 'message': 'Method Not Allowed'}).serialize());
	}
	if ( !req.bearer.user_id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({'id': 34, 'code': 401, 'message': 'Not Authorized'}).serialize());
	} else {
		var permissionsObjects = (req.bearer.permissionsObjects);
		var p;
		if ( permissionsObjects ) {
			p = permissionsObjects.filter(function(p) {
			    return p.object_id == object_id; 
			})[0];
		}
	}
	if ( p!== undefined && (p.permission == '644' || p.permission == '620' || p.permission == '600') ) { // TODO
		/*
		Sample Content:
		http://127.0.0.1:3000/v2.0.1/objects/3e48c1e0-ea98-4987-b6af-92258117e964/pName/
		{"value": "foobar"}
		*/
		if ( object_id && req.token !== undefined && req.body.value !== undefined ) {
			objects	= db.getCollection('objects');
			var query = {
				'$and': [
						{ 'user_id' : req.user.id },
						{ 'id' : object_id },
					]
				};
			var object = objects.findOne(query);
			
			if ( object ) {
				var p = object.parameters.filter(function(e, i) { if ( e.name == pName ) { object.parameters[i].value = req.body.value; return e; } });
				if ( p !== null ) {
					db.saveDatabase();
					res.status(201).send({ 'code': 201, message: 'Success', name: pName, value: p[0].value });
				} else {
					res.status(404).send(new ErrorSerializer({'id': 320, 'code': 404, 'message': 'Not Found'}).serialize());
				}
			} else {
				res.status(404).send(new ErrorSerializer({'id': 321, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		} else {
			res.status(403).send(new ErrorSerializer({'id': 322, 'code': 403, 'message': 'Forbidden'}).serialize());
		}
	} else {
		// no permission
		res.status(401).send(new ErrorSerializer({'id': 35, 'code': 401, 'message': 'Not Authorized'}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/:pName Get Object Custom Parameter
 * @apiName Get Object Custom Parameter
 * @apiGroup Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * @apiParam {String} pName Customer Parameter Name
 * 
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 */
router.get('/:object_id([0-9a-z\-]+)/:pName/?', bearerAuthToken, function (req, res) {
	var object_id = req.params.object_id;
	var pName = req.params.pName;
	if ( !object_id ) {
		res.status(405).send(new ErrorSerializer({'id': 36, 'code': 405, 'message': 'Method Not Allowed'}).serialize());
	}
	if ( !req.bearer.user_id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({'id': 37, 'code': 401, 'message': 'Not Authorized'}).serialize());
	} else {
		var permissionsObjects = (req.bearer.permissionsObjects);
		var p;
		if ( permissionsObjects ) {
			p = permissionsObjects.filter(function(p) {
			    return p.object_id == object_id; 
			})[0];
		}
	}
	if ( p!== undefined && (p.permission == '644' || p.permission == '620' || p.permission == '600') ) { // TODO
		if ( object_id && req.token !== undefined ) {
			objects	= db.getCollection('objects');
			var query = {
				'$and': [
						{ 'user_id' : req.user.id },
						{ 'id' : object_id },
					]
				};
			var object = objects.findOne(query);
			
			if ( object ) {
				var p = object.parameters.filter(function(e) { if ( e.name == pName ) { return e; } });
				if ( p !== null && p[0] ) {
					res.status(200).send({ 'code': 200, message: 'Success', name: pName, value: p[0].value });
				} else {
					res.status(404).send(new ErrorSerializer({'id': 38, 'code': 404, 'message': 'Not Found'}).serialize());
				}
			} else {
				res.status(404).send(new ErrorSerializer({'id': 39, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		} else {
			res.status(403).send(new ErrorSerializer({'id': 40, 'code': 403, 'message': 'Forbidden'}).serialize());
		}
	} else {
		// no permission
		res.status(401).send(new ErrorSerializer({'id': 41, 'code': 401, 'message': 'Not Authorized'}).serialize());
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

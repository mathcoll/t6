'use strict';
var express = require("express");
var router = express.Router();
var UnitSerializer = require("../serializers/unit");
var ErrorSerializer = require("../serializers/error");
var units;
var users;
var tokens;

/**
 * @api {get} /units/:unit_id Get Unit(s)
 * @apiName Get Unit(s)
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiParam {uuid-v4} [unit_id] Unit ID
 * 
 * @apiUse 200
 * @apiUse 404
 */
router.get('/(:unit_id([0-9a-z\-]+))?', function (req, res, next) {
	var json;
	var unit_id = req.params.unit_id;
	var type = req.query.type;
	units	= db.getCollection('units');
	if ( type === undefined ) {
		if ( unit_id === undefined ) {
			json = units.find();
		} else {
			json = units.find({ 'id': unit_id });
		}
	} else {
		json = units.find({'type': { '$eq': type }});
	}

	json = json.length>0?json:[];
	res.status(200).send(new UnitSerializer(json).serialize());
});

/**
 * @api {post} /units Create a Unit
 * @apiName Create a Unit
 * @apiGroup 7. Admin User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {String} [name=unamed] Unit Name
 * @apiParam {String} [format=''] Unit Format
 * @apiParam {String} [type=''] Unit Type
 * 
 * @apiUse 201
 * @apiUse 401
 */
router.post('/', bearerAdmin, function (req, res) {
	if ( req.token ) {
		units	= db.getCollection('units');
		//console.log(units);
		var new_unit = {
			id: uuid.v4(),
			name:	req.body.name!==undefined?req.body.name:'unamed',
			format:	req.body.format!==undefined?req.body.format:'',
			type:	req.body.type!==undefined?req.body.type:'',
		};
		units.insert(new_unit);
		//console.log(units);
		
		res.header('Location', '/v'+version+'/units/'+new_unit.id);
		res.status(201).send({ 'code': 201, message: 'Created', unit: new UnitSerializer(new_unit).serialize() }, 201);
	} else {
		res.status(401).send(new ErrorSerializer({'id': 18, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

/**
 * @api {put} /units/:unit_id Edit a Unit
 * @apiName Edit a Unit
 * @apiGroup 7. Admin User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {uuid-v4} unit_id Unit ID
 * @apiParam {String} [name] Unit Name
 * @apiParam {String} [format] Unit Format
 * @apiParam {String} [type] Unit Type
 * 
 * @apiUse 200
 * @apiUse 401
 */
router.put('/:unit_id([0-9a-z\-]+)', bearerAdmin, function (req, res) {
	if ( req.token ) {
		var unit_id = req.params.unit_id;
		units	= db.getCollection('units');
		//console.log(units);
		var result;
		units.findAndUpdate(
			function(i){return i.id==unit_id},
			function(item){
				item.name		= req.body.name!==undefined?req.body.name:item.name;
				item.format		= req.body.format!==undefined?req.body.format:item.format;
				item.type		= req.body.type!==undefined?req.body.type:item.type;
				result = item;
			}
		);
		db.save();
		
		res.header('Location', '/v'+version+'/units/'+unit_id);
		res.status(200).send({ 'code': 200, message: 'Successfully updated', unit: new UnitSerializer(result).serialize() });
	} else {
		res.status(401).send(new ErrorSerializer({'id': 19, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

/**
 * @api {delete} /units/:unit_id Delete a Unit
 * @apiName Delete a Unit
 * @apiGroup 7. Admin User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {uuid-v4} unit_id Unit ID
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 */
router.delete('/:unit_id([0-9a-z\-]+)', bearerAdmin, function (req, res) {
	if ( req.token ) {
		var unit_id = req.params.unit_id;
		units	= db.getCollection('units');
		var u = units.find({'id': { '$eq': unit_id }});
		//console.log(u);
		if (u) {
			units.remove(u);
			db.save();
			res.status(200).send({ 'code': 200, message: 'Successfully deleted', removed_id: unit_id }); // TODO: missing serializer
		} else {
			res.status(404).send(new ErrorSerializer({'id': 20, 'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 21, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

function bearerAdmin(req, res, next) {
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
			res.status(403).send(new ErrorSerializer({'id': 22, 'code': 431, 'message': 'Forbidden'}).serialize());
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }, 'role': 'admin'}) ) {
				next();
			} else {
				res.status(404).send(new ErrorSerializer({'id': 23, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 24, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
}

module.exports = router;

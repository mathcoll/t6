'use strict';
var express = require('express');
var router = express.Router();
var UnitSerializer = require('../serializers/unit');
var ErrorSerializer = require('../serializers/error');
var units;
var users;
var tokens;

router.get('/', function (req, res) {
	var type = req.query.type;
	units = db.getCollection('units');
	if ( type === undefined ) {
		var json = new UnitSerializer(units.find()).serialize();
		res.send(json);
	} else {
		var json = new UnitSerializer(units.find({'type': { '$eq': type }})).serialize();
		res.send(json);
	}
});

router.get('/:unit_id([0-9a-z\-]+)', function (req, res) {
	var unit_id = req.params.unit_id;
	units	= db.getCollection('units');
	var json = units.find({ 'id': { '$eq': unit_id } });
	console.log(json);
	if ( json.length > 0 ) {
		res.send(new UnitSerializer(json).serialize(), 200);
	} else {
		res.send(new ErrorSerializer({'id': 17, 'code': 404, 'message': 'Not Found'}).serialize(), 404);
	}
});

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
		res.send({ 'code': 201, message: 'Created', unit: new UnitSerializer(new_unit).serialize() }, 201);
	} else {
		res.send(new ErrorSerializer({'id': 18, 'code': 401, 'message': 'Unauthorized'}).serialize(), 401);
	}
});

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
		res.send({ 'code': 200, message: 'Successfully updated', unit: new UnitSerializer(result).serialize() }, 200);
	} else {
		res.send(new ErrorSerializer({'id': 19, 'code': 401, 'message': 'Unauthorized'}).serialize(), 401);
	}
});

router.delete('/:unit_id([0-9a-z\-]+)', bearerAdmin, function (req, res) {
	if ( req.token ) {
		var unit_id = req.params.unit_id;
		units	= db.getCollection('units');
		var u = units.find({'id': { '$eq': unit_id }});
		//console.log(u);
		if (u) {
			units.remove(u);
			db.save();
			res.send({ 'code': 200, message: 'Successfully deleted', removed_id: unit_id }, 200); // TODO: missing serializer
		} else {
			res.send(new ErrorSerializer({'id': 20, 'code': 404, 'message': 'Not Found'}).serialize(), 404);
		}
	} else {
		res.send(new ErrorSerializer({'id': 21, 'code': 401, 'message': 'Unauthorized'}).serialize(), 401);
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
			res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
			res.send(new ErrorSerializer({'id': 22, 'code': 431, 'message': 'Forbidden'}).serialize(), 403);
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }, 'role': 'admin'}) ) {
				next();
			} else {
				res.send(new ErrorSerializer({'id': 23, 'code': 404, 'message': 'Not Found'}).serialize(), 404);
			}
		}
	} else {
		res.send(new ErrorSerializer({'id': 24, 'code': 401, 'message': 'Unauthorized'}).serialize(), 401);
	}
}

module.exports = router;

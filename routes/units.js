'use strict';
var express = require('express');
var router = express.Router();
var UnitSerializer = require('../serializers/unit');
var units;
var users;

router.get('/', function (req, res) {
	var type = req.query.type;
	units	= db.getCollection('units');
	//console.log( units );
	if ( type === undefined ) {
		var json = new UnitSerializer(units.find()).serialize();
		res.send(json);
	} else {
		var json = new UnitSerializer(units.find({'type': { '$eq': type }})).serialize();
		res.send(json);
	}
});

router.get('/:unit_id([0-9a-z\-]+)', function (req, res) {
	var unit_id = parseInt(req.params.unit_id); //TODO: not always an Integer !!!
	units	= db.getCollection('units');
	//console.log(unit_id);
	var json = new UnitSerializer(units.find({'id': { '$eq': unit_id }})).serialize();
	res.send(json);
});

router.post('/', bearerAuth, function (req, res) {
	// only for admins
	units	= db.getCollection('units');
	//console.log(units);
	var new_unit = {
		id: uuid.v4(),
		name:	req.body.name!==undefined?req.body.name:item.name,
		format:	req.body.format!==undefined?req.body.format:item.format,
		type: 	req.body.type!==undefined?req.body.type:item.type,
	};
	units.insert(new_unit);
	//console.log(units);
	res.send({ 'code': 201, message: 'Created', unit: new UnitSerializer(new_unit).serialize() }, 201);
});

router.put('/:unit_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	// only for admins
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
});

router.delete('/:unit_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	// TODO: Implement permissions
	var unit_id = req.params.unit_id; //TODO: not always an Integer !!!
	units	= db.getCollection('units');
	var u = units.find({'id': { '$eq': unit_id }});
	//console.log(u);
	if (u) {
		units.remove(u);
		db.save();
		res.send({ 'code': 200, message: 'Successfully deleted', removed_id: unit_id }, 200); // TODO: missing serializer
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
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
		var queryAdmin = {
			'$and': [
				{'role': 'admin'},
				{'token': { '$eq': req.token }},
			]
		};
		if (req.user = (users.find(queryAdmin))[0] == undefined ) {
			res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
		};
		next();
	} else {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
}

module.exports = router;

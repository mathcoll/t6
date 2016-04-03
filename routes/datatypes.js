'use strict';
var express = require('express');
var router = express.Router();
var DataTypeSerializer = require('../serializers/datatype');
var datatypes;
var users;
var tokens;

router.get('/', function (req, res) {
	datatypes	= db.getCollection('datatypes');
	res.send(new DataTypeSerializer(datatypes.find()).serialize());
});

router.get('/:datatype_id([0-9a-z\-]+)', function (req, res) {
	var datatype_id = req.params.datatype_id;
	datatypes	= db.getCollection('datatypes');
	var json = datatypes.find({ 'id': { '$eq': datatype_id } });
	//console.log(json);
	if ( json.length > 0 ) {
		res.send(new DataTypeSerializer(json).serialize(), 200);
	} else {
		res.send({ 'code': 404, 'error': 'Not Found' }, 404);
	}
});

router.post('/', bearerAdmin, function (req, res) {
	if ( req.token ) {
		datatypes	= db.getCollection('datatypes');
		var new_datatype = {
			id:			uuid.v4(),
			name:	req.body.name!==undefined?req.body.name:'unamed',
		};
		datatypes.insert(new_datatype);
		res.send({ 'code': 201, message: 'Created', datatype: new DataTypeSerializer(new_datatype).serialize() }, 201);
	} else {
		res.send({ 'code': 401, 'error': 'Unauthorized' }, 401);
	}
});

router.put('/:datatype_id([0-9a-z\-]+)', bearerAdmin, function (req, res) {
	if ( req.token ) {
		var datatype_id = req.params.datatype_id;
		datatypes	= db.getCollection('datatypes');
		var result;
		datatypes.findAndUpdate(
			function(i){return i.id==datatype_id},
			function(item){
				item.name		= req.body.name!==undefined?req.body.name:item.name;
				result = item;
			}
		);
		db.save();
		res.send({ 'code': 200, message: 'Successfully updated', datatype: new DataTypeSerializer(result).serialize() }, 200);
	} else {
		res.send({ 'code': 401, 'error': 'Unauthorized' }, 401);
	}
});

router.delete('/:datatype_id([0-9a-z\-]+)', bearerAdmin, function (req, res) {
	if ( req.token ) {
		var datatype_id = req.params.datatype_id;
		datatypes	= db.getCollection('datatypes');
		var d = datatypes.find({'id': { '$eq': datatype_id }});
		if (d) {
			datatypes.remove(d);
			db.save();
			res.send({ 'code': 200, message: 'Successfully deleted', removed_id: datatype_id }, 200); // TODO: missing serializer
		} else {
			res.send({ 'code': 404, message: 'Not Found' }, 404);
		}
	} else {
		res.send({ 'code': 401, 'error': 'Unauthorized' }, 401);
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
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }, 'role': 'admin'}) ) {
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

'use strict';
var express = require('express');
var router = express.Router();
var DataTypeSerializer = require('../serializers/datatype');
var datatypes;
var users;

router.get('/', function (req, res) {
	datatypes	= db.getCollection('datatypes');
	res.send(new DataTypeSerializer(datatypes.find()).serialize());
});

router.get('/:datatype_id([0-9a-z\-]+)', function (req, res) {
	var datatype_id = (req.params.datatype_id).toString(); //TODO: not always an Integer !!!
	datatypes	= db.getCollection('datatypes');
	//console.log(datatype_id);
	res.send(new DataTypeSerializer(datatypes.find({ 'id': datatype_id })).serialize());
});

router.post('/', bearerAuth, function (req, res) {
	// only for admins
	datatypes	= db.getCollection('datatypes');
	//console.log(datatypes);
	var new_datatype = {
		id:			uuid.v4(),
		name:	req.body.name!==undefined?req.body.name:'unamed',
	};
	datatypes.insert(new_datatype);
	//console.log(datatypes);
	res.send({ 'code': 201, message: 'Created', datatype: new DataTypeSerializer(new_datatype).serialize() }, 201);
});

router.put('/:datatype_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	// TODO: Impement permissions
	var datatype_id = req.params.datatype_id;
	datatypes	= db.getCollection('datatypes');
	//console.log(datatypes);
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
});

router.delete('/:datatype_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	// only for admins
	//TODO: look to fail in deletion
	var datatype_id = req.params.datatype_id; //TODO: not always an Integer !!!
	datatypes	= db.getCollection('datatypes');
	var d = datatypes.find({'id': { '$eq': datatype_id }});
	//console.log(d);
	if (d) {
		datatypes.remove(d);
		db.save();
		res.send({ 'code': 200, message: 'Successfully deleted', removed_id: datatype_id }, 200); // TODO: missing serializer
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

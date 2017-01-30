'use strict';
var express = require('express');
var router = express.Router();
var DataTypeSerializer = require('../serializers/datatype');
var ErrorSerializer = require('../serializers/error');
var datatypes;
var users;
var tokens;

/**
 * @api {get} /datatypes/:datatype_id Get DataType(s)
 * @apiName Get DataType(s)
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiParam {uuid-v4} [datatype_id] DataType ID
 * 
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 500
 */
router.get('(:datatype_id([0-9a-z\-]+))?', function (req, res) {
	var datatype_id = req.params.datatype_id;
	datatypes	= db.getCollection('datatypes');
	var json;
	if ( unit_id === undefined ) {
		json = datatypes.find();
	} else {
		json = datatypes.find({ 'id': { '$eq': datatype_id } });
	}
	//console.log(json);
	if ( json.length > 0 ) {
		res.status(200).send(new DataTypeSerializer(json).serialize());
	} else {
		res.status(404).send(new ErrorSerializer({'id': 48, 'code': 404, 'message': 'Not Found'}).serialize());
	}
});

/**
 * @api {post} /datatypes Create DataType
 * @apiName Create DataType
 * @apiGroup General
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {String} [name=unamed] DataType Name
 * 
 * @apiUse 401
 */
router.post('/', bearerAdmin, function (req, res) {
	if ( req.token ) {
		datatypes	= db.getCollection('datatypes');
		var new_datatype = {
			id:			uuid.v4(),
			name:	req.body.name!==undefined?req.body.name:'unamed',
		};
		datatypes.insert(new_datatype);
		res.status(201).send(new ErrorSerializer({ 'code': 201, message: 'Created', datatype: new DataTypeSerializer(new_datatype).serialize() }).serialize());
	} else {
		res.status(401).send(new ErrorSerializer({'id': 49, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

/**
 * @api {put} /datatypes/:datatype_id Edit a DataType
 * @apiName Edit a DataType
 * @apiGroup General
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {uuid-v4} datatype_id DataType Id
 * @apiParam {String} [name]
 * 
 * @apiUse 401
 */
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
		res.status(200).send(new ErrorSerializer({ 'code': 200, message: 'Successfully updated', datatype: new DataTypeSerializer(result).serialize() }).serialize());
	} else {
		res.status(401).send(new ErrorSerializer({'id': 50, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

/**
 * @api {delete} /datatypes/:datatype_id Delete a DataType
 * @apiName Delete a DataType
 * @apiGroup General
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {uuid-v4} datatype_id DataType Id
 * 
 * @apiUse 401
 * @apiUse 404
 */
router.delete('/:datatype_id([0-9a-z\-]+)', bearerAdmin, function (req, res) {
	if ( req.token ) {
		var datatype_id = req.params.datatype_id;
		datatypes	= db.getCollection('datatypes');
		var d = datatypes.find({'id': { '$eq': datatype_id }});
		if (d) {
			datatypes.remove(d);
			db.save();
			res.status(200).send(new ErrorSerializer({ 'code': 200, message: 'Successfully deleted', removed_id: datatype_id }).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({'id': 51, 'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 52, 'code': 401, 'message': 'Unauthorized'}).serialize());
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
			res.status(403).send(new ErrorSerializer({'id': 53, 'code': 403, 'message': 'Forbidden'}).serialize());
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }, 'role': 'admin'}) ) {
				next();
			} else {
				res.status(404).send(new ErrorSerializer({'id': 54, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 55, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
}

module.exports = router;

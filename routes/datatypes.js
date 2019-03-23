"use strict";
var express = require("express");
var router = express.Router();
var DataTypeSerializer = require("../serializers/datatype");
var ErrorSerializer = require("../serializers/error");
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
router.get("/(:datatype_id([0-9a-z\-]+))?", function (req, res) {
	var datatype_id = req.params.datatype_id;
	datatypes	= db.getCollection('datatypes');
	var json;
	if ( datatype_id === undefined ) {
		json = datatypes.find();
	} else {
		json = datatypes.find({ 'id': { '$eq': ""+datatype_id } });
	}
	//console.log(json);
	json = json.length>0?json:[];
	res.status(200).send(new DataTypeSerializer(json).serialize());
});

/**
 * @api {post} /datatypes Create DataType
 * @apiName Create DataType
 * @apiGroup 7. Admin User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {String} [name=unamed] DataType Name
 * 
 * @apiUse 401
 */
router.post("/", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	if ( req.user.role == 'admin' ) {
		datatypes	= db.getCollection('datatypes');
		var newDatatype = {
			id:			uuid.v4(),
			name:	req.body.name!==undefined?req.body.name:'unamed',
		};
		datatypes.insert(newDatatype);
		
		res.header('Location', '/v'+version+'/datatypes/'+newDatatype.id);
		res.status(201).send(new ErrorSerializer({ 'code': 201, message: 'Created', datatype: new DataTypeSerializer(newDatatype).serialize() }).serialize());
	} else {
		res.status(401).send(new ErrorSerializer({'id': 49, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

/**
 * @api {put} /datatypes/:datatype_id Edit a DataType
 * @apiName Edit a DataType
 * @apiGroup 7. Admin User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {uuid-v4} datatype_id DataType Id
 * @apiParam {String} [name]
 * 
 * @apiUse 401
 */
router.put("/:datatype_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	if ( req.user.role == 'admin' ) {
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
		
		res.header('Location', '/v'+version+'/datatypes/'+datatype_id);
		res.status(200).send(new ErrorSerializer({ 'code': 200, message: 'Successfully updated', datatype: new DataTypeSerializer(result).serialize() }).serialize());
	} else {
		res.status(401).send(new ErrorSerializer({'id': 50, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

/**
 * @api {delete} /datatypes/:datatype_id Delete a DataType
 * @apiName Delete a DataType
 * @apiGroup 7. Admin User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {uuid-v4} datatype_id DataType Id
 * 
 * @apiUse 401
 * @apiUse 404
 */
router.delete("/:datatype_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	if ( req.user.role == 'admin' ) {
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

module.exports = router;

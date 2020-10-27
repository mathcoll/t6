"use strict";
var express = require("express");
var router = express.Router();
var DataTypeSerializer = require("../serializers/datatype");
var ErrorSerializer = require("../serializers/error");
var datatypes;

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
	datatypes	= db.getCollection("datatypes");
	var json;
	if ( typeof datatype_id === "undefined" ) {
		json = datatypes.find();
	} else {
		json = datatypes.find({ "id": { "$eq": ""+datatype_id } });
	}
	json = json.length>0?json:[];
	res.status(200).send(new DataTypeSerializer(json).serialize());
});

/**
 * @api {post} /datatypes Add DataType
 * @apiName Add DataType
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {String} [name=unamed] DataType Name
 * @apiParam {String="categorical","numerical","object"} type Type of the datatype
 * @apiParam {String="discrete","continuous","ordinal","nominal"} classification Classification of the datatype
 * 
 * @apiUse 401
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		datatypes	= db.getCollection("datatypes");
		var classification = undefined;
		if(typeof req.body.type!=="undefined") {
			if(req.body.type==="numerical") {
				classification = (req.body.classification==="discrete" || req.body.classification==="continuous")?req.body.classification:undefined;
			} else if(req.body.type==="categorical") {
				classification = (req.body.classification==="ordinal" || req.body.classification==="nominal")?req.body.classification:undefined;
			}
		} else {
			classification = (req.body.classification==="discrete" || req.body.classification==="continuous" || req.body.classification==="ordinal" || req.body.classification==="nominal")?req.body.classification:undefined;
		}
		var newDatatype = {
			id:		uuid.v4(),
			name:	typeof req.body.name!=="undefined"?req.body.name:"unamed",
			type:	(typeof req.body.type!=="undefined" && (req.body.type==="numerical"||req.body.type==="object"||req.body.type==="categorical"))?req.body.type:undefined,
			classification:	classification,
		};
		datatypes.insert(newDatatype);
		
		res.header("Location", "/v"+version+"/datatypes/"+newDatatype.id);
		res.status(201).send({ "code": 201, message: "Created", unit: new DataTypeSerializer(newDatatype).serialize() }, 201);
	} else {
		res.status(401).send(new ErrorSerializer({"id": 49, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {put} /datatypes/:datatype_id Edit a DataType
 * @apiName Edit a DataType
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {uuid-v4} datatype_id DataType Id
 * @apiParam {String} name Name of datatype
 * @apiParam {String="categorical","numerical","object"} type Type of the datatype
 * @apiParam {String="discrete","continuous","ordinal","nominal"} classification Classification of the datatype
 * 
 * @apiUse 401
 */
router.put("/:datatype_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		var datatype_id = req.params.datatype_id;
		datatypes	= db.getCollection("datatypes");
		var classification = undefined;
		if(typeof req.body.type!=="undefined") {
			if(req.body.type==="numerical") {
				classification = (req.body.classification==="discrete" || req.body.classification==="continuous")?req.body.classification:undefined;
			} else if(req.body.type==="categorical") {
				classification = (req.body.classification==="ordinal" || req.body.classification==="nominal")?req.body.classification:undefined;
			}
		} else {
			classification = (req.body.classification==="discrete" || req.body.classification==="continuous" || req.body.classification==="ordinal" || req.body.classification==="nominal")?req.body.classification:undefined;
		}
		var result;
		datatypes.findAndUpdate(
			function(i){return i.id==datatype_id;},
			function(item){
				item.name	= typeof req.body.name!=="undefined"?req.body.name:item.name;
				item.type	= (typeof req.body.type!=="undefined" && (req.body.type==="numerical"||req.body.type==="object"||req.body.type==="categorical"))?req.body.type:item.type;
				item.classification	= (typeof classification!=="undefined")?classification:item.classification;
				result 		= item;
			}
		);
		db.save();
		
		res.header("Location", "/v"+version+"/datatypes/"+datatype_id);
		res.status(200).send({ "code": 200, message: "Successfully updated", unit: new DataTypeSerializer(result).serialize() });
	} else {
		res.status(401).send(new ErrorSerializer({"id": 50, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {delete} /datatypes/:datatype_id Delete a DataType
 * @apiName Delete a DataType
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiParam {uuid-v4} datatype_id DataType Id
 * 
 * @apiUse 401
 * @apiUse 404
 */
router.delete("/:datatype_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		var datatype_id = req.params.datatype_id;
		datatypes	= db.getCollection("datatypes");
		var d = datatypes.find({"id": { "$eq": datatype_id }});
		if (d) {
			datatypes.remove(d);
			db.save();
			res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: datatype_id }); // TODO: missing serializer
		} else {
			res.status(404).send(new ErrorSerializer({"id": 51, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(401).send(new ErrorSerializer({"id": 52, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

module.exports = router;

"use strict";
var express = require("express");
var router = express.Router();
var DataTypeSerializer = require("../serializers/datatype");
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /datatypes/:datatype_id Get DataTypes
 * @apiName Get DataTypes
 * @apiDescription t6 implement a immutable datatypes list as referential. A Full documentation is available on the [functionnal documentation](https://www.internetcollaboratif.info/features/data-types/)
 * @apiGroup 0. General
 * @apiVersion 2.0.1
 * 
 * @apiParam {uuid-v4} [datatype_id] DataType ID
 * 
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 */
router.get("/(:datatype_id([0-9a-z\-]+))?", function (req, res) {
	var datatype_id = req.params.datatype_id;
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
 * @apiDescription t6 administrators can add datatypes using this endpoint. A Full documentation is available on the [functionnal documentation](https://www.internetcollaboratif.info/features/data-types/)
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiBody {String} [name=unamed] DataType Name
 * @apiBody {String="categorical","numerical","object"} type Type of the datatype
 * @apiBody {String="discrete","continuous","ordinal","nominal"} classification Classification of the datatype
 * 
 * @apiUse 401
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
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

		t6events.addAudit("t6App", "AuthAdmin: {post} /datatypes Add DataType", "", "", {"status": "200", error_id: "00003"});
		res.header("Location", "/v"+version+"/datatypes/"+newDatatype.id);
		res.status(201).send({ "code": 201, message: "Created", unit: new DataTypeSerializer(newDatatype).serialize() }, 201);
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /datatypes Add DataType", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 3049, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {put} /datatypes/:datatype_id Edit a DataType
 * @apiName Edit a DataType
 * @apiDescription A Full documentation is available on the [functionnal documentation](https://www.internetcollaboratif.info/features/data-types/)
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiParam {uuid-v4} datatype_id DataType Id
 * @apiBody {String} name Name of datatype
 * @apiBody {String="categorical","numerical","object"} type Type of the datatype
 * @apiBody {String="discrete","continuous","ordinal","nominal"} classification Classification of the datatype
 * 
 * @apiUse 401
 */
router.put("/:datatype_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		var datatype_id = req.params.datatype_id;
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
			function(i){return i.id===datatype_id;},
			function(item){
				item.name	= typeof req.body.name!=="undefined"?req.body.name:item.name;
				item.type	= (typeof req.body.type!=="undefined" && (req.body.type==="numerical"||req.body.type==="object"||req.body.type==="categorical"))?req.body.type:item.type;
				item.classification	= (typeof classification!=="undefined")?classification:item.classification;
				result 		= item;
			}
		);
		db_datatypes.save();
		
		t6events.addAudit("t6App", "AuthAdmin: {put} /datatypes/:datatype_id", "", "", {"status": "200", error_id: "00003"});
		res.header("Location", "/v"+version+"/datatypes/"+datatype_id);
		res.status(200).send({ "code": 200, message: "Successfully updated", unit: new DataTypeSerializer(result).serialize() });
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {put} /datatypes/:datatype_id", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 3050, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {delete} /datatypes/:datatype_id Delete a DataType
 * @apiName Delete a DataType
 * @apiDescription Deletion of datatypes is not reversible. No change will be made to Flows using the removed datatype. A Full documentation is available on the [functionnal documentation](https://www.internetcollaboratif.info/features/data-types/)
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiParam {uuid-v4} datatype_id DataType Id to be deleted
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/:datatype_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		var datatype_id = req.params.datatype_id;
		var d = datatypes.find({"id": { "$eq": datatype_id }});
		if (d) {
			datatypes.remove(d);
			db_datatypes.save();
			t6events.addAudit("t6App", "AuthAdmin: {delete} /datatypes/:datatype_id", "", "", {"status": "200", error_id: "00003"});
			res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: datatype_id }); // TODO: missing serializer
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {delete} /datatypes/:datatype_id", "", "", {"status": "404", error_id: "00004"});
			res.status(404).send(new ErrorSerializer({"id": 3051, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {delete} /datatypes/:datatype_id", "", "", {"status": "401", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 3052, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
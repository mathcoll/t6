"use strict";
var express = require("express");
var router = express.Router();
var FlowSerializer = require("../serializers/flow");
var ErrorSerializer = require("../serializers/error");
var flows;
var users;
var tokens;
var datatypes;
var units;

function str2bool(v) {
	return [true, "yes", "true", "t", "1", "y", "yeah", "on", "yup", "certainly", "uh-huh"].indexOf(v)>-1?true:false;
}

/**
 * @api {get} /flows/:flow_id Get Flow(s)
 * @apiName Get Flow(s)
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [flow_id] Flow Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/:flow_id([0-9a-z\-]+)?", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var results = Array();
	var flow_id = req.params.flow_id;
	var size = typeof req.query.size!=="undefined"?req.query.size:20; // TODO WTF: should be "limit" !!
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	var name = req.query.name;
	if ( typeof req.user !== "undefined" && typeof req.user.id !== "undefined" ) {
		flows	= db.getCollection("flows");

		var query;
		if ( typeof flow_id !== "undefined" ) {
			query = {
			"$and": [
					{ "id": flow_id },
					{ "user_id": req.user.id },
				]
			};
		} else {
			if ( typeof name !== "undefined" ) {
				query = {
				"$and": [
						{ "user_id" : req.user.id },
						{ "name": { "$regex": [name, "i"] } }
					]
				};
			} else {
				query = { "user_id" : req.user.id };
			}
		}
		var flow = flows.chain().find(query).offset(offset).limit(size).data();
		/*
		units	= db.getCollection("units");
		var flow = flows.chain().find(query).offset(offset).limit(size);
		var join = flow.eqJoin(units.chain(), "unit", "id");
		
		console.log("query", query);
		console.log("offset", offset);
		console.log("size", size);
		console.log("flow", flow.data()[0].left);
		console.log("join", join.data()[0].left);
		flow = (join.data()).length>0?join.data()[0].left:[];
		*/
		
		var total = flows.find(query).length;
		flow.size = size;
		flow.pageSelf = page;
		flow.pageFirst = 1;
		flow.pagePrev = flow.pageSelf>flow.pageFirst?Math.ceil(flow.pageSelf)-1:flow.pageFirst;
		flow.pageLast = Math.ceil(total/size);
		flow.pageNext = flow.pageSelf<flow.pageLast?Math.ceil(flow.pageSelf)+1:undefined;
		//flow.unit = (join.data())[0].right.name;
console.log(flow);
		res.status(200).send(new FlowSerializer(flow).serialize());
	} else {
		res.status(401).send(new ErrorSerializer({"id": 37, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {post} /flows Create new Flow
 * @apiName Create new Flow
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Flow Name
 * @apiParam {String} [data_type] Flow Data Type, this parameter is really important and will define the Value cast in datastore
 * @apiParam {String} [unit] Flow Unit
 * @apiParam {String} [theme] Flow theme, deprecated
 * @apiParam {String} [mqtt_topic]] Mqtt topic
 * @apiParam {Boolean} [require_signed=false] require_signed
 * @apiParam {Boolean} [require_encrypted=false] require_encrypted
 * @apiParam {Object[]} permission
 * @apiParam {String[]} [objects] List of Object Ids
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	flows	= db.getCollection("flows");
	/* Check for quota limitation */
	var queryQ = { "user_id" : req.user.id };
	var i = (flows.find(queryQ)).length;
	if( i >= (quota[req.user.role]).flows ) {
		res.status(429).send(new ErrorSerializer({"id": 129, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize());
	} else {
		if ( typeof req.user.id !== "undefined" ) {
			var permission = typeof req.body.permission!=="undefined"?req.body.permission:"600"; //TODO: default to Owner: Read+Write
			if ( permission < 600 ) {
				res.status(400).send(new ErrorSerializer({"id": 38, "code": 400, "message": "Bad Request", details: "Permission must be greater than 600!"}).serialize());
			} else {
				var flow_id = uuid.v4();
				var newFlow = {
					id:					flow_id,
					user_id:			req.user.id,
					name: 				typeof req.body.name!=="undefined"?req.body.name:"unamed",
					data_type:			typeof req.body.data_type!=="undefined"?req.body.data_type:"",
					unit:  				typeof req.body.unit!=="undefined"?req.body.unit:"",
					theme:  			typeof req.body.theme!=="undefined"?req.body.theme:"",
					mqtt_topic:			typeof req.body.mqtt_topic!=="undefined"?req.body.mqtt_topic:"",
					permission:			permission,
					require_signed:		typeof req.body.require_signed!=="undefined"?str2bool(req.body.require_signed):false,
					require_encrypted:	typeof req.body.require_encrypted!=="undefined"?str2bool(req.body.require_encrypted):false,
					objects:			typeof req.body.objects!=="undefined"?req.body.objects:new Array(),
				};
				t6events.add("t6Api", "flow add", newFlow.id);
				flows.insert(newFlow);
				//console.log(flows);
				
				res.header("Location", "/v"+version+"/flows/"+newFlow.id);
				res.status(201).send({ "code": 201, message: "Created", flow: new FlowSerializer(newFlow).serialize() }); // TODO: missing serializer
			}
		}
	}
});

/**
 * @api {put} /flows/:flow_id Edit a Flow
 * @apiName Edit a Flow
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} flow_id Flow Id
 * @apiParam {String} [name] Flow Name
 * @apiParam {String} [data_type] Flow Data Type, this parameter is really important and will define the Value cast in datastore
 * @apiParam {String} [unit] Flow Unit
 * @apiParam {String} [mqtt_topic]] Mqtt topic
 * @apiParam {Boolean} [require_signed=false] require_signed
 * @apiParam {Boolean} [require_encrypted=false] require_encrypted
 * @apiParam {Object[]} [permission]
 * @apiParam {String[]} [objects] List of Object Ids
 * @apiParam (meta) {Integer} [meta.revision] If set to the current revision of the resource (before PUTing), the value is checked against the current revision in database.
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.put("/:flow_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var flow_id = req.params.flow_id;
	if ( flow_id ) {
		var permission = typeof req.body.permission!=="undefined"?req.body.permission:undefined;
		if ( permission < 600 ) {
			res.status(400).send(new ErrorSerializer({"id": 39, "code": 400, "message": "Bad Request", "details": "Permission must be greater than 600!"}).serialize());
		} else {
			flows	= db.getCollection("flows");
			var query = {
					"$and": [
							{ "id": flow_id },
							{ "user_id": req.user.id },
						]
					}
			var flow = flows.findOne( query );
			if ( flow ) {
				if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - flow.meta.revision) != 0 ) {
					res.status(400).send(new ErrorSerializer({"id": 39.2, "code": 400, "message": "Bad Request"}).serialize());
				} else {
					var result;
					flows.chain().find({ "id": flow_id }).update(function(item) {
						item.name				= typeof req.body.name!=="undefined"?req.body.name:item.name;
						item.unit				= typeof req.body.unit!=="undefined"?req.body.unit:item.unit;
						item.data_type			= typeof req.body.data_type!=="undefined"?req.body.data_type:item.data_type;
						item.permission			= typeof permission!=="undefined"?permission:item.permission;
						item.objects			= typeof req.body.objects!=="undefined"?req.body.objects:item.objects;
						item.mqtt_topic			= typeof req.body.mqtt_topic!=="undefined"?req.body.mqtt_topic:item.mqtt_topic;
						item.require_signed		= typeof req.body.require_signed!=="undefined"?str2bool(req.body.require_signed):str2bool(item.require_signed);
						item.require_encrypted	= typeof req.body.require_encrypted!=="undefined"?str2bool(req.body.require_encrypted):str2bool(item.require_encrypted);
						item.meta.revision		= ++(req.body.meta.revision);
						result = item;
					});
					if ( typeof result !== "undefined" ) {
						db.save();
						
						res.header("Location", "/v"+version+"/flows/"+flow_id);
						res.status(200).send({ "code": 200, message: "Successfully updated", flow: new FlowSerializer(result).serialize() }); // TODO: missing serializer
					} else {
						res.status(404).send(new ErrorSerializer({"id": 40, "code": 404, "message": "Not Found"}).serialize());
					}
				}
			} else {
				res.status(401).send(new ErrorSerializer({"id": 42, "code": 401, "message": "Forbidden ??"}).serialize());
			}
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 40.5, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {delete} /flows/:flow_id Delete a Flow
 * @apiName Delete a Flow
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} flow_id Flow Id
 */
router.delete("/:flow_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	// TODO: delete all data related to that flow?
	var flow_id = req.params.flow_id;
	flows	= db.getCollection("flows");
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only flow from current user
			{ "id" : flow_id, },
		],
	};
	var f = flows.find(query);
	//console.log(f);
	if ( f.length > 0 ) {
		flows.remove(f);
		db.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: flow_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 43, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

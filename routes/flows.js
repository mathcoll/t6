"use strict";
var express = require("express");
var router = express.Router();
var FlowSerializer = require("../serializers/flow");
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /flows/:flow_id Get Flows
 * @apiName Get Flows
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
router.get("/:flow_id([0-9a-z\-]+)?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var flow_id = req.params.flow_id;
	var size = typeof req.query.size!=="undefined"?req.query.size:20; // TODO WTF: should be "limit" !!
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	var name = req.query.name;
	if ( typeof req.user !== "undefined" && typeof req.user.id !== "undefined" ) {
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
		let flow = flows.chain().find(query).offset(offset).limit(size).data();
		/*
		var flow = flows.chain().find(query).offset(offset).limit(size);
		var join = flow.eqJoin(units.chain(), "unit", "id");
		
		t6console.log("query" + query);
		t6console.log("offset" + offset);
		t6console.log("size" + size);
		t6console.log("flow" + flow.data()[0].left);
		t6console.log("join" + join.data()[0].left);
		flow = (join.data()).length>0?join.data()[0].left:[];
		flow.unit = (join.data())[0].right.name;
		*/
		
		var total = flows.find(query).length;
		flow.size = size;
		flow.pageSelf = page;
		flow.pageFirst = 1;
		flow.pagePrev = flow.pageSelf>flow.pageFirst?Math.ceil(flow.pageSelf)-1:flow.pageFirst;
		flow.pageLast = Math.ceil(total/size);
		flow.pageNext = flow.pageSelf<flow.pageLast?Math.ceil(flow.pageSelf)+1:undefined;
		if (flow && flow[0]) {
			flow[0].ttl = typeof flow.ttl!=="undefined"?flow.ttl:3600;
			res.status(200).send(new FlowSerializer(flow).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({"id": 236.5, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(401).send(new ErrorSerializer({"id": 237, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {post} /flows Create new Flow
 * @apiName Create new Flow
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam (Request body) {String} [name=unamed] Flow Name
 * @apiParam (Request body) {String} [data_type] Flow Data Type, this parameter is really important and will define the Value cast in datastore
 * @apiParam (Request body) {String} [unit] Flow Unit
 * @apiParam (Request body) {String} [theme] Flow theme, deprecated
 * @apiParam (Request body) {String} [mqtt_topic]] Mqtt topic
 * @apiParam (Request body) {uuid-v4} [track_id] The flow_id of the primary sensor in case using Sensor-Fusion
 * @apiParam (Request body) {String} [fusion_algorithm] Data Fusion algorithm
 * @apiParam (Request body) {Integer} [ttl] Time To Live before datapoint on Flow will expire
 * @apiParam (Request body) {Boolean} [require_signed=false] require_signed
 * @apiParam (Request body) {Boolean} [require_encrypted=false] require_encrypted
 * @apiParam (Request body) {Integer} permission Permission is not used anymore (deprecated)
 * @apiParam (Request body) {String[]} [objects] List of Object Ids
 * @apiParam (Request body) {Object} [influx_db_cloud] influx_db_cloud object to define what bucket should be used to save data on the cloud
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	/* Check for quota limitation */
	var queryQ = { "user_id" : req.user.id };
	var i = (flows.find(queryQ)).length;
	if( i >= (quota[req.user.role]).flows ) {
		res.status(429).send(new ErrorSerializer({"id": 229, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize());
	} else {
		if ( typeof req.user.id !== "undefined" ) {
			var permission = typeof req.body.permission!=="undefined"?req.body.permission:600; //TODO: default to Owner: Read+Write
			if ( permission < 600 ) {
				res.status(400).send(new ErrorSerializer({"id": 238, "code": 400, "message": "Bad Request", details: "Permission must be greater than 600!"}).serialize());
			} else {
				var flow_id = uuid.v4();
				var newFlow = {
					id:					flow_id,
					user_id:			req.user.id,
					name:				typeof req.body.name!=="undefined"?req.body.name:"unamed",
					data_type:			typeof req.body.data_type!=="undefined"?req.body.data_type:"", // TODO : in Flow collection, the data_type should be renamed to datatype_id
					unit:				typeof req.body.unit!=="undefined"?req.body.unit:"",
					theme:				typeof req.body.theme!=="undefined"?req.body.theme:"",
					mqtt_topic:			typeof req.body.mqtt_topic!=="undefined"?req.body.mqtt_topic:"",
					permission:			permission,
					require_signed:		typeof req.body.require_signed!=="undefined"?str2bool(req.body.require_signed):false,
					require_encrypted:	typeof req.body.require_encrypted!=="undefined"?str2bool(req.body.require_encrypted):false,
					objects:			typeof req.body.objects!=="undefined"?req.body.objects:new Array(),
					track_id:			typeof req.body.track_id!=="undefined"?req.body.track_id:undefined,
					fusion_algorithm:	typeof req.body.fusion_algorithm!=="undefined"?req.body.fusion_algorithm:undefined,
					ttl:				typeof req.body.ttl!=="undefined"?parseInt(req.body.ttl, 10):undefined,
					preprocessor:		typeof req.body.preprocessor!=="undefined"?req.body.preprocessor:"",
					influx_db_cloud:	typeof req.body.influx_db_cloud!=="undefined"?req.body.influx_db_cloud:"",
				};
				t6events.add("t6Api", "flow add", newFlow.id, req.user.id);
				flows.insert(newFlow);
				
				res.header("Location", "/v"+version+"/flows/"+newFlow.id);
				res.status(201).send({ "code": 201, message: "Created", flow: new FlowSerializer(newFlow).serialize() });
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
 * @apiParam (Request body) {String} [name] Flow Name
 * @apiParam (Request body) {String} [data_type] Flow Data Type, this parameter is really important and will define the Value cast in datastore
 * @apiParam (Request body) {String} [unit] Flow Unit
 * @apiParam (Request body) {String} [mqtt_topic]] Mqtt topic
 * @apiParam (Request body) {uuid-v4} [track_id] The flow_id of the primary sensor in case using Sensor-Fusion
 * @apiParam (Request body) {String} [fusion_algorithm] Data Fusion algorithm
 * @apiParam (Request body) {Integer} [ttl] Time To Live before datapoint on Flow will expire
 * @apiParam (Request body) {Boolean} [require_signed=false] require_signed
 * @apiParam (Request body) {Boolean} [require_encrypted=false] require_encrypted
 * @apiParam (Request body) {Object[]} [permission]
 * @apiParam (Request body) {String[]} [objects] List of Object Ids
 * @apiParam (Request body) (meta) {Integer} [meta.revision] If set to the current revision of the resource (before PUTing), the value is checked against the current revision in database.
 * @apiParam (Request body) {Object} [influx_db_cloud] influx_db_cloud object to define what bucket should be used to save data on the cloud
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 * @apiUse 409
 * @apiUse 429
 * @apiUse 500
 */
router.put("/:flow_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let flow_id = req.params.flow_id;
	if ( flow_id ) {
		let permission = typeof req.body.permission!=="undefined"?req.body.permission:undefined;
		if ( permission < 600 ) {
			res.status(400).send(new ErrorSerializer({"id": 239, "code": 400, "message": "Bad Request", "details": "Permission must be greater than 600!"}).serialize());
		} else {
			let query = {
				"$and": [
						{ "id": flow_id },
						{ "user_id": req.user.id },
					]
				};
			let flow = flows.findOne( query );
			if ( flow ) {
				if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - flow.meta.revision) !== 0 ) {
					res.status(409).send(new ErrorSerializer({"id": 239.2, "code": 409, "message": "Bad Request"}).serialize());
				} else {
					let result;
					flows.chain().find({ "id": flow_id }).update(function(item) {
						item.name				= typeof req.body.name!=="undefined"?req.body.name:item.name;
						item.unit				= typeof req.body.unit!=="undefined"?req.body.unit:item.unit;
						item.data_type			= typeof req.body.data_type!=="undefined"?req.body.data_type:item.data_type; // TODO : in Flow collection, the data_type should be renamed to datatype_id
						item.permission			= typeof permission!=="undefined"?permission:item.permission;
						item.objects			= typeof req.body.objects!=="undefined"?req.body.objects:item.objects;
						item.mqtt_topic			= typeof req.body.mqtt_topic!=="undefined"?req.body.mqtt_topic:item.mqtt_topic;
						item.require_signed		= typeof req.body.require_signed!=="undefined"?str2bool(req.body.require_signed):str2bool(item.require_signed);
						item.require_encrypted	= typeof req.body.require_encrypted!=="undefined"?str2bool(req.body.require_encrypted):str2bool(item.require_encrypted);
						item.meta.revision		= typeof item.meta.revision==="number"?(item.meta.revision):1;
						item.track_id			= typeof req.body.track_id!=="undefined"?req.body.track_id:item.track_id;
						item.fusion_algorithm	= typeof req.body.fusion_algorithm!=="undefined"?req.body.fusion_algorithm:item.fusion_algorithm;
						item.ttl				= typeof req.body.ttl!=="undefined"?parseInt(req.body.ttl, 10):parseInt(item.ttl, 10);
						item.preprocessor		= typeof req.body.preprocessor!=="undefined"?req.body.preprocessor:item.preprocessor;
						item.influx_db_cloud	= typeof req.body.influx_db_cloud!=="undefined"?req.body.influx_db_cloud:item.influx_db_cloud;
						result = item;

						db_flows.save();
						db_flows.saveDatabase(function(err) {err!==null?t6console.error("Error on saveDatabase", err):null;});
					});
					if ( typeof result !== "undefined" ) {
						res.header("Location", "/v"+version+"/flows/"+flow_id);
						res.status(200).send({ "code": 200, message: "Successfully updated", flow: new FlowSerializer(result).serialize() });
					} else {
						res.status(404).send(new ErrorSerializer({"id": 240, "code": 404, "message": "Not Found"}).serialize());
					}
				}
			} else {
				res.status(401).send(new ErrorSerializer({"id": 242, "code": 401, "message": "Forbidden ??"}).serialize());
			}
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 240.5, "code": 404, "message": "Not Found"}).serialize());
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
router.delete("/:flow_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	// TODO: delete all data related to that flow?
	var flow_id = req.params.flow_id;
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only flow from current user
			{ "id" : flow_id, },
		],
	};
	var f = flows.find(query);
	if ( f.length > 0 ) {
		flows.remove(f);
		db_flows.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: flow_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 243, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

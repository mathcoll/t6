"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");
var ObjectSerializer = require("../serializers/object");
var exec = require("child_process").exec;
var nmap = require("libnmap");
var objects;
var sources;

/**
 * @api {get} /ota/board-listall List all known boards and their corresponding FQBN
 * @apiName List all known boards and their corresponding FQBN
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiUse 201
 * @apiUse 429
 * @apiUse 500
 */
router.get("/board-listall", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	// This is a temporary solution...
	exec(`${ota.arduino_binary_cli} board listall`, function(error, stdout, stderr) {
		if (!error && stdout) {
			res.status(200).send({ "board-listall": stdout.split("\n") });
		} else {
			res.status(500).send(stderr + error);
		}
	});
});

/**
 * @api {get} /ota/:object_id Get the current state of OTA on Object
 * @apiName Get the current state of OTA on Object
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiUse 201
 * @apiUse 429
 * @apiUse 500
 */
router.get("/(:object_id([0-9a-z\-]+))", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection("objects");
	var object = objects.findOne({ "$and": [ { "user_id" : req.user.id }, { "id" : object_id } ]});
	if ( object && object.ipv4 && object.fqbn ) {
		let opts = {
			range: [object.ipv4!==null?object.ipv4:null],
			ports: String(ota.defaultPort),
			udp: false,
			timeout: 3,
			json: true,
		};
		nmap.scan(opts, function(err, report) {
			if (!err && report) {
				for (let item in report) {
					res.status(200).send({ "object_id": object_id, "ipv4": object.ipv4, "status": report[item].runstats[0].hosts[0].item.up, "summary": report[item].runstats[0].finished[0].item.summary });
				}
			} else {
				throw new Error(err);
				res.status(500).send(stderr + error);
			}
		});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 601, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {post} /ota/:source_id/deploy Deploy a Source to all linked Objects Over The Air
 * @apiName Deploy a Source to all linked Objects Over The Air
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} source_id Source Id to deploy
 * @apiParam {uuid-v4} [object_id] Object Id
 * 
 * @apiUse 201
 * @apiUse 404
 * @apiUse 429
 * @apiUse 500
 */
router.post("/(:source_id([0-9a-z\-]+))?/deploy/?(:object_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var source_id = req.params.source_id;
	var object_id = req.params.object_id;
	// find all objects linked to this source
	objects	= db.getCollection("objects");
	sources	= dbSources.getCollection("sources");
	var query;
	if ( typeof object_id !== "undefined" ) {
		query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "source_id" : source_id },
					{ "id" : object_id },
				]
			};
	} else {
		query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "source_id" : source_id },
				]
			};
	}
	var json = objects.find(query);
	if ( json.length > 0 ) {
		let s = sources.find({ "id" : source_id });
		json.map(function(o) {
			let dir = `${ota.build_dir}/${o.source_id}`;
			let binFile = `${dir}/${o.source_id}.esp8266.esp8266.nodemcu.bin`;
			if ( !fs.existsSync(dir) || !fs.existsSync(binFile) ) {
				res.status(409).send(new ErrorSerializer({"id": 600, "code": 409, "message": "Build is required first"}).serialize());
			} else {
				// This is a temporary solution...
				// only on ipv4 because I don't know if ipv6 can work
				// only on default port 8266
				let exec = require("child_process").exec;
				let password = s.password!==""?s.password:"";
				let cmd = `${ota.python3} ${ota.espota_py} -i ${o.ipv4} -p ${ota.defaultPort} --auth=${password} -f ${binFile}`;
				
				t6console.log("Deploying");
				let myShellScript = exec(`${cmd}`);
				myShellScript.stderr.on("data", (data)=>{
					t6console.error(data);
				});
				res.status(201).send({ "code": 201, message: "Deploying", deploying_to_objects: json });
			}
		});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 602, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /ota/:source_id Get Objects linked to source
 * @apiName Get Objects linked to source
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} source_id Source Id
 * 
 * @apiUse 201
 * @apiUse 404
 * @apiUse 429
 * @apiUse 500
 */
router.get("/:source_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var source_id = req.params.source_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	objects	= db.getCollection("objects");
	var query;
	if ( typeof name !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "name": { "$regex": [name, "i"] } },
				{ "source_id" : source_id },
			]
		};
	} else {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "source_id" : source_id },
			]
		};
	}
	var json = objects.chain().find(query).offset(offset).limit(size).data();
	json.map(function(o) {
		let i = t6ConnectedObjects.indexOf(o.id);
		if (i > -1) {
			o.is_connected = true;
		} else {
			o.is_connected = false;
		}
		t6console.debug("is_connected=" + o.is_connected);
		return o;
	});

	var total = objects.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	
	json = json.length>0?json:[];
	res.status(200).send(new ObjectSerializer(json).serialize());
});

module.exports = router;

"use strict";
var express = require("express");
var nmap = require("libnmap");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");
var ObjectSerializer = require("../serializers/object");
var exec = require("child_process").exec;
var users;
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
 * @api {post} /ota/:source_id/deploy/:object_id Deploy a Source to all linked Objects Over The Air
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
		let s = sources.find({ "id" : source_id }, { "version" : typeof json.source_version!=="undefined"?json.source_version:0 });
		let binFileErrors = new Array();
		let start = new Date();
		json.map(function(o) {
			let dir = `${ota.build_dir}/${o.source_id}/${o.source_version}/${o.id}`;
			t6console.info("Deploying from dir", dir);
			let pai = o.fqbn.split(":");
			let packager = pai[0];
			let architecture = pai[1];
			let id = pai[2];
			let binFile = `${dir}/${o.id}.${packager}.${architecture}.${id}.bin`;
			if (!fs.existsSync(dir) || !fs.existsSync(binFile)) {
				binFileErrors.push(o.id);
				t6otahistory.addEvent(req.user.id, o.id, {fqbn: o.fqbn, ip: o.ipv4}, o.source_id, o.source_version, "deploy", "failure", new Date()-start);
			}
		});
		if(binFileErrors.length > 0) {
			t6console.info("binFileErrors", binFileErrors);
			res.status(409).send(new ErrorSerializer({"id": 600, "code": 409, "message": "Build is required first", "missing_builds": binFileErrors}).serialize());
		} else {
			if(!req.query.dryrun || req.query.dryrun === "false") {
				res.status(201).send({ "code": 201, message: "Deploying", deploying_to_objects: new ObjectSerializer(json).serialize() });
				json.map(function(o) {
					// This is a temporary solution...
					// only on ipv4 because I don't know if ipv6 can work
					// only on default port 8266
					//let exec = require("child_process").exec;
					let dir = `${ota.build_dir}/${o.source_id}/${o.source_version}/${o.id}`;
					let pai = o.fqbn.split(":");
					let packager = pai[0];
					let architecture = pai[1];
					let id = pai[2];
					let binFile = `${dir}/${o.id}.${packager}.${architecture}.${id}.bin`;
					let password = typeof s.password!=="undefined"?s.password:"";
					let cmd = `${ota.python3} ${ota.espota_py} -i ${o.ipv4} -p ${ota.defaultPort} --auth=${password} -f ${binFile}`;

					t6console.info("Deploying to", o.id);
					t6console.info("Using", cmd);
					
					const child = exec(`${cmd}`);
					child.on("close", (code) => {
						t6console.log(`child process exited with code ${code}`);
						users = db.getCollection("users");
						let user = users.findOne({"id": req.user.id });
						if (code === 0) {
							if (user && typeof user.pushSubscription !== "undefined" ) {
								var payload = "{\"type\": \"message\", \"title\": \"Arduino OTA Deploy\", \"body\": \"Deploy is completed on "+o.ipv4+".\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
								t6notifications.sendPush(user.pushSubscription, payload);
							}
							t6otahistory.addEvent(req.user.id, o.id, {fqbn: o.fqbn, ip: o.ipv4}, o.source_id, o.source_version, "deploy", "success", new Date()-start);
						} else {
							if (user && typeof user.pushSubscription !== "undefined" ) {
								var payload = "{\"type\": \"message\", \"title\": \"Arduino OTA Deploy\", \"body\": \"An error occured during deployment of "+o.ipv4+" (code = "+code+").\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
								t6notifications.sendPush(user.pushSubscription, payload);
							}
							t6otahistory.addEvent(req.user.id, o.id, {fqbn: o.fqbn, ip: o.ipv4}, o.source_id, o.source_version, "deploy", "failure", new Date()-start);
						}
					});
					//myShellScript.stderr.on("data", (data)=>{
					//	t6console.error(data);
					//});
				});
			} else {
				res.status(201).send({ "code": 201, message: "Deploying (Dry Run)", deploying_to_objects: new ObjectSerializer(json).serialize() });
			}
		}
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
	var otaStatus = typeof req.query["ota-status"]!=="undefined"?req.query["ota-status"]:false;
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
	if (otaStatus==="true" && json.length>0) {
		for (const o of json) {
			if (String(o.ipv4)!=="") {
				let opts = {
						range: [o.ipv4],
						ports: String(ota.defaultPort),
						udp: false,
						timeout: 3,
						json: true,
				};
				nmap.scan(opts, function(err, report) {
					if (err) throw new Error(err);
					for (var item in report) {
						o.is_connected = report[item]["runstats"][0]["hosts"][0]["item"]["up"]>0?true:false;
					}
				});
			}
		}
		json = json.length>0?json:[];
		res.status(200).send(new ObjectSerializer(json).serialize());
	} else {
		json.map(function(o) {
			let i = t6ConnectedObjects.indexOf(o.id);
			if (i > -1) {
				o.is_connected = true;
			} else {
				o.is_connected = false;
			}
			return o;
		});
		json = json.length>0?json:[];
		res.status(200).send(new ObjectSerializer(json).serialize());
	}
});

module.exports = router;

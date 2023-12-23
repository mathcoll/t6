"use strict";
var express = require("express");
var router = express.Router();
var ObjectSerializer = require("../serializers/object");
var ErrorSerializer = require("../serializers/error");
var UISerializer = require("../serializers/ui");
var DeadsensorSerializer = require("../serializers/deadsensor");
var uis;
var sources;


/**
 * @api {get} /objects/deadsensors Get dead sensors
 * @apiName Get dead sensors
 * @apiDescription Get the list of dead sensors
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 *
 * @apiParam {String} [size=20] Size of the resultset
 * @apiParam {Number} [page] Page offset
 * @apiParam {String="active","all"} [filter] Filter to active notifications only
 * 
 * @apiUse 201
 * @apiUse 403
 */
router.get("/deadsensors", function (req, res) {
	let size = 1;
	let page = 1;
	let offset = 0;
	let filter = typeof req.query.filter==="active"?"active":req.query.filter;
	//let flow_id = typeof req.query.flow_id!=="undefined"?req.query.flow_id:undefined;
	let query = `SELECT time AS ts, user_id, flow_id, valueBoolean, valueFloat, valueInteger, valueString FROM data GROUP BY flow_id ORDER BY time DESC LIMIT ${size} OFFSET ${offset}`;
	t6console.debug("query", query);
	t6console.debug("filter", filter);
	dbInfluxDB.query(query).then((data) => {
		let sensors_from_flows = [];
		data.map((f) => {
			let query;
			if ( typeof req.user!=="undefined" && req.user.role === "admin" ) {
				query = { "id" : f.flow_id };
			} else {
				query = {
					"$and": [
							{ "user_id" : req.user.id },
							{ "id" : f.flow_id },
						]
					};
			}
			let currflow = flows.findOne(query);
			let ttl = parseInt( (currflow!=="undefined" && currflow!==null)?currflow.time_to_live:-1, 10);
			let name = (currflow!=="undefined" && currflow!==null && currflow.name)?currflow.name:undefined;
			let latest_value = moment(f.ts).format("MMMM Do YYYY, H:mm:ss");
			let latest_value_ts = moment(f.ts).format("x");
			let dead_notification = (currflow!=="undefined" && currflow!==null && currflow.dead_notification)?currflow.dead_notification:false;
			let dead_notification_interval = (currflow!=="undefined" && currflow!==null && currflow.dead_notification_interval)?currflow.dead_notification_interval:"hourly*";
			let dead_notification_latest = (currflow!=="undefined" && currflow!==null && currflow.dead_notification_latest)?moment(currflow.dead_notification_latest).format("MMMM Do YYYY, H:mm:ss"):undefined;
			let warning = moment(f.ts).isBefore( moment().subtract(ttl, "seconds") );
			if ( (ttl > -1 && warning === true) && ((filter!=="active") || (filter==="active" && dead_notification===true)) ) {
				sensors_from_flows.push({
					ttl							: ttl,
					name						: name,
					latest_value				: latest_value,
					latest_value_ts				: latest_value_ts,
					warning						: warning,
					user_id						: f.user_id,
					dead_notification			: dead_notification,
					dead_notification_interval	: dead_notification_interval,
					dead_notification_latest	: dead_notification_latest,
					flow_id						: f.flow_id
				});
			}
		});
		t6events.addAudit("t6App", "AuthAdmin: {get} /deadsensors", "", "", {"status": "200", error_id: "00003"});
		res.status(200).send(new DeadsensorSerializer(sensors_from_flows).serialize());
	});
});

/**
 * @api {get} /objects/:object_id/ui Get UI for an Object
 * @apiName Get UI for an Object
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} object_id Object Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 */
router.get("/(:object_id([0-9a-z\-]+))/ui", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	uis	= dbUis.getCollection("uis");
	var query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : object_id },
			]
		};
	var object = objects.findOne(query);
	if(object!==null) {
		var ui = uis.chain().find({ "id" : object.ui_id }).data();
		if ( ui.length > -1 ) {
			ui.id = object.ui_id;
			ui.object_id = object.id;
			res.status(200).send(new UISerializer(ui).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({"id": 9271, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 9272, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/show Show an Object UI
 * @apiName Show an Object UI
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiParam {uuid-v4} object_id Object Id
 * @apiUse 200
 */
router.get("/(:object_id([0-9a-z\-]+))/show", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	uis	= dbUis.getCollection("uis");
	var query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : object_id },
			]
		};
	var object = objects.findOne(query);
	if(object && object.ui_id) {
		var ui = (uis.chain().find({ "id" : object.ui_id }).data())[0];
		if (ui && typeof ui.ui!=="undefined") {
			ui.id = object.ui_id;
			ui.object_id = object.id;
			res.set("Content-Type", "text/html; charset=utf-8");
			res.status(200).render("object-ui", {object: object, ui: JSON.stringify(ui.ui)});
		} else {
			res.status(404).render("404", { "id": 9271, "code": 404, "error": "Not Found", err: {"stack": "", "status": "404"}});
		}
	} else {
		res.status(404).render("404", { "id": 9272, "code": 404, "error": "Not Found", err: {"stack": "", "status": "404"}});
	}
});

/**
 * @api {get} /objects/:object_id/qrcode/:typenumber/:errorcorrectionlevel Get qrcode for an Object
 * @apiName Get qrcode for an Object
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * @apiParam {integer} [typenumber] Typenumber 1 to 10
 * @apiParam {String{1}="L","M","Q","H"} [errorcorrectionlevel] Error correction level
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 */
router.get("/(:object_id([0-9a-z\-]+))/qrcode/(:typenumber)/(:errorcorrectionlevel)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	var typenumber = req.params.typenumber;
	var errorcorrectionlevel = typeof req.params.errorcorrectionlevel!=="undefined"?req.params.errorcorrectionlevel:"M";
	var query;
	if ( typeof object_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : object_id },
			]
		};
	}
	
	var json = objects.find(query);
	if ( json.length > 0 ) {
		var qr = qrCode.qrcode(typenumber, errorcorrectionlevel);
		qr.addData(baseUrl+"/m?id=/"+object_id+"#public-object");
		qr.make();
		res.status(200).send({"data": qr.createImgTag(typenumber)});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 9272, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/public" Get Public Object 
 * @apiName Get Public Object
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * @apiParam {String} [name] Optional Object name
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 */
router.get("/(:object_id([0-9a-z\-]+))?/public", function (req, res) {
	var object_id = req.params.object_id;
	var name = req.query.name;
	var query;
	if ( typeof object_id !== "undefined" ) {
		query = {
		"$and": [
				{ "isPublic" : "true" },
				{ "id" : object_id },
			]
		};
	} else {
		if ( typeof name !== "undefined" ) {
			query = {
			"$and": [
					{ "isPublic" : "true" },
					{ "name": { "$regex": [name, "i"] } }
				]
			};
		}
	}
	var json = objects.find(query);
	//t6console.debug(query);
	json = json.length>0?json:[];
	if ( json && json.length>0 ) {
		res.status(200).send(new ObjectSerializer(json).serialize());
	} else {
		res.status(404).send(new ErrorSerializer({"id": 9272, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/latest-version Get Object OTA latest version
 * @apiName Get Object OTA latest version
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * 
 * @apiUse 201
 * @apiUse 429
 * @apiHeader {String} [x-api-key] Api Key from "Generate Access Tokens Endpoint"
 * @apiHeader {String} [x-api-secret] Api Secret from "Generate Access Tokens Endpoint"
 */
router.get("/(:object_id([0-9a-z\-]+))/latest-version", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms, getToken: function getToken(req) {
	if ( req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer" && req.headers.authorization.split(" ")[1] !== "" ) {
		return req.headers.authorization.split(" ")[1];
	} else if( req.headers["x-api-key"] && req.headers["x-api-secret"] ) {
		let queryT = {
		"$and": [
					{ "key": req.headers["x-api-key"] },
					{ "secret": req.headers["x-api-secret"] },
				]
		};
		let u = access_tokens.findOne(queryT);
		if ( u && typeof u.user_id !== "undefined" ) {
			let user = users.findOne({id: u.user_id});
			let payload = JSON.parse(JSON.stringify(user));
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.token_type = "Bearer";
			payload.scope = "ClientApi";
			payload.sub = "/users/"+user.id;
			req.user = payload;
			return jsonwebtoken.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
		}
		// TODO : Rate limit is not checked here ! 
		//res.header("X-RateLimit-Limit", limit);
		//res.header("X-RateLimit-Remaining", limit-i);
	}
	return null;
} }), function (req, res, next) {
	var object_id = req.params.object_id;
	var object = objects.findOne({ "$and": [ { "user_id" : req.user.id }, { "id" : object_id } ]});
	if ( object && object.ipv4 && object.fqbn ) {

		sources	= dbSources.getCollection("sources");
		// Get root latest version of the source
		let source = sources.findOne({ "root_source_id": object.source_id });
		let buildVersions = new Array();
		if ( source && source.content && source.latest_version ) {
			let sVersion = source.latest_version;
			while(sVersion>-1) {
				let pai = object.fqbn.split(":");
				let packager = pai[0];
				let architecture = pai[1];
				let id = pai[2];
				let binFile = `/${object.source_id}/${sVersion}/${object.id}/${object.id}.${packager}.${architecture}.${id}.bin`;
				if (!fs.existsSync(ota.build_dir+binFile)) {
					buildVersions.push({"version": sVersion, "status": "404 Not Found", "binFile": binFile, "build": sprintf("%s/v%s/objects/%s/build/%s", baseUrl_https, version, object.id, sVersion) });
				} else {
					buildVersions.push({"version": version, "status": "200 Ready to deploy", "binFile": binFile });
				}
				sVersion--;
			}
		}

		res.status(200).send({ "object_id": object_id, "user_id": req.user.id, "ipv4": object.ipv4, "port": ota.defaultPort, "fqbn": object.fqbn, "source_id": object.source_id, "objectExpectedVersion": object.source_version, "sourceLatestVersion": source.latest_version, "buildVersions": buildVersions });
	} else {
		res.status(404).send(new ErrorSerializer({"id": 9272, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/ota-status Get Object OTA status
 * @apiName Get Object OTA status
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * 
 * @apiUse 201
 * @apiUse 429
 */
router.get("/(:object_id([0-9a-z\-]+))/ota-status/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
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
				res.status(500).send(stderr + error);
				throw new Error(err);
			}
		});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 9273, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id?name=:name Get Objects
 * @apiName Get Objects
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} [object_id] Object Id
 * @apiQuery {String} [name] Object Name you want to search for; this is using an case-insensitive regexp
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 */
router.get("/(:object_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	var query;
	if ( typeof object_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : object_id },
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
			query = {
			"$and": [
					{ "user_id" : req.user.id },
				]
			};
		}
	}
	var json = objects.chain().find(query).offset(offset).limit(size).data();
	json.map(function(o) {
		o.is_connected=t6ConnectedObjects.indexOf(o.id)>-1?true:false;
		o.source_version=(typeof o.source_id!=="undefined" && !o.source_version)?0:o.source_version;
		o.otahist = typeof o.source_id!=="undefined"?t6otahistory.getLastEvent(req.user.id, o.id):null;
		t6console.debug(`${o.id} is_connected: ${o.is_connected}, source_version: ${o.source_version}, otahist: ${o.otahist}.`);
		return o;
	});
	t6console.debug(query);

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

/**
 * @api {post} /objects/:object_id/unlink/:source_id Unlink Object from Source
 * @apiName Unlink Object from Source
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} [object_id] Object Id
 * @apiParam {uuid-v4} [source_id] Source Id
 * 
 * @apiUse 201
 * @apiUse 412
 * @apiUse 429
 */
router.post("/(:object_id([0-9a-z\-]+))/unlink/(:source_id([0-9a-z\-]+))", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = typeof req.params.object_id==="string"?req.params.object_id:"";
	var source_id = typeof req.params.source_id==="string"?req.params.source_id:"";
	var object = objects.findOne({ "$and": [ { "user_id" : req.user.id }, { "id" : object_id } ]});
	if ( object ) {
		if(object.source_id === source_id) {
			let result;
			objects.chain().find({ "id": object_id }).update(function(item) {
				item.source_id = "";
				item.source_version = "";
				result = item;
			});
			if ( typeof result!=="undefined" ) {
				db_objects.save();
				res.header("Location", "/v"+version+"/objects/"+object_id);
				t6events.addAudit("t6App", "object unlink", req.user.id, object_id, {error_id: null, status: 200});
				res.status(200).send({ "code": 200, message: "Successfully updated", object: new ObjectSerializer(result).serialize() });
			} else {
				res.status(412).send(new ErrorSerializer({"id": 185, "code": 412, "message": "Not Found"}).serialize());
			}
		} else {
			res.status(412).send(new ErrorSerializer({"id": 186, "code": 412, "message": "Source not match: Precondition Failed"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 9272, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {post} /objects/:object_id/build Build Object Arduino source
 * @apiName Build Object Arduino source
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * 
 * @apiUse 201
 * @apiUse 403
 * @apiUse 404
 * @apiUse 412
 * @apiUse 429
 */
router.post("/:object_id/build/?:version([0-9]+)?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = typeof req.params.object_id==="string"?req.params.object_id:"";
	var query = {
		"$and": [
			{ "id": object_id },
			{ "user_id": req.user.id },
		]
	};
	var object = objects.findOne( query );
	if ( object && object.source_id ) {
		var version = typeof req.params.version!=="undefined"?req.params.version:object.source_version;
		object.source_version = typeof object.source_version!=="undefined"?object.source_version:0;
		sources	= dbSources.getCollection("sources");
		let source = sources.findOne({"$and": [{ "root_source_id": object.source_id }, {"version": parseInt(version, 10)}]});
		t6console.debug(object.source_id, object.source_version, version, source);
		if ( source && source.content ) {
			// This is a temporary solution...
			let exec = require("child_process").exec;

			let odir = `${ota.build_dir}/${object.source_id}`;
			if (!fs.existsSync(odir)) { fs.mkdirSync(odir); }
			
			let vdir = `${ota.build_dir}/${object.source_id}/${version}`;
			if (!fs.existsSync(vdir)) { fs.mkdirSync(vdir); }
			
			let dir = `${ota.build_dir}/${object.source_id}/${version}/${object.id}`;
			if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }

			fs.writeFile(`${dir}/${object.id}.ino`, source.content, function (err) {
				if (err) { throw err; }
				t6console.log("File is created successfully.", `${dir}/${object.id}.ino`);
				t6console.log("Using version ", version);
				
				let fqbn = object.fqbn!==""?object.fqbn:ota.fqbn;
				t6console.log("Building ino sketch using fqbn=", fqbn);
				
				let start = new Date();
				t6console.debug("Exec=", `${ota.arduino_binary_cli} --config-file ${ota.config} --fqbn ${fqbn} --verbose compile ${dir}`);
				const child = exec(`${ota.arduino_binary_cli} --config-file ${ota.config} --fqbn ${fqbn} --verbose compile ${dir}`);
				child.on("close", (code) => {
					t6console.debug(`child process exited with code ${code}`);
					let user = users.findOne({"id": req.user.id });
					if (code === 0) {
						if (user && typeof user.pushSubscription !== "undefined"  && user.pushSubscription!==null && typeof user.pushSubscription.endpoint !== "undefined" && user.pushSubscription.endpoint!==null && user.pushSubscription.endpoint!=="" ) {
							t6console.debug(user.pushSubscription);
							var payload = "{\"type\": \"message\", \"title\": \"Arduino Build\", \"body\": \"Build is completed on v"+version+".\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
							let result = t6notifications.sendPush(user, payload);
							if(result && typeof result.statusCode!=="undefined" && (result.statusCode === 404 || result.statusCode === 410)) {
								t6console.debug("pushSubscription", pushSubscription);
								t6console.debug("Can't sendPush because of a status code Error", result.statusCode);
								users.chain().find({ "id": user.id }).update(function(u) {
									u.pushSubscription = {};
									db_users.save();
								});
								t6console.debug("pushSubscription is now disabled on User", error);
							}
						}
						t6otahistory.addEvent(req.user.id, object.id, {fqbn: object.fqbn, ip: object.ipv4}, object.source_id, object.source_version, "build", "success", new Date()-start);
						t6events.addAudit("t6App", "object build", req.user.id, object.id, {error_id: null, status: 201});
					} else {
						if (user && user.pushSubscription!==null && typeof user.pushSubscription!=="undefined" && user.pushSubscription.endpoint!==null && user.pushSubscription.endpoint!=="") {
							t6console.debug(user.pushSubscription);
							var payload = "{\"type\": \"message\", \"title\": \"Arduino Build\", \"body\": \"An error occured during build v"+version+" (code = "+code+").\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
							let result = t6notifications.sendPush(user, payload);
							if(result && typeof result.statusCode!=="undefined" && (result.statusCode === 404 || result.statusCode === 410)) {
								t6console.debug("pushSubscription", pushSubscription);
								t6console.debug("Can't sendPush because of a status code Error", result.statusCode);
								users.chain().find({ "id": user.id }).update(function(u) {
									u.pushSubscription = {};
									db_users.save();
								});
								t6console.debug("pushSubscription is now disabled on User", error);
							}
						}
						t6otahistory.addEvent(req.user.id, object.id, {fqbn: object.fqbn, ip: object.ipv4}, object.source_id, object.source_version, "build", "failure", new Date()-start);
						t6events.addAudit("t6App", "object build error", req.user.id, object.id, {error_id: null, status: 201});
					}
				});
			});  
			t6console.debug("Building ino sketch");
			res.status(201).send({ "code": 201, message: "Building ino sketch", object: new ObjectSerializer(object).serialize() });
		} else {
			res.status(412).send(new ErrorSerializer({"id": 140, "code": 412, "message": "Source is empty or unknown version"}).serialize());
		}
	} else if ( !object.source_id ) {
		res.status(412).send(new ErrorSerializer({"id": 141, "code": 412, "message": "Source is required"}).serialize());
	} else {
		res.status(404).send(new ErrorSerializer({"id": 9272, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {post} /objects Create new Object
 * @apiName Create new Object
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiBody {String} [name=unamed] Object Name
 * @apiBody {String} [type=default] Object Type, to customize icon on the List
 * @apiBody {String{1024}} [description] Object Description
 * @apiBody {String} [position] Object Location Name
 * @apiBody {String} [longitude] Object Location Longitude
 * @apiBody {String} [latitude] Object Location Latitude
 * @apiBody {String} [ipv4] Object IP v4
 * @apiBody {String} [ipv6] Object IP v6
 * @apiBody {Boolean} [isPublic=false] Flag to allow dedicated page to be viewable from anybody
 * @apiBody {String} [secret_key] Object Secret Key in symmetric signature
 * @apiBody {String} [secret_key_crypt] Object Secret Key in symmetric cryptography
 * @apiBody {String} [fqbn] fqbn
 * @apiBody {Integer} [source_version=0] Source version
 * @apiBody {uuid-v4} [source_id] Source Id
 * @apiBody {uuid-v4} [ui_id] UI Id
 * @apiBody {Object} [communication] Communication parameters
 * @apiBody {String[]="onoff", "lowerupper", "openclose", "setvalgetval"} [communication.allowed_commands] Commands
 * @apiBody {String="restAPI", "messageQueue"} [communication.interface] Interface
 * 
 * @apiUse 201
 * @apiUse 403
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	/* Check for quota limitation */
	var queryQ = { "user_id" : req.user.id };
	var i = (objects.find(queryQ)).length;
	if( i >= (quota[req.user.role]).objects ) {
		t6console.log("QUOTA LIMIT on Objects", req.user.role, i, (quota[req.user.role]).objects);
		res.status(429).send(new ErrorSerializer({"id": 9329, "code": 429, "message": "Too Many Requests"}).serialize());
	} else {
		var newObject = {
			id:				uuid.v4(),
			user_id:		req.user.id,
			type:			typeof req.body.type!=="undefined"?req.body.type:"default",
			name:			typeof req.body.name!=="undefined"?req.body.name:"unamed",
			description:	typeof req.body.description!=="undefined"?(req.body.description).substring(0, 1024):"",
			position:		typeof req.body.position!=="undefined"?req.body.position:"",
			longitude:		typeof req.body.longitude!=="undefined"?req.body.longitude:"",
			latitude:		typeof req.body.latitude!=="undefined"?req.body.latitude:"",
			isPublic:		typeof req.body.isPublic!=="undefined"?req.body.isPublic:"false",
			ipv4:			typeof req.body.ipv4!=="undefined"?req.body.ipv4:"",
			ipv6:			typeof req.body.ipv6!=="undefined"?req.body.ipv6:"",
			source_id:		typeof req.body.source_id!=="undefined"?req.body.source_id:"",
			source_version:	typeof req.body.source_version!=="undefined"?req.body.source_version:0,
			fqbn:			typeof req.body.fqbn!=="undefined"?req.body.fqbn:"",
			secret_key:		typeof req.body.secret_key!=="undefined"?req.body.secret_key:"",
			secret_key_crypt:typeof req.body.secret_key_crypt!=="undefined"?req.body.secret_key_crypt:"",
			ui_id:			typeof req.body.ui_id!=="undefined"?req.body.ui_id:"",
			communication:	typeof req.body.communication!=="undefined"?req.body.communication:undefined,
		};
		if ( req.body.parameters && req.body.parameters.length > 0 ) {
			newObject.parameters = [];
			req.body.parameters.map(function(param) {
				newObject.parameters.push({ name: typeof param.name!=="undefined"?param.name:uuid.v4(), value: typeof param.value!=="undefined"?param.value:"" , type: typeof param.type!=="undefined"?param.type:"String"});
			});
		}
		t6events.addStat("t6Api", "object add", newObject.id, req.user.id);
		t6events.addAudit("t6Api", "object add", req.user.id, newObject.id, {error_id: null, status: 201});
		objects.insert(newObject);
		//t6console.log(newObject);
		
		res.header("Location", "/v"+version+"/objects/"+newObject.id);
		res.status(201).send({ "code": 201, message: "Created", object: new ObjectSerializer(newObject).serialize() });
	}
});

/**
 * @api {put} /objects/:object_id Edit an Object
 * @apiName Edit an Object
 * @apiDescription This endpoint updates an existing object. The payload for the PUT request must include the data that you want to update. For example, you could update the name, description, or location of the object.
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} [object_id] Object Id
 * @apiBody {String} [name] Object Name
 * @apiBody {String} [type] Object Type, to customize icon on the List
 * @apiBody {String{1024}} [description] Object Description
 * @apiBody {String} [position] Object Location Name
 * @apiBody {String} [longitude] Object Location Longitude
 * @apiBody {String} [latitude] Object Location Latitude
 * @apiBody {String} [ipv4] Object IP v4
 * @apiBody {String} [ipv6] Object IP v6
 * @apiBody {Boolean} [isPublic=false] Flag to allow dedicated page to be viewable from anybody
 * @apiBody {Boolean} [is_public=false] Alias of isPublic
 * @apiBody {String} [secret_key] Object Secret Key in symmetric signature
 * @apiBody {String} [secret_key_crypt] Object Secret Key in symmetric cryptography
 * @apiBody {String} [fqbn] fqbn
 * @apiBody {Integer} [source_version] Source version
 * @apiBody {uuid-v4} [source_id] Source Id
 * @apiBody {uuid-v4} [ui_id] UI Id
 * @apiBody {Object} [communication] Communication parameters
 * @apiBody {String[]="onoff", "lowerupper", "openclose", "setvalgetval"} [communication.allowed_commands] Commands
 * @apiBody {String="restAPI", "messageQueue"} [communication.interface] Interface
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 404
 * @apiUse 409
 */
router.put("/:object_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = typeof req.params.object_id==="string"?req.params.object_id:"";
	var query = {
	"$and": [
			{ "id": object_id },
			{ "user_id": req.user.id },
		]
	};
	var object = objects.findOne( query );
	if ( object ) {
		if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - object.meta.revision) !== 0 ) {
			res.status(409).send(new ErrorSerializer({"id": 143, "code": 409, "message": "Bad Request"}).serialize());
		} else {
			var result;
			req.body.isPublic = typeof req.body.isPublic!=="undefined"?req.body.isPublic:typeof req.body.is_public!=="undefined"?req.body.is_public:undefined;
			objects.chain().find({ "id": object_id }).update(function(item) {
				item.type				= typeof req.body.type!=="undefined"?req.body.type:item.type;
				item.name				= typeof req.body.name!=="undefined"?req.body.name:item.name;
				item.description		= typeof req.body.description!=="undefined"?(req.body.description).substring(0, 1024):item.description;
				item.position			= typeof req.body.position!=="undefined"?req.body.position:item.position;
				item.longitude			= typeof req.body.longitude!=="undefined"?req.body.longitude:item.longitude;
				item.latitude			= typeof req.body.latitude!=="undefined"?req.body.latitude:item.latitude;
				item.isPublic			= typeof req.body.isPublic!=="undefined"?req.body.isPublic:item.isPublic;
				item.ipv4				= typeof req.body.ipv4!=="undefined"?req.body.ipv4:item.ipv4;
				item.ipv6				= typeof req.body.ipv6!=="undefined"?req.body.ipv6:item.ipv6;
				item.source_id			= typeof req.body.source_id!=="undefined"?req.body.source_id:item.source_id;
				item.source_version		= typeof req.body.source_version!=="undefined"?req.body.source_version:0;
				item.fqbn				= typeof req.body.fqbn!=="undefined"?req.body.fqbn:item.fqbn;
				item.secret_key			= typeof req.body.secret_key!=="undefined"?req.body.secret_key:item.secret_key;
				item.secret_key_crypt	= typeof req.body.secret_key_crypt!=="undefined"?req.body.secret_key_crypt:item.secret_key_crypt;
				item.ui_id				= typeof req.body.ui_id!=="undefined"?req.body.ui_id:item.ui_id;
				item.communication		= typeof req.body.communication!=="undefined"?req.body.communication:item.communication;
				item.meta.revision		= typeof item.meta.revision==="number"?(item.meta.revision):1;
				result = item;
			});
			if ( typeof req.body.parameters!=="undefined" && req.body.parameters.length > 0 ) {
				result.parameters = [];
				req.body.parameters.map(function(param) {
					result.parameters.push({ name: typeof param.name!=="undefined"?param.name:uuid.v4(), value: typeof param.value!=="undefined"?param.value:"" , type: typeof param.type!=="undefined"?param.type:"String"});
				});
			}
			if ( typeof result!=="undefined" ) {
				db_objects.save();
				res.header("Location", "/v"+version+"/objects/"+object_id);
				res.status(200).send({ "code": 200, message: "Successfully updated", object: new ObjectSerializer(result).serialize() });
			} else {
				res.status(404).send(new ErrorSerializer({"id": 9332, "code": 404, "message": "Not Found"}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({"id": 145, "code": 401, "message": "Forbidden ??"}).serialize());
	}
});

/**
 * @api {delete} /objects/:object_id Delete an Object
 * @apiName Delete an Object
 * @apiDescription This endpoint deletes an existing object. Once you delete an object, it cannot be restored.
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 *
 * @apiParam {uuid-v4} object_id Object Id to be deleted
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/:object_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = typeof req.params.object_id==="string"?req.params.object_id:"";
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only object from current user
			{ "id" : object_id, },
		],
	};
	var o = objects.find(query);
	//t6console.log(o);
	if ( o.length > 0 ) {
		objects.remove(o);
		db_objects.saveDatabase();
		t6events.addAudit("t6Api", "object delete", req.user.id, object_id, {error_id: null, status: 200});
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: object_id }); // TODO: missing serializer
	} else {
		t6events.addAudit("t6Api", "object delete", req.user.id, object_id, {error_id: 9332, status: 404});
		res.status(404).send(new ErrorSerializer({"id": 9332, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {put} /objects/:object_id/:pName Edit Object Custom Parameter
 * @apiName Edit Object Custom Parameter
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 *
 * @apiParam {uuid-v4} object_id Object Id
 * @apiParam {String} pName Custom Parameter Name
 * @apiBody {String} value Custom Parameter Value
 * 
 * @apiUse 201
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 */
router.put("/:object_id([0-9a-z\-]+)/:pName/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = typeof req.params.object_id==="string"?req.params.object_id:"";
	var pName = req.params.pName;
	if ( !object_id ) {
		res.status(405).send(new ErrorSerializer({"id": 133, "code": 405, "message": "Method Not Allowed"}).serialize());
	}
	if ( !req.user.id ) {
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({"id": 134, "code": 401, "message": "Not Authorized"}).serialize());
	} else if ( object_id && typeof req.body.value !== "undefined" ) {
		var query = {
			"$and": [
				{ "user_id" : req.user.id },
				{ "id" : object_id },
			]
		};
		var object = objects.findOne(query);
		
		if ( object ) {
			object.parameters = typeof object.parameters!=="undefined"?object.parameters:[];
			var p = object.parameters.filter(function(e, i) { if ( e.name === pName ) { object.parameters[i].value = req.body.value; return e; } });
			if ( p.length === 0 ) {
				// was not found so we create the custom parameter
				p.push({ name: pName, value: req.body.value , type: "String"});
				object.parameters.push({ name: pName, value: req.body.value , type: "String"});
			}
			if ( p !== null ) {
				db_objects.saveDatabase();
				
				res.header("Location", "/v"+version+"/objects/"+pName);
				res.status(201).send({ "code": 201, message: "Success", name: pName, value: p[0].value });
			} else {
				res.status(404).send(new ErrorSerializer({"id": 120, "code": 404, "message": "Not Found"}).serialize());
			}
		} else {
			res.status(404).send(new ErrorSerializer({"id": 9332, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 122, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/:pName Get Object Custom Parameter
 * @apiName Get Object Custom Parameter
 * @apiGroup 1. Object and User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 *
 * @apiParam {uuid-v4} object_id Object Id
 * @apiParam {String} pName Customer Parameter Name
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 */
router.get("/:object_id([0-9a-z\-]+)/:pName/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = typeof req.params.object_id==="string"?req.params.object_id:"";
	var pName = req.params.pName;
	if ( !object_id ) {
		res.status(405).send(new ErrorSerializer({"id": 136, "code": 405, "message": "Method Not Allowed"}).serialize());
	}
	if ( !req.user.id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({"id": 137, "code": 401, "message": "Not Authorized"}).serialize());
	} else if ( object_id ) {
		var query = {
			"$and": [
				{ "user_id" : req.user.id },
				{ "id" : object_id },
			]
		};
		var object = objects.findOne(query);
		
		if ( object ) {
			var p = object.parameters.filter(function(e) { if ( e.name === pName ) { return e; } });
			if ( p !== null && p[0] ) {
				res.status(200).send({ "code": 200, message: "Success", name: pName, value: p[0].value });
			} else {
				res.status(404).send(new ErrorSerializer({"id": 138, "code": 404, "message": "Not Found"}).serialize());
			}
		} else {
			res.status(404).send(new ErrorSerializer({"id": 139, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 140.2, "code": 403, "message": "Forbidden"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
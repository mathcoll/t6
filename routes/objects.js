"use strict";
var express = require("express");
var router = express.Router();
var nmap = require("libnmap");
var ObjectSerializer = require("../serializers/object");
var ErrorSerializer = require("../serializers/error");
var UISerializer = require("../serializers/ui");
var users;
var objects;
var uis;
var sources;

/**
 * @api {get} /objects/:object_id/ui Get UI for an Object
 * @apiName Get UI for an Object
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/(:object_id([0-9a-z\-]+))/ui", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection("objects");
	uis	= dbUis.getCollection("uis");
	var query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : object_id },
			]
		};
	var object = objects.findOne(query);
	var ui = uis.chain().find({ "id" : object.ui_id }).data();
	if ( ui.length > -1 ) {
		ui.id = object.ui_id;
		ui.object_id = object.id;
		res.status(200).send(new UISerializer(ui).serialize());
	} else {
		res.status(404).send(new ErrorSerializer({"id": 1271, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/show Show an Object UI
 * @apiName Show an Object UI
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 */
router.get("/(:object_id([0-9a-z\-]+))/show", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection("objects");
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
			res.status(404).render("404", { "id": 1271, "code": 404, "error": "Not Found", err: {"stack": "", "status": "404"}});
		}
	} else {
		res.status(404).render("404", { "id": 1272, "code": 404, "error": "Not Found", err: {"stack": "", "status": "404"}});
	}
});

/**
 * @api {get} /objects/:object_id/qrcode/:typenumber/:errorcorrectionlevel Get qrcode for an Object
 * @apiName Get qrcode for an Object
 * @apiGroup 1. Object & User Interfaces
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
 * @apiUse 500
 */
router.get("/(:object_id([0-9a-z\-]+))/qrcode/(:typenumber)/(:errorcorrectionlevel)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	var typenumber = req.params.typenumber;
	var errorcorrectionlevel = typeof req.params.errorcorrectionlevel!=="undefined"?req.params.errorcorrectionlevel:"M";
		
	objects	= db.getCollection("objects");
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
		res.status(404).send(new ErrorSerializer({"id": 127, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id Get Public Object 
 * @apiName Get Public Object
 * @apiGroup 1. Object & User Interfaces
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
 * @apiUse 500
 */
router.get("/(:object_id([0-9a-z\-]+))?/public", function (req, res) {
	var object_id = req.params.object_id;
	var name = req.query.name;
	objects	= db.getCollection("objects");
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
	res.status(200).send(new ObjectSerializer(json).serialize());
});

/**
 * @api {get} /objects/:object_id/latest-version Get Object OTA latest version ready to be deployed
 * @apiName Get Object OTA latest version ready to be deployed
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * 
 * @apiUse 201
 * @apiUse 429
 * @apiUse 500
 */
router.get("/(:object_id([0-9a-z\-]+))/latest-version", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection("objects");
	var object = objects.findOne({ "$and": [ { "user_id" : req.user.id }, { "id" : object_id } ]});
	if ( object && object.ipv4 && object.fqbn ) {

		sources	= dbSources.getCollection("sources");
		// Get root latest version of the source
		let source = sources.findOne({ "root_source_id": object.source_id });
		let buildVersions = new Array();
		if ( source && source.content && source.latest_version ) {
			let version = source.latest_version;
			while(version>-1) {
				let pai = object.fqbn.split(":");
				let packager = pai[0];
				let architecture = pai[1];
				let id = pai[2];
				let binFile = `/${object.source_id}/${version}/${object.id}/${object.id}.${packager}.${architecture}.${id}.bin`;
				if (!fs.existsSync(ota.build_dir+binFile)) {
					buildVersions.push({"version": version, "status": "404 Not Found", "binFile": binFile, "build": sprintf("%s/v%s/objects/%s/build/%s", baseUrl_https, version, object.id, version) });
				} else {
					buildVersions.push({"version": version, "status": "200 Ready to deploy", "binFile": binFile });
				}
				version--;
			}
		}

		res.status(200).send({ "object_id": object_id, "ipv4": object.ipv4, "port": ota.defaultPort, "fqbn": object.fqbn, "source_id": object.source_id, "objectExpectedVersion": object.source_version, "sourceLatestVersion": source.latest_version, "buildVersions": buildVersions });
	} else {
		res.status(404).send(new ErrorSerializer({"id": 601, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/ota-status Get Object OTA status
 * @apiName Get Object OTA status
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * 
 * @apiUse 201
 * @apiUse 429
 * @apiUse 500
 */
router.get("/(:object_id([0-9a-z\-]+))/ota-status/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
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
				res.status(500).send(stderr + error);
				throw new Error(err);
			}
		});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 601, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /objects/ Get Object(s)
 * @apiName Get Object(s)
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * @apiParam {String} [name] Object Name you want to search for; this is using an case-insensitive regexp
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/(:object_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	objects	= db.getCollection("objects");
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
		let i = t6ConnectedObjects.indexOf(o.id);
		if (i > -1) {
			o.is_connected = true;
		} else {
			o.is_connected = false;
		}
		t6console.debug("is_connected=" + o.is_connected);
		if (typeof o.source_id!=="undefined" && !o.source_version) {
			o.source_version = 0;
		}
		if (typeof o.source_id!=="undefined") {
			o.otahist = t6otahistory.getLastEvent(req.user.id, o.id);
		}
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
 * @api {post} /objects/:object_id/unlink/:source_id Unlink Object from the selected Source
 * @apiName Unlink Object from the selected Source
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * @apiParam {uuid-v4} [source_id] Source Id
 * 
 * @apiUse 201
 * @apiUse 412
 * @apiUse 429
 * @apiUse 500
 */
router.post("/(:object_id([0-9a-z\-]+))/unlink/(:source_id([0-9a-z\-]+))", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	var source_id = req.params.source_id;
	objects	= db.getCollection("objects");
	var object = objects.findOne({ "$and": [ { "user_id" : req.user.id }, { "id" : object_id } ]});
	if ( object ) {
		if(object.source_id == source_id) {
			let result;
			objects.chain().find({ "id": object_id }).update(function(item) {
				item.source_id = "";
				item.source_version = "";
				result = item;
			});
			if ( typeof result!=="undefined" ) {
				db.save();
				res.header("Location", "/v"+version+"/objects/"+object_id);
				res.status(200).send({ "code": 200, message: "Successfully updated", object: new ObjectSerializer(result).serialize() });
			} else {
				res.status(412).send(new ErrorSerializer({"id": 185, "code": 412, "message": "Not Found"}).serialize());
			}
		} else {
			res.status(412).send(new ErrorSerializer({"id": 186, "code": 412, "message": "Source not match: Precondition Failed"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 187, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {post} /objects/:object_id/build Build an Arduino source for the selected object
 * @apiName Build an Arduino source for the selected object
 * @apiGroup 1. Object & User Interfaces
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
	var object_id = req.params.object_id;
	objects	= db.getCollection("objects");

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
		if ( source && source.content ) {
			// This is a temporary solution...
			let exec = require("child_process").exec;

			let odir = `${ota.build_dir}/${object.source_id}`;
			if (!fs.existsSync(odir)) fs.mkdirSync(odir);
			
			let vdir = `${ota.build_dir}/${object.source_id}/${version}`;
			if (!fs.existsSync(vdir)) { fs.mkdirSync(vdir); }
			
			let dir = `${ota.build_dir}/${object.source_id}/${version}/${object.id}`;
			if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }

			fs.writeFile(`${dir}/${object.id}.ino`, source.content, function (err) {
				if (err) throw err;
				t6console.log("File is created successfully.", `${dir}/${object.id}.ino`);
				t6console.log("Using version ", version);
				
				let fqbn = object.fqbn!==""?object.fqbn:ota.fqbn;
				t6console.log("Building ino sketch using fqbn=", fqbn);
				
				let start = new Date();
				t6console.log("Exec=", `${ota.arduino_binary_cli} --config-file ${ota.config} --fqbn ${fqbn} --verbose compile ${dir}`);
				const child = exec(`${ota.arduino_binary_cli} --config-file ${ota.config} --fqbn ${fqbn} --verbose compile ${dir}`);
				child.on("close", (code) => {
					t6console.log(`child process exited with code ${code}`);
					users	= db.getCollection("users");
					let user = users.findOne({"id": req.user.id });
					if (code === 0) {
						if (user && typeof user.pushSubscription !== "undefined" ) {
							var payload = "{\"type\": \"message\", \"title\": \"Arduino Build\", \"body\": \"Build is completed on v"+version+".\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
							t6notifications.sendPush(user.pushSubscription, payload);
						}
						t6otahistory.addEvent(req.user.id, object.id, {fqbn: object.fqbn, ip: object.ipv4}, object.source_id, object.source_version, "build", "success", new Date()-start);
					} else {
						if (user && typeof user.pushSubscription !== "undefined" ) {
							var payload = "{\"type\": \"message\", \"title\": \"Arduino Build\", \"body\": \"An error occured during build v"+version+" (code = "+code+").\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
							t6notifications.sendPush(user.pushSubscription, payload);
						}
						t6otahistory.addEvent(req.user.id, object.id, {fqbn: object.fqbn, ip: object.ipv4}, object.source_id, object.source_version, "build", "failure", new Date()-start);
					}
				});
			});  

			res.status(201).send({ "code": 201, message: "Building ino sketch", object: new ObjectSerializer(object).serialize() });
		} else {
			res.status(412).send(new ErrorSerializer({"id": 140, "code": 412, "message": "Source is empty or unknown version"}).serialize());
		}
	} else if ( !object.source_id ) {
		res.status(412).send(new ErrorSerializer({"id": 141, "code": 412, "message": "Source is required"}).serialize());
	} else {
		res.status(404).send(new ErrorSerializer({"id": 142, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {post} /objects Create new Object
 * @apiName Create new Object
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Object Name
 * @apiParam {String} [type=default] Object Type, to customize icon on the List
 * @apiParam {String{1024}} [description] Object Description
 * @apiParam {String} [position] Object Location Name
 * @apiParam {String} [longitude] Object Location Longitude
 * @apiParam {String} [latitude] Object Location Latitude
 * @apiParam {String} [ipv4] Object IP v4
 * @apiParam {String} [ipv6] Object IP v6
 * @apiParam {Boolean} [isPublic=false] Flag to allow dedicated page to be viewable from anybody
 * @apiParam {String} [secret_key] Object Secret Key in symmetric signature
 * @apiParam {String} [secret_key_crypt] Object Secret Key in symmetric cryptography
 * @apiParam {String} [fqbn] fqbn
 * @apiParam {Integer} [source_version=0] Source version
 * @apiParam {uuid-v4} [source_id] Source Id
 * @apiParam {uuid-v4} [ui_id] UI Id
 * @apiParam {Object} [communication] Communication parameters
 * @apiParam {String[]="onoff", "lowerupper", "openclose", "setvalgetval"} [communication.allowed_commands] Commands
 * @apiParam {String="restAPI", "messageQueue"} [communication.interface] Interface
 * 
 * @apiUse 201
 * @apiUse 403
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	objects	= db.getCollection("objects");
		
	/* Check for quota limitation */
	var queryQ = { "user_id" : req.user.id };
	var i = (objects.find(queryQ)).length;
	if( i >= (quota[req.user.role]).objects ) {
		res.status(429).send(new ErrorSerializer({"id": 129, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize());
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
		t6events.add("t6Api", "object add", newObject.id, req.user.id);
		objects.insert(newObject);
		//t6console.log(newObject);
		
		res.header("Location", "/v"+version+"/objects/"+newObject.id);
		res.status(201).send({ "code": 201, message: "Created", object: new ObjectSerializer(newObject).serialize() });
	}
});

/**
 * @api {put} /objects/:object_id Edit an Object
 * @apiName Edit an Object
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [object_id] Object Id
 * @apiParam {String} [name] Object Name
 * @apiParam {String} [type] Object Type, to customize icon on the List
 * @apiParam {String{1024}} [description] Object Description
 * @apiParam {String} [position] Object Location Name
 * @apiParam {String} [longitude] Object Location Longitude
 * @apiParam {String} [latitude] Object Location Latitude
 * @apiParam {String} [ipv4] Object IP v4
 * @apiParam {String} [ipv6] Object IP v6
 * @apiParam {Boolean} [isPublic=false] Flag to allow dedicated page to be viewable from anybody
 * @apiParam {Boolean} [is_public=false] Alias of isPublic
 * @apiParam (meta) {Integer} [meta.revision] If set to the current revision of the resource (before PUTing), the value is checked against the current revision in database.
 * @apiParam {String} [secret_key] Object Secret Key in symmetric signature
 * @apiParam {String} [secret_key_crypt] Object Secret Key in symmetric cryptography
 * @apiParam {String} [fqbn] fqbn
 * @apiParam {Integer} [source_version] Source version
 * @apiParam {uuid-v4} [source_id] Source Id
 * @apiParam {uuid-v4} [ui_id] UI Id
 * @apiParam {Object} [communication] Communication parameters
 * @apiParam {String[]="onoff", "lowerupper", "openclose", "setvalgetval"} [communication.allowed_commands] Commands
 * @apiParam {String="restAPI", "messageQueue"} [communication.interface] Interface
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 404
 * @apiUse 409
 */
router.put("/:object_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection("objects");
	//t6console.log(objects);
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
				db.save();

				res.header("Location", "/v"+version+"/objects/"+object_id);
				res.status(200).send({ "code": 200, message: "Successfully updated", object: new ObjectSerializer(result).serialize() });
			} else {
				res.status(404).send(new ErrorSerializer({"id": 144, "code": 404, "message": "Not Found"}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({"id": 145, "code": 401, "message": "Forbidden ??"}).serialize());
	}
});

/**
 * @api {delete} /objects/:object_id Delete an Object
 * @apiName Delete an Object
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/:object_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection("objects");
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
		db.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: object_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 131, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {put} /objects/:object_id/:pName Edit Object Custom Parameter
 * @apiName Edit Object Custom Parameter
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} object_id Object Id
 * @apiParam {String} pName Customer Parameter Name
 * @apiParam {String} value Customer Parameter Value
 * 
 * @apiUse 201
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 */
router.put("/:object_id([0-9a-z\-]+)/:pName/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var object_id = req.params.object_id;
	var pName = req.params.pName;
	if ( !object_id ) {
		res.status(405).send(new ErrorSerializer({"id": 133, "code": 405, "message": "Method Not Allowed"}).serialize());
	}
	if ( !req.user.id ) {
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({"id": 134, "code": 401, "message": "Not Authorized"}).serialize());
	} else if ( object_id && typeof req.body.value !== "undefined" ) {
		objects	= db.getCollection("objects");
		var query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "id" : object_id },
				]
			};
		var object = objects.findOne(query);
		
		if ( object ) {
			object.parameters = typeof object.parameters!=="undefined"?object.parameters:[];
			var p = object.parameters.filter(function(e, i) { if ( e.name == pName ) { object.parameters[i].value = req.body.value; return e; } });
			if ( p.length === 0 ) {
				// was not found so we create the custom parameter
				p.push({ name: pName, value: req.body.value , type: "String"});
				object.parameters.push({ name: pName, value: req.body.value , type: "String"});
			}
			if ( p !== null ) {
				db.saveDatabase();
				
				res.header("Location", "/v"+version+"/objects/"+pName);
				res.status(201).send({ "code": 201, message: "Success", name: pName, value: p[0].value });
			} else {
				res.status(404).send(new ErrorSerializer({"id": 120, "code": 404, "message": "Not Found"}).serialize());
			}
		} else {
			res.status(404).send(new ErrorSerializer({"id": 121, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 122, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /objects/:object_id/:pName Get Object Custom Parameter
 * @apiName Get Object Custom Parameter
 * @apiGroup 1. Object & User Interfaces
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
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
	var object_id = req.params.object_id;
	var pName = req.params.pName;
	if ( !object_id ) {
		res.status(405).send(new ErrorSerializer({"id": 136, "code": 405, "message": "Method Not Allowed"}).serialize());
	}
	if ( !req.user.id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({"id": 137, "code": 401, "message": "Not Authorized"}).serialize());
	} else if ( object_id ) {
		objects	= db.getCollection("objects");
		var query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "id" : object_id },
				]
			};
		var object = objects.findOne(query);
		
		if ( object ) {
			var p = object.parameters.filter(function(e) { if ( e.name == pName ) { return e; } });
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

module.exports = router;

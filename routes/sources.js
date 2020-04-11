"use strict";
var express = require("express");
var router = express.Router();
var SourceSerializer = require("../serializers/source");
var ObjectSerializer = require("../serializers/object");
var ErrorSerializer = require("../serializers/error");
var sources;

/**
 * @api {get} /sources/:source_id Get Source(s)
 * @apiName Get Source(s)
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [rule_id] Rule Id
 * @apiParam {String} [name] Rule name
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/?(:source_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var source_id = req.params.source_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	sources	= dbSources.getCollection("sources");
	var query;
	if ( typeof source_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : source_id },
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
					{ "version" : 0 },
				]
			};
		}
	}
	var json = sources.chain().find(query).offset(offset).limit(size).data();
	t6console.debug(query);

	var total = sources.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	res.status(200).send(new SourceSerializer(json).serialize());
});

/**
 * @api {get} /sources/:source_id/child Get Children of Source
 * @apiName Get Children of Source
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [rule_id] Parent Rule Id
 * @apiParam {String} [name] Rule name
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/:source_id([0-9a-z\-]+)/child", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var source_id = req.params.source_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	sources	= dbSources.getCollection("sources");
	var query = {
	"$and": [
			{ "user_id" : req.user.id },
			{ "parent_source_id" : source_id },
		]
	};
	var json = sources.chain().find(query).offset(offset).limit(size).data();
	t6console.debug(query);

	var total = sources.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	res.status(200).send(new SourceSerializer(json).serialize());
});

/**
 * @api {post} /sources Create new Source
 * @apiName Create new Source
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	sources	= dbSources.getCollection("sources");
	if ( typeof req.user.id !== "undefined" ) {
		var source_id = uuid.v4();
		let content;
		if ( Array.isArray(req.body.content) ) {
			content = req.body.content.join("\n");
		} else {
			content = req.body.content;
		}
		var newSource = {
			id:			source_id,
			root_source_id: source_id,
			version:	0,
			latest_version:	0,
			user_id:	req.user.id,
			name:		typeof req.body.name!=="undefined"?req.body.name:"",
			content:	content,
			password:	typeof req.body.password!=="undefined"?req.body.password:"",
		};
		t6events.add("t6Api", "source add", newSource.id);
		sources.insert(newSource);
		//t6console.log(sources);
		
		res.header("Location", "/v"+version+"/sources/"+newSource.id);
		res.status(201).send({ "code": 201, message: "Created", source: new SourceSerializer(newSource).serialize() });
	}
});

/**
 * @api {put} /sources/:source_id Edit a Source
 * @apiName Edit a Source
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [source_id] Source Id
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
router.put("/:source_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var parent_source_id = req.params.source_id;
	sources	= dbSources.getCollection("sources");
	var query = {
		"$and": [
				{ "id": parent_source_id },
				{ "user_id": req.user.id },
			]
		};
	let parent = sources.findOne( query );
	var queryRoot = {
			"$and": [
					{ "id": parent.root_source_id },
					{ "user_id": req.user.id },
				]
			};
	let root = sources.findOne( queryRoot );
	
	// This will create a new version instead of overwritting the current id
	if (root && parent && parent_source_id) {
		var source_id = uuid.v4();
		let content;
		if ( Array.isArray(req.body.content) ) {
			content = req.body.content.join("\n");
		} else {
			content = req.body.content;
		}
		var newSource = {
			id:					source_id,
			parent_source_id:	parent_source_id,
			root_source_id:		root.id,
			user_id:			req.user.id,
			name:				typeof req.body.name!=="undefined"?req.body.name:parent.name,
			content:			content,
			version:			root.latest_version+1,
			password:			typeof req.body.password!=="undefined"?req.body.password:parent.password,
		};
		var result;
		
		sources.data = sources.data.filter(doc => typeof doc.$loki === 'number' && typeof doc.meta === 'object')
		sources.ensureId();
		sources.ensureAllIndexes(true);
		  
		sources.chain().find({ "id": root.id }).update(function(r) {
			t6console.log("r", r);
			r.latest_version	= r.latest_version+1;
			r.latest_version_id = source_id
			result = r;
			t6console.log("result123", result);
		});
		t6console.log("result456", result);
		if (typeof result!=="undefined") {
			dbSources.save();
			t6console.log("result789", result);
			sources.insert(newSource);
			t6events.add("t6Api", "source add child", newSource.id);

			res.header("Location", "/v"+version+"/sources/"+source_id);
			res.status(200).send({ "code": 200, message: "Successfully updated", source: new SourceSerializer(newSource).serialize() });
		} else {
			res.status(404).send(new ErrorSerializer({"id": 641.5, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 640.5, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {delete} /sources/:source_id Delete a Source
 * @apiName Delete a Source
 * @apiGroup 6. Source and Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [source_id] Source Id
 */
router.delete("/:source_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var source_id = req.params.source_id;
	if ( !source_id ) {
		res.status(405).send(new ErrorSerializer({"id": 636, "code": 405, "message": "Method Not Allowed"}).serialize());
	}
	if ( !req.user.id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({"id": 637, "code": 401, "message": "Not Authorized"}).serialize());
	} else if ( source_id ) {
		sources	= dbSources.getCollection("sources");
		var query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "id" : source_id },
				]
			};
		let source = sources.findOne(query);
		if ( source ) {
			sources.remove(source);
			dbSources.saveDatabase();
			res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: source_id }); // TODO: missing serializer
		} else {
			res.status(404).send(new ErrorSerializer({"id": 639, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 640.2, "code": 403, "message": "Forbidden"}).serialize());
	}
});

module.exports = router;

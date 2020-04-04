"use strict";
var express = require("express");
var router = express.Router();
var SourceSerializer = require("../serializers/source");
var ErrorSerializer = require("../serializers/error");
var sources;

/**
 * @api {get} /sources/:rule_id Get Source(s)
 * @apiName Get Source(s)
 * @apiGroup 6. Source & Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [rule_id] Rule Id
 * @apiParam {String} [name] Rule name
 * @apiParam {String} [rule] Stringified Rule
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
 * @api {post} /sources Create new Source
 * @apiName Create new Source
 * @apiGroup 6. Source & Over The Air (OTA)
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
			user_id:	req.user.id,
			name:		typeof req.body.name!=="undefined"?req.body.name:"",
			content:	content,
			version:	typeof req.body.version!=="undefined"?req.body.version:"",
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
 * @api {put} /rules/:rule_id Edit a Source
 * @apiName Edit a Source
 * @apiGroup 6. Source & Over The Air (OTA)
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
	var source_id = req.params.source_id;
	if ( source_id ) {
		sources	= dbSources.getCollection("sources");
		var query = {
			"$and": [
					{ "id": source_id },
					{ "user_id": req.user.id },
				]
			};
		var source = sources.findOne( query );
		if ( source ) {
			if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - source.meta.revision) !== 0 ) {
				res.status(400).send(new ErrorSerializer({"id": 639.2, "code": 400, "message": "Bad Request"}).serialize());
			} else {
				let result;
				let content;
				if ( Array.isArray(req.body.content) ) {
					content = req.body.content.join("\n");
				} else {
					content = req.body.content;
				}
				sources.chain().find({ "id": source_id }).update(function(item) {
					item.user_id	= item.user_id,
					item.name		= typeof req.body.name!=="undefined"?req.body.name:item.name;
					item.content	= content;
					item.version	= typeof req.body.version!=="undefined"?req.body.version:item.version;
					item.password	= typeof req.body.password!=="undefined"?req.body.password:item.password;
					//item.meta.revision = (req.body.meta.revision)+1;
					result = item;
				});
				if ( typeof result !== "undefined" ) {
					dbSources.save();
					
					res.header("Location", "/v"+version+"/sources/"+source_id);
					res.status(200).send({ "code": 200, message: "Successfully updated", source: new SourceSerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 640, "code": 404, "message": "Not Found"}).serialize());
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 642, "code": 401, "message": "Forbidden ??"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 640.5, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {delete} /sources/:source_id Delete a Source
 * @apiName Delete a Source
 * @apiGroup 6. Source & Over The Air (OTA)
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [source_id] Source Id
 */
router.delete("/:source_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	res.status(404).send(new ErrorSerializer({"id": 650, "code": 404, "message": "Not Found"}).serialize());
});

module.exports = router;

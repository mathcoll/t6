"use strict";
var express = require("express");
var router = express.Router();
var UISerializer = require("../serializers/ui");
var ErrorSerializer = require("../serializers/error");
var uis;

/**
 * @api {get} /uis/:ui_id Get UIs
 * @apiName Get UIs
 * @apiGroup 1. Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [ui_id] UI Id
 * @apiParam {String} [name] 
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/(:ui_id([0-9a-z\-]+))?/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var ui_id = req.params.ui_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	uis	= dbUis.getCollection("uis");
	var query;
	if ( typeof ui_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : ui_id },
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
	var json = uis.chain().find(query).offset(offset).limit(size).data();

	var total = uis.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;

	if ( json.length > 0 ) {
		res.status(200).send(new UISerializer(json).serialize());
	} else {
		res.status(404).send(new ErrorSerializer({"id": 137, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {post} /uis Create new UI
 * @apiName Create new UI
 * @apiGroup 1. Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {json} UI
 * 
 * @apiUse 201
 * @apiUse 403
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	uis	= dbUis.getCollection("uis");

	/* Check for quota limitation */
	var queryQ = { "user_id" : req.user.id };
	var i = (uis.find(queryQ)).length;
	if( i >= (quota[req.user.role]).uis ) {
		res.status(429).send(new ErrorSerializer({"id": 129, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize());
	} else {
		let newUi = {"ui": req.body};
		newUi.id = uuid.v4();
		newUi.user_id = req.user.id;
		t6events.add("t6Api", "ui add", newUi.id, req.user.id);
		uis.insert(newUi);
		res.header("Location", "/v"+version+"/uis/"+newUi.id);
		res.status(201).send({ "code": 201, message: "Created", ui: new UISerializer(newUi).serialize() });
	}
});

/**
 * @api {put} /uis/:ui_id Edit a UI
 * @apiName Edit a UI
 * @apiGroup 1. Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [ui_id] UI Id
 * @apiParam {json} UI
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 404
 * @apiUse 409
 */
router.put("/:ui_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var ui_id = req.params.ui_id;
	uis	= dbUis.getCollection("uis");
	var query = {
		"$and": [
				{ "id": ui_id },
				{ "user_id": req.user.id },
			]
		};
	var ui = uis.findOne( query );
	if ( ui ) {
		if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - ui.meta.revision) !== 0 ) {
			res.status(409).send(new ErrorSerializer({"id": 143, "code": 409, "message": "Bad Request"}).serialize());
		} else {
			var result;
			uis.chain().find({ "id": ui_id }).update(function(item) {
				item.ui	= typeof req.body!=="undefined"?req.body:item.ui;
				item.meta.revision = typeof item.meta.revision==="number"?(item.meta.revision):1;
				result = item;
			});
			if ( typeof result!=="undefined" ) {
				dbUis.save();

				res.header("Location", "/v"+version+"/uis/"+ui_id);
				res.status(200).send({ "code": 200, message: "Successfully updated", ui: new UISerializer(result).serialize() });
			} else {
				res.status(404).send(new ErrorSerializer({"id": 144, "code": 404, "message": "Not Found"}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({"id": 145, "code": 401, "message": "Forbidden ??"}).serialize());
	}
});

/**
 * @api {delete} /uis/:ui_id Delete a UI
 * @apiName Delete a UI
 * @apiGroup 1. Object
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} ui_id UI Id
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/:ui_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var ui_id = req.params.ui_id;
	uis	= dbUis.getCollection("uis");
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only uis from current user
			{ "id" : ui_id, },
		],
	};
	var u = uis.find(query);
	//t6console.log(u);
	if ( u.length > 0 ) {
		uis.remove(u);
		dbUis.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: ui_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 131, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

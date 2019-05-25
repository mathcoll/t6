"use strict";
var express = require("express");
var router = express.Router();
var SnippetSerializer = require("../serializers/snippet");
var ErrorSerializer = require("../serializers/error");
var snippets;
var users;
var tokens;

/**
 * @api {get} /snippets/:snippet_id Get Snippet(s)
 * @apiName Get Snippet(s)
 * @apiGroup 4. Snippet
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [snippet_id] Snippet Id
 * @apiParam {String} [name] 
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/(:snippet_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var snippet_id = req.params.snippet_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	snippets	= dbSnippets.getCollection("snippets");
	var query;
	if ( typeof snippet_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : snippet_id },
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
	var json = snippets.chain().find(query).offset(offset).limit(size).data();
	//console.log(query);

	var total = snippets.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	if ( json.length>0 ) {
		res.status(200).send(new SnippetSerializer(json).serialize());
	} else {
		res.status(404).send(new ErrorSerializer({"id": 128, "code": 404, "message": "Not Found",}).serialize());
	}
});

/**
 * @api {post} /snippets Create new Snippet
 * @apiName Create new Snippet
 * @apiGroup 4. Snippet
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Snippet Name
 * @apiParam {String} [type] Snippet Type
 * @apiParam {String} [icon] Snippet Icon
 * @apiParam {String} [color] Snippet Color
 * @apiParam {String[]} [flows] List of Flow Ids
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	snippets	= dbSnippets.getCollection("snippets");
	/* Check for quota limitation */
	var queryQ = { "user_id" : req.user.id };
	var i = (snippets.find(queryQ)).length;
	if( i >= (quota[req.user.role]).snippets ) {
		res.status(429).send(new ErrorSerializer({"id": 129, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize());
	} else {
		if ( typeof req.user.id !== "undefined" ) {
			var snippet_id = uuid.v4();
			var newSnippet = {
				id:			snippet_id,
				user_id:	req.user.id,
				name:		typeof req.body.name!=="undefined"?req.body.name:"unamed",
				type:		typeof req.body.type!=="undefined"?req.body.type:"",
				icon:		typeof req.body.icon!=="undefined"?req.body.icon:"",
				color:		typeof req.body.color!=="undefined"?req.body.color:"",
				flows:		typeof req.body.flows!=="undefined"?req.body.flows:new Array(),
			};
			t6events.add("t6Api", "snippet add", newSnippet.id);
			snippets.insert(newSnippet);
			//console.log(snippets);
			
			res.header("Location", "/v"+version+"/snippets/"+newSnippet.id);
			res.status(201).send({ "code": 201, message: "Created", snippet: new SnippetSerializer(newSnippet).serialize() });
		}
	}
});

/**
 * @api {put} /snippets/:snippet_id Edit a Snippet
 * @apiName Edit a Snippet
 * @apiGroup 4. Snippet
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Snippet Name
 * @apiParam {String} [type] Snippet Type
 * @apiParam {String} [icon] Snippet Icon
 * @apiParam {String} [color] Snippet Color
 * @apiParam {String[]} [flows] List of Flow Ids
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
router.put("/:snippet_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var snippet_id = req.params.snippet_id;
	if ( snippet_id ) {
		snippets	= dbSnippets.getCollection("snippets");
		var query = {
				"$and": [
						{ "id": snippet_id },
						{ "user_id": req.user.id },
					]
				}
		var snippet = snippets.findOne( query );
		if ( snippet ) {
			if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - snippet.meta.revision) !== 0 ) {
				res.status(400).send(new ErrorSerializer({"id": 39.2, "code": 400, "message": "Bad Request"}).serialize());
			} else {
				var result;
				snippets.chain().find({ "id": snippet_id }).update(function(item) {
					item.name		= typeof req.body.name!=="undefined"?req.body.name:item.name;
					item.type		= typeof req.body.type!=="undefined"?req.body.type:item.type;
					item.icon		= typeof req.body.icon!=="undefined"?req.body.icon:item.icon;
					item.color		= typeof req.body.color!=="undefined"?req.body.color:item.color;
					item.flows		= typeof req.body.flows!=="undefined"?req.body.flows:item.flows;
					item.meta.revision = ++(req.body.meta.revision);
					result = item;
				});
				if ( typeof result !== "undefined" ) {
					dbSnippets.save();
					
					res.header("Location", "/v"+version+"/snippets/"+snippet_id);
					res.status(200).send({ "code": 200, message: "Successfully updated", snippet: new SnippetSerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 40, "code": 404, "message": "Not Found"}).serialize());
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 42, "code": 401, "message": "Forbidden ??"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 40.5, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {delete} /snippets/:snippet_id Delete a Snippet
 * @apiName Delete a Snippet
 * @apiGroup 4. Snippet
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} snippet_id Snippet Id
 */
router.delete("/:snippet_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var snippet_id = req.params.snippet_id;
	snippets	= dbSnippets.getCollection("snippets");
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only snippet from current user
			{ "id" : snippet_id, },
		],
	};
	var s = snippets.find(query);
	//console.log(s);
	if ( s.length > 0 ) {
		snippets.remove(s);
		dbSnippets.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: snippet_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 32, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

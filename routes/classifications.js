"use strict";
var express = require("express");
var router = express.Router();
var CategorySerializer = require("../serializers/category");
var AnnotationSerializer = require("../serializers/annotation");
var ErrorSerializer = require("../serializers/error");
var categories;

/**
 * @api {get} /classifications/categories/:category_id Get Category of classification
 * @apiName Get Category of classification
 * @apiGroup 11. Classification
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [category_id] Category Id
 * @apiParam {String} [name] Category name
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 405
 * @apiUse 429
 */
router.get("/categories/(:category_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var category_id = req.params.category_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	categories	= db_classifications.getCollection("categories");
	var query;
	if ( typeof category_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : category_id },
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
	var json = categories.chain().find(query).offset(offset).limit(size).data();

	var total = categories.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	json = json.length>0?json:[];

	res.status(200).send(new CategorySerializer(json).serialize());
});

/**
 * @api {post} /classifications/categories/ Create new Category for classification
 * @apiName Create new Category for classification
 * @apiGroup 11. Classification
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiBody {String} [name=unamed] Category Name
 * @apiBody {String} [color] Color
 * @apiBody {String{1024}} [description] Object Description
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post("/categories/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	categories	= db_classifications.getCollection("categories");
	/* Check for quota limitation */
	var queryR = { "user_id" : req.user.id };
	var i = (categories.find(queryR)).length;
	if( i >= (quota[req.user.role]).categories ) {
		res.status(429).send(new ErrorSerializer({"id": 18329, "code": 429, "message": "Too Many Requests"}).serialize());
	} else {
		if ( typeof req.user.id !== "undefined" ) {
			var category_id = uuid.v4();
			var newCategory = {
				id:			category_id,
				user_id:	req.user.id,
				name: 		typeof req.body.name!=="undefined"?req.body.name:"unamed",
				color: 		typeof req.body.color!=="undefined"?req.body.color:"",
				description:typeof req.body.description!=="undefined"?(req.body.description).substring(0, 1024):"",
			};
			t6events.addStat("t6Api", "category add", newCategory.id, req.user.id);
			t6events.addAudit("t6Api", "category add", req.user.id, newCategory.id, {error_id: null, status: 201});
			categories.insert(newCategory);
			
			res.header("Location", "/v"+version+"/categories/"+newCategory.id);
			res.status(201).send({ "code": 201, message: "Created", category: new CategorySerializer(newCategory).serialize() });
		}
	}
});

/**
 * @api {put} /classifications/categories/:category_id/ Edit a Category
 * @apiName Edit a Category
 * @apiGroup 11. Classification
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [category_id] Category Id
 * @apiBody {String} [name=unamed] Category Name
 * @apiBody {String} [color] Color
 * @apiBody {String{1024}} [description] Object Description
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 * @apiUse 409
 * @apiUse 429
 */
router.put("/categories/:category_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var category_id = req.params.category_id;
	if ( category_id ) {
		categories	= db_classifications.getCollection("categories");
		var query = {
			"$and": [
					{ "id": category_id },
					{ "user_id": req.user.id },
				]
			};
		var category = categories.findOne( query );
		if ( category ) {
			if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - category.meta.revision) !== 0 ) {
				res.status(409).send(new ErrorSerializer({"id": 18001, "code": 409, "message": "Bad Request"}).serialize());
			} else {
				var result;
				categories.chain().find({ "id": category_id }).update(function(item) {
					item.name		= typeof req.body.name!=="undefined"?req.body.name:item.name;
					item.color		= typeof req.body.color!=="undefined"?req.body.color:item.color;
					item.description= typeof req.body.description!=="undefined"?(req.body.description).substring(0, 1024):item.description;
					result = item;
				});
				if ( typeof result !== "undefined" ) {
					db_classifications.save();

					res.header("Location", "/v"+version+"/categories/"+category_id);
					res.status(200).send({ "code": 200, message: "Successfully updated", category: new CategorySerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 18273, "code": 404, "message": "Not Found"}).serialize());
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 18272, "code": 401, "message": "Forbidden"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 18271, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {delete} /classifications/categories/:category_id Delete a Category
 * @apiName Delete a Category
 * @apiGroup 11. Classification
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [category_id] Category Id to be deleted
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/categories/:category_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var category_id = req.params.category_id;
	categories	= db_classifications.getCollection("categories");
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only category from current user
			{ "id" : category_id, },
		],
	};
	var c = categories.find(query);
	if ( c.length > 0 ) {
		categories.remove(c);
		db_classifications.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: category_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 532, "code": 404, "message": "Not Found"}).serialize());
	}
});


/**
 * @api {post} /classifications/annotations/ Add an annotation to a Flow
 * @apiName Add an annotation to a Flow
 * @apiGroup 11. Classification
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [category_id] Category Id to be deleted
 * @apiParam {String} [from_ts] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiParam {String} [to_ts] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.post("/annotations/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let from_ts;
	let to_ts;
	if(req.body.from_ts && req.body.to_ts) {
		if (moment(req.body.from_ts).isBefore(req.body.to_ts)) {
			from_ts = moment(req.body.from_ts).format("x")*1000;
			to_ts = moment(req.body.to_ts).format("x")*1000;
		} else {
			from_ts = moment(req.body.to_ts).format("x")*1000;
			to_ts = moment(req.body.from_ts).format("x")*1000;
		}
	}
	if ( typeof req.user.id!=="undefined" && typeof req.body.flow_id!=="undefined" && typeof req.body.category_id!=="undefined" && from_ts!==null && to_ts!==null ) {
		let newAnnotation = annotate(req.user.id, from_ts, to_ts, req.body.category_id, req.body.flow_id);
		res.header("Location", "/v"+version+"/annotations/"+newAnnotation.id);
		res.status(201).send({ "code": 201, message: "Created", annotation: new AnnotationSerializer(newAnnotation).serialize() });
	} else {
		res.status(409).send(new ErrorSerializer({"id": 18001, "code": 409, "message": "Bad Request"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;

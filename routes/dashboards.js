"use strict";
var express = require("express");
var router = express.Router();
var DashboardSerializer = require("../serializers/dashboard");
var ErrorSerializer = require("../serializers/error");
var dashboards;

/**
 * @api {get} /dashboards/:dashboard_id Get Dashboards
 * @apiName Get Dashboards
 * @apiGroup 3. Dashboard
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [dashboard_id] Dashboard Id
 * @apiParam {String} [name] 
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 */
router.get("/?(:dashboard_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var dashboard_id = req.params.dashboard_id;
	var name = req.query.name;
	var size = typeof req.query.size !== "undefined"?req.query.size:20;
	var page = typeof req.query.page !== "undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	dashboards	= dbDashboards.getCollection("dashboards");
	var query;
	if ( typeof dashboard_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : dashboard_id },
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
	var json = dashboards.chain().find(query).offset(offset).limit(size).data();
	t6console.debug(query);

	var total = dashboards.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	json = json.length>0?json:[];
	res.status(200).send(new DashboardSerializer(json).serialize());
});

/**
 * @api {post} /dashboards Create new Dashboard
 * @apiName Create new Dashboard
 * @apiGroup 3. Dashboard
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiBody {String} [name=unamed] Dashboard Name
 * @apiBody {String} [description] Dashboard Description
 * @apiBody {String[]} [snippets] List of Snippets Ids
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	dashboards	= dbDashboards.getCollection("dashboards");
	/* Check for quota limitation */
	var queryQ = { "user_id" : req.user.id };
	var i = (dashboards.find(queryQ)).length;
	if( i >= (quota[req.user.role]).dashboards ) {
		res.status(429).send(new ErrorSerializer({"id": 1329, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize());
	} else {
		if ( typeof req.user.id !== "undefined" ) {
			var dashboard_id = uuid.v4();
			var new_dashboard = {
				id:			dashboard_id,
				user_id:	req.user.id,
				name: 		typeof req.body.name!=="undefined"?req.body.name:"unamed",
				description:typeof req.body.description!=="undefined"?req.body.description:"",
				snippets:	typeof req.body.snippets!=="undefined"?req.body.snippets:new Array(),
			};
			t6events.addStat("t6Api", "dashboard add", new_dashboard.id, req.user.id);
			dashboards.insert(new_dashboard);
			//t6console.log(dashboards);
			
			res.header("Location", "/v"+version+"/dashboards/"+new_dashboard.id);
			res.status(201).send({ "code": 201, message: "Created", dashboard: new DashboardSerializer(new_dashboard).serialize() });
		}
	}
});

/**
 * @api {put} /dashboards/:dashboard_id Edit a Dashboard
 * @apiName Edit a Dashboard
 * @apiGroup 3. Dashboard
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} dashboard_id Dashboard Id
 * @apiBody {String} [name=unamed] Dashboard Name
 * @apiBody {String} [description="the previous value before edition"] Dashboard Description
 * @apiBody {String[]} [snippets="the previous value before edition"] List of Snippets Ids
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
router.put("/:dashboard_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var dashboard_id = req.params.dashboard_id;
	if ( dashboard_id ) {
		dashboards	= dbDashboards.getCollection("dashboards");
		var query = {
			"$and": [
					{ "id": dashboard_id },
					{ "user_id": req.user.id },
				]
			};
		var dashboard = dashboards.findOne( query );
		if ( dashboard ) {
			if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - dashboard.meta.revision) !== 0 ) {
				res.status(409).send(new ErrorSerializer({"id": 1330, "code": 409, "message": "Bad Request"}).serialize());
			} else {
				var result;
				dashboards.chain().find({ "id": dashboard_id }).update(function(item) {
					item.name		= typeof req.body.name!=="undefined"?req.body.name:item.name;
					item.description= typeof req.body.description!=="undefined"?req.body.description:item.description;
					item.snippets	= typeof req.body.snippets!=="undefined"?req.body.snippets:item.snippets;
					item.meta.revision = typeof item.meta.revision==="number"?(item.meta.revision):1;
					result = item;
				});
				if ( typeof result !== "undefined" ) {
					dbDashboards.save();
					
					res.header("Location", "/v"+version+"/dashboards/"+dashboard_id);
					res.status(200).send({ "code": 200, message: "Successfully updated", dashboard: new DashboardSerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 1340, "code": 404, "message": "Not Found"}).serialize());
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 1342, "code": 401, "message": "Forbidden ??"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 1341, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {delete} /dashboards/:dashboard_id Delete a Dashboard
 * @apiName Delete a Dashboard
 * @apiGroup 3. Dashboard
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} dashboard_id Dashboard Id to be deleted
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/:dashboard_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var dashboard_id = req.params.dashboard_id;
	dashboards	= dbDashboards.getCollection("dashboards");
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only dashboard from current user
			{ "id" : dashboard_id, },
		],
	};
	var d = dashboards.find(query);
	//t6console.log(d);
	if ( d.length > 0 ) {
		dashboards.remove(d);
		dbDashboards.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: dashboard_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 1332, "code": 404, "message": "Not Found"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`);
module.exports = router;

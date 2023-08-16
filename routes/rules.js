"use strict";
var express = require("express");
var router = express.Router();
var RuleSerializer = require("../serializers/rule");
var ErrorSerializer = require("../serializers/error");
var rules;

/**
 * @api {get} /rules/:rule_id Get Rules
 * @apiName Get Rules
 * @apiGroup 5. Rule
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
 */
router.get("/?(:rule_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var rule_id = req.params.rule_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	rules = db_rules.getCollection("rules");
	var query;
	if ( typeof rule_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : rule_id },
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
	var json = rules.chain().find(query).offset(offset).limit(size).data();

	var total = rules.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	json = json.length>0?json:[];

	/*
	json.forEach(function(theRule) {
		t6console.log(theRule);
		//if (theRule.rule) theRule.rule = JSON.parse(theRule.rule);
	});
	*/
	
	res.status(200).send(new RuleSerializer(json).serialize());
});

/**
 * @api {post} /rules Create new Rule
 * @apiName Create new Rule
 * @apiGroup 5. Rule
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiBody {String} [name=unamed] Rule Name
 * @apiBody {String} [rule] Rule
 * @apiBody {Boolean} [active] Status of the rule
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	rules	= db_rules.getCollection("rules");
	/* Check for quota limitation */
	var queryR = { "user_id" : req.user.id };
	var i = (rules.find(queryR)).length;
	if( i >= (quota[req.user.role]).rules ) {
		res.status(429).send(new ErrorSerializer({"id": 12329, "code": 429, "message": "Too Many Requests"}).serialize());
	} else {
		if ( typeof req.user.id !== "undefined" ) {
			var rule_id = uuid.v4();
			var newRule = {
				id:			rule_id,
				user_id:	req.user.id,
				name: 		typeof req.body.name!=="undefined"?req.body.name:"unamed",
				active: 	typeof req.body.active!=="undefined"?req.body.active:true,
				rule:		typeof req.body.rule!=="undefined"?req.body.rule:{},
			};
			t6events.addStat("t6Api", "rule add", newRule.id, req.user.id);
			t6events.addAudit("t6Api", "rule add", req.user.id, newRule.id, {error_id: null, status: 201});
			rules.insert(newRule);
			//t6console.log(rules);
			
			res.header("Location", "/v"+version+"/rules/"+newRule.id);
			res.status(201).send({ "code": 201, message: "Created", rule: new RuleSerializer(newRule).serialize() });
		}
	}
});

/**
 * @api {put} /rules/:rule_id Edit a Rule
 * @apiName Edit a Rule
 * @apiGroup 5. Rule
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [rule_id] Rule Id
 * @apiBody {String} [name=unamed] Rule Name
 * @apiBody {String} [rule] Rule
 * @apiBody {Boolean} [active] Status of the rule
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
router.put("/:rule_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var rule_id = req.params.rule_id;
	if ( rule_id ) {
		rules	= db_rules.getCollection("rules");
		var query = {
			"$and": [
					{ "id": rule_id },
					{ "user_id": req.user.id },
				]
			};
		var rule = rules.findOne( query );
		if ( rule ) {
			//t6console.debug(req.body.meta.revision + rule.meta.revision);
			//t6console.debug((req.body.meta.revision - rule.meta.revision));
			if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - rule.meta.revision) !== 0 ) {
				res.status(409).send(new ErrorSerializer({"id": 12001, "code": 409, "message": "Bad Request"}).serialize());
			} else {
				var result;
				rules.chain().find({ "id": rule_id }).update(function(item) {
					item.name		= typeof req.body.name!=="undefined"?req.body.name:item.name;
					item.rule		= typeof req.body.rule!=="undefined"?req.body.rule:item.rule;
					item.active		= typeof req.body.active!=="undefined"?req.body.active:item.active;
					item.meta.revision = typeof item.meta.revision==="number"?(item.meta.revision):1;
					result = item;
				});
				if ( typeof result !== "undefined" ) {
					db_rules.save();
					
					res.header("Location", "/v"+version+"/rules/"+rule_id);
					res.status(200).send({ "code": 200, message: "Successfully updated", rule: new RuleSerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 12273, "code": 404, "message": "Not Found"}).serialize());
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 12272, "code": 401, "message": "Forbidden"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 12271, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {delete} /rules/:rule_id Delete a Rule
 * @apiName Delete a Rule
 * @apiGroup 5. Rule
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [rule_id] Rule Id to be deleted
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/:rule_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var rule_id = req.params.rule_id;
	rules	= db_rules.getCollection("rules");
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only rule from current user
			{ "id" : rule_id, },
		],
	};
	var s = rules.find(query);
	if ( s.length > 0 ) {
		rules.remove(s);
		db_rules.saveDatabase();
		t6events.addAudit("t6Api", "rule delete", req.user.id, rule_id, {error_id: null, status: 200});
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: rule_id }); // TODO: missing serializer
	} else {
		t6events.addAudit("t6Api", "rule delete", req.user.id, rule_id, {error_id: 532, status: 404});
		res.status(404).send(new ErrorSerializer({"id": 532, "code": 404, "message": "Not Found"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
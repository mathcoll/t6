"use strict";
var express = require("express");
var router = express.Router();
var RuleSerializer = require("../serializers/rule");
var ErrorSerializer = require("../serializers/error");
var rules;

/**
 * @api {get} /rules/:rule_id Get Rule(s)
 * @apiName Get Rule(s)
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
 * @apiUse 500
 */
router.get("/?(:rule_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var rule_id = req.params.rule_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	rules = dbRules.getCollection("rules");
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
 * @apiParam {String} [name=unamed] Rule Name
 * @apiParam {String} [rule] Rule
 * @apiParam {Boolean} [active] Status of the rule
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	rules	= dbRules.getCollection("rules");
	/* Check for quota limitation */
	var queryR = { "user_id" : req.user.id };
	var i = (rules.find(queryR)).length;
	if( i >= (quota[req.user.role]).rules ) {
		res.status(429).send(new ErrorSerializer({"id": 529, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize());
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
			t6events.add("t6Api", "rule add", newRule.id, req.user.id);
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
 * @apiParam {String} [name=unamed] Rule Name
 * @apiParam {String} [rule] Rule
 * @apiParam {Boolean} [active] Status of the rule
 * @apiParam (meta) {Integer} [meta.revision] If set to the current revision of the resource (before PUTing), the value is checked against the current revision in database.
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 * @apiUse 409
 * @apiUse 429
 * @apiUse 500
 */
router.put("/:rule_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var rule_id = req.params.rule_id;
	if ( rule_id ) {
		rules	= dbRules.getCollection("rules");
		var query = {
			"$and": [
					{ "id": rule_id },
					{ "user_id": req.user.id },
				]
			};
		var rule = rules.findOne( query );
		if ( rule ) {
			t6console.debug(req.body.meta.revision + rule.meta.revision);
			t6console.debug((req.body.meta.revision - rule.meta.revision));
			if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - rule.meta.revision) !== 0 ) {
				res.status(409).send(new ErrorSerializer({"id": 539.2, "code": 409, "message": "Bad Request"}).serialize());
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
					dbRules.save();
					
					res.header("Location", "/v"+version+"/rules/"+rule_id);
					res.status(200).send({ "code": 200, message: "Successfully updated", rule: new RuleSerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 540, "code": 404, "message": "Not Found"}).serialize());
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 542, "code": 401, "message": "Forbidden ??"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 540.5, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {delete} /rules/:rule_id Delete a Rule
 * @apiName Delete a Rule
 * @apiGroup 5. Rule
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [rule_id] Rule Id
 */
router.delete("/:rule_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var rule_id = req.params.rule_id;
	rules	= dbRules.getCollection("rules");
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only rule from current user
			{ "id" : rule_id, },
		],
	};
	var s = rules.find(query);
	if ( s.length > 0 ) {
		rules.remove(s);
		dbRules.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: rule_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 532, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

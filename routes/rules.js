'use strict';
var express = require('express');
var router = express.Router();
var RuleSerializer = require('../serializers/rule');
var ErrorSerializer = require('../serializers/error');
var rules;

/**
 * @api {get} /rules/:rule_id Get Rule(s)
 * @apiName Get Rule(s)
 * @apiGroup 5. Rule
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [rule_id] Rule Id
 * @apiParam {String} [name] 
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get('/?(:rule_id([0-9a-z\-]+))?', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var rule_id = req.params.rule_id;
	var name = req.query.name;
	var size = req.query.size!==undefined?req.query.size:20;
	var page = req.query.page!==undefined?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	rules = dbRules.getCollection('rules');
	var query;
	if ( rule_id !== undefined ) {
		query = {
		'$and': [
				{ 'user_id' : req.user.id },
				{ 'id' : rule_id },
			]
		};
	} else {
		if ( name !== undefined ) {
			query = {
			'$and': [
					{ 'user_id' : req.user.id },
					{ 'name': { '$regex': [name, 'i'] } }
				]
			};
		} else {
			query = {
			'$and': [
					{ 'user_id' : req.user.id },
				]
			};
		}
	}
	var json = rules.chain().find(query).offset(offset).limit(size).data();
	//console.log(query);

	var total = rules.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	json = json.length>0?json:[];
	res.status(200).send(new RuleSerializer(json).serialize());
});


module.exports = router;

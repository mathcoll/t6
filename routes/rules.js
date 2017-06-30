'use strict';
var express = require('express');
var router = express.Router();
var RuleSerializer = require('../serializers/rule');
var ErrorSerializer = require('../serializers/error');

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

	var json = "";
	json = json.length>0?json:[];
	res.status(200).send(new RuleSerializer(json).serialize());
});


module.exports = router;

'use strict';
var express = require('express');
var router = express.Router();
var MqttSerializer = require('../serializers/mqtt');
var ErrorSerializer = require('../serializers/error');

/**
 * @api {get} /rules/:rule_id Get Mqtt(s)
 * @apiName Get Mqtt(s)
 * @apiGroup 6. Mqtt
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [mqtt_id] Mqtt Id
 * @apiParam {String} [name] 
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get('/?(:mqtt_id([0-9a-z\-]+))?', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var rule_id = req.params.mqtt_id;
	var name = req.query.name;

	var json = "";
	json = json.length>0?json:[];
	res.status(200).send(new MqttSerializer(json).serialize());
});


module.exports = router;

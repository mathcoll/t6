"use strict";
var express = require("express");
var router = express.Router();
var MqttSerializer = require("../serializers/mqtt");

/**
 * @api {get} /mqtts/:mqtt_id Get Mqtts
 * @apiName Get Mqtts
 * @apiGroup 7. Mqtt
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [mqtt_id] Mqtt Id
 * @apiParam {String} [size=20] Size of the resultset
 * @apiParam {Number} [page] Page offset
 * @apiBody {String} [name] 
 * 
 * @apiUse 200
 */
router.get("/?(:mqtt_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var mqtt_id = req.params.mqtt_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));

	var json = {};
	var total = 0;//snippets.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	json = json.length>0?json:[];
	res.status(200).send(new MqttSerializer(json).serialize());
});


t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
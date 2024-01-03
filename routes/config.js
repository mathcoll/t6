"use strict";
var express = require("express");
var ErrorSerializer = require("../serializers/error");
var router = express.Router();

/**
 * @api {post} /config/logLevel Set Loglevel
 * @apiName Set Loglevel
 * @apiGroup 9. Config
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.post("/logLevel", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let value = typeof req.body.value!=="undefined"?req.body.value:logLevel;
		t6config.set_logLevel(value);
		t6events.addAudit("t6App", "AuthAdmin: {post} /config/logLevel", "", "", {"status": "200", error_id: "00003"});
		res.status(202).send({"response": "value set", value: value});
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /config/logLevel", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
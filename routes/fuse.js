"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");
t6queue.open();

/**
 * @api {get} /fuse/start Start Fuse queue
 * @apiName Start Fuse queue
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiUse 201
 * @apiUse 500
 */
router.post("/start", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		t6queue.start();
		res.status(200).send({ "code": 201, message: "Successfully started" });
	} else {
		res.status(401).send(new ErrorSerializer({"id": 8821, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

module.exports = router;

"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /fuse/ Get information about Fuse queue
 * @apiName Get information about Fuse queue
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 500
 */
router.get("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let length = t6queue.getLength();
		res.status(200).send({ "code": 200, "length": length });
	} else {
		res.status(401).send(new ErrorSerializer({"id": 8820, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {post} /fuse/start Start Fuse queue
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
	let limit = typeof req.body.limit!=="undefined"?req.body.limit:10;
	if ( req.user.role === "admin" ) {
		t6queue.start(limit);
		res.status(200).send({ "code": 201, message: "Successfully started" });
	} else {
		res.status(401).send(new ErrorSerializer({"id": 8824, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

module.exports = router;

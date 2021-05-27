"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /fuse/:job_id Get information about Fuse queue
 * @apiName Get information about Fuse queue
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [job_id] Job Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 500
 */
router.get("/?(:job_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var job_id = req.params.job_id;
	if ( typeof job_id !== "undefined" ) {
		let query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "job_id" : job_id },
				]
			};
		let jobs = dbJobs.getCollection("jobs");
		let j = jobs.findOne(query);
		if(j) {
			j.$loki = undefined;
			j.meta.revision = undefined;
			j.meta.version = undefined;
			res.status(200).send(j);
		} else {
			res.status(404).send(new ErrorSerializer({"id": 8820.5, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		if ( req.user.role === "admin" ) {
			let length = t6queue.getLength();
			res.status(200).send({ "code": 200, "length": length });
		} else {
			res.status(401).send(new ErrorSerializer({"id": 8820, "code": 401, "message": "Unauthorized"}).serialize());
		}
	}
});

/**
 * @api {post} /fuse/:job_id?/start Start Fuse queue
 * @apiName Start Fuse queue
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [job_id] Job Id
 * 
 * @apiUse 201
 * @apiUse 500
 */
router.post("/?(:job_id([0-9a-z\-]+))?/start", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var job_id = req.params.job_id;
	let limit;
	if(typeof job_id!=="undefined") {
		let query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "job_id" : job_id },
				]
			};
		let jobs = dbJobs.getCollection("jobs");
		let job = jobs.findOne(query);
		if ( job ) {
			let fuse = t6preprocessor.fuse(job);
			res.status(201).send({ "code": 201, message: "Successfully started", job_id: job.job_id, fuse: fuse });
		} else {
			res.status(404).send(new ErrorSerializer({"id": 8825, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		limit = typeof req.body.limit!=="undefined"?req.body.limit:10;
		if ( req.user.role === "admin" ) {
			t6queue.start(limit);
			res.status(200).send({ "code": 201, message: "Successfully started" });
		} else {
			res.status(401).send(new ErrorSerializer({"id": 8824, "code": 401, "message": "Unauthorized"}).serialize());
		}
	}
});

module.exports = router;

"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /jobs/:job_id Get information about jobs in queue
 * @apiName Get information about jobs in queue
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
			let length = t6jobs.getLength();
			res.status(200).send({ "code": 200, length, jobs: t6jobs.getIds() });
		} else {
			res.status(401).send(new ErrorSerializer({"id": 8820, "code": 401, "message": "Unauthorized"}).serialize());
		}
	}
});

/**
 * @api {post} /jobs/:job_id?/start Start a job
 * @apiName Start a job
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
			t6jobs.start(limit);
			res.status(200).send({ "code": 201, message: "Successfully started" });
		} else {
			res.status(401).send(new ErrorSerializer({"id": 8824, "code": 401, "message": "Unauthorized"}).serialize());
		}
	}
});

/**
 * @api {post} /jobs/:job_id Delete a job
 * @apiName Delete a job
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [job_id] Job Id
 * 
 * @apiUse 201
 * @apiUse 500
 */
router.delete("/(:job_id([0-9a-z\-*]+))", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let job_id = req.params.job_id;
	if ( typeof job_id!=="undefined" && job_id!==null && job_id!=="null" ) {
		let query;
		if(job_id === "*") {
			query = {
			"$and": [
					{ "user_id" : req.user.id },
				]
			};
		} else {
			query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "job_id" : job_id },
				]
			};
		}
		let job = jobs.chain().find(query);
		if ( job ) {
			job.remove().data();
			db_jobs.saveDatabase();
			res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: job_id }); // TODO: missing serializer
		} else {
			res.status(404).send(new ErrorSerializer({"id": 8825.1, "code": 404, "message": "Not Found", job_id: job_id}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 8825.2, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

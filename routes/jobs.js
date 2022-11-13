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
 * @apiParam {string} [taskType] Task type
 * 
 * @apiUse 200
 */
router.get("/?(:job_id([0-9a-z\-]+))?/?(:taskType([0-9a-zA-Z\-]+))?/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let job_id = typeof req.params.job_id!=="undefined"?req.params.job_id:null;
	let user_id = req.user.role!=="admin"?req.user.id:null;
	let taskType = typeof req.query.taskType!=="undefined"?req.query.taskType:null;
	let length = t6jobs.getLength();
	res.status(200).send({ "code": 200, length, jobs: t6jobs.getJobs(job_id, user_id, taskType) });
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
 * @apiUse 401
 * @apiUse 404
 */
router.post("/?(:job_id([0-9a-z\-]+))?/start", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var job_id = req.params.job_id;
	let limit;
	if ( typeof job_id!=="undefined" && job_id!==null && job_id!=="null" ) {
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
			res.status(404).send(new ErrorSerializer({"id": 5058, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		limit = typeof req.body.limit!=="undefined"?req.body.limit:10;
		if ( req.user.role === "admin" ) {
			t6jobs.start(limit);
			t6events.addAudit("t6App", "AuthAdmin: {post} /jobs/:job_id?/start", "", "", {"status": "200", error_id: "00003"});
			res.status(201).send({ "code": 201, message: "Successfully started", job_id: job.job_id });
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {post} /jobs/:job_id?/start", "", "", {"status": "400", error_id: "00004"});
			res.status(401).send(new ErrorSerializer({"id": 5059, "code": 401, "message": "Unauthorized"}).serialize());
		}
	}
});

/**
 * @api {delete} /jobs/:job_id Delete a job
 * @apiName Delete a job
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [job_id] Job Id
 * 
 * @apiUse 200
 * @apiUse 404
 */
router.delete("/(:job_id([0-9a-z\-*]+))", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let job_id = req.params.job_id;
	if ( typeof job_id!=="undefined" && job_id!==null && job_id!=="null" ) {
		let query;
		if(job_id === "*") {
			query = { "$and": [ { "job_id" : { "$ne": null } } ] };
		} else {
			query = { "$and": [ { "job_id" : job_id } ] };
		}
		if ( req.user.role !== "admin" ) {
			query["$and"].push({ "user_id" : req.user.id });
		}
		jobs.chain().find(query).remove();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: job_id });
		db_jobs.saveDatabase();
	} else {
		res.status(404).send(new ErrorSerializer({"id": 5058, "code": 404, "message": "Not Found"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
"use strict";
var express = require("express");
var router = express.Router();
var AuditSerializer = require("../serializers/audit");
var ErrorSerializer = require("../serializers/error");


/**
 * @api {get} /audits/:audit_id?error_id=:error_id Get Audits
 * @apiName Get Audits
 * @apiGroup 15. Audit Trail
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} audit_id Audit Id
 * @apiParam {String} [sort=desc] Set to sorting order, the value can be either "asc" or ascending or "desc" for descending.
 * @apiParam {Number} [page] Page offset
 * @apiParam {Integer} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiParam {Integer} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiParam {Number{1-5000}} [limit] Set the number of expected resources.
 * @apiParam {uuid-v4} [error_id] The error Id from errors referential.
 * @apiParam {String} [what] The activity traced in the audit log
 * @apiParam {String="Server error", "Client error", "Redirection", "Successful", "Informational"} [result=""] The result (category) of the activity
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 */
router.get("/:audit_id([0-9a-z\-]+)?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let audit_id = req.params.audit_id;
	let error_id = req.query.error_id;
	let environment = req.query.environment;
	let status = req.query.status;
	let what = req.query.what;
	let result = req.query.result;
	let user_id;
	let start;
	let end;
	if ( req.user.role === "admin" ) {
		user_id = typeof req.query.user_id!=="undefined"?req.query.user_id:req.user.id;
	} else {
		user_id = req.user.id;
	}
	
	let where = "";
	if ( audit_id ) {
		if ( data_id.toString().length === 10 ) { data_id *= 1e9; }
		else if ( data_id.toString().length === 13 ) { data_id *= 1e6; }
		else if ( data_id.toString().length === 16 ) { data_id *= 1e3; }
		where += sprintf(" AND time=%s", data_id);
	}
	if ( error_id ) {
		where += sprintf(" AND error_id='%s'", error_id);
	}
	if ( environment ) {
		where += sprintf(" AND \"where\"='%s'", environment);
	}
	if ( status ) {
		where += sprintf(" AND status=%s", parseInt(status, 62));
	}
	if ( what ) {
		where += sprintf(" AND what=~/%s/", what);
	}
	if ( result ) {
		let resultIdx = ["", "Informational", "Successful", "Redirection", "Client error", "Server error"].indexOf(result);
		where += sprintf(" AND status>=%s AND  status<=%s", resultIdx*100, resultIdx*100+99);
	}

	if ( typeof req.query.start !== "undefined" ) {
		if(!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
			if ( req.query.start.toString().length === 10 ) { start = req.query.start*1e9; }
			else if ( req.query.start.toString().length === 13 ) { start = req.query.start*1e6; }
			else if ( req.query.start.toString().length === 16 ) { start = req.query.start*1e3; }
			where += sprintf(" AND time>=%s", parseInt(start, 10));
		} else {
			where += sprintf(" AND time>='%s'", req.query.start.toString());
		}
	}
	if ( typeof req.query.end !== "undefined" ) {
		if(!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
			if ( req.query.end.toString().length === 10 ) { end = req.query.end*1e9; }
			else if ( req.query.end.toString().length === 13 ) { end = req.query.end*1e6; }
			else if ( req.query.end.toString().length === 16 ) { end = req.query.end*1e3; }
			where += sprintf(" AND time<=%s", parseInt(end, 10));
		} else {
			where += sprintf(" AND time<='%s'", req.query.end.toString());
		}
	}

	var sorting = req.query.order==="asc"?"ASC":(req.query.sort==="asc"?"ASC":"DESC"); // TODO: so if req.query.order = "desc", it will be overwritten !!
	var page = parseInt(req.query.page, 10);
	if (isNaN(page) || page < 1) {
		page = 1;
	}
	var limit = parseInt(req.query.limit, 10);
	if (isNaN(limit)) {
		limit = 10;
	} else if (limit > 5000) {
		limit = 5000;
	} else if (limit < 1) {
		limit = 1;
	}
	let query = `SELECT * from ${t6events.getRP()}.events WHERE who='${user_id}' ${where} ORDER BY time ${sorting} LIMIT ${limit} OFFSET ${(page-1)*limit}`;
	t6console.debug("Query:", query);
	dbInfluxDB.query(query).then((data) => {
		if ( data.length > 0 ) {
			t6console.debug("data.length", data.length);
			data.map( (d) => {
				switch(true) {
					case d.status>=500: 
						d.result = "Server error"
						break;
					case d.status>=400: 
						d.result = "Client error"
						break;
					case d.status>=300: 
						d.result = "Redirection"
						break;
					case d.status>=200: 
						d.result = "Successful"
						break;
					case d.status<200: 
						d.result = "Informational"
						break;
				}
			});
			res.status(200).send(new AuditSerializer(data).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({err: "No data found", "id": 2158, "code": 404, "message": "Not found"}).serialize());
		}
	}).catch((err) => {
		res.status(500).send(new ErrorSerializer({err: err, "id": 2259, "code": 500, "message": "Internal Error"}).serialize());
	});
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
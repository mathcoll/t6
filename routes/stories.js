"use strict";
var express = require("express");
var router = express.Router();
var InsightSerializer = require("../serializers/insight");
var MetricsSerializer = require("../serializers/metric");
var GapsSerializer = require("../serializers/gap");
var StorySerializer = require("../serializers/story");
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /stories/:story_id Get stories
 * @apiName Get stories
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [story_id] Story Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 */
router.get("/:story_id([0-9a-z\-]+)?/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function(req, res) {
	let story_id = req.params.story_id;
	var size = typeof req.query.size!=="undefined"?req.query.size:20; // TODO WTF: should be "limit" !!
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	if ( typeof req.user !== "undefined" && typeof req.user.id !== "undefined" ) {
		var query;
		if ( typeof story_id !== "undefined" ) {
			query = {
			"$and": [
					{ "id": story_id },
					{ "user_id": req.user.id },
				]
			};
		} else {
			query = { "user_id" : req.user.id };
		}
		let story = stories.chain().find(query).offset(offset).limit(size).data();

		var total = stories.find(query).length;
		story.size = size;
		story.pageSelf = page;
		story.pageFirst = 1;
		story.pagePrev = story.pageSelf>story.pageFirst?Math.ceil(story.pageSelf)-1:story.pageFirst;
		story.pageLast = Math.ceil(total/size);
		story.pageNext = story.pageSelf<story.pageLast?Math.ceil(story.pageSelf)+1:undefined;
		if (story && story[0]) {
			res.status(200).send(new StorySerializer(story).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({"id": 18051, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(401).send(new ErrorSerializer({"id": 18052, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {get} /stories/:story_id/insights Get insights from a story
 * @apiName Get insights from a story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [story_id] Story Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 */
router.get("/:story_id([0-9a-z\-]+)/insights", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function(req, res) {
	let story_id = req.params.story_id;
	let query = { "user_id": req.user.id };

	if ( !story_id || typeof story_id === "undefined" ) {
		res.status(405).send(new ErrorSerializer({"id": 18056, "code": 405, "message": "Method Not Allowed"}).serialize());
	} else {
		query = {
			"$and": [
					{ "id": story_id },
					{ "user_id": req.user.id },
				]
			};
		let story = (stories.chain().find(query).data())[0];
		if(typeof story !== "undefined") {
			let start = story.start;
			let end = story.end;
			let retention = story.retention;
			let flow_id = story.flow_id;
			let where = "";
			if ( typeof start !== "undefined" ) {
				if(!isNaN(start) && parseInt(start, 10)) {
					if ( start.toString().length === 10 ) { start = start*1e9; }
					else if ( start.toString().length === 13 ) { start = start*1e6; }
					else if ( start.toString().length === 16 ) { start = start*1e3; }
					where += sprintf(" AND time>=%s", parseInt(start, 10));
				} else {
					where += sprintf(" AND time>='%s'", start.toString());
				}
			}	
			if ( typeof end !== "undefined" ) {
				if(!isNaN(end) && parseInt(end, 10)) {
					if ( end.toString().length === 10 ) { end = end*1e9; }
					else if ( end.toString().length === 13 ) { end = end*1e6; }
					else if ( nd.toString().length === 16 ) { end = end*1e3; }
					where += sprintf(" AND time<=%s", parseInt(end, 10));
				} else {
					where += sprintf(" AND time<='%s'", end.toString());
				}
			}
			let flow = flows.chain().find({ "id" : { "$aeq" : flow_id } }).limit(1);
			let join = flow.eqJoin(units.chain(), "unit", "id");
	
			let flowDT = flows.chain().find({id: flow_id,}).limit(1);
			let joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
			let datatype = typeof (joinDT.data())[0]!=="undefined"?(joinDT.data())[0].right.name:null;
			let fields = getFieldsFromDatatype(datatype, true, true);
			let flow_unit = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].right)!==null )?((join.data())[0].right).format:"";
			let flow_name = (((flowDT.data())[0]).left).name;
	
			let rp = typeof retention!=="undefined"?retention:"autogen";
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
						res.status(412).send(new ErrorSerializer({"id": 18057, "code": 412, "message": "Precondition Failed"}).serialize());
						return;
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}

			t6console.debug("Retention is valid:", rp);
			query = sprintf("SELECT %s FROM %s.data WHERE flow_id='%s' %s ORDER BY time ASC", fields, rp, flow_id, where);
			t6console.debug("Query:", query);
	
			dbInfluxDB.query(query).then((data) => {
				if ( data.length > 0 ) {
					let insights = [];
					let values = [];
					data.map(function(d) {
						values.push(d.value);
					});
					insights.created = story.meta.created;
					insights.name = story.name;
					insights.flow_name = flow_name;
					insights.start = start;
					insights.end = end;
					insights.retention = retention;
					insights.flow_id = flow_id;
					t6console.debug("Adding firstData to insights", 0);
					(insights).push({title: "First DataPoint in range", text: `It has a value of ${sprintf(flow_unit, data[0].value)}`, type: "firstData", unit: flow_unit, time: data[0].time, timestamp: Date.parse(data[0].time), value: data[0].value});
					t6console.debug("Adding lastData to insights", (data.length-1));
					(insights).push({title: "Last DataPoint in range", text: `It has a value of ${sprintf(flow_unit, data[(data.length-1)].value)}`, type: "lastData", unit: flow_unit, time: data[(data.length-1)].time, timestamp: Date.parse(data[(data.length-1)].time), value: data[(data.length-1)].value});

					let ol = outlier(values).findOutliers();
					ol = [...new Set(ol)];
					//t6console.debug(ol);
					ol.map(function(d) {
						let val = data[(values.indexOf(d))];
						//t6console.debug( "Found index OL : ", values.indexOf(d), val );
						(insights).push({title: "Outlier detected", text: `It has a value of ${sprintf(flow_unit, val.value)}`, type: "outlier", unit: flow_unit, time: val.time, timestamp: Date.parse(val.time), value: val.value});
					});

					slayer()
					.y((item) => item.value)
					.fromArray(data)
					.then((peaks) => {
						t6console.debug("PEAKS", peaks);
						peaks.map(function(i) {
							//t6console.debug("Adding Peak to insights", i.x, i.y);
							(insights).push({title: "Peak detected", text: `It has a value of ${sprintf(flow_unit, data[i.x].value)}`, type: "peak", unit: flow_unit, time: data[i.x].time, timestamp: Date.parse(data[i.x].time), value: data[i.x].value});
						});
					
						res.status(200).send(new InsightSerializer(insights).serialize());
					});
				} else {
					t6console.debug(query);
					res.status(404).send(new ErrorSerializer({err: "No data found", "id": 18058, "code": 404, "message": "Not found"}).serialize());
				}
			}).catch((err) => {
				t6console.error(err);
				res.status(500).send(new ErrorSerializer({err: err, "id": 18059, "code": 500, "message": "Internal Error"}).serialize());
			});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 18056, "code": 404, "message": "Not Found"}).serialize());
		}
	}
});

/**
 * @api {get} /stories/:story_id/metrics Get metrics from a story
 * @apiName Get metrics from a story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [story_id] Story Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 */
router.get("/:story_id([0-9a-z\-]+)/metrics", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function(req, res) {
	let story_id = req.params.story_id;
	let query = { "user_id": req.user.id };

	if ( !story_id || typeof story_id === "undefined" ) {
		res.status(405).send(new ErrorSerializer({"id": 18056, "code": 405, "message": "Method Not Allowed"}).serialize());
	} else {
		query = {
			"$and": [
					{ "id": story_id },
					{ "user_id": req.user.id },
				]
			};
		let story = (stories.chain().find(query).data())[0];
		if(typeof story !== "undefined") {
			let start = story.start;
			let end = story.end;
			let retention = story.retention;
			let flow_id = story.flow_id;
			let where = "";
			if ( typeof start !== "undefined" ) {
				if(!isNaN(start) && parseInt(start, 10)) {
					if ( start.toString().length === 10 ) { start = start*1e9; }
					else if ( start.toString().length === 13 ) { start = start*1e6; }
					else if ( start.toString().length === 16 ) { start = start*1e3; }
					where += sprintf(" AND time>=%s", parseInt(start, 10));
				} else {
					where += sprintf(" AND time>='%s'", start.toString());
				}
			}	
			if ( typeof end !== "undefined" ) {
				if(!isNaN(end) && parseInt(end, 10)) {
					if ( end.toString().length === 10 ) { end = end*1e9; }
					else if ( end.toString().length === 13 ) { end = end*1e6; }
					else if ( nd.toString().length === 16 ) { end = end*1e3; }
					where += sprintf(" AND time<=%s", parseInt(end, 10));
				} else {
					where += sprintf(" AND time<='%s'", end.toString());
				}
			}
			let flow = flows.chain().find({ "id" : { "$aeq" : flow_id } }).limit(1);
			let join = flow.eqJoin(units.chain(), "unit", "id");
	
			let flowDT = flows.chain().find({id: flow_id,}).limit(1);
			let joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
			let datatype = typeof (joinDT.data())[0]!=="undefined"?(joinDT.data())[0].right.name:null;
			let fields = getFieldsFromDatatype(datatype, false, false);
			let flow_unit = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].right)!==null )?((join.data())[0].right).format:"";
			let flow_name = (((flowDT.data())[0]).left).name;
	
			let rp = typeof retention!=="undefined"?retention:"autogen";
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
						res.status(412).send(new ErrorSerializer({"id": 18057, "code": 412, "message": "Precondition Failed"}).serialize());
						return;
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}

			t6console.debug("Retention is valid:", rp);
			query = `SELECT PERCENTILE(${fields},25) as "q1", PERCENTILE(${fields},50) as "q2", PERCENTILE(${fields},75) as "q3", FIRST(${fields}), LAST(${fields}), MEAN(${fields}), MEDIAN(${fields}), MODE(${fields}), MIN(${fields}), MAX(${fields}), SPREAD(${fields}), STDDEV(${fields}), COUNT(${fields}) as size, COUNT(DISTINCT(${fields})) as factor FROM ${rp}.data WHERE flow_id='${flow_id}' ${where} ORDER BY time ASC`;
			t6console.debug("Query:", query);
	
			dbInfluxDB.query(query).then((data) => {
				if ( data.length > 0 ) {
					let metrics = [];
					metrics.push({name: "first", title: "First value in range", value: data[0].first});
					metrics.push({name: "last", title: "Last value in range", value: data[0].last});
					metrics.push({name: "mean", title: "Arithmetic mean (x̄, μ)", value: data[0].mean});
					metrics.push({name: "median", title: "The median", value: data[0].median});
					metrics.push({name: "mode", title: "Mode", value: data[0].mode});
					metrics.push({name: "min", title: "The min value in range", value: data[0].min});
					metrics.push({name: "max", title: "The max value in range", value: data[0].max});
					metrics.push({name: "spread", title: "Data spread", value: data[0].spread});
					metrics.push({name: "stddev", title: "Standard Deviation", value: data[0].stddev});
					metrics.push({name: "size", title: "Sample size", value: data[0].size});
					metrics.push({name: "factor", title: "Number of distinct values", value: data[0].factor});
					metrics.push({name: "q1", title: "Percentile 25", value: data[0].q1});
					metrics.push({name: "q2", title: "Percentile 50", value: data[0].q2});
					metrics.push({name: "q3", title: "Percentile 75", value: data[0].q3});
					res.status(200).send(new MetricsSerializer(metrics).serialize());
				} else {
					t6console.debug(query);
					res.status(404).send(new ErrorSerializer({err: "No data found", "id": 18058, "code": 404, "message": "Not found"}).serialize());
				}
			}).catch((err) => {
				t6console.error(err);
				res.status(500).send(new ErrorSerializer({err: err, "id": 18059, "code": 500, "message": "Internal Error"}).serialize());
			});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 18056, "code": 404, "message": "Not Found"}).serialize());
		}
	}
});

/**
 * @api {get} /stories/:story_id/gaps Get gaps in measures from a story
 * @apiName Get gaps in measures from a story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [story_id] Story Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 */
router.get("/:story_id([0-9a-z\-]+)/gaps", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function(req, res) {
	let story_id = req.params.story_id;
	let query = { "user_id": req.user.id };

	if ( !story_id || typeof story_id === "undefined" ) {
		res.status(405).send(new ErrorSerializer({"id": 18056, "code": 405, "message": "Method Not Allowed"}).serialize());
	} else {
		query = {
			"$and": [
					{ "id": story_id },
					{ "user_id": req.user.id },
				]
			};
		let story = (stories.chain().find(query).data())[0];
		if(typeof story !== "undefined") {
			let start = story.start;
			let end = story.end;
			let retention = story.retention;
			let flow_id = story.flow_id;
			let where = "";
			if ( typeof start !== "undefined" ) {
				if(!isNaN(start) && parseInt(start, 10)) {
					if ( start.toString().length === 10 ) { start = start*1e9; }
					else if ( start.toString().length === 13 ) { start = start*1e6; }
					else if ( start.toString().length === 16 ) { start = start*1e3; }
					where += sprintf(" AND time>=%s", parseInt(start, 10));
				} else {
					where += sprintf(" AND time>='%s'", start.toString());
				}
			}	
			if ( typeof end !== "undefined" ) {
				if(!isNaN(end) && parseInt(end, 10)) {
					if ( end.toString().length === 10 ) { end = end*1e9; }
					else if ( end.toString().length === 13 ) { end = end*1e6; }
					else if ( nd.toString().length === 16 ) { end = end*1e3; }
					where += sprintf(" AND time<=%s", parseInt(end, 10));
				} else {
					where += sprintf(" AND time<='%s'", end.toString());
				}
			}
			let flow = flows.chain().find({ "id" : { "$aeq" : flow_id } }).limit(1);
			let join = flow.eqJoin(units.chain(), "unit", "id");
	
			let flowDT = flows.chain().find({id: flow_id,}).limit(1);
			let joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
			let datatype = typeof (joinDT.data())[0]!=="undefined"?(joinDT.data())[0].right.name:null;
			let fields = getFieldsFromDatatype(datatype, false, false);
			let flow_unit = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].right)!==null )?((join.data())[0].right).format:"";
			let flow_name = (((flowDT.data())[0]).left).name;
			let ttl = (((flowDT.data())[0]).left).ttl;
			ttl = typeof ttl!=="undefined"?ttl:3600;
	
			let rp = typeof retention!=="undefined"?retention:"autogen";
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
						res.status(412).send(new ErrorSerializer({"id": 18057, "code": 412, "message": "Precondition Failed"}).serialize());
						return;
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}

			t6console.debug("Retention is valid:", rp);
			query = `SELECT * FROM (SELECT ELAPSED("${fields}", ${ttl}m) AS "gap" FROM ${rp}.data WHERE flow_id='${flow_id}' ${where}) WHERE gap >= 2`;
			t6console.debug("Query:", query);
	
			dbInfluxDB.query(query).then((data) => {
				if ( data.length > 0 ) {
					let gaps = [];
					let total_missing_values=0;
					data.map(function(d) {
						gaps.push({timestamp: Date.parse(d.time), gap: d.gap, end_time: d.time, gap_duration: d.gap* ttl + "m"});
						total_missing_values+=d.gap;
					});
					gaps.created = story.meta.created;
					gaps.name = story.name;
					gaps.flow_name = flow_name;
					gaps.start = start;
					gaps.end = end;
					gaps.retention = retention;
					gaps.flow_id = flow_id;
					gaps.total_missing_values = total_missing_values;

					res.status(200).send(new GapsSerializer(gaps).serialize());
				} else {
					t6console.debug(query);
					res.status(404).send(new ErrorSerializer({err: "No data found", "id": 18058, "code": 404, "message": "Not found"}).serialize());
				}
			}).catch((err) => {
				t6console.error(err);
				res.status(500).send(new ErrorSerializer({err: err, "id": 18059, "code": 500, "message": "Internal Error"}).serialize());
			});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 18056, "code": 404, "message": "Not Found"}).serialize());
		}
	}
});


/**
 * @api {post} /stories/ Create a new story
 * @apiName Create a new story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiBody {uuid-v4} [flow_id] Flow Id
 * @apiBody {String} [name] Story name
 * @apiBody {Integer} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {Integer} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {String} [retention] Retention Policy to get data from
 * 
 * @apiUse Auth
 * 
 * @apiUse 201
 * @apiUse 412
 * @apiUse 429
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var queryQ = { "user_id" : req.user.id };
	var i = (stories.find(queryQ)).length;
	if( i >= (quota[req.user.role]).stories ) {
		res.status(429).send(new ErrorSerializer({"id": 18057, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize());
	} else {
		if ( typeof req.body.flow_id !== "undefined" ) {
			var story_id = uuid.v4();
			if ( typeof req.body.retention!=="undefined" ) {
				if ( (influxSettings.retentionPolicies.data).indexOf(req.body.retention)===-1 ) {
					t6console.debug("Defaulting Retention from setting (req.body.retention is invalid)", req.body.retention);
					req.body.retention = influxSettings.retentionPolicies.data[0];
				}
			}
			var newStory = {
				id			: story_id,
				user_id		: req.user.id,
				flow_id		: req.body.flow_id,
				start		: typeof req.body.start!=="undefined"?req.body.start:new Date(),
				end			: typeof req.body.end!=="undefined"?req.body.end:null,
				name		: typeof req.body.name!=="undefined"?req.body.name:null,
				retention	: req.body.retention
			};
			t6events.addStat("t6Api", "story add", newStory.id, req.user.id);
			t6events.addAudit("t6Api", "story add", req.user.id, newStory.id, {error_id: null, status: 201});
			stories.insert(newStory);

			res.header("Location", "/v"+version+"/stories/"+newStory.id);
			res.status(201).send({ "code": 201, message: "Created", story: new StorySerializer(newStory).serialize() });
		} else {
			res.status(412).send(new ErrorSerializer({"id": 18057, "code": 412, "message": "Precondition failed"}).serialize());
		}
	}
});

/**
 * @api {put} /stories/:story_id Edit a Story
 * @apiName Edit a Story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [story_id] Story Id
 * @apiBody {uuid-v4} [flow_id] Flow Id
 * @apiBody {String} [name] Story name
 * @apiBody {Integer} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {Integer} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {String} [retention] Retention Policy to get data from
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 * @apiUse 409
 * @apiUse 429
 */
router.put("/:story_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let story_id = req.params.story_id;
	if ( story_id ) {
		let query = {
			"$and": [
					{ "id": story_id },
					{ "user_id": req.user.id },
				]
			};
		let story = stories.findOne( query );
		if ( story ) {
			if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - story.meta.revision) !== 0 ) {
				res.status(409).send(new ErrorSerializer({"id": 18055, "code": 409, "message": "Bad Request"}).serialize());
			} else {
				let result;
				stories.chain().find({ "id": story_id }).update(function(item) {
					if ( typeof req.body.retention!=="undefined" ) {
						if ( (influxSettings.retentionPolicies.data).indexOf(req.body.retention)===-1 ) {
							t6console.debug("Defaulting Retention from setting (req.body.retention is invalid)", req.body.retention);
							req.body.retention = influxSettings.retentionPolicies.data[0];
						}
					}
					item.flow_id	= typeof req.body.flow_id!=="undefined"?req.body.flow_id:item.flow_id;
					item.start		= typeof req.body.start!=="undefined"?req.body.start:item.start;
					item.end		= typeof req.body.end!=="undefined"?req.body.end:item.end;
					item.retention	= typeof req.body.retention!=="undefined"?req.body.retention:item.retention;
					item.name		= typeof req.body.name!=="undefined"?req.body.name:item.name;
					result = item;
				});
				if ( typeof result!=="undefined" ) {
					db_stories.save();
					db_stories.saveDatabase(function(err) {err!==null?t6console.error("Error on saveDatabase", err):null;});
					res.status(200).send({ "code": 200, message: "Successfully updated", story: new StorySerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 18051, "code": 404, "message": "Not Found"}).serialize());
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 18053, "code": 401, "message": "Forbidden ??"}).serialize());
		}
	} else {
		res.status(412).send(new ErrorSerializer({"id": 18054, "code": 412, "message": "Precondition Failed"}).serialize());
	}
});

/**
 * @api {delete} /stories/:story_id Delete a Story
 * @apiName Delete a Story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} story_id Story Id to be deleted
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/:story_id([0-9a-z\-]+)/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var story_id = req.params.story_id;
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only story from current user
			{ "id" : story_id, },
		],
	};
	var s = stories.find(query);
	if ( s.length > 0 ) {
		stories.remove(s);
		db_stories.saveDatabase();
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: story_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({"id": 18051, "code": 404, "message": "Not Found"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
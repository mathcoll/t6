"use strict";
var express = require("express");
var router = express.Router();
var InsightSerializer = require("../serializers/insight");
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /stories/:story_id/insights Get insights from a story
 * @apiName Get insights from a story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 * @apiUse 500
 */
router.get("/:story_id([0-9a-z\-]+)/insights", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function(req, res) {
	let story_id = req.params.story_id;
	let query = { "user_id": req.user.id };

	if ( !story_id || typeof story_id === "undefined" ) {
		res.status(405).send(new ErrorSerializer({"id": 2056111, "code": 405, "message": "Method Not Allowed"}).serialize()); // TEMP Error code !!
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
			let unit = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].right)!==null )?((join.data())[0].right).format:"";
			let name = (((flowDT.data())[0]).left).name;
	
			let rp = typeof retention!=="undefined"?retention:"autogen";
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
						res.status(412).send(new ErrorSerializer({"id": 2057, "code": 412, "message": "Precondition Failed"}).serialize());
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
					insights.name = name;
					insights.start = start;
					insights.end = end;
					insights.retention = retention;
					insights.flow_id = flow_id;
					t6console.debug("Adding firstData to insights", 0);
					(insights).push({title: "First DataPoint in range", text: `It has a value of ${sprintf(unit, data[0].value)}`, type: "firstData", unit: unit, time: data[0].time, timestamp: Date.parse(data[0].time), value: data[0].value});
					t6console.debug("Adding lastData to insights", (data.length-1));
					(insights).push({title: "Last DataPoint in range", text: `It has a value of ${sprintf(unit, data[(data.length-1)].value)}`, type: "lastData", unit: unit, time: data[(data.length-1)].time, timestamp: Date.parse(data[(data.length-1)].time), value: data[(data.length-1)].value});

					let ol = outlier(values).findOutliers();
					ol = [...new Set(ol)];
					//t6console.debug(ol);
					ol.map(function(d) {
						let val = data[(values.indexOf(d))];
						//t6console.debug( "Found index OL : ", values.indexOf(d), val );
						(insights).push({title: "Outlier detected", text: `It has a value of ${sprintf(unit, val.value)}`, type: "outlier", unit: unit, time: val.time, timestamp: Date.parse(val.time), value: val.value});
					});

					slayer()
					.y(item => item.value)
					.fromArray(data)
					.then(peaks => {
						t6console.debug("PEAKS", peaks);
						peaks.map(function(i) {
							//t6console.debug("Adding Peak to insights", i.x, i.y);
							(insights).push({title: "Peak detected", text: "", type: "peak", unit: unit, time: data[i.x].time, timestamp: Date.parse(data[i.x].time), value: data[i.x].value});
						});
					
						res.status(200).send(new InsightSerializer(insights).serialize());
					});
				} else {
					t6console.debug(query);
					res.status(404).send(new ErrorSerializer({err: "No data found", "id": 2058, "code": 404, "message": "Not found"}).serialize()); // TEMP Error code !!
				}
			}).catch((err) => {
				t6console.error(err);
				res.status(500).send(new ErrorSerializer({err: err, "id": 2059, "code": 500, "message": "Internal Error"}).serialize()); // TEMP Error code !!
			});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 2056222, "code": 404, "message": "Not Found"}).serialize()); // TEMP Error code !!
		}
	}
});


/**
 * @api {post} /stories/ Create a new story
 * @apiName Create a new story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiParam {uuid-v4} story_id Story Id
 * @apiBody {uuid-v4} [flow_id] Flow Id
 * @apiBody {Integer} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {Integer} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {String} [retention] Retention Policy to get data from
 * 
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
		res.status(429).send(new ErrorSerializer({"id": 4057, "code": 429, "message": "Too Many Requests: Over Quota!"}).serialize()); // TEMP Error code !!
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
				retention	: req.body.retention
			};
			t6events.addStat("t6Api", "story add", newStory.id, req.user.id);
			stories.insert(newStory);
			
			res.header("Location", "/v"+version+"/stories/"+newStory.id);
			res.status(201).send({ "code": 201, message: "Created", story: new InsightSerializer(newStory).serialize() });
		} else {
			res.status(412).send(new ErrorSerializer({"id": 121212122, "code": 412, "message": "Precondition failed"}).serialize()); // TEMP Error code !!
		}
	}
});

/**
 * @api {put} /stories/:story_id Edit a Story
 * @apiName Edit a Story
 * @apiGroup 12. Stories
 * @apiVersion 2.0.1
 * 
 * @apiParam {uuid-v4} story_id Story Id
 * @apiBody {uuid-v4} [flow_id] Flow Id
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
 * @apiUse 500
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
				res.status(409).send(new ErrorSerializer({"id": 4055, "code": 409, "message": "Bad Request"}).serialize()); // TEMP Error code !!
			} else {
				let result;
				stories.chain().find({ "id": story_id }).update(function(item) {
					if ( typeof req.body.retention!=="undefined" ) {
						if ( (influxSettings.retentionPolicies.data).indexOf(req.body.retention)===-1 ) {
							t6console.debug("Defaulting Retention from setting (req.body.retention is invalid)", req.body.retention);
							req.body.retention = influxSettings.retentionPolicies.data[0];
						}
					}
					item.flow_id		= typeof req.body.flow_id!=="undefined"?req.body.flow_id:item.flow_id;
					item.start		= typeof req.body.start!=="undefined"?req.body.start:item.start;
					item.end			= typeof req.body.end!=="undefined"?req.body.end:item.end;
					item.retention	= typeof req.body.retention!=="undefined"?req.body.retention:item.retention;
					result = item;
				});
				if ( typeof result!=="undefined" ) {
					db_stories.save();
					db_stories.saveDatabase(function(err) {err!==null?t6console.error("Error on saveDatabase", err):null;});
					res.status(200).send({ "code": 200, message: "Successfully updated", flow: new InsightSerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 4051, "code": 404, "message": "Not Found"}).serialize()); // TEMP Error code !!
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 4053, "code": 401, "message": "Forbidden ??"}).serialize()); // TEMP Error code !!
		}
	} else {
		res.status(412).send(new ErrorSerializer({"id": 4054, "code": 412, "message": "Precondition Failed"}).serialize()); // TEMP Error code !!
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
		res.status(404).send(new ErrorSerializer({"id": 4051, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

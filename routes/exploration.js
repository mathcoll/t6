"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");

function gaussian_pdf(x, mean, sigma) {
	var gaussianConstant = 1 / Math.sqrt(2 * Math.PI), x = (x - mean) / sigma;
	return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
}

/**
 * @api {get} /exploration/summary?flow_id=:flow_id&start=:start&end:end Explore summary
 * @apiName Explore summary 
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID to explore
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 */
router.get("/summary/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;

	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
		var datatypeType = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.type : null;
		var datatypeClassification = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.classification : null;
		let dt = getFieldsFromDatatype(datatypeName, false, false);
		let where = "";
		let start = typeof req.query.start!=="undefined"?req.query.start:"";
		let end = typeof req.query.end!=="undefined"?req.query.end:"";
		if (typeof req.query.start !== "undefined") {
			if (!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
				if (req.query.start.toString().length === 10) { start = req.query.start * 1e9; }
				else if (req.query.start.toString().length === 13) { start = req.query.start * 1e6; }
				else if (req.query.start.toString().length === 16) { start = req.query.start * 1e3; }
				where += sprintf(" AND time>=%s", parseInt(start, 10));
			} else {
				where += sprintf(" AND time>='%s'", req.query.start.toString());
			}
		}
		if (typeof req.query.end !== "undefined") {
			if (!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
				if (req.query.end.toString().length === 10) { end = req.query.end * 1e9; }
				else if (req.query.end.toString().length === 13) { end = req.query.end * 1e6; }
				else if (req.query.end.toString().length === 16) { end = req.query.end * 1e3; }
				where += sprintf(" AND time<=%s", parseInt(end, 10));
			} else {
				where += sprintf(" AND time<='%s'", req.query.end.toString());
			}
		}
		if (where === "") {
			where = "AND time > now()-52w";// TODO : performance issue ; make the max to 1Y
		}
		
		if( datatypeName === "integer" || datatypeName === "float" ) {
			let rp = typeof retention!=="undefined"?retention:"autogen";
			let flow = (flowDT.data())[0].left;
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}
			let query = `SELECT FIRST(${dt}) as first, LAST(${dt}) as last, COUNT(${dt}) as count, MEAN(${dt}) as mean, stddev(${dt}) as std_dev, SPREAD(${dt}) as spread, MIN(${dt}) as minimum, MAX(${dt}) as maximum, MODE(${dt}) as mode, MEDIAN(${dt}) as median, PERCENTILE(${dt},25) as "quantile1", PERCENTILE(${dt},50) as "quantile2", PERCENTILE(${dt},75) as "quantile3" FROM ${rp}.data WHERE flow_id='${flow_id}' ${where}`;
			t6console.debug(sprintf("Query: %s", query));
			dbInfluxDB.query(query).then((data) => {
				if (data.length > 0) {
					data.map(function(d) {
						d.links = {
							"summary": sprintf("%s/v%s/exploration/summary?flow_id=%s&start=%s&end=%s", baseUrl_https, version, flow_id, start, end),
							"normality": sprintf("%s/v%s/exploration/normality?flow_id=%s&start=%s&end=%s", baseUrl_https, version, flow_id, start, end),
							"head": sprintf("%s/v%s/exploration/head?flow_id=%s&start=%s&end=%s", baseUrl_https, version, flow_id, start, end),
							"tail": sprintf("%s/v%s/exploration/tail?flow_id=%s&start=%s&end=%s", baseUrl_https, version, flow_id, start, end),
							"distribution": {
								"kernelDensityEstimation": sprintf("%s/v%s/exploration/kernelDensityEstimation?flow_id=%s&start=%s&end=%s", baseUrl_https, version, flow_id, start, end),
							},
						};
						d.time = undefined;
						d.start_date = moment(start).format("DD-MM-YYYY HH:mm:ss");
						d.end_date = moment(end).format("DD-MM-YYYY HH:mm:ss");
						d.data_type = {
							"name": datatypeName,
							"type": datatypeType,
							"classification": datatypeClassification,
						};
					});
					res.status(200).send(data[0]);
				} else {
					res.status(404).send(new ErrorSerializer({ err: "No data found", "id": 4058, "code": 404, "message": "Not found" }).serialize());
				}
			}).catch((err) => {
				res.status(500).send(new ErrorSerializer({ err: err, "id": 4060, "code": 500, "message": "Internal Error" }).serialize());
			});
		} else {
			res.status(412).send(new ErrorSerializer({ err: `Datatype ${dt} is not compatible`, "id": 4059, "code": 412, "message": "Precondition Failed" }).serialize());
		}
	}
});

/**
 * @api {get} /exploration/normality?flow_id=:flow_id&start=:start&end:end Explore for normality
 * @apiName Explore for normality
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID to explore
 * @apiQuery {Float} [x] raw score x
 * @apiQuery {Float} expectedValue Expected value of the population mean
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiSuccess {Float} skewness Skewness
 * @apiSuccess {Float} z_score zScore
 * @apiSuccess {String} t_test tTest of the x value
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 */
router.get("/normality/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;

	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
		let dt = getFieldsFromDatatype(datatypeName, false, false);
		let where = "";
		if (typeof req.query.start !== "undefined") {
			if (!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
				if (req.query.start.toString().length === 10) { start = req.query.start * 1e9; }
				else if (req.query.start.toString().length === 13) { start = req.query.start * 1e6; }
				else if (req.query.start.toString().length === 16) { start = req.query.start * 1e3; }
				where += sprintf(" AND time>=%s", parseInt(start, 10));
			} else {
				where += sprintf(" AND time>='%s'", req.query.start.toString());
			}
		}
		if (typeof req.query.end !== "undefined") {
			if (!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
				if (req.query.end.toString().length === 10) { end = req.query.end * 1e9; }
				else if (req.query.end.toString().length === 13) { end = req.query.end * 1e6; }
				else if (req.query.end.toString().length === 16) { end = req.query.end * 1e3; }
				where += sprintf(" AND time<=%s", parseInt(end, 10));
			} else {
				where += sprintf(" AND time<='%s'", req.query.end.toString());
			}
		}
		if (where === "") {
			where = "AND time > now()-52w";// TODO : performance issue ; make the max to 1Y
		}

		if( datatypeName === "integer" || datatypeName === "float" ) {
			let rp = typeof retention!=="undefined"?retention:"autogen";
			let flow = (flowDT.data())[0].left;
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}
			let query = `SELECT ${dt} as value FROM ${rp}.data WHERE flow_id='${flow_id}' ${where}`;
			t6console.debug(sprintf("Query: %s", query));
			dbInfluxDB.query(query).then((data) => {
				if (data.length > 3) {
					let normalityData;
					let arrayOfValues = data.map(function(row) { return row.value; });
					normalityData = {
						"skewness": statistics.sampleSkewness(arrayOfValues),
						"z_score": typeof req.query.x !== "undefined" ? (statistics.zScore(req.query.x, statistics.mean(arrayOfValues), statistics.standardDeviation(arrayOfValues))) : undefined,
						"t_test": ((typeof req.query.x) !== "undefined" && (typeof req.query.expectedValue) !== "undefined") ? (statistics.tTest(arrayOfValues, req.query.expectedValue).toFixed(2)) : undefined,
						"endpoint_status": "Be cautious, this endpoint is beta !",
					};
					res.status(200).send(normalityData);
				} else {
					t6console.debug(sprintf("Query: %s", query));
					t6console.debug("sampleSkewness requires at least three data points", data);
					res.status(404).send({ err: "No data found", "id": 4058, "code": 404, "message": "Not found or not enougth data" });
				}
			}).catch((err) => {
				res.status(500).send({ err: err, "id": 4060, "code": 500, "message": "Internal Error" });
			});
		} else {
			res.status(412).send({ err: `Datatype ${dt} is not compatible`, "id": 4059, "code": 412, "message": "Precondition Failed" });
		}
	}
});

/**
 * @api {get} /exploration/head?flow_id=:flow_id&n=:n Explore the first n rows
 * @apiName Explore the first n rows
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID to explore
 * @apiQuery {Integer} n Number of Datapoints
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 */

/**
 * @api {get} /exploration/tail?flow_id=:flow_id&n=:n Explore the last n rows
 * @apiName Explore the last n rows
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID to explore
 * @apiQuery {Integer} n Number of Datapoints
 * @apiQuery {String} retention Retention policy
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 */
router.get("/:sorting(head|tail)/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var sorting = req.params.sorting === "head" ? "ASC" : (req.params.sorting === "tail" ? "DESC" : "ASC");
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;
	var limit = parseInt(req.query.n, 10) < 50 ? parseInt(req.query.n, 10) : 10;

	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
		let dt = getFieldsFromDatatype(datatypeName, false, false);

		if( datatypeName === "integer" || datatypeName === "float" ) {
			let rp = typeof retention!=="undefined"?retention:"autogen";
			let flow = (flowDT.data())[0].left;
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}
			let query = `SELECT * FROM ${rp}.data WHERE flow_id='${flow_id}' ORDER BY time ${sorting} LIMIT ${limit} OFFSET 0`;
			t6console.debug(sprintf("Query: %s", query));
			dbInfluxDB.query(query).then((data) => {
				if (data.length > 0) {
					data.map(function(d) {
						d.id = sprintf("%s/%s", flow_id, moment(d.time).format("x") * 1000);
						d.timestamp = Date.parse(d.time);
						d.time = d.time.toNanoISOString();
					});
					t6console.log(data[0]);
					res.status(200).send(data);
				} else {
					res.status(404).send({ err: "No data found", "id": 4058, "code": 404, "message": "Not found" });
				}
			}).catch((err) => {
				res.status(500).send({ err: err, "id": 4060, "code": 500, "message": "Internal Error" });
			});
		} else {
			res.status(412).send({ err: `Datatype ${dt} is not compatible`, "id": 4059, "code": 412, "message": "Precondition Failed" });
		}
	}
});

/**
 * @api {get} /exploration/kernelDensityEstimation?flow_id=:flow_id&start=:start&end=:end Explore Distribution KDE
 * @apiName Explore Distribution KDE
 * @apiDescription Explore Distribution Kernel Density Estimation
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID you want to get data from
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {Number{1-5000}} [limit] Set the number of expected resources.
 * @apiQuery {String="min","max","first","last","sum","count"} [select] Modifier function to modify the results
 * @apiQuery {String="10ns, 100µ, 3600ms, 3600s, 1m, 3h, 4d, 2w, 365d"} [group] Group By Clause
 * @apiQuery {String} [xAxis] Label value in X axis
 * @apiQuery {String} [yAxis] Label value in Y axis
 * @apiQuery {Integer} [width] output width of SVG chart
 * @apiQuery {Integer} [height] output height of SVG chart
 * @apiQuery {Integer} [ticks=10] Ticks
 * @apiSuccess {Svg} Svg image file
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 */
router.get("/kernelDensityEstimation/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var d3nBar = require("d3node-barchart"); // TODO : it should be an histogram !
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;
	var group = req.query.group;
	var xAxis = typeof req.query.xAxis !== "undefined" ? req.query.xAxis : "";
	var yAxis = typeof req.query.yAxis !== "undefined" ? req.query.yAxis : "";
	var width = parseInt(req.query.width, 10);
	var height = parseInt(req.query.height, 10);
	var ticks = typeof req.query.ticks !== "undefined" ? req.query.ticks : 10;
	var query;
	var start;
	var end;

	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		let where = "";
		let group_by = "";

		if (typeof req.query.start !== "undefined") {
			if (!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
				if (req.query.start.toString().length === 10) { start = req.query.start * 1e9; }
				else if (req.query.start.toString().length === 13) { start = req.query.start * 1e6; }
				else if (req.query.start.toString().length === 16) { start = req.query.start * 1e3; }
				where += sprintf(" AND time>=%s", parseInt(start, 10));
			} else {
				where += sprintf(" AND time>='%s'", req.query.start.toString());
			}
		}
		if (typeof req.query.end !== "undefined") {
			if (!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
				if (req.query.end.toString().length === 10) { end = req.query.end * 1e9; }
				else if (req.query.end.toString().length === 13) { end = req.query.end * 1e6; }
				else if (req.query.end.toString().length === 16) { end = req.query.end * 1e3; }
				where += sprintf(" AND time<=%s", parseInt(end, 10));
			} else {
				where += sprintf(" AND time<='%s'", req.query.end.toString());
			}
		}
		if (typeof group!=="undefined") {
			group_by = `GROUP BY time(${group})`;
		}

		var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
		let dt = getFieldsFromDatatype(datatypeName, false, false);

		if( datatypeName === "integer" || datatypeName === "float" ) {
			let rp = typeof retention!=="undefined"?retention:"autogen";
			let flow = (flowDT.data())[0].left;
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}
			query = `SELECT MEAN(${dt}) as mean FROM ${rp}.data WHERE flow_id='${flow_id}' ${where} ${group_by}`;
			t6console.debug(sprintf("Query: %s", query));
	
			dbInfluxDB.query(query).then((data) => {
				if (data.length > 3) {
					var graphData = [];
					let svg;
	
					// TODO : it should be an histogram !
					data.map(function(row) {
						if (typeof row.time !== "undefined") {
							graphData.push(row.mean);
						}
					});
					let dataDensity = new Array();
					let densityFunc = statistics.kernelDensityEstimation(graphData);
					let step = Math.round(statistics.max(graphData) - statistics.min(graphData), 0) / ticks;
					for (let n = statistics.min(graphData); n < statistics.max(graphData); n += step) {
						dataDensity.push({ key: Math.round(n * 100 / 100), value: densityFunc(n) });
					}
					svg = d3nBar({
						data: dataDensity,
						selector: "",
						container: "",
						labels: { xAxis: xAxis, yAxis: yAxis },
						width: width,
						height: height,
					});
	
					res.setHeader("content-type", "image/svg+xml");
					res.status(200).send(svg.svgString());
				} else {
					t6console.debug(sprintf("Query: %s", query));
					t6console.debug("sampleVariance requires at least three data points", data);
					res.status(412).send({ err: "No data found", "id": 4058, "code": 412, "message": "Not found or not enougth data" });
				}
			}).catch((err) => {
				t6console.error("kernelDensityEstimation", err);
				res.status(500).send({ err: err, "id": 4060, "code": 500, "message": "Internal Error" });
			});
		} else {
			res.status(412).send({ err: `Datatype ${dt} is not compatible`, "id": 4059, "code": 412, "message": "Precondition Failed" });
		}
	}
});

/**
 * @api {get} /exploration/loess?flow_id=:flow_id&start=:start&end=:end Explore LOESS
 * @apiName Explore LOESS
 * @apiDescription Explore  LOcally Estimated Scatterplot Smoothing
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID you want to get data from
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {Number{1-5000}} [limit] Set the number of expected resources.
 * @apiQuery {String="min","max","first","last","sum","count"} [select] Modifier function to modify the results
 * @apiQuery {String="10ns, 100µ, 3600ms, 3600s, 1m, 3h, 4d, 2w, 365d"} [group] Group By Clause
 * @apiQuery {String} [xAxis] Label value in X axis
 * @apiQuery {String} [yAxis] Label value in Y axis
 * @apiQuery {String} [span="0.75"] 0 to inf, default 0.75
 * @apiQuery {String=0,1} [band=0] 0 to 1, default 0
 * @apiQuery {String="constant","linear","quadratic"} [degree="quadratic"] Lower degree fitting function computes faster.
 * @apiQuery {Integer} [width] output width of SVG chart
 * @apiQuery {Integer} [height] output height of SVG chart
 * @apiSuccess {Svg} Svg image file
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 */
router.get("/loess/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;
	var group = req.query.group;
	var xAxisLabel = typeof req.query.xAxis!=="undefined" ? req.query.xAxis : "";
	var yAxisLabel = typeof req.query.yAxis!=="undefined" ? req.query.yAxis : "";
	var degree = typeof req.query.degree!=="undefined" ? req.query.degree : "";
	var span = typeof req.query.span!=="undefined" ? parseFloat(req.query.span) : "";
	var band = typeof req.query.band!=="undefined" ? parseFloat(req.query.band) : "";
	var width = parseInt(req.query.width, 10);
	var height = parseInt(req.query.height, 10);
	var query;
	var start;
	var end;
	var limit = parseInt(req.query.limit, 10) < 100001 ? parseInt(req.query.limit, 10) : 10;
	if(degree !== "constant" && degree !== "linear" && degree !== "quadratic") {
		degree = "quadratic";
	}

	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		let where = "";
		let group_by = "";

		if (typeof req.query.start !== "undefined") {
			if (!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
				if (req.query.start.toString().length === 10) { start = req.query.start * 1e9; }
				else if (req.query.start.toString().length === 13) { start = req.query.start * 1e6; }
				else if (req.query.start.toString().length === 16) { start = req.query.start * 1e3; }
				where += sprintf(" AND time>=%s", parseInt(start, 10));
			} else {
				where += sprintf(" AND time>='%s'", req.query.start.toString());
			}
		}
		if (typeof req.query.end !== "undefined") {
			if (!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
				if (req.query.end.toString().length === 10) { end = req.query.end * 1e9; }
				else if (req.query.end.toString().length === 13) { end = req.query.end * 1e6; }
				else if (req.query.end.toString().length === 16) { end = req.query.end * 1e3; }
				where += sprintf(" AND time<=%s", parseInt(end, 10));
			} else {
				where += sprintf(" AND time<='%s'", req.query.end.toString());
			}
		}
		if (typeof group!=="undefined") {
			group_by = `GROUP BY time(${group})`;
		}

		var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
		let dt = getFieldsFromDatatype(datatypeName, false, false);

		if( datatypeName === "integer" || datatypeName === "float" ) {
			let rp = typeof retention!=="undefined"?retention:"autogen";
			let flow = (flowDT.data())[0].left;
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}
			query = `SELECT ${dt} as value FROM ${rp}.data WHERE flow_id='${flow_id}' ${where} ${group_by} LIMIT ${limit} OFFSET 1`;
			t6console.debug(sprintf("Query: %s", query));
	
			dbInfluxDB.query(query).then((queryData) => {
				if (queryData.length > 10) {
					let graphScatterData = [];
					let graphLoessData = { x: [], y: [] };
					let graphLoess = [];
					let svg;
					let n = 0;
					queryData.map(function(row) {
						if (typeof row.time !== "undefined" && row.value !== null) {
							graphScatterData.push({ key: parseInt(moment(row.time).format("x"), 10), value: row.value });
							graphLoessData.x.push(parseInt(moment(row.time).format("x"), 10));
							graphLoessData.y.push(row.value);
						}
					});
	
					var D3Node = require("d3-node");
					const d3n = new D3Node({
						selector: "",
						svgStyles: "",
						styles: "",
						container: "",
					});
					const d3 = d3n.d3;
					let _margin = { top: 10, right: 60, bottom: 30, left: 60 };
					let _lineWidth = 2;
					let _tickSize = 5;
					let _tickPadding = 5;
					let _lineColor = "#765548";
					let _lineColors = ["#795548"];
					let _isCurve = true;

					svg = d3n.createSVG(width, height)
						.append("g")
						.attr("transform", `translate(${_margin.left}, ${_margin.top})`);
					width = width - _margin.left - _margin.right;
					height = height - _margin.top - _margin.bottom;
	
					let g = svg.append("g");
					let { allKeys } = graphScatterData;

					/* LOESS */
					let options /*optional*/ = {
						span: span, // 0 to inf, default 0.75
						band: band, // 0 to 1, default 0
						degree: degree, // degree: [0, 1, 2] || ["constant", "linear", "quadratic"] // default 2
						normalize: true, // default true if degree > 1, false otherwise
						robust: false, // default false
						iterations: 1 //default 4 if robust = true, 1 otherwise
					};
					let model = new Loess.default(graphLoessData, options);
					//let newData = model.grid([graphLoessData.x.length]);
					let fit = model.predict(); //newData
	
					var m = 0;
					fit.fitted.map((y, idx) => {
						graphLoess.push({ key: idx, value: y, halfwidth: fit.halfwidth[idx] });
					});
					let xScaleScatter = d3.scaleTime()
						.domain(allKeys ? d3.extent(allKeys) : d3.extent(graphScatterData, (d) => d.key))
						.rangeRound([0, width]);
					let yScaleScatter = d3.scaleLinear()
						.domain(allKeys ? [d3.min(graphScatterData, (d) => d3.min(d, (v) => v.value)), d3.max(graphScatterData, (d) => d3.max(d, (v) => v.value))] : d3.extent(graphScatterData, (d) => d.value))
						.rangeRound([height, 0]);
					let xAxis = d3.axisBottom(xScaleScatter)
						.tickSize(_tickSize)
						.tickPadding(_tickPadding);
					let yAxis = d3.axisLeft(yScaleScatter)
						.tickSize(_tickSize)
						.tickPadding(_tickPadding);

					let xScale = d3.scaleTime()
						.domain(allKeys ? d3.extent(allKeys) : d3.extent(graphLoess, (d) => d.key))
						.rangeRound([0, width]);
					var yScaleR = d3.scaleLinear()
						//.domain(allKeys ? [d3.min(graphLoess, d => d3.min(d, v => v.value)), d3.max(graphLoess, d => d3.max(d, v => v.value))] : d3.extent(graphLoess, d => d.value))
						.domain(allKeys ? [d3.min(graphScatterData, (d) => d3.min(d, (v) => v.value)), d3.max(graphScatterData, (d) => d3.max(d, (v) => v.value))] : d3.extent(graphScatterData, (d) => d.value))
						.rangeRound([height, 0]);
					/*
					xAxis = d3.axisBottom(xScale)
						.tickSize(_tickSize)
						.tickPadding(_tickPadding);
					*/
					var yAxisR = d3.axisRight(yScaleR)
						.tickSize(_tickSize)
						.tickPadding(_tickPadding);
	
					let lineChart = d3.line()
						.x((d) => xScale(d.key))
						.y((d) => yScaleR(d.value));
						
					const area = d3.area()
						.x((d) => xScale(d.key))
						.y0((d) => yScaleR(d.value - d.halfwidth))
						.y1((d) => yScaleR(d.value + d.halfwidth));

					if (_isCurve) { lineChart.curve(d3.curveBasis); }
	
					g.append("g")
						.append("path")
						.attr("fill", "steelblue")
						.style("opacity", .3)
						.attr("d", area(graphLoess));

					g.append("g")
						.attr("fill", "none")
						.attr("stroke-width", _lineWidth)
						.selectAll("path")
						.data(allKeys ? data : [graphLoess])
						.enter().append("path")
						.attr("stroke", (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor)
						.attr("d", lineChart);
	
					g.append("g")
						.selectAll("dot")
						.data(allKeys ? data : graphScatterData)
						.enter().append("circle")
						.attr("cx", function(d) { return xScaleScatter(d.key); })
						.attr("cy", function(d) { return yScaleScatter(d.value); })
						.attr("r", _tickSize)
						.attr("class", "dot")
						.attr("stroke", "black")
						.attr("fill", "none");
	
					g.append("g")
						.attr("transform", `translate(0, ${height})`)
						.text(typeof xAxisLabel!=="undefined"?xAxisLabel:"")
						.call(xAxis);
	
					g.append("g")
						.text(typeof xAxisLabel!=="undefined"?yAxisLabel:"")
						.call(yAxis);
						
					g.append("g")
						.attr("transform", `translate(${width}, 0)`)
						.call(yAxisR);

					// END LOESS
					res.setHeader("content-type", "image/svg+xml");
					res.status(200).send(d3n.svgString());
				} else {
					t6console.debug("Loess requires at least 10 data points", queryData, queryData.length);
					res.status(404).send({ err: "No data found", "id": 4058, "code": 404, "message": "Not found or not enougth data" });
				}
			}).catch((err) => {
				t6console.error("Loess", err);
				res.status(500).send({ err: err, "id": 4060, "code": 500, "message": "Internal Error" });
			});
		} else {
			res.status(412).send({ err: `Datatype ${dt} is not compatible`, "id": 4059, "code": 412, "message": "Precondition Failed" });
		}
	}
});

/**
 * @api {get} /exploration/frequencyDistribution?flow_id=:flow_id&start=:start&end=:end Explore Frequency Distribution
 * @apiName Explore Frequency Distribution
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID you want to get data from
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {Number{1-5000}} [limit] Set the number of expected resources.
 * @apiQuery {String="min","max","first","last","sum","count"} [select] Modifier function to modify the results
 * @apiQuery {String="10ns, 100µ, 3600ms, 3600s, 1m, 3h, 4d, 2w, 365d"} [group] Group By Clause
 * @apiQuery {String} [xAxis] Label value in X axis
 * @apiQuery {String} [yAxis] Label value in Y axis
 * @apiQuery {Integer} [width] output width of SVG chart
 * @apiQuery {Integer} [height] output height of SVG chart
 * @apiSuccess {Svg} Svg image file
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 */
router.get("/frequencyDistribution/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;
	var group = req.query.group;
	var width = parseInt(req.query.width, 10);
	var height = parseInt(req.query.height, 10);
	var query;
	var start;
	var end;

	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		let where = "";
		let group_by = "";

		if (typeof req.query.start !== "undefined") {
			if (!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
				if (req.query.start.toString().length === 10) { start = req.query.start * 1e9; }
				else if (req.query.start.toString().length === 13) { start = req.query.start * 1e6; }
				else if (req.query.start.toString().length === 16) { start = req.query.start * 1e3; }
				where += sprintf(" AND time>=%s", parseInt(start, 10));
			} else {
				where += sprintf(" AND time>='%s'", req.query.start.toString());
			}
		}
		if (typeof req.query.end !== "undefined") {
			if (!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
				if (req.query.end.toString().length === 10) { end = req.query.end * 1e9; }
				else if (req.query.end.toString().length === 13) { end = req.query.end * 1e6; }
				else if (req.query.end.toString().length === 16) { end = req.query.end * 1e3; }
				where += sprintf(" AND time<=%s", parseInt(end, 10));
			} else {
				where += sprintf(" AND time<='%s'", req.query.end.toString());
			}
		}
		if (typeof group!=="undefined") {
			group_by = `GROUP BY time(${group})`;
		}

		var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
		let dt = getFieldsFromDatatype(datatypeName, false, false);

		if( datatypeName === "integer" || datatypeName === "float" ) {
			let rp = typeof retention!=="undefined"?retention:"autogen";
			let flow = (flowDT.data())[0].left;
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}
			query = `SELECT MEAN(${dt}) as mean, PERCENTILE(${dt},25) as "q1", PERCENTILE(${dt},50) as "q2", PERCENTILE(${dt},75) as "q3" FROM ${rp}.data WHERE flow_id='${flow_id}' ${where} ${group_by}`;
			t6console.debug(sprintf("Query: %s", query));
	
			dbInfluxDB.query(query).then((data) => {
				if (data.length > 0) {
					var graphData = [];
					let svg;
	
					data.map(function(row) {
						if (typeof row.time !== "undefined") {
							graphData.push({ key: moment(row.time._nanoISO), value: row.mean }); // TODO : security	
						}
					});
					var D3Node = require("d3-node");
					const d3n = new D3Node({
						selector: "",
						svgStyles: "",
						container: "",
					});
					const d3 = d3n.d3;
					let _margin = { top: 20, right: 10, bottom: 60, left: 50 };
					let _lineWidth = 1.5;
					let _isCurve = true;
					let _tickSize = 5;
					let _tickPadding = 5;
					let _lineColor = "steelblue";
					let _lineColors = ["steelblue"];
					let sidePlotWidth = 300;
	
					svg = d3n.createSVG(width, height)
						.append("g")
						.attr("transform", `translate(${_margin.left}, ${_margin.top})`);
					width = width - _margin.left - _margin.right;
					height = height - _margin.top - _margin.bottom;
	
					const g = svg.append("g");
	
					const { allKeys } = graphData;
					const xScale = d3.scaleTime()
						.domain(allKeys ? d3.extent(allKeys) : d3.extent(graphData, (d) => d.key))
						.range([0, width - sidePlotWidth]);
					const yScale = d3.scaleLinear()
						.domain(allKeys ? [d3.min(graphData, (d) => d3.min(d, (v) => v.value)), d3.max(graphData, (d) => d3.max(d, (v) => v.value))] : d3.extent(graphData, (d) => d.value))
						.rangeRound([height, 0]);
					const xAxis = d3.axisBottom(xScale)
						.tickSize(_tickSize)
						.tickPadding(_tickPadding);
					const yAxis = d3.axisLeft(yScale)
						.tickSize(_tickSize)
						.tickPadding(_tickPadding);
					const lineChart = d3.line()
						.x((d) => xScale(d.key))
						.y((d) => yScale(d.value));
	
					if (_isCurve) { lineChart.curve(d3.curveBasis); }
	
					g.append("g")
						.attr("transform", `translate(0, ${height})`)
						.call(xAxis)
						.selectAll("text")
						.attr("transform", "translate(-10, 0)rotate(-45)")
						.style("text-anchor", "end");
	
					g.append("g").call(yAxis);
	
					let m = 10; // margin 10
					let barHeight = (height / 4) - 2 * m;
					let w, p;
					let totalValues = graphData.length;
					let min = d3.min(graphData.map(function(d) { return (d.value); }));
					let q1 = d3.quantile(graphData.map(function(d) { return (d.value); }), .25);
					let q2 = d3.quantile(graphData.map(function(d) { return (d.value); }), .5);
					let q3 = d3.quantile(graphData.map(function(d) { return (d.value); }), .75);
					let max = d3.max(graphData.map(function(d) { return (d.value); }));
					g.append("rect").attr("x", width - 290).attr("y", m).attr("width", sidePlotWidth).attr("height", height).attr("fill", "none").style("fill", "none").style("stroke", "black").style("stroke-width", 2);
	
					let xText = width - 290 + 2*m;
					let yText = (barHeight/2 + 2*m + 11/2);
					let xRect = width - 290 + m;
					let yRect = 2*m;
					w = (graphData.filter(function(d) { return (d.value > q3 && d.value < max); }).length) * (sidePlotWidth-2*m) / totalValues;
					p = 100*((graphData.filter(function(d) { return (d.value > q3 && d.value < max); }).length) / totalValues).toFixed(1);
					g.append("rect").attr("x", xRect).attr("y", yRect).attr("width", w).attr("height", barHeight).attr("fill", (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor);
					g.append("text")
						.attr("x", xText)
						.attr("y", yText)
						.attr("font-size", "11px")
						.text(`${q3.toFixed(4)} < value < ${max.toFixed(4)} : ${p}%`);
	
					yText += barHeight+2*m;
					yRect += barHeight+2*m;
					w = (graphData.filter(function(d) { return (d.value > q3 && d.value < q2); }).length) * (sidePlotWidth-2*m) / totalValues;
					p = 100*((graphData.filter(function(d) { return (d.value > q3 && d.value < q2); }).length) / totalValues).toFixed(1);
					g.append("rect").attr("x", xRect).attr("y", yRect).attr("width", w).attr("height", barHeight).attr("fill", (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor);
					g.append("text")
						.attr("x", xText)
						.attr("y", yText)
						.attr("font-size", "11px")
						.text(`${q3.toFixed(4)} < value < ${q2.toFixed(4)} : ${p}%`);
	
					yText += barHeight+2*m;
					yRect += barHeight+2*m;
					w = (graphData.filter(function(d) { return (d.value > q2 && d.value < q1); }).length) * (sidePlotWidth-2*m) / totalValues;
					p = 100*((graphData.filter(function(d) { return (d.value > q2 && d.value < q1); }).length) / totalValues).toFixed(1);
					g.append("rect").attr("x", xRect).attr("y", yRect).attr("width", w).attr("height", barHeight).attr("fill", (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor);
					g.append("text")
						.attr("x", xText)
						.attr("y", yText)
						.attr("font-size", "11px")
						.text(`${q2.toFixed(4)} < value < ${q1.toFixed(4)} : ${p}%`);
	
					yText += barHeight+2*m;
					yRect += barHeight+2*m;
					w = (graphData.filter(function(d) { return (d.value > min && d.value < q1); }).length) * (sidePlotWidth-2*m) / totalValues;
					p = 100*((graphData.filter(function(d) { return (d.value > min && d.value < q1); }).length) / totalValues).toFixed(1);
					g.append("rect").attr("x", xRect).attr("y", yRect).attr("width", w).attr("height", barHeight).attr("fill", (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor);
					g.append("text")
						.attr("x", xText)
						.attr("y", yText)
						.attr("font-size", "11px")
						.text(`${min.toFixed(4)} < value < ${q1.toFixed(4)} : ${p}%`);
	
					g.append("g")
						.attr("fill", "none")
						.attr("stroke-width", _lineWidth)
						.selectAll("path")
						.data(allKeys ? data : [graphData])
						.enter().append("path")
						.attr("stroke", (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor)
						.attr("d", lineChart);
	
					res.setHeader("content-type", "image/svg+xml");
					res.status(200).send(d3n.svgString());
				} else {
					t6console.debug("", data, data.data);
					res.status(404).send({ err: "No data found", "id": 4058, "code": 404, "message": "Not found or not enougth data" });
				}
			}).catch((err) => {
				t6console.error("Loess", err, queryData, queryData.length);
				res.status(500).send({ err: err, "id": 4060, "code": 500, "message": "Internal Error" });
			});
		} else {
			t6console.error("flowDT", flowDT.data());
			res.status(412).send({ err: `Datatype ${dt} is not compatible`, "id": 4059, "code": 412, "message": "Precondition Failed" });
		}
	}
});

/**
 * @api {get} /exploration/export?flow_id=:flow_id&start=:start&end=:end Export rough data as json array
 * @apiName Export rough data as json array
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID you want to get data from
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {Number{1-5000}} [limit] Set the number of expected resources.
 * @apiQuery {String="min","max","first","last","sum","count"} [select] Modifier function to modify the results
 * @apiQuery {String="10ns, 100µ, 3600ms, 3600s, 1m, 3h, 4d, 2w, 365d"} [group] Group By Clause
 * @apiSuccess {Svg} Svg image file
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 */
router.get("/export/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;
	var group = req.query.group;
	var query;
	var start;
	var end;

	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		let where = "";
		let group_by = "";

		if (typeof req.query.start !== "undefined") {
			if (!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
				if (req.query.start.toString().length === 10) { start = req.query.start * 1e9; }
				else if (req.query.start.toString().length === 13) { start = req.query.start * 1e6; }
				else if (req.query.start.toString().length === 16) { start = req.query.start * 1e3; }
				where += sprintf(" AND time>=%s", parseInt(start, 10));
			} else {
				where += sprintf(" AND time>='%s'", req.query.start.toString());
			}
		}
		if (typeof req.query.end !== "undefined") {
			if (!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
				if (req.query.end.toString().length === 10) { end = req.query.end * 1e9; }
				else if (req.query.end.toString().length === 13) { end = req.query.end * 1e6; }
				else if (req.query.end.toString().length === 16) { end = req.query.end * 1e3; }
				where += sprintf(" AND time<=%s", parseInt(end, 10));
			} else {
				where += sprintf(" AND time<='%s'", req.query.end.toString());
			}
		}
		if (typeof group!=="undefined") {
			group_by = `GROUP BY time(${group})`;
		}

		var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
		let dt = getFieldsFromDatatype(datatypeName, false, false);

		let rp = typeof retention!=="undefined"?retention:"autogen";
		let flow = (flowDT.data())[0].left;
		if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
			if ( typeof flow!=="undefined" && flow.retention ) {
				if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
					rp = flow.retention;
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
				}
			} else {
				rp = influxSettings.retentionPolicies.data[0];
				t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
			}
		}
		query = `SELECT MEAN(${dt}) as value FROM ${rp}.data WHERE flow_id='${flow_id}' ${where} ${group_by}`;
		t6console.debug(sprintf("Query: %s", query));

		dbInfluxDB.query(query).then((data) => {
			if (data.length > 0) {
				var graphData = [];
				data.map(function(row) {
					if (typeof row.time !== "undefined" && row.value !==null) {
						graphData.push([moment(row.time).format("DD-MM-YYYY HH:mm:ss"), parseInt(moment(row.time).format("x"), 10), row.value]);
					}
				});

				res.setHeader("content-type", "application/json");
				res.status(200).send(graphData);
			} else {
				res.status(404).send({ err: "No data found", "id": 4058, "code": 404, "message": "Not found" });
			}
		}).catch((err) => {
			res.status(500).send({ err: err, "id": 4060, "code": 500, "message": "Internal Error" });
		});
	}
});

/**
 * @api {get} /exploration/trend Explore Trend
 * @apiName Explore Trend
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 * 
 * 
 */
router.get("/trend/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	res.status(404).send({ err: "Not implemented yet", "id": 0, "code": 404, "message": "This endpoint is not completed" });
});

/**
 * @api {get} /exploration/seasonality Explore Seasonality
 * @apiName Explore Seasonality
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 * 
 * 
 */
router.get("/seasonality/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	res.status(404).send({ err: "Not implemented yet", "id": 0, "code": 404, "message": "This endpoint is not completed" });
});

/**
 * @api {get} /exploration/outliers Explore Outliers
 * @apiName Explore Outliers
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 * 
 * 
 */
router.get("/outliers/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	res.status(404).send({ err: "Not implemented yet", "id": 0, "code": 404, "message": "This endpoint is not completed" });
});

/**
 * @api {get} /exploration/line?start=:start&end=:end Get Explore Plot line
 * @apiName Get Explore Plot line
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID you want to get data from
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * 
 * @apiUse 200
 * @apiUse 404
 * @apiUse 412
 * 
 */
router.get("/line/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;
	var group = req.query.group;
	var width = parseInt(req.query.width, 10);
	var height = parseInt(req.query.height, 10);
	var query;
	var start;
	var end;
	let _margin = { top: 20, right: 20, bottom: 40, left: 60 };
	let _lineWidth = 1.5;
	let _tickSize = 5;
	let _tickPadding = 5;
	let _lineColor = "#795548";
	let _lineColors = ["#795548"];
	let _color = "#795548";
	let _hoverColor = "brown";
	let _isCurve = true;
	let _labels = { xAxis: typeof req.query.xAxis!=="undefined" ? req.query.xAxis : "", yAxis: typeof req.query.yAxis!=="undefined" ? req.query.yAxis : "" };
	let _svgStyles = "";
	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		let where = "";
		let group_by = "";

		if (typeof flow_id === "undefined" || Array.isArray(flow_id)===true) {
			res.status(412).send({ err: "Flow id is not compatible", "id": 4059, "code": 412, "message": "Precondition Failed" });
		} else {
			if (typeof req.query.start !== "undefined") {
				if (!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
					if (req.query.start.toString().length === 10) { start = req.query.start * 1e9; }
					else if (req.query.start.toString().length === 13) { start = req.query.start * 1e6; }
					else if (req.query.start.toString().length === 16) { start = req.query.start * 1e3; }
					where += sprintf(" AND time>=%s", parseInt(start, 10));
				} else {
					where += sprintf(" AND time>='%s'", req.query.start.toString());
				}
			}
			if (typeof req.query.end !== "undefined") {
				if (!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
					if (req.query.end.toString().length === 10) { end = req.query.end * 1e9; }
					else if (req.query.end.toString().length === 13) { end = req.query.end * 1e6; }
					else if (req.query.end.toString().length === 16) { end = req.query.end * 1e3; }
					where += sprintf(" AND time<=%s", parseInt(end, 10));
				} else {
					where += sprintf(" AND time<='%s'", req.query.end.toString());
				}
			}
	
			var sorting = req.query.order === "asc" ? "ASC" : (req.query.sort === "asc" ? "ASC" : "DESC");
			var page = parseInt(req.query.page, 10);
			if (isNaN(page) || page < 1) {
				page = 1;
			}
			var limit = parseInt(req.query.limit, 10);
			if (isNaN(limit)) {
				limit = 10;
			} else if (limit > 100000) {
				limit = 100000;
			} else if (limit < 1) {
				limit = 1;
			}
			if (typeof group!=="undefined") {
				group_by = `GROUP BY time(${group})`;
			}
	
			var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
			var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
			var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
			let dt = getFieldsFromDatatype(datatypeName, false, false);
	
			if( datatypeName === "integer" || datatypeName === "float" ) {
				let rp = typeof retention!=="undefined"?retention:"autogen";
				let flow = (flowDT.data())[0].left;
				if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
					if ( typeof flow!=="undefined" && flow.retention ) {
						if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
							rp = flow.retention;
						} else {
							rp = influxSettings.retentionPolicies.data[0];
							t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
						}
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
					}
				}
				query = `SELECT ${dt} as value FROM ${rp}.data WHERE flow_id='${flow_id}' ${where} ORDER BY time ${sorting} LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
				t6console.debug(sprintf("Query: %s", query));
	
				dbInfluxDB.query(query).then((queryData) => {
					if (queryData.length > 0) {
						let data = [];
						const d3n = new D3Node({
							selector: "",
							styles: _svgStyles,
							container: "",
						});
						const d3 = d3n.d3;
						queryData.map(function(row) {
							if (typeof row.time !== "undefined") {
								data.push(
									{
										date: parseInt(moment(row.time._nanoISO).format("x"), 10),
										value: row.value
									}
								);	
							}
						});
	
						let svg = d3n.createSVG(width, height)
							.append("g")
							.attr("transform", `translate(${_margin.left}, ${_margin.top})`);
						width = width - _margin.left - _margin.right;
						height = height - _margin.top - _margin.bottom;
		
						let xScale = d3.scaleTime()
							.domain(d3.extent(data, function(d) { return d.date; }))
							.range([0, width]);
						let line_xAxis = d3.axisBottom(xScale)
							.tickSize(_tickSize)
							.tickPadding(_tickPadding);
						svg.append("g").attr("transform", `translate(0, ${height})`).call(line_xAxis);
	
						let yScale = d3.scaleLinear()
							.domain(d3.extent(data, (d) => d.value))
							.range([height, 0]);
						let line_yAxis = d3.axisLeft(yScale)
							.tickSize(_tickSize)
							.tickPadding(_tickPadding);
						svg.append("g").call(line_yAxis);
	
						let lineChart = d3.line()
							//.x(d => xScale(d.date))
							//.y(d => yScale(d.value));
							.defined((d) => !isNaN(d.value))
							.x(function(d) { return xScale(d.date); })
							.y(function(d) { return yScale(d.value); });
	
						if (_isCurve) lineChart.curve(d3.curveBasis);
	
						// text label for the x Axis
						svg.append("text")
							.attr("transform", `translate(${width / 2}, ${height + _margin.bottom - 5})`)
							.style("text-anchor", "middle")
							.text(_labels.xAxis);
	
						svg.append("path")
							.datum(data)
							.attr("fill", "none")
							.attr("stroke", _lineColor)
							.attr("stroke-width", _lineWidth)
							.attr("class", "line")
							.attr("d", lineChart);
	
						res.setHeader("X-latest-time", data[0].date);
						res.setHeader("content-type", "image/svg+xml");
						res.status(200).send(d3n.svgString());
					} else {
						t6console.debug("", queryData, queryData.data);
						res.status(404).send({ err: "No data found", "id": 4058, "code": 404, "message": "Not found" });
					}
				});
			} else {
				res.status(412).send({ err: `Datatype ${dt} is not compatible`, "id": 4059, "code": 412, "message": "Precondition Failed" });
			}
		}
	}
});

/**
 * @api {get} /exploration/boxplot?flow_id=:flow_id&start=:start&end=:end Explore Boxplot
 * @apiName Explore Boxplot
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiQuery {uuid-v4} flow_id Flow ID you want to get data from
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * 
 * @apiUse 200
 * @apiUse 404
 * @apiUse 412
 * 
 */
router.get("/boxplot/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	var flow_id = req.query.flow_id;
	var retention = req.query.retention;
	var select = typeof req.query.select !== "undefined" ? req.query.select : undefined;
	var width = parseInt(req.query.width, 10);
	var height = parseInt(req.query.height, 10);
	var query;
	var start;
	var end;
	let _margin = { top: 20, right: 10, bottom: 10, left: 10 };
	let _lineWidth = 1.5;
	let _tickSize = 5;
	let _tickPadding = 5;
	let _lineColor = "steelblue";
	let _lineColors = ["steelblue"];
	let _color = "#795548";
	let _hoverColor = "brown";
	let _labels = { xAxis: typeof req.query.xAxis!=="undefined" ? req.query.xAxis : "", yAxis: typeof req.query.yAxis!=="undefined" ? req.query.yAxis : "" };
	let _svgStyles = `
		.box { fill: ${_color}; }
		.box:hover { fill: ${_hoverColor}; }
	`;
	if (!flow_id) {
		res.status(405).send(new ErrorSerializer({ "id": 4056, "code": 405, "message": "Method Not Allowed" }).serialize());
	} else {
		let where = "";

		if (typeof req.query.start !== "undefined") {
			if (!isNaN(req.query.start) && parseInt(req.query.start, 10)) {
				if (req.query.start.toString().length === 10) { start = req.query.start * 1e9; }
				else if (req.query.start.toString().length === 13) { start = req.query.start * 1e6; }
				else if (req.query.start.toString().length === 16) { start = req.query.start * 1e3; }
				where += sprintf(" AND time>=%s", parseInt(start, 10));
			} else {
				where += sprintf(" AND time>='%s'", req.query.start.toString());
			}
		}
		if (typeof req.query.end !== "undefined") {
			if (!isNaN(req.query.end) && parseInt(req.query.end, 10)) {
				if (req.query.end.toString().length === 10) { end = req.query.end * 1e9; }
				else if (req.query.end.toString().length === 13) { end = req.query.end * 1e6; }
				else if (req.query.end.toString().length === 16) { end = req.query.end * 1e3; }
				where += sprintf(" AND time<=%s", parseInt(end, 10));
			} else {
				where += sprintf(" AND time<='%s'", req.query.end.toString());
			}
		}

		var sorting = req.query.order === "asc" ? "ASC" : (req.query.sort === "asc" ? "ASC" : "DESC");
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

		var flowDT = flows.chain().find({ id: flow_id, }).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatypeName = typeof (joinDT.data())[0] !== "undefined" ? (joinDT.data())[0].right.name : null;
		let dt = getFieldsFromDatatype(datatypeName, false, false);

		if( datatypeName === "integer" || datatypeName === "float" ) {
			let rp = typeof retention!=="undefined"?retention:"autogen";
			let flow = (flowDT.data())[0].left;
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}
			let fields = getFieldsFromDatatype(datatypeName, false);
			if (typeof select !== "undefined") { // TODO: needs refacto and allows multiple coma separated values
				fields = "";
				switch (select) {
					case "min": fields += sprintf("MIN(%s) as min", dt); break;
					case "max": fields += sprintf("MAX(%s) as max", dt); break;
					case "first": fields += sprintf("FIRST(%s) as first", dt); break;
					case "last": fields += sprintf("LAST(%s) as last", dt); break;
					case "sum": fields = sprintf("SUM(%s) as sum", dt); break;
					case "count": fields = sprintf("COUNT(%s) as count", dt); break;
					case "median": fields += sprintf("MEDIAN(%s) as median", dt); break;
					case "mean": fields += sprintf("MEAN(%s) as mean", dt); break;
				}
			} else {
				fields = `FIRST(${dt}) as first, LAST(${dt}) as last, COUNT(${dt}) as count, MEAN(${dt}) as mean, STDDEV(${dt}) as stddev, MIN(${dt}) as min, MAX(${dt}) as max, PERCENTILE(${dt}, 25) as q1, PERCENTILE(${dt}, 50) as q2, PERCENTILE(${dt}, 75) as q3`;
			}

			query = `SELECT ${fields} FROM ${rp}.data WHERE flow_id='${flow_id}' ${where} ORDER BY time ${sorting} LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
			t6console.debug(sprintf("Query: %s", query));

			dbInfluxDB.query(query).then((queryData) => {
				if (queryData.length > 0) {
					let data = {};
					queryData.map(function(row) {
						if (typeof row.time !== "undefined") {
							data.q1 = row.q1;
							data.median = row.mean;
							data.q3 = row.q3;
							data.min = row.min;
							data.max = row.max;
						}
					});
					const d3n = new D3Node({
						selector: "",
						styles: _svgStyles,
						container: "",
					});
					const d3 = d3n.d3;
	
					let svg = d3n.createSVG(width, height)
						.append("g")
						.attr("transform", `translate(${_margin.left}, ${_margin.top})`);
					width = width - _margin.left - _margin.right;
					height = height - _margin.top - _margin.bottom;
					
					let data_sorted;
					if (!data.q1 && !data.q3 && !data.median) {
						data_sorted = data.sort(d3.ascending);
					} else {
						data_sorted = null; // WTF
					}
					let q1					= typeof data.q1!=="undefined"?data.q1:d3.quantile(data_sorted, .25);
					let median				= typeof data.median!=="undefined"?data.median:d3.quantile(data_sorted, .5);
					let q3					= typeof data.q3!=="undefined"?data.q3:d3.quantile(data_sorted, .75);
					let interQuantileRange	= q3 - q1;
					let min					= q1 - 1.5 * interQuantileRange;
					let max					= q1 + 1.5 * interQuantileRange;
					
					// a few features for the box
					let bxCenter = height/2;
					let bxHeight = height/4;
					
					// Show the X scale
					let x = d3.scaleLinear().domain([data.min - interQuantileRange, data.max + interQuantileRange]).range([0, width]);
					svg.call(d3.axisTop(x));
					
					// Show the main horizontal line
					svg.append("line")
						.attr("x1", x(data.min) )
						.attr("x2", x(data.max) )
						.attr("y1", bxCenter)
						.attr("y2", bxCenter)
						.attr("stroke", "black")
						.attr("class", "main-horizontal-line");
				
					// text label for the x Axis
					svg.append("text")
						.attr("transform", `translate(${width / 2}, ${height + _margin.bottom - 5})`)
						.style("text-anchor", "middle")
						.text(_labels.xAxis);
				
					// Show the box
					svg.append("rect")
						.attr("x", x(data.q1))
						.attr("y", bxCenter - bxHeight/2 )
						.attr("height", bxHeight )
						.attr("width", (x(data.q3)-x(data.q1)) )
						.attr("stroke", "black")
						.attr("class", "box");
				
					// show median, min and max vertical lines
					svg.selectAll("boxplot")
					.data([data.min, data.median, data.max])
						.enter()
						.append("line")
						.attr("x1", function(d){ return(x(d)); })
						.attr("x2", function(d){ return(x(d)); })
						.attr("y1", bxCenter-bxHeight/2)
						.attr("y2", bxCenter+bxHeight/2)
						.attr("stroke", "black")
						.style("stroke-width", _lineWidth)
						.attr("class", "min-line median-line max-line");
	
					res.setHeader("content-type", "image/svg+xml");
					res.status(200).send(d3n.svgString());
				} else {
					t6console.debug("", queryData, queryData.data);
					res.status(404).send({ err: "No data found", "id": 4058, "code": 404, "message": "Not found" });
				}
			});
		} else {
			res.status(412).send({ err: `Datatype ${dt} is not compatible`, "id": 4059, "code": 412, "message": "Precondition Failed" });
		}
	}
});


/**
 * @api {get} /exploration/:flow_id/exploration?flow_id=:flow_id Explore Flows
 * @apiName Explore Flows
 * @apiGroup 10. Exploratory Data Analysis EDA
 * @apiVersion 2.0.1
 * @apiDeprecated /!\ Please use other Apis 
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} flow_id Flow ID you want to get data from
 * @apiQuery {String} [sort=desc] Set to sorting order, the value can be either "asc" or ascending or "desc" for descending.
 * @apiQuery {Number} [page] Page offset
 * @apiQuery {String} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {String} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiQuery {Number{1-5000}} [limit] Set the number of expected resources.
 * @apiQuery {String="min","max","first","last","sum","count"} [select] Modifier function to modify the results
 * @apiQuery {String="10ns, 100µ, 3600ms, 3600s, 1m, 3h, 4d, 2w, 365d"} [group] Group By Clause
 * @apiQuery {String} [dateFormat] See momentJs documentation to foarmat date displays
 * @apiQuery {String="bar","line","pie","voronoi"} graphType Type of graph
 * @apiQuery {String} [xAxis] Label value in X axis
 * @apiQuery {String} [yAxis] Label value in Y axis
 * @apiQuery {String} [graphType] Type of graph
 * @apiQuery {Integer} [width] output width of SVG chart
 * @apiQuery {Integer} [height] output height of SVG chart
 * @apiQuery {Integer} [ticks=10] Ticks
 * @apiSuccess {Object[]} data DataPoint from the Flow
 * @apiSuccess {Object[]} data Data point Object
 * @apiSuccess {String} data.type Data point Type
 * @apiSuccess {Number} data.id Data point Identifier
 * @apiSuccess {Object[]} data.links
 * @apiSuccess {String} data.links.self Data point Url
 * @apiSuccess {Object[]} data.attributes Data point attributes
 * @apiSuccess {Number} data.attributes.time Time of Data point 
 * @apiSuccess {Number} data.attributes.timestamp Unix Timestamp of Data point 
 * @apiSuccess {String} data.attributes.value Value of Data point
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 */
router.get("/:flow_id([0-9a-z\-]+)/exploration/?", expressJwt({ secret: jwtsettings.secret, algorithms: jwtsettings.algorithms }), function(req, res) {
	res.status(410).send(new ErrorSerializer({ "id": 4057, "code": 410, "message": "Gone" }).serialize());
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
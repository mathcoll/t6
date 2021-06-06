"use strict";
var express = require("express");
var router = express.Router();
var DataSerializer = require("../serializers/data");
var ErrorSerializer = require("../serializers/error");
let flows;
let objects;
let datatypes;
let units;

function getJson(v) {
	try {
		return JSON.parse(v);
	} catch (e) {
		return v;
	}
}
function decryptPayload(encryptedPayload, sender, encoding) {
	if ( sender && sender.secret_key_crypt ) {
		var decryptedPayload;
		var key = Buffer.from(sender.secret_key_crypt, "hex");
		let textParts = encryptedPayload.split(":");
		let iv = Buffer.from(textParts.shift(), "hex");
		encryptedPayload = textParts.shift();

		let decipher = crypto.createDecipheriv(algorithm, key, iv);
		decipher.setAutoPadding(true);
		decryptedPayload = decipher.update(encryptedPayload, "base64", encoding || "utf8");// ascii, binary, base64, hex, utf8
		decryptedPayload += decipher.final(encoding || "utf8");

		//t6console.log("\nPayload decrypted:\n decryptedPayload);
		return decryptedPayload!==""?decryptedPayload:false;
	} else {
		//t6console.log("decryptPayload Error: Missing secret_key_crypt");
		return false;
	}
}
function getFieldsFromDatatype(datatype, asValue, includeTime=true) {
	let fields;
	if( includeTime ) {
		fields += "time, ";
	}
	if ( datatype === "boolean" ) {
		fields = "valueBoolean";
	} else if ( datatype === "date" ) {
		fields = "valueDate";
	} else if ( datatype === "integer" ) {
		fields = "valueInteger";
	} else if ( datatype === "json" ) {
		fields = "valueJson";
	} else if ( datatype === "string" ) {
		fields = "valueString";
	} else if ( datatype === "time" ) {
		fields = "valueTime";
	} else if ( datatype === "float" ) {
		fields = "valueFloat";
	} else if ( datatype === "geo" ) {
		fields = "valueGeo";
	} else {
		fields = "value";
	}
	if( asValue ) {
		fields += " as value";
	}
	return fields;
}

/**
 * @api {get} /data/:flow_id/:data_id? Get DataPoint(s)
 * @apiName Get DataPoint(s)
 * @apiGroup 0 DataPoint
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} flow_id Flow ID you want to get data from
 * @apiParam {uuid-v4} [flow_id] Datapoint ID
 * @apiParam {String} [sort=desc] Set to sorting order, the value can be either "asc" or ascending or "desc" for descending.
 * @apiParam {Number} [page] Page offset
 * @apiParam {Integer} [start] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiParam {Integer} [end] Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiParam {Number{1-5000}} [limit] Set the number of expected resources.
 * @apiParam {String="min","max","first","last","sum","count"} [select] Modifier function to modify the results
 * @apiParam {String="10ns, 100µ, 3600ms, 3600s, 1m, 3h, 4d, 2w, 365d"} [group] Group By Clause
 * @apiParam {String} [dateFormat] See momentJs documentation to foarmat date displays
 * @apiParam {String="bar","line","pie","voronoi"} graphType Type of graph
 * @apiParam {String} [xAxis] Label value in X axis
 * @apiParam {String} [yAxis] Label value in Y axis
 * @apiParam {Integer} [width] output width of SVG chart
 * @apiParam {Integer} [height] output height of SVG chart
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
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/:flow_id([0-9a-z\-]+)/?(:data_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var flow_id = req.params.flow_id;
	var data_id = req.params.data_id;
	var modifier = req.query.modifier;
	var query;
	var start;
	var end;
	
	if ( !flow_id ) {
		res.status(405).send(new ErrorSerializer({"id": 56, "code": 405, "message": "Method Not Allowed"}).serialize());
	} else {
		flows = db.getCollection("flows");
		units = db.getCollection("units");

		let where = "";
		if ( data_id ) {
			if ( data_id.toString().length === 10 ) { data_id *= 1e9; }
			else if ( data_id.toString().length === 13 ) { data_id *= 1e6; }
			else if ( data_id.toString().length === 16 ) { data_id *= 1e3; }
			where += sprintf(" AND time=%s", data_id);
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

		var sorting = req.query.order==="asc"?"ASC":(req.query.sort==="asc"?"ASC":"DESC");
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

		let flow = flows.chain().find({ "id" : { "$aeq" : flow_id } }).limit(1);
		let join = flow.eqJoin(units.chain(), "unit", "id");

		let flowsDT = db.getCollection("flows");
		datatypes	= db.getCollection("datatypes");
		let flowDT = flowsDT.chain().find({id: flow_id,}).limit(1);
		let joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		let datatype = typeof (joinDT.data())[0]!=="undefined"?(joinDT.data())[0].right.name:null;
		let fields;

		if ( typeof modifier!=="undefined" ) {
			fields = getFieldsFromDatatype(datatype, false);
			switch(modifier) {
				case "min": fields += ", MIN(valueFloat) as value";break;
				case "max": fields += ", MAX(valueFloat) as value";break;
				case "first": fields += ", FIRST(valueFloat) as value";break;
				case "last": fields += ", LAST(valueFloat) as value";break;
				case "sum": fields = "SUM(valueFloat) as value";break;
				case "count": fields = "COUNT(valueFloat) as value";break;
				//case "median": fields += ", MEDIAN(valueFloat)";break;
				//case "mean": fields += ", MEAN(valueFloat)";break;
			}
		} else {
			fields = getFieldsFromDatatype(datatype, true, true);
		}

		let group_by = "";
		if(typeof group!=="undefined") {
			group_by = sprintf("GROUP BY time(%s)", group);
		}

		let retention = typeof influxSettings.retentionPolicies.data!=="undefined"?influxSettings.retentionPolicies.data:"autogen";
		query = sprintf("SELECT %s FROM %s.data WHERE flow_id='%s' %s %s ORDER BY time %s LIMIT %s OFFSET %s", fields, retention, flow_id, where, group_by, sorting, limit, (page-1)*limit);
		t6console.debug(sprintf("Query: %s", query));

		dbInfluxDB.query(query).then(data => {
			if ( data.length > 0 ) {
				data.map(function(d) {
					d.id = sprintf("%s/%s", flow_id, moment(d.time).format("x")*1000);
					d.timestamp = Date.parse(d.time);
					d.time = Date.parse(d.time);
				});
				data.title = ((join.data())[0].left)!==null?((join.data())[0].left).name:"";
				data.unit = ((join.data())[0].right)!==null?((join.data())[0].right).format:"";
				data.mqtt_topic = ((join.data())[0].left).mqtt_topic;
				data.ttl = 3600; // TODO
				data.flow_id = flow_id;
				data.pageSelf = page;
				data.pageNext = page+1;
				data.pagePrev = page-1;
				data.sort = typeof req.query.sort!=="undefined"?req.query.sort:"asc";
				let total = 9999999999999;//TODO, we should get total from influxdb
				data.pageLast = Math.ceil(total/limit);
				data.limit = limit;
				
				data.group = undefined;
				data.groupRows = undefined;
				data.groupsTagsKeys = undefined;
				data.groups = undefined;

				res.status(200).send(new DataSerializer(data).serialize());
			} else {
				res.status(404).send({err: "No data found", "id": 899.5, "code": 404, "message": "Not found"});
			}
		}).catch(err => {
			res.status(500).send({err: err, "id": 899, "code": 500, "message": "Internal Error"});
		});
	}
});

/**
 * @api {post} /data/:flow_id Create a DataPoint
 * @apiName Create a DataPoint
 * @apiDescription Create a DataPoint to t6. This needs to post the datapoint over a flow from your own collection.
 * The payload can be crypted using aes-256-cbc algorithm and optionally signed as well. Using both encrypting and signature require to sign the payload first and then to encrypt the new payload as an enveloppe.
 * On both Sign & Encrypt, it is required to claim the object_id in the body so that the symmetric Secret Key can be found on the object as well as the Crypt Secret.
 * @apiGroup 0 DataPoint
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} flow_id Flow ID you want to add Data Point to
 * @apiParam {String} value Data Point value
 * @apiParam {Boolean} [publish=true] Flag to publish to Mqtt Topic ; This parameter might become deprecated.
 * @apiParam {Boolean} [save=false] Flag to store in database the Value
 * @apiParam {String} [unit=undefined] Unit of the Value
 * @apiParam {String} [mqtt_topic="Default value from the Flow resource"] Mqtt Topic to publish value
 * @apiParam {uuid-v4} [data_type="Default value from the Flow resource"] DataType Id
 * @apiParam {String} [text=undefined] Optional text to qualify Value
 * @apiParam {uuid-v4} [object_id=undefined] Optional object_id uuid used for Signed payload; for decrypt and encrypting in the Mqtt; The object_id must be own by the user in JWT.
 * @apiParam {String} [latitude="39.800327"] Optional String to identify where does the datapoint is coming from. (This is only used for rule specific operator)
 * @apiParam {String} [longitude="6.343530"] Optional String to identify where does the datapoint is coming from. (This is only used for rule specific operator)
 * @apiParam {String} [signedPayload=undefined] Optional Signed payload containing datapoint resource
 * @apiParam {String} [encryptedPayload=undefined] Optional Encrypted payload containing datapoint resource
 * @apiParam {Object} [influx_db_cloud] influx_db_cloud object to define what bucket should be used to save data on the cloud
 * @apiUse 200
 * @apiUse 201
 * @apiUse 401
 * @apiUse 401sign
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 * @apiUse 500
 */
router.post("/(:flow_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res, next) {
	let payload = req.body;
	let error;
	let isEncrypted = false;
	let isSigned = false;
	let prerequisite = 0;
	let object_id = payload.object_id;

	if ( payload.signedPayload || payload.encryptedPayload ) {
		var cert = jwtsettings.secret; //- fs.readFileSync("private.key");
		objects	= db.getCollection("objects");

		var query;
		if ( typeof object_id !== "undefined" ) {
			query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "id" : object_id },
				]
			};
			var object = objects.findOne(query);
			if ( object && object.secret_key ) {
				cert = object.secret_key;
			}
		}

		if ( payload.encryptedPayload ) {
			// The payload is encrypted
			isEncrypted = true;
			let decrypted = decryptPayload(payload.encryptedPayload.trim(), object); // ascii, binary, base64, hex, utf8
			payload = decrypted!==false?decrypted:payload;
			payload = getJson(payload);
		}

		if ( typeof payload !== "undefined" && payload.signedPayload ) {
			// The payload is signed
			isSigned = true;
			jwt.verify(payload.signedPayload, cert, function(err, decoded) {
				if ( !err ) {
					payload = decoded;
					if ( payload.encryptedPayload ) {
						// The payload is encrypted
						isEncrypted = true;
						let decrypted = decryptPayload(payload.encryptedPayload.trim(), object); // ascii, binary, base64, hex, utf8
						payload = decrypted!==false?decrypted:payload;
					}
				} else {
					payload = undefined;
					error = err;
					t6console.error("Error "+error);
					res.status(401).send(new ErrorSerializer({"id": 62.4, "code": 401, "message": "Invalid Signature",}).serialize());
					next();
				}
			});
		}
	}
	
	if ( typeof payload !== "undefined" && !error ) {
		payload = getJson(payload);
		var flow_id		= typeof req.params.flow_id!=="undefined"?req.params.flow_id:payload.flow_id;
		var time		= (payload.timestamp!=="" && typeof payload.timestamp!=="undefined")?parseInt(payload.timestamp, 10):moment().format("x");
		if ( time.toString().length <= 10 ) { time = moment(time*1000).format("x"); }
		payload.time	= time;
		var value		= typeof payload.value!=="undefined"?payload.value:"";
		var publish		= typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true;
		var save		= typeof payload.save!=="undefined"?JSON.parse(payload.save):true;
		var unit		= typeof payload.unit!=="undefined"?payload.unit:"";
		var mqtt_topic	= typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:"";
		var latitude	= typeof payload.latitude!=="undefined"?payload.latitude:"";
		var longitude	= typeof payload.longitude!=="undefined"?payload.longitude:"";
		var text		= typeof payload.text!=="undefined"?payload.text:"";
		var fields;

		if ( !flow_id || !req.user.id ) {
			// Not Authorized because token is invalid
			res.status(401).send(new ErrorSerializer({"id": 64, "code": 401, "message": "Not Authorized",}).serialize());
		} else {
			flows		= db.getCollection("flows");
			datatypes	= db.getCollection("datatypes");
			let f = flows.chain().find({id: ""+flow_id, user_id: req.user.id,}).limit(1);
			let current_flow = (f.data())[0]; // Warning TODO, current_flow can be unset when user posting to fake flow_id, in such case we should take the data_type from payload
			let join;
			let datatype;

			if(typeof payload.data_type!=="undefined") {
				let dt = (datatypes.chain().find({id: ""+payload.data_type,}).limit(1)).data()[0];
				datatype = (typeof payload.data_type!=="undefined" && typeof dt!=="undefined")?dt.name:"string";
				t6console.debug(`Getting datatype "${datatype}" from payload`);
			} else if (typeof current_flow!=="undefined") {
				join = f.eqJoin(datatypes.chain(), "data_type", "id");
				datatype = typeof (join.data())[0]!=="undefined"?(join.data())[0].right.name:"string";
				t6console.debug(`Getting datatype "${datatype}" from Flow`);
			} else {
				datatype = "string";
				t6console.debug(`Getting datatype "${datatype}" from default value`);
			}

			if ( !mqtt_topic && (f.data())[0] && ((f.data())[0].left) && ((f.data())[0].left).mqtt_topic ) {
				mqtt_topic = ((f.data())[0].left).mqtt_topic;
			}
			if ( typeof current_flow!=="undefined" && current_flow.left && current_flow.left.require_encrypted && !isEncrypted ) {
				//t6console.log("(f.data())[0].left", (f.data())[0].left);
				t6console.debug("Flow require isEncrypted -", current_flow.left.require_encrypted);
				t6console.debug(".. & Payload isEncrypted", isEncrypted);
				prerequisite += 1;
			}
			if ( typeof current_flow!=="undefined" && current_flow.left && current_flow.left.require_signed && !isSigned ) {
				//t6console.log("current_flow.left", current_flow.left);
				t6console.debug("Flow require isSigned -", current_flow.left.require_signed);
				t6console.debug(".. & Payload isSigned", isSigned);
				prerequisite += 1;
			}

			t6console.debug("Prerequisite Index=", prerequisite, "(when >0 it means something is required.)");
			if ( prerequisite <= 0 ) {
				payload.user_id = req.user.id; //to get the Object
				
				let preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:((typeof current_flow!=="undefined"&&typeof current_flow.preprocessor!=="undefined")?JSON.parse(JSON.stringify(current_flow.preprocessor)):[]);
				preprocessor = Array.isArray(preprocessor)===false?[preprocessor]:preprocessor;
				preprocessor.push({"name": "sanitize", "datatype": datatype});
				let result = t6preprocessor.preprocessor(current_flow, payload, preprocessor);
				payload = result.payload;
				preprocessor = result.preprocessor;
				payload.preprocessor = result.preprocessor;
				fields = result.fields;

				/* might be moved to preprocessor */
				save = typeof payload.save!=="undefined"?JSON.parse(payload.save):true;
				unit = typeof payload.unit!=="undefined"?payload.unit:"";
				mqtt_topic = typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:"";
				latitude = typeof payload.latitude!=="undefined"?payload.latitude:"";
				longitude = typeof payload.longitude!=="undefined"?payload.longitude:"";
				text = typeof payload.text!=="undefined"?payload.text:"";
				payload.value = payload.sanitizedValue;
				/* end might be moved to preprocessor */

				// TODO : make sure preprocessor is completed before Fusion
				if ( dataFusion.activated === true ) {
					payload.fusion = typeof payload.fusion!=="undefined"?payload.fusion:{};
					payload.fusion.messages = [];
					
					let track_id = typeof payload.track_id!=="undefined"?payload.track_id:((typeof current_flow!=="undefined" && typeof current_flow.track_id!=="undefined")?current_flow.track_id:null);
					let fusion_algorithm = typeof payload.fusion.algorithm!=="undefined"?payload.fusion.algorithm:((typeof current_flow!=="undefined" && typeof current_flow.fusion_algorithm!=="undefined")?current_flow.fusion_algorithm:null);
					let requireDataType = typeof payload.data_type!=="undefined"?payload.data_type:(typeof current_flow!=="undefined"?current_flow.data_type:undefined); // By default, making sure all trracks are having the same datatype
					t6console.debug("fusion_algorithm", fusion_algorithm);
					t6preprocessor.addMeasurementToFusion({
						"flow_id": typeof current_flow!=="undefined"?current_flow.id:"unknown",
						"track_id": track_id,
						"user_id": typeof current_flow!=="undefined"?current_flow.user_id:"unknown",
						"sanitizedValue": payload.sanitizedValue,
						"latitude": payload.latitude,
						"longitude": payload.longitude,
						"time": parseInt(payload.time, 10),
						"ttl": parseInt((typeof current_flow!=="undefined" && typeof current_flow.ttl!=="undefined")?current_flow.ttl:3600, 10)*1000,
						"data_type": requireDataType,
					});

					let allTracks = t6preprocessor.getAllTracks((typeof current_flow!=="undefined"?current_flow.id:"unknown"), track_id, (typeof current_flow!=="undefined"?current_flow.user_id:"unknown"));
					let [isElligible, errorTracks] = t6preprocessor.isElligibleToFusion(allTracks, requireDataType);
					if( typeof current_flow!=="undefined" && isElligible && allTracks.length > 0 ) { // Check if we have at least 1 measure for each track
						t6console.debug("Fusion is elligible.");
						payload.fusion.messages.push("Fusion is elligible.");
						// Compute average for each tracks
						let allTracksAfterAverage = t6preprocessor.reduceMeasure(allTracks);
						t6console.debug(allTracksAfterAverage);
						// Fuse
						let total=0;
						let sumWeight=0;
						let fusionValue;
						let fusionTime;
						payload.fusion.measurements = [];
						switch(fusion_algorithm) {
							case "mht": // Multiple Hypothesis Test (MHT)
								break;
							case "pda": // Probabilistic Data Association (PDA)
								break;
							case "jpda": // Joint PDA (JPDA)
								break;
							case "nn": // Nearest Neighbors (NN)
							case "nearest_neighbors":
								break;
							case "mmse": // minimum mean square error (MMSE)
								break;
							case "average_weighted":
								allTracksAfterAverage.map(function(track) {
									sumWeight += typeof track.weight!=="undefined"?track.weight:1;
									total += track.average * sumWeight;
									fusionTime = track.time;
									payload.fusion.measurements.push({id: track.id, count: track.count});
								});
								fusionValue = total / sumWeight;
								break;
							case "average":
							default:
								allTracksAfterAverage.map(function(track) {
									total += track.average;
									payload.fusion.measurements.push({id: track.id, count: track.count});
									fusionTime = track.time;
								});
								fusionValue = total / allTracksAfterAverage.length;
								break;
						}
						let v = getFieldsFromDatatype(datatype, false, false);
						payload.fusion.initialValue = payload.value;
						payload.value = fusionValue;
						(fields[0])[v] = fusionValue;
						payload.fusion.correction = payload.fusion.initialValue - fusionValue;
						payload.fusion.algorithm = fusion_algorithm;
						payload.fusion.messages.push("Fusion processed.");
						
						// Do we need to save measure to Primary Flow ? // TODO : so instead of the track.. :-(
						payload.fusion.primary_flow = track_id;
						time = fusionTime; // Code consistency !
						payload.timestamp = fusionTime/1000000;
						t6console.debug("fusionTime", moment(fusionTime).format(logDateFormat));
						flow_id = track_id;
						
					} else {
						payload.fusion.messages.push("Fusion not processed; missing measurements on some tracks ; or incompatible datatypes.");
						payload.fusion.error_tracks = errorTracks;
					}
					// Clean expired buffer
					let size = t6preprocessor.clearExpiredMeasurement();
					size>0?payload.fusion.messages.push(`${size} expired measurements - cleaned from buffer.`):null;
				} // end Fusion

				// TODO : make sure preprocessor is completed before saving value
				if ( save === true ) {
					let rp = typeof influxSettings.retentionPolicies.data!=="undefined"?influxSettings.retentionPolicies.data:"autogen";
					if ( db_type.influxdb === true ) {
						t6console.debug("Saving to timeseries");
						/* InfluxDB database */
						var tags = {};
						var timestamp = time*1000000;
						if (flow_id!=="") {
							tags.flow_id = flow_id;
						}
						tags.user_id = req.user.id;
						tags.rp = rp;
						if(typeof current_flow!=="undefined" && (typeof current_flow.track_id!=="undefined" && current_flow.track_id!=="" && current_flow.track_id!==null)) {
							tags.track_id = current_flow.track_id;
						}
						if (text!=="") {
							fields[0].text = text;
						}

						let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
						dbWrite.writePoints([{
							measurement: "data",
							tags: tags,
							fields: fields[0],
							timestamp: timestamp,
						}], { retentionPolicy: rp }).then(err => {
							if (err) {
								t6console.error({"message": "Error on writePoints to influxDb", "err": err, "tags": tags, "fields": fields[0], "timestamp": timestamp});
							} else {
								let v = getFieldsFromDatatype(datatype, false, false);
								t6console.debug(`Saved ${(fields[0])[v]} on rp=${rp} / Tags :`, tags);
								//t6console.debug(`Using `, fields[0], timestamp);
							}
						}).catch(err => {
							t6console.error({"message": "Error catched on writting to influxDb - in data.js", "err": err, "tags": tags, "fields": fields[0], "timestamp": timestamp});
						});
					} // end influx
				} else {
					t6console.debug("Save Process Disabled!");
				} // end save
				
				// TODO : make sure preprocessor is completed before saving value
				if ((typeof current_flow!=="undefined" && typeof current_flow.influx_db_cloud!=="undefined") || typeof payload.influx_db_cloud!=="undefined") {
					const {InfluxDB} = require("@influxdata/influxdb-client");
					const token = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.token!=="undefined")?payload.influx_db_cloud.token:current_flow.influx_db_cloud.token;
					const org = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.org!=="undefined")?payload.influx_db_cloud.org:current_flow.influx_db_cloud.org;
					const url = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.url!=="undefined")?payload.influx_db_cloud.url:current_flow.influx_db_cloud.url;
					const bucket = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.bucket!=="undefined")?payload.influx_db_cloud.bucket:current_flow.influx_db_cloud.bucket;
					
					if(token && org && url && bucket) {
						t6console.debug("influxDbCloud Saving to Cloud.");
						const dbInfluxDBCloud = new InfluxDB({url: url, token: token});
						
						const {Point} = require("@influxdata/influxdb-client");
						const writeApi = dbInfluxDBCloud.getWriteApi(org, bucket);
						
						const point = new Point("data")
							.tag("user_id", req.user.id)
							.tag("flow_id", flow_id)
							.tag("track_id", (typeof my_flow!=="undefined" && (typeof my_flow.track_id!=="undefined" && my_flow.track_id!=="" && my_flow.track_id!==null))?my_flow.track_id:null);
						point.timestamp(timestamp);
						
						typeof fields[0].valueFloat!=="undefined"?point.floatField("valueFloat", parseFloat(fields[0].valueFloat)):null;
						typeof fields[0].valueBoolean!=="undefined"?point.booleanField("valueBoolean", fields[0].valueBoolean):null;
						typeof fields[0].valueInteger!=="undefined"?point.intField("valueInteger", fields[0].valueInteger):null;
						typeof fields[0].valueString!=="undefined"?point.stringField("valueString", fields[0].valueString):null;
						typeof fields[0].valueDate!=="undefined"?point.stringField("valueDate", fields[0].valueDate):null;
						typeof fields[0].valueJson!=="undefined"?point.stringField("valueJson", fields[0].valueJson):null;
						typeof fields[0].valueGeo!=="undefined"?point.stringField("valueGeo", fields[0].valueGeo):null;
						typeof fields[0].text!=="undefined"?point.stringField("text", fields[0].text):null;
						writeApi.writePoint(point);
						writeApi
							.close()
							.then(() => {
								t6console.debug("Wrote to influxDbCloud");
								//t6console.log(point);
								t6events.add("t6App", "Wrote to influxDbCloud", req.user.id, req.user.id, {"user_id": req.user.id});
							})
							.catch(e => {
								t6console.error(e);
								t6console.debug("Write Error on influxDbCloud");
								t6events.add("t6App", "Write Error on influxDbCloud", req.user.id, req.user.id, {"user_id": req.user.id, "error": e});
							});
					} // end valid token
					else {
						t6console.log("Can't save to Cloud ; missing credentials.");
					}
				} // end saveToCloud

				// TODO : make sure preprocessor is completed before publishing
				if ( publish === true ) {
					t6console.debug("Publishing");
					let flow = flow_id!==null?flow_id:(typeof payload.flow_id!=="undefined"?payload.flow_id:(typeof current_flow!=="undefined"?current_flow.id:""));
					let payloadFact = {"dtepoch": time, "value": JSON.parse(JSON.stringify(payload.value)), "flow": flow, "datatype": datatype, "mqtt_topic": typeof mqtt_topic!=="undefined"?(mqtt_topic).toString():""}; // This is the bare minimal payload
					if ( typeof object_id !== "undefined" ) {
						payloadFact.object_id = object_id;
						objects	= db.getCollection("objects");
						let query = {
						"$and": [
								{ "user_id" : req.user.id },
								{ "id" : object_id },
							]
						};
						var object = objects.findOne(query);
						if ( object ) {
							payloadFact.object = object;
						}
					}
					
					if ( text ) {
						payloadFact.text = text;
					}
					payloadFact.latitude = typeof latitude!=="undefined"?latitude:null;
					payloadFact.longitude = typeof longitude!=="undefined"?longitude:null;
					t6decisionrules.action(req.user.id, payloadFact, mqtt_topic);
				} else {
					t6console.debug("No Publishing");
				} // end publish

				fields.flow_id = flow_id;
				fields.id = time*1000000;
				fields.parent = flow_id;
				fields.first;
				fields.prev;
				fields.next;
				fields[0].save = JSON.parse(save);
				fields[0].flow_id = flow_id;
				fields[0].datatype = datatype;
				fields[0].title = typeof current_flow!=="undefined"?current_flow.title:null;
				fields[0].ttl = typeof current_flow!=="undefined"?current_flow.ttl:null;
				fields[0].id = time*1000000;
				fields[0].time = time*1000000;
				fields[0].timestamp = time*1000000;
				fields[0].value = payload.value;
				fields[0].publish = publish;
				fields[0].mqtt_topic = mqtt_topic;
				fields[0].preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:null;
				fields[0].fusion = typeof payload.fusion!=="undefined"?payload.fusion:null;

				res.header("Location", "/v"+version+"/flows/"+flow_id+"/"+fields[0].id);
				res.status(200).send(new DataSerializer(fields).serialize());
				t6events.add("t6Api", "POST data", typeof req.user.id!=="undefined"?req.user.id:null, typeof req.user.id!=="undefined"?req.user.id:null, {flow_id: flow_id});
			} else {
				res.status(412).send(new ErrorSerializer({"id": 64.2, "code": 412, "message": "Precondition Failed "+prerequisite,}).serialize());
			}
		}
	} else {
		res.status(412).send(new ErrorSerializer({"id": 65, "code": 412, "message": "Precondition Failed "+error,}).serialize());
	}
});

module.exports = router;
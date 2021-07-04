"use strict";
var express = require("express");
var router = express.Router();
var DataSerializer = require("../serializers/data");
var ErrorSerializer = require("../serializers/error");
let encoding = "utf8";

function getJson(v) {
	try {
		return JSON.parse(v);
	} catch (e) {
		return v;
	}
}
function getObjectKey(payload, user_id) {
	t6console.error("getObjectKey", payload.object_id);
	return new Promise((resolve, reject) => {
		if ( typeof payload.object_id !== "undefined" ) {
			let query = { "$and": [ { "user_id" : user_id }, { "id" : payload.object_id }, ] };
			var object = objects.findOne(query);
			if ( object && object.secret_key ) {
				t6console.debug("Retrived key from Object.");
				resolve({payload, object});
			} else {
				t6console.debug("No Secret Key available on Object.");
				payload.errorMessage.push("No Secret Key available on Object.");
				reject({payload, object});
			}
		} else {
			t6console.debug("No Object_id defined to get Key.");
			payload.errorMessage.push("No object_id defined to get secret Key.");
			reject({payload, object});
		}
	});
}
function getFieldsFromDatatype(datatype, asValue, includeTime=true) {
	let fields = "";
	if( includeTime ) {
		fields += "time, ";
	}
	switch(datatype) {
		case "boolean": 
			fields += "valueBoolean";
			break;
		case "date": 
			fields += "valueDate";
			break;
		case "integer": 
			fields += "valueInteger";
			break;
		case "json": 
			fields += "valueJson";
			break;
		case "time": 
			fields += "valueTime";
			break;
		case "float": 
			fields += "valueFloat";
			break;
		case "geo": 
			fields += "valueGeo";
			break;
		case "string": 
		default: 
			fields += "valueString";
			break;
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

		let flow = flows.chain().find({ "id" : { "$aeq" : flow_id } }).limit(1);
		let join = flow.eqJoin(units.chain(), "unit", "id");

		let flowDT = flows.chain().find({id: flow_id,}).limit(1);
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
				data.ttl = (((join.data())[0].left).ttl!==null && ((join.data())[0].left).ttl!=="")?((join.data())[0].left).ttl:3600;
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

function preloadPayload(payload, user_id) {
	t6console.debug("preloadPayload");
	return new Promise((resolve, reject) => {
		payload = getJson(payload);
		let object;
		payload.timestamp	= (payload.timestamp!=="" && typeof payload.timestamp!=="undefined")?parseInt(payload.timestamp, 10):moment().format("x");
		if ( payload.timestamp.toString().length <= 10 ) { payload.timestamp = moment(time*1000).format("x"); }
		payload.time		= payload.timestamp;
		payload.user_id		= typeof user_id!=="undefined"?user_id:null;
		payload.value		= typeof payload.value!=="undefined"?payload.value:"";
		payload.unit		= typeof payload.unit!=="undefined"?payload.unit:"";
		payload.mqtt_topic	= typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:"";
		payload.latitude	= typeof payload.latitude!=="undefined"?payload.latitude:"";
		payload.longitude	= typeof payload.longitude!=="undefined"?payload.longitude:"";
		payload.text		= typeof payload.text!=="undefined"?payload.text:"";
		payload.save		= typeof payload.save!=="undefined"?JSON.parse(payload.save):true;
		payload.publish		= typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true;
		payload.errorMessage = [];
		if(payload.object_id) {
			getObjectKey(payload, user_id)
				.then((ok) => {
					payload = ok.payload;
					object = ok.object;
					payload.secret_key = (typeof object!=="undefined" && typeof object.secret_key!=="undefined")?object.secret_key:jwtsettings.secret; //- fs.readFileSync("private.key");
					payload.secret_key_crypt = (typeof object!=="undefined" && typeof object.secret_key_crypt!=="undefined")?object.secret_key_crypt:null;
					resolve({payload, object});
				})
				.catch((error) => { 
					t6console.error("Error inside preloadPayload > getObjectKey", error);
					payload.errorMessage.push("Couldn't get secret key from Object. "+error);
					reject({payload, object});
				});
		} else {
			resolve({payload, object});
		}
	});
}

function signatureCheck(payload, object) {
	t6console.debug("signatureCheck");
	return new Promise((resolve, reject) => {
		let initialPayload = {
			flow_id: payload.flow_id,
			user_id: payload.user_id,
			unit: payload.unit,
			mqtt_topic: payload.mqtt_topic,
			latitude: payload.latitude,
			longitude: payload.longitude,
			text: payload.text,
			time: payload.time,
			timestamp: payload.timestamp,
			save: typeof payload.save!=="undefined"?JSON.parse(payload.save):true,
			publish: typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true,
		}
		object = typeof object!=="undefined"?object:{};
		object.secret_key = typeof object.secret_key!=="undefined"?object.secret_key:jwtsettings.secret;
		if ( typeof payload!=="undefined" && payload.signedPayload && object.secret_key ) {
			jwt.verify(payload.signedPayload, object.secret_key, function(err, decodedPayload) {
				if ( decodedPayload && !err ) {
					payload = getJson(decodedPayload!==""?decodedPayload:payload);
					payload.flow_id = typeof payload.flow_id!=="undefined"?payload.flow_id:initialPayload.flow_id;
					payload.user_id = typeof payload.user_id!=="undefined"?payload.user_id:initialPayload.user_id;
					payload.unit = typeof payload.unit!=="undefined"?payload.unit:initialPayload.unit;
					payload.mqtt_topic = typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:initialPayload.mqtt_topic;
					payload.latitude = typeof payload.latitude!=="undefined"?payload.latitude:initialPayload.latitude;
					payload.longitude = typeof payload.longitude!=="undefined"?payload.longitude:initialPayload.longitude;
					payload.text = typeof payload.text!=="undefined"?payload.text:initialPayload.text;
					payload.time = typeof payload.time!=="undefined"?payload.time:initialPayload.time;
					payload.timestamp = typeof payload.timestamp!=="undefined"?payload.timestamp:initialPayload.timestamp;
					payload.save = typeof payload.save!=="undefined"?payload.save:initialPayload.save;
					payload.publish = typeof payload.publish!=="undefined"?payload.publish:initialPayload.publish;
					payload.isSigned = true;
					resolve({payload, object});
				} else {
					t6console.error("Error inside signatureCheck > jwt.verify");
					payload.isSigned = false;
					resolve({payload, object});
				}
			});
		} else {
			t6console.warn("Inside Is payload really signed? payload", payload);
			t6console.warn("Inside Is payload really signed?");
			resolve({payload, object});
		}
	});
}

function decrypt(payload, object) {
	t6console.debug("decrypt");
	return new Promise((resolve, reject) => {
		let initialPayload = {
			flow_id: payload.flow_id,
			user_id: payload.user_id,
			unit: payload.unit,
			mqtt_topic: payload.mqtt_topic,
			latitude: payload.latitude,
			longitude: payload.longitude,
			text: payload.text,
			time: payload.time,
			timestamp: payload.timestamp,
			save: typeof payload.save!=="undefined"?JSON.parse(payload.save):true,
			publish: typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true,
		}
		t6console.debug("initialPayload", initialPayload);
		if ( typeof payload!=="undefined" && payload.encryptedPayload && object ) {
			let encryptedPayload = payload.encryptedPayload.trim();
			if ( object && object.secret_key_crypt ) {
				var decryptedPayload;
				var key = Buffer.from(object.secret_key_crypt, "hex");
				let textParts = encryptedPayload.split(":");
				let iv = Buffer.from(textParts.shift(), "hex");
				encryptedPayload = textParts.shift();
		
				let decipher = crypto.createDecipheriv(algorithm, key, iv);
				decipher.setAutoPadding(true);
				decryptedPayload = decipher.update(encryptedPayload, "base64", encoding || "utf8");// ascii, binary, base64, hex, utf8
				decryptedPayload += decipher.final(encoding || "utf8");
				payload = getJson(decryptedPayload!==""?decryptedPayload:payload);
				payload.flow_id = typeof payload.flow_id!=="undefined"?payload.flow_id:initialPayload.flow_id;
				payload.user_id = typeof payload.user_id!=="undefined"?payload.user_id:initialPayload.user_id;
				payload.unit = typeof payload.unit!=="undefined"?payload.unit:initialPayload.unit;
				payload.mqtt_topic = typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:initialPayload.mqtt_topic;
				payload.latitude = typeof payload.latitude!=="undefined"?payload.latitude:initialPayload.latitude;
				payload.longitude = typeof payload.longitude!=="undefined"?payload.longitude:initialPayload.longitude;
				payload.text = typeof payload.text!=="undefined"?payload.text:initialPayload.text;
				payload.time = typeof payload.time!=="undefined"?payload.time:initialPayload.time;
				payload.timestamp = typeof payload.timestamp!=="undefined"?payload.timestamp:initialPayload.timestamp;
				payload.save = typeof payload.save!=="undefined"?payload.save:initialPayload.save;
				payload.publish = typeof payload.publish!=="undefined"?payload.publish:initialPayload.publish;
				payload.isEncrypted = true;
				t6console.debug("decryptedPayload", payload);
				resolve({payload, object});
			} else {
				t6console.error("Error inside decrypt: Object is not available or does not contains any secret key.");
				payload.errorMessage.push("Object is not available or does not contains any secret key. "+error);
				payload.isEncrypted = false;
				reject({payload, object});
			}
		} else {
			t6console.debug("Inside decrypt: look like the payload is not encrypted.");
			resolve({payload, object});
		}
	});
}

function verifyPrerequisites(payload, object) {
	t6console.debug("verifyPrerequisites");
	return new Promise((resolve, reject) => {
		payload.prerequisite = 0;
		if ( !payload.value ) {
			t6console.error("Error: verifyPrerequisites : no value.");
			resolve({payload, object, current_flow: null});
		}
		if ( !payload.flow_id ) {
			t6console.error("Error: verifyPrerequisites : no flow_id.");
			resolve({payload, object, current_flow: null});
		} else {
			let f = flows.chain().find({id: ""+payload.flow_id, user_id: payload.user_id,}).limit(1);
			let current_flow = (f.data())[0]; // Warning TODO, current_flow can be unset when user posting to fake flow_id, in such case we should take the data_type from payload
			let join;
	
			if(typeof payload.datatype_id!=="undefined") { 
				let dt = (datatypes.chain().find({id: ""+payload.datatype_id,}).limit(1)).data()[0];
				payload.datatype = (typeof payload.datatype_id!=="undefined" && typeof dt!=="undefined")?dt.name:"string";
				t6console.debug(`Getting datatype "${payload.datatype}" from payload`);
			} else if (typeof current_flow!=="undefined") {
				join = f.eqJoin(datatypes.chain(), "data_type", "id"); // TODO : in Flow collection, the data_type should be renamed to datatype_id
				payload.datatype = typeof (join.data())[0]!=="undefined"?(join.data())[0].right.name:"string";
				t6console.debug(`Getting datatype "${payload.datatype}" from Flow`);
			} else {
				payload.datatype = "string";
				t6console.debug(`Getting datatype "${payload.datatype}" from default value`);
			}
	
			if ( !payload.mqtt_topic && (f.data())[0] && ((f.data())[0].left) && ((f.data())[0].left).mqtt_topic ) {
				payload.mqtt_topic = ((f.data())[0].left).mqtt_topic;
			}
			if ( typeof current_flow!=="undefined" && current_flow.left && current_flow.left.require_encrypted && !isEncrypted ) {
				//t6console.log("(f.data())[0].left", (f.data())[0].left);
				t6console.debug("Flow require isEncrypted -", current_flow.left.require_encrypted);
				t6console.debug(".. & Payload isEncrypted", isEncrypted);
				payload.prerequisite += 1;
			}
			if ( typeof current_flow!=="undefined" && current_flow.left && current_flow.left.require_signed && !isSigned ) {
				//t6console.log("current_flow.left", current_flow.left);
				t6console.debug("Flow require isSigned -", current_flow.left.require_signed);
				t6console.debug(".. & Payload isSigned", isSigned);
				payload.prerequisite += 1;
			}
			t6console.debug("Prerequisite Index=", payload.prerequisite, "(when >0 it means something is required.)");
			if (payload.prerequisite <= 0) {
				resolve({payload, object, current_flow});
			} else {
				payload.errorMessage.push("Payload is requiring either signature and/or encryption. "+error);
				reject({payload, object, current_flow: null});
			}
		}
	});
}

function preprocessor(payload, fields, current_flow) {
	t6console.debug("preprocessor");
	return new Promise((resolve, reject) => {
		if(!payload || current_flow===null) {
			resolve({payload, fields, current_flow});
		}
		let preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:((typeof current_flow!=="undefined"&&typeof current_flow.preprocessor!=="undefined")?JSON.parse(JSON.stringify(current_flow.preprocessor)):[]);
		preprocessor = Array.isArray(preprocessor)===false?[preprocessor]:preprocessor;
		preprocessor.push({"name": "sanitize", "datatype": payload.datatype});
		let result = t6preprocessor.preprocessor(current_flow, payload, preprocessor);
		payload = result.payload;
		preprocessor = result.preprocessor;
		payload.preprocessor = result.preprocessor;
		fields = result.fields;
		if(payload.sanitizedValue) {
			payload.value = payload.sanitizedValue;
		}
		if(payload.needRedacted) {
			payload.preprocessor.map(function(pp) {
				pp.initialValue = "**REDACTED**";
				pp.transformedValue = "**REDACTED**";
			});
		}
		if(payload.isRejected) {
			payload.save = false;
			t6console.debug("preprocessor : inside isRejected");
			resolve({payload, fields, current_flow});
		} else {
			t6console.debug("preprocessor : inside is Not Rejected");
			resolve({payload, fields, current_flow});
		}
	});
}

function fusion(payload, fields, current_flow) {
	t6console.debug("fusion");
	return new Promise((resolve, reject) => {
		if(!payload || current_flow===null) {
			resolve({payload, fields, current_flow});
		}
		if ( dataFusion.activated === true ) {
			payload.fusion = typeof payload.fusion!=="undefined"?payload.fusion:{};
			payload.fusion.messages = [];
			t6console.debug("Fusion is enabled on t6", payload.fusion);
			let track_id = typeof payload.track_id!=="undefined"?payload.track_id:((typeof current_flow!=="undefined" && typeof current_flow.track_id!=="undefined")?current_flow.track_id:null);
			let fusion_algorithm = typeof payload.fusion.algorithm!=="undefined"?payload.fusion.algorithm:((typeof current_flow!=="undefined" && typeof current_flow.fusion_algorithm!=="undefined")?current_flow.fusion_algorithm:null);
			let requireDataType = typeof payload.data_type!=="undefined"?payload.data_type:(typeof current_flow!=="undefined"?current_flow.data_type:undefined); // By default, making sure all trracks are having the same datatype
			t6console.debug("Using fusion algorithm", fusion_algorithm);
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
			
			if( typeof current_flow!=="undefined" && isElligible && allTracks.length > 0 && (track_id!=="" || track_id!==null) ) { // Check if we have at least 1 measure for each track
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
					case "lsh": // Locality-Sensitive Hashing (LSH)
					case "locality_sensitive_hashing":
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
				let v = getFieldsFromDatatype(payload.datatype, false, false);
				payload.fusion.initialValue = payload.value;
				payload.value = fusionValue;
				(fields[0])[v] = fusionValue;
				payload.fusion.correction = payload.fusion.initialValue - fusionValue;
				payload.fusion.algorithm = fusion_algorithm;
				payload.fusion.messages.push("Fusion processed.");
				
				// Do we need to save measure to Primary Flow ? // TODO : so instead of the track.. :-(
				payload.fusion.primary_flow = track_id;
				payload.time = fusionTime; // Code consistency !
				payload.timestamp = fusionTime/1000000;
				t6console.debug("fusionTime", moment(fusionTime).format(logDateFormat));
				payload.flow_id = track_id;
			} else {
				payload.fusion.messages.push("Fusion not processed; missing measurements on some tracks ; or incompatible datatypes ; or no track on Flow/payload.");
				payload.fusion.error_tracks = errorTracks;
				resolve({payload, fields, current_flow});
			}
			// Clean expired buffer
			let size = t6preprocessor.clearExpiredMeasurement();
			size>0?payload.fusion.messages.push(`${size} expired measurements - cleaned from buffer.`):null;
		} // end Fusion
		resolve({payload, fields, current_flow});
	});
}

function saveToLocal(payload, fields, current_flow) {
	t6console.debug("saveToLocal");
	let save = typeof payload.save!=="undefined"?JSON.parse(payload.save):true;
	return new Promise((resolve, reject) => {
		if(!payload || current_flow===null) {
			resolve({payload, fields, current_flow});
		}
		if ( save === true ) {
			let rp = typeof influxSettings.retentionPolicies.data!=="undefined"?influxSettings.retentionPolicies.data:"autogen";
			if ( db_type.influxdb === true ) {
				t6console.debug("Saving to timeseries");
				/* InfluxDB database */
				var tags = {};
				payload.timestamp = payload.time*1000000;
				if (payload.flow_id!=="") {
					tags.flow_id = payload.flow_id;
				}
				tags.user_id = payload.user_id;
				tags.rp = rp;
				if(typeof current_flow!=="undefined" && (typeof current_flow.track_id!=="undefined" && current_flow.track_id!=="" && current_flow.track_id!==null)) {
					tags.track_id = current_flow.track_id;
				}
				if (payload.text!=="") {
					fields[0].text = payload.text;
				}

				let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
				dbWrite.writePoints([{
					measurement: "data",
					tags: tags,
					fields: fields[0],
					timestamp: payload.timestamp,
				}], { retentionPolicy: rp }).then(err => {
					if (err) {
						t6console.error({"message": "Error on writePoints to influxDb", "err": err, "tags": tags, "fields": fields[0], "timestamp": payload.timestamp});
						resolve({payload, fields, current_flow});
					} else {
						let v = getFieldsFromDatatype(payload.datatype, false, false);
						t6console.debug(`Saved "${(fields[0])[v]}" using rp=${rp} / Tags :`, tags);
						resolve({payload, fields, current_flow});
					}
				}).catch(err => {
					t6console.error({"message": "Error catched on writting to influxDb - in data.js", "err": err, "tags": tags, "fields": fields[0], "timestamp": payload.timestamp});
					resolve({payload, fields, current_flow});
				});
			} // end influx
		} else {
			t6console.debug("Save Process Disabled!");
			resolve({payload, fields, current_flow});
		} // end save
	});
}

function saveToCloud(payload, fields, current_flow) {
	t6console.debug("saveToCloud");
	return new Promise((resolve, reject) => {
		if(!payload || current_flow===null) {
			resolve({payload, fields, current_flow});
		}
		if ((typeof current_flow!=="undefined" && typeof current_flow.influx_db_cloud!=="undefined") || typeof payload.influx_db_cloud!=="undefined") {
			const {InfluxDB} = require("@influxdata/influxdb-client");
			let token = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.token!=="undefined")?payload.influx_db_cloud.token:current_flow.influx_db_cloud.token;
			let org = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.org!=="undefined")?payload.influx_db_cloud.org:current_flow.influx_db_cloud.org;
			let url = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.url!=="undefined")?payload.influx_db_cloud.url:current_flow.influx_db_cloud.url;
			let bucket = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.bucket!=="undefined")?payload.influx_db_cloud.bucket:current_flow.influx_db_cloud.bucket;
			
			if(token && org && url && bucket) {
				t6console.debug("influxDbCloud Saving to Cloud.");
				const dbInfluxDBCloud = new InfluxDB({url: url, token: token});
				
				const {Point} = require("@influxdata/influxdb-client");
				let writeApi = dbInfluxDBCloud.getWriteApi(org, bucket);
				
				let point = new Point("data")
					.tag("user_id", payload.user_id)
					.tag("flow_id", payload.flow_id)
					.tag("track_id", (typeof current_flow!=="undefined" && (typeof current_flow.track_id!=="undefined" && current_flow.track_id!=="" && current_flow.track_id!==null))?current_flow.track_id:null);
				point.timestamp(payload.timestamp);
				
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
						t6events.add("t6App", "Wrote to influxDbCloud", payload.user_id, payload.user_id, {"user_id": payload.user_id});
						resolve({payload, fields, current_flow});
					})
					.catch(e => {
						t6console.error("Write Error on influxDbCloud");
						t6console.error(e);
						t6events.add("t6App", "Write Error on influxDbCloud", payload.user_id, payload.user_id, {"user_id": payload.user_id, "error": e});
						reject({payload, fields, current_flow});
					});
			} // end valid token
			else {
				t6console.warn("Can't save to Cloud ; missing credentials.");
				resolve({payload, fields, current_flow});
			}
		} // end saveToCloud
		else {
			t6console.debug("Not customized to save to Cloud");
			resolve({payload, fields, current_flow});
		}
	});
}

function ruleEngine(payload, fields, current_flow) {
	t6console.debug("ruleEngine");
	let publish = typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true;
	return new Promise((resolve, reject) => {
		if ( publish === true ) {
			t6console.debug("Publishing to Rule Engine");
			let flow = payload.flow_id!==null?payload.flow_id:(typeof payload.flow_id!=="undefined"?payload.flow_id:(typeof current_flow!=="undefined"?current_flow.id:""));
			let payloadFact = {"dtepoch": payload.time, "value": JSON.parse(JSON.stringify(payload.value)), "flow": flow, "datatype": payload.datatype, "mqtt_topic": payload.mqtt_topic}; // This is the bare minimal payload
			if ( typeof payload.object_id !== "undefined" ) {
				payloadFact.object_id = payload.object_id;
				let query = {
				"$and": [
						{ "user_id" : payload.user_id },
						{ "id" : payload.object_id },
					]
				};
				var object = objects.findOne(query);
				if ( object ) {
					payloadFact.object = object;
				}
			}
			if ( payload.text ) {
				payloadFact.text = payload.text;
			}
			payloadFact.latitude = typeof payload.latitude!=="undefined"?payload.latitude:null;
			payloadFact.longitude = typeof payload.longitude!=="undefined"?payload.longitude:null;
			t6decisionrules.action(payload.user_id, payloadFact, payload.mqtt_topic);
			resolve({payload, fields, current_flow});
		} else {
			t6console.debug("Not Publishing to Rule Engine");
			resolve({payload, fields, current_flow});
		} // end publish
	});
}

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
 * @apiParam {uuid-v4} [datatype_id="Default value from the Flow resource"] DataType Id
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
	let payloadArray = (Array.isArray(req.body)===false?[req.body]:req.body).slice(0, 3); // only process 3 first measures from payload and ignore the others
	let location;
	payloadArray.map((payload, pIndex) => {
		payload.flow_id = typeof req.params.flow_id!=="undefined"?req.params.flow_id:(typeof req.body.flow_id!=="undefined"?req.body.flow_id:(typeof payload.flow_id!=="undefined"?payload.flow_id:undefined));
		preloadPayload(payload, req.user.id)
			.then((pp) => {
				return signatureCheck(pp.payload, pp.object);
			})
			.then((sc) => {
				return decrypt(sc.payload, sc.object);
			})
			.then((d) => {
				return signatureCheck(d.payload, d.object); // yes do it twice because we can have both signature and encryption
			})
			.then((sc) => {
				return verifyPrerequisites(sc.payload);
			})
			.then((vp) => {
				return preprocessor(vp.payload, {}, vp.current_flow);
			})
			.then((pp) => {
				return fusion(pp.payload, pp.fields, pp.current_flow);
			})
			.then((fu) => {
				return saveToLocal(fu.payload, fu.fields, fu.current_flow);
			})
			.then((sl) => {
				return saveToCloud(sl.payload, sl.fields, sl.current_flow);
			})
			.then((sc) => {
				return ruleEngine(sc.payload, sc.fields, sc.current_flow);
			})
			.then((re) => {
				let fields = re.fields;
				let payload = re.payload;
				fields.flow_id = payload.flow_id;
				fields.id = payload.time*1000000;
				fields.parent = payload.flow_id;
				fields.first;
				fields.prev;
				fields.next;
				fields[0].save = typeof payload.save!=="undefined"?JSON.parse(payload.save):null;
				fields[0].flow_id = payload.flow_id;
				fields[0].datatype = payload.datatype;
				fields[0].title = typeof current_flow!=="undefined"?current_flow.title:null;
				fields[0].ttl = typeof current_flow!=="undefined"?current_flow.ttl:null;
				fields[0].id = payload.time*1000000;
				fields[0].time = payload.time*1000000;
				fields[0].timestamp = payload.time*1000000;
				fields[0].value = payload.value;
				fields[0].publish = payload.publish;
				fields[0].mqtt_topic = payload.mqtt_topic;
				fields[0].preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:null;
				fields[0].fusion = typeof payload.fusion!=="undefined"?payload.fusion:null;
				if(pIndex===0) {
					location = `/v/${version}/flows/${payload.flow_id}/${fields.id}`;
					res.header("Location", location);
					res.status(200).send(new DataSerializer(fields).serialize());
				}
				t6events.add("t6Api", "POST data", payload.user_id, payload.user_id, {flow_id: payload.flow_id});
				
				return;
			})
			.catch((err) => { 
				t6console.error("Error ... well .. on the big chain...", err);
				res.status(412).send({err: err, "id": 999, "code": 412, "message": "Precondition failed"});
			});
	});
});

module.exports = router;
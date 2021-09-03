"use strict";
var express = require("express");
const { Canvas, Image } = require("canvas");
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
	return new Promise((resolve, reject) => {
		if ( typeof payload.object_id !== "undefined" ) {
			t6console.debug("getObjectKey", payload.object_id);
			let query = { "$and": [ { "user_id" : user_id }, { "id" : payload.object_id }, ] };
			var object = objects.findOne(query);
			if ( object && object.secret_key ) {
				t6console.debug("Retrieve key from Object.");
				resolve({payload, object});
			} else {
				t6console.debug("No Secret Key available on Object or Object is not yours.");
				payload.errorMessage.push("No Secret Key available on Object or Object is not yours.");
				reject({payload, object});
			}
		} else {
			t6console.debug("No object_id defined to get Key.");
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
		case "image": 
			fields += "valueImage";
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
function preparePayload(payload, options, callback) {
	t6console.debug("chain 1", "preparePayload");
	payload = getJson(payload);
	let object;
	payload.timestamp	 = (payload.timestamp!=="" && typeof payload.timestamp!=="undefined")?parseInt(payload.timestamp, 10):moment().format("x");
	if ( payload.timestamp.toString().length <= 10 ) { payload.timestamp = moment(time*1000).format("x"); }
	payload.time		 = payload.timestamp;
	payload.errorMessage = options.errorMessage;
	payload.user_id		 = options.user_id;
	payload.flow_id		 = (typeof payload.flow_id!=="undefined" && payload.flow_id!==null)?payload.flow_id:((typeof options.flow_id!=="undefined" && options.flow_id!==null)?options.flow_id:undefined);
	payload.value		 = typeof payload.value!=="undefined"?payload.value:"";
	payload.unit		 = (typeof payload.unit!=="undefined" && payload.unit!==null)?payload.unit:undefined;
	payload.unit_id		 = (typeof payload.unit_id!=="undefined" && payload.unit_id!==null)?payload.unit_id:undefined;
	payload.datatype	 = (typeof payload.datatype!=="undefined" && payload.datatype!==null)?payload.datatype:undefined;
	payload.datatype_id	 = (typeof payload.datatype_id!=="undefined" && payload.datatype_id!==null)?payload.datatype_id:undefined;
	payload.mqtt_topic	 = typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:"";
	payload.latitude	 = typeof payload.latitude!=="undefined"?payload.latitude:"";
	payload.longitude	 = typeof payload.longitude!=="undefined"?payload.longitude:"";
	payload.text		 = typeof payload.text!=="undefined"?payload.text:"";
	payload.save		 = typeof payload.save!=="undefined"?JSON.parse(payload.save):true;
	payload.publish		 = typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true;

	if(payload.object_id) {
		getObjectKey(payload, payload.user_id)
			.then((ok) => {
				payload = ok.payload;
				object = ok.object;
				callback(null, payload, object);
			})
			.catch((error) => { 
				t6console.debug("chain 1", "Error inside preparePayload > getObjectKey", error);
				payload.errorMessage.push("Couldn't get secret key from Object. "+error);
				callback(null, payload, undefined);
			});
	} else {
		callback(null, payload, undefined);
	}
}
function signatureCheck(payload, object, callback) {
	t6console.debug("chain 2&4", "signatureCheck");
	let initialPayload = {
		flow_id: payload.flow_id,
		user_id: payload.user_id,
		unit: payload.unit,
		unit_id: payload.unit_id,
		datatype: payload.datatype,
		datatype_id: payload.datatype_id,
		mqtt_topic: payload.mqtt_topic,
		latitude: payload.latitude,
		longitude: payload.longitude,
		text: payload.text,
		time: payload.time,
		timestamp: payload.timestamp,
		save: typeof payload.save!=="undefined"?JSON.parse(payload.save):true,
		publish: typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true,
	};
	object = typeof object!=="undefined"?object:{};
	object.secret_key = typeof object.secret_key!=="undefined"?object.secret_key:jwtsettings.secret;
	if ( typeof payload!=="undefined" && payload.signedPayload && object.secret_key ) {
		jwt.verify(payload.signedPayload, object.secret_key, function(err, decodedPayload) {
			if ( decodedPayload && !err ) {
				payload = getJson(decodedPayload!==""?decodedPayload:payload);
				payload.flow_id = typeof payload.flow_id!=="undefined"?payload.flow_id:initialPayload.flow_id;
				payload.user_id = typeof payload.user_id!=="undefined"?payload.user_id:initialPayload.user_id;
				payload.unit = typeof payload.unit!=="undefined"?payload.unit:initialPayload.unit;
				payload.unit_id = typeof payload.unit_id!=="undefined"?payload.unit_id:initialPayload.unit_id;
				payload.datatype = typeof payload.datatype!=="undefined"?payload.datatype:initialPayload.datatype;
				payload.datatype_id = payload.datatype_id!=="undefined"?payload.datatype_id:initialPayload.datatype_id;
				payload.mqtt_topic = typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:initialPayload.mqtt_topic;
				payload.latitude = typeof payload.latitude!=="undefined"?payload.latitude:initialPayload.latitude;
				payload.longitude = typeof payload.longitude!=="undefined"?payload.longitude:initialPayload.longitude;
				payload.text = typeof payload.text!=="undefined"?payload.text:initialPayload.text;
				payload.time = typeof payload.time!=="undefined"?payload.time:initialPayload.time;
				payload.timestamp = typeof payload.timestamp!=="undefined"?payload.timestamp:initialPayload.timestamp;
				payload.save = typeof payload.save!=="undefined"?payload.save:initialPayload.save;
				payload.publish = typeof payload.publish!=="undefined"?payload.publish:initialPayload.publish;
				payload.isSigned = true;
				t6console.debug("chain 2&4", "signatureCheck", payload);
				callback(null, payload, object);
			} else {
				t6console.error("chain 2&4", "Error: Can't verify signature.");
				payload.isSigned = false;
				callback(null, payload, object);
			}
		});
	} else {
		t6console.debug("chain 2&4", "Is payload really signed?");
		callback(null ,payload, object);
	}
}
function decrypt(payload, object, callback) {
	t6console.debug("chain 3", "decrypt");
	let initialPayload = {
		flow_id: payload.flow_id,
		user_id: payload.user_id,
		unit: payload.unit,
		unit_id: payload.unit_id,
		datatype: payload.datatype,
		datatype_id: payload.datatype_id,
		mqtt_topic: payload.mqtt_topic,
		latitude: payload.latitude,
		longitude: payload.longitude,
		text: payload.text,
		time: payload.time,
		timestamp: payload.timestamp,
		save: typeof payload.save!=="undefined"?JSON.parse(payload.save):true,
		publish: typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true,
	}
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
			payload.unit_id = typeof payload.unit_id!=="undefined"?payload.unit_id:initialPayload.unit_id;
			payload.datatype = typeof payload.datatype!=="undefined"?payload.datatype:initialPayload.datatype;
			payload.datatype_id = payload.datatype_id!=="undefined"?payload.datatype_id:initialPayload.datatype_id;
			payload.mqtt_topic = typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:initialPayload.mqtt_topic;
			payload.latitude = typeof payload.latitude!=="undefined"?payload.latitude:initialPayload.latitude;
			payload.longitude = typeof payload.longitude!=="undefined"?payload.longitude:initialPayload.longitude;
			payload.text = typeof payload.text!=="undefined"?payload.text:initialPayload.text;
			payload.time = typeof payload.time!=="undefined"?payload.time:initialPayload.time;
			payload.timestamp = typeof payload.timestamp!=="undefined"?payload.timestamp:initialPayload.timestamp;
			payload.save = typeof payload.save!=="undefined"?payload.save:initialPayload.save;
			payload.publish = typeof payload.publish!=="undefined"?payload.publish:initialPayload.publish;
			payload.isEncrypted = true;
			t6console.debug("chain 3", "decryptedPayload", payload);
			callback(null, payload, object);
		} else {
			t6console.error("chain 3", "Object is not available or does not contains any secret key.");
			payload.errorMessage.push("Object is not available or does not contains any secret key.");
			payload.isEncrypted = false;
			callback(null, payload, object);
		}
	} else {
		t6console.debug("chain 3", "Look like the payload is not encrypted.");
		callback(null, payload, object);
	}
}
function verifyPrerequisites(payload, object, callback) {
	t6console.debug("chain 5", "verifyPrerequisites");
	payload.prerequisite = 0;
	if ( !payload.value ) {
		t6console.error("chain 5", "Error: verifyPrerequisites : no value.");
		callback("Error: verifyPrerequisites : no value.", payload, object, null);
	}
	if ( !payload.flow_id || typeof payload.flow_id==="undefined" || payload.flow_id===null ) {
		t6console.error("chain 5", "Error: verifyPrerequisites : no flow_id.");
		callback("Error: verifyPrerequisites : no flow_id.", payload, object, null);
	} else {
		let fDatatypes = flows.chain().find({id: ""+payload.flow_id, user_id: payload.user_id,}).limit(1);
		let fUnits = flows.chain().find({id: ""+payload.flow_id, user_id: payload.user_id,}).limit(1);
		let current_flow = (fDatatypes.data())[0]; // Warning TODO, current_flow can be unset when user posting to fake flow_id, in such case we should take the data_type from payload
		let joinDatatypes, joinUnits;

		if(typeof payload.datatype_id!=="undefined" && payload.datatype_id!=="") { 
			let dt = (datatypes.chain().find({id: ""+payload.datatype_id,}).limit(1)).data()[0];
			payload.datatype = (typeof payload.datatype_id!=="undefined" && typeof dt!=="undefined")?dt.name:"string";
			t6console.debug("chain 5", `Getting datatype "${payload.datatype}" from payload`);
		} else if (typeof current_flow!=="undefined") {
			joinDatatypes = fDatatypes.eqJoin(datatypes.chain(), "data_type", "id"); // TODO : in Flow collection, the data_type should be renamed to datatype_id
			payload.datatype = typeof (joinDatatypes.data())[0]!=="undefined"?(joinDatatypes.data())[0].right.name:"string";
			payload.datatype_id = typeof (joinDatatypes.data())[0]!=="undefined"?(joinDatatypes.data())[0].right.id:undefined;
			t6console.debug("chain 5", `Getting datatype "${payload.datatype}" from Flow`);
		} else {
			payload.datatype = "string";
			t6console.debug("chain 5", `Getting datatype "${payload.datatype}" from default value`);
		}

		if(validator.isBase64(payload.value.toString())===true || payload.datatype==="image") {
			const img = new Image();
			try {
				img.src = new Buffer.from(payload.value, "base64");
				payload.img = img;
				if(payload.save===true) { // it means the image is not stored when the "save" value is overwritten on the preprocessor later :-)
					let imgDir = `${ip.image_dir}/${payload.user_id}`;
					if (!fs.existsSync(imgDir)) { fs.mkdirSync(imgDir); }
					let flowDir = `${ip.image_dir}/${payload.user_id}/${payload.flow_id}`;
					if (!fs.existsSync(flowDir)) { fs.mkdirSync(flowDir); }
					fs.writeFile(`${flowDir}/${payload.timestamp*1e6}.png`, payload.value, "base64", function(err) {
						if(err) {
							t6console.error("chain 5", "Can't save image to storage:'", err);
						} else {
							t6console.debug("chain 5", "Successfully wrote image file to storage.");
						}
					});
				}
				t6console.debug("chain 5", "We have a image (base64) on the payload value.");
			} catch (err) {
				t6console.debug("chain 5", "We don't have an image on the payload value.");
			}
		}
		if ( !payload.mqtt_topic && typeof joinDatatypes!=="undefined" && (joinDatatypes.data())[0] && ((joinDatatypes.data())[0].left) && ((joinDatatypes.data())[0].left).mqtt_topic ) {
			payload.mqtt_topic = ((joinDatatypes.data())[0].left).mqtt_topic;
		}
		if(typeof payload.unit_id!=="undefined" && payload.unit_id!=="") { 
			let u = (units.chain().find({id: ""+payload.unit_id,}).limit(1)).data()[0];
			payload.unit = (typeof payload.unit_id!=="undefined" && typeof u!=="undefined")?u.name:"No unit";
			t6console.debug("chain 5", `Getting unit "${payload.unit}" from payload`);
		} else if (typeof current_flow!=="undefined") {
			joinUnits = fUnits.eqJoin(units.chain(), "unit", "id"); // TODO : in Flow collection, the unit should be renamed to unit_id
			payload.unit = typeof (joinUnits.data())[0]!=="undefined"?(joinUnits.data())[0].right.name:"No unit";
			payload.unit_id = typeof (joinUnits.data())[0]!=="undefined"?(joinUnits.data())[0].right.id:undefined;
			t6console.debug("chain 5", `Getting unit "${payload.unit}" from Flow`);
		} else {
			payload.unit = "No unit";
			t6console.debug("chain 5", `Getting unit "${payload.unit}" from default value`);
		}

		if ( typeof current_flow!=="undefined" && current_flow.left && current_flow.left.require_encrypted && !isEncrypted ) {
			t6console.debug("chain 5", "Flow require isEncrypted -", current_flow.left.require_encrypted);
			t6console.debug("chain 5", ".. & Payload isEncrypted", isEncrypted);
			payload.prerequisite += 1;
		}

		if ( typeof current_flow!=="undefined" && current_flow.left && current_flow.left.require_signed && !isSigned ) {
			t6console.debug("chain 5", "Flow require isSigned -", current_flow.left.require_signed);
			t6console.debug("chain 5", ".. & Payload isSigned", isSigned);
			payload.prerequisite += 1;
		}

		t6console.debug("chain 5", "Prerequisite Index=", payload.prerequisite, payload.prerequisite>0?"Something is required.":"All good.");
		if (payload.prerequisite <= 0) {
			callback(null, payload, object, current_flow);
		} else {
			payload.errorMessage.push("Payload is requiring either signature and/or encryption. "+error);
			callback("Payload is requiring either signature and/or encryption.", payload, object, null);
		}
	}
}
function preprocessor(payload, fields, current_flow, callback) {
	t6console.debug("chain 6", "preprocessor");
	if(!payload || current_flow===null) {
		callback(null, payload, fields, current_flow);
	}
	let preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:((typeof current_flow!=="undefined"&&typeof current_flow.preprocessor!=="undefined"&&current_flow.preprocessor!=="")?JSON.parse(JSON.stringify(current_flow.preprocessor)):[]);
	preprocessor = Array.isArray(preprocessor)===false?[preprocessor]:preprocessor;
	t6console.debug("chain 6", "Will force sanitization to:", payload.datatype);
	preprocessor.push({"name": "sanitize", "datatype": payload.datatype});
	t6preprocessor.preprocessor(current_flow, payload, preprocessor).then((result) => {
		t6console.debug("chain 6", "Preprocessor got the result value :-)", result);
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
			t6console.debug("chain 6", "Preprocessor rejected value.");
		} else {
			t6console.debug("chain 6", "Preprocessor accepted value.");
		}
		callback(null, payload, fields, current_flow);
	});
}
function fusion(payload, fields, current_flow, callback) {
	t6console.debug("chain 7", "fusion", payload);
	if(!payload || current_flow===null) {
		callback(null, payload, fields, current_flow);
	}
	if ( dataFusion.activated === true ) {
		payload.fusion = typeof payload.fusion!=="undefined"?payload.fusion:{};
		payload.fusion.messages = [];
		t6console.debug("chain 7", "Fusion is enabled on t6", payload.fusion);
		let track_id = typeof payload.track_id!=="undefined"?payload.track_id:((typeof current_flow!=="undefined" && typeof current_flow.track_id!=="undefined")?current_flow.track_id:null);
		let fusion_algorithm = typeof payload.fusion.algorithm!=="undefined"?payload.fusion.algorithm:((typeof current_flow!=="undefined" && typeof current_flow.fusion_algorithm!=="undefined")?current_flow.fusion_algorithm:null);
		let requireDataType = typeof payload.data_type!=="undefined"?payload.data_type:(typeof current_flow!=="undefined"?current_flow.data_type:undefined); // By default, making sure all trracks are having the same datatype
		t6console.debug("chain 7", "Using fusion algorithm", fusion_algorithm);
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
			t6console.debug("chain 7", "Fusion is elligible.");
			payload.fusion.messages.push("Fusion is elligible.");
			// Compute average for each tracks
			let allTracksAfterAverage = t6preprocessor.reduceMeasure(allTracks);
			t6console.debug("chain 7", "allTracksAfterAverage", allTracksAfterAverage);
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
			
			// TODO : Do we need to save measure to Primary Flow ? so instead of the track.. :-(
			payload.fusion.primary_flow = track_id;
			payload.time = fusionTime; // Code consistency !
			payload.timestamp = fusionTime/1e6;
			t6console.debug("chain 7", "fusionTime", moment(fusionTime).format(logDateFormat));
			payload.flow_id = track_id;
			callback(null, payload, fields, current_flow);
		} else {
			payload.fusion.messages.push("Fusion not processed; missing measurements on some tracks ; or incompatible datatypes ; or no track on Flow/payload.");
			payload.fusion.error_tracks = errorTracks;
			callback(null, payload, fields, current_flow);
		}
		// Clean expired buffer
		let size = t6preprocessor.clearExpiredMeasurement();
		size>0?payload.fusion.messages.push(`${size} expired measurements - cleaned from buffer.`):null;
	} else {
		callback(null, payload, fields, current_flow);
	}
}
function ruleEngine(payload, fields, current_flow, callback) {
	t6console.debug("chain 8", "ruleEngine", payload);
	let publish = typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true; // TODO : to be cleaned
	if ( publish === true ) {														 // TODO : to be cleaned
		t6console.debug("chain 8", "Publishing to Rule Engine");
		let flow = payload.flow_id!==null?payload.flow_id:(typeof payload.flow_id!=="undefined"?payload.flow_id:(typeof current_flow!=="undefined"?current_flow.id:""));
		let payloadFact = {"dtepoch": payload.time, "value": JSON.parse(JSON.stringify(payload.value)), "flow": flow, "unit": (typeof payload.unit!=="undefined"?payload.unit:""), "datatype": payload.datatype, "mqtt_topic": payload.mqtt_topic}; // This is the bare minimal payload
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
		callback(null, payload, fields, current_flow);
	} else {
		t6console.debug("chain 8", "Not Publishing to Rule Engine");
		callback(null, payload, fields, current_flow);
	} // end publish
}
function saveToLocal(payload, fields, current_flow, callback) {
	t6console.debug("chain 9", "saveToLocal", payload);
	let save = typeof payload.save!=="undefined"?JSON.parse(payload.save):true;
	if(!payload || current_flow===null) {
		callback(null, payload, fields, current_flow);
	}
	if ( save === true ) {
		let rp = typeof influxSettings.retentionPolicies.data!=="undefined"?influxSettings.retentionPolicies.data:"autogen";
		if ( db_type.influxdb === true ) {
			t6console.debug("chain 9", "Saving to influxdb timeseries");
			/* InfluxDB database */
			var tags = {};
			payload.timestamp = payload.time*1e6;
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
			let v = getFieldsFromDatatype(payload.datatype, false, false);
			(fields[0])[v] = payload.value;
			let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
			dbWrite.writePoints([{
				measurement: "data",
				tags: tags,
				fields: fields[0],
				timestamp: payload.timestamp,
			}], { retentionPolicy: rp }).then((err) => {
				if (err) {
					t6console.error({"message": "Error on writePoints to influxDb", "err": err, "tags": tags, "fields": fields[0], "timestamp": payload.timestamp});
					callback(null, payload, fields, current_flow);
				} else {
					callback(null, payload, fields, current_flow);
				}
			}).catch((err) => {
				t6console.error("chain 9", {"message": "Error catched on writting to influxDb - in data.js", "err": err, "tags": tags, "fields": fields[0], "timestamp": payload.timestamp});
				callback(null, payload, fields, current_flow);
			});
		} else {
			t6console.debug("chain 9", "Missconfiguration on saving to influxdb timeseries");
			callback(null, payload, fields, current_flow);
		}
	} else {
		t6console.debug("chain 9", "Save is Disabled on payload.");
		callback(null, payload, fields, current_flow);
	} // end save
}
function saveToCloud(payload, fields, current_flow, callback) {
	t6console.debug("chain 10", "saveToCloud", payload);
	if(!payload || current_flow===null) {
		callback(null, payload, fields, current_flow);
	}
	if ((typeof current_flow!=="undefined" && typeof current_flow.influx_db_cloud!=="undefined") || typeof payload.influx_db_cloud!=="undefined") {
		const {InfluxDB} = require("@influxdata/influxdb-client");
		let token = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.token!=="undefined")?payload.influx_db_cloud.token:current_flow.influx_db_cloud.token;
		let org = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.org!=="undefined")?payload.influx_db_cloud.org:current_flow.influx_db_cloud.org;
		let url = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.url!=="undefined")?payload.influx_db_cloud.url:current_flow.influx_db_cloud.url;
		let bucket = (typeof payload.influx_db_cloud!=="undefined" && typeof payload.influx_db_cloud.bucket!=="undefined")?payload.influx_db_cloud.bucket:current_flow.influx_db_cloud.bucket;
		
		if(token && org && url && bucket) {
			t6console.debug("chain 10", "influxDbCloud Saving to Cloud.");
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
			typeof fields[0].valueImage!=="undefined"?point.stringField("valueImage", fields[0].valueImage):null;
			typeof fields[0].text!=="undefined"?point.stringField("text", fields[0].text):null;
			writeApi.writePoint(point);
			writeApi
				.close()
				.then(() => {
					t6console.debug("chain 10", "Wrote to influxDbCloud");
					//t6console.log("chain 10", point);
					t6events.add("t6App", "Wrote to influxDbCloud", payload.user_id, payload.user_id, {"user_id": payload.user_id});
					callback(null, {payload, fields, current_flow});
				})
				.catch((e) => {
					t6console.error("chain 10", "Write Error on influxDbCloud");
					t6console.error("chain 10", "Error:", e);
					t6events.add("t6App", "Write Error on influxDbCloud", payload.user_id, payload.user_id, {"user_id": payload.user_id, "error": e});
					callback(e, {payload, fields, current_flow});
				});
		} // end valid token
		else {
			t6console.warn("chain 10", "Can't save to Cloud ; missing credentials.");
			callback(null, {payload, fields, current_flow});
		}
	} // end saveToCloud
	else {
		t6console.debug("chain 10", "Not customized to save to Cloud");
		callback(null, {payload, fields, current_flow});
	}
}
async function processAllMeasures(payloads, options, res) {
	await new Promise((resolve, reject) => {
		t6console.debug("processAllMeasures in a chain");
		let result = [];
		payloads.map(async function(p) {
			t6console.debug("--------", "chaining the measure", result.length+1, "--------");
			async.waterfall([
				async.apply(preparePayload, p, options), //(outputPayload, options),
				signatureCheck, //(pp.payload, pp.object),
				decrypt, //(sc1.payload, sc1.object),
				signatureCheck, //(dy.payload, dy.object),
				verifyPrerequisites, //(sc2.payload, sc2.object),
				preprocessor, //(vp.payload, {}, vp.current_flow),
				fusion, //(ppor.payload, ppor.fields, ppor.current_flow),
				ruleEngine, //(fu.payload, fu.fields, fu.current_flow),
				saveToLocal, //(re.payload, re.fields, re.current_flow),
				saveToCloud, //(s2l.payload, s2l.fields, s2l.current_flow),
			], function (err, s2c) {
				if( s2c && !err ) {
					t6console.debug("chain ending", "---------------------------------------------");
					let measure = s2c.fields;
					let payload = s2c.payload;
					let current_flow = s2c.current_flow;
					if (payload.datatype==="image" || typeof payload.img!=="undefined") {
						if (payload.save===false) {
							fs.readdir(`${ip.image_dir}/`, (files)=>{
								if(files!==null) {
									for (let i=0, len=files.length; i<len;i++) {
										let match = files[i].match(/`${payload.timestamp}.*.png`/);
										if(match !== null) {
											fs.unlink(match[0], (err) => {
												if (err) {
													t6console.error(err);
												} else {
													t6console.debug("Successfully removed image file from storage as 'save' is disabled.");
												}
											});
										}
									}
								}
							});
						}
					}
					measure.parent = payload.flow_id;
					measure.self = payload.flow_id;
					measure.save = typeof payload.save!=="undefined"?JSON.parse(payload.save):null;
					measure.publish = typeof payload.publish!=="undefined"?JSON.parse(payload.publish):null;
					measure.flow_id = payload.flow_id;
					measure.datatype = payload.datatype;
					measure.datatype_id = payload.datatype_id;
					measure.unit = payload.unit;
					measure.unit_id = payload.unit_id;
					measure.id = payload.time*1e6;
					measure.time = payload.time*1e6;
					measure.timestamp = payload.time*1e6;
					measure.value = payload.value;
					measure.mqtt_topic = payload.mqtt_topic;
					measure.title = (typeof current_flow!=="undefined" && current_flow!==null)?current_flow.title:undefined;
					measure.ttl = (typeof current_flow!=="undefined" && current_flow!==null)?current_flow.ttl:undefined;
					measure.preprocessor = (typeof current_flow!=="undefined" && current_flow!==null)?payload.preprocessor:undefined;
					measure.fusion = typeof payload.fusion!=="undefined"?payload.fusion:undefined;
					measure.location = `/v${version}/flows/${payload.flow_id}/${measure.id}`;

					t6events.add("t6Api", "POST data", payload.user_id, payload.user_id, {flow_id: payload.flow_id});
					result.push(measure);
					if(result.length === payloads.length) {
						let response = result;
						res.header("Location", response[0].location); // hum ...
						response.parent = response[0].parent; // hum ...
						response.flow_id = response[0].flow_id; // hum ...
						response.datatype= response[0].datatype; // hum ...
						response.datatype_id= response[0].datatype_id; // hum ...
						response.unit = response[0].unit; // hum ...
						response.unit_id = response[0].unit_id; // hum ...
						response.title = response[0].title; // hum ...
						response.ttl = response[0].ttl; // hum ...
						response.pageSelf = 1;
						response.pageFirst = 1;
						response.limit = 20;
						response.sort = "asc";
						t6console.debug(`Finished processing all ${payload.length} measurements`);
						res.status(200).send(new DataSerializer(response).serialize());
					}
				} else {
					t6console.debug("chain ending with error", "---------------------------------------------");
					t6console.debug(err);
				}
			});
			//return result;
		});
	});
}

/**
 * @api {get} /data/:flow_id/:data_id? Get DataPoints
 * @apiName Get DataPoints
 * @apiGroup 0. DataPoint Measure
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

		dbInfluxDB.query(query).then((data) => {
			if ( data.length > 0 ) {
				data.map(function(d) {
					d.id = sprintf("%s/%s", flow_id, moment(d.time).format("x")*1000);
					d.timestamp = Date.parse(d.time);
					d.time = Date.parse(d.time);
				});
				data.title = ((join.data())[0].left)!==null?((join.data())[0].left).name:"";
				//data.datatype = payload.datatype;
				//data.datatype_id = payload.datatype_id;
				data.unit = ((join.data())[0].right)!==null?((join.data())[0].right).format:""; // TODO : not consistent with POST
				data.unit_format = ((join.data())[0].right)!==null?((join.data())[0].right).format:""; // TODO : not consistent with POST
				data.unit_id = ((join.data())[0].right)!==null?((join.data())[0].right).id:"";
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
		}).catch((err) => {
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
 * @apiGroup 0. DataPoint Measure
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} [flow_id] Flow ID you want to add Data Point to. This parameter is optional as it can be defined in the payload itself
 * @apiBody {uuid-v4} flow_id Flow ID you want to add Data Point to
 * @apiBody {String} value Data Point value
 * @apiBody {Boolean} [publish=true] Flag to publish to Mqtt Topic ; This parameter might become deprecated.
 * @apiBody {Boolean} [save=false] Flag to store in database the Value
 * @apiBody {String} [unit=undefined] Unit of the Value
 * @apiBody {String} [mqtt_topic="Default value from the Flow resource"] Mqtt Topic to publish value
 * @apiBody {uuid-v4} [datatype_id="Default value from the Flow resource"] DataType Id
 * @apiBody {String} [text=undefined] Optional text to qualify Value
 * @apiBody {uuid-v4} [object_id=undefined] Optional object_id uuid used for Signed payload; for decrypt and encrypting in the Mqtt; The object_id must be own by the user in JWT.
 * @apiBody {String} [latitude="39.800327"] Optional String to identify where does the datapoint is coming from. (This is only used for rule specific operator)
 * @apiBody {String} [longitude="6.343530"] Optional String to identify where does the datapoint is coming from. (This is only used for rule specific operator)
 * @apiBody {String} [signedPayload=undefined] Optional Signed payload containing datapoint resource
 * @apiBody {String} [encryptedPayload=undefined] Optional Encrypted payload containing datapoint resource
 * @apiBody {Object} [influx_db_cloud] influx_db_cloud object to define what bucket should be used to save data on the cloud
 * @apiBody {String} influx_db_cloud.token Authentication token ID
 * @apiBody {String} influx_db_cloud.org Organization ID
 * @apiBody {String} influx_db_cloud.url HTTP address of InfluxDB
 * @apiBody {String} influx_db_cloud.bucket Bucket name
 * 
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
	t6console.debug(`Called POST datapoints with ${payloadArray.length} measurement(s)`);

	let options = {};
	options.errorMessage = req.body.length>3?["Maximum payload reach. Some payload will be ignored"]:[];
	options.user_id		 = typeof req.user.id!=="undefined"?req.user.id:null;
	options.flow_id = typeof req.params.flow_id!=="undefined"?req.params.flow_id:(typeof req.body.flow_id!=="undefined"?req.body.flow_id:(typeof payload!=="undefined" && typeof payload.flow_id!=="undefined"?payload.flow_id:undefined));

	processAllMeasures(payloadArray, options, res).then( (payload) => {
		t6console.debug("processAllMeasures Completed");
	}).catch((err) => {
		t6console.error("Error on processAllMeasures: ", err);
		t6console.debug("Precondition failed");
		res.status(412).send({err: err, "id": 999, "code": 412, "message": "Precondition failed"});
	});
});

module.exports = router;
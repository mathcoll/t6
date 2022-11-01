"use strict";
var express = require("express");
const { Canvas, Image } = require("canvas");
var router = express.Router();
var DataSerializer = require("../serializers/data");
var ErrorSerializer = require("../serializers/error");
let encoding = "utf8";

function getObjectKey(payload, user_id) {
	return new Promise((resolve, reject) => {
		payload.errorMessage = typeof payload.errorMessage!=="undefined"?payload.errorMessage:[];
		if ( typeof payload.object_id !== "undefined" ) {
			t6console.debug("getObjectKey object_id:", payload.object_id);
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
let preparePayload = function(resolve, reject) {
	let payload = this.payload;
	let chainOrder = this.chainOrder;
	let options = this.options;
	t6console.debug("chain 1", "preparePayload");
	payload = getJson(payload);
	let object;
	payload.timestamp	 = (payload.timestamp!=="" && typeof payload.timestamp!=="undefined")?parseInt(payload.timestamp, 10):moment().format("x");
	if ( payload.timestamp.toString().length <= 10 ) { payload.timestamp = moment(payload.timestamp*1000).format("x"); }
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
	payload.retention	 = typeof payload.retention!=="undefined"?payload.retention:undefined;

	if(payload.object_id) {
		getObjectKey(payload, payload.user_id)
			.then((ok) => {
				payload = ok.payload;
				object = ok.object;
				payload.datapoint_logs = {preparePayload : true};
				chainOrder.push("preparePayload");
				resolve({payload, object, chainOrder});
			})
			.catch((error) => { 
				t6console.debug("chain 1", "Error inside preparePayload > getObjectKey", error);
				payload.errorMessage.push("Couldn't get secret key from Object. "+error);
				payload.datapoint_logs = {preparePayload : "err"};
				chainOrder.push("preparePayload");
				resolve({payload, chainOrder});
			});
	} else {
		payload.datapoint_logs = {preparePayload : false};
		chainOrder.push("preparePayload");
		resolve({payload, chainOrder});
	}
}
let signatureCheck = function(resolve, reject) {
	let payload = this.payload;
	let object = this.object;
	let chainOrder = this.chainOrder;
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
		publish: typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true,
		retention: payload.retention,
		save: typeof payload.save!=="undefined"?JSON.parse(payload.save):true,
		text: payload.text,
		time: payload.time,
		timestamp: payload.timestamp,
		datapoint_logs: typeof payload.datapoint_logs!=="undefined"?payload.datapoint_logs:{},
	};
	object = typeof object!=="undefined"?object:{};
	object.secret_key = typeof object.secret_key!=="undefined"?object.secret_key:jwtsettings.secret;
	if ( typeof payload!=="undefined" && payload.signedPayload && object.secret_key ) {
		jsonwebtoken.verify(payload.signedPayload, object.secret_key, function(err, decodedPayload) {
			payload.datapoint_logs = initialPayload.datapoint_logs;
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
				payload.retention = typeof payload.retention!=="undefined"?payload.retention:initialPayload.retention;
				payload.isSigned = true;
				t6console.debug("chain 2&4", "signatureCheck", payload);
				payload.datapoint_logs = initialPayload.datapoint_logs;
				payload.datapoint_logs.signatureCheck = true;
				chainOrder.push("signatureCheck");
				resolve({payload, object, chainOrder});
			} else {
				t6console.error("chain 2&4", "Error: Can't verify signature.");
				payload.isSigned = false;
				payload.datapoint_logs.signatureCheck = "err";
				chainOrder.push("signatureCheck");
				resolve({payload, object, chainOrder});
			}
		});
	} else {
		t6console.debug("chain 2&4", "Is payload really signed?");
		payload.datapoint_logs.signatureCheck = false;
		chainOrder.push("signatureCheck");
		resolve({payload, object, chainOrder});
	}
}
let decrypt = function(resolve, reject) {
	let payload = this.payload;
	let object = this.object;
	let chainOrder = this.chainOrder;
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
		publish: typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true,
		retention: payload.retention,
		save: typeof payload.save!=="undefined"?JSON.parse(payload.save):true,
		text: payload.text,
		time: payload.time,
		timestamp: payload.timestamp,
		datapoint_logs: typeof payload.datapoint_logs!=="undefined"?payload.datapoint_logs:{},
	};
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
			payload.retention = typeof payload.retention!=="undefined"?payload.retention:initialPayload.retention;
			payload.isEncrypted = true;
			t6console.debug("chain 3", "decryptedPayload", payload);
			payload.datapoint_logs = initialPayload.datapoint_logs;
			payload.datapoint_logs.decrypt = true;
			chainOrder.push("decrypt");
			resolve({payload, object, chainOrder});
		} else {
			t6console.error("chain 3", "Object is not available or does not contains any secret key.");
			payload.errorMessage.push("Object is not available or does not contains any secret key.");
			payload.isEncrypted = false;
			payload.datapoint_logs.decrypt = "err";
			chainOrder.push("decrypt");
			resolve({payload, object, chainOrder});
		}
	} else {
		t6console.debug("chain 3", "Look like the payload is not encrypted.");
		payload.datapoint_logs = initialPayload.datapoint_logs;
		payload.datapoint_logs.decrypt = false;
		chainOrder.push("decrypt");
		resolve({payload, object, chainOrder});
	}
}
let verifyPrerequisites = function(resolve, reject) {
	let payload = this.payload;
	let object = this.object;
	let chainOrder = this.chainOrder;
	t6console.debug("chain 5", "verifyPrerequisites");
	payload.prerequisite = 0;
	if ( !payload.value ) {
		t6console.error("chain 5", "Error: verifyPrerequisites : no value.");
		payload.datapoint_logs.verifyPrerequisites = "err";
		chainOrder.push("verifyPrerequisites");
		//resolve("Error: verifyPrerequisites : no value.", payload, object, null, chainOrder);
		reject({payload, object, chainOrder});
	}
	if ( !payload.flow_id || typeof payload.flow_id==="undefined" || payload.flow_id===null ) {
		t6console.error("chain 5", "Error: verifyPrerequisites : no flow_id.");
		payload.datapoint_logs.verifyPrerequisites = "err";
		chainOrder.push("verifyPrerequisites");
		//resolve("Error: verifyPrerequisites : no flow_id.", payload, object, null, chainOrder);
		reject({payload, object, chainOrder});
	} else {
		payload.datapoint_logs.verifyPrerequisites = true;
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

		let imT = imageType(new Buffer.from(payload.value.toString(), "base64"));
		if((validator.isBase64(payload.value.toString())===true && imT!==null && imT.mime.includes("image")) || payload.datatype==="image") {
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

		if ( typeof current_flow!=="undefined" && current_flow.require_encrypted && !payload.isEncrypted ) {
			payload.prerequisite += 1;
			payload.errorMessage.push("chain 5", "==> Flow require encrypted payload.");
			t6console.debug("chain 5", "Flow require isEncrypted -", current_flow.require_encrypted);
			t6console.debug("chain 5", ".. & Payload isEncrypted", payload.isEncrypted);
			//resolve("Error: verifyPrerequisites :", payload, object, null);
		}

		if ( typeof current_flow!=="undefined" && current_flow.require_signed && !payload.isSigned ) {
			payload.prerequisite += 1;
			payload.errorMessage.push("chain 5", "==> Flow require signed payload.");
			t6console.debug("chain 5", "Flow require isSigned -", current_flow.require_signed);
			t6console.debug("chain 5", ".. & Payload isSigned", payload.isSigned);
			//resolve("Error: verifyPrerequisites :", payload, object, null);
		}

		if( typeof payload.retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(payload.retention)===-1 ) {
			if ( typeof current_flow!=="undefined" && current_flow.retention ) {
				if ( (influxSettings.retentionPolicies.data).indexOf(current_flow.retention)>-1 ) {
					payload.retention = current_flow.retention;
				} else {
					payload.retention = influxSettings.retentionPolicies.data[0];
				}
			} else {
				payload.retention = influxSettings.retentionPolicies.data[0];
			}
		}
		t6console.debug("chain 5", "Retention", payload.retention);
		t6console.debug("chain 5", "current_flow", current_flow);
		t6console.debug("chain 5", "Prerequisite Index=", payload.prerequisite, payload.prerequisite>0?"Something is required.":"All good.");
		if (payload.prerequisite <= 0) {
			payload.datapoint_logs.verifyPrerequisites = true;
			chainOrder.push("verifyPrerequisites");
			resolve({payload, object, current_flow, chainOrder});
		} else {
			payload.errorMessage.push("Payload is requiring either signature and/or encryption.");
			payload.datapoint_logs.verifyPrerequisites = true;
			chainOrder.push("verifyPrerequisites");
			reject({});
		}
	}
}

let preprocessor = async function(resolve, reject) {
	let payload = this.payload;
	let chainOrder = this.chainOrder;
	let current_flow = this.current_flow;
	t6console.debug("chain 6", "preprocessor");
	if(!payload || current_flow===null) {
		payload.datapoint_logs.preprocessor = "err";
		chainOrder.push("preprocessor");
		resolve({payload, fields, current_flow, chainOrder});
	}
	let preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:((typeof current_flow!=="undefined"&&typeof current_flow.preprocessor!=="undefined"&&current_flow.preprocessor!=="")?JSON.parse(JSON.stringify(current_flow.preprocessor)):[]);
	preprocessor = Array.isArray(preprocessor)===false?[preprocessor]:preprocessor;
	t6console.debug("chain 6", "Will force sanitization to:", payload.datatype);
	preprocessor.push({"name": "sanitize", "datatype": payload.datatype});

	let preprocessorsMap = preprocessor.map( async (pp, index) => {
		return new Promise((resolve, reject) => {
			t6console.debug("chain 6", "preprocessorsPromises mapping", index);
			//t6console.debug("chain 6", "preprocessorsPromises pp", pp);
			//t6console.debug("chain 6", "preprocessorsPromises payload.value.length", payload.value.length);
			t6preprocessor.preprocessor(current_flow, payload, pp).then( async (t6pp) => {
				//t6console.debug("chain 6", "preprocessorsPromises t6pp", t6pp);
				resolve( {payload: t6pp.payload, fields: t6pp.fields, preprocessor: t6pp.preprocessor} );
			});
		});
	});
	await Promise.all(preprocessorsMap).then((prom) => {
		//t6console.debug("chain 6", "preprocessorsPromises ----payload----", payload);
		//t6console.debug("chain 6", "preprocessorsPromises ----fields----", fields);
		//t6console.debug("chain 6", "preprocessorsPromises ----preprocessor----", preprocessor);
		//t6console.debug("chain 6", "preprocessorsPromises ----prom----", prom);
		//t6console.debug("chain 6", "preprocessorsPromises shift", prom.shift().payload);
		//t6console.debug("chain 6", "preprocessorsPromises pop", prom.pop().payload);
		let pop = prom.pop();
		let shift = prom.shift();
		let fields = pop.fields;
		payload = typeof shift!=="undefined"?shift.payload:pop.payload;
		t6console.debug("chain 6", "Preprocessor got all promises :-)");
		//t6console.debug("chain 6", "fields", fields);

		if( typeof payload.preprocessor!=="undefined" && typeof payload.preprocessor.recognizedValue!=="undefined" && payload.preprocessor.recognizedValue!==null ) {
			payload.value = payload.preprocessor.recognizedValue;
			t6console.debug("chain 6", "recognizedValue is set, using its value");
		} else {
			if( typeof payload.sanitizedValue!=="undefined" && payload.sanitizedValue!==null ) {
				payload.value = payload.sanitizedValue;
				t6console.debug("chain 6", "sanitizedValue is set, using its value");
			}
		}
		if(payload.isAidcValue===true && payload.recognizedValue) {
			payload.value = typeof payload.recognizedValue!=="undefined"?payload.recognizedValue:payload.value;
			t6console.debug("chain 6", "AidcValue>recognizedValue is set, using its value");
		} else {
			t6console.debug("chain 6", "FAILURE, AidcValue/recognizedValue have not been received");
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
		payload.datapoint_logs.preprocessor = true;
		chainOrder.push("preprocessor");
		t6console.debug("chain 6", "Preprocessor going to callback function.", payload.value);
		resolve({payload, fields, current_flow, chainOrder});
	});
}
let fusion = function(resolve, reject) {
	let payload = this.payload;
	let chainOrder = this.chainOrder;
	let fields = this.fields;
	let current_flow = this.current_flow;
	t6console.debug("chain 7", "fusion");
	if(!payload || current_flow===null) {
		payload.datapoint_logs.fusion = "err";
		chainOrder.push("fusion");
		reject({payload, fields, current_flow, chainOrder});
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
			"sanitizedValue": payload.value,
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
			payload.datapoint_logs.fusion = true;
			chainOrder.push("fusion");
			resolve({payload, fields, current_flow, chainOrder});
		} else {
			payload.fusion.messages.push("Fusion not processed; missing measurements on some tracks ; or incompatible datatypes ; or no track on Flow/payload.");
			payload.fusion.error_tracks = errorTracks;
			payload.datapoint_logs.fusion = false;
			chainOrder.push("fusion");
			resolve({payload, fields, current_flow, chainOrder});
		}
		// Clean expired buffer
		let size = t6preprocessor.clearExpiredMeasurement();
		size>0?payload.fusion.messages.push(`${size} expired measurements - cleaned from buffer.`):null;
	} else {
		payload.datapoint_logs.fusion = false;
		chainOrder.push("fusion");
		resolve({payload, fields, current_flow, chainOrder});
	}
}
let ruleEngine = function(resolve, reject) {
	let payload = this.payload;
	let chainOrder = this.chainOrder;
	let fields = this.fields;
	let current_flow = this.current_flow;
	t6console.debug("chain 8", "ruleEngine");
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
		payload.datapoint_logs.ruleEngine = true;
		chainOrder.push("ruleEngine");
		resolve({payload, fields, current_flow, chainOrder});
	} else {
		t6console.debug("chain 8", "Not Publishing to Rule Engine");
		payload.datapoint_logs.ruleEngine = false;
		chainOrder.push("ruleEngine");
		resolve({payload, fields, current_flow, chainOrder});
	} // end publish
}
let saveToLocal = function(resolve, reject) {
	let payload = this.payload;
	let chainOrder = this.chainOrder;
	let fields = this.fields;
	let current_flow = this.current_flow;
	t6console.debug("chain 9", "saveToLocal");
	let save = typeof payload.save!=="undefined"?JSON.parse(payload.save):true;
	if(!payload || current_flow===null) {
		payload.datapoint_logs.saveToLocal = "err";
		chainOrder.push("saveToLocal");
		resolve({payload, fields, current_flow, chainOrder});
	}
	if ( save === true ) {
		let rp = typeof influxSettings.retentionPolicies.data[0]!=="undefined"?influxSettings.retentionPolicies.data[0]:"autogen";
		if(typeof payload.retention!=="undefined") {
			rp = payload.retention;
		}
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
					payload.datapoint_logs.saveToLocal = "err";
					chainOrder.push("saveToLocal");
					resolve({payload, fields, current_flow, chainOrder});
				} else {
					payload.datapoint_logs.saveToLocal = true;
					chainOrder.push("saveToLocal");
					resolve({payload, fields, current_flow, chainOrder});
				}
			}).catch((err) => {
				t6console.error("chain 9", {"message": "Error catched on writting to influxDb - in data.js", "err": err, "tags": tags, "fields": fields[0], "timestamp": payload.timestamp});
				payload.datapoint_logs.saveToLocal = "err";
				chainOrder.push("saveToLocal");
				resolve({payload, fields, current_flow, chainOrder});
			});
		} else {
			t6console.debug("chain 9", "Missconfiguration on saving to influxdb timeseries");
			payload.datapoint_logs.saveToLocal = false;
			chainOrder.push("saveToLocal");
			resolve({payload, fields, current_flow, chainOrder});
		}
	} else {
		t6console.debug("chain 9", "Save is Disabled on payload.");
		payload.datapoint_logs.saveToLocal = false;
		chainOrder.push("saveToLocal");
		resolve({payload, fields, current_flow, chainOrder});
	} // end save
}
let saveToCloud = function(resolve, reject) {
	let payload = this.payload;
	let chainOrder = this.chainOrder;
	let fields = this.fields;
	let current_flow = this.current_flow;
	t6console.debug("chain 10", "saveToCloud");
	if(!payload || current_flow===null) {
		payload.datapoint_logs.saveToCloud = "err";
		chainOrder.push("saveToCloud");
		resolve({payload, fields, current_flow, chainOrder});
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
					t6events.addStat("t6App", "Wrote to influxDbCloud", payload.user_id, payload.user_id, {"user_id": payload.user_id});
					payload.datapoint_logs.saveToCloud = true;
					chainOrder.push("saveToCloud");
					resolve({payload, fields, current_flow, chainOrder});
				})
				.catch((e) => {
					t6console.error("chain 10", "Write Error on influxDbCloud");
					t6console.error("chain 10", "Error:", e);
					t6events.addStat("t6App", "Write Error on influxDbCloud", payload.user_id, payload.user_id, {"user_id": payload.user_id, "error": e});
					payload.datapoint_logs.saveToCloud = "err";
					chainOrder.push("saveToCloud");
					resolve({payload, fields, current_flow, chainOrder});
				});
		} // end valid token
		else {
			t6console.debug("chain 10", "Can't save to Cloud ; missing credentials.");
			payload.datapoint_logs.saveToCloud = false;
			chainOrder.push("saveToCloud");
			resolve({payload, fields, current_flow, chainOrder});
		}
	} // end saveToCloud
	else {
		t6console.debug("chain 10", "Not customized to save to Cloud");
		payload.datapoint_logs.saveToCloud = false;
		chainOrder.push("saveToCloud");
		resolve({payload, fields, current_flow, chainOrder});
	}
};
async function processAllMeasures(payloads, options) {
	//return new Promise((resolve, reject) => {
		t6console.debug("processAllMeasures in a chain");
		t6console.debug("--------", "total of", payloads.length, "measures.");

		let ret = await Promise.all(
			payloads.map(async (current_payload, index) => {
				let chainOrder = [];
				t6console.debug("--------", "chaining measure index", index);
				return await new Promise(preparePayload.bind({payload: current_payload, options, chainOrder})).then((result) => {
					return new Promise(signatureCheck.bind({payload: result.payload, object: result.object, chainOrder: result.chainOrder}));
				}).then((result) => {
					return new Promise(decrypt.bind({payload: result.payload, object: result.object, chainOrder: result.chainOrder}));
				}).then((result) => {
					return new Promise(signatureCheck.bind({payload: result.payload, object: result.object, chainOrder: result.chainOrder}));
				}).then((result) => {
					return new Promise(verifyPrerequisites.bind({payload: result.payload, object: result.object, chainOrder: result.chainOrder}));
				}).then((result) => {
					return new Promise(preprocessor.bind({payload: result.payload, current_flow: result.current_flow, chainOrder: result.chainOrder}));
				}).then((result) => {
					return new Promise(fusion.bind({payload: result.payload, fields: result.fields, current_flow: result.current_flow, chainOrder: result.chainOrder}));
				}).then((result) => {
					return new Promise(ruleEngine.bind({payload: result.payload, fields: result.fields, current_flow: result.current_flow, chainOrder: result.chainOrder}));
				}).then((result) => {
					return new Promise(saveToLocal.bind({payload: result.payload, fields: result.fields, current_flow: result.current_flow, chainOrder: result.chainOrder}));
				}).then((result) => {
					return new Promise(saveToCloud.bind({payload: result.payload, fields: result.fields, current_flow: result.current_flow, chainOrder: result.chainOrder}));
				}).then((chainResult) => {
					if( chainResult ) {
						//let r = [];
						let payload			= chainResult.payload;
						let current_flow	= chainResult.current_flow;
						chainOrder.map((chain, index) => {
							t6console.debug("chain end", index, chain, payload.datapoint_logs[chain], payload.value.length);
						});
						t6console.debug("chain end", "---------------------------------------------");
						if (payload.datatype==="image" || typeof payload.img!=="undefined") {
							if (payload.save===false) {
								fs.readdir(`${ip.image_dir}/`, (files) => {
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
						};
						t6events.addStat("t6Api", "POST data", payload.user_id, payload.user_id, {flow_id: payload.flow_id});
						t6console.debug("payloads size ---> ", payloads.length);
						payload.save = typeof payload.save!=="undefined"?JSON.parse(payload.save):null;
						payload.publish = typeof payload.publish!=="undefined"?JSON.parse(payload.publish):null;
						payload.flow_id = payload.flow_id;
						payload.datatype = payload.datatype;
						payload.datatype_id = payload.datatype_id;
						payload.unit = payload.unit;
						payload.unit_id = payload.unit_id;
						payload.id = payload.time*1; //*1e6;
						payload.time = payload.time*1; //*1e6;
						payload.timestamp = payload.time*1; //*1e6;
						return (payload);
					} else {
						t6console.debug("chain ending with error", "---------------------------------------------");
						t6console.debug(err);
						return ("Precondition failed");
					}
				});
			})
		);
		return ret;
	//});
}


/**
 * @api {get} /data/? Get all DataPoints
 * @apiName Get all DataPoints
 * @apiDescription List all latest datapoints stored in the server. This endpoint give ability to see the recent datapoints history and to identify expired (ttl) datapoints.
 * @apiGroup 0. DataPoint Measure
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {String} [sort=desc] Set to sorting order, the value can be either "asc" or ascending or "desc" for descending.
 * @apiParam {Number} [page] Page offset
 * @apiParam {String} [retention] Retention Policy to get data from
 * @apiUse 200
 * @apiUse 429
 */
router.get("/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var retention = typeof req.query.retention!=="undefined"?req.query.retention:req.body.retention;
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
	//fields = getFieldsFromDatatype(datatype, false);
	let fields = "valueFloat as value, flow_id";
	let query = sprintf("SELECT %s FROM %s.data WHERE user_id='%s' ORDER BY time %s LIMIT %s OFFSET %s", fields, rp, req.user.id, sorting, limit, (page-1)*limit);
	t6console.debug("Query:", query);

	dbInfluxDB.query(query).then((data) => {
		if ( data.length > 0 ) {
			data.map(function(d) {
				let flow = flows.chain().find({ "id" : { "$aeq" : d.flow_id } }).limit(1);
				let join = flow.eqJoin(units.chain(), "unit", "id");
			
				let flowDT = flows.chain().find({id: d.flow_id,}).limit(1);
				let joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
				let datatype = typeof (joinDT.data())[0]!=="undefined"?(joinDT.data())[0].right.name:null;
				let query = {
					"$and": [
						{ "user_id" : req.user.id, },
						{ "flow_id" : d.flow_id, },
						{ "from_ts" : {"$gte": moment(d.time).format("x")*1000}, },
						{ "to_ts" : {"$lte": moment(d.time).format("x")*1000}, },
					],
				};
				let a = annotations.findOne(query);
				t6console.debug("Looking for a category:", moment(d.time).format("x")*1000, "find a=", a);
				d.retention = rp;
				d.timestamp = Date.parse(d.time);
				d.time = Date.parse(d.time);
				d.id = sprintf("%s/%s", d.flow_id, moment(d.time).format("x")*1000);
				d.category_id = (a!==null && typeof a.category_id!=="undefined")?a.category_id:undefined;
			});
			data.title = "*";
			data.unit = "*";
			data.unit_format = "*";
			data.unit_id = "*";
			data.mqtt_topic = "*";
			data.ttl = "*";
			data.flow_id = "*";
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
			t6console.debug(query);
			res.status(404).send(new ErrorSerializer({err: "No data found", "id": 2058, "code": 404, "message": "Not found"}).serialize());
		}
	}).catch((err) => {
		t6console.error("id=2059", err);
		res.status(500).send(new ErrorSerializer({err: err, "id": 2059, "code": 500, "message": "Internal Error"}).serialize());
	});
});

/**
 * @api {get} /data/:flow_id/:data_id? Get DataPoints
 * @apiName Get DataPoints
 * @apiGroup 0. DataPoint Measure
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} data_id DataPoint Id
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
 * @apiParam {String} [xAxis] Label value in X axis
 * @apiParam {String} [yAxis] Label value in Y axis
 * @apiParam {Integer} [width] output width of SVG chart
 * @apiParam {Integer} [height] output height of SVG chart
 * @apiParam {String} [retention] Retention Policy to get data from, if undefined or invalid, the retention from the flow will be used
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
 * @apiUse 412
 * @apiUse 429
 */
router.get("/:flow_id([0-9a-z\-]+)/?(:data_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var flow_id = req.params.flow_id;
	var data_id = req.params.data_id;
	var modifier = req.query.modifier;
	var retention = typeof req.query.retention!=="undefined"?req.query.retention:req.body.retention;
	var query;
	var start;
	var end;
	
	if ( !flow_id ) {
		res.status(405).send(new ErrorSerializer({"id": 2056, "code": 405, "message": "Method Not Allowed"}).serialize());
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
		flow = typeof (flow.data())[0]!=="undefined"?(flow.data())[0].left:undefined;

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
		query = sprintf("SELECT %s FROM %s.data WHERE flow_id='%s' %s %s ORDER BY time %s LIMIT %s OFFSET %s", fields, rp, flow_id, where, group_by, sorting, limit, (page-1)*limit);
		t6console.debug("Query:", query);

		dbInfluxDB.query(query).then((data) => {
			if ( data.length > 0 ) {
				data.map(function(d) {
					let query = {
						"$and": [
							{ "user_id" : req.user.id, },
							{ "flow_id" : flow_id, },
							{ "from_ts" : {"$gte": moment(d.time).format("x")*1000}, },
							{ "to_ts" : {"$lte": moment(d.time).format("x")*1000}, },
						],
					};
					let a = annotations.findOne(query);
					t6console.debug("Looking for a category:", moment(d.time).format("x")*1000, "find a=", a);
					d.retention = rp;
					d.timestamp = Date.parse(d.time);
					d.time = moment(d.time).format("x")*1000;
					d.id = sprintf("%s/%s", flow_id, moment(d.time).format("x")*1000);
					d.category_id = (a!==null && typeof a.category_id!=="undefined")?a.category_id:undefined;
				});
				data.title = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].left)!==null )?((join.data())[0].left).name:"";
				data.unit = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].right)!==null )?((join.data())[0].right).format:""; // TODO : not consistent with POST
				data.unit_format = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].right)!==null )?((join.data())[0].right).format:""; // TODO : not consistent with POST
				data.unit_id = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].right)!==null )?((join.data())[0].right).id:"";
				data.mqtt_topic = ( typeof (join.data())[0]!=="undefined" && ((join.data())[0].left)!==null )?((join.data())[0].left).mqtt_topic:"";
				data.ttl = (typeof (join.data())[0]!=="undefined" && ((join.data())[0].left).ttl!==null && ((join.data())[0].left).ttl!=="")?((join.data())[0].left).ttl:3600;
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
				t6console.debug(query);
				res.status(404).send(new ErrorSerializer({err: "No data found", "id": 2058, "code": 404, "message": "Not found"}).serialize());
			}
		}).catch((err) => {
			t6console.error("id=2059", err);
			res.status(500).send(new ErrorSerializer({err: err, "id": 2059, "code": 500, "message": "Internal Error"}).serialize());
		});
	}
});

let slicePayloads = function(payloadArray, options) {
	if( payloadArray.length > options.datapointPayloadLimit ) {
		payloadArray = payloadArray.slice(0, options.datapointPayloadLimit);
		t6console.debug(`Sliced to ${options.datapointPayloadLimit} measurement(s), having ${payloadArray.length} now`);
	} else {
		t6console.debug(`Keeping all ${payloadArray.length} measurement(s)`);
	}
	return (payloadArray);
}

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
 * @apiBody {String} [retention] Retention Policy to store data to
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
 */
router.post("/(:flow_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms, getToken: function getToken(req) {
	if ( req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer" ) {
		return req.headers.authorization.split(" ")[1];
	} else if( req.headers["x-api-key"] && req.headers["x-api-secret"] ) {
		let queryT = {
		"$and": [
					{ "key": req.headers["x-api-key"] },
					{ "secret": req.headers["x-api-secret"] },
				]
		};
		let u = access_tokens.findOne(queryT);
		if ( u && typeof u.user_id !== "undefined" ) {
			let user = users.findOne({id: u.user_id});
			let payload = JSON.parse(JSON.stringify(user));
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.token_type = "Bearer";
			payload.scope = "ClientApi";
			payload.sub = "/users/"+user.id;
			req.user = payload;
			return jsonwebtoken.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
		}
		// TODO : Rate limit is not checked here ! 
		//res.header("X-RateLimit-Limit", limit);
		//res.header("X-RateLimit-Remaining", limit-i);
	}
	return null;
} }), function (req, res, next) {
	let payloadArray = (Array.isArray(req.body)===false?[req.body]:req.body);
	let options = {errorMessage: []};
	options.user_id = typeof req.user.id!=="undefined"?req.user.id:null;
	options.flow_id = typeof req.params.flow_id!=="undefined"?req.params.flow_id:(typeof req.body.flow_id!=="undefined"?req.body.flow_id:(typeof payload!=="undefined" && typeof payload.flow_id!=="undefined"?payload.flow_id:undefined));
	options.datapointPayloadLimit = (quota[req.user.role]).datapointPayloadLimit;
	t6console.debug(`Called POST datapoints with ${payloadArray.length} measurement(s)`);

	payloadArray = slicePayloads(payloadArray, options);
	processAllMeasures(payloadArray, options).then( (payload) => {
		res.header("Location", `/v${version}/flows/${payload[0].flow_id}/${payload[0].id}`); // hum ...
		payload.parent		= payload[0].flow_id; // hum ...
		payload.flow_id		= payload[0].flow_id; // hum ...
		payload.datatype	= payload[0].datatype; // hum ...
		payload.datatype_id	= payload[0].datatype_id; // hum ...
		payload.unit		= payload[0].unit; // hum ...
		payload.unit_id		= payload[0].unit_id; // hum ...
		payload.title		= payload[0].title; // hum ...
		payload.ttl			= payload[0].ttl; // hum ...
		payload.pageSelf	= 1;
		payload.pageFirst	= 1;
		payload.limit		= 20;
		payload.sort		= "asc";
		res.status(200).send(new DataSerializer(payload).serialize());
		t6console.debug(`processAllMeasures Completed with ${payload.length} measurement(s)`);
	}).catch((err) => {
		t6console.error("Error on processAllMeasures: ", err);
		res.status(412).send(new ErrorSerializer({err: err, "id": 2060, "code": 412, "message": "Precondition failed"}).serialize());
	});
});

module.exports = router;
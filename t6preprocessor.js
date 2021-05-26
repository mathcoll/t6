"use strict";
var t6preprocessor = module.exports = {};

t6preprocessor.export = function() {
	console.dir(JSON.stringify());
};

t6preprocessor.str2bool = function(v) {
	return ["yes", "true", "t", "1", "y", "yeah", "on", "yup", "certainly", "uh-huh"].indexOf(v)>-1?true:false;
}

t6preprocessor.cryptValue = function(value, sender, encoding) {
	if ( sender && sender.secret_key_crypt ) {
		let iv = crypto.randomBytes(16);
		// sender.secret_key_crypt must be 256 bytes (32 characters)
		let cipher = crypto.createCipheriv(algorithm, Buffer.from(sender.secret_key_crypt, "hex"), iv);
		let encrypted = cipher.update(value);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return iv.toString("hex") + ":" + encrypted.toString("hex");
	} else {
		t6console.error("Error: Missing secret_key_crypt");
		return "Error: Missing secret_key_crypt";
	}
}

t6preprocessor.preprocessor = function(flow, payload, listPreprocessor) {
	let fields = [];
	let errorMode=false;
	listPreprocessor.map(function(pp) {
		pp.initialValue = payload.value;
		switch(pp.name) {
			case "validate": // Reject non-valid value
				switch(pp.test) {
					case "isEmail":
						payload.save = validator.isEmail(payload.value.toString())===false?false:payload.save;
						pp.message = payload.save===false?"Value is rejected":undefined;
						break;
					case "isAscii":
						payload.save = validator.isAscii(payload.value.toString())===false?false:payload.save;
						pp.message = payload.save===false?"Value is rejected":undefined;
						break;
					case "isBase32":
						payload.save = validator.isBase32(payload.value.toString())===false?false:payload.save;
						pp.message = payload.save===false?"Value is rejected":undefined;
						break;
					case "isBase58":
						payload.save = validator.isBase58(payload.value.toString())===false?false:payload.save;
						pp.message = payload.save===false?"Value is rejected":undefined;
						break;
					case "isBase64":
						payload.save = validator.isBase64(payload.value.toString())===false?false:payload.save;
						pp.message = payload.save===false?"Value is rejected":undefined;
						break;
					case "isBIC":
						payload.save = validator.isBIC(payload.value.toString())===false?false:payload.save;
						pp.message = payload.save===false?"Value is rejected":undefined;
						break;
					case "isBoolean":
						payload.save = validator.isBoolean(payload.value.toString())===false?false:payload.save;
						pp.message = payload.save===false?"Value is rejected":undefined;
						break;
				}
				break;

			case "sanitize": // Sanitize value
				let time= (payload.timestamp!=="" && typeof payload.timestamp!=="undefined")?parseInt(payload.timestamp, 10):moment().format("x");
				if ( time.toString().length <= 10 ) { time = moment(time*1000).format("x"); }
				if (pp.datatype) {
					switch(pp.datatype) {
						case "boolean":
							//payload.value = validator.toBoolean(payload.value, false);
							payload.value = t6preprocessor.str2bool(payload.value.toString());
							fields[0] = {time:""+time, valueBoolean: payload.value,};
							break;
						case "date":
							payload.value = validator.toDate(payload.value);
							fields[0] = {time:""+time, valueDate: payload.value,};
							break;
						case "float":
							//payload.value = validator.toFloat(payload.value); // https://github.com/validatorjs/validator.js/issues/1663
							payload.value = parseFloat(payload.value);
							fields[0] = {time:""+time, valueFloat: payload.value,};
							break;
						case "geo":
							payload.value = ""+payload.value;
							fields[0] = {time:""+time, valueGeo: payload.value,};
							break;
						case "integer":
							payload.value = validator.toInt(payload.value, 10);
							fields[0] = {time:""+time, valueInteger: payload.value+"i",};
							break;
						case "json":
							payload.value = {value:payload.value,};
							fields[0] = {time:""+time, valueJson: payload.value,};
							break;
						case "string":
							payload.value = ""+payload.value;
							fields[0] = {time:""+time, valueString: payload.value,};
							break;
						case "time":
							payload.value = payload.value ;
							fields[0] = {time:""+time, valueTime: payload.value,};
							break;
						default:
							payload.value = ""+payload.value;
							fields[0] = {time:""+time, valueString: payload.value,};
							break;
					}
					pp.message = `Converted to ${pp.datatype}.`;
				} else {
					fields[0] = {time:""+time, valueString: payload.value,};
					pp.message = `Not datatype to convert to. Default to String.`;
				}
			
				break;

			case "convert": // Convert value unit converter
				if (customUnits.db!=="") {
					units.importDBSync(customUnits.db);
				}
				//t6console.log(units.types);
				if (pp.from && pp.to) {
					switch(pp.type) {
						case "time":
						case "distance":
						case "mass":
						case "volume":
						case "storage":
						case "things":
						case "temperature":
							payload.value = units.convert(`${payload.value} ${pp.from} to ${pp.to}`);
							pp.message = `Converted ${pp.type} from ${pp.from} to ${pp.to}.`;
							break;
						default: 
							pp.message = `Convert type "${pp.type}" is not recognized.`;
							break;
					}
					pp.transformedValue = payload.value;
				} else {
					pp.message = "Not unit to convert from/to.";
				}
				break;

			case "transform": // Transform value
				switch(pp.mode) {
					case "aes-256-cbc": // aes-256-cbc encryption
						if(typeof payload.object_id!=="undefined") {
							let objects	= db.getCollection("objects");
							let object = objects.findOne({ "$and": [ { "user_id": { "$eq": payload.user_id } }, { "id": { "$eq": payload.object_id } }, ]});
							if ( object && typeof object.secret_key_crypt!=="undefined" && object.secret_key_crypt.length>0 ) { // TODO: Should also get the Flow.requireCrypted flag.
								payload.value = t6preprocessor.cryptValue(""+payload.value, {secret_key_crypt: object.secret_key_crypt});
								pp.message = `Encrypted using Object "${p.object_id}"`;
							} else {
								pp.message = "Warning: No secret_key found on Object, can't encrypt w/o secret_key from the Object.";
							}
						} else {
							pp.message = "Warning: No Object found on payload, can't encrypt w/o secret_key from the Object.";
						}
						break;
					case "camelCase":
						payload.value = changeCase.camelCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "capitalCase":
						payload.value = changeCase.capitalCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "upperCase":
						payload.value = payload.value.toUpperCase();
						break;
					case "constantCase":
						payload.value = changeCase.constantCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "dotCase":
						payload.value = changeCase.dotCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "headerCase":
						payload.value = changeCase.headerCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "noCase":
						payload.value = changeCase.noCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "paramCase":
						payload.value = changeCase.paramCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "pascalCase":
						payload.value = changeCase.pascalCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "pathCase":
						payload.value = changeCase.pathCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "sentenceCase":
						payload.value = changeCase.sentenceCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					case "snakeCase":
						payload.value = changeCase.snakeCase(payload.value.toString(), {stripRegexp: /[^A-Z0-9@]/gi});
						break;
					default:
						errorMode=1;
						break;
				}
				pp.transformedValue = payload.value;
				pp.message = errorMode===1?`Could'd find mode ${pp.mode}.`:`Transformed to ${pp.mode}.`;
				break;

			default:
				pp.message = flow!=="undefined"?"No Preprocessor found.":"No Preprocessor and no Flow.";
				break;
		}
		pp.status = "completed";
	});
	return {payload, fields, preprocessor: listPreprocessor};
};

t6preprocessor.fuse = function(flow, payload) {
	if(typeof flow==="undefined") {
		payload.fuse = {
			initialValue: payload.value,
			status: "abandonned",
			message: ["Error: undefined Flow"]
		};
		return payload;
	}
	/*
		see doc A Review of Data Fusion Techniques.pdf
		fusion.classification: complementary
			when the information provided by
			the input sources represents different parts of the
			scene and could thus be used to obtain more complete
			global information. For example, in the case of visual
			sensor networks, the information on the same target
			provided by two cameras with different fields of view
			is considered complementary;
			
		fusion.classification: redundant
			when two or more input sources provide
			information about the same target and could thus be
			fused to increment the confidence. For example, the
			data coming from overlapped areas in visual sensor
			networks are considered redundant;
			
		fusion.classification: cooperative
			when the provided information is combined into new
			information that is typically more complex than the
			original information. For example, multi-modal (audio
			and video) data fusion is considered cooperative.
	*/
	payload.fuse = {initialValue: payload.value};
	let track_id = typeof payload.track_id!=="undefined"?payload.track_id:((typeof flow!=="undefined" && typeof flow.track_id!=="undefined")?flow.track_id:null);
	if(track_id!==null && track_id!=="" && typeof flow!=="undefined") {
		// look for all tracks
		let flows = db.getCollection("flows");
		let tracks = flows.chain().find({track_id: track_id, user_id: flow.user_id,}).data();
		t6console.log("time", parseInt(payload.time, 10));
		t6console.log("TTL", parseInt(typeof flow.ttl!=="undefined"?flow.ttl:3600, 10));
		t6console.log("Should be executed at", moment((parseInt(payload.time, 10)/1000+parseInt(typeof flow.ttl!=="undefined"?flow.ttl:3600, 10))*1000).format(logDateFormat));
		// {"taskType": "fuse", "flow_id": flow.flow_id, "time": payload.time, "value": payload.value, "track_id": track_id, "user_id": flow.user_id,}
		t6queue.add({"taskType": "fuse", "flow_id": flow.flow_id, "time": parseInt(payload.time, 10), "ttl": parseInt(typeof flow.ttl!=="undefined"?flow.ttl:3600000, 10), "track_id": track_id, "user_id": flow.user_id,});
		/*
		let retention = typeof influxSettings.retentionPolicies.data!=="undefined"?influxSettings.retentionPolicies.data:"autogen";
		let query = `SELECT time, time::field as tf, valueFloat, flow_id FROM ${retention}.data WHERE track_id='${track_id}' ORDER BY time desc LIMIT 50 OFFSET 0`; // Hardcoded
		t6console.debug(`Query for Fusion: ${query}`);
		dbInfluxDB.query(query).then(data => {
			if ( data.length > 0 ) {
				data.map(function(d) {
					d.aggregate = moment(Date.parse(d.time)).hour(); // Hardcoded
					d.time = Date.parse(d.time);
					if(d.flow_id==flow.id) { // Hardcoded
						d.weigth = 2;
					} else {
						d.weigth = 1;
					}
					t6console.debug(`${d.time}: ${d.valueFloat} --> w${d.weigth} (${d.flow_id})`); // Hardcoded
				});
			}
		}).catch(err => {
			t6console.error(`Error getting values to fuse : ${err}`);
		});
		*/
		payload.fuse.message = [];
		if ( tracks.length > -1 ) {
			tracks.map(function(track) {
				t6console.log("track", track);
				//t6console.log(payload);
				payload.fuse.message.push(`Used ${track.id} as Track`);
			});
			payload.fuse.status = "completed";
		}
		//t6queue.start();
	}
	return payload;
};

module.exports = t6preprocessor;
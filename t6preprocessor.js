"use strict";
var t6preprocessor = module.exports = {};
var fBuff;

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
							//payload.sanitizedValue = validator.toBoolean(payload.value, false);
							payload.sanitizedValue = t6preprocessor.str2bool(payload.value.toString());
							fields[0] = {time:""+time, valueBoolean: payload.sanitizedValue,};
							break;
						case "date":
							payload.sanitizedValue = validator.toDate(payload.value);
							fields[0] = {time:""+time, valueDate: payload.sanitizedValue,};
							break;
						case "float":
							//payload.sanitizedValue = validator.toFloat(payload.value); // https://github.com/validatorjs/validator.js/issues/1663
							payload.sanitizedValue = parseFloat(payload.value);
							fields[0] = {time:""+time, valueFloat: payload.sanitizedValue,};
							break;
						case "geo":
							payload.sanitizedValue = ""+payload.value;
							fields[0] = {time:""+time, valueGeo: payload.sanitizedValue,};
							break;
						case "integer":
							payload.sanitizedValue = validator.toInt(payload.value, 10);
							fields[0] = {time:""+time, valueInteger: payload.sanitizedValue+"i",};
							break;
						case "json":
							payload.sanitizedValue = {value:payload.value,};
							fields[0] = {time:""+time, valueJson: payload.sanitizedValue,};
							break;
						case "string":
							payload.sanitizedValue = ""+payload.value;
							fields[0] = {time:""+time, valueString: payload.sanitizedValue,};
							break;
						case "time":
							payload.sanitizedValue = payload.value ;
							fields[0] = {time:""+time, valueTime: payload.sanitizedValue,};
							break;
						default:
							payload.sanitizedValue = ""+payload.value;
							fields[0] = {time:""+time, valueString: payload.sanitizedValue,};
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
				pp.message = typeof flow!=="undefined"?"No Preprocessor found.":"No Preprocessor and no Flow.";
				break;
		}
		pp.status = "completed";
	});
	return {payload, fields, preprocessor: listPreprocessor};
};

t6preprocessor.addMeasurementToFusion = function(measurement) {
	if(typeof measurement==="undefined" || measurement===null || measurement==="") {
		return false;
	} else {
		fBuff = dbFusionBuffer.getCollection("measures");
		let newMeasure = {
			"expiration": parseInt(measurement.time+measurement.ttl, 10),
			"time": measurement.time, 
			"flow_id": measurement.flow_id, 
			"track_id": measurement.track_id, 
			"sanitizedValue": measurement.sanitizedValue, 
			"user_id": measurement.user_id
		}
		fBuff.insert(newMeasure);
		return true;
	}
};

t6preprocessor.getMeasuresFromBuffer = function(id) {
	fBuff = dbFusionBuffer.getCollection("measures");
	let measures = fBuff.find( { "$and": [{ "expiration" : { "$gte": moment().format("x") } }, { "expiration" : { "$ne": "" } }, { "flow_id": id} ]} );
	t6console.debug(`Track: ${id} is ${measures.length} length and is fusing to Flow`);
	return (typeof measures!=="undefined" && measures!==null)?measures:[];
};

t6preprocessor.isElligibleToFusion = function(tracks) {
	let invalidCount=0;
	tracks.map(function(track) {
		if((track.measurements).length <= 0) {
			t6console.debug(`Track ${track.id} is empty, track is not elligible to fusion.`);
			invalidCount++;
		} else {
			t6console.debug(`Track ${track.id} is ${(track.measurements).length} length, track is elligible to fusion.`);
		}
	});
	return invalidCount>0?false:true;
};

t6preprocessor.reduceMeasure = function(tracks) {
	tracks.map(function(track) {
		track.average = (track.measurements).reduce(function (acc, measure) {
			return acc + measure.sanitizedValue;
		}, 0) / (track.measurements).length;
		track.count = (track.measurements).length;
	});
	// TODO : we should also compute the average time within the measures
	return tracks;
}

t6preprocessor.getAllTracks = function(flow_id, track_id, user_id) {
	let allTracks = [];
	if(track_id===null || track_id==="") {
		return allTracks;
	} else {
		let flows = db.getCollection("flows");
		let tracks = flows.chain().find({track_id: track_id, user_id: user_id,}).data();
		if ( tracks.length > -1 ) {
			tracks.map(function(track) {
				//track.id is the flow_id
				allTracks.push({id: track.id, measurements: t6preprocessor.getMeasuresFromBuffer(track.id)});
			});
			t6console.debug("getAllTracks:", allTracks.length);
			return allTracks;
		} else {
			return allTracks;
		}
	}
};

t6preprocessor.clearExpiredMeasurement = function() {
	fBuff = dbFusionBuffer.getCollection("measures");
	let expired = fBuff.find( { "$and": [{ "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } } ]} );
	let size = 0;
	if ( expired ) {
		size = expired.length;
		fBuff.remove(expired);
		dbFusionBuffer.save();
	}
	return size;
};

t6preprocessor.fuse = function(job) {
	let payload = {};
	/*
		TODO :
		Should first check if the execTime is valid
		Should then check if taskType === "fuse"
	*/
	if(typeof job.track_id==="undefined" || job.track_id===null || job.track_id==="") {
		payload = {
			status: "abandonned",
			messages: ["Error: undefined track_id"]
		};
		return payload;
	} else if(typeof job.user_id==="undefined" || job.user_id===null || job.user_id==="") {
		payload = {
			status: "abandonned",
			messages: ["Error: undefined user_id"]
		};
		return payload;
	} else {
		// look for all tracks
		let flows = db.getCollection("flows");
		let tracks = flows.chain().find({track_id: job.track_id, user_id: job.user_id,}).data();
		if ( tracks.length > -1 ) {
			let start = job.execTime-job.ttl;
			let end = job.execTime;
			payload = {
				status: "completed",
				flow_id: job.track_id,
				fromDate: moment(start).format(logDateFormat),
				toDate: moment(end).format(logDateFormat),
				messages: [],
				tracks: [],
			}
			/*
				TODO :
				Get values from influx between the range date ; and from all the tracks --> where track_id = job.track_id
				Use merge-nearest-time-series in a recursive way, on all tracks
				So that all data from all tracks are merged together
				Compute the "merge": according to algos
				Inject datapoints to influx on job.track_id
				Purge job from the list
			*/
			tracks.map(function(track) {
				payload.tracks.push(track.id);
				payload.messages.push(`Track ${track.id}: injected into Flow ${job.track_id}`);
			});
		} else {
			payload = {
				status: "abandonned",
				messages: ["Error: coundn't find any track'"]
			};
			return payload;
		}
	}
	return payload;
};

module.exports = t6preprocessor;
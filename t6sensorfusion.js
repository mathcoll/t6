"use strict";
var t6sensorfusion = module.exports = {};

t6sensorfusion.export = function() {
	console.dir(JSON.stringify());
};

t6sensorfusion.str2bool = function(v) {
	return ["yes", "true", "t", "1", "y", "yeah", "on", "yup", "certainly", "uh-huh"].indexOf(v)>-1?true:false;
}

t6sensorfusion.cryptValue = function(value, sender, encoding) {
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

t6sensorfusion.preprocessor = function(flow, payload, listPreprocessor) {
	let fields = [];
	let i=0;
	listPreprocessor.map(function(pp) {
		pp.initialValue = payload.value;
		switch(pp.name) {
			case "validate": // Reject non-valid value
				switch(pp.test) {
					case "isEmail":
						payload.save = validator.isEmail(payload.value.toString())===false?false:payload.save;
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
							payload.value = t6sensorfusion.str2bool(payload.value.toString());
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
							fields[0] = {time:""+time, valueString: payload.value,};
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
			case "transform": // Transform value
				let errorMode=false;
				switch(pp.mode) {
					case "aes-256-cbc": // aes-256-cbc encryption
						if(typeof payload.object_id!=="undefined") {
							let objects	= db.getCollection("objects");
							let object = objects.findOne({ "$and": [ { "user_id": { "$eq": payload.user_id } }, { "id": { "$eq": payload.object_id } }, ]});
							if ( object && typeof object.secret_key_crypt!=="undefined" && object.secret_key_crypt.length>0 ) { // TODO: Should also get the Flow.requireCrypted flag.
								payload.value = t6sensorfusion.cryptValue(""+payload.value, {secret_key_crypt: object.secret_key_crypt});
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
		i++;
	});
	return {payload, fields, preprocessor: listPreprocessor};
};

t6sensorfusion.fuse = function(flow, payload) {
	payload.fuse = typeof payload.fuse!="undefined"?payload.fuse:{};
	if(typeof flow!=="undefined" && typeof flow.track_id!=="undefined") {
		// look for all tracks
		let flows = db.getCollection("flows");
		let tracks = flows.chain().find({track_id: flow.track_id, user_id: flow.user_id,}).data();
		if ( tracks.length > -1 ) {
			tracks.map(function(track) {
				t6console.log(track);
				t6console.log(payload);
			});
		}
	}
	payload.fuse.status = "completed";
	return payload;
};

module.exports = t6sensorfusion;
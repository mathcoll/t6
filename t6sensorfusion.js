"use strict";
var t6sensorfusion = module.exports = {};

t6sensorfusion.export = function() {
	console.dir(JSON.stringify());
};


t6sensorfusion.cryptValue = function(value, sender, encoding) {
	if ( sender && sender.secret_key_crypt ) {
		let iv = crypto.randomBytes(16);
		// sender.secret_key_crypt must be 256 bytes (32 characters)
		let cipher = crypto.createCipheriv(algorithm, Buffer.from(sender.secret_key_crypt, "hex"), iv);
		let encrypted = cipher.update(value);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return iv.toString("hex") + ":" + encrypted.toString("hex");
	} else {
		t6console.debug("payload", "Error: Missing secret_key_crypt");
		return "Error: Missing secret_key_crypt";
	}
}

t6sensorfusion.preprocessor = function(flow, payload) {
	let preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:(typeof flow.preprocessor!=="undefined"?flow.preprocessor:{});
	preprocessor = Array.isArray(preprocessor)===false?[preprocessor]:preprocessor;
	payload.preprocessor = typeof payload.preprocessor!="undefined"?payload.preprocessor:[];
	let i=0;
	preprocessor.map(function(pp) {
		pp.initialValue = payload.value;
		switch(pp.name) {
			case "validation": // Reject non-valid value
				switch(pp.test) {
					case "isEmail":
						payload.save = validator.isEmail(payload.value.toString())===false?false:payload.save;
						pp.message = payload.save===false?"Value is rejected":undefined;
						break;
				}
				break;
			case "transform": // Transform value
				switch(pp.mode) {
					case "aes-256-cbc": // aes-256-cbc encryption
						if(typeof payload.object_id!=="undefined") {
							let objects	= db.getCollection("objects");
							let object = objects.findOne({ "$and": [ { "user_id": { "$eq": payload.user_id } }, { "id": { "$eq": payload.object_id } }, ]});
							if ( object && typeof object.secret_key_crypt!=="undefined" && object.secret_key_crypt.length>0 ) { // TODO: Should also get the Flow.requireCrypted flag.
								payload.value = t6sensorfusion.cryptValue(""+payload.value, {secret_key_crypt: object.secret_key_crypt});
								pp.message = `Encrypted using Object "${payload.object_id}"`;
							} else {
								pp.message = "Warning: No secret_key found on Object, can't encrypt w/o secret_key from the Object.";
							}
						} else {
							pp.message = "Warning: No Object found on payload, can't encrypt w/o secret_key from the Object.";
						}
						break;
					case "camelCase":
						payload.value = changeCase.camelCase(payload.value.toString());
						break;
					case "capitalCase":
						payload.value = changeCase.capitalCase(payload.value.toString());
						break;
					case "upperCase":
						payload.value = payload.value.toUpperCase();
						break;
					case "constantCase":
						payload.value = changeCase.constantCase(payload.value.toString());
						break;
					case "dotCase":
						payload.value = changeCase.dotCase(payload.value.toString());
						break;
					case "headerCase":
						payload.value = changeCase.headerCase(payload.value.toString());
						break;
					case "noCase":
						payload.value = changeCase.noCase(payload.value.toString());
						break;
					case "paramCase":
						payload.value = changeCase.paramCase(payload.value.toString());
						break;
					case "pascalCase":
						payload.value = changeCase.pascalCase(payload.value.toString());
						break;
					case "pathCase":
						payload.value = changeCase.pathCase(payload.value.toString());
						break;
					case "sentenceCase":
						payload.value = changeCase.sentenceCase(payload.value.toString());
						break;
					case "snakeCase":
						payload.value = changeCase.snakeCase(payload.value.toString());
						break;
				}
				pp.transformedValue = payload.value;
				break;
			default:
				pp.message = flow!=="undefined"?"No Preprocessor found.":"No Preprocessor and no Flow.";
				break;
		}
		pp.status = "completed";
		i++;
	});
	
	return payload;
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
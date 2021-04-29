"use strict";
var t6sensorfusion = module.exports = {};

t6sensorfusion.export = function() {
	console.dir(JSON.stringify());
};

t6sensorfusion.preprocessor = function(flow, payload) {
	let preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:(typeof flow.preprocessor!=="undefined"?flow.preprocessor:{});
	payload.preprocessor = typeof payload.preprocessor!="undefined"?payload.preprocessor:{};
	payload.preprocessor.initialValue = payload.value;
	//if(typeof flow!=="undefined" && typeof flow.preprocessor!=="undefined") {
		// payload.preprocessor can be an Array
		switch(preprocessor.type) {
			case "change-case": // Convert strings between camelCase, PascalCase, Capital Case, snake_case and more
				switch(preprocessor.transform) {
					case "camelCase":
						payload.value = changeCase.camelCase(payload.value.toString());
						break;
					case "capitalCase":
						payload.value = changeCase.capitalCase(payload.value);
						break;
					case "constantCase":
						payload.value = changeCase.constantCase(payload.value);
						break;
					case "dotCase":
						payload.value = changeCase.dotCase(payload.value);
						break;
					case "headerCase":
						payload.value = changeCase.headerCase(payload.value);
						break;
					case "noCase":
						payload.value = changeCase.noCase(payload.value);
						break;
					case "paramCase":
						payload.value = changeCase.paramCase(payload.value);
						break;
					case "pascalCase":
						payload.value = changeCase.pascalCase(payload.value);
						break;
					case "pathCase":
						payload.value = changeCase.pathCase(payload.value);
						break;
					case "sentenceCase":
						payload.value = changeCase.sentenceCase(payload.value);
						break;
					case "snakeCase":
						payload.value = changeCase.snakeCase(payload.value);
						break;
				}
				if(preprocessor.transform === 0) {
					payload.preprocessor.message = "Value cannot be null, unsaved";
					payload.save = false;
				}
				break;
			case "notnull": 
				if(parseFloat(payload.value) === 0) {
					payload.preprocessor.message = "Value cannot be null, unsaved";
					payload.save = false;
				}
				break;
			case "not100": 
				if(parseFloat(payload.value) === 100) {
					payload.preprocessor.message = "Value cannot be 100, unsaved";
					payload.save = false;
				}
				break;
			default:
				payload.preprocessor.message = `No Preprocessor found for ${flow.preprocessor}`;
				break;
		}
	//} else {
	//	payload.preprocessor.message = `No Preprocessor defined`;
	//}
	payload.preprocessor.status = "completed";
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
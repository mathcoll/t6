"use strict";
var t6sensorfusion = module.exports = {};

t6sensorfusion.export = function() {
	console.dir(JSON.stringify());
};

t6sensorfusion.preprocessor = function(flow, payload) {
	let preprocessor = typeof payload.preprocessor!=="undefined"?payload.preprocessor:(typeof flow.preprocessor!=="undefined"?flow.preprocessor:{});
	payload.preprocessor = typeof payload.preprocessor!="undefined"?payload.preprocessor:{};
	if(typeof flow!=="undefined" && typeof flow.preprocessor!=="undefined") {
		// payload.preprocessor can be an Array
		switch(preprocessor) {
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
			default :
				payload.preprocessor.message = `No Preprocessor found for ${flow.preprocessor}`;
				break;
		}
	} else {
		payload.preprocessor.message = `No Preprocessor defined`;
	}
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
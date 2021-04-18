"use strict";
var t6sensorfusion = module.exports = {};

t6sensorfusion.export = function(rule) {
	console.dir(JSON.stringify(rule));
};

t6sensorfusion.fuse = function(flow, payload) {
	if(typeof flow.track_id!=="undefined") {
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
};

module.exports = t6sensorfusion;
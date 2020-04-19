"use strict";
var t6otahistory = module.exports = {};

t6otahistory.addEvent = function(user_id, object_id, object_attributes, source_id, version, event, status, duration) {
	let OtaHistory	= dbOtaHistory.getCollection("otahistory");
	OtaHistory.insert({
		user_id: user_id,
		object_id: object_id,
		object_attributes: object_attributes,
		source_id: source_id,
		source_version: version,
		event: event,
		status: status,
		date: new Date(),
		duration: duration,
	});
	t6console.log(user_id, object_id, object_attributes, source_id, version, event, status, duration);
};

module.exports = t6otahistory;
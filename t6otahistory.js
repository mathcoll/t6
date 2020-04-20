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

t6otahistory.getLastEvent = function(user_id, object_id, source_id=null, event=null, status=null) {
	let OtaHistory	= dbOtaHistory.getCollection("otahistory");
	let params = new Array();
	params.push({ "user_id": user_id });
	params.push({ "object_id": object_id });
	if (source_id!==null) {
		params.push({ "source_id": source_id });
	}
	if (event!==null) {
		params.push({ "event": event });
	}
	if (source_id!==null) {
		params.push({ "status": status });
	}
	let query = {"$and": params};
	let hist = OtaHistory.chain().find(query).simplesort("date", true).offset(0).limit(1).data();
	delete hist[0]["meta"];
	delete hist[0]["$loki"];
	return hist[0];
};

module.exports = t6otahistory;
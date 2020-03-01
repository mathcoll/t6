"use strict";
var t6events = module.exports = {};
var measurement = "events";
var retention = "autogen";

t6events.setMeasurement = function(m) {
	measurement = m;
};

t6events.getMeasurement = function() {
	return measurement;
};

t6events.setRP = function(rp) {
	retention = rp;
};

t6events.add = function(where, what, who) {
	where = where + ":" + process.env.NODE_ENV;
	if ( db_type.influxdb ) {
		var tags = {what: what, where: where};
		var fields = {who: who};
		dbInfluxDB.writePoints([{
			measurement: measurement,
			tags: tags,
			fields: fields,
		}], { retentionPolicy: retention, }).then(err => {
			return true;
		}).catch(err => {
			console.error("Error writting event to influxDb:", err);
		});
	}
};

module.exports = t6events;
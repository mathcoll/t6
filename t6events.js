"use strict";
var t6events = module.exports = {};
var measurement = 'events';
var retention = 'autogen';

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
	var tags = {what: what, where: where};
	var fields = {who: who};
	dbInfluxDB.writePoints([{
		measurement: measurement,
		tags: tags,
		fields: fields,
	}], { retentionPolicy: retention, }).then(err => {
		return true;
	}).catch(err => {
		console.error(moment().format('MMMM Do YYYY, H:mm:ss'), 'Error writting event to influxDb:\n'+err);
	});
};

module.exports = t6events;
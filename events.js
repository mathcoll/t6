'use strict';
var events = module.exports = {};
var measurement = 'events';
var retention = 'autogen';

events.setMeasurement = function(m) {
	measurement = m;
};

events.setRP = function(rp) {
	retention = rp;
};

events.add = function(where, what, who) {
	var tags = {name: what, type: where};
	var fields = {id: who};
	dbInfluxDB.writePoints([{
		measurement: measurement,
		tags: tags,
		fields: fields,
	}], { retentionPolicy: retention, }).then(err => {
		return true;
	}).catch(err => {
		console.error('ERROR ===> Error writting event to influxDb:\n'+err);
    });
};

module.exports = events;
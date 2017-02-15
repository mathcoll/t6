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

events.add = function(type, name, id) {
	var tags = {name: name, type: type};
	var fields = {id: id};
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
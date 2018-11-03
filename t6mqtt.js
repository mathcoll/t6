'use strict';
var t6mqtt = module.exports = {};

t6mqtt.publish = function(user_id, topic, payload, retain) {
	topic = !topic.startsWith("/", 0)?"/"+topic:topic;
	if (JSON.parse(payload) && !JSON.parse(payload).environment) {
		JSON.parse(payload).environment = process.env.NODE_ENV;
	}
	client.publish(mqtt_root+user_id+topic, payload, {retain: retain});
	/*
	console.log(mqtt_root, user_id, topic, payload);
	console.log("Message sent.");
	console.log("clientId", client.options.clientId);
	console.log("host", client.options.host);
	console.log("port", client.options.port);
	*/
};



module.exports = t6mqtt;
"use strict";
var t6mqtt = module.exports = {};

t6mqtt.publish = function(user_id, topic, payload, retain) {
	topic = !topic.startsWith("/", 0)?"/"+topic:topic;
	payload = JSON.parse(payload);
	if ( payload && typeof payload === "object" ) {
		if ( !payload.environment ) {
			payload.environment = process.env.NODE_ENV;
		}
		if ( payload.dtepoch ) {
			payload.datetime = moment((payload.dtepoch/1000)*1000).format("MMMM Do YYYY, H:mm:ss");
		}
	}
	mqttClient.publish(mqttRoot+user_id+topic, JSON.stringify(payload), {retain: retain});
	/*
	console.log(mqttRoot, user_id, topic, payload);
	console.log("Message sent.");
	console.log("clientId", mqttClient.options.clientId);
	console.log("host", mqttClient.options.host);
	console.log("port", mqttClient.options.port);
	*/
};

module.exports = t6mqtt;
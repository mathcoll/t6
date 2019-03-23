"use strict";
var t6mqtt = module.exports = {};

t6mqtt.publish = function(user_id, topic, payload, retain) {
	topic = !topic.startsWith("/", 0)?"/"+topic:topic;
	payload = JSON.parse(payload);
	if ( payload ) {
		if ( !payload.environment ) {
			payload.environment = process.env.NODE_ENV;
		}
		if ( payload.dtepoch ) {
			payload.datetime = moment((payload.dtepoch/1000)*1000).format("MMMM Do YYYY, H:mm:ss");
		}
	}
	mqtt_client.publish(mqtt_root+user_id+topic, JSON.stringify(payload), {retain: retain});
	/*
	console.log(mqtt_root, user_id, topic, payload);
	console.log("Message sent.");
	console.log("clientId", mqtt_client.options.clientId);
	console.log("host", mqtt_client.options.host);
	console.log("port", mqtt_client.options.port);
	*/
};



module.exports = t6mqtt;
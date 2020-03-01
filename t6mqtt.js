"use strict";
var t6mqtt = module.exports = {};

t6mqtt.publish = function(user_id, topic, payload, retain) {
	topic = !topic.startsWith("/", 0)?"/"+topic:topic;
	try {
		if ( payload && typeof payload !== "string" ) {
			payload = JSON.parse(payload);
			if ( payload && typeof payload === "object" ) {
				payload.environment=typeof payload.environment==="undefined"?process.env.NODE_ENV:payload.environment;
				payload.datetime=typeof payload.dtepoch!=="undefined"?moment((payload.dtepoch/1000)*1000).format("MMMM Do YYYY, H:mm:ss"):"";
			}
			mqttClient.publish(mqttRoot+user_id+topic, JSON.stringify(payload), {retain: retain});
		} else {
			mqttClient.publish(mqttRoot+user_id+topic, payload, {retain: retain});
		}
	} catch(e) {
		t6console.error("Failure on mqtt", payload);
	}
};

module.exports = t6mqtt;
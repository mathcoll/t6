"use strict";
var t6mqtt = module.exports = {};

t6mqtt.publish = function(user_id, topic, payload, retain) {
	while( topic.charAt(0)==="/" ) { topic = topic.substr(1); }
	if ( user_id!==null ) {
		topic = topic!==null?mqttRoot+user_id+"/"+topic:mqttRoot+user_id+"default";
	} else {
		topic = topic!==null?topic:mqttRoot+"undefined/default";
	}
	while( topic.charAt(0)==="/" ) { topic = topic.substr(1) }
	try {
		if ( payload && typeof payload !== "string" ) {
			payload = JSON.parse(payload);
			if ( payload && typeof payload === "object" ) {
				payload.environment=typeof payload.environment==="undefined"?process.env.NODE_ENV:payload.environment;
				payload.datetime=typeof payload.dtepoch!=="undefined"?moment((payload.dtepoch/1000)*1000).format("MMMM Do YYYY, H:mm:ss"):"";
			}
			mqttClient.publish(topic, JSON.stringify(payload), {retain});
		} else {
			mqttClient.publish(topic, payload, {retain});
		}
	} catch(e) {
		t6console.error("Failure on mqtt", payload);
	}
};

module.exports = t6mqtt;
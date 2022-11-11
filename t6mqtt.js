"use strict";
var t6mqtt = module.exports = {};

t6mqtt.init = async function() {
	global.mqttClient = mqtt.connect({ port: mqttPort, host: mqttHost, keepalive: 10000 });
	await mqttClient.on("connect", function () {
		t6mqtt.publish(null, mqttInfo, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": "Hello mqtt, "+appName+" just have started. :-)", "environment": process.env.NODE_ENV}), false);
		mqttClient.subscribe(mqttObjectStatus+"#", function (err) {
			if (!err) {
				t6console.log("");
				t6console.log("===========================================================");
				t6console.log("==================== Init Mqtt Server... ==================");
				t6console.log("===========================================================");
				t6console.log(`Connected to Mqtt broker on ${mqttHost}:${mqttPort}`);
				t6console.log(`Subscribed to Mqtt topic "${mqttObjectStatus}#"`);
				t6console.log("Mqtt settings:");
				t6console.log(`-Mqtt root: "${mqttRoot}"`);
				t6console.log(`-Mqtt infos: "${mqttInfo}"`);
				t6console.log(`-Mqtt objects statuses: "${mqttObjectStatus}"`);
				t6console.log(`-Mqtt sockets: "${mqttSockets}"`);
			}
		});
	});
	mqttClient.on("message", function (topic, message) {
		let object = topic.toString().split(mqttObjectStatus)[1];
		let stat = message.toString();
		t6console.info(sprintf("Object Status Changed: %s is %s", object, stat==="1"?"visible":"hidden"), "("+message+")");
		if ( stat === "1" && t6ConnectedObjects.indexOf(object)<0 ) {
			t6ConnectedObjects.push(object);
		} else {
			let i = t6ConnectedObjects.indexOf(object);
			if (i > -1) {
				t6ConnectedObjects.splice(i, 1);
			}
		}
		t6console.info(sprintf("Connected Objects: %s", t6ConnectedObjects));
	});
};

t6mqtt.publish = function(user_id, topic, payload, retain) {
	while( topic.charAt(0)==="/" ) { topic = topic.substr(1); }
	if ( user_id!==null ) {
		topic = topic!==null?mqttRoot+user_id+"/"+topic:mqttRoot+user_id+"default";
	} else {
		topic = topic!==null?topic:mqttRoot+"undefined/default";
	}
	while( topic.charAt(0)==="/" ) { topic = topic.substr(1); }
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
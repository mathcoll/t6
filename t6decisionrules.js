"use strict";
var t6decisionrules = module.exports = {};
var SunCalc	= require("suncalc");
var Engine = require("json-rules-engine").Engine;
var Rule = require("json-rules-engine").Rule;
var rules;

function cryptPayload(payload, sender, encoding) {
	if ( sender && sender.secret_key_crypt ) {
		let iv = crypto.randomBytes(16);
		// sender.secret_key_crypt must be 256 bytes (32 characters)
		let cipher = crypto.createCipheriv(algorithm, Buffer.from(sender.secret_key_crypt, "hex"), iv);
		let encrypted = cipher.update(payload);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return iv.toString("hex") + ':' + encrypted.toString("hex");
	} else {
		//console.log("payload", "Error: Missing secret_key_crypt");
		return "Error: Missing secret_key_crypt";
	}
}

t6decisionrules.export = function(rule) {
	console.dir(JSON.stringify(rule));
};

t6decisionrules.checkRulesFromUser = function(user_id, payload) {
	payload.user_id = user_id;
	rules = dbRules.getCollection("rules");
	
	var query = {
	"$and": [
			{ "user_id": { "$eq": user_id } },
			{ "active": true },
		]
	}
	var r = rules.chain().find(query).data();
	
	let engine = new Engine();
	if ( r.length > 0 ) {
		r.forEach(function(theRule) {
			theRule.rule.event.params.rule_id = theRule.id;
			engine.addRule(new Rule(theRule.rule));
		});
	}
	
	//conditions.facts = [user_id, environment, dtepoch, value, flow, datetime]
	//conditions.operators = [isDayTime:<boolean>, user_id:<String>, environment:<List>, dtepoch:<Int>, value:<String>, flow:<String>, datetime:<String>]
	//https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators
	
	// Event Condition example: 
	// {"all":[{"fact":"dtepoch","operator":"isDayTime","value":true}]}
	engine.addOperator("isDayTime", (factValue, jsonValue) => {
		var factLatitude = payload.latitude?payload.latitude:localization.latitude; // TODO: we should use https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#condition-helpers-params
		var factLongitude = payload.longitude?payload.longitude:localization.longitude;
		
		var times = SunCalc.getTimes(typeof payload.dtepoch!=="undefined"?factValue:new Date(), factLatitude, factLongitude);
		if ( moment(payload.dtepoch).isAfter(times.sunrise) && moment(payload.dtepoch).isBefore(times.sunset) ) {
			//console.log("isDayTime", "(true) daytime / ", "Expecting "+jsonValue);
			if ( jsonValue === true ) {
				//console.log("matching on the "+jsonValue);
				return true;
			} else {
				//console.log("not matching on the "+jsonValue);
				return false;
			}
		} else {
			//console.log("isDayTime", "(false) night / ", "Expecting "+jsonValue);
			if ( jsonValue === false ) {
				//console.log("matching on the "+jsonValue);
				return true;
			} else {
				//console.log("not matching on the "+jsonValue);
				return false;
			}
		}
	});
	engine.addOperator("anormalityChange", (factValue, jsonValue) => {
		
	});
	
	engine.addOperator("diffFromPrevious", (factValue, jsonValue) => {
		
	});

	engine.on("success", function(event, almanac, ruleResult) {
		if ( !payload.mqtt_topic ) {
			if ( event.params.mqtt_topic ) {
				payload.mqtt_topic = event.params.mqtt_topic;
			} else {
				payload.mqtt_topic = "default";
			}
		}
		if ( !payload.message ) {
			if ( event.params.message ) {
				payload.message = event.params.message;
			}
		}

		//console.log("t6App", JSON.stringify({rule_id: event.params.rule_id}), user_id);
		t6events.add("t6App", JSON.stringify({rule_id: event.params.rule_id, event_type: event.type}), user_id);
		if( event.type === "mqttPublish" ) {
			console.log("Matching EventType", "mqttPublish");
			let mqttPayload = {dtepoch:payload.dtepoch, value:payload.value, flow: payload.flow};
			if ( typeof payload.message !== "undefined" ) {
				mqttPayload.message = payload.message;
			}
			if ( typeof payload.text !== "undefined" ) {
				mqttPayload.text = payload.text;
			}
			if ( typeof payload.object_id !== "undefined" ) {
				mqttPayload.object_id = payload.object_id;
				if( typeof user_id!=="undefined" && typeof payload.object_id!=="undefined" ) {
					let objects	= db.getCollection("objects");
					let object = objects.findOne({ "$and": [ { "user_id": { "$eq": user_id } }, { "id": { "$eq": payload.object_id } }, ]});
					if ( object && typeof object.secret_key_crypt!=="undefined" && object.secret_key_crypt.length>0 ) { // TODO: Should also get the Flow.requireCrypted flag.
						mqttPayload.value = cryptPayload(""+mqttPayload.value, {secret_key_crypt: object.secret_key_crypt}); // ascii, binary, base64, hex, utf8
					}
				}
			}
			t6mqtt.publish(payload.user_id, payload.mqtt_topic, JSON.stringify(mqttPayload), true);

		} else if ( event.type === "mqttCommand" && typeof payload.object_id !== "undefined" ) {
			console.log("Matching EventType", "mqttCommand");
			t6mqtt.publish(payload.user_id, "object_id/"+payload.object_id+"/cmd", payload.value, true);

		} else if ( event.type === "email" ) {
			console.log("Matching EventType", "email");
			var envelope = {
				from:		event.params.from?event.params.from:from,
				bcc:		event.params.bcc?event.params.bcc:bcc,
				to:			event.params.to?event.params.to:bcc,
				subject:	event.params.subject?stringformat(event.params.subject, payload):"",
				text:		event.params.text?stringformat(event.params.text, payload):"Html email client is required",
				html:		event.params.html?stringformat(event.params.html, payload):null
			}
			t6mailer.sendMail(envelope);
		} else if ( event.type === "sms" ) {
			console.log("Matching EventType", "sms");
			// TODO
		} else if ( event.type === "httpWebhook" ) {
			console.log("Matching EventType", "httpWebhook");
			if ( typeof event.params.body === "string" ) {
				event.params.body = stringformat(event.params.body, payload);
			}
			let options = {
				url: event.params.url,
				port: event.params.port,
				method: event.params.method,
				strictSSL: event.params.strictSSL,
				headers: event.params.headers?event.params.headers:{"Content-Type": "application/json"},
				body: JSON.stringify(event.params.body)
			};
			options.url = options.url.replace(/^\s*|\s*$/g, "");
			request(options,
				function (error, response, body) {
					var statusCode = response ? response.statusCode : null
							body = body || null
							console.log("Request sent - Server responded with:", statusCode);
					
					if ( error ) {
						return console.error("HTTP failed: ", error, options.url, statusCode, body)
					}
					
					console.log("success", options.url, statusCode, body);
				}
			)
		} else if ( event.type === "Ifttt" || event.type === "ifttt" ) {
			console.log("Matching EventType", "Ifttt");
			let body = {
				"data": [
					{
						"trigger_identity": "d1ffe1edf047abc4da8a1d43402fd0bce12ab279",
						"user_id": user_id,
						"value": payload.value,
						"environment": typeof payload.environment!=="undefined"?payload.environment:process.env.NODE_ENV,
						"dtepoch": payload.dtepoch,
						"flow": payload.flow,
						"datetime": payload.datetime
					}
				]
			};
			let options = {
				url: ifttt.realtimeApi.url,
				port: ifttt.realtimeApi.port,
				method: "POST",
				strictSSL: true,
				headers: {
					"IFTTT-Service-Key": ifttt.serviceKey,
					"Accept": "application/json",
					"Accept-Charset": "utf-8",
					"Accept-Encoding": "gzip, deflate",
					"Content-Type": "application/json",
					"X-Request-ID": uuid.v4()
				},
				body: JSON.stringify(body)
			};
			request(options,
				function (error, response, body) {
					var statusCode = typeof response!=="undefined"?response.statusCode:null;
					var body = body || null;
					console.log("Request sent - Server responded with:", statusCode);
					if ( error ) {
						return console.error("HTTP failed: ", error, options.url, statusCode, body)
					}
					console.log("success", options.url, statusCode, body);
				}
			)
		} else if ( event.type === "serial" ) {
			console.log("Matching EventType", "serial");
			// Arduino is using CmdMessenger
			serialport = new serialport(event.params.serialPort?event.params.serialPort:"/dev/ttyUSB0", { baudRate:event.params.baudRate?event.params.baudRate:9600 })
			// Some examples:
			// "kSetValue,{value};"
			// "kSetDtEpoch,{dtepoch};"
			// "kSetFlow,{flow};"
			serialport.write(event.params.serialMessage?stringformat(event.params.serialMessage, payload):stringformat("kSetLed,{value};", payload));
		} else if ( event.type === "slackMessage" ) {
			console.log("Matching EventType", "slackMessage");
			// TODO
		} else {
			console.log("No matching EventType", event.type);
		}
	});
	engine.run(payload);
};

t6decisionrules.action = function(user_id, payload, mqtt_topic) {
	if ( !payload.environment ) {
		payload.environment = process.env.NODE_ENV;
	}
	if ( !payload.mqtt_topic ) {
		payload.mqtt_topic = mqtt_topic;
	}
	if ( !user_id ) {
		user_id = "unknown_user";
	} else {
		t6decisionrules.checkRulesFromUser(user_id, payload);
	}
};

module.exports = t6decisionrules;
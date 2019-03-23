"use strict";
var t6decisionrules = module.exports = {};
var SunCalc	= require("suncalc");
var Engine = require("json-rules-engine").Engine;
var Rule = require("json-rules-engine").Rule;
var rules;

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
			//console.log('theRule', theRule.name);
			engine.addRule(new Rule(theRule.rule));
		});
	}
	
	//conditions.facts = [user_id, environment, dtepoch, value, flow, datetime]
	//conditions.operators = [isDayTime:<boolean>, user_id:<String>, environment:<List>, dtepoch:<Int>, value:<String>, flow:<String>, datetime:<String>]
	//https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators
	
	engine.addOperator("isDayTime", (factValue, jsonValue) => {
		var factLatitude = payload.latitude?payload.latitude:localization.latitude; // TODO: we should use https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#condition-helpers-params
		var factLongitude = payload.longitude?payload.longitude:localization.longitude;
		
		var times = SunCalc.getTimes(new Date(), factLatitude, factLongitude);
		if ( moment().isAfter(times.sunrise) && moment().isBefore(times.sunset) ) {
			//console.log("isDayTime", "(true) daytime.");
			return true;
		} else {
			//console.log("isDayTime", "(false) night.");
			return false;
		}
	});
	engine.addOperator("anormalityChange", (factValue, jsonValue) => {
		
	});
	
	engine.addOperator("diffFromPrevious", (factValue, jsonValue) => {
		
	});

	engine.on("success", function(event, almanac, ruleResult) {
		// ruleResult.result == true
		
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

		if( event.type == "mqttPublish" ) {
			if ( payload.text !== "" ) {
				t6mqtt.publish(payload.user_id, payload.mqtt_topic, JSON.stringify({dtepoch:payload.dtepoch, value:payload.value, text:payload.text, message:payload.message, flow: payload.flow}), true);
			} else {
				t6mqtt.publish(payload.user_id, payload.mqtt_topic, JSON.stringify({dtepoch:payload.dtepoch, value:payload.value, flow: payload.flow}), true);
			}
		} else if ( event.type == "email" ) {
			var envelope = {
				from:		event.params.from?event.params.from:from,
				bcc:		event.params.bcc?event.params.bcc:bcc,
				to:			event.params.to?event.params.to:bcc,
				subject:	event.params.subject?stringformat(event.params.subject, payload):"",
				text:		event.params.text?stringformat(event.params.text, payload):"Html email client is required",
				html:		event.params.html?stringformat(event.params.html, payload):null
			}
			t6mailer.sendMail(envelope);
		} else if ( event.type == "sms" ) {
			// TODO
		} else if ( event.type == "httpWebhook" ) {
			var options = {
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
							console.log("Request sent - Server responded with:", statusCode)
					
					if ( error ) {
						return console.error("HTTP failed: ", error, options.url, statusCode, body)
					}
					
					console.log("success", options.url, statusCode, body);
				}
			)
		} else if ( event.type == "Ifttt" ) {
			// TODO
		} else if ( event.type == "serial" ) {
			// Arduino is using CmdMessenger
			serialport = new serialport(event.params.serialPort?event.params.serialPort:"/dev/ttyUSB0", { baudRate:event.params.baudRate?event.params.baudRate:9600 })
			// Some examples:
			// "kSetValue,{value};"
			// "kSetDtEpoch,{dtepoch};"
			// "kSetFlow,{flow};"
			serialport.write(event.params.serialMessage?stringformat(event.params.serialMessage, payload):stringformat("kSetLed,{payload.value};", payload));
		} else if ( event.type == "slackMessage" ) {
			// TODO
		}
	});
	
	engine.run(payload);
};

t6decisionrules.action = function(user_id, p, publish, mqtt_topic) {
	if ( !p.environment ) {
		p.environment = process.env.NODE_ENV;
	}
	if ( !p.mqtt_topic ) {
		p.mqtt_topic = mqtt_topic;
	}
	if ( !user_id ) {
		user_id = "unknown_user";
	} else {
		t6decisionrules.checkRulesFromUser(user_id, p);
	}
};



module.exports = t6decisionrules;
"use strict";
var t6decisionrules = module.exports = {};
var SunCalc	= require("suncalc");
var Engine = require("json-rules-engine").Engine;
var Rule = require("json-rules-engine").Rule;
var rules;

function cryptPayload(payload, sender, encoding) {
	/*
	if ( sender && sender.secret_key_crypt ) {
		var decryptedPayload;
		sender.secret_key_crypt = Buffer.from(sender.secret_key_crypt, "hex");
		let textParts = encryptedPayload.split(".");
		let iv = Buffer.from(textParts.shift(), "hex"); // Initialization vector
		//console.log("Initialization vector", iv);
		//console.log(sender.secret_key_crypt);
		encryptedPayload = textParts.shift();

		//console.log("\nPayload encrypted:\n", encryptedPayload);
		let decipher = crypto.createDecipheriv(algorithm, sender.secret_key_crypt, iv);
		decipher.setAutoPadding(true);
		decryptedPayload = decipher.update(encryptedPayload, "base64", encoding || "utf8");// ascii, binary, base64, hex, utf8
		decryptedPayload += decipher.final(encoding || "utf8");

		//console.log("\nPayload decrypted:\n", decryptedPayload);
		return decryptedPayload!==""?decryptedPayload:false;
	} else {
		//console.log("payload", "Error: Missing secret_key_crypt");
		return false;
	}
	*/
	return "TODO: CRYPTED VALUE";
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
			let mqttPayload = {dtepoch:payload.dtepoch, value:payload.value, message:payload.message, flow: payload.flow, object_id: payload.object_id};
			if ( payload.text !== "" ) {
				mqttPayload.text = payload.text;
			}
			if( user_id && payload.object_id ) {
				let objects	= db.getCollection("objects");
				let object = objects.findOne({ "$and": [ { "user_id": { "$eq": user_id } }, { "id": { "$eq": payload.object_id } }, ]});
				if ( object && object.secret_key_crypt ) { // TODO: Should also get the Flow.requireCrypted flag.
					mqttPayload.value = cryptPayload(mqttPayload.value, {secret_key_crypt: object.secret_key_crypt}); // ascii, binary, base64, hex, utf8
				}
			}
			t6mqtt.publish(payload.user_id, payload.mqtt_topic, JSON.stringify(mqttPayload), true);

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

t6decisionrules.action = function(user_id, payload, publish, mqtt_topic) {
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
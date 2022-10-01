"use strict";
var t6decisionrules = module.exports = {};
var Engine = require("json-rules-engine").Engine;
var Rule = require("json-rules-engine").Rule;

function cryptPayload(payload, sender, encoding) {
	if ( sender && sender.secret_key_crypt ) {
		let iv = crypto.randomBytes(16);
		// sender.secret_key_crypt must be 256 bytes (32 characters)
		let cipher = crypto.createCipheriv(algorithm, Buffer.from(sender.secret_key_crypt, "hex"), iv);
		let encrypted = cipher.update(payload);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return iv.toString("hex") + ":" + encrypted.toString("hex");
	} else {
		t6console.debug("payload", "Error: Missing secret_key_crypt");
		return "Error: Missing secret_key_crypt";
	}
}

t6decisionrules.checkRulesFromUser = function(user_id, payload) {
	let p = payload;
	let limit = 10;
	let engine = new Engine();
	p.user_id = user_id;
	p.latitude = typeof p.latitude!=="undefined"?p.latitude:0;
	p.longitude = typeof p.longitude!=="undefined"?p.longitude:0;
	
	var query = {
		"$and": [
			{ "user_id": { "$eq": p.user_id } },
			{ "active": true },
		]
	};
	var r = rules.chain().find(query).data();
	if ( r.length > 0 ) {
		r.forEach(function(theRule) {
			if (typeof theRule.rule.event!=="undefined" && typeof theRule.rule.event.params!=="undefined") {
				theRule.rule.event.params.rule_id = theRule.id;
				engine.addRule(new Rule(theRule.rule));
			}
		});
	}
	// retrieve latest values

	//conditions.facts = [user_id, environment, dtepoch, value, flow, datetime]
	//conditions.operators = [isDayTime:<boolean>, user_id:<String>, environment:<List>, dtepoch:<Int>, value:<String>, flow:<String>, datetime:<String>]
	//https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators
	engine.addOperator("isDayTime", (factValue, jsonValue) => {
		let factLatitude = p.latitude?p.latitude:localization.latitude; // TODO: we should use https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#condition-helpers-params
		let factLongitude = p.longitude?p.longitude:localization.longitude;
		let times = SunCalc.getTimes(typeof p.dtepoch!=="undefined"?factValue:new Date(), factLatitude, factLongitude);
		if ( moment(parseInt(p.dtepoch, 10)).isAfter(times.sunrise) && moment(parseInt(p.dtepoch, 10)).isBefore(times.sunset) ) {
			t6console.debug("isDayTime" + "(true) daytime / " + "Expecting " + jsonValue);
			if ( jsonValue === true ) {
				t6console.debug("matching on the "+jsonValue);
				return true;
			} else {
				t6console.debug("not matching on the "+jsonValue);
				return false;
			}
		} else {
			t6console.debug("isDayTime" + "(false) night / " + "Expecting " + jsonValue);
			if ( jsonValue === false ) {
				t6console.debug("matching on the "+jsonValue);
				return true;
			} else {
				t6console.debug("not matching on the "+jsonValue);
				return false;
			}
		}
	});
	engine.addOperator("sentimentScoreGreaterThanInclusive", (factValue, jsonValue) => {
		if ( typeof factValue==="string" ) {
			let sentiment = new Sentiment();
			let result = sentiment.analyze(factValue);
			t6console.debug("sentimentScoreGreaterThanInclusive", result.score);
			p.SentimentScore = result.score;
			if ( result.score >= jsonValue ) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	});
	engine.addOperator("sentimentScoreLessThanInclusive", (factValue, jsonValue) => {
		if ( typeof factValue==="string" ) {
			let sentiment = new Sentiment();
			let result = sentiment.analyze(factValue);
			t6console.debug("sentimentScoreLessThanInclusive", result.score);
			p.SentimentScore = result.score;
			if ( result.score <= jsonValue ) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	});
	engine.addOperator("distanceGreaterThan", (factValue, jsonValue) => {
		let factLatitude = p.latitude?p.latitude:localization.latitude;
		let factLongitude = p.longitude?p.longitude:localization.longitude;
		if ( typeof p.object!=="undefined" && typeof p.object.latitude!=="undefined" && typeof p.object.longitude!=="undefined" ) {
			t6console.debug("distanceGreaterThan Fact=", factLatitude, factLongitude);
			t6console.debug("distanceGreaterThan Limit=", jsonValue);
			t6console.debug("Object", p.object.latitude, p.object.longitude);
			let dist = geodist({lat: factLatitude, lon: factLongitude}, {lat: p.object.latitude, lon: p.object.longitude}, {format: true, unit: "meters", limit: parseInt(jsonValue, 10)});
			p.distance = geodist({lat: factLatitude, lon: factLongitude}, {lat: p.object.latitude, lon: p.object.longitude}, {format: true, unit: "meters"});
			t6console.debug("dist=", p.distance, "is GreaterThan", jsonValue, !dist);
			return !dist;
		} else {
			return false;
		}
	});
	engine.addOperator("distanceLessThan", (factValue, jsonValue) => {
		let factLatitude = p.latitude?p.latitude:localization.latitude;
		let factLongitude = p.longitude?p.longitude:localization.longitude;
		if ( typeof p.object!=="undefined" && typeof p.object.latitude!=="undefined" && typeof p.object.longitude!=="undefined" ) {
			t6console.debug("distanceLessThan Fact=", factLatitude, factLongitude);
			t6console.debug("distanceLessThan Limit=", jsonValue);
			t6console.debug("Object", p.object.latitude, p.object.longitude);
			let dist = geodist({lat: factLatitude, lon: factLongitude}, {lat: p.object.latitude, lon: p.object.longitude}, {format: true, unit: "meters", limit: parseInt(jsonValue, 10)});
			p.distance = geodist({lat: factLatitude, lon: factLongitude}, {lat: p.object.latitude, lon: p.object.longitude}, {format: true, unit: "meters"});
			t6console.debug("dist=", p.distance, "is LessThan", jsonValue, !dist);
			return dist;
		} else {
			return false;
		}
	});

	let rp = typeof p.retention!=="undefined"?p.retention:"autogen";
	if ((influxSettings.retentionPolicies.data).indexOf(rp)===-1) {
		t6console.debug("Retention is not valid:", rp);
		rp = typeof influxSettings.retentionPolicies.data[0]!=="undefined"?influxSettings.retentionPolicies.data[0]:"autogen";
	}
	let influxQuery = sprintf("SELECT %s FROM %s.data WHERE flow_id='%s' AND user_id='%s' ORDER BY time DESC LIMIT %s OFFSET 1", "valueFloat as value", rp, p.flow, p.user_id, limit);
	t6console.info("DB retrieve latest values", influxQuery);
	let valuesFromDb = [];
	let indexesFromDb = [];
	let timesFromDb = [];
	let indexesValuesFromDb = [];
	dbInfluxDB.query(influxQuery).then((data) => {
		if ( data.length > 0 ) {
			data.map(function(d, i) {
				valuesFromDb.push(d.value);
				timesFromDb.push(d.time);
				indexesValuesFromDb.push([i, d.value]);
				indexesFromDb.push(i);
			});
		}
		valuesFromDb.reverse(); // TODO: Need to check if we'd also require to reverse the other arrays
		//t6console.debug("indexesFromDb", indexesFromDb);
		//t6console.debug("valuesFromDb", valuesFromDb);

		engine.addOperator("lastEventGreaterThanInclusive", (factValue, jsonValue) => {
			t6console.debug("addOperator lastEventGreaterThanInclusive", factValue, jsonValue);
			if ( Number.parseFloat(jsonValue).toString() !== "NaN" && (moment(timesFromDb.slice(1)[0]).add(jsonValue, "seconds")).isBefore(moment(p.dtepoch*1)) ) {
				//t6console.debug("lastEventGreaterThanInclusive DETECTED");
				return true;
			} else {
				//t6console.debug("lastEventGreaterThanInclusive NOT DETECTED");
				return false;
			}
		});

		engine.addOperator("lastEventLessThanInclusive", (factValue, jsonValue) => {
			t6console.debug("addOperator lastEventLessThanInclusive", factValue, jsonValue);
			if ( Number.parseFloat(jsonValue).toString() !== "NaN" && (moment(timesFromDb.slice(1)[0]).add(jsonValue, "seconds")).isAfter(moment(p.dtepoch*1)) ) {
				//t6console.debug("lastEventLessThanInclusive DETECTED");
				return true;
			} else {
				//t6console.debug("lastEventLessThanInclusive NOT DETECTED");
				return false;
			}
		});

		engine.addOperator("anomalyGreaterThanInclusive", (factValue, jsonValue) => {
			t6console.debug("addOperator anomalyGreaterThanInclusive", factValue, jsonValue);
			p.anomalyDetection = {};
			let lr = statistics.linearRegression(indexesValuesFromDb);
			p.anomalyDetection.predicted = Math.abs(lr.m)+lr.b;
			p.anomalyDetection.diff = factValue - p.anomalyDetection.predicted;
			p.anomalyDetection.threashold = jsonValue;
			p.anomalyDetection.allvalues = valuesFromDb;
			
			if ( Number.parseFloat(factValue).toString() !== "NaN" && Math.abs(p.anomalyDetection.diff) >= p.anomalyDetection.threashold ) {
				//t6console.debug("anomalyGreaterThanInclusive DETECTED", { "predicted": p.anomalyDetection.predicted, "value": factValue, "threashold": p.anomalyDetection.threashold, "diff": p.anomalyDetection.diff });
				return true;
			} else {
				//t6console.debug("anomalyGreaterThanInclusive NOT DETECTED", { "predicted": p.anomalyDetection.predicted, "value": factValue, "threashold": p.anomalyDetection.threashold, "diff": p.anomalyDetection.diff });
				return false;
			}
		});

		engine.addOperator("anomalyLessThanInclusive", (factValue, jsonValue) => {
			t6console.debug("addOperator anomalyLessThanInclusive", factValue, jsonValue);
			p.anomalyDetection = {};
			let lr = statistics.linearRegression(indexesValuesFromDb);
			p.anomalyDetection.predicted = Math.abs(lr.m)+lr.b;
			p.anomalyDetection.diff = factValue - p.anomalyDetection.predicted;
			p.anomalyDetection.threashold = jsonValue;
			p.anomalyDetection.allvalues = valuesFromDb;
			if ( Number.parseFloat(factValue).toString() !== "NaN" && Math.abs(p.anomalyDetection.diff) <= p.anomalyDetection.threashold ) {
				//t6console.debug("anomalyLessThanInclusive DETECTED", { "predicted": p.anomalyDetection.predicted, "value": factValue, "threashold": p.anomalyDetection.threashold, "diff": p.anomalyDetection.diff });
				return true;
			} else {
				//t6console.debug("anomalyLessThanInclusive NOT DETECTED", { "predicted": p.anomalyDetection.predicted, "value": factValue, "threashold": p.anomalyDetection.threashold, "diff": p.anomalyDetection.diff });
				return false;
			}
		});

		engine.addOperator("changeGreaterThanInclusive", (factValue, jsonValue) => {
			t6console.debug(`addOperator changeGreaterThanInclusive ${factValue} >= ${jsonValue} ?`);
			p.diffFromPrevious = {};
			p.diffFromPrevious.previous = valuesFromDb.slice(-1);
			p.diffFromPrevious.diff = factValue - p.diffFromPrevious.previous;
			p.diffFromPrevious.threashold = jsonValue;
			if ( Number.parseFloat(factValue).toString() !== "NaN" && Math.abs(p.diffFromPrevious.diff) >= p.diffFromPrevious.threashold ) {
				//t6console.debug("changeGreaterThanInclusive DETECTED", { "previous": p.diffFromPrevious.previous, "value": factValue, "threashold": p.diffFromPrevious.threashold, "diff": p.diffFromPrevious.diff });
				return true;
			} else {
				//t6console.debug("changeGreaterThanInclusive NOT DETECTED", { "previous": p.diffFromPrevious.previous, "value": factValue, "threashold": p.diffFromPrevious.threashold, "diff": p.diffFromPrevious.diff });
				return false;
			}
		});

		engine.addOperator("changeLessThanInclusive", (factValue, jsonValue) => {
			t6console.debug(`addOperator changeLessThanInclusive ${factValue} <= ${jsonValue} ?`);
			p.diffFromPrevious = {};
			p.diffFromPrevious.previous = valuesFromDb.slice(-1);
			p.diffFromPrevious.diff = factValue - p.diffFromPrevious.previous;
			p.diffFromPrevious.threashold = jsonValue;
			if ( Number.parseFloat(factValue).toString() !== "NaN" && Math.abs(p.diffFromPrevious.diff) <= p.diffFromPrevious.threashold ) {
				//t6console.debug("changeLessThanInclusive DETECTED", { "previous": p.diffFromPrevious.previous, "value": factValue, "threashold": p.diffFromPrevious.threashold, "diff": p.diffFromPrevious.diff });
				return true;
			} else {
				//t6console.debug("changeLessThanInclusive NOT DETECTED", { "previous": p.diffFromPrevious.previous, "value": factValue, "threashold": p.diffFromPrevious.threashold, "diff": p.diffFromPrevious.diff });
				return false;
			}
		});

		engine.on("failure", function(rule, almanac, ruleResult) {
			//t6console.debug("decisionrule failure rule : ", rule, ruleResult);
			//t6console.debug("decisionrule failure almanac : ", almanac);
		});
		
		engine.on("success", function(event, almanac, ruleResult) {
			t6console.debug(sprintf("onSuccess", event, almanac, ruleResult));
			t6events.addStat("t6App", `Matching_EventType_${event.type}`, user_id, user_id, {"type": event.type, "user_id": user_id, "rule_id": event.params.rule_id});
			t6console.info(sprintf("Matching EventType '%s' for User '%s' (Rule '%s')", event.type, user_id, event.params.rule_id));
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

			if( event.type === "mqttPublish" ) {
				let mqttPayload = {date: moment(parseInt(payload.dtepoch, 10)).format("LLL"), dtepoch:parseInt(payload.dtepoch, 10), value:payload.value, flow: payload.flow};
				if ( typeof payload.message !== "undefined" ) {
					mqttPayload.message = payload.message;
				}
				if ( typeof payload.text !== "undefined" ) {
					mqttPayload.text = payload.text;
				}
				if ( typeof payload.object_id!=="undefined" ) {
					mqttPayload.object_id = payload.object_id;
					if( typeof user_id!=="undefined" ) {
						let object = objects.findOne({ "$and": [ { "user_id": { "$eq": user_id } }, { "id": { "$eq": payload.object_id } }, ]});
						if ( object && typeof object.secret_key_crypt!=="undefined" && object.secret_key_crypt.length>0 ) { // TODO: Should also get the Flow.requireCrypted flag.
							mqttPayload.value = cryptPayload(""+mqttPayload.value, {secret_key_crypt: object.secret_key_crypt}); // ascii, binary, base64, hex, utf8
						}
					}
				}
				t6mqtt.publish(payload.user_id, payload.mqtt_topic, JSON.stringify(mqttPayload), true);

			} else if ( event.type === "mqttCommand" && typeof payload.object_id !== "undefined" ) {
				t6mqtt.publish(payload.user_id, "object_id/"+payload.object_id+"/cmd", payload.value, true);

			} else if ( event.type === "email" ) {
				var envelope = {
					from:		event.params.from?event.params.from:from,
					bcc:		event.params.bcc?event.params.bcc:undefined,
					to:			event.params.to?event.params.to:bcc,
					user_id:	payload.user_id?payload.user_id:to,
					subject:	event.params.subject?stringformat(event.params.subject, payload):"",
					text:		event.params.text?stringformat(event.params.text, payload):"Html email client is required",
					html:		event.params.html?stringformat(event.params.html, payload):null
				};
				t6mailer.sendMail(envelope);
			} else if ( event.type === "sms" ) {
				if(event.params.to) {
					const clientTwilio = new twilio(twilioSettings.accountSid, twilioSettings.authToken);
					clientTwilio.messages
						.create({
							body: event.params.body?stringformat(event.params.body, payload):`Sms from t6; value: ${value}`,
							to: event.params.to, // Text this number
							from: twilioSettings.from, // From a valid Twilio number
						})
						.then((message) => t6console.debug("Twilio Message Sid:", message.sid));
				}
			} else if ( event.type === "annotate" ) {
				if(typeof event.params.category_id!=="undefined") {
					let newAnnotation = annotate(payload.user_id?payload.user_id:"", payload.dtepoch*1000, payload.dtepoch*1000, payload.flow, event.params.category_id);
					t6events.addStat("t6App", `Annotation added ${newAnnotation.id}`, user_id, user_id, {"user_id": user_id, "rule_id": event.params.rule_id});
				}
			} else if ( event.type === "httpWebhook" ) {
				let options = {
					url: event.params.url,
					port: event.params.port,
					method: event.params.method,
					strictSSL: event.params.strictSSL,
					headers: event.params.headers?event.params.headers:{"Content-Type": "application/json"},
					body: typeof event.params.body==="string"?JSON.stringify(stringformat(event.params.body, payload)):JSON.stringify(event.params.body)
				};
				options.url = options.url.replace(/^\s*|\s*$/g, "");
				request(options,
					function (error, response, body) {
						var statusCode = response ? response.statusCode : null;
						body = body || null;
						t6console.debug("Request sent - Server responded with:", statusCode);
						if ( error ) {
							return console.error("HTTP failed: ", error, options.url, statusCode, body);
						}
						t6console.debug("success", options.url, statusCode, body);
					}
				);
			} else if ( event.type === "Ifttt" || event.type === "ifttt" ) {
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
				request(options, function (error, response, body) {
						var statusCode = typeof response!=="undefined"?response.statusCode:null;
						body = body || null;
						t6console.debug("Request sent - Server responded with:" + statusCode);
						if ( error ) {
							return t6console.error("HTTP failed: ", error, options.url, statusCode, body);
						}
						t6console.debug("success" + options.url + statusCode + body);
					}
				);
			} else if ( event.type === "serial" ) {
				// Arduino is using CmdMessenger
				serialport = new serialport(event.params.serialPort?event.params.serialPort:"/dev/ttyUSB0", { baudRate:event.params.baudRate?event.params.baudRate:9600 });
				// Some examples:
				// "kSetValue,{value};"
				// "kSetDtEpoch,{dtepoch};"
				// "kSetFlow,{flow};"
				serialport.write(event.params.serialMessage?stringformat(event.params.serialMessage, payload):stringformat("kSetLed,{value};", payload));
			} else if ( event.type === "slackMessage" ) {
				// TODO
			} else if ( event.type === "webPush" ) {
				let p = {
					"title": stringformat(event.params.title, payload),
					"body": stringformat(event.params.body, payload),
					"icon": event.params.icon,
					"actions": event.params.actions,
					"tag": event.params.tag,
					"vibrate": event.params.vibrate
				};
				let user = users.findOne({ "id": user_id });
				if (user && user.pushSubscription) {
					let result = t6notifications.sendPush(user, p).catch((error) => {
						users.chain().find({ "id": user_id }).update(function(u) {
							u.pushSubscription = {};
							db_users.save();
						});
						t6console.debug("pushSubscription is now disabled on User", error);
					});
					if(result && typeof result.statusCode!=="undefined" && (result.statusCode === 404 || result.statusCode === 410)) {
						t6console.error("Can't sendPush because of a status code Error", result.statusCode);
						users.chain().find({ "id": user_id }).update(function(u) {
							u.pushSubscription = {};
							db_users.save();
						});
						t6console.debug("pushSubscription is now disabled on User", error);
					}
				} else {
					t6console.error("No user or no pushSubscription found, can't sendPush");
				}
			} else if ( event.type === "sockets" ) {
				let destObject_id = typeof payload.object_id!=="undefined"?payload.object_id:(typeof event.params.destObject_id!=="undefined"?event.params.destObject_id:undefined);
				
				t6console.debug("socketPayload INIT", event.params.socketPayload);
				event.params.socketPayload = JSON.stringify(event.params.socketPayload);
				event.params.socketPayload = (event.params.socketPayload).substring(1, (event.params.socketPayload).length-1);
				t6console.debug("socketPayload stringify", event.params.socketPayload);
				let socketPayload = typeof event.params.socketPayload!=="undefined"?stringformat(event.params.socketPayload, payload):{};
				socketPayload = "{"+socketPayload+"}";
				t6console.debug("socketPayload formatted", socketPayload);
				//t6console.debug("socketPayload AFTER", JSON.stringify(socketPayload));

				if ( typeof payload.object_id!=="undefined" ) {
					//socketPayload.object_id = payload.object_id;
					if( typeof user_id!=="undefined" ) {
						t6console.debug("Looking for object_id:", payload.object_id, user_id);
						let object = objects.findOne({ "$and": [ { "user_id": { "$eq": user_id } }, { "id": { "$eq": payload.object_id } }, ]});
						//t6console.debug("Found object:", object);
						wss.clients.forEach(function each(client) {
							//t6console.debug("Client:", client);
							let current = wsClients.get(client);
							if(current.object_id === object.id) {
								t6console.debug("current.object_id", current.object_id);
								t6console.debug("socketPayload", socketPayload);
								//client.send(JSON.stringify(socketPayload));
								client.send(socketPayload);
							} else {
								t6console.debug("Not the correct Client object_id:", current.object_id, "!==", object.object_id);
							}
						});
					}
					
				}
			} else {
				t6console.warn(`No matching EventType: ${event.type}`);
			}
			t6mqtt.publish(null, mqttInfo+"/ruleEvents/"+user_id, JSON.stringify({"date":moment().format("LLL"), "dtepoch":parseInt(moment().format("x"), 10),"EventType": event.type, "rule_id": event.params.rule_id, "message":"Rule matching EventType", "environment": process.env.NODE_ENV}), true);
		});
		engine.run(payload);
	}).catch((err) => {
		t6console.critical("dbInfluxDB ERR on decisionRule (checkRulesFromUser)", err);
		t6console.debug("ERR on decisionRule (checkRulesFromUser) :");
		t6console.debug("payload", payload);
	});
}; // t6decisionrules.checkRulesFromUser

t6decisionrules.action = function(user_id, payload, mqtt_topic) {
	if ( !payload.environment ) {
		payload.environment = process.env.NODE_ENV;
	}
	if ( !payload.text ) {
		payload.text = "";
	}
	if ( !payload.mqtt_topic ) {
		payload.mqtt_topic = mqtt_topic;
	}
	if ( !payload.flow ) {
		payload.flow = "";
	}
	if ( !user_id ) {
		user_id = "unknown_user";
		t6console.error(`Can't load rule for unknown user: ${user_id}`);
	} else {
		t6console.debug(`Loading rules for User: ${user_id}`);
		//t6console.debug("payload before checkRulesFromUser", payload);
		t6decisionrules.checkRulesFromUser(user_id, payload);
	}
	payload = null;
};

module.exports = t6decisionrules;
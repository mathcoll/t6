'use strict';
var t6decisionrules = module.exports = {};
var SunCalc	= require("suncalc");
var Engine = require('json-rules-engine').Engine;
var rules;

t6decisionrules.checkRulesFromUser = function(user_id, payload) {
	payload.user_id = user_id;
	/* TODO */
		//rules = dbRules.getCollection('rules');
		//var r = rules.chain().find({'user_id': { '$eq': user_id }}).data();
		//console.log('getRulesFromUser', r);
	
	//conditions.facts = [user_id, environment, dtepoch, value, flow, datetime]
	//conditions.operators = [isDayTime:<boolean>, user_id:<String>, environment:<List>, dtepoch:<Int>, value:<String>, flow:<String>, datetime:<String>]
	//https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators
	
	var hardcodedRule = {
			conditions: {
				all: [{
					fact: 'user_id',
					operator: 'equal',
					value: '44800701-d6de-48f7-9577-4b3ea1fab81a'
				}, {
					fact: 'environment',
					operator: 'equal',
					value: 'production'
				}]
			},
			event: {
				type: 'mqttPublish', //mqttPublish, email, sms, httpWebhook, Ifttt, serial, slackMessage
				params: {
					message: '',
					mqtt_topic: ''
				}
			},
			priority: 1,
			onSuccess: function (event, almanac) {  },
			//onFailure: function (event, almanac) { console.log("rule onFailure", event); },
	};
	var hardcodedRule2 = {
			conditions: {
				all: [{
					fact: 'user_id',
					operator: 'equal',
					value: '44800701-d6de-48f7-9577-4b3ea1fab81a'
				}, {
					fact: 'environment',
					operator: 'equal',
					value: 'development'
				}, {
					fact: 'flow',
					operator: 'equal',
					value: 'cb510da8-ddd0-49cc-bb73-95b3b2bbfd8f'
				}]
			},
			event: {
				type: 'email',
				params: {
					from: "m.lory@free.fr",
					//bcc: "mathieu.lory+bcc@free.fr",
					to: 'mathieu@internetcollaboratif.info',
					subject: 'Event on t6 Flow cb510da8-ddd0-49cc-bb73-95b3b2bbfd8f',
					text: 'Html email client is required',
					html: '<h1>Hello</h1>TEST from event.'
				}
			},
			priority: 2,
			onSuccess: function (event, almanac) { engine.stop(); /* Stop engine after success */  },
			//onFailure: function (event, almanac) { console.log("rule onFailure", event); },
	};
	
	let engine = new Engine();
	engine.addRule(hardcodedRule);
	engine.addRule(hardcodedRule2);
	
	engine.addOperator('isDayTime', (factValue, jsonValue) => {
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

	engine.on('success', function(event, almanac, ruleResult) {
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
		
		if( event.type == 'mqttPublish' ) {
			if ( payload.text !== "" ) {
				t6mqtt.publish(payload.user_id, payload.mqtt_topic, JSON.stringify({dtepoch:payload.dtepoch, value:payload.value, text:payload.text, message:payload.message, flow: payload.flow}), true);
			} else {
				t6mqtt.publish(payload.user_id, payload.mqtt_topic, JSON.stringify({dtepoch:payload.dtepoch, value:payload.value, flow: payload.flow}), true);
			};
		} else if ( event.type == 'email' ) {
			var envelope = {
				from:		event.params.from,
				bcc:		event.params.bcc?event.params.bcc:bcc,
				to:			event.params.to,
				subject:	event.params.subject?event.params.subject:'',
				text:		event.params.text?event.params.text:'Html email client is required',
				html:		event.params.html
			};
			t6mailer.sendMail(envelope);
		} else if ( event.type == 'sms' ) {
			
		} else if ( event.type == 'httpWebhook' ) {
			
		} else if ( event.type == 'Ifttt' ) {
			
		} else if ( event.type == 'serial' ) {
			
		} else if ( event.type == 'slackMessage' ) {
			
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
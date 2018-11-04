'use strict';
var decisionrules = module.exports = {};
var SunCalc	= require("suncalc");
var Engine = require('json-rules-engine').Engine;
var rules;

decisionrules.checkRulesFromUser = function(user_id, payload) {
	payload.user_id = user_id;
	/* TODO */
		//rules = dbRules.getCollection('rules');
		//var r = rules.chain().find({'user_id': { '$eq': user_id }}).data();
		//console.log('getRulesFromUser', r);
	
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
				type: 'mqttPublish',
				params: {
					message: '',
					mqtt_topic: ''
				}
			},
			priority: 1,
	};
	
	//console.log('payload', payload);
	let engine = new Engine();
	engine.addRule(hardcodedRule);
	
	engine.addOperator('isDayTime', (factValue, jsonValue) => {
		/* return a Boolean according to current date: day(1) or night(0) */
		var factLatitude = payload.latitude?payload.latitude:localization.latitude;
		var factLongitude = payload.longitude?payload.longitude:localization.longitude;
		//console.log("isDayTime factLatitude", factLatitude);
		//console.log("isDayTime factLongitude", factLongitude);
		
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
		//console.log('event success', event.type);
		//console.log('event payload', payload);
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
			
		} else if ( event.type == 'sms' ) {
			
		} else if ( event.type == 'httpWebhook' ) {
			
		} else if ( event.type == 'Ifttt' ) {
			
		} else if ( event.type == 'serial' ) {
			
		} else if ( event.type == 'slackMessage' ) {
			
		}
	});
	
	engine.run(payload);
};



/* This is for testing : */
decisionrules.action = function(user_id, p, publish, mqtt_topic) {
	if ( !p.environment ) {
		p.environment = process.env.NODE_ENV;
	}
	if ( !p.mqtt_topic ) {
		p.mqtt_topic = mqtt_topic;
	}
	if ( !user_id ) {
		user_id = "unknown_user";
	} else {
		decisionrules.checkRulesFromUser(user_id, p);
	}
};



module.exports = decisionrules;
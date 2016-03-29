'use strict';
var exec		= require('exec');
var moment		= require('moment');
var request		= require('request');
var sprintf		= require('sprintf-js').sprintf;

var bearer		= '!VQJUWMjxdurf5s&6!#9bnTWTK2&xze76B3wARNS4E-%!EwtA$mF+A3Hw+5Y+Mvw';
var api			= 'http://127.0.0.1:3000/v2.0.1/data/';
var flow_id		= '8';
var publish		= true;
var save		= true;
var mqtt_topic	= 'couleurs/yahoo/temperature';
var unit		= '°C';
var timestamp	= moment().format('x');

// http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22my_city%22&format=xml
// http://weather.yahooapis.com/forecastrss?w=%s&u=%s
var city_code = 90717580;
var url = sprintf('http://query.yahooapis.com/v1/public/yql?q=select item from weather.forecast where woeid="%s"&format=json', city_code);

function FtoC(temp) {return Math.round((temp - 32) / (9 / 5));}

request({
	url: url,
	method: 'GET',
	json: true,
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	},
}, function (error, response, body){
	var value = FtoC(body.query.results.channel.item.condition.temp);
	request({
		url: api,
		method: 'POST',
		json: true,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer '+bearer,
		},
		body: {flow_id: flow_id, value:value, timestamp: timestamp, text: body.query.results.channel.item.condition.text, publish: publish, save: save, unit: unit, mqtt_topic: mqtt_topic}
	}, function (error, response, body){
		//console.log(error);
	});
});


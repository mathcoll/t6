#!/usr/bin/env nodejs

"use strict";
var exec		= require("exec");
var request		= require("request"); //TODO DEPRECATED PACKAGE
var sprintf		= require("sprintf-js").sprintf;

// http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22my_city%22&format=xml
// http://weather.yahooapis.com/forecastrss?w=%s&u=%s
var city_code = 90717580;
var url = sprintf("http://query.yahooapis.com/v1/public/yql?q=select item from weather.forecast where woeid=\"%s\"&format=json", city_code);

function FtoC(temp) {return Math.round((temp - 32) / (9 / 5));}

request({ //TODO DEPRECATED PACKAGE
	url: url,
	method: "GET",
	json: true,
	headers: {
		"Accept": "application/json",
		"Content-Type": "application/json",
	},
}, function (error, response, body){
	var value = FtoC(body.query.results.channel.item.condition.temp);
	if(!value) {
		console.log("Error\n");
		process.exit(1);
	} else {
		console.log(value);
		process.exit(0);
	}
});
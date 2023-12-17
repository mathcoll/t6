"use strict";
var exec		= require("exec");
var moment		= require("moment");
var request		= require("request");
var exec		= require("child_process").exec;
var sprintf		= require("sprintf-js").sprintf;
var path		= require("path");
var os			= require("os");
var config		= require(`../data/sensors-${os.hostname()}`);
var argv		= require("minimist")(process.argv.slice(2));
console.log(`Reading config from file: "../data/sensors-${os.hostname()}.js.`);
let auth = config.auth;
let auth_admin = config.auth_admin;
config = config.sensors[argv.run]!==undefined?config.sensors[argv.run]:null;

if ( argv.run === undefined ) {
	console.log("Please use the '--run' parameter to set your setting. e.g.:");
	console.log("$ nodejs "+path.join(__filename)+" --run '$configId'\n");
	process.exit(1);
}
if ( config === null ) {
	console.log("Config is not found for "+argv.run);
	process.exit(1);
}
config.postDataPoint = config.postDataPoint!==undefined?config.postDataPoint:false;

var bearer		= "";
var timestamp = moment().format("x");

if ( config.exec ) {
	process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
	var df = exec(config.exec, function(error, stdout, stderr) {
		if (error !== null) {
			console.log("exec error: " + error + stderr);
			process.exit(1);
		} else if( stdout ) {
			request({
				url: config.api+"authenticate",
				method: "POST",
				json: true,
				headers: {
					"User-Agent": "t6 javascript file "+argv.run,
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: config.isAdmin===true?auth_admin:auth
			}, function (error, response, body) {
				//console.debug("BODY", config.isAdmin, config.isAdmin===true?auth_admin:auth);
				if ( body ) {
					bearer = body.token!==undefined?body.token:null;
					if ( bearer && !error ) {
						var body = {value: stdout, timestamp: timestamp, object_id: config.object_id, publish: config.publish, save: config.save, unit: config.unit, mqtt_topic: config.mqtt_topic, meta: config.meta, };
						request({
							url: config.api+"data/"+config.flow_id,
							method: "POST",
							json: true,
							headers: {
								"User-Agent": "t6 javascript file "+argv.run,
								"Accept": "application/json",
								"Content-Type": "application/json",
								"Authorization": "Bearer "+bearer,
							},
							body: body
						}, function (error, response, body){
							console.log("error", error);
							console.log("body", body);
							console.log("response.headers.location", response.headers.location);
							console.log("response.body", response.body);
						});
					} else {
						console.log("JWT error: " + bearer);
						process.exit(1);
					}
				} else {
					console.log("There is no Body");
					process.exit(1);
				}
			});
		} else {
			console.log("exec error: " + error + stderr);
			process.exit(1);
		}
	});
} else if( config.postDataPoint === false ) {
	request({
		url: config.api+"authenticate",
		method: "POST",
		json: true,
		headers: {
			"User-Agent": "t6 javascript file "+argv.run,
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: config.isAdmin===true?auth_admin:auth
	}, function (error, response, body) {
		//console.debug("BODY", config.isAdmin, config.isAdmin===true?auth_admin:auth);
		bearer = body!==undefined?body.token:null;
		if ( bearer && !error ) {
			request({
				url: config.api_endpoint,
				method: config.api_verb,
				json: true,
				headers: {
					"User-Agent": "t6 javascript file "+argv.run,
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": "Bearer "+bearer,
				},
				body: body
			}, function (error, response, body){
				console.log("statusCode: "+response.statusCode + " <"+argv.run+">");
				console.log(body);
			});
		} else {
			console.log("JWT error: " + bearer);
			process.exit(1);
		}
	});
}
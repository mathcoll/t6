"use strict";
var express = require("express");
var router = express.Router();
var tokens;
var users;

function getUuid() {
	return uuid.v4();
}
function getTs() {
	return moment().format("X");
}
function getDate() {
	return moment().format("MMMM Do YYYY, H:mm:ss");
}
function getIsoDate() {
	return moment().toISOString();
}
function getDataItem(delay) {
	let dataItem = {
		"meta": {
			"id": getUuid(),
			"timestamp": getTs()-3600*delay
		},
		"user_id": getUuid(),
		"environment": process.env.NODE_ENV,
		"dtepoch": getTs(),
		"value": getUuid(),
		"flow": getUuid(),
		"datetime": getIsoDate()
	};
	return dataItem;
}

let result = {
	data: {
		accessToken: "b29a71b4c58c22af116578a6be6402d2",
		samples: {
			triggers: {
				eventTrigger: {
					user_id: getUuid(),
					environment: process.env.NODE_ENV,
					dtepoch: getTs(),
					value: getUuid(),
					flow: getUuid(),
					datetime: getIsoDate()
				}
			}
		}
	}
};
let resultUser = {
	data: {
		"name": "John Doe",
		"id": getUuid(),
		"url": "http://example.com/users/"+getUuid()
	}
};

router.get("/OAuth2/authorize", function (req, res) {
	let client_id = req.query.client_id;
	let response_type = req.query.response_type;
	let redirect_uri = req.query.redirect_uri;
	let scope = req.query.scope;
	let state = req.query.state;
	let application_name = req.query.application_name;
	let SCOPE_DESCRIPTIONS = {
		"ifttt": "Event when Datapoint is posted to t6.",
	};
	if ( client_id === ifttt.serviceClientId && req.session.user_id ) {
		users	= db.getCollection("users");
		var queryU = { "id": req.session.user_id };
		var user = users.findOne(queryU);
		if ( user ) {
			// Add the code to the connected user
			let code = passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.");
			user.iftttCode = code; // We add the unic token to the user

			var payload = JSON.parse(JSON.stringify(user));
			payload.unsubscription = user.unsubscription;
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.token_type = "Bearer";
			payload.scope = "Application";
			payload.sub = "/users/"+user.id;

			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: moment().add(24, "years").format("X") });
			var new_token = {
				user_id:			user.id,
				key:		code,
				bearer:				token,
				memo:				"Ifttt No-end Bearer Token", // Not sure this is compatible nor necessary
				// or maybe it should be the "code" above ????
				expiration:			moment().add(24, "years").format("x"),
			};
			var tokens	= db.getCollection("tokens");
			tokens.insert(new_token);
			db.save();
			
			res.render("authorization", {
				response_type: response_type,
				redirect_uri: redirect_uri,
				scope: scope,
				state: state,
				code: code,
				user: typeof user!=="undefined"?user:resultUser.data,
				application_name: application_name,
				SCOPE_DESCRIPTIONS: SCOPE_DESCRIPTIONS,
			});
		} else {
			res.status(403).send({ "errors": {"message": ["Invalid user_id"]} });
		}
	} else {
		res.render("login", {});
	}

});

router.post("/OAuth2/token", function(req, res) {
	let grant_type = req.body.grant_type;
	let code = req.body.code;
	let client_id = req.body.client_id;
	let client_secret = req.body.client_secret;
	let redirect_uri = req.body.redirect_uri;

	users	= db.getCollection("users");
	var queryU = { "iftttCode": code };
	var user = users.findOne(queryU);
	if ( user && client_secret === ifttt.serviceSecret && client_id === ifttt.serviceClientId ) {
		var tokens	= db.getCollection("tokens");
		var queryT = { "$and": [
			{ "user_id" : user.id },
			{ "key": code },
			{ "expiration" : { "$gt": moment().format("x") } }, // Actually, it should be very very long last Token here
			{ "expiration" : { "$ne": "" } },
		]}
		var token = tokens.findOne(queryT);
		if ( token ) {
			res.status(200).send( {"token_type": "Bearer", "access_token": token.bearer} );
		} else {
			res.status(401).send({ "errors": {"message": ["No Bearer found"+user+code]} });
		}
	} else {
		res.status(401).send({ "errors": {"message": ["Invalid authorization code"]} });
	}
});

router.get("/v1/status", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	if ( ChannelKey == ServiceKey && ChannelKey === ifttt.serviceKey ) {
		res.status(200).send(result);
	} else {
		res.status(401).send({ "errors": [{"message": "Not Authorized"}] });
	}
});

router.get("/v1/user/destroy-session", function (req, res) {
	req.session.destroy(function(err) {
		res.redirect(req.header("Referer") || "/");
	})
});

router.get("/v1/user/info", function (req, res) {
	let authorization = req.headers["authorization"];
	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( bearer === result.data.accessToken ) {
		res.status(200).send(resultUser);
	} else {
		jwt.verify(bearer, jwtsettings.secret, function(err, decoded) {
			if ( !err && decoded ) {
				res.status(200).send({
					data: {
						"name": decoded.firstName+" "+decoded.lastName,
						"id": decoded.id,
						"url": "https://en.gravatar.com/" + decoded.mail_hash + ".json"
					}
				});
			} else {
				res.status(401).send({ "errors": [{"message": "Not Authorized"}] });
			}
		});
	}
});

router.post("/v1/test/setup", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	if ( ChannelKey == ServiceKey && ChannelKey === ifttt.serviceKey ) {
		res.status(200).send(result);
	} else {
		res.status(401).send({ "errors": [{"message": "Not Authorized"}] });
	}
});

router.post("/v1/triggers/eventTrigger", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	let authorization = req.headers["authorization"];
	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( (bearer && bearer === result.data.accessToken) || (ChannelKey == ServiceKey && ChannelKey === ifttt.serviceKey) ) {
		let resultT = {
			data:[],
			eventTrigger: result.data.samples.triggers.eventTrigger
		};
		let limit = parseInt(req.body.limit, 10);
		if (!limit && limit !== 0) { limit = 3; }
		if (limit==0) { limit = 0; }
		if (limit>10) { limit = 3; }
		for (let i=0; i<limit; i++) {
			(resultT.data).push(getDataItem(i));
		}

		if ( req.body.triggerFields && typeof req.body.triggerFields.user_id !== "undefined" ) {
			//console.log("resultT", resultT);
			res.status(200).send(resultT);
		} else {
			res.status(400).send({ "errors": [ {"status": "SKIP", "message": "missing Trigger Fields/key"} ] });
		}

	} else if(bearer) {
		jwt.verify(bearer, jwtsettings.secret, function(err, decoded) {
			if( !err && decoded ) {
				users	= db.getCollection("users");
				let queryU = { "id": decoded.id };
				console.log(queryU);
				let user = users.findOne(queryU);
				user.iftttTrigger_identity = req.body.trigger_identity;
				let resultSuccess = {
					data:[
						{
							"meta": {
								"id": user.id,
								"timestamp": getTs()
							},
							"user_id": user.id,
							"environment": process.env.NODE_ENV,
							"dtepoch": getTs(),
							"value": getUuid(),
							"flow": getUuid(),
							"datetime": getIsoDate()
						}
					],
					eventTrigger: {
						user_id: user.id,
						environment: process.env.NODE_ENV,
						dtepoch: getTs(),
						value: "1234 FAKE",
						flow: "FAKE flow",
						datetime: getIsoDate()
					}
				};
				console.log("resultSuccess");
				console.log(JSON.stringify(resultSuccess, null, 2));
				res.status(200).send( resultSuccess );
			} else {
				res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
			}
		});
	} else {
		res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
	}
});

router.delete("/v1/triggers/eventTrigger/trigger_identity/:trigger_identity([0-9a-z\-]+)", function (req, res) {
	let authorization = req.headers["authorization"];
	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( bearer && bearer === result.data.accessToken ) {
		res.status(201).send( {} ); // FAKE MODE
	} else {
		jwt.verify(bearer, jwtsettings.secret, function(err, decoded) {
			if( !err && decoded ) {
				users	= db.getCollection("users");
				let queryU = { "$and": [
					{ "id": decoded.id },
					{ "iftttTrigger_identity": req.params.trigger_identity },
				]};
				let user = users.findOne(queryU);
				user.iftttCode = null;
				user.iftttTrigger_identity = null;
				res.status(201).send({ "errors": [ ] });
			} else {
				res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
			}
		});
	}
});

module.exports = router;
"use strict";
var express = require("express");
var router = express.Router();
let SCOPE_DESCRIPTIONS = {
	"ifttt": "Event when Datapoint is posted to t6.",
	"email": "User email.",
	"ghome": "."
};

function getUuid() {
	return uuid.v4();
}
function getTs() {
	return moment().format("x");
}
function getDate() {
	return moment().format("MMMM Do YYYY, H:mm:ss");
}
function getIsoDate() {
	return moment().toISOString();
}
function getDataItem(delay, userId) {
	let user_id = typeof userId!=="undefined"?userId:getUuid();
	let dataItem = {
		"meta": {
			"id": getTs()-3600*delay,
			"timestamp": parseInt(moment((getTs()-3600*delay)/1000).format("x"), 10)
		},
		"user_id": user_id,
		"environment": process.env.NODE_ENV,
		"dtepoch": getTs(),
		"value": "Fake data "+getUuid(),
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
	if ( client_id === ifttt.serviceClientId && req.session.user_id ) {
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

			var token = jsonwebtoken.sign(payload, jwtsettings.secret, { expiresIn: moment().add(24, "years").format("x") });
			var new_token = {
				user_id:			user.id,
				key:				code,
				bearer:				token,
				memo:				"Ifttt No-end Bearer Token", // Not sure this is compatible nor necessary
				// or maybe it should be the "code" above ????
				expiration:			moment().add(24, "years").format("x"),
			};
			access_tokens.insert(new_token);
			var tokens	= db_access_tokens.getCollection("accesstokens");
			var expired = tokens.find(
				{ "$and": [
					{ "expiration" : { "$lt": moment().format("x") } },
					{ "expiration" : { "$ne": "" } },
				]}
			);
			if ( expired ) {
				tokens.remove(expired);
				db_access_tokens.save();
			}
			db_access_tokens.save();
			
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
		res.render("login", {redirect_uri: redirect_uri});
	}
});

router.post("/OAuth2/authorize", function (req, res) {
	let client_id = req.body.client_id;
	let response_type = req.query.response_type;
	let redirect_uri = req.query.redirect_uri;
	let scope = req.query.scope;
	let state = req.query.state;
	let application_name = req.query.application_name;
	if ( (req.body.Username && req.body.Password) && (!req.body.grant_type || req.body.grant_type === "password") ) {
		var email = req.body.Username;
		var password = req.body.Password;

		var queryU = { "$and": [ { "email": email } ] };
		var user = users.findOne(queryU);
		if ( user ) {
			if ( bcrypt.compareSync(password, user.password) || md5(password) === user.password ) {
				req.session.user_id = user.id;
				// Add the code to the connected user
				let code = passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.");
				user.iftttCode = code; // We add the unique token to the user
				t6console.debug("User.id", user.id);
				t6console.debug("user.iftttCode", user.iftttCode);
				db_users.save();
				// Is is necessary to store token on the user db ? or can wen only store it to access_tokens ?

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

				var token = jsonwebtoken.sign(payload, jwtsettings.secret, { expiresIn: moment().add(24, "years").format("x") });
				var new_token = {
					user_id:			user.id,
					key:				code,
					bearer:				token,
					memo:				"Ifttt very long life Bearer Token",
					expiration:			moment().add(24, "years").format("x"),
				};
				access_tokens.insert(new_token);
				var tokens	= db_access_tokens.getCollection("accesstokens");
				var expired = tokens.find(
					{ "$and": [
						{ "expiration" : { "$lt": moment().format("x") } },
						{ "expiration" : { "$ne": "" } },
					]}
				);
				if ( expired ) {
					access_tokens.remove(expired);
					db_access_tokens.save();
				}
				db_access_tokens.save();
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
				res.status(403).send({ "errors": {"message": ["Invalid Username+Password"]} });
			}
		} else {
			res.status(404).send({ "errors": {"message": ["User not found"]} });
		}
	} else {
		res.status(412).send({ "errors": {"message": ["Invalid Username+Password"]} });
	}
});

router.post("/OAuth2/token", function(req, res) {
	let grant_type = req.body.grant_type;
	let code = req.body.code;
	let client_id = req.body.client_id;
	let client_secret = req.body.client_secret;
	let redirect_uri = req.body.redirect_uri;

	var queryU = { "iftttCode": code };
	var user = users.findOne(queryU);
	if ( user && client_id === ifttt.serviceClientId ) { // && client_secret === ifttt.serviceSecret
		var tokens	= db_access_tokens.getCollection("accesstokens");
		var queryT = { "$and": [
			{ "user_id" : user.id },
			{ "key": code },
			{ "expiration" : { "$gt": moment().format("x") } }, // Actually, it should be very very long last Token here
			{ "expiration" : { "$ne": "" } },
		]};
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

router.get("/ifttt/v1/status", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	if ( ChannelKey === ServiceKey && ChannelKey === ifttt.serviceKey ) {
		res.status(200).send(result);
	} else {
		res.status(401).send({ "errors": [{"message": "Not Authorized"}] });
	}
});

router.get("/OAuth2/destroy-session", function (req, res) {
	req.session.destroy(function(err) {
		res.render("login", {});
	});
});

router.get("/ifttt/v1/user/info", function (req, res) {
	let authorization = req.headers["authorization"];
	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( bearer === result.data.accessToken ) {
		res.status(200).send(resultUser);
	} else {
		jsonwebtoken.verify(bearer, jwtsettings.secret, function(err, decoded) {
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

router.post("/ifttt/v1/test/setup", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	if ( ChannelKey == ServiceKey && ChannelKey === ifttt.serviceKey ) {
		res.status(200).send(result);
	} else {
		res.status(401).send({ "errors": [{"message": "Not Authorized"}] });
	}
});

router.post("/ifttt/v1/triggers/eventTrigger", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	let authorization = req.headers["authorization"];
	let retention = typeof req.body?.triggerFields?.retention!=="undefined"?req.body.triggerFields.retention:"autogen";
	let limit = typeof req.body.limit!=="undefined"?parseInt(req.body.limit, 10):50;
	let flow_id = req.body?.triggerFields?.flow;
	let where = "";
	let group_by = "";
	let sorting = "DESC";
	let page = 1;

	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( (bearer && bearer === result.data.accessToken) || (ChannelKey === ServiceKey && ChannelKey === ifttt.serviceKey) ) {
		t6console.debug("Use case 1");
		let resultT = {
			data:[],
			eventTrigger: result.data.samples.triggers.eventTrigger
		};

		if ( req.body.triggerFields && typeof req.body.triggerFields.user_id !== "undefined" ) {
			//t6console.log("resultT" + resultT);
			let limit = parseInt(req.body.limit, 10);
			if (!limit && limit !== 0) { limit = 3; }
			if (limit===0) { limit = 0; }
			if (limit>10) { limit = 3; }
			for (let i=0; i<limit; i++) {
				(resultT.data).push(getDataItem(i, req.body.triggerFields.user_id));
			}
			resultT.eventTrigger.user_id = req.body.triggerFields.user_id;
			res.status(200).send(resultT);
		} else {
			res.status(400).send({ "errors": [ {"status": "SKIP", "message": "missing Trigger Fields/key"} ] });
		}

	} else if(bearer) {
		t6console.debug("Use case 2");
		jsonwebtoken.verify(bearer, jwtsettings.secret, function(err, decoded) {
			if( !err && decoded ) {
				let queryU = { "id": decoded.id };
				t6console.debug(queryU);
				let user = users.findOne(queryU);
				let eventTriggers = [];
				if (isNaN(limit)) {
					limit = 50;
				} else if (limit > 5000) {
					limit = 5000;
				} else if (limit < 1) {
					limit = 1;
				}
				/* Duplicate code for testing */
					let flow = flows.chain().find({ "id" : { "$aeq" : flow_id } }).limit(1);
					let join = flow.eqJoin(units.chain(), "unit", "id");
					flow = typeof (flow.data())[0]!=="undefined"?(flow.data())[0].left:undefined;

					let flowDT = flows.chain().find({id: flow_id,}).limit(1);
					let joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
					let datatype = typeof (joinDT.data())[0]!=="undefined"?(joinDT.data())[0].right.name:null;
					let fields;
					fields = getFieldsFromDatatype(datatype, true, true);

					let rp = typeof retention!=="undefined"?retention:"autogen";
					if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
						if ( typeof flow!=="undefined" && flow.retention ) {
							if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
								rp = flow.retention;
							} else {
								rp = influxSettings.retentionPolicies.data[0];
								t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
								res.status(412).send(new ErrorSerializer({"id": 2057, "code": 412, "message": "Precondition Failed"}).serialize());
								return;
							}
						} else {
							rp = influxSettings.retentionPolicies.data[0];
							t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
						}
					}

					t6console.debug("Retention is valid:", rp);
					let query = sprintf("SELECT %s FROM %s.data WHERE flow_id='%s' %s %s ORDER BY time %s LIMIT %s OFFSET %s", fields, rp, flow_id, where, group_by, sorting, limit, (page-1)*limit);
					t6console.debug("Query to get latest results on Db:", query);

					dbInfluxDB.query(query).then((data) => {
						if ( data.length > 0 ) {
							data.map(function(d) {
								eventTriggers.push({
									user_id: user.id,
									environment: process.env.NODE_ENV,
									dtepoch: Date.parse(d.time),
									value: d.value,
									flow: flow_id,
									datetime: moment(d.time).toISOString(),
									meta: {
										"id": Date.parse(d.time),
										"timestamp": moment(d.time).format("x")/1000
									}
								});
							});
						}
						let resultSuccess = { "data": eventTriggers };
						t6console.debug("Requested:", JSON.stringify(req.body, null, 2));
						t6console.debug("Result:", JSON.stringify(resultSuccess, null, 2));
						res.status(200).send( resultSuccess );
					});
				/* Duplicate code for testing */
				user.iftttTrigger_identity = req.body.trigger_identity; // What for ?
			} else {
				res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
			}
		});
	} else {
		t6console.debug("Use case 3");
		res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
	}
});

router.delete("/ifttt/v1/triggers/eventTrigger/trigger_identity/:trigger_identity([0-9a-z\-]+)", function (req, res) {
	let authorization = req.headers["authorization"];
	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( bearer && bearer === result.data.accessToken ) {
		res.status(201).send( {} ); // FAKE MODE
	} else {
		jsonwebtoken.verify(bearer, jwtsettings.secret, function(err, decoded) {
			if( !err && decoded ) {
				let queryU = { "$and": [
					{ "id": decoded.id }
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
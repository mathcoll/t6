"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");

var timeoutNotification;
function sendNotification(pushSubscription, payload) {
	t6notifications.sendPush(pushSubscription, payload);
	clearTimeout(timeoutNotification);
}

/**
 * @apiDefine 200
 * @apiSuccess 200 Success
 * @apiSuccessExample 200 Response
 *     HTTP/1.1 200 Success
 *     {
 *     }
 */

/**
 * @apiDefine 201
 * @apiSuccess 201 Created
 * @apiSuccessExample 201 Response
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Created",
 *       "id": "",
 *       "code": 201
 *     }
 */

/**
 * @apiDefine 202
 * @apiSuccess 202 Accepted
 * @apiSuccessExample 202 Response
 *     HTTP/1.1 202 Accepted
 *     {
 *     }
 */

/**
 * @apiDefine 204
 * @apiSuccess 204 No Content
 * @apiSuccessExample 204 Response
 *     HTTP/1.1 204 No Content
 *     {
 *     }
 */

/**
 * @apiDefine 400
 * @apiError 400 Bad Request, require a Bearer Authentication or revision is incorrect.
 * @apiErrorExample 400 Response
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Bad Request",
 *       "id": "",
 *       "code": 400
 *     }
 */

/**
 * @apiDefine 401
 * @apiError 401 Require a Bearer Authentication.
 * @apiErrorExample 401 Response
 *     HTTP/1.1 401 Not Authorized
 *     {
 *       "message": "Not Authorized",
 *       "id": "",
 *       "code": 401
 *     }
 */

/**
 * @apiDefine 401sign
 * @apiError 401sign Signature is invalid and required.
 * @apiErrorExample 401sign Response
 *     HTTP/1.1 401 Invalid Signature
 *     {
 *       "message": "Invalid Signature",
 *       "id": "",
 *       "code": 401
 *     }
 */

/**
 * @apiDefine 403
 * @apiError 403 Forbidden - Token used in transaction is not valid. Check your token and/or permission.
 * @apiErrorExample 403 Response
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Forbidden",
 *       "id": "",
 *       "code": 403
 *     }
 */

/**
 * @apiDefine 404
 * @apiError 404 Not Found - We couldn"t find the resource you are trying to access.
 * @apiErrorExample 404 Response
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Not Found",
 *       "id": "",
 *       "code": 404
 *     }
 */

/**
 * @apiDefine 405
 * @apiError 405 Method Not Allowed - API endpoint does not accept the method used.
 * @apiErrorExample 405 Response
 *     HTTP/1.1 405 Method Not Allowed
 *     {
 *       "message": "Not Authorized",
 *       "id": "",
 *       "code": 405
 *     }
 */

/**
 * @apiDefine 409
 * @apiError 409 conflict.
 * @apiErrorExample 409 Response
 *     HTTP/1.1 409 conflict
 *     {
 *       "message": "conflict",
 *       "id": "",
 *       "code": 409
 *     }
 */

/**
 * @apiDefine 412
 * @apiError 412 Precondition Failed.
 * @apiErrorExample 412 Response
 *     HTTP/1.1 412 Precondition Failed
 *     {
 *       "message": "Precondition Failed",
 *       "id": "",
 *       "code": 412
 *     }
 */

/**
 * @apiDefine 429
 * @apiError 429 Too Many Requests.
 * @apiErrorExample 429 Response
 *     HTTP/1.1 429 Too Many Requests
 *     {
 *       "message": "Too Many Requests",
 *       "id": "",
 *       "code": 429
 *     }
 */

/**
 * @apiDefine 500
 * @apiError 500 Internal Error.
 * @apiErrorExample 500 Response
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Internal Error",
 *       "id": "",
 *       "code": 500
 *     }
 */

/**
 * @apiDefine Auth
 * @apiHeader {String} Authorization Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept] application/json
 * @apiHeader {String} [Content-Type] application/json
 */

/**
 * @apiDefine AuthAdmin Admin access rights needed.
 * Only t6 Administrator user have permission to this Endpoint.
 * 
 * @apiHeader {String} Authorization Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept] application/json
 * @apiHeader {String} [Content-Type] application/json
 */

//catch API calls for quotas
router.all("*", function (req, res, next) {
	var o = {
		key:		typeof req.user!=="undefined"?req.user.key:"",
		secret:		typeof req.user!=="undefined"?req.user.secret:null,
		user_id:	typeof req.user!=="undefined",
		session_id:	typeof req.user!=="undefined"?req.user.session_id:null,
		verb:		req.method,
		url:		req.originalUrl,
		date:		moment().format("x")
	};
	if ( !req.user && req.headers.authorization ) {
		var jwtdecoded = jwt.decode(req.headers.authorization.split(" ")[1]);
		req.user = jwtdecoded;
	}
	
	let rp = typeof influxSettings.retentionPolicies.requests!=="undefined"?influxSettings.retentionPolicies.requests:"quota7d";
	if ( req.headers.authorization && req.user ) {
		var limit = req.user!==null?(quota[req.user.role]).calls:-1;
		if (req.user !== null && req.user.role  !== null ) {
			res.header("X-RateLimit-Limit", limit);
		}
		var i;
		let user_id = typeof req.user.id!=="undefined"?req.user.id:o.user_id;
		var query = `SELECT count(url) FROM "${influxSettings.retentionPolicies.requests}"."requests" WHERE (user_id='${user_id}') AND (time>now() - 7d) LIMIT 1`;

		dbInfluxDB.query(query).then(data => {
			i = typeof data[0]!=="undefined"?data[0].count:0;
			if ( limit-i > 0 ) {
				res.header("X-RateLimit-Remaining", limit-i);
				//res.header("X-RateLimit-Reset", "");
			}
			res.header("Cache-Control", "no-cache, max-age=360, private, must-revalidate, proxy-revalidate");
			if( (req.user && i >= limit) ) {
				t6events.add("t6Api", "api 429", typeof req.user.id!=="undefined"?req.user.id:o.user_id, typeof req.user.id!=="undefined"?req.user.id:o.user_id);
				return res.status(429).send(new ErrorSerializer({"id": 99, "code": 429, "message": "Too Many Requests"}));
			} else {
				var tags = {rp: rp, user_id: typeof req.user.id!=="undefined"?req.user.id:o.user_id, session_id: typeof o.session_id!=="undefined"?o.session_id:null, verb: o.verb, environment: process.env.NODE_ENV };
				var fields = {url: o.url};

				req.session.cookie.secure = true;
				req.session.user_id = req.user.id;

				let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
				dbWrite.writePoints([{
					measurement: "requests",
					tags: tags,
					fields: fields,
				}], { precision: "s", retentionPolicy: rp })
				.then(err => {
					if (err) {
						t6console.error(
							sprintf(
								"Error on writePoints to influxDb %s",
								{"err": err, "tags": tags, "fields": fields[0]}
							)
						);
					}
					next();
				}).catch(err => {
					t6console.error(
						sprintf(
							"Error catch on writting to influxDb %s",
							{"err": err, "tags": tags, "fields": fields[0]}
						)
					);
					next();
				});
			}
		}).catch(err => {
			if(typeof i!=="undefined") {
				return res.status(429).send(new ErrorSerializer({"id": 101, "code": 429, "message": "Too Many Requests; or we can\"t perform your request."}));
			} else {
				next();
			}
		});
	} else {
		var tags = {rp: rp, user_id: "anonymous", session_id: typeof o.session_id!=="undefined"?o.session_id:null, verb: o.verb, environment: process.env.NODE_ENV };
		var fields = {url: o.url};
		let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
		dbWrite.writePoints([{
			measurement: "requests",
			tags: tags,
			fields: fields,
		}], { precision: "s", retentionPolicy: rp }).then(err => {
			if (err) {
				t6console.error(
					sprintf(
						"Error on writePoints to influxDb for anonymous %s",
						{"err": err, "tags": tags, "fields": fields[0]}
					)
				);
			}
			next(); // no User Auth..
		}).catch(err => {
			t6console.error(
				sprintf(
					"Error catch on writePoints to influxDb for anonymous %s",
					{"err": err, "tags": tags, "fields": fields[0]}
				)
			);
			next(); // no User Auth..
		});
	}
});

function checkForTooManyFailure(req, res, email) {
	// Invalid Credentials
	var query = sprintf("SELECT count(*) FROM %s WHERE (what='user login failure') AND (who='%s') AND (time>now() - 1h)", t6events.getMeasurement(), email);
	dbInfluxDB.query(query).then(data => {
		if( typeof data==="object" && typeof data[0]!=="undefined" && data[0].count_who > 2 && data[0].count_who < 4 ) {
			// when >4, then we should block the account and maybe ban the IP address
			var geo = geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{};
			geo.ip = req.ip;

			var agent = useragent.parse(req.headers["user-agent"]);
			res.render("emails/loginfailure", {device: typeof agent.toAgent()!=="undefined"?agent.toAgent():"", geoip: geo}, function(err, html) {
				var to = email;
				var mailOptions = {
					from: from,
					bcc: typeof bcc!=="undefined"?bcc:null,
					to: to,
					user_id: "unknown",
					subject: "t6 warning notification",
					text: "Html email client is required",
					html: html
				};
				t6mailer.sendMail(mailOptions).then(function(info){
					t6console.info("info" + info);
				}).catch(function(error){
					t6console.error("t6mailer.sendMail error" + error.info.code + error.info.response + error.info.responseCode + error.info.command);
				});
			});
		}
	}).catch(err => {
		t6console.error(err);
	});
	t6events.add("t6App", "user login failure", email, email);
}

/**
 * @api {delete} /tokens/all Clean and delete all expired users tokens
 * @apiName Clean and delete all expired users tokens
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiUse 201
 * @apiUse 403
 */
router.delete("/tokens/all", function (req, res) {
	if ( req.user.role === "admin" ) {
		tokens	= db_tokens.getCollection("tokens");
		var expired = tokens.find( { "$and": [{ "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } } ]} );
		if ( expired ) {
			tokens.remove(expired);
			db_tokens.save();
		}
		return res.status(201).json( {status: "ok", "cleaned": expired.length} );
	} else {
		res.status(403).send(new ErrorSerializer({"id": 102.0, "code": 403, "message": "Forbidden, You should be an Admin!"}).serialize());
	}
});

/**
 * @api {post} /authenticate Authenticate - get JWT Token
 * @apiName Authenticate - get JWT Token
 * @apiDescription The authenticate endpoint provide you an access token which is multiple use but expiring within 5 minutes.
 * Once it has expired an access_token can be refreshed to extend duration or you can generate a new one from this authenticate endpoint.
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiParam {String="password","refresh_token","access_token"} grant_type="password" Grant type is either "password" (default) to authenticate using your own credentials, or "refresh_token" to refresh a token before it expires.
 * @apiParam {String} [username] Your own username
 * @apiParam {String} [password] Your own password
 * @apiParam {String} [key=undefined] In "access_token" context, Client Api Key
 * @apiParam {String} [secret=undefined] In "access_token" context, Client Api Secret
 * @apiParam {String} [refresh_token=undefined] The refresh_token you want to use in order to get a new token
 * 
 * @apiSuccess {String} status Status of the Authentication
 * @apiSuccess {String} token JWT Token
 * @apiSuccess {timestamp} tokenExp Expiration timestamp of the JWT Token
 * @apiSuccess {String} refresh_token Token that can be used to refresh the Token
 * @apiSuccess {timestamp} refreshTokenExp Expiration timestamp of the Refresh Token
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 * @apiUse 500
 */
router.post("/authenticate", function (req, res) {
	var pushSubscription = req.body.pushSubscription;
	if ( (req.body.username && req.body.password) && (!req.body.grant_type || req.body.grant_type === "password") ) {
		var email = req.body.username;
		var password = req.body.password;

		var queryU = { "$and": [ { "email": email } ] };
		//t6console.debug(queryU);
		var user = users.findOne(queryU);
		if ( user && typeof user.password!=="undefined" ) {
			if ( bcrypt.compareSync(password, user.password) || md5(password) == user.password ) {
				var geo = geoip.lookup(req.ip);
				if ( typeof user.location === "undefined" || user.location === null ) {
					user.location = {geo: geo, ip: req.ip,};
				}
				/* pushSubscription */
				if ( typeof pushSubscription !== "undefined" ) {
					var payload = "{\"type\": \"message\", \"title\": \"Successfully auth\", \"body\": \"Welcome back to t6! Enjoy.\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
					timeoutNotification = setTimeout(sendNotification, 5000, pushSubscription, payload);
					user.pushSubscription = pushSubscription;
				}
				users.update(user);
				db_users.save();

				req.session.cookie.secure = true;
				req.session.cookie.user_id = user.id;

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

				let tokenExp = moment().add(jwtsettings.expiresInSeconds, "seconds").format("x");
				if ( user.location && user.location.ip ) {
					payload.iss = req.ip+" - "+user.location.ip;
				}
				if(req.headers && req.headers["user-agent"] && (req.headers["user-agent"]).indexOf("t6iot-library") > -1) {
					payload.location = undefined;
					payload.unsubscription_token = undefined;
					payload.passwordLastUpdated = undefined;
					payload.iftttCode = undefined;
					payload.pushSubscription = undefined;
					payload.reminderMail = undefined;
					payload.changePassword = undefined;
					payload.newsletter = undefined;
				}
				var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: tokenExp });

				var refreshPayload = crypto.randomBytes(40).toString("hex");
				var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("x");

				var agent = useragent.parse(req.headers["user-agent"]);
				let t = {
						user_id: user.id,
						refresh_token: refreshPayload,
						expiration: refreshTokenExp,
						"user-agent": {
							"agent": agent.toAgent(),
							"string": agent.toString(),
							"version": agent.toVersion(),
							"os": agent.os.toString(),
							"osVersion": agent.os.toVersion(),
						},
						"device": agent.device.toString(),
						"geo": geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{},
				};
				tokens.insert(t);
				var expired = tokens.find( { "$and": [{ "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } } ]} );
				if ( expired ) {
					tokens.remove(expired);
					db_tokens.save(); // There might be a bug here. not the same tokens !
				}

				var refresh_token = user.id + "." + refreshPayload;
				t6events.add("t6App", "POST_authenticate", user.id, user.id);
				return res.status(200).json( {status: "ok", token: token, tokenExp: tokenExp, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
			} else {
				checkForTooManyFailure(req, res, email);
				return res.status(403).send(new ErrorSerializer({"id": 102.11, "code": 403, "message": "Forbidden"}).serialize());
			}
		} else {
			t6console.debug("No user found or no password set yet.");
			return res.status(403).send(new ErrorSerializer({"id": 102.21, "code": 403, "message": "Forbidden"}).serialize());
		}
	} else if ( ( req.body.key && req.body.secret ) && req.body.grant_type === "access_token" ) {
		var queryT = {
		"$and": [
					{ "key": req.body.key },
					{ "secret": req.body.secret },
				]
		};
		var u = access_tokens.findOne(queryT);
		if ( u && typeof u.user_id !== "undefined" ) {
			var user = users.findOne({id: u.user_id});
			var geo = geoip.lookup(req.ip);
			if ( typeof user.location === "undefined" || user.location === null ) {
				user.location = {geo: geo, ip: req.ip,};
			}
			/* pushSubscription */
			if ( typeof pushSubscription !== "undefined" ) {
				var payload = "{\"type\": \"message\", \"title\": \"Successfully auth\", \"body\": \"Welcome back to t6! Enjoy.\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
				timeoutNotification = setTimeout(sendNotification, 5000, pushSubscription, payload);
				user.pushSubscription = pushSubscription;
			}
			//users.update(user);
			//db_users.save();
			
			if ( typeof user.location === "undefined" || user.location === null ) {
				user.location = {geo: geo, ip: req.ip,};
			}
			users.update(user);
			db_users.save();

			var payload = JSON.parse(JSON.stringify(user));
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.token_type = "Bearer";
			payload.scope = "ClientApi";
			payload.sub = "/users/"+user.id;
			
			if ( user.location && user.location.ip ) {
				payload.iss = req.ip+" - "+user.location.ip;
			}
			let tokenExp = moment().add(jwtsettings.expiresInSeconds, "seconds").format("x");
			if(req.headers && req.headers["user-agent"] && (req.headers["user-agent"]).indexOf("t6iot-library") > -1) {
				payload.location = undefined;
				payload.unsubscription_token = undefined;
				payload.passwordLastUpdated = undefined;
				payload.iftttCode = undefined;
				payload.pushSubscription = undefined;
				payload.reminderMail = undefined;
				payload.changePassword = undefined;
				payload.newsletter = undefined;
			}
			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: tokenExp });

			var refreshPayload = crypto.randomBytes(40).toString("hex");
			var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("x");

			var agent = useragent.parse(req.headers["user-agent"]);
			let t = {
					user_id: user.id,
					refresh_token: refreshPayload,
					expiration: refreshTokenExp,
					"user-agent": {
						"agent": agent.toAgent(),
						"string": agent.toString(),
						"version": agent.toVersion(),
						"os": agent.os.toString(),
						"osVersion": agent.os.toVersion(),
					},
					"device": agent.device.toString(),
					"geo": geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{},
			};
			tokens.insert(t);
			var expired = tokens.find( { "$and": [{ "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } } ]} );
			if ( expired ) {
				tokens.remove(expired);
				db_tokens.save();
			}

			var refresh_token = user.id + "." + refreshPayload;
			t6events.add("t6App", "POST_authenticate", user.id, user.id);
			return res.status(200).json( {status: "ok", token: token, tokenExp: tokenExp, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
		} else {
			return res.status(403).send(new ErrorSerializer({"id": 102.32, "code": 403, "message": "Forbidden"}).serialize());
		}
	} else if ( req.body.refresh_token && req.body.grant_type === "refresh_token" ) {
		var user_id = req.body.refresh_token.split(".")[0];
		var token = req.body.refresh_token.split(".")[1];

		var queryT = {
			"$and": [
						{ "user_id": user_id },
						{ "refresh_token": token },
						{ "expiration": { "$gte": moment().format("x") } },
					]
		};
		if ( user_id && token && tokens.findOne(queryT) ) {
			// Sign a new token
			var user = users.findOne({ "id": user_id });
			var geo = geoip.lookup(req.ip);
			if ( typeof user.location === "undefined" || user.location === null ) {
				user.location = {geo: geo, ip: req.ip,};
			}
			users.update(user);
			db_users.save();

			var payload = JSON.parse(JSON.stringify(user));
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.token_type = "Bearer";
			payload.scope = "ClientApi";
			payload.sub = "/users/"+user.id;

			let tokenExp = moment().add(jwtsettings.expiresInSeconds, "seconds").format("x");
			if(req.headers && req.headers["user-agent"] && (req.headers["user-agent"]).indexOf("t6iot-library") > -1) {
				payload.location = undefined;
				payload.unsubscription_token = undefined;
				payload.passwordLastUpdated = undefined;
				payload.iftttCode = undefined;
				payload.pushSubscription = undefined;
				payload.reminderMail = undefined;
				payload.changePassword = undefined;
				payload.newsletter = undefined;
			}
			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: tokenExp });
			var refreshPayload = crypto.randomBytes(40).toString("hex");
			var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("x");

			var agent = useragent.parse(req.headers["user-agent"]);
			let t = {
					user_id: user.id,
					refresh_token: refreshPayload,
					expiration: refreshTokenExp,
					"user-agent": {
						"agent": agent.toAgent(),
						"string": agent.toString(),
						"version": agent.toVersion(),
						"os": agent.os.toString(),
						"osVersion": agent.os.toVersion(),
					},
					"device": agent.device.toString(),
					"geo": geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{},
			};
			tokens.insert(t);
			/* Added the new refresh token, then we should remove the one used in the refresh process */
			let tQ = {
				"$and": [
					{ "user_id": user.id },
					{ "refresh_token": req.body.refresh_token.split(".")[1] },
				]
			};
			tokens.findAndRemove(tQ);
			var expired = tokens.find( { "$and": [{ "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } } ]} );
			if ( expired ) {
				tokens.remove(expired);
				db_tokens.save();
			}

			var refresh_token = user.id + "." + refreshPayload;
			t6events.add("t6App", "POST_authenticate", user.id, user.id);
			return res.status(200).json( {status: "ok", token: token, tokenExp: tokenExp, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
		} else {
			return res.status(403).send(new ErrorSerializer({"id": 102.43, "code": 403, "message": "Invalid Refresh Token"}).serialize());
		}
	} else {
		// TODO
		return res.status(400).send(new ErrorSerializer({"id": 102.33, "code": 400, "message": "Required param grant_type"}).serialize());
	}
});

/**
 * @api {post} /refresh Refresh a JWT Token
 * @apiName Refresh a JWT Token
 * @apiDescription This endpoint allows you to extend access_token expiration date. The extension is the same (5 minutes) as the authenticate endpoint.
 * 
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiHeader {String} Authorization Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept] application/json
 * @apiHeader {String} [Content-Type] application/json
 * 
 * @apiUse 200
 * @apiUse 403
 */
router.post("/refresh", function (req, res) {
	// get the refreshToken from body
	var refreshToken = req.body.refreshToken;
	// Find that refreshToken in Db
	tokens	= db_tokens.getCollection("tokens");
	var queryT = {
		"$and": [
					{ "refreshToken": refreshToken },
					{"expiration": { "$gte": moment().format("x") }},
				]
	};
	var expired = tokens.find( { "$and": [{ "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } } ]} );
	if ( expired ) {
		tokens.remove(expired);
		db_tokens.save();
	}
	var myToken = tokens.findOne(queryT);
	if ( !myToken ) {
		return res.status(403).send(new ErrorSerializer({"id": 109, "code": 403, "message": "Forbidden or Token Expired"}));
	} else {
		let user = users.findOne({ "id": myToken.user_id });
		if ( !user ) {
			return res.status(403).send(new ErrorSerializer({"id": 110, "code": 403, "message": "Forbidden or Token Expired"}));
		} else {
			var payload = JSON.parse(JSON.stringify(user));
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.token_type = "Bearer";
			payload.scope = "Application";
			payload.sub = "/users/"+user.id;
			payload.iss = req.ip+" - "+user.location.ip;
			let tokenExp = moment().add(jwtsettings.expiresInSeconds, "seconds").format("x");
			if((req.headers["user-agent"]).indexOf("t6iot-library") > -1) {
				payload.location = undefined;
				payload.unsubscription_token = undefined;
				payload.passwordLastUpdated = undefined;
				payload.iftttCode = undefined;
				payload.pushSubscription = undefined;
				payload.reminderMail = undefined;
				payload.changePassword = undefined;
				payload.newsletter = undefined;
			}
			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });

			// Add the refresh token to the list
			tokens	= db_tokens.getCollection("tokens");
			var refreshPayload = user.id + "." + crypto.randomBytes(40).toString("hex");
			var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("x");
			tokens.insert({ user_id: user.id, refreshToken: refreshPayload, expiration: refreshTokenExp, });
			t6events.add("t6App", "POST_refresh", user.id, user.id);
			return res.status(200).json( {status: "ok", token: token, refreshToken: refreshPayload, refreshTokenExp: refreshTokenExp} );
		}
	}
});

/**
 * @api {get} /status Get API Status
 * @apiName Get API Status
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 */
router.get("/status", function(req, res, next) {
	var status = {
		version: version,
		t6BuildVersion: t6BuildVersion,
		t6BuildDate: moment(t6BuildDate).format("DD/MM/Y H:mm:s"),
		status: "running",
		mqttInfo: mqttInfo,
		appName: process.env.NAME,
		started_at: moment(process.env.STARTED*1000).format("DD/MM/Y H:mm:s"),
		moduleLoadTime: moduleLoadEndTime-moduleLoadTime,
		startProcessTime: startProcessTime,
	};
	if ( typeof req.user!=="undefined" && req.user.role === "admin" ) {
		status.dbAll = {
			"objects": db_objects.getCollection("objects").count(),
			"flows": db_flows.getCollection("flows").count(),
			"users": db_users.getCollection("users").count(),
			"tokens": db_tokens.getCollection("tokens").count(),
			"access_tokens": db_access_tokens.getCollection("accesstokens").count(),
			"units": db_units.getCollection("units").count(),
			"datatypes": db_datatypes.getCollection("datatypes").count(),
			"rules": dbRules.getCollection("rules").count(),
			"snippets": dbSnippets.getCollection("snippets").count(),
			"dashboards": dbDashboards.getCollection("dashboards").count(),
			"sources": dbSources.getCollection("sources").count(),
			"otahistory": dbOtaHistory.getCollection("otahistory").count(),
			"uis": dbUis.getCollection("uis").count(),
			"jobs": dbJobs.getCollection("jobs").count(),
			"fusionbuffer": dbFusionBuffer.getCollection("measures").count(),
		};
	}
	if ( typeof req.user!=="undefined" && typeof req.user.id!=="undefined" ) {
		let u = {"user_id": req.user.id};
		status.db = {
			"objects": db_objects.getCollection("objects").find(u).length,
			"flows": db_flows.getCollection("flows").find(u).length,
			"users": 1,
			"tokens": db_tokens.getCollection("tokens").find(u).length,
			"access_tokens": db_access_tokens.getCollection("accesstokens").find(u).length,
			"units": db_units.getCollection("units").count(),
			"datatypes": db_datatypes.getCollection("datatypes").count(),
			"rules": dbRules.getCollection("rules").find(u).length,
			"snippets": dbSnippets.getCollection("snippets").find(u).length,
			"dashboards": dbDashboards.getCollection("dashboards").find(u).length,
			"sources": dbSources.getCollection("sources").find(u).length,
			"otahistory": dbOtaHistory.getCollection("otahistory").find(u).length,
			"uis": dbUis.getCollection("uis").find(u).length,
		};
		status.RateLimit = {
			"X-RateLimit-Remaining": res.get("X-RateLimit-Remaining"),
			"X-RateLimit-Limit": res.get("X-RateLimit-Limit"),
		};
	}
	res.status(200).send(status);
});


/**
 * @api {get} /index Get Cards Index for PWA
 * @apiName Get Cards Index for PWA
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 */
router.get("/index", function(req, res, next) {
	res.set("Content-Type", "application/json; charset=utf-8");
	res.status(200).render("index-json");
});


/**
 * @api {get} /terms Get Terms & Privacy for PWA
 * @apiName Get Terms & Privacy for PWA
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 */
router.get("/terms", function(req, res, next) {
	res.set("Content-Type", "application/json; charset=utf-8");
	res.status(200).render("terms-json");
});

/**
 * @api {get} /compatible-devices Get compatible devices for PWA
 * @apiName Get compatible devices for PWA
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 */
router.get("/compatible-devices", function(req, res, next) {
	res.set("Content-Type", "application/json; charset=utf-8");
	res.status(200).render("compatible-devices-json");
});

/**
 * @api {get} /open-source-licenses Get open-source-licenses for PWA
 * @apiName Get open-source-licenses for PWA
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 */
router.get("/open-source-licenses", function(req, res, next) {
	res.set("Content-Type", "application/json; charset=utf-8");
	res.status(200).render("open-source-licenses-json");
});

module.exports = router;

"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");

var timeoutNotification;
function sendNotification(pushSubscription, payload) {
	let result = t6notifications.sendPush(pushSubscription, payload).catch((error) => {
		t6console.debug("pushSubscription", pushSubscription);
		users.chain().find({ "id": pushSubscription.user_id }).update(function(u) {
			u.pushSubscription = {};
			db_users.save();
		});
		t6console.debug("pushSubscription is now disabled on User", error);
	});
	if(result && typeof result.statusCode!=="undefined" && (result.statusCode === 404 || result.statusCode === 410)) {
		t6console.debug("pushSubscription", pushSubscription);
		t6console.debug("Can't sendPush because of a status code Error", result.statusCode);
		users.chain().find({ "id": pushSubscription.user_id }).update(function(u) {
			u.pushSubscription = {};
			db_users.save();
		});
		t6console.debug("pushSubscription is now disabled on User", error);
	}
	clearTimeout(timeoutNotification);
}
const getDurationInMilliseconds = (start) => {
	const NS_PER_SEC = 1e9;
	const NS_TO_MS = 1e6;
	const diff = process.hrtime(start);
	return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

/**
 * @apiDefine 200
 * @apiSuccess 200 Server successfully understood the request
 * @apiSuccessExample {json} 200 Success
 *     HTTP/1.1 200 Response
 *     {
 *     }
 */

/**
 * @apiDefine 201
 * @apiSuccess 201 Creation of a new resource was successful
 * @apiSuccessExample {json} 201 Created
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Created",
 *       "id": "",
 *       "code": 201
 *     }
 */

/**
 * @apiDefine 202
 * @apiSuccess 202 Server successfully understood the request, it will be done asynchroneously
 * @apiSuccessExample {json} 202 Accepted
 *     HTTP/1.1 202 Accepted
 *     {
 *     }
 */

/**
 * @apiDefine 204
 * @apiSuccess 204 No Content on response
 * @apiSuccessExample {json} 204 No Content
 *     HTTP/1.1 204 No Content
 *     {
 *     }
 */

/**
 * @apiDefine 400
 * @apiError 400 Bad Request, require a Bearer Authentication or revision is incorrect
 * @apiErrorExample {json} 400 Response
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Bad Request",
 *       "id": "",
 *       "code": 400
 *     }
 */

/**
 * @apiDefine 401
 * @apiError 401 Require a Bearer Authentication
 * @apiErrorExample {json} 401 Response
 *     HTTP/1.1 401 Not Authorized
 *     {
 *       "message": "Not Authorized",
 *       "id": "",
 *       "code": 401
 *     }
 */

/**
 * @apiDefine 401sign
 * @apiError 401 Signature is invalid and is required
 * @apiErrorExample {json} 401sign Response
 *     HTTP/1.1 401 Invalid Signature
 *     {
 *       "message": "Invalid Signature",
 *       "id": "",
 *       "code": 401
 *     }
 */

/**
 * @apiDefine 403
 * @apiError 403 Forbidden Token used in transaction is not valid - check your token and/or permission
 * @apiErrorExample {json} 403 Response
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Forbidden",
 *       "id": "",
 *       "code": 403
 *     }
 */

/**
 * @apiDefine 404
 * @apiError 404 Not Found We couldn't find the resource you are trying to access
 * @apiErrorExample {json} 404 Response
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Not Found",
 *       "id": "",
 *       "code": 404
 *     }
 */

/**
 * @apiDefine 405
 * @apiError 405 Method Not Allowed ; API endpoint does not accept the method used
 * @apiErrorExample {json} 405 Response
 *     HTTP/1.1 405 Method Not Allowed
 *     {
 *       "message": "Not Authorized",
 *       "id": "",
 *       "code": 405
 *     }
 */

/**
 * @apiDefine 409
 * @apiError 409 Conflict
 * @apiErrorExample {json} 409 Response
 *     HTTP/1.1 409 conflict
 *     {
 *       "message": "conflict",
 *       "id": "",
 *       "code": 409
 *     }
 */

/**
 * @apiDefine 412
 * @apiError 412 Precondition Failed
 * @apiErrorExample {json} 412 Response
 *     HTTP/1.1 412 Precondition Failed
 *     {
 *       "message": "Precondition Failed",
 *       "id": "",
 *       "code": 412
 *     }
 */

/**
 * @apiDefine 429
 * @apiError 429 Too Many Requests
 * @apiErrorExample {json} 429 Response
 *     HTTP/1.1 429 Too Many Requests
 *     {
 *       "message": "Too Many Requests",
 *       "id": "",
 *       "code": 429
 *     }
 */

/**
 * @apiDefine 500
 * @apiError 500 Internal Server Error
 * @apiErrorExample {json} 500 Response
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Internal Error",
 *       "id": "",
 *       "code": 500
 *     }
 */

/**
 * @apiDefine Auth
 * @apiHeader {String} Authorization=Bearer:eyJh...sw5c Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept=application/json] application/json
 * @apiHeader {String} [Content-Type=application/json] application/json
 */

/**
 * @apiDefine AuthAdmin Admin access rights needed.
 * Only t6 Administrator users have permission to this Endpoint.
 * 
 * @apiHeader {String} Authorization=Bearer:eyJh...sw5c Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept=application/json] application/json
 * @apiHeader {String} [Content-Type=application/json] application/json
 */
router.use((req, res, next) => {
	req.startTime = process.hrtime();
	next();
});
//catch API calls for quotas
router.all("*", function (req, res, next) {
	let rp = typeof influxSettings.retentionPolicies.requests!=="undefined"?influxSettings.retentionPolicies.requests:"quota4w";
	var o = {
		key:		typeof req.user!=="undefined"?req.user.key:null,
		secret:		typeof req.user!=="undefined"?req.user.secret:null,
		user_id:	typeof req.user!=="undefined",
		session_id:	typeof req.sessionID?req.sessionID:(typeof req.user!=="undefined"?req.user.session_id:null),
		verb:		req.method,
		url:		typeof req.path!=="undefined"?req.path:req.originalUrl,
		query:		(Object.keys(req.query).length > 0)?JSON.stringify(req.query):"",
		date:		moment().format("x")
	};
	if ( !req.user && req.headers.authorization ) {
		jwt.verify(req.headers.authorization.split(" ")[1], jwtsettings.secret, function(err, decodedPayload) {
			req.user = decodedPayload;
		});
	}
	if ( req.user && req.headers.authorization ) {
		var limit = req.user!==null?(quota[req.user.role]).calls:-1;
		if (req.user !== null && req.user.role  !== null ) {
			res.header("X-RateLimit-Limit", limit);
		}
		var i;
		let user_id = typeof req.user.id!=="undefined"?req.user.id:o.user_id;
		var query = `SELECT count(url) FROM "${rp}"."requests" WHERE (user_id='${user_id}') AND (time>now() - 4w) LIMIT 1`;
		//t6console.debug(query);
		dbInfluxDB.query(query).then((data) => {
			//t6console.debug(data);
			i = typeof data[0]!=="undefined"?data[0].count:0;
			if ( limit-i > 0 ) {
				res.header("X-RateLimit-Remaining", limit-i);
				//res.header("X-RateLimit-Reset", "");
			}
			res.header("Cache-Control", "no-cache, max-age=360, private, must-revalidate, proxy-revalidate");
			if( (req.user && i >= limit) ) {
				t6events.add("t6Api", "api 429", typeof req.user.id!=="undefined"?req.user.id:o.user_id, typeof req.user.id!=="undefined"?req.user.id:o.user_id);
				res.status(429).send(new ErrorSerializer({"id": 99, "code": 429, "message": "Too Many Requests"})).end();
				return;
			} else {
				res.on("close", () => {
					let tags = {
						rp: rp,
						user_id: typeof req.user.id!=="undefined"?req.user.id:o.user_id,
						session_id: typeof o.session_id!=="undefined"?o.session_id:null,
						verb: o.verb,
						environment: process.env.NODE_ENV,
						ip: (req.headers["x-forwarded-for"] || req.connection.remoteAddress || "").split(",")[0].trim()
					};
					if (o.query!=="") {
						tags.query = o.query;
					}
					let fields = {url: o.url, durationInMilliseconds: getDurationInMilliseconds(req.startTime),};

					req.session.cookie.secure = true;
					req.session.user_id = req.user.id;

					let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
					dbWrite.writePoints([{
						measurement: "requests",
						tags: tags,
						fields: fields,
					}], { precision: "s", retentionPolicy: rp })
					.then((err) => {
						if (err) {
							t6console.error("Error catch on writePoints to influxDb", {"err": err, "tags": tags, "fields": fields[0]});
						}
					}).catch((err) => {
						t6console.error("Error catch on writting to influxDb", {"err": err, "tags": tags, "fields": fields[0]});
					});
				});
				next();
			}
		}).catch((err) => {
			t6console.error("ERROR", err);
			if(typeof i!=="undefined") {
				res.status(429).send(new ErrorSerializer({"id": 101, "code": 429, "message": "Too Many Requests; or we can't perform your request."})).end();
				return;
			} else {
				next();
			}
		});
	} else {
		var tags = {
			rp: rp,
			user_id: "anonymous",
			session_id: typeof o.session_id!=="undefined"?o.session_id:null,
			verb: o.verb,
			environment: process.env.NODE_ENV,
			ip: (req.headers["x-forwarded-for"] || req.connection.remoteAddress || "").split(",")[0].trim()
		};
		var fields = {url: o.url};
		let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
		dbWrite.writePoints([{
			measurement: "requests",
			tags: tags,
			fields: fields,
		}], { precision: "s", retentionPolicy: rp }).then((err) => {
			if (err) {
				t6console.error(
					sprintf(
						"Error on writePoints to influxDb for anonymous %s",
						{"err": err, "tags": tags, "fields": fields[0]}
					)
				);
			}
		}).catch((err) => {
			t6console.error(
				sprintf(
					"Error catch on writePoints to influxDb for anonymous %s",
					{"err": err, "tags": tags, "fields": fields[0]}
				)
			);
		});
		next(); // no User Auth..
	}
});

function checkForTooManyFailure(req, res, email) {
	// Invalid Credentials
	var query = sprintf("SELECT count(*) FROM %s WHERE (what='user login failure') AND (who='%s') AND (time>now() - 1h)", t6events.getMeasurement(), email);
	dbInfluxDB.query(query).then((data) => {
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
	}).catch((err) => {
		t6console.error(err);
	});
	t6events.add("t6App", "user login failure", email, email);
}

/**
 * @api {delete} /tokens/all Delete all expired users tokens
 * @apiName Delete all expired users tokens
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
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
 * @api {post} /authenticate Authenticate - JWT Token
 * @apiName Authenticate - JWT Token
 * @apiDescription The authenticate endpoint provide an access token which is multiple use but expiring within 5 minutes.
 * Once it has expired an access_token can be refreshed to extend duration or you can generate a new one from this authenticate endpoint.
 * Several Authentification process are handled: using your personnal credentials, using a Key+Secret Access long life Token (which can be revoked) 
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiBody (Body) {String="password","refresh_token","access_token"} grant_type="password" Grant type is the method to authenticate using your own credentials, using a pair of Key/Secret or refreshing a Bearer token before it expires.
 * @apiBody (Body) {String} [username] Your own username, required only when grant_type="password"
 * @apiBody (Body) {String} [password] Your own password, required only when grant_type="password"
 * @apiBody (Body) {String} [key=undefined] Client Api Key, required only when grant_type="access_token"
 * @apiBody {String} [secret=undefined] Client Api Secret, required only when grant_type="access_token"
 * @apiBody {String} [refresh_token=undefined] The refresh_token you want to use in order to get a new token
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
	let meta = { pushSubscription : req.body.pushSubscription};
	if ( (req.body.username !== "" && req.body.password !== "") && (!req.body.grant_type || req.body.grant_type === "password") ) {
		var email = req.body.username;
		var password = req.body.password;

		var queryU = { "$and": [ { "email": email } ] };
		//t6console.debug(queryU);
		var user = users.findOne(queryU);
		if ( user && typeof user.password!=="undefined" ) {
			if ( bcrypt.compareSync(password, user.password) || md5(password) === user.password ) {
				var geo = geoip.lookup(req.ip);
				if ( typeof user.location === "undefined" || user.location === null ) {
					user.location = {geo: geo, ip: req.ip,};
				}
				/* pushSubscription */
				if ( typeof meta.pushSubscription !== "undefined" ) {
					var payload = "{\"type\": \"message\", \"title\": \"Successfully auth\", \"body\": \"Welcome back to t6! Enjoy.\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
					meta.user_id = user.id;
					timeoutNotification = setTimeout(sendNotification, 5000, meta, payload);
					user.pushSubscription = meta.pushSubscription;
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
				var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });

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
				t6events.add("t6App", "POST_authenticate", user.id, user.id, {"status": 200});
				return res.status(200).json( {status: "ok", token: token, tokenExp: jwtsettings.expiresInSeconds, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
			} else {
				checkForTooManyFailure(req, res, email);
				t6events.add("t6App", "POST_authenticate", user.id, user.id, {"status": 403, "error_id": 102.11});
				t6console.error("Auth Error", user.id, {"status": 403, "error_id": 102.11});
				return res.status(403).send(new ErrorSerializer({"id": 102.11, "code": 403, "message": "Forbidden; Password does not match"}).serialize());
			}
		} else {
			t6console.debug("No user found or no password set yet.");
			t6events.add("t6App", "POST_authenticate", email, email, {"status": 403, "error_id": 102.21});
			t6console.error("Auth Error", email, req.body.username, {"status": 403, "error_id": 102.21});
			return res.status(403).send(new ErrorSerializer({"id": 102.21, "code": 403, "message": "Forbidden; No user found or no password set yet."}).serialize());
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
			if ( typeof meta.pushSubscription !== "undefined" ) {
				var payload = "{\"type\": \"message\", \"title\": \"Successfully auth\", \"body\": \"Welcome back to t6! Enjoy.\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
				meta.user_id = user.id;
				timeoutNotification = setTimeout(sendNotification, 5000, meta, payload);
				user.pushSubscription = meta.pushSubscription;
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
			payload.exp = jwtsettings.expiresInSeconds;
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
			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });

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
			t6events.add("t6App", "POST_authenticate", user.id, user.id, {"status": 200});
			return res.status(200).json( {status: "ok", token: token, tokenExp: jwtsettings.expiresInSeconds, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
		} else {
			t6events.add("t6App", "POST_authenticate", req.body.key, req.body.key, {"status": 403, "error_id": 102.32});
			t6console.error("Auth Error", req.body.key, email, {"status": 403, "error_id": 102.32});
			return res.status(403).send(new ErrorSerializer({"id": 102.32, "code": 403, "message": "Forbidden"}).serialize());
		}
	} else if ( typeof req.body.refresh_token!=="undefined" && req.body.refresh_token!=="" && req.body.grant_type === "refresh_token" ) {
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
			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
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
			t6events.add("t6App", "POST_authenticate", user_id, user_id, {"status": 200});
			return res.status(200).json( {status: "ok", token: token, tokenExp: jwtsettings.expiresInSeconds, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
		} else {
			t6events.add("t6App", "POST_authenticate", user_id, user_id, {"status": 403, "error_id": 102.43});
			t6console.error("Auth Error", user_id, {"status": 403, "error_id": 102.43});
			return res.status(403).send(new ErrorSerializer({"id": 102.43, "code": 403, "message": "Invalid Refresh Token"}).serialize());
		}
	} else {
		t6events.add("t6App", "POST_authenticate", null, null, {"status": 400, "error_id": 102.33});
		t6console.error("Auth Error", {"status": 403, "error_id": 102.33});
		return res.status(400).send(new ErrorSerializer({"id": 102.33, "code": 400, "message": "Required param grant_type and/or username+password needs to be defined"}).serialize());
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
router.head("/status", function(req, res, next) {
	res.status(200).send({"status": "ok"});
});
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
			"rules": db_rules.getCollection("rules").count(),
			"snippets": dbSnippets.getCollection("snippets").count(),
			"dashboards": dbDashboards.getCollection("dashboards").count(),
			"sources": dbSources.getCollection("sources").count(),
			"otahistory": dbOtaHistory.getCollection("otahistory").count(),
			"uis": dbUis.getCollection("uis").count(),
			"jobs": db_jobs.getCollection("jobs").count(),
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
			"rules": db_rules.getCollection("rules").find(u).length,
			"snippets": dbSnippets.getCollection("snippets").find(u).length,
			"dashboards": dbDashboards.getCollection("dashboards").find(u).length,
			"sources": dbSources.getCollection("sources").find(u).length,
			"otahistory": dbOtaHistory.getCollection("otahistory").find(u).length,
			"jobs": db_jobs.getCollection("jobs").find(u).length,
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
 * @api {get} /index Get Index Cards
 * @apiName Get Index Cards
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
 * @api {get} /terms Get Terms and Privacy
 * @apiName Get Terms and Privacy
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
 * @api {get} /compatible-devices Get compatible devices
 * @apiName Get compatible devices
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
 * @api {get} /open-source-licenses Get open-source-licenses
 * @apiName Get open-source-licenses
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

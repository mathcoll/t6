"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");
var tokens;
var users;

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
	users	= db.getCollection("users");

	var o = {
		key:		req.user!==undefined?req.user.key:"",
		secret:		req.user!==undefined?req.user.secret:null,
		user_id:	req.user!==undefined,
		session_id:	req.user!==undefined?req.user.session_id:null,
		verb:		req.method,
		url:		req.originalUrl,
		date:		moment().format("x")
	};
	if ( !req.user && req.headers.authorization ) {
		var jwtdecoded = jwt.decode(req.headers.authorization.split(" ")[1]);
		req.user = jwtdecoded;
	}
	
	if ( req.headers.authorization && req.user ) {
		var limit = req.user!==null?(quota[req.user.role]).calls:-1;
		if (req.user !== null && req.user.role  !== null ) {
			res.header("X-RateLimit-Limit", limit);
		}
		var i;
		
		var query = squel.select()
			.field("count(url)")
			.from("quota7d.requests")
			.where("user_id=?", req.user.id!==undefined?req.user.id:o.user_id)
			.where("time>now() - 7d")
			.limit(1)
			.toString();

		dbInfluxDB.query(query).then(data => {
			i = data[0]!==undefined?data[0].count:0;
			
			if ( limit-i > 0 ) {
				res.header("X-RateLimit-Remaining", limit-i);
				//res.header("X-RateLimit-Reset", "");
			}
			res.header("Cache-Control", "no-cache, max-age=360, private, must-revalidate, proxy-revalidate");
			
			if( (req.user && i >= limit) ) {
				t6events.add("t6Api", "api 429", req.user.id!==undefined?req.user.id:o.user_id);
				res.status(429).send(new ErrorSerializer({"id": 99, "code": 429, "message": "Too Many Requests"}));
			} else {
				if ( db_type.influxdb == true ) {
					var tags = {user_id: req.user.id!==undefined?req.user.id:o.user_id, session_id: o.session_id!==undefined?o.session_id:null, verb: o.verb, environment: process.env.NODE_ENV };
					var fields = {url: o.url};
					dbInfluxDB.writePoints([{
						measurement: "requests",
						tags: tags,
						fields: fields,
					}], { retentionPolicy: "quota7d", precision: "s", })
					.then(err => {
						if (err) console.log({"message": "Error on writePoints to influxDb", "err": err, "tags": tags, "fields": fields[0], "timestamp": timestamp});
						next();
					}).catch(err => {
						console.log({"message": "Error catched on writting to influxDb", "err": err, "tags": tags, "fields": fields[0], "timestamp": timestamp});
						console.error("Error catched on writting to influxDb:\n"+err);
						next();
					});
				}
			};
		}).catch(err => {
			res.status(429).send(new ErrorSerializer({"id": 101, "code": 429, "message": "Too Many Requests; or we can\"t perform your request."}));
		});
	} else {
		var tags = {user_id: "anonymous", session_id: o.session_id!==undefined?o.session_id:null, verb: o.verb, environment: process.env.NODE_ENV };
		var fields = {url: o.url};
		dbInfluxDB.writePoints([{
			measurement: "requests",
			tags: tags,
			fields: fields,
		}], { retentionPolicy: "quota7d", precision: "s", })
		next(); // no User Auth..
	}
});


function checkForTooManyFailure(req, res, email) {
	// Invalid Credentials
	var query = squel.select()
		.field("count(*)")
		.from(t6events.getMeasurement())
		.where("what=?", "user login failure")
		.where("who=?", email)
		.where("time>now() - 1h")
		.toString()
		;
	dbInfluxDB.query(query).then(data => {
		console.log(data[0]);
		if( data[0].count_who > 2 && data[0].count_who < 4 ) {
			// when >4, then we should block the account and maybe ban the IP address
			var geo = geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{};
			geo.ip = req.ip;
			res.render("emails/loginfailure", {device: device(req.headers["user-agent"]), geoip: geo}, function(err, html) {
				var to = email;
				var mailOptions = {
					from: from,
					bcc: bcc!==undefined?bcc:null,
					to: to,
					subject: "t6 warning notification",
					text: "Html email client is required",
					html: html
				};
				t6mailer.sendMail(mailOptions).then(function(info){
					console.log("info", info);
				}).catch(function(error){
					console.log("t6mailer.sendMail error", error.info.code, error.info.response, error.info.responseCode, error.info.command);
				});
			});
		}
	}).catch(err => {
		console.log(err);
	});
	t6events.add("t6App", "user login failure", email);
}

/**
 * @api {post} /authenticate Authenticate - get JWT Token
 * @apiName Authenticate - get JWT Token
 * @apiDescription The authenticate endpoint provide you an access token whi is multiple time use but expired within 5 minutes.
 * Once it has expired an access_token can be refreshed to extend duration or you can generate a new one from this authenticate endpoint.
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiParam {String="password","refresh_token","access_token"} grant_type="password" Grant type is either "password" (default) to authenticate using your own credentials, or "refresh_token" to refresh a token before it expires.
 * @apiParam {String} [username] Your own username
 * @apiParam {String} [password] Your own password
 * @apiParam {String} [api_key=undefined] In "access_token" context, Client Api Key
 * @apiParam {String} [api_secret=undefined] In "access_token" context, Client Api Secret
 * @apiParam {String} [refresh_token=undefined] The refresh_token you want to use in order to get a new token
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 * @apiUse 500
 */
router.post("/authenticate", function (req, res) {
	tokens	= dbTokens.getCollection("tokens");
	if ( (req.body.username && req.body.password) && (!req.body.grant_type || req.body.grant_type === "password") ) {
		var email = req.body.username;
		var password = req.body.password;

		var queryU = { "$and": [ { "email": email } ] };
		var user = users.findOne(queryU);
		
		if ( user ) {
			if ( bcrypt.compareSync(password, user.password) || md5(password) == user.password ) {
				var geo = geoip.lookup(req.ip);
				if ( user.location === undefined || user.location === null ) {
					user.location = {geo: geo, ip: req.ip,};
				}
				users.update(user);
				db.save();
				
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

				if ( user.location && user.location.ip ) payload.iss = req.ip+" - "+user.location.ip;
				var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });

				var refreshPayload = crypto.randomBytes(40).toString("hex");
				var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("X");

				var mydevice = device(req.headers["user-agent"]);
				var agent = useragent.parse(req.headers["user-agent"]);
				var type = mydevice.is("desktop")!==false?"desktop":
					mydevice.is("tv")!==false?"tv":
						mydevice.is("tablet")!==false?"tablet":
							mydevice.is("phone")!==false?"phone":
								mydevice.is("bot")!==false?"bot":
									mydevice.is("car")!==false?"car":
										mydevice.is("console")!==false?"console":"unknown";
				var t = {
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
						"device-type": type,
				};
				tokens.insert(t);

				var refresh_token = user.id + "." + refreshPayload;
				return res.status(200).json( {status: "ok", token: token, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
			} else {
				checkForTooManyFailure(req, res, email);
				return res.status(403).send(new ErrorSerializer({"id": 102.1, "code": 403, "message": "Forbidden"}).serialize());
			}
		} else {
			return res.status(403).send(new ErrorSerializer({"id": 102.2, "code": 403, "message": "Forbidden"}).serialize());
		}
	} else if ( ( req.body.api_key && req.body.api_secret ) && req.body.grant_type === "access_token" ) {
		var queryT = {
		"$and": [
					{ "key": req.body.api_key },
					{ "secret": req.body.api_secret },
				]
		};
		if ( tokens.findOne(queryT) ) {
			var user = users.findOne({ "id": tokens.findOne(queryT).user_id });
			var geo = geoip.lookup(req.ip);
			
			if ( user.location === undefined || user.location === null ) {
				user.location = {geo: geo, ip: req.ip,};
			}
			users.update(user);
			db.save();
			
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
			
			if ( user.location && user.location.ip ) payload.iss = req.ip+" - "+user.location.ip;
			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });

			var refreshPayload = crypto.randomBytes(40).toString("hex");
			var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("X");

			var mydevice = device(req.headers["user-agent"]);
			var agent = useragent.parse(req.headers["user-agent"]);
			var type = mydevice.is("desktop")!==false?"desktop":
				mydevice.is("tv")!==false?"tv":
					mydevice.is("tablet")!==false?"tablet":
						mydevice.is("phone")!==false?"phone":
							mydevice.is("bot")!==false?"bot":
								mydevice.is("car")!==false?"car":
									mydevice.is("console")!==false?"console":"unknown";
			var t = {
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
					"device-type": type,
			};
			tokens.insert(t);

			var refresh_token = user.id + "." + refreshPayload;
			return res.status(200).json( {status: "ok", token: token, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
		} else {
			return res.status(403).send(new ErrorSerializer({"id": 102.1, "code": 403, "message": "Forbidden"}).serialize());
		}
	} else if ( req.body.refresh_token && req.body.grant_type === "refresh_token" ) {
		var user_id = req.body.refresh_token.split(".")[0];
		var token = req.body.refresh_token.split(".")[1];
		
		var queryT = {
				"$and": [
							{ "user_id": user_id },
							{ "refresh_token": token },
							{ "expiration": { "$gte": moment().format("X") } },
						]
				};
		if ( user_id && token && tokens.findOne(queryT) ) {
			// Sign a new token
			var user = users.findOne({ "id": user_id });
			var geo = geoip.lookup(req.ip);
			
			if ( user.location === undefined || user.location === null ) {
				user.location = {geo: geo, ip: req.ip,};
			}
			users.update(user);
			db.save();
			
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

			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
			var refreshPayload = crypto.randomBytes(40).toString("hex");
			var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("X");

			var mydevice = device(req.headers["user-agent"]);
			var agent = useragent.parse(req.headers["user-agent"]);
			var type = mydevice.is("desktop")!==false?"desktop":
				mydevice.is("tv")!==false?"tv":
					mydevice.is("tablet")!==false?"tablet":
						mydevice.is("phone")!==false?"phone":
							mydevice.is("bot")!==false?"bot":
								mydevice.is("car")!==false?"car":
									mydevice.is("console")!==false?"console":"unknown";
			var t = {
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
					"device-type": type,
			};
			tokens.insert(t);
			var refresh_token = user.id + "." + refreshPayload;
			return res.status(200).json( {status: "ok", token: token, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
		} else {
			return res.status(400).send(new ErrorSerializer({"id": 102.4, "code": 400, "message": "Invalid Refresh Token"}).serialize());
		}
	} else {
		// TODO
		return res.status(400).send(new ErrorSerializer({"id": 102.3, "code": 400, "message": "Required param grant_type"}).serialize());
	}
	var expired = tokens.find( { "expiration" : { "$lt": moment().format("X") } } );
	if ( expired ) {
		tokens.remove(expired);
		db.save();
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
	tokens	= db.getCollection("tokens");
	var queryT = {
			"$and": [
						{ "refreshToken": refreshToken },
						{"expiration": { "$gte": moment().format("x") }},
					]
			};
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
			var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });

			// Add the refresh token to the list
			tokens	= db.getCollection("tokens");
			var refreshPayload = user.id + "." + crypto.randomBytes(40).toString("hex");
			var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("X");
			tokens.insert({ user_id: user.id, refreshToken: refreshPayload, expiration: refreshTokenExp, });
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
		status: "running",
		mqttInfo: mqttInfo,
		appName: process.env.NAME,
		started_at: moment(process.env.STARTED*1000).format("DD/MM/Y H:mm:s"),
	};
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

module.exports = router;

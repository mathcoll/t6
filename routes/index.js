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

const challengeOTP = (res, req, rp, defaultUser) => new Promise((resolve, reject) => {
	let user = typeof req.user!=="undefined"?req.user:{isOTP:null};
	let currentLocationIp = req.ip;
	let ua = req.headers["user-agent"];
	let forceOTP = req.query.forceOTP;
	let geo = geoip.lookup(currentLocationIp)!==null?geoip.lookup(currentLocationIp):{};
	let agent = useragent.parse(ua);
	let currentDevice = typeof agent.toAgent()!=="undefined"?agent.toAgent():"";

	if (typeof user.email==="undefined") {
		t6console.debug("user undefined ==> No OTP");
		reject("OTP challenge ==> No OTP (user undefined)");
	} else {
		t6console.debug("=============================== OTP ===================================");
		let otpChallenge = false;
		let bruteForceCount = 0;
		typeof user.lastLogon!=="undefined"?user.lastLogon:0;
		typeof user.lastOTP!=="undefined"?user.lastOTP:0;
		if(defaultUser.session_id!=="") {
			let queryBruteForce = `SELECT count(url) FROM ${rp}.requests WHERE (session_id='${defaultUser.session_id}') AND (time>now() - ${otpBruteForceWindow}) LIMIT 1`;
			//t6console.debug("OTP challenge test brute force attempt", queryBruteForce);
			dbInfluxDB.query(queryBruteForce).then((data) => {
				bruteForceCount = typeof data[0]!=="undefined"?data[0].count:0;
				t6console.debug("OTP challenge test brute force attempt", bruteForceCount);
			}).catch((error) => {
				t6console.error(`OTP challenge test brute force attempt error: ${error}`);
			});
		}
		//t6console.debug("REQ", req.path);
		//t6console.debug("REQ", req.user);
		otpChallenge = [
			//(req.path==="/objects/" && req.method==="GET"),
			
			// New IP identified
			typeof (user.geoip?.ip)!=="undefined"?((user.geoip?.ip).indexOf(currentLocationIp)===-1 && currentDevice !== "Other 0.0.0"):false,
			
			// New localization identified
			
			// New device identified
			typeof (user.device)!=="undefined"?((user.device).indexOf(currentDevice)===-1 && currentDevice !== "Other 0.0.0"):false,
			
			// Connexions à des heures inhabituelles
			//(Date.now() > 1676147987697)
			
			// Important user modification
			(req.path==="/users/"+req.user.id && req.method==="PUT"),
			
			// User last logged in for a while
			(moment(parseInt(user.lastLogon, 10)).isBefore(moment().subtract(15, "days"))),
			
			// Threashold on Brute Force attempt - based on session
			(bruteForceCount>otpBruteForceCount), // this is async and not available // TODO

			// or when user never had an OTP 
			(typeof req.user.lastOTP==="undefined" || req.user.lastOTP===null),

		].some(isRequireChallenge);
		if(str2bool(forceOTP)===true) {
			otpChallenge = true;
		}
		if( (req.headers["x-otp"] && req.headers["x-hash"]) || (req.query.otp && req.query.hash) ) {
			let otp = typeof req.headers["x-otp"]!=="undefined"?req.headers["x-otp"]:req.query.otp;
			let hash = typeof req.headers["x-hash"]!=="undefined"?req.headers["x-hash"]:req.query.hash;
			if ( otpTool.verifyOTP(user.email, otp, hash, otpKey, otpAlgorithm) ) {
				t6events.addAudit("t6App", "OTP challenge succeed", user.id, user.id, {"status": 200});
				t6events.addStat("t6App", "OTP challenge succeed", user.id, user.id, {"status": 200});
				otpChallenge = false;
				resolve({user, hash:null});
			} else {
				t6events.addAudit("t6App", "OTP challenge failed", user.id, user.id, {"status": 200});
				t6events.addStat("t6App", "OTP challenge failed", user.id, user.id, {"status": 200});
				reject("OTP challenge failed");
			}
		}
		
		if(otpChallenge &&
			// OTP requested from rules AND (either lastOTP never occured OR occured more than half the expiration)
			( (typeof req.user.lastOTP==="undefined" || req.user.lastOTP===null) || (moment(parseInt(req.user.lastOTP, 10)).isBefore(moment().subtract(otpExpiresAfter/2, "minutes")))) &&
			// Do not create OTP challenge if the user already have one in the past 5 days
			(req.user.lastOTP!==null && moment(parseInt(req.user.lastOTP, 10)).isBefore(moment().subtract(5, "days")))  // TODO
		) {
			// Do not send OTP challenge more than 2 times within the OTP duration
			user.lastOTP = moment().format("x");
			user.isOTP = true;
			user.currentLocationIp = currentLocationIp;
			user.currentDevice = currentDevice;
			t6console.debug("OTP challenge lastOTP is updated");
			let otp = t6mailer.generateOTP(user, res);
			req.user = user;
			otp.then((otp) => {
				t6events.addAudit("t6App", "OTP challenge emailed", user.id, user.id, {"status": 307, "error_id": 1029});
				t6events.addStat("t6App", "OTP challenge emailed", user.id, user.id, {"status": 307, "error_id": 1029});
				t6console.debug("============================== END OTP ==================================");
				if(process.env.NODE_ENV === "development" && ua.match(/node-superagent/gi) ) {
					// on development environment and when using jsonapitest
					res.header("Location", `${baseUrl_https}/v${version}${req.path}?hash=${otp.hash}&otp=123456`);
				}
				res.status(307).json( {"hash": otp.hash} );
				resolve({user, hash:otp.hash});
			});
		} else {
			t6console.debug("OTP challenge : not necessary, bypassed");
			resolve({user, hash:null});
		}
	}
});

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
 * @apiDefine 203
 * @apiSuccess 203 Non-Authoritative Information
 * @apiSuccessExample {json} 203 Non-Authoritative Information
 *     HTTP/1.1 203 Non-Authoritative Information
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
 * @apiDefine 307
 * @apiError 307 Temporary Redirect
 * @apiErrorExample {json} 307 Temporary Redirect
 *     HTTP/1.1 307 Temporary Redirect
 *     {
 *       "message": "Temporary Redirect",
 *       "id": "",
 *       "code": 307
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
 * @apiDefine NoAuth
 * @apiHeader {String} [Accept=application/json] application/json
 * @apiHeader {String} [Content-Type=application/json] application/json
 */

/**
 * @apiDefine Auth
 * @apiHeader {String} Authorization=Bearer:eyJh...sw5c Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept=application/json] application/json
 * @apiHeader {String} [Content-Type=application/json] application/json
 * @apiHeader {String} [x-hash] OTP Hash
 * @apiHeader {String} [x-otp] One Time Password
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
//catch API calls for quotas and OTP
router.all("*", function (req, res, next) {
	let rp = typeof influxSettings.retentionPolicies.requests!=="undefined"?influxSettings.retentionPolicies.requests:"quota4w";
	var o = {
		key:		typeof req.user!=="undefined"?req.user.key:null,
		secret:		typeof req.user!=="undefined"?req.user.secret:null,
		user_id:	typeof req.user!=="undefined",
		session_id:	typeof req.sessionID!=="undefined"?req.sessionID:(typeof req.user!=="undefined"?req.user.session_id:null),
		verb:		req.method,
		url:		typeof req.path!=="undefined"?req.path:req.originalUrl,
		query:		(Object.keys(req.query).length > 0)?JSON.stringify(req.query):"",
		date:		moment().format("x")
	};
	if ( !req.user && req.headers.authorization && req.headers.authorization.split(" ")[1] !== null && req.headers.authorization.split(" ")[1] !== "null" ) {
		jsonwebtoken.verify(req.headers.authorization.split(" ")[1], jwtsettings.secret, function(err, decodedPayload) {
			if(req.headers.authorization.split(" ")[0]==="Bearer" && err) {
				t6console.debug("User can't be determined:", err);
			} else if(req.headers.authorization.split(" ")[0]==="Basic") {
				let credentials = atob(req.headers.authorization.split(" ")[1])?.split(":");
				switch(credentials[0]) {
					case oauth2.find(({ name }) => name === "ifttt").config.serviceClientId:
						req.user = {"name": "ifttt", "role": "oauth2"};
						break;
					case oauth2.find(({ name }) => name === "auth0").config.serviceClientId:
						req.user = {"name": "auth0", "role": "oauth2"};
						break;
					default:
						req.user = null;
						t6console.debug("User is valid on Basic auth but we can't identify it'.");
						break;
				}
				t6console.debug("User is valid on Basic auth", req.user);
			} else {
				req.user = decodedPayload;
				t6console.debug("User is valid on jwt.");
			}
		});
	}
	if (
		req.user &&
		(
			(req.headers.authorization && req.headers.authorization.split(" ")[1] !== null && req.headers.authorization.split(" ")[1] !== "null") ||
			(req.headers["x-api-key"] && req.headers["x-api-secret"])
		)
	) {
		var limit = req.user!==null?(quota[req.user.role]).calls:-1;
		if (req.user !== null && req.user.role !== null ) {
			res.header("X-RateLimit-Limit", limit);
		}
		let i;
		let user_id = typeof req.user.id!=="undefined"?req.user.id:o.user_id;
		let query = `SELECT count(url) FROM ${rp}.requests WHERE (user_id='${user_id}') AND (time>now() - 2w) LIMIT 1`;
		dbInfluxDB.query(query).then((data) => {
			i = typeof data[0]!=="undefined"?data[0].count:0;
			if ( limit-i > 0 && !res.headersSent ) {
				res.header("X-RateLimit-Remaining", limit-i);
				//res.header("X-RateLimit-Reset", "");
			}
			res.header("Cache-Control", "no-cache, max-age=360, private, must-revalidate, proxy-revalidate");
			if( (req.user && i >= limit) ) {
				t6events.addAudit("t6Api", "api 429", typeof req.user.id!=="undefined"?req.user.id:o.user_id, typeof req.user.id!=="undefined"?req.user.id:o.user_id);
				res.status(429).send(new ErrorSerializer({"id": 17329, "code": 429, "message": "Too Many Requests"}));
				//return;
			} else {
				t6console.debug("challengeOTP starting");
				let agent = useragent.parse(req.headers["user-agent"]);
				let currentDevice = typeof agent.toAgent()!=="undefined"?agent.toAgent():"";
				challengeOTP(res, req, rp, o).then((challenge) => {
					t6console.debug("challengeOTP is completed");
					req.user = challenge.user;
					if ( challenge.hash!==null ) {
						return;
					} else {
						next();
					}
				})
				.catch((err) => {
					t6console.debug("challengeOTP rejected", err);
					return;
				});
				res.on("close", () => {
					t6console.debug("Setting up the onClose rule");
					let tags = {
						rp: rp,
						user_id: typeof req.user.id!=="undefined"?req.user.id:o.user_id,
						verb: o.verb,
						environment: process.env.NODE_ENV,
						ip: (req.headers["x-forwarded-for"] || req.connection.remoteAddress || "").split(",")[0].trim()
					};
					if (o.query!=="") {
						tags.query = o.query;
					}
					let fields = {url: o.url, durationInMilliseconds: getDurationInMilliseconds(req.startTime),session_id: typeof o.session_id!=="undefined"?o.session_id:null,};

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
			}
		}).catch((err) => {
			t6console.error("ERROR", err);
			t6console.error("Query to count requests in the past 2w", query);
			t6console.error("Role", req.user.role);
			t6console.error("Limit", limit);
			if(typeof i!=="undefined") {
				t6console.error("429 ", i, err);
				res.status(429).send(new ErrorSerializer({"id": 17330, "code": 429, "message": "Too Many Requests; or we can't perform your request."}));
				next();
			} else {
				t6console.error("Error, i is undefined", i, err);
				next();
			}
		});
	} else {
		t6console.debug("User and authorization are not defined", req.user, req.headers?.authorization);
		var tags = {
			rp: rp,
			user_id: "anonymous",
			verb: o.verb,
			environment: process.env.NODE_ENV,
			ip: (req.headers["x-forwarded-for"] || req.connection.remoteAddress || "").split(",")[0].trim()
		};
		var fields = {url: o.url,session_id: typeof o.session_id!=="undefined"?o.session_id:null,};
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
			next(); // no User Auth..
		}).catch((err) => {
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
	var query = `SELECT count(*) FROM ${t6events.getMeasurement()} WHERE (what='user login failure') AND (who='${email}') AND (time>now() - 1h)`;
	t6console.debug("query checkForTooManyFailure", query);
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
			return data[0].count_who;
		}
	}).catch((err) => {
		t6console.error(err);
		t6events.addAudit("t6App", "user login failure", email, email);
		return undefined;
	});
}

function isRequireChallenge(element, index, array) {
	return element===true;
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
		t6events.addAudit("t6App", "AuthAdmin: {delete} /tokens/all", "", "", {"status": "201", error_id: "00003"});
		return res.status(201).json( {status: "ok", "cleaned": expired.length} );
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {delete} /tokens/all", "", "", {"status": "403", error_id: "17050"});
		return res.status(403).send(new ErrorSerializer({"id": 17050, "code": 403, "message": "Forbidden, You should be an Admin!"}).serialize());
	}
});

/**
 * @api {post} /authenticate Authenticate - JWT Token
 * @apiName Authenticate - JWT Token
 * @apiDescription The authenticate endpoint provide an access token which is multiple use but expiring within 5 minutes.
 * Once it has expired an access_token can be refreshed to extend duration or you can generate a new one from this authenticate endpoint.
 * Several Authentification process are handled: using your personnal credentials, using a Key+Secret Access long life Token (which can be revoked) 
 * @apiGroup 13. Users
 * @apiVersion 2.0.1
 * 
 * @apiBody (Body) {String="password","refresh_token","access_token"} grant_type="password" Grant type is the method to authenticate using your own credentials, using a pair of Key/Secret or refreshing a Bearer token before it expires.
 * @apiBody (Body) {String} [username] Your own username, required only when grant_type="password"
 * @apiBody (Body) {String} [password] Your own password, required only when grant_type="password"
 * @apiBody (Body) {String} [key=undefined] Client Api Key, required only when grant_type="access_token"
 * @apiBody {String} [secret=undefined] Client Api Secret, required only when grant_type="access_token"
 * @apiBody {String} [refresh_token=undefined] The refresh_token you want to use in order to get a new token
 * @apiQuery {String} [forceOTP] Force One Time Password request
 * 
 * @apiSuccess {String} status Status of the Authentication
 * @apiSuccess {String} token JWT Token
 * @apiSuccess {timestamp} tokenExp Expiration timestamp of the JWT Token
 * @apiSuccess {String} refresh_token Token that can be used to refresh the Token
 * @apiSuccess {timestamp} refreshTokenExp Expiration timestamp of the Refresh Token
 *
 * @apiUse NoAuth
 * @apiUse 200
 * @apiUse 307
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 */
router.post("/authenticate", function (req, res) {
	let meta = { pushSubscription : (typeof req.body.pushSubscription?.endpoint!=="undefined" && typeof req.body.pushSubscription?.keys!=="undefined")?req.body.pushSubscription:undefined};
	let rp = typeof influxSettings.retentionPolicies.requests!=="undefined"?influxSettings.retentionPolicies.requests:"quota4w";
	let o = {
		key:		typeof req.user!=="undefined"?req.user.key:null,
		secret:		typeof req.user!=="undefined"?req.user.secret:null,
		user_id:	typeof req.user!=="undefined",
		session_id:	typeof req.sessionID!=="undefined"?req.sessionID:(typeof req.user!=="undefined"?req.user.session_id:null),
		verb:		req.method,
		url:		typeof req.path!=="undefined"?req.path:req.originalUrl,
		query:		(Object.keys(req.query).length > 0)?JSON.stringify(req.query):"",
		date:		moment().format("x")
	};
	if ( (req.body.username !== "" && req.body.password !== "") && (!req.body.grant_type || req.body.grant_type === "password") ) {
		let email = (req.body.username).toLowerCase();
		let password = req.body.password;
		let queryU = { "$and": [ { "email": email } ] };
		let user = users.findOne(queryU);
		if ( user && typeof user.password!=="undefined" ) {
			user.quotausage = undefined;
			user.data = undefined;
			let geo = geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{};
			let agent = useragent.parse(req.headers["user-agent"]);
			let currentDevice = typeof agent.toAgent()!=="undefined"?agent.toAgent():"";
			if ( bcrypt.compareSync(password, user.password) || md5(password) === user.password ) {
				user.location = {geo: geo};
				user.isOTP=false; // reset value
				req.user = user;
				challengeOTP(res, req, rp, o).then((challenge) => {
					t6console.debug("challengeOTP is completed", challenge);
					req.user = challenge.user;
					user = req.user;
					if ( challenge.hash!==null ) {
						t6console.debug("challengeOTP challenged at login");
						return;
					} else {
						if(Array.isArray(user.geoip?.ip)===true) {
							if((user.geoip?.ip).indexOf(req.ip)===-1) {
								(user.geoip?.ip).push(req.ip);
								t6console.debug("IP added the the list for that user.");
							} else {
								t6console.debug("IP already listed for that user.");
							}
						} else {
							if(typeof user.geoip!=="undefined" && user.geoip?.ip!==null) {
								user.geoip.ip = [user.geoip?.ip];
							} else {
								user.geoip = {ip:[]};
							}
							(user.geoip?.ip).push(req.ip);
							t6console.debug("IP added the the list for that user.");
						}
						if(Array.isArray(user.device)===true) {
							if((user.device).indexOf(currentDevice)===-1) {
								(user.device).push(currentDevice);
								t6console.debug("Device added the the list for that user.");
							} else {
								t6console.debug("Device already listed for that user.");
							}
						} else {
							if(user.device!==null) {
								user.device = [user.device];
							}
							(user.device).push(currentDevice);
							t6console.debug("Device added the the list for that user.");
						}
						/* pushSubscription */
						if ( typeof meta.pushSubscription !== "undefined" ) {
							let payloadMessage = "{\"type\": \"message\", \"title\": \"Successfully auth\", \"body\": \"Welcome back to t6! Enjoy.\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
							meta.user_id = user.id;
							timeoutNotification = setTimeout(sendNotification, 5000, meta, payloadMessage);
							user.pushSubscription = meta.pushSubscription;
						}
						user.lastLogon = moment().format("x");
						t6console.debug("User is logged in. Updated the lastLogon value.");
						users.update(user);
						db_users.save();
		
						req.session.cookie.secure = true;
						req.session.cookie.user_id = user.id;
		
						let payload = JSON.parse(JSON.stringify(user));
						payload.unsubscription = user.unsubscription;
						payload.permissions = undefined;
						payload.token = undefined;
						payload.password = undefined;
						payload.gravatar = undefined;
						payload.meta = undefined;
						payload.$loki = undefined;
						payload.geoip = undefined;
						payload.device = undefined;
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
							payload.iftttTrigger_identity = undefined;
							payload.subscription = undefined;
							payload.unsubscription = undefined;
							payload.pushSubscription = undefined;
							payload.reminderMail = undefined;
							payload.changePassword = undefined;
							payload.newsletter = undefined;
							payload.quotausage = undefined;
							payload.data = undefined;
							payload.changePasswordMail = undefined;
							payload.mail_hash = undefined;
							payload.update_date = undefined;
							payload.subscription_date = undefined;
							payload.scope = undefined;
							payload.firstName = undefined;
							payload.lastName = undefined;
							payload.iss = undefined;
							payload.sub = undefined;
							payload.token_type = undefined;
						}
						var token = jsonwebtoken.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
		
						var refreshPayload = crypto.randomBytes(40).toString("hex");
						var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("x");
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
						t6events.addAudit("t6App", "POST_authenticate password", user.id, user.id, {"status": 200});
						t6events.addStat("t6App", "POST_authenticate password", user.id, user.id, {"status": 200});
						if(!user.isOTP) { // TODO: we should not use that tips ! This is to prevent 'already sent headers'' error
							return res.status(200).json( {status: "ok", token: token, tokenExp: jwtsettings.expiresInSeconds, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
						}
					}
				})
				.catch((err) => {
					t6console.debug("challengeOTP rejected", err);
					t6events.addAudit("t6App", "POST_authenticate password", user.id, user.id, {"status": 403, "error_id": 102.31});
					t6events.addStat("t6App", "POST_authenticate password", user.id, user.id, {"status": 403, "error_id": 102.31});
					return res.status(403).send(new ErrorSerializer({"id": 17350, "code": 403, "message": "OTP challenge rejected"}).serialize());
				});
			} else {
				let count = checkForTooManyFailure(req, res, email);
				t6events.addAudit("t6App", "POST_authenticate password", user.id, user.id, {"status": 403, "error_id": 102.11});
				t6events.addStat("t6App", "POST_authenticate password", user.id, user.id, {"status": 403, "error_id": 102.11});
				return res.status(403).send(new ErrorSerializer({"id": 17150, "code": 403, "message": "Forbidden"}).serialize());
			}
		} else {
			t6console.debug("No user found or no password set yet.");
			t6events.addAudit("t6App", "POST_authenticate password", email, email, {"status": 403, "error_id": 102.21});
			t6events.addStat("t6App", "POST_authenticate password", email, email, {"status": 403, "error_id": 102.21});
			t6console.error("Auth Error", email, req.body.username, {"status": 403, "error_id": 102.21});
			return res.status(403).send(new ErrorSerializer({"id": 17250, "code": 403, "message": "Forbidden"}).serialize());
		}
	} else if ( ( req.body.key && req.body.secret ) && req.body.grant_type === "access_token" ) {
		let queryT = {
		"$and": [
					{ "key": req.body.key },
					{ "secret": req.body.secret },
				]
		};
		let u = access_tokens.findOne(queryT);
		if ( u && typeof u.user_id !== "undefined" ) {
			let user = users.findOne({id: u.user_id});
			let geo = geoip.lookup(req.ip);
			user.location = {geo: geo, ip: req.ip,}
			/* pushSubscription */
			if ( typeof meta.pushSubscription !== "undefined" ) {
				let payloadMessage = "{\"type\": \"message\", \"title\": \"Successfully auth\", \"body\": \"Welcome back to t6! Enjoy.\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
				meta.user_id = user.id;
				timeoutNotification = setTimeout(sendNotification, 5000, meta, payloadMessage);
				user.pushSubscription = meta.pushSubscription;
			}
			users.update(user);
			db_users.save();

			let payload = JSON.parse(JSON.stringify(user));
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.geoip = undefined;
			payload.device = undefined;
			payload.token_type = "Bearer";
			payload.scope = "ClientApi";
			payload.sub = "/users/"+user.id;
			
			if ( user.location && user.location.ip ) {
				payload.iss = req.ip+" - "+user.location.ip;
			}
			if(req.headers && req.headers["user-agent"] && (req.headers["user-agent"]).indexOf("t6iot-library") > -1) {
				payload.location = undefined;
				payload.unsubscription_token = undefined;
				payload.passwordLastUpdated = undefined;
				payload.iftttCode = undefined;
				payload.iftttTrigger_identity = undefined;
				payload.subscription = undefined;
				payload.unsubscription = undefined;
				payload.pushSubscription = undefined;
				payload.reminderMail = undefined;
				payload.changePassword = undefined;
				payload.newsletter = undefined;
				payload.quotausage = undefined;
				payload.data = undefined;
			}
			let token = jsonwebtoken.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });

			let refreshPayload = crypto.randomBytes(40).toString("hex");
			let refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("x");

			let agent = useragent.parse(req.headers["user-agent"]);
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
			let expired = tokens.find( { "$and": [{ "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } } ]} );
			if ( expired ) {
				tokens.remove(expired);
				db_tokens.save();
			}

			let refresh_token = user.id + "." + refreshPayload;
			t6events.addAudit("t6App", "POST_authenticate access_token", user.id, user.id, {"status": 200});
			t6events.addStat("t6App", "POST_authenticate access_token", user.id, user.id, {"status": 200});
			return res.status(200).json( {status: "ok", token: token, tokenExp: jwtsettings.expiresInSeconds, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
		} else {
			t6events.addAudit("t6App", "POST_authenticate access_token", req.body.key, req.body.key, {"status": 403, "error_id": 102.32});
			t6events.addStat("t6App", "POST_authenticate access_token", req.body.key, req.body.key, {"status": 403, "error_id": 102.32});
			return res.status(403).send(new ErrorSerializer({"id": 17350, "code": 403, "message": "Forbidden"}).serialize());
		}
	} else if ( typeof req.body.refresh_token!=="undefined" && req.body.refresh_token!=="" && req.body.grant_type === "refresh_token" ) {
		let user_id = req.body.refresh_token.split(".")[0];
		let token = req.body.refresh_token.split(".")[1];

		let queryT = {
			"$and": [
						{ "user_id": user_id },
						{ "refresh_token": token },
						{ "expiration": { "$gte": moment().format("x") } },
					]
		};
		if ( user_id && token && tokens.findOne(queryT) ) {
			// Sign a new token
			let user = users.findOne({ "id": user_id });
			let geo = geoip.lookup(req.ip);
			user.location = {geo: geo, ip: req.ip,}
			users.update(user);
			db_users.save();

			let payload = JSON.parse(JSON.stringify(user));
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.geoip = undefined;
			payload.device = undefined;
			payload.token_type = "Bearer";
			payload.scope = "ClientApi";
			payload.sub = "/users/"+user.id;

			if(req.headers && req.headers["user-agent"] && (req.headers["user-agent"]).indexOf("t6iot-library") > -1) {
				payload.location = undefined;
				payload.unsubscription_token = undefined;
				payload.passwordLastUpdated = undefined;
				payload.iftttCode = undefined;
				payload.iftttTrigger_identity = undefined;
				payload.subscription = undefined;
				payload.unsubscription = undefined;
				payload.pushSubscription = undefined;
				payload.reminderMail = undefined;
				payload.changePassword = undefined;
				payload.newsletter = undefined;
				payload.quotausage = undefined;
				payload.data = undefined;
			}
			let token = jsonwebtoken.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
			let refreshPayload = crypto.randomBytes(40).toString("hex");
			let refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("x");

			let agent = useragent.parse(req.headers["user-agent"]);
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
			let expired = tokens.find( { "$and": [{ "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } } ]} );
			if ( expired ) {
				tokens.remove(expired);
				db_tokens.save();
			}

			let refresh_token = user.id + "." + refreshPayload;
			t6events.addAudit("t6App", "POST_authenticate refresh_token", user_id, user_id, {"status": 200});
			t6events.addStat("t6App", "POST_authenticate refresh_token", user_id, user_id, {"status": 200});
			return res.status(200).json( {status: "ok", token: token, tokenExp: jwtsettings.expiresInSeconds, refresh_token: refresh_token, refreshTokenExp: refreshTokenExp} );
		} else {
			t6events.addAudit("t6App", "POST_authenticate refresh_token", user_id, user_id, {"status": 403, "error_id": 102.43});
			t6events.addStat("t6App", "POST_authenticate refresh_token", user_id, user_id, {"status": 403, "error_id": 102.43});
			return res.status(403).send(new ErrorSerializer({"id": 17450, "code": 403, "message": "Invalid Refresh Token"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "POST_authenticate refresh_token", null, null, {"status": 400, "error_id": 102.33});
		t6events.addStat("t6App", "POST_authenticate refresh_token", null, null, {"status": 400, "error_id": 102.33});
		return res.status(400).send(new ErrorSerializer({"id": 17550, "code": 400, "message": "Required param grant_type and/or username+password needs to be defined"}).serialize());
	}
});

/**
 * @api {post} /refresh Refresh a JWT Token
 * @apiName Refresh a JWT Token
 * @apiDescription This endpoint allows you to extend access_token expiration date. The extension is the same (5 minutes) as the authenticate endpoint.
 * 
 * @apiGroup 13. Users
 * @apiVersion 2.0.1
 * 
 * @apiHeader {String} Authorization Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept] application/json
 * @apiHeader {String} [Content-Type] application/json
 * 
 * @apiUse NoAuth
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
		return res.status(403).send(new ErrorSerializer({"id": 17850, "code": 403, "message": "Forbidden or Token Expired"}));
	} else {
		let user = users.findOne({ "id": myToken.user_id });
		if ( !user ) {
			return res.status(403).send(new ErrorSerializer({"id": 17851, "code": 403, "message": "Forbidden or Token Expired"}));
		} else {
			user.quotausage = undefined;
			user.data = undefined;
			var payload = JSON.parse(JSON.stringify(user));
			payload.permissions = undefined;
			payload.token = undefined;
			payload.password = undefined;
			payload.gravatar = undefined;
			payload.meta = undefined;
			payload.$loki = undefined;
			payload.geoip = undefined;
			payload.device = undefined;
			payload.token_type = "Bearer";
			payload.scope = "Application";
			payload.sub = "/users/"+user.id;
			payload.iss = req.ip+" - "+user.location.ip;
			if((req.headers["user-agent"]).indexOf("t6iot-library") > -1) {
				payload.location = undefined;
				payload.unsubscription_token = undefined;
				payload.passwordLastUpdated = undefined;
				payload.iftttCode = undefined;
				payload.iftttTrigger_identity = undefined;
				payload.subscription = undefined;
				payload.unsubscription = undefined;
				payload.pushSubscription = undefined;
				payload.reminderMail = undefined;
				payload.changePassword = undefined;
				payload.newsletter = undefined;
				payload.quotausage = undefined;
				payload.data = undefined;
			}
			var token = jsonwebtoken.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });

			// Add the refresh token to the list
			tokens	= db_tokens.getCollection("tokens");
			var refreshPayload = user.id + "." + crypto.randomBytes(40).toString("hex");
			var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, "seconds").format("x");
			tokens.insert({ user_id: user.id, refreshToken: refreshPayload, expiration: refreshTokenExp, });
			t6events.addAudit("t6App", "POST_refresh", user.id, user.id);
			t6events.addStat("t6App", "POST_refresh", user.id, user.id);
			return res.status(200).json( {status: "ok", token: token, refreshToken: refreshPayload, refreshTokenExp: refreshTokenExp} );
		}
	}
});

/**
 * @api {get} /status Get API Status
 * @apiName Get API Status
 * @apiGroup 0. General
 * @apiVersion 2.0.1
 * 
 * @apiUse NoAuth
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
		started_at: moment(appStarted).format("DD/MM/Y H:mm:s"),
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
			"categories": db_classifications.getCollection("categories").count(),
			"annotations": db_classifications.getCollection("annotations").count(),
			"stories": db_stories.getCollection("stories").count(),
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
			"categories": db_classifications.getCollection("categories").find(u).length,
			"annotations": db_classifications.getCollection("annotations").find(u).length,
			"stories": db_stories.getCollection("stories").find(u).length,
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
 * @apiGroup 0. General
 * @apiVersion 2.0.1
 * 
 * @apiUse NoAuth
 * @apiUse 200
 */
router.get("/index", function(req, res, next) {
	res.set("Content-Type", "application/json; charset=utf-8");
	res.status(200).render("index-json");
});


/**
 * @api {get} /terms Get Terms and Privacy
 * @apiName Get Terms and Privacy
 * @apiGroup 0. General
 * @apiVersion 2.0.1
 * 
 * @apiUse NoAuth
 * @apiUse 200
 */
router.get("/terms", function(req, res, next) {
	res.set("Content-Type", "application/json; charset=utf-8");
	res.status(200).render("terms-json");
});

/**
 * @api {get} /compatible-devices Get compatible devices
 * @apiName Get compatible devices
 * @apiGroup 0. General
 * @apiVersion 2.0.1
 * 
 * @apiUse NoAuth
 * @apiUse 200
 */
router.get("/compatible-devices", function(req, res, next) {
	res.set("Content-Type", "application/json; charset=utf-8");
	res.status(200).render("compatible-devices-json");
});

/**
 * @api {get} /open-source-licenses Get open-source-licenses
 * @apiName Get open-source-licenses
 * @apiGroup 0. General
 * @apiVersion 2.0.1
 * 
 * @apiUse NoAuth
 * @apiUse 200
 */
router.get("/open-source-licenses", function(req, res, next) {
	res.set("Content-Type", "application/json; charset=utf-8");
	res.status(200).render("open-source-licenses-json");
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
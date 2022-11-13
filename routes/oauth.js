"use strict";
var express = require("express");
var router = express.Router();
let SCOPE_DESCRIPTIONS = {
	"ifttt": "Event when Datapoint is posted to t6.",
	"email": "User email.",
	"ghome": "."
};

//oauth2.find(({ name }) => name === "oauth").config
//oauth2.find(({ config }) => config.serviceClientId === "secret_service_id");

router.get("/authorize", function (req, res) {
	let client_id = req.query.client_id;
	let response_type = req.query.response_type;
	let redirect_uri = req.query.redirect_uri;
	let scope = req.query.scope;
	let state = req.query.state;
	let application_name = req.query.application_name;
	if ( oauth2.find(({ config }) => config.serviceClientId === client_id) && req.session.user_id ) {
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

router.post("/authorize", function (req, res) {
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

router.post("/token", function(req, res) {
	let grant_type = req.body.grant_type;
	let code = req.body.code;
	let client_id = req.body.client_id;
	let client_secret = req.body.client_secret;
	let redirect_uri = req.body.redirect_uri;

	var queryU = { "iftttCode": code };
	var user = users.findOne(queryU);
	if ( user && oauth2.find(({ config }) => config.serviceClientId === client_id) ) {
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

router.get("/destroy-session", function (req, res) {
	req.session.destroy(function(err) {
		res.render("login", {});
	});
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
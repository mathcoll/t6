"use strict";
var express = require("express");
var router = express.Router();
var UserSerializer = require("../serializers/user");
var PermissionSerializer = require("../serializers/permission");
var ErrorSerializer = require("../serializers/error");
var AccessTokenSerializer = require("../serializers/accessToken");
var refreshTokenSerializer = require("../serializers/refreshToken");
var users;
var tokens;

/**
 * @api {get} /users/list Get Users list
 * @apiName Get Users list
 * @apiGroup 7. Admin User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiUse 401
 */
router.get("/list", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	if ( req.user.role == "admin" ) {
		var size = req.query.size!==undefined?req.query.size:20;
		var page = req.query.page!==undefined?req.query.page:1;
		page = page>0?page:1;
		var offset = Math.ceil(size*(page-1));
		
		users	= db.getCollection("users");
		var json = users.chain().find().simplesort("subscription_date", true).offset(offset).limit(size).data();
		res.status(200).send(new UserSerializer(json).serialize());
	} else {
		res.status(401).send(new ErrorSerializer({"id": 502, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {get} /users/accessTokens Get Key+Secret list
 * @apiName Get Key+Secret list
 * @apiGroup User
 * @apiVersion 2.0.1
 * @apiIgnore use now (#User:Get_User_active_sessions_list).
 * 
 * @apiUse Auth
 * @apiUse 201
 * @apiUse 403
 * @apiUse 412
 * @apiUse 429
 */
router.get("/accessTokens", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	if ( req.user !== undefined ) {
		tokens	= db.getCollection("tokens");
		var accessTokens = tokens.chain().find({"user_id": req.user.id}).simplesort("expiration", true).data();
		res.status(200).send(new AccessTokenSerializer(accessTokens).serialize());
	} else {
		res.status(403).send(new ErrorSerializer({"id": 204,"code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /users/:user_id Get User
 * @apiName Get User
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} user_id User ID
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/:user_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var user_id = req.params.user_id;
	if ( req.user.id == user_id ) {
		users	= db.getCollection("users");
		res.status(200).send(new UserSerializer(users.find({"id": { "$eq": user_id }}).simplesort("expiration", true).data()).serialize());
	} else {
		res.status(403).send(new ErrorSerializer({"id": 16, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /users/me/sessions Get User active sessions list
 * @apiName Get User active sessions list
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 500
 */
router.get("/me/sessions", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	if ( req.user.id ) {
		tokens	= dbTokens.getCollection("tokens");
		var expired = tokens.find( { "expiration" : { "$lt": moment().format("X") } } );
		if ( expired ) {
			tokens.remove(expired);
			db.save();
		}
		res.status(200).send(new refreshTokenSerializer(tokens.find({"user_id": { "$eq": req.user.id }})).serialize());
	} else {
		res.status(403).send(new ErrorSerializer({"id": 17, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /users/me/token Get self Current Token
 * @apiName Get self Current Token
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/me/token", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	if ( req.user !== undefined ) {
		var options = {
			url: "https://en.gravatar.com/" + req.user.mail_hash + ".json",
			headers: {
				"User-Agent": "Mozilla/5.0 Gecko/20100101 Firefox/44.0"
			}
		};
		request(options, function(error, response, body) {
			if ( !error && response.statusCode !== 404 ) {
				req.user.gravatar = JSON.parse(body);
			} else {
				req.user.gravatar = {};
			}
			var json = new UserSerializer(req.user).serialize();
			if ( json !== undefined ) {
				res.status(200).send(json);
			} else {
				res.status(404).send(new ErrorSerializer({"id": 11,"code": 404, "message": "Not Found"}).serialize());
			}
		});
	} else {
		res.status(403).send(new ErrorSerializer({"id": 10,"code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /users Create New User
 * @apiName Create New User
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiParam {String} firstName The User First Name
 * @apiParam {String} lastName The User Last Name
 * @apiParam {String} email The User Email address
 * 
 * @apiUse 201
 * @apiUse 412
 * @apiUse 429
 */
router.post("/", function (req, res) {
	if ( !req.body.email ) {
		res.status(412).send(new ErrorSerializer({"id": 9,"code": 412, "message": "Precondition Failed"}).serialize());
	} else {
		users	= db.getCollection("users");
		
		if ( users.find({"email": { "$eq": req.body.email }}).length > 0 ) {
			res.status(409).send(new ErrorSerializer({"id": 9.5,"code": 409, "message": "Conflict: User email already exists"}).serialize());
		} else {
			var my_id = uuid.v4();

			var token = passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.");
			var new_token = {
				user_id:			my_id,
				key:				passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ."),
				secret:				passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ."),
				token:				token,
				expiration:			"",
			};
			var new_user = {
				id:					my_id,
				firstName:			req.body.firstName!==undefined?req.body.firstName:"",
				lastName:			req.body.lastName!==undefined?req.body.lastName:"",
				email:				req.body.email!==undefined?req.body.email:"",
				role:				"free", // no admin creation from the API
				subscription_date:  moment().format("x"),
				token:				token,
				unsubscription_token: passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),
				//key:				new_token.key,
				//secret:				new_token.secret
			};
			t6events.add("t6Api", "user add", new_user.id);
			users.insert(new_user);

			res.render("emails/welcome", {user: new_user, token: new_token.token}, function(err, html) {
				var mailOptions = {
					from: from,
					bcc: bcc!==undefined?bcc:null,
					to: new_user.firstName+" "+new_user.lastName+" <"+new_user.email+">",
					subject: "Welcome to t6",
					text: "Html email client is required",
					html: html
				};
				t6mailer.sendMail(mailOptions).then(function(info){
					//console.log("info", info);
					t6events.add("t6App", "user welcome mail", new_user.id);
					res.header("Location", "/v"+version+"/users/"+new_user.id);
					res.status(201).send({ "code": 201, message: "Created", user: new UserSerializer(new_user).serialize(), token: new_token });
				}).catch(function(error) {
					console.log("t6mailer.sendMail error", error.info.code, error.info.response, error.info.responseCode, error.info.command);
					res.status(500).send({ "code": 500, message: "Internal Error"});
				});
			});
		}
	}
});

/**
 * @api {post} /users/accessTokens Generate Access Tokens
 * @apiName Generate Access Tokens
 * @apiGroup User
 * @apiVersion 2.0.1
 * @apiIgnore use now (#User:Authenticate).
 * 
 * @apiParam {String{128}} [memo] Free memo string
 * 
 * @apiUse Auth
 * @apiUse 201
 * @apiUse 403
 * @apiUse 412
 * @apiUse 429
 */
router.post("/accessTokens", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	if ( req.user !== undefined ) {
		if ( !req.user.id ) {
			res.status(412).send(new ErrorSerializer({"id": 203,"code": 412, "message": "Precondition Failed"}).serialize());
		} else {
			var new_token = {
				user_id:			req.user.id,
				key:				passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ."),
				secret:				passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ."),
				memo:				(req.body.memo).substring(0, 128),
				expiration:			moment().add(24, "hours").format("x"),
			};
			var tokens	= db.getCollection("tokens");
			tokens.insert(new_token);
			db.save();
			var expired = tokens.find(
				{ "$and": [
					{"user_id" : req.user.id},
					{ "expiration" : { "$lt": moment().format("x") } },
					{ "expiration" : { "$ne": "" } },
				]}
			);
			if ( expired ) {
				tokens.remove(expired);
				db.save();
			}
			res.status(201).send({ "code": 201, "id": 201.1, message: "Created", accessToken: new AccessTokenSerializer(new_token).serialize() });
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 204,"code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /users/token/:token Reset a password
 * @apiName Reset a password
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiParam {String} token Token to identify the user
 * @apiParam {String} password The new password
 * 
 * @apiUse 201
 * @apiUse 403
 * @apiUse 404
 * @apiUse 412
 * @apiUse 429
 */
router.post("/token/:token([0-9a-zA-Z\.]+)", function (req, res) {
	if ( !req.body.password ) {
		res.status(412).send(new ErrorSerializer({"id": 8.3,"code": 412, "message": "Precondition Failed"}).serialize());
	} else {
		users	= db.getCollection("users");
		var user = (users.chain().find({ "token": req.params.token }).data())[0];
		//console.log({ "token": req.params.token });
		//console.log(users);
		if ( user ) {
			user.password = bcrypt.hashSync(req.body.password, 10);
			user.passwordLastUpdated = parseInt(moment().format("x"), 10);
			user.token = null;
			users.update(user);
			db.save();
			t6events.add("t6App", "user reset password", user.id);
			res.header("Location", "/v"+version+"/users/"+user.id);
			res.status(200).send({ "code": 200, message: "Successfully updated", user: new UserSerializer(user).serialize() }); 
			
		} else {
			res.status(404).send(new ErrorSerializer({"id": 8.4,"code": 404, "message": "Not Found"}).serialize());
		}
	}
});

/**
 * @api {post} /users/instruction Reset a password instruction
 * @apiName Reset a password instruction
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiParam {String} email to identify the user
 * 
 * @apiUse 200
 * @apiUse 404
 * @apiUse 412
 * @apiUse 500
 */
router.post("/instruction", function (req, res) {
	if ( !req.body.email ) {
		res.status(412).send(new ErrorSerializer({"id": 8.3,"code": 412, "message": "Precondition Failed"}).serialize());
	} else {
		var query = { "email": req.body.email };
		users	= db.getCollection("users");
		var user = (users.chain().find(query).data())[0];
		if ( user ) {
			var token = passgen.create(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.");
			user.token = token;
			users.update(user);
			db.save();
			
			res.render("emails/forgot-password", {user: user, token: token}, function(err, html) {
				var to = user.firstName+" "+user.lastName+" <"+user.email+">";
				var mailOptions = {
					from: from,
					bcc: bcc!==undefined?bcc:null,
					to: to,
					subject: "Reset your password to t6",
					text: "Html email client is required",
					html: html
				};
				transporter.sendMail(mailOptions, function(err, info){
					if( err ){
						res.status(500).send({ "code": 500, message: "Error updating user" }); 
					} else {
						t6events.add("t6App", "user forgot password mail", user.id);
						res.header("Location", "/v"+version+"/users/"+user.id);
						res.status(200).send({ "code": 200, message: "Successfully updated" }); 
					}
				});
			});
		} else {
			res.status(404).send({ "code": 404, message: "Error updating user" }); 
		}
	}
});

/**
 * @api {put} /users/:user_id Edit a User
 * @apiName Edit a User
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} user_id User ID
 * @apiParam {String} [firstName] The updated User First Name
 * @apiParam {String} [lastName] The updated User Last Name
 * @apiParam {String} [email] The updated User Email address
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 412
 * @apiUse 429
 */
router.put("/:user_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var user_id = req.params.user_id;
	if ( !( (req.body.email || req.body.lastName || req.body.firstName ) || ( req.body.password ) ) ) {
		res.status(412).send(new ErrorSerializer({"id": 8,"code": 412, "message": "Precondition Failed"}).serialize());
	} else {
		users	= db.getCollection("users");
		if ( req.user.id == user_id ) {
			var result;
			users.findAndUpdate(
				function(i){return i.id==user_id},
				function(item){
					item.firstName		= req.body.firstName!==undefined?req.body.firstName:item.firstName;
					item.lastName		= req.body.lastName!==undefined?req.body.lastName:item.lastName;
					item.email			= req.body.email!==undefined?req.body.email:item.email;
					item.update_date	= moment().format("x");
					if ( req.body.password ) {
						item.password = bcrypt.hashSync(req.body.password, 10);
					}
					result = item;
				}
			);
			db.save();
			res.header("Location", "/v"+version+"/users/"+user_id);
			res.status(200).send({ "code": 200, message: "Successfully updated", user: new UserSerializer(result).serialize() });
		} else {
			res.status(403).send(new ErrorSerializer({"id": 7,"code": 403, "message": "Forbidden"}).serialize());
		}
	}
});

/**
 * @api {delete} /users/:user_id Delete a User
 * @apiName Delete a User
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} user_id User ID
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 * @apiUse 429
 */
router.delete("/:user_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var user_id = req.params.user_id;
	if ( req.user.id == user_id ) { //Well ... not sure
		users	= db.getCollection("users");
		var u = users.find({"id": { "$eq": user_id }});
		if (u) {
			users.remove(u);
			res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: user_id }); // TODO: missing serializer
		} else {
			res.status(404).send(new ErrorSerializer({"id": 6,"code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 5,"code": 403, "message": "Forbidden"}).serialize());
	}
});

module.exports = router;

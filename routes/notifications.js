"use strict";
var express = require("express");
var router = express.Router();
var UserSerializer = require("../serializers/user");
var ErrorSerializer = require("../serializers/error");
var users;

/**
 * @api {get} /notifications/debug/:mail Get html of email
 * @apiName Get html of email
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiHeader {String} [Content-Type] text/html
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiUse 200
 * @apiUse 403
 */
router.get("/debug/:mail", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function(req, res) {
	var mail = req.params.mail;
	var agent = useragent.parse(req.headers["user-agent"]);
	
	if ( req.user.role === "admin" ) {
		res.render("emails/"+mail, {
			currentUrl: req.path,
			user: req.user,
			device: typeof agent.toAgent()!=="undefined"?agent.toAgent():"",
			geoip: geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{}
		});
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18, "code": 403, "message": "Forbidden, You should be an Admin!"}).serialize());
	}
});

/**
 * @api {get} /notifications/list/unsubscribed Get list of unsubscribed notifications
 * @apiName Get list of unsubscribed notifications
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 * @apiUse 403
 */
router.get("/list/unsubscribed", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var user_id = req.user.id;
	if ( req.user && user_id ) {
		users	= db.getCollection("users");
		var json = users.findOne( { id: user_id } );
		//t6console.log(json.unsubscription);
		res.status(200).send({unsubscription: json.unsubscription, unsubscription_token: json.unsubscription_token });
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /notifications/mail/reminder Send reminder Email to Users
 * @apiName Send reminder Email to Users
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/reminder", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		users	= db.getCollection("users");
		var query = { "$and": [
					{"subscription_date": { "$lte": moment().subtract(7, "days") }},
					{"reminderMail": undefined},
					{"token": null},
					{ "$or": [{"unsubscription": undefined}, {"unsubscription.reminder": undefined}, {"unsubscription.reminder": null}] },
				]};
		var json = users.find( query );
		
		if ( json.length > 0 ) {
			/* Send a Reminder Email to each users */
			json.forEach(function(user) {
				res.render("emails/reminder", {user: user}, function(err, html) {
					var to = user.firstName+" "+user.lastName+" <"+user.email+">";
					var mailOptions = {
						from: from,
						bcc: bcc,
						to: to,
						list: {
							unsubscribe: {
								url: baseUrl_https+"/mail/"+user.email+"/unsubscribe/reminder/"+user.unsubscription_token+"/",
								comment: "Unsubscribe from this notification"
							},
						},
						subject: "t6 Reminder",
						text: "Html email client is required",
						html: html
					};
					t6console.debug(mailOptions);
					t6mailer.sendMail(mailOptions).then(function(info){
						users.findAndUpdate(
								function(i){return i.id==user.id;},
								function(item){
									item.reminderMail = parseInt(moment().format("x"), 10);
								}
						);
						db.save();
					}).catch(function(err){
						var err = new Error("Internal Error");
						err.status = 500;
						res.status(err.status || 500).render(err.status, {
							title : "Internal Error"+app.get("env"),
							user: req.session.user,
							currentUrl: req.path,
							err: err
						});
					});
				});
			});
			res.status(202).send(new UserSerializer(json).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({"id": 20, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 19, "code": 403, "message": "Forbidden "+req.user.role+"/"+process.env.NODE_ENV}).serialize());
	}
});

/**
 * @api {get} /notifications/mail/changePassword Send Password Expiration Email to Users
 * @apiName Send Password Expiration Email to Users
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/changePassword", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		users	= db.getCollection("users");
		//var query = {"token": { "$eq": null }};
		var query = { "$and": [
					{"$or": [{"passwordLastUpdated": { "$lte": moment().subtract(3, "months") }}, {passwordLastUpdated: undefined}]},
					{"changePassword": { "$lte": moment().subtract(3, "months") }},
					{"token": null},
					{ "$or": [{"unsubscription": undefined}, {"unsubscription.changePassword": undefined}, {"unsubscription.changePassword": null}] },
				]};
		var json = users.find( query );
		if ( json.length > 0 ) {
			/* Send a Reminder Email to each users */
			json.forEach(function(user) {
				//t6console.debug(user.firstName+" "+user.lastName+" <"+user.email+">");
				//t6console.debug(" --> 3months"+ moment().subtract(3, "months"));
				//t6console.debug(" --> subscription_date:" + user.subscription_date + " = " + moment(user.subscription_date, "x").format("DD/MM/YYYY, HH:mm"));
				//t6console.debug(" --> changePasswordMail:" + user.changePasswordMail + " = " + moment(user.changePasswordMail, "x").format("DD/MM/YYYY, HH:mm"));
				//t6console.debug(" --> passwordLastUpdated:" + user.passwordLastUpdated + " = " + moment(user.passwordLastUpdated, "x").format("DD/MM/YYYY, HH:mm"));
				res.render("emails/change-password", {user: user}, function(err, html) {
					var to = user.firstName+" "+user.lastName+" <"+user.email+">";
					var mailOptions = {
						from: from,
						bcc: bcc,
						to: to,
						list: {
							unsubscribe: {
								url: baseUrl_https+"/mail/"+user.email+"/unsubscribe/changePassword/"+user.unsubscription_token+"/",
								comment: "Unsubscribe from this notification"
							},
						},
						subject: "t6 Password Expiration",
						text: "Html email client is required",
						html: html
					};
					//t6console.debug(mailOptions);
					t6mailer.sendMail(mailOptions).then(function(info){
						users.findAndUpdate(
								function(i){return i.id==user.id;},
								function(item){
									item.changePassword = parseInt(moment().format("x"), 10);
								}
						);
						db.save();
					}).catch(function(err){
						var err = new Error("Internal Error");
						err.status = 500;
						res.status(err.status || 500).render(err.status, {
							title : "Internal Error"+app.get("env"),
							user: req.session.user,
							currentUrl: req.path,
							err: err
						});
					});
				});
			});
			res.status(202).send(new UserSerializer(json).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({"id": 20, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18, "code": 403, "message": "Forbidden "+req.user.role+"/"+process.env.NODE_ENV}).serialize());
	}
});

/**
 * @api {get} /notifications/mail/newsletter Send newsletter to subscribers
 * @apiName Send newsletter to subscribers
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/newsletter", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	if ( req.user.role === "admin" ) {
		var year = req.query.year;
		var template = req.query.template;
		var subject = typeof req.query.subject!=="undefined"?req.query.subject:"📰 t6 updates";
		users	= db.getCollection("users");
		var query = { "$and": [
					{ "$or": [{"unsubscription": undefined}, {"unsubscription.newsletter": undefined}, {"unsubscription.newsletter": null}] },
				]};
		var json = users.chain().find( query ).offset(offset).limit(size).data();
		if ( json.length > 0 && year && template ) {
			/* Send a newsletter to each subscribers */
			json.forEach(function(user) {
				t6console.info("Rendering email body for " + user.firstName+" "+user.lastName+" <"+user.email+">");
				res.render("emails/newsletters/"+template, {user: user}, function(err, html) {
					var to = user.firstName+" "+user.lastName+" <"+user.email+">";
					var mailOptions = {
						from: from,
						bcc: bcc,
						to: to,
						list: {
							unsubscribe: {
								url: baseUrl_https+"/mail/"+user.email+"/unsubscribe/newsletter/"+user.unsubscription_token+"/",
								comment: "Unsubscribe from this newsletter"
							},
						},
						subject: subject,
						text: "Html email client is required",
						html: html
					};
					if(!req.query.dryrun || req.query.dryrun === "false") {
						//t6console.debug(mailOptions);
						t6mailer.sendMail(mailOptions).then(function(info){
							users.findAndUpdate(
									function(i){return i.id==user.id;},
									function(item){
										item.newsletter = parseInt(moment().format("x"), 10);
									}
							);
							db.save();
						}).catch(function(err){
							var err = new Error("Internal Error");
							err.status = 500;
							res.status(err.status || 500).render(err.status, {
								title : "Internal Error"+app.get("env"),
								user: req.session.user,
								currentUrl: req.path,
								err: err
							});
						});
					}
				});
			});
			res.status(202).send(new UserSerializer(json).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({"id": 21, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18, "code": 403, "message": "Forbidden "+req.user.role+"/"+process.env.NODE_ENV}).serialize());
	}
});

module.exports = router;

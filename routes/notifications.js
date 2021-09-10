"use strict";
var express = require("express");
var router = express.Router();
var UserSerializer = require("../serializers/user");
var ErrorSerializer = require("../serializers/error");
let timer;

function planNewsletter(req, res, recipients, template, subject, taskType) {
	/* add newsletter to job queue to be sent later */
	recipients.forEach(function(user) {
		t6console.debug(`Rendering email body for ${user.firstName} ${user.lastName} <${user.email}>`);
		res.render(`emails/${template}`, {user: user, tpl: template, data: user.data}, function(err, html) {
			t6console.debug(`With data`, user.data);
			if(!err) {
				var to = `${user.firstName} ${user.lastName} <${user.email}>`;
				var mailOptions = {
					from: from,
					to: to,
					user_id: user.id,
					list: {
						unsubscribe: {
							url: `${baseUrl_https}/mail/${user.email}/unsubscribe/${taskType}/${user.unsubscription_token}/`,
							comment: `Unsubscribe from this ${taskType}`
						},
					},
					subject: subject,
					text: "Html email client is required",
					html: html
				};
				t6jobs.add({taskType: taskType, time: Date.now(), ttl: 3600, user_id: req.user.id, metadata: {mailOptions}});
			} else {
				t6console.error(`Error scheduling a ${taskType}`, err);
			}
		});
	});
}

function planPush(req, res, recipients, body, title, options) {
	/* add newsletter to job queue to be sent later */
	recipients.forEach(function(user) { // TODO foreach or Array.map ?
		let payload = "{\"type\": \"message\", \"title\": \""+title+"\", \"body\": \""+body+"\", \"badge\": \""+options.badge+"\", \"icon\": \""+options.icon+"\", \"vibrate\":"+JSON.stringify(options.vibrate)+", \"actions\":"+JSON.stringify(options.actions)+"}";
		t6console.debug(`Rendering push notification to ${user.firstName} ${user.lastName}`);
		t6console.debug(payload);
		t6jobs.add({taskType: "push", time: Date.now(), ttl: 3600, user_id: req.user.id, metadata: {"pushSubscription": user.pushSubscription, "payload": payload, "user_id": user.id}});
	});
}

function sendPush(pushers, dryrun, recurring, user_id, limit, cpt=0) {
	t6console.debug("sendPush: GO ", pushers.length, "limit", limit, "cpt", cpt);
	pushers.map(function(push) {
		/* Send a push to each subscribers */
		if(!dryrun || dryrun === false) {
			t6notifications.sendPush(push.metadata, push.metadata.payload).then(function(info){
				t6console.debug(info);
				return (!dryrun || dryrun === false)?{"status": `Sending push to ${limit} recipients.`}:{"status": `Simulating push to ${limit} recipients.`};
			}).catch(function(error){
				t6console.error("error", error);
				return { "status": "Internal Error "+app.get("env") };
			});
			cpt++;
			if(Number.isInteger(recurring) && cpt<limit) {
				timer = setTimeout(function() {
					sendPush(t6jobs.get({"taskType": "push", user_id: user_id}, recurring!==null?1:limit), dryrun, recurring, user_id, limit, cpt);
				}, recurring);
				t6console.debug(`Scheduling another task to send push in ${recurring}ms (cpt=${cpt}<${limit}).`);
			} else {
				t6console.debug(`Not recurring (cpt=${cpt}>=${limit}).`);
			}
			t6console.debug( "Removing", t6jobs.remove({"job_id": push.job_id}, 1) ); // remove job from list
		}
	});
	return (!dryrun || dryrun === false)?{"status": `Sending push to ${limit} recipients.`}:{"status": `Simulating push to ${limit} recipients.`};
}

function sendNewsletter(newsletters, dryrun, recurring, user_id, limit, cpt=0) {
	t6console.debug("sendNewsletter: GO ", newsletters.length, "limit", limit, "cpt", cpt);
	newsletters.map(function(newsletter) {
		t6console.debug(newsletter.metadata.mailOptions.to);
		/* Send a newsletter to each subscribers */
		if(!dryrun || dryrun === false) {
			t6mailer.sendMail(newsletter.metadata.mailOptions).then(function(info){
				users.findAndUpdate(
					function(i){return i.id===newsletter.metadata.mailOptions.user_id;},
					function(item){
						item.newsletter = parseInt(moment().format("x"), 10);
					}
				);
				db_users.save();
				t6console.debug( "Removing", t6jobs.remove({"job_id": newsletter.job_id}, 1) ); // remove job from list
				cpt++;
				if(Number.isInteger(recurring) && cpt<limit) {
					timer = setTimeout(function() {
						sendNewsletter(t6jobs.get({"taskType": "newsletter", user_id: user_id}, recurring!==null?1:limit), dryrun, recurring, user_id, limit, cpt);
					}, recurring);
					t6console.debug(`Scheduling another task to send Newsletter in ${recurring}ms (cpt=${cpt}<${limit}).`);
				} else {
					t6console.debug(`Not recurring (cpt=${cpt}>=${limit}).`);
				}
				return (!dryrun || dryrun === false)?{"status": `Sending newsletter to ${limit} recipients.`}:{"status": `Simulating newsletter to ${limit} recipients.`};
			}).catch(function(error){
				t6console.error("error", error);
				return { "status": "Internal Error "+app.get("env") };
			});
		}
	});
	return (!dryrun || dryrun === false)?{"status": `Sending newsletter to ${limit} recipients.`}:{"status": `Simulating newsletter to ${limit} recipients.`};
}

/**
 * @api {get} /notifications/mail/preview/ Preview html of a Newsletter
 * @apiName Preview html of a Newsletter
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiHeader {String} [Content-Type] text/html
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 200
 * @apiUse 403
 */
router.get("/mail/preview/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function(req, res) {
	let template = req.query.template;
	let agent = useragent.parse(req.headers["user-agent"]);

	if ( req.user.role === "admin" ) {
		let data = {
			currentUrl: req.path,
			tpl: template,
			user: req.user,
			device: typeof agent.toAgent()!=="undefined"?agent.toAgent():"",
			geoip: geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{},
			data: [{"time":"","count":18,"meanDurationInMilliseconds":2629.742100847405625,"spreadDurationInMilliseconds":10408.405373999375,"verb":"GET"},{"time":"","count":79,"meanDurationInMilliseconds":2629.74210084745015625,"spreadDurationInMilliseconds":10508.405373943743896484375,"verb":"PUT"},{"time":"","count":59,"meanDurationInMilliseconds":29.742100839999999095859375,"spreadDurationInMilliseconds":1008.405366243796484375,"verb":"POST"}]
		};
		data.quota = quota[req.user.role];
		res.render(`emails/${template}`, data, function(err, html) {
			if(!err) {
				res.status(200).send(html);
			} else {
				res.status(500).send(new ErrorSerializer({"id": 18.1, "code": 403, "message": "Error rendering a newsletter"}).serialize());
				t6console.error("Error rendering a newsletter", err);
			}
		});
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18.2, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /notifications/list/unsubscribed List unsubscribed notifications
 * @apiName List unsubscribed notifications
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 * @apiUse 403
 */
router.get("/list/unsubscribed", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var user_id = req.user.id;
	if ( req.user && user_id ) {
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
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/reminder", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
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
						user_id: user.id,
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
								function(i){return i.id===user.id;},
								function(item){
									item.reminderMail = parseInt(moment().format("x"), 10);
								}
						);
						db_users.save();
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
		res.status(403).send(new ErrorSerializer({"id": 19, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /notifications/mail/changePassword Send Password Expiration Email
 * @apiName Send Password Expiration Email
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/changePassword", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
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
						user_id: user.id,
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
						db_users.save();
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
		res.status(403).send(new ErrorSerializer({"id": 18, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /notifications/mail/newsletter/count Count Newsletter subscribers
 * @apiName Count Newsletter subscribers
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/newsletter/count", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let query = { "$or": [{"unsubscription": undefined}, {"unsubscription.newsletter": undefined}, {"unsubscription.newsletter": null}] };
		var recipients = users.chain().find( query ).data();
		if ( recipients.length > 0 ) {
			res.status(200).send({"subscribers": recipients.length});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 21, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /notifications/mail/newsletter/subscribers Get Newsletter subscribers
 * @apiName Get Newsletter subscribers
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/newsletter/subscribers", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let query = { "$or": [{"unsubscription": undefined}, {"unsubscription.newsletter": undefined}, {"unsubscription.newsletter": null}] };
		var recipients = users.chain().find( query ).data();
		if ( recipients.length > 0 ) {
			let csv = "";
			csv += `"name","email"\n`;
			recipients.map(function(user) {
				csv += `"${user.firstName} ${user.lastName}", "${user.email}"\n`;
			});
			res.setHeader("content-type", "application/csv");
			res.status(200).send(csv);
		} else {
			res.status(404).send(new ErrorSerializer({"id": 21, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/mail/monthly-report/plan Schedule a newsletter
 * @apiName Schedule a monthly-report
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.post("/mail/monthly-report/plan", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let subject = `t6 monthly activity report`;
		let influxQuery = `SELECT top(monthly_usage, user_id, 10) FROM (SELECT count(url) as monthly_usage FROM quota4w.requests WHERE time > now() - 4w GROUP BY user_id)`;
		let recipients = [];
		//t6console.debug("get all actives users from influxDb", influxQuery);
		// get all actives users
		dbInfluxDB.query(influxQuery).then((activesUsers) => {
			if ( activesUsers.length > 0 ) {
				activesUsers.map(function(d, i) {
					//t6console.debug("Looking for ", d.user_id);
					let query = { "$and": [
						{ "id": { "$eq": d.user_id } },
						//{ "$or": [{"unsubscription": undefined}, {"unsubscription.monthlyreport": undefined}, {"unsubscription.monthlyreport": null}] },
					]};
					let recipient = users.findOne(query);
					if ( recipient!==null ) {
						//t6console.debug("Found ", recipient);
						let influxQuery2 = `SELECT COUNT(url), MEAN(durationInMilliseconds) as meanDurationInMilliseconds, SPREAD(durationInMilliseconds) as spreadDurationInMilliseconds from quota4w.requests WHERE user_id='${d.user_id}' GROUP BY verb`;
						dbInfluxDB.query(influxQuery2).then((data) => {
							if ( data.length > 0 ) {
								recipient.data = data.map(function(d, i) {
									return typeof d==="object"?d:null;
								});
								planNewsletter(req, res, [recipient], "monthly-report", subject, "monthly-report");
								recipients.push(recipient);
							} else {
								//t6console.debug("No data for user", recipient, influxQuery2);
							}
						});
					} else {
						//t6console.debug("Can't find", d.user_id, recipient);
					}
				});
				res.status(202).send(new UserSerializer(recipients).serialize());
			} else {
				res.status(404).send(new ErrorSerializer({"id": 23, "code": 404, "message": "Not Found"}).serialize());
			}
		});
	} else {
		res.status(403).send(new ErrorSerializer({"id": 24, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/mail/newsletter/plan Schedule a newsletter
 * @apiName Schedule a newsletter
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.post("/mail/newsletter/plan", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var limit = typeof req.query.limit!=="undefined"?req.query.limit:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(limit*(page-1));
	if ( req.user.role === "admin" ) {
		var template = req.query.template;
		var subject = typeof req.query.subject!=="undefined"?req.query.subject:"📰 t6 updates";
		var query = { "$and": [
			{ "$or": [{"unsubscription": undefined}, {"unsubscription.newsletter": undefined}, {"unsubscription.newsletter": null}] },
		]};
		var recipients = users.chain().find( query ).offset(offset).limit(limit).data();
		if ( recipients.length > 0 && template ) {
			planNewsletter(req, res, recipients, `newsletters/${template}`, subject, "newsletter");
			res.status(202).send(new UserSerializer(recipients).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({"id": 22, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 23, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/mail/newsletter/send Send a scheduled newsletter
 * @apiName Send a scheduled newsletter
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.post("/mail/newsletter/send", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let limit = typeof req.query.limit!=="undefined"?req.query.limit:20;
	let dryrun = typeof req.query.dryrun!=="undefined"?str2bool(req.query.dryrun):false;
	let recurring = typeof req.query.recurring!=="undefined"?parseInt(req.query.recurring, 10):null;
	if ( req.user.role === "admin" ) {
		let newsletters = t6jobs.get({taskType: "newsletter", user_id: req.user.id}, recurring!==null?1:limit);
		t6console.debug("newsletters : ", newsletters);
		if(newsletters.length > 0) {
			let response = sendNewsletter(newsletters, dryrun, recurring, req.user.id, limit, 0);
			res.status(202).send({"response": response});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 18.2, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 19, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/mail/monthly-report/send Send a scheduled newsletter
 * @apiName Send a scheduled monthly-report
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.post("/mail/monthly-report/send", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let limit = typeof req.query.limit!=="undefined"?req.query.limit:20;
	let dryrun = typeof req.query.dryrun!=="undefined"?str2bool(req.query.dryrun):false;
	let recurring = typeof req.query.recurring!=="undefined"?parseInt(req.query.recurring, 10):null;
	if ( req.user.role === "admin" ) {
		let reports = t6jobs.get({taskType: "monthly-report", user_id: req.user.id}, recurring!==null?1:limit);
		t6console.debug("reports : ", reports);
		if(reports.length > 0) {
			let response = sendNewsletter(reports, dryrun, recurring, req.user.id, limit, 0);
			res.status(202).send({"response": response});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 18.2, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 19, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /notifications/push/count Count Push subscribers
 * @apiName Count Push subscribers
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.get("/push/count", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let query = { "$and": [ {"pushSubscription": { "$ne": null}}, {"pushSubscription": { "$ne": undefined}}, { "pushSubscription.endpoint": { "$ne": null}}, { "pushSubscription.endpoint": { "$ne": undefined}} ] };
		var recipients = users.chain().find( query ).data();
		if ( recipients.length > 0 ) {
			res.status(200).send({"subscribers": recipients.length});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 21.2, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18.2, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/push/plan Schedule a push
 * @apiName Schedule a push
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin

 * @apiBody {String} [title="📰 t6 updates"] Notification title
 * @apiBody {String} [icon] Notification icon
 * @apiBody {Array} [vibrate] Notification array of vibration
 * @apiBody {Array} [actions] Notification array of actions
 * @apiBody {String} [badge] Notification badge
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.post("/push/plan", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let limit = typeof req.query.limit!=="undefined"?req.query.limit:20;
	let page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	let offset = Math.ceil(limit*(page-1));
	if ( req.user.role === "admin" ) {
		let body = req.body.body;
		let title = typeof req.body.title!=="undefined"?req.body.title:"📰 t6 updates";
		let icon = typeof req.body.icon!=="undefined"?req.body.icon:null;
		let vibrate = typeof req.body.vibrate!=="undefined"?req.body.vibrate:[]; 
		let actions = typeof req.body.actions!=="undefined"?req.body.actions:[]; 
		let badge = typeof req.body.badge!=="undefined"?req.body.badge:null;
		let options = {icon, vibrate, actions, badge};
		let query = { "$and": [ {"pushSubscription": { "$ne": null}}, {"pushSubscription": { "$ne": undefined}}, { "pushSubscription.endpoint": { "$ne": null}}, { "pushSubscription.endpoint": { "$ne": undefined}} ] };
		var recipients = users.chain().find( query ).offset(offset).limit(limit).data();
		if ( recipients.length > 0 && body && title ) {
			planPush(req, res, recipients, body, title, options);
			t6console.debug(body, title, options);
			res.status(202).send(new UserSerializer(recipients).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({"id": 21, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 18, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/push/send Send a scheduled push
 * @apiName Send a scheduled push
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 *
 * @apiBody {Integer} [limit] 
 * @apiBody {boolean} [dryrun] 
 * @apiBody {Integer} [recurring] 
 * @apiBody {String} [recurring] 
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.post("/push/send", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let limit = typeof req.query.limit!=="undefined"?req.query.limit:20;
	let dryrun = typeof req.query.dryrun!=="undefined"?str2bool(req.query.dryrun):false;
	let recurring = typeof req.query.recurring!=="undefined"?parseInt(req.query.recurring, 10):null;
	if ( req.user.role === "admin" ) {
		let pushers = t6jobs.get({taskType: "push", user_id: req.user.id}, recurring!==null?1:limit);
		t6console.debug("pushs : ", pushers);
		if(pushers.length > 0) {
			let response = sendPush(pushers, dryrun, recurring, req.user.id, limit, 0);
			res.status(202).send({"response": response});
		} else {
			res.status(404).send(new ErrorSerializer({"id": 18.3, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({"id": 19.3, "code": 403, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/mail/newsletter/stop Stop a newsletter sending
 * @apiName Stop a newsletter sending
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 403
 * @apiUse 404
 */
router.post("/mail/newsletter/stop", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		clearTimeout(timer);
		res.status(202).send({"response": "timer is stopped"});
	} else {
		res.status(403).send(new ErrorSerializer({"id": 20, "code": 403, "message": "Forbidden"}).serialize());
	}
});

module.exports = router;

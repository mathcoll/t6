"use strict";
var express = require("express");
var router = express.Router();
var UserSerializer = require("../serializers/user");
var ErrorSerializer = require("../serializers/error");
var DeadsensorSerializer = require("../serializers/deadsensor");
let timer;

async function planNewsletter(req, res, recipients, template, subject, taskType) {
	await new Promise((resolve, reject) => {
		/* add newsletter to job queue to be sent later */
		recipients.forEach(function(user) {
			t6console.debug(`Rendering email body for ${user.firstName} ${user.lastName} <${user.email}>`);
			res.render(`emails/${template}`, {user: user, tpl: template, data: user.data, quotausage: user.quotausage, quota: quota[user.role]}, function(err, html) {
				//t6console.debug(`With data`, user.data);
				//t6console.debug(`With quotausage`, user.quotausage);
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
					if(taskType === "monthlyreport") {
						mailOptions.bcc = from;
					}
					t6jobs.add({taskType: taskType, time: Date.now(), ttl: 3600, user_id: req.user.id, metadata: {mailOptions}});
					resolve();
				} else {
					t6console.error(`Error scheduling a ${taskType}`, err);
					reject();
				}
			});
		});
	});
}

function planPush(req, res, recipients, body, title, options) {
	/* add newsletter to job queue to be sent later */
	recipients.forEach(function(user) { // TODO foreach or Array.map ?
		let payload = "{\"type\": \"message\", \"title\": \""+title+"\", \"body\": \""+body+"\", \"badge\": \""+options.badge+"\", \"icon\": \""+options.icon+"\", \"vibrate\":"+JSON.stringify(options.vibrate)+", \"actions\":"+JSON.stringify(options.actions)+", \"data\":"+JSON.stringify(options.actions)+"}";
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

function sendNewsletter(newsletters, taskType, dryrun, recurring, user_id, limit, cpt=0) {
	t6console.debug("sendNewsletter: GO ", taskType,  newsletters.length, "limit", limit, "cpt", cpt);
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
						sendNewsletter(t6jobs.get({"taskType": taskType, user_id: user_id}, recurring!==null?1:limit), taskType, dryrun, recurring, user_id, limit, cpt);
					}, recurring);
					t6console.debug(`Scheduling another task to send Newsletter in ${recurring}ms (cpt=${cpt}<${limit}).`);
				} else {
					t6console.debug(`Not recurring (cpt=${cpt}>=${limit}).`);
				}
				let totalTime = moment.duration(limit*recurring).asHours();
				return (!dryrun || dryrun === false)?{"status": `Sending newsletter to ${limit} recipients within ${totalTime} hours.`}:{"status": `Simulating newsletter to ${limit} recipients.`};
			}).catch(function(error){
				t6console.error("error", error);
				if(error.responseCode===550) { // 550 5.7.1 Spam Detected - Mail Rejected
					t6console.debug( "Removing", t6jobs.remove({"job_id": newsletter.job_id}, 1) ); // remove job from list
					users.findAndUpdate(
						function(i){return i.id===newsletter.metadata.mailOptions.user_id;},
						function(user){
							time = parseInt(moment().format("x"), 10);
							user.unsubscription = typeof user.unsubscription!=="undefined"?user.unsubscription:{};
							user.subscription = typeof user.subscription!=="undefined"?user.subscription:{};
							user.unsubscription[""+taskType] = time;
							user.subscription[""+taskType] = null;
							t6console.debug("unsubscription", user.unsubscription);
							t6console.debug("subscription", user.subscription);
							result = user;
						}
					);
					db_users.save();
				}
				return { "status": "Internal Error "+app.get("env") };
			});
		}
	});
	let totalTime = moment.duration(limit*recurring).asHours();
	return (!dryrun || dryrun === false)?{"status": `Sending newsletter to ${limit} recipients within ${totalTime} hours.`}:{"status": `Simulating newsletter to ${limit} recipients.`};
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
 * @apiUse 401
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
			data: [{"time":"","count":18,"meanDurationInMilliseconds":1009.7421,"spreadDurationInMilliseconds":1048.4053,"verb":"GET"},{"time":"","count":79,"meanDurationInMilliseconds":2629.5625,"spreadDurationInMilliseconds":708.4845,"verb":"PUT"},{"time":"","count":59,"meanDurationInMilliseconds":29.0958,"spreadDurationInMilliseconds":2008.7965,"verb":"POST"}]
		};
		data.quota = quota[req.user.role];
		data.quotausage = [
			{ type: "objects", count: 30 },
			{ type: "flows", count: 44 },
			{ type: "rules", count: 16 },
			{ type: "snippets", count: 29 },
			{ type: "dashboards", count: 7 },
			{ type: "sources", count: 6 },
			{ type: "tokens", count: 12 },
			{ type: "access_tokens", count: 3 },
		];
		res.render(`emails/${template}`, data, function(err, html) {
			if(!err) {
				t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/preview/", "", "", {"status": "200", error_id: "00003"});
				res.status(200).send(html);
			} else {
				t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/preview/", "", "", {"status": "400", error_id: "00002"});
				res.status(500).send(new ErrorSerializer({"id": 8053, "code": 500, "message": "Error rendering a newsletter"}).serialize());
				t6console.error("Error rendering a newsletter", err);
			}
		});
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/preview/", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {get} /notifications/list/subscribed List subscribed notifications
 * @apiName List subscribed notifications
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 * @apiUse 403
 */
/**
 * @api {get} /notifications/list/unsubscribed List unsubscribed notifications
 * @apiName List unsubscribed notifications
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 * @apiUse 403
 */
router.get("/list/:mode(subscribed|unsubscribed)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var mode = typeof req.params.mode!=="undefined"?req.params.mode:"subscribed";
	var user_id = req.user.id;
	if ( req.user && user_id ) {
		var user = users.findOne( { id: user_id } );
		res.status(200).send({subscription: mode==="subscribed"?user.subscription:undefined, unsubscription: mode==="unsubscribed"?user.unsubscription:undefined, unsubscription_token: user.unsubscription_token });
	} else {
		res.status(403).send(new ErrorSerializer({"id": 8054, "code": 403, "message": "Forbidden"}).serialize());
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
 * @apiUse 401
 * @apiUse 403
 * @apiUse 204
 */
router.get("/mail/reminder", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let query = { "$and": [
			{"subscription_date": { "$lte": moment().subtract(7, "days") }},
			{"reminderMail": undefined},
			{"token": null},
			{ "subscription.reminder": { "$lte": parseInt(moment().format("x"), 10) } },
			{ "subscription.reminder": { "$ne": null } },
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
			t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/reminder", "", "", {"status": "200", error_id: "000013"});
			res.status(202).send(new UserSerializer(json).serialize());
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/reminder", "", "", {"status": "204", error_id: "00012"});
			res.status(204).send(new ErrorSerializer({"id": 8055, "code": 204, "message": "No Content"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/reminder", "", "", {"status": "400", error_id: "00014"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
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
 * @apiUse 401
 * @apiUse 403
 * @apiUse 204
 */
router.get("/mail/changePassword", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let query = { "$and": [
			{"$or": [{"passwordLastUpdated": { "$lte": moment().subtract(3, "months") }}, {passwordLastUpdated: undefined}]},
			{"changePassword": { "$lte": moment().subtract(3, "months") }},
			{"token": null},
			{ "subscription.changePassword": { "$lte": parseInt(moment().format("x"), 10) } },
			{ "subscription.changePassword": { "$ne": null } },
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
						//bcc: bcc,
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
							currentUrl: typeof req.path!=="undefined"?req.path:"undefinedPath",
							err: err
						});
					});
				});
			});
			t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/changePassword", "", "", {"status": "200", error_id: "00023"});
			res.status(202).send(new UserSerializer(json).serialize());
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/changePassword", "", "", {"status": "204", error_id: "00022"});
			res.status(204).send(new ErrorSerializer({"id": 8055, "code": 204, "message": "No Content"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/mail/changePassword", "", "", {"status": "400", error_id: "00024"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});
/**
 * @api {get} /notifications/subscribers/newsletter/count Count subscribers Newsletter or Pushs
 * @apiName Count subscribers Newsletter or Pushs
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
/**
 * @api {get} /notifications/subscribers/newsletter/list List subscribers Newsletter or Pushs as csv
 * @apiName List subscribers Newsletter or Pushs as csv
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.get("/subscribers/:type(newsletter|monthlyreport|reminder|changePassword|push)/:mode(count|list)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var type = req.params.type;
	var mode = typeof req.params.mode!=="undefined"?req.params.mode:"count";
	if ( req.user.role === "admin" ) {
		let query = {};
		switch(type) {
			case "push": 
				query = { "$and": [
					{ "pushSubscription": { "$ne": null} },
					{ "pushSubscription": { "$ne": undefined} },
					{ "pushSubscription.endpoint": { "$ne": null} },
					{ "pushSubscription.endpoint": { "$ne": undefined} }
				]};
				break;
			case "newsletter": 
				query = { "$and": [
					{ "subscription.newsletter": { "$lte": parseInt(moment().format("x"), 10) } },
					{ "subscription.newsletter": { "$ne": null } },
				]};
				break;
			case "monthlyreport": 
				query = { "$and": [
					{ "subscription.monthlyreport": { "$lte": parseInt(moment().format("x"), 10) } },
					{ "subscription.monthlyreport": { "$ne": null } },
				]};
				break;
			case "reminder": 
				query = { "$and": [
					{ "subscription.reminder": { "$lte": parseInt(moment().format("x"), 10) } },
					{ "subscription.reminder": { "$ne": null } },
				]};
				break;
			case "changePassword": 
				query = { "$and": [
					{ "subscription.changePassword": { "$lte": parseInt(moment().format("x"), 10) } },
					{ "subscription.changePassword": { "$ne": null } },
				]};
				break;
			default:
				break;
		}
		var recipients = users.chain().find( query ).data();
		if ( recipients.length > 0 ) {
			t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/subscribers/newsletter/list", "", "", {"status": "200", error_id: "00033"});
			if(mode==="list") {
				let csv = "";
				csv += `"id","name","email"\n`;
				recipients.map(function(user) {
					csv += `"${user.id}", "${user.firstName} ${user.lastName}", "${user.email}"\n`;
				});
				res.setHeader("content-type", "application/csv");
				res.status(200).send(csv);
			} else if(mode==="count") {
				res.status(200).send({"subscribers": recipients.length});
			}
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/subscribers/newsletter/list", "", "", {"status": "400", error_id: "000032"});
			res.status(404).send(new ErrorSerializer({"id": 8055, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {get} /notifications/subscribers/newsletter/list", "", "", {"status": "400", error_id: "00034"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/mail/monthlyreport/plan Schedule a newsletter
 * @apiName Schedule a monthlyreport
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.post("/mail/monthlyreport/plan", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let subject = "t6 monthly activity report";
		let rp = typeof influxSettings.retentionPolicies.requests!=="undefined"?influxSettings.retentionPolicies.requests:"quota4w";
		let influxQuery = `SELECT top(monthly_usage, user_id, 10) FROM (SELECT count(url) as monthly_usage FROM ${rp}.requests WHERE user_id!='anonymous' AND time > now() - 4w GROUP BY user_id)`;
		//SELECT top(monthly_usage, user_id, 10), monthly_usage, count, meanDurationInMilliseconds, spreadDurationInMilliseconds FROM (SELECT count(url) as monthly_usage, COUNT(url), MEAN(durationInMilliseconds) as meanDurationInMilliseconds, SPREAD(durationInMilliseconds) as spreadDurationInMilliseconds FROM quota4w.requests WHERE user_id!='anonymous' AND time > now() - 4w GROUP BY user_id)
		//t6console.debug("get all actives users from influxDb", influxQuery);
		// get all actives users
		dbInfluxDB.query(influxQuery).then((activesUsers) => {
			let recipients = [];
			if ( activesUsers.length > 0 ) {
				activesUsers.map(function(d, i) {
					if (d.user_id!=="anonymous") {
						t6console.debug("Looking for", d.user_id);
						let query = { "$and": [
							{ "id": { "$eq": d.user_id } },
							{ "subscription.monthlyreport": { "$lte": parseInt(moment().format("x"), 10) } },
							{ "subscription.monthlyreport": { "$ne": null } },
						]};
						let recipient = users.findOne(query);
						if ( typeof recipient!=="undefined" && recipient!==null ) {
							const r = recipient;
							t6console.debug("Found recipient", recipient.id, recipient);
							let influxQuery2 = `SELECT COUNT(url), MEAN(durationInMilliseconds) as meanDurationInMilliseconds, SPREAD(durationInMilliseconds) as spreadDurationInMilliseconds from ${rp}.requests WHERE user_id='${d.user_id}' GROUP BY verb`;
							dbInfluxDB.query(influxQuery2).then((data) => {
								if ( data.length > 0 ) {
									r.data = data.map(function(d, i) {
										return typeof d==="object"?d:null;
									});
									r.quotausage = [
										{ type: "objects", count: db_objects.getCollection("objects").find({"user_id": d.user_id}).length },
										{ type: "flows", count: db_flows.getCollection("flows").find({"user_id": d.user_id}).length },
										{ type: "rules", count: db_rules.getCollection("rules").find({"user_id": d.user_id}).length },
										{ type: "snippets", count: dbSnippets.getCollection("snippets").find({"user_id": d.user_id}).length },
										{ type: "dashboards", count: dbDashboards.getCollection("dashboards").find({"user_id": d.user_id}).length },
										{ type: "sources", count: dbSources.getCollection("sources").find({"user_id": d.user_id}).length },
										{ type: "tokens", count: db_tokens.getCollection("tokens").find({"user_id": d.user_id}).length },
										{ type: "access_tokens", count: db_access_tokens.getCollection("accesstokens").find({"user_id": d.user_id}).length },
									];
									planNewsletter(req, res, [r], "monthlyreport", subject, "monthlyreport");
									recipients.push(r);
								} else {
									t6console.debug("No data for user", recipient, influxQuery2);
								}
							});
						} else {
							t6console.debug("Can't find any recipient by that Id", d.user_id, recipient, JSON.stringify(query));
						}
						//t6console.debug("recipients 1", recipients);
					} // End Anonymous filter
				});
				t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/monthlyreport/plan", "", "", {"status": "200", error_id: "00043"});
				res.status(202).send(new UserSerializer(recipients).serialize());
				//t6console.debug("recipients 2", recipients);
			} else {
				t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/monthlyreport/plan", "", "", {"status": "400", error_id: "00042"});
				res.status(404).send(new ErrorSerializer({"id": 8055, "code": 404, "message": "Not Found"}).serialize());
			}
		});
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/monthlyreport/plan", "", "", {"status": "400", error_id: "00044"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
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
 * @apiUse 401
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
		let query = { "$and": [
			{ "subscription.newsletter": { "$lte": parseInt(moment().format("x"), 10) } },
			{ "subscription.newsletter": { "$ne": null } },
		]};
		var recipients = users.chain().find( query ).offset(offset).limit(limit).data();
		if ( recipients.length > 0 && template ) {
			planNewsletter(req, res, recipients, `newsletters/${template}`, subject, "newsletter");
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/newsletter/plan", "", "", {"status": "200", error_id: "00053"});
			res.status(202).send(new UserSerializer(recipients).serialize());
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/newsletter/plan", "", "", {"status": "400", error_id: "00052"});
			res.status(404).send(new ErrorSerializer({"id": 8055, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/newsletter/plan", "", "", {"status": "400", error_id: "00054"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
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
 * @apiUse 401
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
			let response = sendNewsletter(newsletters, "newsletter", dryrun, recurring, req.user.id, limit, 0);
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/newsletter/send", "", "", {"status": "200", error_id: "00063"});
			res.status(202).send({"response": response});
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/newsletter/send", "", "", {"status": "400", error_id: "00062"});
			res.status(404).send(new ErrorSerializer({"id": 8055, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/newsletter/send", "", "", {"status": "400", error_id: "000064"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {post} /notifications/mail/monthlyreport/send Send a scheduled newsletter
 * @apiName Send a scheduled monthlyreport
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.post("/mail/monthlyreport/send", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let limit = typeof req.query.limit!=="undefined"?req.query.limit:20;
	let dryrun = typeof req.query.dryrun!=="undefined"?str2bool(req.query.dryrun):false;
	let recurring = typeof req.query.recurring!=="undefined"?parseInt(req.query.recurring, 10):null;
	if ( req.user.role === "admin" ) {
		let reports = t6jobs.get({taskType: "monthlyreport", user_id: req.user.id}, recurring!==null?1:limit);
		t6console.debug("reports : ", reports);
		if(reports.length > 0) {
			let response = sendNewsletter(reports, "monthlyreport", dryrun, recurring, req.user.id, limit, 0);
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/monthlyreport/send", "", "", {"status": "200", error_id: "00073"});
			res.status(202).send({"response": response});
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/monthlyreport/send", "", "", {"status": "400", error_id: "00072"});
			res.status(404).send(new ErrorSerializer({"id": 8055, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/monthlyreport/send", "", "", {"status": "400", error_id: "00074"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
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
 * @apiUse 401
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
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/plan", "", "", {"status": "200", error_id: "00083"});
			res.status(202).send(new UserSerializer(recipients).serialize());
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/plan", "", "", {"status": "400", error_id: "00082"});
			res.status(404).send(new ErrorSerializer({"id": 8055, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/plan", "", "", {"status": "400", error_id: "000084"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
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
 * @apiUse 401
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
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/send", "", "", {"status": "200", error_id: "00093"});
			res.status(202).send({"response": response});
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/send", "", "", {"status": "400", error_id: "00092"});
			res.status(404).send(new ErrorSerializer({"id": 8055, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/send", "", "", {"status": "400", error_id: "00094"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});


/**
 * @api {post} /notifications/push/deadsensors Send Push notification on dead sensors
 * @apiName Send Push notification on dead sensors
 * @apiDescription Send Push notification on dead sensors
 * @apiGroup 9. Notifications
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 *
 * @apiParam {String} [size=20] Size of the resultset
 * @apiParam {Number} [page] Page offset
 * 
 * @apiUse 201
 * @apiUse 403
 */
router.post("/push/deadsensors", function (req, res) {
	var size = 1;
	var page = 1;
	var offset = 0;
	if ( typeof req.user!=="undefined" && req.user.role === "admin" ) {
		var query = `SELECT time AS ts, user_id, flow_id, valueBoolean, valueFloat, valueInteger, valueString FROM data GROUP BY flow_id ORDER BY time DESC LIMIT ${size} OFFSET ${offset}`;
		t6console.debug(query);
		dbInfluxDB.query(query).then((data) => {
			let sensors_from_flows = [];
			data.map((f) => {
				let query = { "id" : f.flow_id };
				let currflow = flows.findOne(query);
				let ttl = parseInt( (currflow!=="undefined" && currflow!==null)?currflow.time_to_live:-1, 10);
				let warning = moment(f.ts).isBefore( moment().subtract(ttl, "seconds") ); // BUG ?? ttl might be undefined?
				let latest_notification = (currflow!=="undefined" && currflow!==null && currflow.dead_notification_latest)?currflow.dead_notification_latest:moment(0); // default to never sent
				let itv;
				if(currflow!=="undefined" && currflow!==null && currflow.dead_notification_interval) {
					switch(currflow.dead_notification_interval) {
						case "daily":
							itv = "days"; break;
						case "weekly":
							itv = "weeks"; break;
						case "monthly":
							itv = "months"; break;
						case "hourly":
						default:
							itv = "hours"; break;
					}
				} else {
					itv = "hours";
				}
				let check_interval = moment(latest_notification).add(1, itv).isBefore( moment() );
				let name = (currflow!=="undefined" && currflow!==null && currflow.name)?currflow.name:undefined;
				let latest_value = moment(f.ts).format("MMMM Do YYYY, H:mm:ss");
				let latest_value_ts = moment(f.ts).format("x")*1000;
				let dead_notification = (currflow!=="undefined" && currflow!==null && currflow.dead_notification)?currflow.dead_notification:undefined;
				let dead_notification_interval = (currflow!=="undefined" && currflow!==null && currflow.dead_notification_interval)?currflow.dead_notification_interval:"hourly*";
				let dead_notification_latest = moment(parseInt(moment().format("x"), 10)).format("MMMM Do YYYY, H:mm:ss");
				if (ttl > -1 && warning === true && check_interval && currflow.dead_notification===true) {
					sensors_from_flows.push({
						ttl							: ttl,
						name						: name,
						latest_value				: latest_value,
						latest_value_ts				: latest_value_ts,
						warning						: warning,
						user_id						: f.user_id,
						dead_notification			: dead_notification,
						dead_notification_interval	: dead_notification_interval,
						dead_notification_latest	: dead_notification_latest,
						flow_id						: f.flow_id
					});
					let user = users.findOne({ "$and": [ { "id": { "$eq": f.user_id } }, { "pushSubscription": { "$ne": null } }, ] });
					if (user!==null && typeof user.pushSubscription!=="undefined" ) {
						user = typeof user!=="undefined"?user:{pushSubscription:{}};
						user.pushSubscription = user.pushSubscription!==null?user.pushSubscription:{};
						user.pushSubscription.user_id = f.user_id;
						let payload = "{\"type\": \"message\", \"title\": \"Warning on dead sensor!\", \"body\": \"Your sensor for '"+currflow.name+"' has not pushed data since "+moment(f.ts).format("DD/MM/YYYY, HH:mm")+" ("+dead_notification_interval+" notification)\", \"icon\": null, \"vibrate\":[200, 100, 200, 100, 200, 100, 200]}";
						t6events.addStat("t6Api", "deadsensors notification", f.user_id, f.user_id, {flow_id: f.flow_id});
						t6console.debug(payload);
						let result = t6notifications.sendPush(user, payload);
						result.then((response) => {
							if(response && response.info && typeof response.info.statusCode!=="undefined" && (response.info.statusCode === 404 || response.info.statusCode === 410)) {
								t6console.debug("pushSubscription was", user.pushSubscription);
								t6console.debug("Can't sendPush because of a status code Error", response.info.statusCode);
								users.chain().find({ "id": user_id }).update(function(u) {
									u.pushSubscription = {};
									db_users.save();
								});
								t6console.debug("pushSubscription is now disabled on User");
							} else {
								// update dead_notification_latest
								let result;
								flows.chain().find({ "id": f.flow_id }).update(function(item) {
									item.dead_notification_latest = parseInt(moment().format("x"), 10);
									result = item;
								});
								if ( typeof result!=="undefined" ) {
									db_flows.save();
									db_flows.saveDatabase(function(err) {err!==null?t6console.error("Error on saveDatabase", err):null;});
								} else {
									t6console.debug("Flow can't be found");
								}
							}
							t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/deadsensors", "", "", {"status": "200", error_id: "00103"});
						}).catch((error) => {
							t6console.debug("pushSubscription was", user.pushSubscription);
							t6console.debug("Can't sendPush because of an Error", error);
							users.chain().find({ "id": f.user_id }).update(function(u) {
								u.pushSubscription = {};
								db_users.save();
							});
							t6console.debug("pushSubscription is now disabled on User", error);
							if(user!==null) {
								// User Found but no pushSubscription
								res.render("emails/deadsensors", { user, f, currflow, dead_notification, dead_notification_interval, dead_notification_latest }, function (err, html) {
									let to = user.firstName + " " + user.lastName + " <" + user.email + ">";
									let mailOptions = {
										from: from,
										bcc: typeof bcc !== "undefined" ? bcc : null,
										to: to,
										subject: "Warning on dead sensor!",
										text: "Html email client is required",
										html: html
									};
									transporter.sendMail(mailOptions, function (err, info) {
										if (err) {
											t6console.debug("err on email", err);
											t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/deadsensors", "", "", {"status": "500", error_id: "00105"});
										} else {
											t6events.addStat("t6App", "user deadsensors mail", user.id, user.id);
											res.header("Location", "/v" + version + "/users/" + user.id);
											t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/deadsensors", "", "", {"status": "200", error_id: "00106"});
										}
									});

									let result; // Update whatever the memail is sent or not
									flows.chain().find({ "id": f.flow_id }).update(function(item) {
										item.dead_notification_latest = parseInt(moment().format("x"), 10);
										result = item;
									});
									if ( typeof result!=="undefined" ) {
										db_flows.save();
										db_flows.saveDatabase(function(err) {err!==null?t6console.error("Error on saveDatabase", err):null;});
									} else {
										t6console.debug("Flow can't be found");
									}
								});
							} else {
								t6console.debug("User can't be found");
								t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/deadsensors", "", "", {"status": "404", error_id: "00107"});
							}
						});
					}
				}
			});
			res.status(202).send(new DeadsensorSerializer(sensors_from_flows).serialize());
		});
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/push/deadsensors", "", "", {"status": "401", error_id: "000109"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
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
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.post("/mail/newsletter/stop", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		clearTimeout(timer);
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/newsletter/stop", "", "", {"status": "200", error_id: "000110"});
		res.status(202).send({"response": "timer is stopped"});
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /notifications/mail/newsletter/stop", "", "", {"status": "400", error_id: "000111"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
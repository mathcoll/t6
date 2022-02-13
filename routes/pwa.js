"use strict";
var express = require("express");
var router	= express.Router();
var ErrorSerializer = require("../serializers/error");

router.get("/", function(req, res) {
	res.setHeader("Cache-Control", "public, max-age=86400");
	res.render("index", {
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get("/applicationStart", function(req, res) {
	res.render("applicationStart", {
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get("/networkError", function(req, res) {
	res.render("networkError", {
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get("/stories/?:story_id([0-9a-zA-Z\-]+)?", function(req, res) {
	var story_id = req.params.story_id;
	res.render("story", {
		currentUrl: req.path,
		baseUrl_https: baseUrl_https,
		user: req.session.user,
		story: {id: story_id}
	});
});

/**
 * @api {get} /mail/:mail/unsubscribe/:list/:unsubscription_token/ Unsubscribe from a Notification list
 * @apiName Unsubscribe from a Notification list
 * @apiGroup 8. Notifications
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {string} mail Email address from the user
 * @apiParam {string} list List to unsubscribe
 * @apiParam {string} unsubscription_token Uniq token to approve the transaction
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/:mail/unsubscribe/:list([0-9a-zA-Z\-]+)/:unsubscription_token([0-9a-zA-Z\-]+)/", function(req, res) {
	var mail = req.params.mail;
	var list = req.params.list;
	var unsubscription_token = req.params.unsubscription_token;
	
	if ( list === "changePassword" || list === "reminder" || list === "newsletter" || list === "monthlyreport" ) {
		let result;
		let time;
		users.chain().find({ "email": mail, "unsubscription_token": unsubscription_token }).update(function(user) {
			time = parseInt(moment().format("x"), 10);
			user.unsubscription = typeof user.unsubscription!=="undefined"?user.unsubscription:{};
			user.subscription = typeof user.subscription!=="undefined"?user.subscription:{};
			user.unsubscription[""+list] = time;
			user.subscription[""+list] = null;
			t6console.debug("unsubscription", user.unsubscription);
			t6console.debug("subscription", user.subscription);
			result = user;
		});
		db_users.save();

		if (req.headers && typeof req.headers["content-type"]!=="undefined" && req.headers["content-type"].indexOf("json") !== 0) {
			res.status(200).send({"status": "unsubscribed", "list": list, "time": null});
		} else {
			res.render("notifications-unsubscribe", {
				currentUrl: req.path,
				user: typeof result!=="undefined"?result:{"email": mail, "unsubscription_token": unsubscription_token, "unsubscription": {} },
				mail: mail,
				list: list,
				time: null,
				moment: moment,
			});
		}
		t6events.addStat("t6App", "unsubscribe", typeof result!=="undefined"?result.id:"??"+mail, typeof result!=="undefined"?result.id:"??"+mail, {"list": list});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 11271, "code": 404, "message": "Not Found"}).serialize());
	}
});


/**
 * @api {get} /mail/:mail/subscribe/:list/:unsubscription_token/ Subscribe from a Notification list
 * @apiName Subscribe from a Notification list
 * @apiGroup 8. Notifications
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {string} mail Email address from the user
 * @apiParam {string} list List to subscribe
 * @apiParam {string} unsubscription_token Uniq token to approve the transaction
 * 
 * @apiUse 200
 * @apiUse 403
 * @apiUse 404
 */
router.get("/mail/:mail/subscribe/:list([0-9a-zA-Z\-]+)/:unsubscription_token([0-9a-zA-Z\-]+)/", function(req, res) {
	var mail = req.params.mail;
	var list = req.params.list;
	var unsubscription_token = req.params.unsubscription_token;
	
	if ( list === "changePassword" || list === "reminder" || list === "newsletter" || list === "monthlyreport" ) {
		let result;
		let time;
		users.chain().find({ "email": mail, "unsubscription_token": unsubscription_token }).update(function(user) {
			time = parseInt(moment().format("x"), 10);
			user.unsubscription = typeof user.unsubscription!=="undefined"?user.unsubscription:{};
			user.subscription = typeof user.subscription!=="undefined"?user.subscription:{};
			user.unsubscription[""+list] = null;
			user.subscription[""+list] = time;
			t6console.debug("unsubscription", user.unsubscription);
			t6console.debug("subscription", user.subscription);
			result = user;
		});
		db_users.save();

		if (req.headers && typeof req.headers["content-type"]!=="undefined" && req.headers["content-type"].indexOf("json") !== 0) {
			res.status(200).send({"status": "subscribed", "list": list, "time": time});
		} else {
			res.render("notifications-subscribe", {
				currentUrl: req.path,
				user: typeof result!=="undefined"?result:{"email": mail, "unsubscription_token": unsubscription_token, "unsubscription": {} },
				mail: mail,
				list: list,
				time: time,
				moment: moment,
			});
		}
		t6events.addStat("t6App", "subscribe", typeof result!=="undefined"?result.id:"??"+mail, typeof result!=="undefined"?result.id:"??"+mail, {"list": list});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 11271, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

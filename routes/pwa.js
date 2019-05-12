"use strict";
var express = require("express");
var router	= express.Router();
var DataSerializer = require("../serializers/data");
var ErrorSerializer = require("../serializers/error");
var users;

router.get("/", function(req, res) {
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

/**
 * @api {get} /mail/:mail/unsubscribe/:list/:unsubscription_token/ Unsubscribe from a Notification list
 * @apiName Unsubscribe from a Notification list
 * @apiGroup 8. Notifications Email
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
router.get("/mail/:mail(*@*)/unsubscribe/:list([0-9a-zA-Z\-]+)/:unsubscription_token([0-9a-zA-Z\-]+)/", function(req, res) {
	var mail = req.params.mail;
	var list = req.params.list;
	var unsubscription_token = req.params.unsubscription_token;
	
	if ( list == "changePassword" || list == "reminder" || list == "newsletter" ) {
		users	= db.getCollection("users");
		var result;

		users.chain().find({ "email": mail, "unsubscription_token": unsubscription_token }).update(function(user) {
			user.unsubscription = typeof user.unsubscription!=="undefined"?user.unsubscription:{};
			user.unsubscription[""+list] = moment().format("x");
			result = user;
		});
		db.save();
		
		res.render("notifications-unsubscribe", {
			currentUrl: req.path,
			user: result,
			mail: mail,
			list: list,
			moment: moment,
		});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 10.4, "code": 404, "message": "Not Found"}).serialize());
	}
});


/**
 * @api {get} /mail/:mail/subscribe/:list/:unsubscription_token/ Subscribe from a Notification list
 * @apiName Subscribe from a Notification list
 * @apiGroup 8. Notifications Email
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
router.get("/mail/:mail(*@*)/subscribe/:list([0-9a-zA-Z\-]+)/:unsubscription_token([0-9a-zA-Z\-]+)/", function(req, res) {
	var mail = req.params.mail;
	var list = req.params.list;
	var unsubscription_token = req.params.unsubscription_token;
	
	if ( list == "changePassword" || list == "reminder" || list == "newsletter" ) {
		users	= db.getCollection("users");
		var result;

		users.chain().find({ "email": mail, "unsubscription_token": unsubscription_token }).update(function(user) {
			user.unsubscription = typeof user.unsubscription!=="undefined"?user.unsubscription:{};
			user.unsubscription[""+list] = null;
			result = user;
		});
		db.save();
		
		res.render("notifications-subscribe", {
			currentUrl: req.path,
			user: result,
			mail: mail,
			list: list,
			moment: moment,
		});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 10.5, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

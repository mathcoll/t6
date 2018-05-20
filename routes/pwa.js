'use strict';
var express = require('express');
var router	= express.Router();
var DataSerializer = require('../serializers/data');
var ErrorSerializer = require('../serializers/error');
var users;

router.get('/m', function(req, res) {
	res.redirect('/');
});

router.get('/', function(req, res) {
	res.render('m/index', {
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get('/applicationStart', function(req, res) {
	res.render('m/applicationStart', {
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get('/networkError', function(req, res) {
	res.render('m/networkError', {
		currentUrl: req.path,
		user: req.session.user
	});
});


router.get("/mail/:mail(*@*)/unsubscribe/:list([0-9a-zA-Z\-]+)/:unsubscription_token([0-9a-zA-Z\-]+)/", function(req, res) {
	var mail = req.params.mail;
	var list = req.params.list;
	var unsubscription_token = req.params.unsubscription_token;
	
	if ( list == 'changePassword' || list == 'reminder' ) {
		users	= db.getCollection('users');
		var result;

		users.chain().find({ 'email': mail, 'unsubscription_token': unsubscription_token }).update(function(user) {
			user.unsubscription = user.unsubscription!==undefined?user.unsubscription:{};
			user.unsubscription[''+list] = moment().format('x');
			result = user;
		});
		
		db.save();
		
		res.render('m/notifications-unsubscribe', {
			currentUrl: req.path,
			user: result,
			mail: mail,
			list: list,
			moment: moment,
		});
	}
});

router.get("/mail/:mail(*@*)/subscribe/:list([0-9a-zA-Z\-]+)/:unsubscription_token([0-9a-zA-Z\-]+)/", function(req, res) {
	var mail = req.params.mail;
	var list = req.params.list;
	var unsubscription_token = req.params.unsubscription_token;
	
	if ( list == 'changePassword' || list == 'reminder' ) {
		users	= db.getCollection('users');
		var result;

		users.chain().find({ 'email': mail, 'unsubscription_token': unsubscription_token }).update(function(user) {
			user.unsubscription = user.unsubscription!==undefined?user.unsubscription:{};
			user.unsubscription[''+list] = null;
			result = user;
		});
		db.save();
		
		res.render('m/notifications-subscribe', {
			currentUrl: req.path,
			user: result,
			mail: mail,
			list: list,
			moment: moment,
		});
	}
});

module.exports = router;

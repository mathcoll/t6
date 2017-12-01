'use strict';
var express = require('express');
var router	= express.Router();
var DataSerializer = require('../serializers/data');
var ErrorSerializer = require('../serializers/error');

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

module.exports = router;

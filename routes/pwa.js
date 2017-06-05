'use strict';
var express = require('express');
var router	= express.Router();
var DataSerializer = require('../serializers/data');
var ErrorSerializer = require('../serializers/error');

router.get('/', function(req, res) {
	res.render('m/index', {
		currentUrl: req.path,
		user: req.session.user
	});
});

module.exports = router;

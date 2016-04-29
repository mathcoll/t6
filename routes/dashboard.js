'use strict';
var express = require('express');
var router	= express.Router();
var users;
var objects;
var flows;
var tokens;

router.get('/', function(req, res) {
	res.render('index', {
		title : 'Dashboard EasyIOT'
	});
});

router.get('/objects', function(req, res) {
	objects	= db.getCollection('objects');
	var query = {
			'$and': [
						{ 'user_id' : '44800701-d6de-48f7-9577-4b3ea1fab81a' }, // TODO: HARD CODED FOR TESTING!
					]
				};
	var pagination=8;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var o = objects.chain().find(query).offset(offset).limit(pagination).data();
	res.render('objects', {
		title : 'Objects EasyIOT',
		objects: o,
		page: req.query.page,
		pagenb: Math.ceil(((objects.chain().find(query).data()).length) / pagination)
	});
});

router.get('/flows', function(req, res) {
	flows	= db.getCollection('flows');
	var query = {
			'$and': [
						{ 'user_id': '44800701-d6de-48f7-9577-4b3ea1fab81a' }, // TODO: HARD CODED FOR TESTING!
					]
				};
	var pagination=8;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var f = flows.chain().find(query).offset(offset).limit(pagination).data();
	res.render('flows', {
		title : 'Flows EasyIOT',
		flows: f,
		page: req.query.page,
		pagenb: Math.ceil(((flows.chain().find(query).data()).length) / pagination)
	});
});

router.get('/profile', function(req, res) {
	users	= db.getCollection('users');
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	tokens	= db.getCollection('tokens');
	
	var query = {
			'$and': [
						{ 'id': '44800701-d6de-48f7-9577-4b3ea1fab81a' }, // TODO: HARD CODED FOR TESTING!
					]
				};
	var user = users.findOne(query);
	user.hash = md5(user.email);

	var queryO = {
			'$and': [
						{ 'user_id' : '44800701-d6de-48f7-9577-4b3ea1fab81a' }, // TODO: HARD CODED FOR TESTING!
					]
				};

	var queryF = {
			'$and': [
						{ 'user_id': '44800701-d6de-48f7-9577-4b3ea1fab81a' }, // TODO: HARD CODED FOR TESTING!
					]
				};

	var queryT = {
			'$and': [
						{ 'user_id': '44800701-d6de-48f7-9577-4b3ea1fab81a' }, // TODO: HARD CODED FOR TESTING!
					]
				};
	res.render('profile', {
		title : 'Profile EasyIOT',
		user: user,
		objects: ((objects.chain().find(queryO).data()).length),
		flows: ((flows.chain().find(queryF).data()).length),
		tokens: ((tokens.chain().find(queryT).data()).length)
	});
});

router.get('/search', function(req, res) {
	res.render('search', {
		title : 'Search EasyIOT',
		objects: [],
		flows: []
	});
});

router.post('/search', function(req, res) {
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	if (!req.body.q) {
		res.render('search', {
			title : 'Search EasyIOT',
			objects: [],
			flows: []
		});
	} else {
		var queryO = {
				'$and': [
							{ 'user_id': '44800701-d6de-48f7-9577-4b3ea1fab81a' }, // TODO: HARD CODED FOR TESTING!
							{ 'name': {'$regex': [req.body.q, 'i'] } }
						]
					};
		var queryF = {
				'$and': [
							{ 'user_id': '44800701-d6de-48f7-9577-4b3ea1fab81a' }, // TODO: HARD CODED FOR TESTING!
							{ 'name': {'$regex': [req.body.q, 'i'] } }
						]
					};
		res.render('search', {
			title : 'Search EasyIOT',
			objects: objects.find(queryO),
			flows: flows.find(queryF),
			q:req.body.q
		});
	}
});

router.get('/decision-rules', function(req, res) {
	res.render('decision-rules', {
		title : 'Decision Rules EasyIOT'
	});
});

router.get('/about', function(req, res) {
	res.render('about', {
		title : 'About EasyIOT'
	});
});

router.get('/dashboards/?(:dashboard_id)?', function(req, res) {
	res.render('dashboard', {
		title : 'Dashboard EasyIOT'
	});
});

module.exports = router;

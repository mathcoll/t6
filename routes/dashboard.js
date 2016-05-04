'use strict';
var express = require('express');
var router	= express.Router();
var DataSerializer = require('../serializers/data');
var users;
var objects;
var flows;
var tokens;

router.get('/', function(req, res) {
	res.render('index', {
		title : 'Dashboard EasyIOT',
		user: req.session.user
	});
});

router.get('/objects', Auth,  function(req, res) {
	objects	= db.getCollection('objects');
	var query = {
			'$and': [
						{ 'user_id': req.session.user.id },
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
		pagenb: Math.ceil(((objects.chain().find(query).data()).length) / pagination),
		user: req.session.user
	});
});

router.get('/objects/:object_id([0-9a-z\-]+)', Auth, function(req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection('objects');
	if ( object_id !== undefined ) {
		var queryO = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : object_id },
			]
		};
	}
	var json = objects.findOne(queryO);
	if ( json ) {
		res.render('object', {
			title : 'Object '+json.name,
			object: json,
			user: req.session.user
		});
	} else {
		// 404
	}
});

router.get('/objects/:object_id([0-9a-z\-]+)/edit', Auth, function(req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection('objects');
	if ( object_id !== undefined ) {
		var queryO = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : object_id },
			]
		};
	}
	var json = objects.findOne(queryO);
	//console.log(json);
	if ( json ) {
		res.render('object_edit', {
			title : 'Object '+json.name,
			object: json,
			user: req.session.user
		});
	} else {
		// 404
	}
});

router.post('/objects/:object_id([0-9a-z\-]+)/edit', Auth, function(req, res) {
	
});

router.get('/flows', Auth, function(req, res) {
	flows	= db.getCollection('flows');
	var query = {
			'$and': [
						{ 'user_id': req.session.user.id },
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
		pagenb: Math.ceil(((flows.chain().find(query).data()).length) / pagination),
		user: req.session.user
	});
});

router.get('/profile', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	tokens	= db.getCollection('tokens');
	
	var user = req.session.user;
	user.hash = md5(req.session.user.email);

	var queryO = {
			'$and': [
						{ 'user_id' : req.session.user.id },
					]
				};

	var queryF = {
			'$and': [
						{ 'user_id' : req.session.user.id },
					]
				};

	var queryT = {
			'$and': [
						{ 'user_id' : req.session.user.id },
					]
				};
	res.render('profile', {
		title : 'Profile EasyIOT',
		objects: ((objects.chain().find(queryO).data()).length),
		flows: ((flows.chain().find(queryF).data()).length),
		tokens: ((tokens.chain().find(queryT).data()).length),
		user: req.session.user
	});
});

router.get('/search', Auth, function(req, res) {
	res.render('search', {
		title : 'Search EasyIOT',
		objects: [],
		flows: [],
		user: req.session.user
	});
});

router.post('/search', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	if (!req.body.q) {
		res.render('search', {
			title : 'Search EasyIOT',
			objects: [],
			flows: [],
			user: req.session.user
		});
	} else {
		var queryO = {
				'$and': [
							{ 'user_id': req.session.user.id },
							{ 'name': {'$regex': [req.body.q, 'i'] } }
						]
					};
		var queryF = {
				'$and': [
							{ 'user_id': req.session.user.id },
							{ 'name': {'$regex': [req.body.q, 'i'] } }
						]
					};
		res.render('search', {
			title : 'Search EasyIOT',
			objects: objects.find(queryO),
			flows: flows.find(queryF),
			q:req.body.q,
			user: req.session.user
		});
	}
});

router.get('/decision-rules', Auth, function(req, res) {
	res.render('decision-rules', {
		title : 'Decision Rules EasyIOT',
		user: req.session.user
	});
});

router.get('/about', function(req, res) {
	res.render('about', {
		title : 'About EasyIOT',
		user: req.session.user
	});
});

router.get('/dashboards/?(:dashboard_id)?', Auth, function(req, res) {
	var dashboard_id = req.params.dashboard_id;
	res.render('dashboard'+dashboard_id, {
		title : 'Dashboard EasyIOT',
		user: req.session.user,
		version: version,
	});
});

router.get('/register', function(req, res) {
	res.render('register', {
		title : 'Register to EasyIOT',
		user: req.session.user
	});
});

router.get('/login', function(req, res) {
	res.render('login', {
		title : 'Log-in to EasyIOT',
		user: req.session.user
	});
});

router.get('/unauthorized', function(req, res) {
	res.render('unauthorized', {
		title : 'Unauthorized, Please log-in again to EasyIOT',
		user: req.session.user
	});
});

router.get('/logout', function(req, res) {
	req.session.destroy();
	req.session = undefined;
	delete req.session;
	res.redirect('back');
});

router.post('/login', Auth, function(req, res) {
	console.log("inside POST /login");
	if ( !req.session.user ) {
		console.log("Error! invalid credentials, user not found");
		res.render('login', {
			title : 'Log-in Failed to EasyIOT',
			user: req.session.user
		});
	} else {
		//console.log(req.session.user);
		if ( req.url == "/login" ) {
		//res.redirect('/dashboards');
			res.redirect('/profile');
		} else {
			res.redirect('back');
		}
	}
});

function Auth(req, res, next) {
	users	= db.getCollection('users');
	tokens	= db.getCollection('tokens');
	flows	= db.getCollection('flows');

	var key = req.body.key;
	var secret = req.body.secret;
	if ( key && secret ) {
		//console.log("I have a Key and a Secret");
		var queryT = {
				'$and': [
							{ 'key': key },
							{ 'secret': secret },
							// TODO: expiration !! {'expiration': { '$gte': moment().format('x') }},
						]
					};
		var token = tokens.findOne(queryT);
		if ( token ) {
			// Connect Success
			//console.log("I have found a valid Token");
			var queryU = {
					'$and': [
								{ 'id': token.user_id },
							]
						};
			var user = users.findOne(queryU);
			if ( user ) {
				//console.log("I have found a valid User");
				var SESS_ID = passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.');
				//console.log("I have created a SESS_ID: "+SESS_ID);

				req.session.user = user;
				req.session.token = '';
				req.session.bearer = token;
				// TODO: set permissions to 644 ; Should be 600 !!
				var permissions = new Array();
				(flows.find({'user_id':req.session.user.id})).map(function(p) {
					permissions.push( { flow_id: p.id, permission: p.permission } );
				}); // End permissions on all User Flows
				console.log(permissions);
				
				req.session.bearer.permissions = permissions;
				req.session.user.permissions = req.session.bearer.permissions;
				
				req.session.session_id = SESS_ID;
				//console.log(req.session);
				res.cookie('session_id', SESS_ID);
			} else {
				//console.log("I have not found a valid User");
				res.redirect('/unauthorized');
			}
		} else {
			// Invalid Credentials
			//console.log("I have not found a valid Token");
			res.redirect('/unauthorized');
		}
	} else {
		//console.log("I haven't any Key nor Secret");
		// trying to retrieve User from the session... if any...
		if ( req.cookies.session_id ) {
			//console.log("I have a session_id: "+req.cookies.session_id);
			if( req.session && req.session.user ) {
				//console.log("I have a session: "+req.session);
				//console.log("I have a User in session: "+req.session.user);
//				if ( req.cookies.connect.sid == ?????? ) {
//					
//				} else {
//					
//				}
			} else {				
				res.redirect('/unauthorized');
			}
		} else {
			//console.log("I don't have any session_id");
			//console.log("but cookies:");
			//console.log(req.cookies);
		//	if( !req.session && !req.session.user ) {
				res.redirect('/unauthorized');
		//	}
		}
	}
	next();
}

module.exports = router;

'use strict';
var express = require('express');
var router	= express.Router();
var DataSerializer = require('../serializers/data');
var users;
var objects;
var units;
var flows;
var datatypes;
var tokens;

router.get('/', function(req, res) {
	res.render('index', {
		title : 'Dashboard Easy-IOT',
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
	res.render('objects', {
		title : 'Objects Easy-IOT',
		objects: objects.chain().find(query).simplesort('name').offset(offset).limit(pagination).data(),
		page: req.query.page,
		pagenb: Math.ceil(((objects.chain().find(query).data()).length) / pagination),
		types: ['compass', 'phone', 'smartphone', 'tablet', 'server'],
		message: {},
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
			types: ['compass', 'phone', 'smartphone', 'tablet', 'server'],
			user: req.session.user
		});
	} else {
		// 404
	}
});

router.post('/objects/:object_id([0-9a-z\-]+)/edit', Auth, function(req, res) {
	// TODO
});

router.post('/objects/add', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	if ( req.body.name && req.session.user.id ) {
		var new_object = {
			id:				uuid.v4(),
			type:  			req.body.type!==undefined?req.body.type:'default',
			name:			req.body.name!==undefined?req.body.name:'unamed',
			description:	req.body.description!==undefined?req.body.description:'',
			position: 	 	req.body.position!==undefined?req.body.position:'',
			ipv4:  			req.body.ipv4!==undefined?req.body.ipv4:'',
			ipv6:			req.body.ipv6!==undefined?req.body.ipv6:'',
			user_id:		req.session.user.id,
		};
		objects.insert(new_object);
		db.save();
		
		res.render('objects', {
			title : 'Objects Easy-IOT',
			objects: objects.chain().simplesort('name').data(),
			page: req.query.page,
			pagenb: Math.ceil(((objects.chain().find(query).data()).length) / pagination),
			types: ['compass', 'phone', 'smartphone', 'tablet', 'server'],
			user: req.session.user,
			message: {type: 'success', value: 'Successfully added.'}
		});
	} else {
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
			title : 'Objects Easy-IOT',
			objects: o,
			page: req.query.page,
			pagenb: Math.ceil(((objects.chain().find(query).data()).length) / pagination),
			types: ['compass', 'phone', 'smartphone', 'tablet', 'server'],
			user: req.session.user,
			message: {type: 'danger', value: 'Please give a name to your object!'}
		});
	}
});

router.get('/flows', Auth, function(req, res) {
	flows	= db.getCollection('flows');
	objects	= db.getCollection('objects');
	units	= db.getCollection('units');
	datatypes	= db.getCollection('datatypes');

	var query = {
			'$and': [
						{ 'user_id': req.session.user.id },
					]
				};
	var pagination=8;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var f = flows.chain().find(query).offset(offset).limit(pagination).data();
	var o = objects.chain().find(query).data();
	var dt = datatypes.find();
	var u = units.find();
	res.render('flows', {
		title : 'Flows Easy-IOT',
		flows: f,
		objects: o,
		datatypes: dt,
		units: u,
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
		title : 'Profile Easy-IOT',
		objects: ((objects.chain().find(queryO).data()).length),
		flows: ((flows.chain().find(queryF).data()).length),
		tokens: ((tokens.chain().find(queryT).data()).length),
		user: req.session.user
	});
});

router.get('/search', Auth, function(req, res) {
	res.render('search', {
		title : 'Search Easy-IOT',
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
			title : 'Search Easy-IOT',
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
			title : 'Search Easy-IOT',
			objects: objects.find(queryO),
			flows: flows.find(queryF),
			q:req.body.q,
			user: req.session.user
		});
	}
});

router.get('/decision-rules', Auth, function(req, res) {
	res.render('decision-rules', {
		title : 'Decision Rules Easy-IOT',
		user: req.session.user
	});
});

router.get('/about', function(req, res) {
	res.render('about', {
		title : 'About Easy-IOT',
		user: req.session.user
	});
});

router.get('/dashboards/?(:dashboard_id)?', Auth, function(req, res) {
	var dashboard_id = req.params.dashboard_id;
	res.render('dashboard'+dashboard_id, {
		title : 'Dashboard Easy-IOT',
		user: req.session.user,
		version: version,
	});
});

router.get('/register', function(req, res) {
	res.render('register', {
		title : 'Register to Easy-IOT',
		user: req.session.user
	});
});

router.get('/login', function(req, res) {
	res.render('login', {
		title : 'Log-in to Easy-IOT',
		user: req.session.user
	});
});

router.get('/unauthorized', function(req, res) {
	res.render('unauthorized', {
		title : 'Unauthorized, Please log-in again to Easy-IOT',
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
			title : 'Log-in Failed to Easy-IOT',
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
				//console.log(permissions);
				
				req.session.bearer.permissions = permissions;
				req.session.user.permissions = req.session.bearer.permissions;
				
				req.session.session_id = SESS_ID;
				//console.log(req.session);
				res.cookie('session_id', SESS_ID);
				next();
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
		if ( req.session !== undefined && req.session.user !== undefined && req.session.user.id !== undefined ) {
			if( !(req.session && req.session.user) ) {				
				res.redirect('/unauthorized');
			} else {
				//console.log("I have a session_id: "+req.cookies.session_id);
				next();
			}
		} else {
			res.redirect('/unauthorized');
		}
	}
}

module.exports = router;

'use strict';
var async = require('async');
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
	
	console.log(req.session);
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
	var flows = [
		{flow_id: "1", limit: 100, page: 1, sort: 0},
		{flow_id: "2", limit: 100, page: 1, sort: 0},
		{flow_id: "4", limit: 100, page: 1, sort: 0},
		{flow_id: "5", limit: 100, page: 1, sort: 0},
		{flow_id: "24", limit: 100, page: 1, sort: 0},
		{flow_id: "19fc7ca5-a4f1-4af3-91c9-2426bd1a3f0f", limit: 100, page: 1, sort: 0},
		{flow_id: "6d844fbf-29c0-4a41-8c6a-0e9f3336cea3", limit: 100, page: 1, sort: 0}
	];
	var json = {};

	var wf = [
		function(callback) { // only callback here
			var f = flows.pop();
			var query = squel.select()
			.field('timestamp, value, flow_id, timestamp AS id')
			.from('data')
			.where('flow_id=?', f.flow_id)
			.limit(f.limit)
			.offset((f.page - 1) * f.limit)
			.order('timestamp', f.sort)
			.toString()
			;
			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				else if(data.length > 0) {
					//data.id = moment(data.timestamp).format('x'); //BUG
					//console.log(data);
					data.flow_id = f.flow_id;
					data.page = f.page;
					data.next = f.page+1;
					data.prev = f.page-1;
					data.limit = f.limit;
					data.order = f.order!==undefined?f.order:'asc';
					json[f.flow_id] = (new DataSerializer(data).serialize());
					callback(null, json);
				}
			});
		},
		function(json, callback) {
			var f = flows.pop();
			var query = squel.select()
			.field('timestamp, value, flow_id, timestamp AS id')
			.from('data')
			.where('flow_id=?', f.flow_id)
			.limit(f.limit)
			.offset((f.page - 1) * f.limit)
			.order('timestamp', f.sort)
			.toString()
			;
			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				else if(data.length > 0) {
					//data.id = moment(data.timestamp).format('x'); //BUG
					//console.log(data);
					data.flow_id = f.flow_id;
					data.page = f.page;
					data.next = f.page+1;
					data.prev = f.page-1;
					data.limit = f.limit;
					data.order = f.order!==undefined?f.order:'asc';
					json[f.flow_id] = (new DataSerializer(data).serialize());
					callback(null, json);
				}
			});
		},
		function(json, callback) {
			var f = flows.pop();
			var query = squel.select()
			.field('timestamp, value, flow_id, timestamp AS id')
			.from('data')
			.where('flow_id=?', f.flow_id)
			.limit(f.limit)
			.offset((f.page - 1) * f.limit)
			.order('timestamp', f.sort)
			.toString()
			;
			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				else if(data.length > 0) {
					//data.id = moment(data.timestamp).format('x'); //BUG
					//console.log(data);
					data.flow_id = f.flow_id;
					data.page = f.page;
					data.next = f.page+1;
					data.prev = f.page-1;
					data.limit = f.limit;
					data.order = f.order!==undefined?f.order:'asc';
					json[f.flow_id] = (new DataSerializer(data).serialize());
					callback(null, json);
				}
			});
		},
		function(json, callback) {
			var f = flows.pop();
			var query = squel.select()
			.field('timestamp, value, flow_id, timestamp AS id')
			.from('data')
			.where('flow_id=?', f.flow_id)
			.limit(f.limit)
			.offset((f.page - 1) * f.limit)
			.order('timestamp', f.sort)
			.toString()
			;
			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				else if(data.length > 0) {
					//data.id = moment(data.timestamp).format('x'); //BUG
					//console.log(data);
					data.flow_id = f.flow_id;
					data.page = f.page;
					data.next = f.page+1;
					data.prev = f.page-1;
					data.limit = f.limit;
					data.order = f.order!==undefined?f.order:'asc';
					json[f.flow_id] = (new DataSerializer(data).serialize());
					callback(null, json);
				}
			});
		},
		function(json, callback) {
			var f = flows.pop();
			var query = squel.select()
			.field('timestamp, value, flow_id, timestamp AS id')
			.from('data')
			.where('flow_id=?', f.flow_id)
			.limit(f.limit)
			.offset((f.page - 1) * f.limit)
			.order('timestamp', f.sort)
			.toString()
			;
			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				else if(data.length > 0) {
					//data.id = moment(data.timestamp).format('x'); //BUG
					//console.log(data);
					data.flow_id = f.flow_id;
					data.page = f.page;
					data.next = f.page+1;
					data.prev = f.page-1;
					data.limit = f.limit;
					data.order = f.order!==undefined?f.order:'asc';
					json[f.flow_id] = (new DataSerializer(data).serialize());
					callback(null, json);
				}
			});
		},
		function(json, callback) {
			var f = flows.pop();
			var query = squel.select()
			.field('timestamp, value, flow_id, timestamp AS id')
			.from('data')
			.where('flow_id=?', f.flow_id)
			.limit(f.limit)
			.offset((f.page - 1) * f.limit)
			.order('timestamp', f.sort)
			.toString()
			;
			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				else if(data.length > 0) {
					//data.id = moment(data.timestamp).format('x'); //BUG
					//console.log(data);
					data.flow_id = f.flow_id;
					data.page = f.page;
					data.next = f.page+1;
					data.prev = f.page-1;
					data.limit = f.limit;
					data.order = f.order!==undefined?f.order:'asc';
					json[f.flow_id] = (new DataSerializer(data).serialize());
					callback(null, json);
				}
			});
		},
		function(json, callback) {
			var f = flows.pop();
			var query = squel.select()
			.field('timestamp, value, flow_id, timestamp AS id')
			.from('data')
			.where('flow_id=?', f.flow_id)
			.limit(f.limit)
			.offset((f.page - 1) * f.limit)
			.order('timestamp', f.sort)
			.toString()
			;
			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				else if(data.length > 0) {
					//data.id = moment(data.timestamp).format('x'); //BUG
					//console.log(data);
					data.flow_id = f.flow_id;
					data.page = f.page;
					data.next = f.page+1;
					data.prev = f.page-1;
					data.limit = f.limit;
					data.order = f.order!==undefined?f.order:'asc';
					json[f.flow_id] = (new DataSerializer(data).serialize());
					callback(null, json);
				}
			});
		}
	];
	
	async.waterfall(wf, function(error) {
		if (error) {
			console.log(error);
		} else {
			console.log(json);
			res.render('dashboard'+dashboard_id, {
				title : 'Dashboard EasyIOT',
				user: req.session.user,
				json: JSON.stringify(json),
			});
		}
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
		console.log(req.session.user);
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
				//req.session.bearer = token;
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

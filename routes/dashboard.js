'use strict';
var express = require('express');
var router	= express.Router();
var DataSerializer = require('../serializers/data');
var ErrorSerializer = require('../serializers/error');
var users;
var objects;
var units;
var flows;
var datatypes;
var tokens;
var rules;
var objectTypes = ['rooter', 'sensor', 'computer', 'laptop', 'desktop', 'phone', 'smartphone', 'tablet', 'server', 'printer'];

function alphaSort(obj1, obj2) {
    return (obj1.name).toLowerCase().localeCompare((obj2.name).toLowerCase());
};

router.get('/', function(req, res) {
	res.render('index', {
		title : 'Dashboard Easy-IOT',
		user: req.session.user
	});
});

router.get('/objects', Auth,  function(req, res) {
	objects	= db.getCollection('objects');
	var query = { 'user_id': req.session.user.id };
	var pagination=8;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	res.render('objects', {
		title : 'Objects Easy-IOT',
		objects: objects.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data(),
		new_object: {},
		page: req.query.page,
		pagenb: Math.ceil(((objects.chain().find(query).data()).length) / pagination),
		types: objectTypes,
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
		res.redirect('/404');
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
			types: objectTypes,
			user: req.session.user
		});
	} else {
		res.redirect('/404');
	}
});

router.post('/objects/:object_id([0-9a-z\-]+)/edit', Auth, function(req, res) {
	var object_id = req.params.object_id;
	if ( object_id !== undefined ) {
		objects	= db.getCollection('objects');
		var queryO = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : object_id },
			]
		};
		var json = (objects.chain().find(queryO).limit(1).data())[0];
		//console.log(json);
		if ( json ) {
			json.name 			= req.body.name!==undefined?req.body.name:json.name;
			json.type 			= req.body.type!==undefined?req.body.type:json.type;
			json.description	= req.body.description!==undefined?req.body.description:json.description;
			json.position		= req.body.position!==undefined?req.body.position:json.description;
			json.ipv4			= req.body.ipv4!==undefined?req.body.ipv4:json.ipv4;
			json.ipv6			= req.body.ipv6!==undefined?req.body.ipv6:json.ipv6;
			json.user_id		= req.session.user.id;
			
			objects.update(json);
			db.save();
			
			res.redirect('/objects/'+object_id);
		} else {
			res.redirect('/404');
		}
	} else {
		res.redirect('/404');
	}
});

router.get('/objects/:object_id([0-9a-z\-]+)/remove', Auth, function(req, res) {
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
	var json = objects.chain().find(queryO).limit(1).remove().data();
	//console.log(json);
	if ( json ) {
		res.redirect('/objects');
	} else {
		res.redirect('/404');
	}
});

router.post('/objects/add', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	var message = '';
	var new_object = {
		id:				uuid.v4(),
		name:			req.body.name!==undefined?req.body.name:'unamed',
		type:  			req.body.type!==undefined?req.body.type:'default',
		description:	req.body.description!==undefined?req.body.description:'',
		position: 	 	req.body.position!==undefined?req.body.position:'',
		ipv4:  			req.body.ipv4!==undefined?req.body.ipv4:'',
		ipv6:			req.body.ipv6!==undefined?req.body.ipv6:'',
		user_id:		req.session.user.id,
	};
	var query = { 'user_id': req.session.user.id };
	var pagination=8;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	
	if ( new_object.name && new_object.type && new_object.user_id ) {
		objects.insert(new_object);
		db.save();
		message = {type: 'success', value: 'Successfully added.'};
	} else {
		message = {type: 'danger', value: 'Please give a name and a type to your Object!'};
	}
	
	res.render('objects', {
		title : 'Objects Easy-IOT',
		objects: objects.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data(),
		new_object: new_object,
		page: req.query.page,
		pagenb: Math.ceil(((objects.chain().find(query).data()).length) / pagination),
		types: objectTypes,
		user: req.session.user,
		message: message,
		currentUrl: req.path,
	});
});

router.get('/flows', Auth, function(req, res) {
	flows	= db.getCollection('flows');
	objects	= db.getCollection('objects');
	units	= db.getCollection('units');
	datatypes	= db.getCollection('datatypes');

	var query = { 'user_id': req.session.user.id };
	var pagination=8;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var f = flows.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data();
	var o = objects.chain().find(query).sort(alphaSort).data();
	var dt = datatypes.chain().find().sort(alphaSort).data();
	var u = units.chain().find().sort(alphaSort).data();
	res.render('flows', {
		title : 'Flows Easy-IOT',
		flows: f,
		objects: o,
		datatypes: dt,
		units: u,
		page: req.query.page,
		pagenb: Math.ceil(((flows.chain().find(query).data()).length) / pagination),
		user: req.session.user,
		message: {type: '', value: ''}
	});
});

router.get('/profile', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	tokens	= db.getCollection('tokens');
	rules	= dbRules.getCollection('rules');

	var queryO = { 'user_id' : req.session.user.id };
	var queryF = { 'user_id' : req.session.user.id };
	var queryT = { 'user_id' : req.session.user.id };
	var queryR = { 'user_id' : req.session.user.id };
	res.render('profile', {
		title : 'Profile Easy-IOT',
		objects: ((objects.chain().find(queryO).data()).length),
		flows: ((flows.chain().find(queryF).data()).length),
		rules: (rules.chain().find(queryR).data().length),
		tokens: (tokens.chain().find(queryT).data()),
		calls: 125,
		quota: quota.admin, // TODO
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
	rules = dbRules.getCollection("rules");
	var queryR = { 'user_id': req.session.user.id };
	/*queryR = {
		'$and': [
					{ 'user_id': req.session.user.id },
					{ 'id': 'ceda166a-df25-4bc4-ae77-3823f63193f9' }
				]
			};
	*/
	var r = rules.chain().find(queryR).simplesort('on', 'priority', 'name').data();
	res.render('decision-rules', {
		title : 'Decision Rules Easy-IOT',
		user: req.session.user,
		rules: r,
	});
});

router.post('/decision-rules/save-rule/:rule_id([0-9a-z\-]+)', Auth, function(req, res) {
	var rule_id = req.params.rule_id;
	if ( !rule_id || !req.body.name ) {
		res.status(412).send(new ErrorSerializer({'id': 1009,'code': 412, 'message': 'Precondition Failed'}).serialize());
	} else {
		rules = dbRules.getCollection("rules");
		var queryR = {
			'$and': [
						{ 'user_id': req.session.user.id },
						{ 'id': rule_id }
					]
				};
		var rule = rules.findOne(queryR);
		if ( !rule ) {
			res.status(404).send(new ErrorSerializer({'id': 1006,'code': 404, 'message': 'Not Found'}).serialize());
		} else {
			rule.name			= req.body.name;
			rule.on				= req.body.on;
			rule.priority		= req.body.priority;
			rule.consequence	= req.body.consequence;
			rule.condition		= req.body.condition;
			rule.flow_control	= req.body.flow_control;
			rules.update(rule);
			res.status(200).send({ 'code': 200, message: 'Successfully updated', rule: rule });
		}
	}
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

router.post('/register', function(req, res) {
	users	= db.getCollection('users');
	var my_id = uuid.v4();
	var new_user = {
		id:					my_id,
		firstName:			req.body.firstName!==undefined?req.body.firstName:'',
		lastName:			req.body.lastName!==undefined?req.body.lastName:'',
		email:				req.body.email!==undefined?req.body.email:'',
		subscription_date:  moment().format('x'),
	};
	if ( new_user.email && new_user.id ) {
		users.insert(new_user);
		var new_token = {
				user_id:			new_user.id,
				key:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
				secret:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
		        expiration:			'',
		};
		var tokens	= db.getCollection('tokens');
		tokens.insert(new_token);
		
		res.render('emails/welcome', {user: new_user, token: new_token}, function(err, html) {
			var to = new_user.firstName+' '+new_user.lastName+' <'+new_user.email+'>';
			var mailOptions = {
				from: from,
				bcc: bcc,
				to: to,
				subject: 'Welcome to Easy-IOT',
				text: 'Html email client is required',
				html: html
			};
			transporter.sendMail(mailOptions, function(err, info){
			    if( err ){
			    	res.redirect('/404');
			    } else {
			    	res.render('login', {
						title : 'Login to Easy-IOT',
						user: req.session.user,
						message: {type: 'success', value: 'Account created successfully. Please, check your inbox!'}
					});
			    }
			});
		});
		
		//res.redirect('/profile');
	} else {
		res.render('register', {
			title : 'Register to Easy-IOT',
			user: req.session.user,
			message: {type: 'danger', value: 'Please, give me your name!'}
		});
	}
	
});

router.get('/mail/welcome', function(req, res) {
	var fake_user = req.session.user;
	var fake_token = {
		user_id:			fake_user.id,
		key:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
		secret:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
        expiration:			'',
	};
	res.render('emails/welcome', {
		title : 'Log-in to Easy-IOT',
		baseUrl: baseUrl,
		user: fake_user,
		token: fake_token
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
				req.session.user.mail_hash = md5(req.session.user.email);
				
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

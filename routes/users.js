'use strict';
var express = require('express');
var router = express.Router();
var UserSerializer = require('../serializers/user');
var PermissionSerializer = require('../serializers/permission');
var ErrorSerializer = require('../serializers/error');
var users;
var tokens;

/**
 * @api {post} /users/reminderMail Send reminder Email to Users
 * @apiName Send reminder Email to Users
 * @apiGroup User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiUse 403
 * @apiUse 404
 */
router.get('/reminderMail', bearerAdmin, function (req, res) {
	if ( req.token !== undefined && process.env.NODE_ENV === 'production' ) {
		users	= db.getCollection('users');
		//var query = {'token': { '$eq': null }};
		var query = { '$and': [
	   	           {'subscription_date': { '$lte': moment().subtract(7, 'days') }},
	 	           {'reminderMail': undefined},
	 	           {'token': null},
	 			]};
		var json = users.find( query );
		if ( json.length > 0 ) {
			/* Send a Reminder Email to each users */
			json.forEach(function(user) {
				//console.log(user.firstName+' '+user.lastName+' <'+user.email+'>');
				res.render('emails/reminder', {user: user}, function(err, html) {
					var to = user.firstName+' '+user.lastName+' <'+user.email+'>';
					var mailOptions = {
						from: from,
						bcc: bcc,
						to: to,
						subject: 't6 Reminder',
						text: 'Html email client is required',
						html: html
					};
					transporter.sendMail(mailOptions, function(err, info){
					    if( err ){
							var err = new Error('Internal Error');
							err.status = 500;
							res.status(err.status || 500).render(err.status, {
								title : 'Internal Error'+app.get('env'),
								user: req.session.user,
								currentUrl: req.path,
								err: err
							});
					    } else {
							users.findAndUpdate(
								function(i){return i.id==user.id;},
								function(item){
									item.reminderMail = parseInt(moment().format('x'));
								}
							);
							db.save();
					    }
					});
				});
			});
			res.status(200).send(new UserSerializer(json).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({'id': 20, 'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({'id': 19, 'code': 403, 'message': 'Forbidden '+process.env.NODE_ENV}).serialize());
	}
});

/**
 * @api {post} /users/changePassword Send Password Expiration Email to Users
 * @apiName Send Password Expiration Email to Users
 * @apiGroup User
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission Admin
 * 
 * @apiUse 403
 * @apiUse 404
 */
router.get('/changePassword', bearerAdmin, function (req, res) {
	if ( req.token !== undefined && process.env.NODE_ENV === 'production' ) {
		users	= db.getCollection('users');
		//var query = {'token': { '$eq': null }};
		var query = { '$and': [
		           {'$or': [{'passwordLastUpdated': { '$lte': moment().subtract(3, 'months') }}, {passwordLastUpdated: undefined}]},
	 	           {'changePasswordMail': { '$lte': moment().subtract(3, 'months') }},
	 	           {'token': null},
	 			]};
		var json = users.find( query );
		if ( json.length > 0 ) {
			/* Send a Reminder Email to each users */
			json.forEach(function(user) {
				//console.log(user.firstName+' '+user.lastName+' <'+user.email+'>' + ' --> ' + user.changePasswordMail + moment(user.changePasswordMail).format('DD/MM/YYYY, HH:mm'));
				res.render('emails/change-password', {user: user}, function(err, html) {
					var to = user.firstName+' '+user.lastName+' <'+user.email+'>';
					var mailOptions = {
						from: from,
						bcc: bcc,
						to: bcc, // DO NOT COMMIT // DO NOT COMMIT // DO NOT COMMIT // DO NOT COMMIT // DO NOT COMMIT
						subject: 't6 Password Expiration',
						text: 'Html email client is required',
						html: html
					};
					transporter.sendMail(mailOptions, function(err, info){
					    if( err ){
							var err = new Error('Internal Error');
							err.status = 500;
							res.status(err.status || 500).render(err.status, {
								title : 'Internal Error'+app.get('env'),
								user: req.session.user,
								currentUrl: req.path,
								err: err
							});
					    } else {
							users.findAndUpdate(
								function(i){return i.id==user.id;},
								function(item){
									item.changePasswordMail = parseInt(moment().format('x'));
								}
							);
							db.save();
					    }
					});
				});
			});
			res.status(200).send(new UserSerializer(json).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({'id': 20, 'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({'id': 18, 'code': 403, 'message': 'Forbidden '+process.env.NODE_ENV}).serialize());
	}
});

/**
 * @api {get} /users/:user_id Get User
 * @apiName Get User
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} user_id User ID
 * 
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get('/:user_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var user_id = req.params.user_id;
	if ( req.token !== undefined && req.user.id == user_id ) {
		users	= db.getCollection('users');
		res.status(200).send(new UserSerializer(users.find({'id': { '$eq': user_id }})).serialize());
	} else {
		res.status(403).send(new ErrorSerializer({'id': 16, 'code': 403, 'message': 'Forbidden'}).serialize());
	}
});

/**
 * @api {post} /users/me/token Create New Token
 * @apiName Create New Token
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiParam {String} key API_KEY.
 * @apiParam {String} secret API_SECRET.
 * 
 * @apiUse 400
 * @apiUse 403
 * @apiUse 429
 */
router.post('/me/token', function (req, res) {
	users			= db.getCollection('users');
	tokens			= db.getCollection('tokens');
	var API_KEY		= req.params.key!==undefined?req.params.key:req.body.key;
	var API_SECRET	= req.params.secret!==undefined?req.params.secret:req.body.secret;
	
	if  ( API_KEY && API_SECRET ) {
		// check KEY+SECRET against Collection and expiration date
		var auth = tokens.find(
			{ '$and': [
				{ 'key': API_KEY },
				{ 'secret': API_SECRET },
			]}
		);
		if ( auth.length <= 0 ) {
			res.status(403).send(new ErrorSerializer({'id': 15, 'code': 403, 'message': 'Forbidden'}).serialize());
		} else {
			var permissions = req.body.permissions!==undefined?req.body.permissions:'600';
			if ( permissions < 600 ) {
				res.status(400).send(new ErrorSerializer({'id': 14, 'code': 400, message: 'Bad Request', details: 'Permission must be greater than 600!'}).serialize());
			}
			// check expiration date
			if ( auth.expiration > moment().format('x') ) {
				// TODO: is it necessary to check the expiration on an API KEY + SECRET?
				res.status(403).send(new ErrorSerializer({'id': 13,'code': 403, 'message': 'Forbidden expired token'}).serialize()); // TODO, is there any better Status here?
			} else {
				// generates a temporary access token that will expire
				// in a specified amount of time
				var new_token = {
					user_id: auth[0].user_id,
					expiration: moment().add(1, 'hours').format('x'),
					permissions: permissions,
					token: passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
				};
				tokens.insert(new_token);
				res.status(201).send({ 'code': 201, message: 'Created', token: new_token }); // TODO: missing serializer
				
				// Find and remove expired tokens from Db
				var expired = tokens.chain().find(
					{ '$and': [
				           { 'expiration' : { '$lt': moment().format('x') } },
				           { 'expiration' : { '$ne': '' } },
					]}
				).remove();
				if ( expired ) db.save();
			}
		}
	} else {
		res.status(403).send(new ErrorSerializer({'id': 12,'code': 403, 'message': 'Forbidden'}).serialize());
	}	
});

/**
 * @api {get} /users/me/token Get self Current Token
 * @apiName Get self Current Token
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get('/me/token', bearerAuthToken, function (req, res) {
	if ( req.user !== undefined ) {
		var json = new UserSerializer(req.user).serialize();
		if ( json !== undefined ) {
			res.status(200).send(json);
		} else {
			res.status(404).send(new ErrorSerializer({'id': 11,'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({'id': 10,'code': 403, 'message': 'Forbidden'}).serialize());
	}
});

/**
 * @api {post} /users Create New User
 * @apiName Create New User
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiParam {String} firstName The User First Name
 * @apiParam {String} lastName The User Last Name
 * @apiParam {String} email The User Email address
 * 
 * @apiUse 412
 * @apiUse 429
 */
router.post('/', function (req, res) {
	if ( !req.body.email ) {
		res.status(412).send(new ErrorSerializer({'id': 9,'code': 412, 'message': 'Precondition Failed'}).serialize());
	} else {
		users	= db.getCollection('users');
		var my_id = uuid.v4();
		var new_user = {
			id:					my_id,
			firstName:			req.body.firstName!==undefined?req.body.firstName:'',
			lastName:			req.body.lastName!==undefined?req.body.lastName:'',
			email:				req.body.email!==undefined?req.body.email:'',
			role:				'free', // no admin creation from the API
			subscription_date:  moment().format('x'),
		};
		events.add('t6Api', 'user add', new_user.id);
		users.insert(new_user);
		
		var new_token = {
			user_id:			my_id,
			key:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
			secret:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
	        expiration:			'',
		};
		var tokens	= db.getCollection('tokens');
		tokens.insert(new_token);
		// TODO: the Welcome Mail is never sent!.
		
		res.status(201).send({ 'code': 201, message: 'Created', user: new UserSerializer(new_user).serialize(), token: new_token }); // TODO: missing serializer
	}
});

/**
 * @api {put} /users/:user_id Edit a User
 * @apiName Edit a User
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} user_id User ID
 * @apiParam {String} [firstName] The updated User First Name
 * @apiParam {String} [lastName] The updated User Last Name
 * @apiParam {String} [email] The updated User Email address
 * 
 * @apiUse 403
 * @apiUse 412
 * @apiUse 429
 */
router.put('/:user_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var user_id = req.params.user_id;
	if ( !(req.body.email || req.body.lastName || req.body.firstName ) ) {
		res.status(412).send(new ErrorSerializer({'id': 8,'code': 412, 'message': 'Precondition Failed'}).serialize());
	} else {
		req.token = req.token!==undefined?req.token:req.session.token;
		req.user = req.user!==undefined?req.user:req.session.user;
		if ( req.token !== undefined && req.user.id == user_id ) {
			var item = users.findOne( {'id': user_id} );
			item.firstName		= req.body.firstName!==undefined?req.body.firstName:item.firstName;
			item.lastName		= req.body.lastName!==undefined?req.body.lastName:item.lastName;
			item.email			= req.body.email!==undefined?req.body.email:item.email;
			item.update_date	= moment().format('x');
			users.update(item);
			res.status(200).send({ 'code': 200, message: 'Successfully updated', user: new UserSerializer(item).serialize() }); // TODO: missing serializer
		} else {
			res.status(403).send(new ErrorSerializer({'id': 7,'code': 403, 'message': 'Forbidden'}).serialize());
		}
	}
});

/**
 * @api {delete} /users/:user_id Edit a User
 * @apiName Edit a User
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} user_id User ID
 * 
 * @apiUse 403
 * @apiUse 404
 * @apiUse 429
 */
router.delete('/:user_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var user_id = req.params.user_id;
	if ( req.token !== undefined && req.user.id == user_id ) {
		users	= db.getCollection('users');
		var u = users.find({'id': { '$eq': user_id }});
		if (u) {
			users.remove(u);
			res.status(200).send({ 'code': 200, message: 'Successfully deleted', removed_id: user_id }); // TODO: missing serializer
		} else {
			res.status(404).send(new ErrorSerializer({'id': 6,'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({'id': 5,'code': 403, 'message': 'Forbidden'}).serialize());
	}
});

function bearerAuth(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers['authorization'];
	users	= db.getCollection('users');
	if ( typeof bearerHeader !== 'undefined' ) {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;
		req.user = (users.find({'token': { '$eq': req.token }}))[0];
		next();
	} else {
		res.status(403).send(new ErrorSerializer({'id': 4,'code': 403, 'message': 'Forbidden'}).serialize());
	}
}

function bearerAuthToken(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers['authorization'];
	tokens	= db.getCollection('tokens');
	users	= db.getCollection('users');
	if ( typeof bearerHeader !== 'undefined' || req.session.bearer ) {
		if ( req.session && !bearerHeader ) { // Login using the session
			req.user = req.session.user;
			req.token = req.session.token;
			req.bearer = req.session.bearer;
		} else {
			var bearer = bearerHeader.split(" ");// TODO split with Bearer as prefix!
			bearerToken = bearer[1];
			req.token = bearerToken;
			req.bearer = tokens.findOne(
				{ '$and': [
		           {'token': { '$eq': req.token }},
		           {'expiration': { '$gte': moment().format('x') }},
				]}
			);
		}

		if ( !req.bearer ) {
			res.status(403).send(new ErrorSerializer({'id': 3, 'code': 403, 'message': 'Forbidden'}).serialize());
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }}) ) { // TODO: in case of Session, should be removed !
				req.user.permissions = req.bearer.permissions;
				next();
			} else {
				res.status(404).send(new ErrorSerializer({'id': 2, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 1, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
}

function bearerAdmin(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers['authorization'];
	tokens	= db.getCollection('tokens');
	users	= db.getCollection('users');
	if ( typeof bearerHeader !== 'undefined' ) {
		var bearer = bearerHeader.split(" ");// TODO split with Bearer as prefix!
		bearerToken = bearer[1];
		req.token = bearerToken;
		req.bearer = tokens.findOne(
			{ '$and': [
	           {'token': { '$eq': req.token, }},
	           {'expiration': { '$gte': moment().format('x'), }}
			]}
		);
		if ( !req.bearer ) {
			res.status(403).send(new ErrorSerializer({'id': 22, 'code': 431, 'message': 'Forbidden'}).serialize());
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }, 'role': 'admin'}) ) {
				next();
			} else {
				res.status(404).send(new ErrorSerializer({'id': 23, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 24, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
}

module.exports = router;

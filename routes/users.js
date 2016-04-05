'use strict';
var express = require('express');
var router = express.Router();
var UserSerializer = require('../serializers/user');
var PermissionSerializer = require('../serializers/permission');
var ErrorSerializer = require('../serializers/error');
var users;
var tokens;


router.get('/:user_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var user_id = req.params.user_id;
	if ( req.token !== undefined && req.user.id == user_id ) {
		users	= db.getCollection('users');
		var json = new UserSerializer(users.find({'id': { '$eq': user_id }})).serialize();
		res.send(json, 200);
	} else {
		res.send(new ErrorSerializer({'id': 16, 'code': 403, 'message': 'Forbidden'}).serialize(), 403);
	}
});

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
			res.send(new ErrorSerializer({'id': 15, 'code': 403, 'message': 'Forbidden'}).serialize(), 403);
		} else {
			var permissions = req.body.permissions!==undefined?req.body.permissions:'600';
			if ( permissions < 600 ) {
				res.send(new ErrorSerializer({'id': 14, 'code': 400, message: 'Bad Request', details: 'Permission must be greater than 600!'}).serialize(), 400);
			}
			// check expiration date
			if ( auth.expiration > moment().format('x') ) {
				// TODO: is it necessary to check the expiration on an API KEY + SECRET?
				res.send(new ErrorSerializer({'id': 13,'code': 403, 'message': 'Forbidden expired token'}).serialize(), 403); // TODO, is there any better Status here?
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
				res.send({ 'code': 201, message: 'Created', token: new_token }, 201);
				
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
		res.send(new ErrorSerializer({'id': 12,'code': 403, 'message': 'Forbidden'}).serialize(), 403);
	}	
});

router.get('/me/token', bearerAuthToken, function (req, res) {
	if ( req.user !== undefined ) {
		var json = new UserSerializer(req.user).serialize();
		if ( json !== undefined ) {
			res.send(json, 200);
		} else {
			res.send(new ErrorSerializer({'id': 11,'code': 404, 'message': 'Not Found'}).serialize(), 404);
		}
	} else {
		res.send(new ErrorSerializer({'id': 10,'code': 403, 'message': 'Forbidden'}).serialize(), 403);
	}
});

router.post('/', function (req, res) {
	if ( !req.body.email ) {
		res.send(new ErrorSerializer({'id': 9,'code': 412, 'message': 'Precondition Failed'}).serialize(), 412);
	} else {
		users	= db.getCollection('users');
		var my_id = uuid.v4();
		var new_user = {
			id:					my_id,
			firstName:			req.body.firstName!==undefined?req.body.firstName:'',
			lastName:			req.body.lastName!==undefined?req.body.lastName:'',
			email:				req.body.email!==undefined?req.body.email:'',
			subscription_date:  moment().format('x'),
		};
		users.insert(new_user);
		
		var new_token = {
			user_id:			my_id,
			key:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
			secret:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
	        expiration:			'',
		};
		var tokens	= db.getCollection('tokens');
		tokens.insert(new_token);
		
		res.send({ 'code': 201, message: 'Created', user: new UserSerializer(new_user).serialize(), token: new_token }, 201);
	}
});

router.put('/:user_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var user_id = req.params.user_id;
	if ( !(req.body.email || req.body.lastName || req.body.firstName ) ) {
		res.send(new ErrorSerializer({'id': 8,'code': 412, 'message': 'Precondition Failed'}).serialize(), 412);
	} else {
		if ( req.token !== undefined && req.user.id == user_id ) {
			var item = users.findOne( {'id': user_id} );
			item.firstName		= req.body.firstName!==undefined?req.body.firstName:item.firstName;
			item.lastName		= req.body.lastName!==undefined?req.body.lastName:item.lastName;
			item.email			= req.body.email!==undefined?req.body.email:item.email;
			item.update_date	= moment().format('x');
			users.update(item);
			res.send({ 'code': 200, message: 'Successfully updated', user: new UserSerializer(item).serialize() }, 200);
		} else {
			res.send(new ErrorSerializer({'id': 7,'code': 403, 'message': 'Forbidden'}).serialize(), 403);
		}
	}
});

router.delete('/:user_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var user_id = req.params.user_id;
	if ( req.token !== undefined && req.user.id == user_id ) {
		users	= db.getCollection('users');
		var u = users.find({'id': { '$eq': user_id }});
		if (u) {
			users.remove(u);
			res.send({ 'code': 200, message: 'Successfully deleted', removed_id: user_id }, 200); // TODO: missing serializer
		} else {
			res.send(new ErrorSerializer({'id': 6,'code': 404, 'message': 'Not Found'}).serialize(), 404);
		}
	} else {
		res.send(new ErrorSerializer({'id': 5,'code': 403, 'message': 'Forbidden'}).serialize(), 403);
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
		res.send(new ErrorSerializer({'id': 4,'code': 403, 'message': 'Forbidden'}).serialize(), 403);
	}
}

function bearerAuthToken(req, res, next) {
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
	           {'token': { '$eq': req.token }},
	           {'expiration': { '$gte': moment().format('x') }},
			]}
		);
		if ( !req.bearer ) {
			res.send(new ErrorSerializer({'id': 3,'code': 403, 'message': 'Forbidden'}).serialize(), 403);
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }}) ) {
				req.user.permissions = req.bearer.permissions;
				next();
			} else {
				res.send(new ErrorSerializer({'id': 2,'code': 404, 'message': 'Not Found'}).serialize(), 404);
			}
		}
	} else {
		res.send(new ErrorSerializer({'id': 1,'code': 401, 'message': 'Unauthorized'}).serialize(), 401);
	}
}

module.exports = router;

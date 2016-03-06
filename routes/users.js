'use strict';
var express = require('express');
var router = express.Router();
var UserSerializer = require('../serializers/user');
var PermissionSerializer = require('../serializers/permission');
var users;
var tokens;

/*
router.get('/', function (req, res) {
	// Todo: only for admins
	users	= db.getCollection('users');
	var json = new UserSerializer(users.find()).serialize();
	res.send(json);
});
*/

router.get('/me', bearerAuth, function (req, res) {
	if ( req.token !== undefined ) {
		var json = new UserSerializer(req.user).serialize();
		if ( json !== undefined ) {
			res.send(json);
		} else {
			res.send({ 'code': 404, message: 'Not Found' }, 404);
		}
	}
});

router.get('/:user_id', bearerAuth, function (req, res) {
	var user_id = req.params.user_id;
	if ( !req.user ) {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	} else {
		if ( req.token !== undefined && user_id == req.user.id ) {
			var json = new UserSerializer(req.user).serialize();
			if ( json !== undefined ) {
				res.send(json);
			} else {
				res.send({ 'code': 404, message: 'Not Found' }, 404);
			}
		}
	}
});

router.get('/me/permissions', bearerAuth, function (req, res) {
	if ( req.token !== undefined ) {
		var json = new PermissionSerializer(req.user).serialize();
		if ( req.user !== undefined ) {
			res.send(json);
		} else {
			res.send({ 'code': 404, message: 'Not Found' }, 404);
		}
	}
});

router.post('/me/token', function (req, res) {
	// specific Collection for user_id, API_KEY, API_SECRET, expiration
	
	// {"key": "frerkotko", "secret": "frefr"}	
	
	users			= db.getCollection('users');
	tokens			= db.getCollection('tokens');
	var API_KEY		= req.params.key!==undefined?req.params.key:req.body.key;
	var API_SECRET	= req.params.secret!==undefined?req.params.secret:req.body.secret;
	
	if  ( API_KEY && API_SECRET ) {
		// check KEY+SECRET against Collection and expiration date
		// 
		var tk = tokens.find({ '$and': [
					{ 'API_KEY' : API_KEY }, // returns only object from current user
					{ 'API_SECRET' : API_SECRET }
				]
			}
		);
		if ( !tk ) {
			res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
		}	else {
			// check expiration date
			if ( tk.expiration > moment().format('x') ) {
				res.send({ 'code': 403, 'error': 'Forbidden expired token' }, 403); // TODO, is there any better Status here?
			} else {
				// generates a temporary access token that will expire
				// in a specified amount of time
				var new_token = {
					expiration: moment().format('x'), // TODO: + 1 hour !!!
					API_TOKEN: passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&~#{([-|`_\^à)]=}!§+°%£µø$<>'),
				};
				tokens.insert();
				
				// Find and remove expired tokens from Db
				//db.save();
				
				
				
				// scopes for permissions
			}
		}	
	} else {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}	
});

router.post('/', function (req, res) {
	users	= db.getCollection('users');
	var new_user = {
		id:					uuid.v4(),
		firstName:			req.body.firstName!==undefined?req.body.firstName:'',
		lastName:			req.body.lastName!==undefined?req.body.lastName:'',
		email:				req.body.email!==undefined?req.body.email:'',
		subscription_date:  moment().format('x'),
		token:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&~#{([-|`_\^à)]=}!§+°%£µø$<>'),
		secret:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&~#{([-|`_\^à)]=}!§+°%£µø$<>'),
		permissions:		req.body.permissions!==undefined?req.body.permissions:new Array(),
	};
	users.insert(new_user);
	res.send({ 'code': 201, message: 'Created', user: new UserSerializer(new_user).serialize() }, 201);
});

router.put('/:user_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	var user_id = req.params.user_id;
	if ( req.token !== undefined && req.user.id == user_id ) {
		users	= db.getCollection('users');
		//console.log(users);
		var result;
		users.findAndUpdate(
			function(i){return i.id==user_id},
			function(item){
				item.firstName		= req.body.firstName!==undefined?req.body.firstName:item.firstName;
				item.lastName		= req.body.lastName!==undefined?req.body.lastName:item.lastName;
				item.email			= req.body.email!==undefined?req.body.email:item.email;
				item.permissions	= req.body.permissions!==undefined?req.body.permissions:item.permissions;
				subscription_date	= item.subscription_date;
				result = item;
			}
		);
		//console.log(users);
		db.save();
		res.send({ 'code': 200, message: 'Successfully updated', user: new UserSerializer(result).serialize() }, 200);
	}
});

router.delete('/:user_id([0-9a-z\-]+)', function (req, res) {
	var user_id = req.params.user_id;
	if ( req.token !== undefined && req.user.id == user_id ) {
		users	= db.getCollection('users');
		var u = users.find({'id': { '$eq': user_id }});
		//console.log(u);
		if (u) {
			users.remove(u);
			db.save();
			res.send({ 'code': 200, message: 'Successfully deleted', removed_id: user_id }, 200); // TODO: missing serializer
		} else {
			res.send({ 'code': 404, message: 'Not Found' }, 404);
		}
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
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
}

module.exports = router;

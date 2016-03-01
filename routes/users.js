'use strict';
var express = require('express');
var router = express.Router();
var UserSerializer = require('../serializers/user');
var PermissionSerializer = require('../serializers/permission');
var users = dbUsers.getData("/users");

router.get('/', function (req, res) {
	// Todo: only for admins
	dbUsers.reload();
	var json = new UserSerializer(users).serialize();
	res.send(json);
});

router.get('/me', bearerAuth, function (req, res) {
	dbUsers.reload();
	if ( req.token !== undefined ) {
		var result = users.filter(function(item) {
		    return item.token == req.token;
		})[0];
		if ( result !== undefined ) {
			var json = new UserSerializer(result).serialize();
			res.send(json);
		} else {
			res.send({ 'code': 403, "error": "Forbidden" }, 403);
		}
	}
});

router.get('/me/permissions', bearerAuth, function (req, res) {
	dbUsers.reload();
	if ( req.token !== undefined ) {
		var result = users.filter(function(item) {
		    return item.token == req.token;
		})[0];
		if ( result !== undefined ) {
			var json = new PermissionSerializer(result).serialize();
			res.send(json);
		} else {
			res.send({ 'code': 403, "error": "Forbidden" }, 403);
		}
	}
});

router.get('/me/getPermissions', function (req, res) {
	dbUsers.reload();
	// todo
});

/*
router.get('/:user_id([0-9]+)', function (req, res) {
	dbUsers.reload();
	var user_id = req.params.user_id;
	
	var result = users.filter(function(item) {
	    return item.id == user_id;
	})[0];
	if ( result !== undefined ) {
		var json = new UserSerializer(result).serialize();
		res.send(json);
	} else {
		res.send({ 'code': 403, "error": "Forbidden" }, 403);
	}
});
*/

router.post('/', function (req, res) {
	dbUsers.reload();
	var new_user = {
		id: uuid.v4(),
		firstName:		req.body.firstName!==undefined?req.body.firstName:'',
		lastName:		req.body.lastName!==undefined?req.body.lastName:'',
		email:				req.body.email!==undefined?req.body.email:'',
		subscription_date:  moment().format('x'),
		token:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&~#{([-|`_\^à)]=}!§+°%£µø$<>'),
		permissions: 	req.body.permissions!==undefined?req.body.permissions:new Array(),
	};
	users.push(new_user);
	//console.log(users);
	dbUsers.push("/users", users);
	res.send({ 'code': 201, message: 'Created', user: new_user }, 201);
});

router.put('/:user_id([0-9a-z\-]+)', function (req, res) {
	//todo
	var user_id = req.params.user_id;
	dbUsers.reload();
	//console.log(users);
	var result = users.filter(function(item) {
		if ( item.id == user_id ) {
			item.firstName=		req.body.firstName!==undefined?req.body.firstName:item.firstName;
			item.lastName=		req.body.lastName!==undefined?req.body.lastName:item.lastName;
			item.email=				req.body.email!==undefined?req.body.email:item.email;
			item.permissions=	req.body.permissions!==undefined?req.body.permissions:item.permissions;
	    	return true;
	    }
	})[0];
	//console.log(users);
	dbUsers.push("/users", users);
	res.send({ 'code': 200, message: 'Successfully updated', user: result }, 200);
});

router.delete('/:user_id([0-9a-z\-]+)', function (req, res) {
	//todo
	res.send({ 'code': 200, message: 'Successfully deleted' }, 200);
});

function bearerAuth(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers['authorization'];
    if ( typeof bearerHeader !== 'undefined' ) {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        
			req.user_id = users.filter(function(u) {
			    return u.token == req.token;
			})[0];
        next();
    } else {
        res.send({ 'code': 403, "error": "Forbidden" }, 403);
    }
}

module.exports = router;

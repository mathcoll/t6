'use strict';
var express = require('express');
var router = express.Router();
var ObjectSerializer = require('../serializers/object');
var objects = dbObjects.getData("/objects");
var users = dbUsers.getData("/users");

router.get('/', bearerAuth, function (req, res) {
	dbObjects.reload();
	//TODO: looks to be buggy listng only the first item from the list!
	var result = objects.filter(function(item) {
		return req.user.id == item.id;
	})[0];
	if ( result !== undefined ) {
		var json = new ObjectSerializer(result).serialize();
		res.send(json);
	} else {
		res.send({ 'code': 500, message: 'Internal Server Error' }, 500);
	}
});

router.get('/:object_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	//TODO: buggy
	dbObjects.reload();
	var object_id = req.params.object_id;
	var result = objects.filter(function(item) {
		if ( item.id == object_id && req.user_id == item.user_id ) {
			return true;
		} else {
			return false;		
		}
	})[0];
	if ( result !== undefined ) {
		var json = new ObjectSerializer(result).serialize();
		res.send(json);
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
	}
});

router.post('/', function (req, res) {
	//TODO: not fully tested
	//todo
	dbObjects.reload();
	var new_object = {
		id: uuid.v4(),
		type:  req.body.type!==undefined?req.body.type:item.type,
		description:  req.body.description!==undefined?req.body.description:item.description,
		position:  req.body.position!==undefined?req.body.position:item.position,
		name:  req.body.name!==undefined?req.body.name:item.name,
	};
	objects.push(new_object);
	//console.log(objects);
	dbObjects.push("/objects", objects);
	res.send({ 'code': 201, message: 'Created', object: new_object }, 201);
});

router.put('/:object_id([0-9a-z\-]+)', function (req, res) {
	//todo
	res.send({ 'code': 200, message: 'Successfully updated' }, 200);
});

router.delete('/:object_id([0-9a-z\-]+)', function (req, res) {
	//todo
	res.send({ 'code': 200, message: 'Successfully deleted' }, 200);
});

function bearerAuth(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers['authorization'];
    dbUsers.reload();
    if ( typeof bearerHeader !== 'undefined' ) {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        
			req.user = users.filter(function(u) {
			    return u.token == req.token;
			})[0];
        next();
    } else {
        res.send({ 'code': 403, "error": "Forbidden" }, 403);
    }
}

module.exports = router;

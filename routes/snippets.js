'use strict';
var express = require('express');
var router = express.Router();
var SnippetSerializer = require('../serializers/snippet');
var ErrorSerializer = require('../serializers/error');
var snippets;
var users;
var tokens;

/**
 * @api {get} /snippets/:snippet_id Get Snippet(s)
 * @apiName Get Snippet(s)
 * @apiGroup Snippet
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [snippet_id] Snippet Id
 * @apiParam {String} [name] 
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get('/(:snippet_id([0-9a-z\-]+))?', bearerAuthToken, function (req, res) {
	var snippet_id = req.params.snippet_id;
	var name = req.query.name;
	if ( req.token !== undefined ) {
		snippets	= dbSnippets.getCollection('snippets');
		var query;
		if ( snippet_id !== undefined ) {
			query = {
			'$and': [
					{ 'user_id' : req.user.id },
					{ 'id' : snippet_id },
				]
			};
		} else {
			if ( name !== undefined ) {
				query = {
				'$and': [
						{ 'user_id' : req.user.id },
						{ 'name': { '$regex': [name, 'i'] } }
					]
				};
			} else {
				query = {
				'$and': [
						{ 'user_id' : req.user.id },
					]
				};
			}
		}
		var json = snippets.find(query);
		//console.log(query);
		if ( json.length > 0 ) {
			res.status(200).send(new SnippetSerializer(json).serialize());
		} else {
			res.status(404).send(new ErrorSerializer({'id': 127, 'code': 404, 'message': 'Not Found'}).serialize());
		}
	} else {
		res.status(403).send(new ErrorSerializer({'id': 128, 'code': 403, 'message': 'Forbidden'}).serialize());
	}
});

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
			res.status(403).send(new ErrorSerializer({'id': 33, 'code': 403, 'message': 'Forbidden'}).serialize());
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }}) ) { // TODO: in case of Session, should be removed !
				req.user.permissions = req.bearer.permissions;
				req.session.user = req.user;
				next();
			} else {
				res.status(404).send(new ErrorSerializer({'id': 34, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 35, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
}

module.exports = router;

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
 * @apiGroup 4. Snippet
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
router.get('/(:snippet_id([0-9a-z\-]+))?', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var snippet_id = req.params.snippet_id;
	var name = req.query.name;
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
	json = json.length>0?json:[];
	res.status(200).send(new SnippetSerializer(json).serialize());
});

/**
 * @api {post} /snippets Create New Snippet
 * @apiName Create New Snippet
 * @apiGroup 4. Snippet
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Snippet Name
 * @apiParam {String} [type] Snippet Type
 * @apiParam {String} [icon] Snippet Icon
 * @apiParam {String} [color] Snippet Color
 * @apiParam {String[]} [flows] List of Flow Ids
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post('/', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	snippets	= dbSnippets.getCollection('snippets');
	/* Check for quota limitation */
	var queryQ = { 'user_id' : req.user.id };
	var i = (snippets.find(queryQ)).length;
	if( i >= (quota[req.user.role]).snippets ) {
		res.status(429).send(new ErrorSerializer({'id': 129, 'code': 429, 'message': 'Too Many Requests: Over Quota!'}).serialize());
	} else {
		if ( req.user.id !== undefined ) {
			var snippet_id = uuid.v4();
			var new_snippet = {
				id:			snippet_id,
				user_id:	req.user.id,
				name: 		req.body.name!==undefined?req.body.name:'unamed',
				type:		req.body.type!==undefined?req.body.type:'',
				icon:  		req.body.icon!==undefined?req.body.icon:'',
				color:  	req.body.color!==undefined?req.body.color:'',
				flows:		req.body.flows!==undefined?req.body.flows:new Array(),
			};
			events.add('t6Api', 'snippet add', new_snippet.id);
			snippets.insert(new_snippet);
			//console.log(snippets);
			
			res.header('Location', '/v'+version+'/snippets/'+new_snippet.id);
			res.status(201).send({ 'code': 201, message: 'Created', flow: new SnippetSerializer(new_snippet).serialize() });
		}
	}
});

/**
 * @api {put} /snippets/:snippet_id Edit a Snippet
 * @apiName Edit a Snippet
 * @apiGroup 4. Snippet
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Snippet Name
 * @apiParam {String} [type] Snippet Type
 * @apiParam {String} [icon] Snippet Icon
 * @apiParam {String} [color] Snippet Color
 * @apiParam {String[]} [flows] List of Flow Ids
 * 
 * @apiUse 200
 * @apiUse 400
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.put('/:snippet_id([0-9a-z\-]+)', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var snippet_id = req.params.snippet_id;
	if ( snippet_id ) {
		snippets	= dbSnippets.getCollection('snippets');
		var query = {
				'$and': [
						{ 'id': snippet_id },
						{ 'user_id': req.user.id },
					]
				}
		var snippet = snippets.findOne( query );
		if ( snippet ) {
			var result;
			snippets.findAndUpdate(
				function(i){return i.id==snippet_id},
				function(item){
					item.name		= req.body.name!==undefined?req.body.name:item.name;
					item.type		= req.body.type!==undefined?req.body.type:item.type;
					item.icon		= req.body.icon!==undefined?req.body.icon:item.icon;
					item.color		= req.body.color!==undefined?req.body.color:item.color;
					item.flows		= req.body.flows!==undefined?req.body.flows:item.flows;
					result = item;
				}
			);
			//console.log(snippets);
			if ( result !== undefined ) {
				dbSnippets.save();
				
				res.header('Location', '/v'+version+'/snippets/'+snippet_id);
				res.status(200).send({ 'code': 200, message: 'Successfully updated', snippet: new SnippetSerializer(result).serialize() });
			} else {
				res.status(404).send(new ErrorSerializer({'id': 40, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		} else {
			res.status(401).send(new ErrorSerializer({'id': 42, 'code': 401, 'message': 'Forbidden ??'}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({'id': 40.5, 'code': 404, 'message': 'Not Found'}).serialize());
	}
});

/**
 * @api {delete} /snippets/:snippet_id Delete a Snippet
 * @apiName Delete a Snippet
 * @apiGroup 4. Snippet
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} snippet_id Snippet Id
 */
router.delete('/:snippet_id([0-9a-z\-]+)', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var snippet_id = req.params.snippet_id;
	snippets	= dbSnippets.getCollection('snippets');
	var query = {
		'$and': [
			{ 'user_id' : req.user.id, }, // delete only snippet from current user
			{ 'id' : snippet_id, },
		],
	};
	var s = snippets.find(query);
	//console.log(s);
	if ( s.length > 0 ) {
		snippets.remove(s);
		dbSnippets.saveDatabase();
		res.status(200).send({ 'code': 200, message: 'Successfully deleted', removed_id: snippet_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({'id': 32, 'code': 404, 'message': 'Not Found'}).serialize());
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

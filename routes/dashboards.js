'use strict';
var express = require('express');
var router = express.Router();
var DashboardSerializer = require('../serializers/dashboard');
var ErrorSerializer = require('../serializers/error');
var dashboards;
var users;
var tokens;

/**
 * @api {get} /dashboards/:dashboard_id Get Dashboard(s)
 * @apiName Get Dashboard(s)
 * @apiGroup Dashboard
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [dashboard_id] Dashboard Id
 * @apiParam {String} [name] 
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get('/(:dashboard_id([0-9a-z\-]+))?', bearerAuthToken, function (req, res) {
	var dashboard_id = req.params.dashboard_id;
	var name = req.query.name;
	if ( req.token !== undefined ) {
		dashboards	= dbDashboards.getCollection('dashboards');
		var query;
		if ( dashboard_id !== undefined ) {
			query = {
			'$and': [
					{ 'user_id' : req.user.id },
					{ 'id' : dashboard_id },
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
		var json = dashboards.find(query);
		//console.log(query);
		if ( json.length > 0 ) {
			res.status(200).send(new DashboardSerializer(json).serialize());
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

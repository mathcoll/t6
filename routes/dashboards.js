'use strict';
var express = require('express');
var router = express.Router();
var DashboardSerializer = require('../serializers/dashboard');
var SnippetSerializer = require('../serializers/snippet');
var ErrorSerializer = require('../serializers/error');
var dashboards;
var users;
var snippets;
var tokens;

/**
 * @api {get} /dashboards/:dashboard_id Get Dashboard(s)
 * @apiName Get Dashboard(s)
 * @apiGroup 3. Dashboard
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
router.get('/?(:dashboard_id([0-9a-z\-]+))?', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var dashboard_id = req.params.dashboard_id;
	var name = req.query.name;
	var size = req.query.size!==undefined?req.query.size:20;
	var page = req.query.page!==undefined?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	dashboards	= dbDashboards.getCollection('dashboards');
	snippets = dbSnippets.getCollection('snippets'); // WTF ??
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
	var json = dashboards.chain().find(query).offset(offset).limit(size).data();
	//console.log(query);

	var total = dashboards.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	json = json.length>0?json:[];
	res.status(200).send(new DashboardSerializer(json).serialize());
});

/**
 * @api {post} /dashboards Create New Dashboard
 * @apiName Create New Dashboard
 * @apiGroup 3. Dashboard
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Dashboard Name
 * @apiParam {String} [description] Dashboard Description
 * @apiParam {String[]} [snippets] List of Snippets Ids
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post('/', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	dashboards	= dbDashboards.getCollection('dashboards');
	/* Check for quota limitation */
	var queryQ = { 'user_id' : req.user.id };
	var i = (dashboards.find(queryQ)).length;
	if( i >= (quota[req.user.role]).dashboards ) {
		res.status(429).send(new ErrorSerializer({'id': 129, 'code': 429, 'message': 'Too Many Requests: Over Quota!'}).serialize());
	} else {
		if ( req.user.id !== undefined ) {
			var dashboard_id = uuid.v4();
			var new_dashboard = {
				id:			dashboard_id,
				user_id:	req.user.id,
				name: 		req.body.name!==undefined?req.body.name:'unamed',
				description:req.body.description!==undefined?req.body.description:'',
				snippets:	req.body.snippets!==undefined?req.body.snippets:new Array(),
			};
			events.add('t6Api', 'dashboard add', new_dashboard.id);
			dashboards.insert(new_dashboard);
			//console.log(dashboards);
			
			res.header('Location', '/v'+version+'/dashboards/'+new_dashboard.id);
			res.status(201).send({ 'code': 201, message: 'Created', flow: new DashboardSerializer(new_dashboard).serialize() });
		}
	}
});

/**
 * @api {put} /dashboards/:dashboard_id Edit a Dashboard
 * @apiName Edit a Dashboard
 * @apiGroup 3. Dashboard
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} flow_id Dashboard Id
 * @apiParam {String} [name=unamed] Dashboard Name
 * @apiParam {String} [description] Dashboard Description
 * @apiParam {String[]} [snippets] List of Snippets Ids
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
router.put('/:dashboard_id([0-9a-z\-]+)', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var dashboard_id = req.params.dashboard_id;
	if ( dashboard_id ) {
		dashboards	= dbDashboards.getCollection('dashboards');
		var query = {
				'$and': [
						{ 'id': dashboard_id },
						{ 'user_id': req.user.id },
					]
				}
		var dashboard = dashboards.findOne( query );
		if ( dashboard ) {
			var result;
			dashboards.findAndUpdate(
				function(i){return i.id==dashboard_id},
				function(item){
					item.name		= req.body.name!==undefined?req.body.name:item.name;
					item.description= req.body.description!==undefined?req.body.description:item.description;
					item.snippets	= req.body.snippets!==undefined?req.body.snippets:item.snippets;
					result = item;
				}
			);
			//console.log(dashboards);
			if ( result !== undefined ) {
				dbDashboards.save();
				
				res.header('Location', '/v'+version+'/dashboards/'+dashboard_id);
				res.status(200).send({ 'code': 200, message: 'Successfully updated', flow: new DashboardSerializer(result).serialize() });
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
 * @api {delete} /dashboards/:dashboard_id Delete a Dashboard
 * @apiName Delete a Dashboard
 * @apiGroup 3. Dashboard
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} dashboard_id Dashboard Id
 */
router.delete('/:dashboard_id([0-9a-z\-]+)', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var dashboard_id = req.params.dashboard_id;
	dashboards	= dbDashboards.getCollection('dashboards');
	var query = {
		'$and': [
			{ 'user_id' : req.user.id, }, // delete only dashboard from current user
			{ 'id' : dashboard_id, },
		],
	};
	var d = dashboards.find(query);
	//console.log(d);
	if ( d.length > 0 ) {
		dashboards.remove(d);
		dbDashboards.saveDatabase();
		res.status(200).send({ 'code': 200, message: 'Successfully deleted', removed_id: dashboard_id }); // TODO: missing serializer
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

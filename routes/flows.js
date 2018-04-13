'use strict';
var express = require('express');
var router = express.Router();
var FlowSerializer = require('../serializers/flow');
var ErrorSerializer = require('../serializers/error');
var flows;
var users;
var tokens;
var datatypes;
var units;

/**
 * @api {get} /flows/:flow_id Get Flow(s)
 * @apiName Get Flow(s)
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [flow_id] Flow Id
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get('/:flow_id([0-9a-z\-]+)?', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var results = Array();
	var flow_id = req.params.flow_id;
	var size = req.query.size!==undefined?req.query.size:20;
	var page = req.query.page!==undefined?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	var name = req.query.name;
	if ( req.user !== undefined && req.user.id !== undefined ) {
		flows	= db.getCollection('flows');

		var query;
		if ( flow_id !== undefined ) {
			query = {
			'$and': [
					{ 'id': flow_id },
					{ 'user_id': req.user.id },
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
				query = { 'user_id' : req.user.id };
			}
		}
		var flow = flows.chain().find(query).offset(offset).limit(size).data();
		
		var total = flows.find(query).length;
		flow.size = size;
		flow.pageSelf = page;
		flow.pageFirst = 1;
		flow.pagePrev = flow.pageSelf>flow.pageFirst?Math.ceil(flow.pageSelf)-1:flow.pageFirst;
		flow.pageLast = Math.ceil(total/size);
		flow.pageNext = flow.pageSelf<flow.pageLast?Math.ceil(flow.pageSelf)+1:undefined;
		
		console.log('flow', flow);
		
		res.status(200).send(new FlowSerializer(flow).serialize());
	} else {
		res.status(401).send(new ErrorSerializer({'id': 37, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
});

/**
 * @api {post} /flows Create New Flow
 * @apiName Create New Flow
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {String} [name=unamed] Flow Name
 * @apiParam {String} [data_type] Flow Data Type, this parameter is really important and will define the Value cast in datastore
 * @apiParam {String} [unit] Flow Unit
 * @apiParam {String} [theme] Flow theme, deprecated
 * @apiParam {String} [mqtt_topic]] Mqtt topic
 * @apiParam {Object[]} permission
 * @apiParam {String[]} [objects] List of Object Ids
 * 
 * @apiUse 201
 * @apiUse 400
 * @apiUse 429
 */
router.post('/', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	flows	= db.getCollection('flows');
	/* Check for quota limitation */
	var queryQ = { 'user_id' : req.user.id };
	var i = (flows.find(queryQ)).length;
	if( i >= (quota[req.user.role]).flows ) {
		res.status(429).send(new ErrorSerializer({'id': 129, 'code': 429, 'message': 'Too Many Requests: Over Quota!'}).serialize());
	} else {
		if ( req.user.id !== undefined ) {
			var permission = req.body.permission!==undefined?req.body.permission:'600'; //TODO: default to Owner: Read+Write
			if ( permission < 600 ) {
				res.status(400).send(new ErrorSerializer({'id': 38, 'code': 400, 'message': 'Bad Request', details: 'Permission must be greater than 600!'}).serialize());
			} else {
				var flow_id = uuid.v4();
				var new_flow = {
					id:			flow_id,
					user_id:	req.user.id,
					name: 		req.body.name!==undefined?req.body.name:'unamed',
					data_type:	req.body.data_type!==undefined?req.body.data_type:'',
					unit:  		req.body.unit!==undefined?req.body.unit:'',
					theme:  	req.body.theme!==undefined?req.body.theme:'',
					mqtt_topic:	req.body.mqtt_topic!==undefined?req.body.mqtt_topic:'',
					permission:	permission,
					objects:	req.body.objects!==undefined?req.body.objects:new Array(),
				};
				events.add('t6Api', 'flow add', new_flow.id);
				flows.insert(new_flow);
				//console.log(flows);
				
				res.header('Location', '/v'+version+'/flows/'+new_flow.id);
				res.status(201).send({ 'code': 201, message: 'Created', flow: new FlowSerializer(new_flow).serialize() }); // TODO: missing serializer
			}
		}
	}
});

/**
 * @api {put} /flows/:flow_id Edit a Flow
 * @apiName Edit a Flow
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} flow_id Flow Id
 * @apiParam {String} [name] Flow Name
 * @apiParam {String} [data_type] Flow Data Type, this parameter is really important and will define the Value cast in datastore
 * @apiParam {String} [unit] Flow Unit
 * @apiParam {String} [theme]] Flow theme, deprecated
 * @apiParam {String} [mqtt_topic]] Mqtt topic
 * @apiParam {Object[]} [permission]
 * @apiParam {String[]} [objects] List of Object Ids
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
router.put('/:flow_id([0-9a-z\-]+)', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var flow_id = req.params.flow_id;
	if ( flow_id ) {
		var permission = req.body.permission!==undefined?req.body.permission:undefined;
		if ( permission < 600 ) {
			res.status(400).send(new ErrorSerializer({'id': 39, 'code': 400, 'message': 'Bad Request', 'details': 'Permission must be greater than 600!'}).serialize());
		} else {
			flows	= db.getCollection('flows');
			var query = {
					'$and': [
							{ 'id': flow_id },
							{ 'user_id': req.user.id },
						]
					}
			var flow = flows.findOne( query );
			if ( flow ) {
				var result;
				flows.findAndUpdate(
					function(i){return i.id==flow_id},
					function(item){
						item.name		= req.body.name!==undefined?req.body.name:item.name;
						item.unit		= req.body.unit!==undefined?req.body.unit:item.unit;
						item.data_type	= req.body.data_type!==undefined?req.body.data_type:item.data_type;
						item.permission	= permission!==undefined?permission:item.permission;
						item.objects	= req.body.objects!==undefined?req.body.objects:item.objects;
						item.mqtt_topic	= req.body.mqtt_topic!==undefined?req.body.mqtt_topic:item.mqtt_topic;
						result = item;
					}
				);
				//console.log(flows);
				if ( result !== undefined ) {
					db.save();
					
					res.header('Location', '/v'+version+'/flows/'+flow_id);
					res.status(200).send({ 'code': 200, message: 'Successfully updated', flow: new FlowSerializer(result).serialize() }); // TODO: missing serializer
				} else {
					res.status(404).send(new ErrorSerializer({'id': 40, 'code': 404, 'message': 'Not Found'}).serialize());
				}
			} else {
				res.status(401).send(new ErrorSerializer({'id': 42, 'code': 401, 'message': 'Forbidden ??'}).serialize());
			}
		}
	} else {
		res.status(404).send(new ErrorSerializer({'id': 40.5, 'code': 404, 'message': 'Not Found'}).serialize());
	}
});

/**
 * @api {delete} /flows/:flow_id Delete a Flow
 * @apiName Delete a Flow
 * @apiGroup 2. Flow
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} flow_id Flow Id
 */
router.delete('/:flow_id([0-9a-z\-]+)', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	// TODO
	// TODO: delete all data related to that flow?
	var flow_id = req.params.flow_id;
	flows	= db.getCollection('flows');
	var query = {
		'$and': [
			{ 'user_id' : req.user.id, }, // delete only flow from current user
			{ 'id' : flow_id, },
		],
	};
	var f = flows.find(query);
	//console.log(f);
	if ( f.length > 0 ) {
		flows.remove(f);
		db.saveDatabase();
		res.status(200).send({ 'code': 200, message: 'Successfully deleted', removed_id: flow_id }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({'id': 43, 'code': 404, 'message': 'Not Found'}).serialize());
	}
});

module.exports = router;

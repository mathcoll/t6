'use strict';
var express = require('express');
var router = express.Router();
var FlowSerializer = require('../serializers/flow');
var flows = dbFlows.getData("/flows");
var users = dbUsers.getData("/users");

router.get('/', bearerAuth, function (req, res) {
	dbFlows.reload(); // BUG: it looks this is not reloaded
	if ( req.user ) {
		var results = Array();
		
		req.user.permissions.map(function(permission){
			//console.log(permission.flow_id + ' ' +permission.perm);
			if ( permission.perm == 'r' || permission.perm == 'rw' ) {
				// todo: push to array the flows item correspondng to 'flow_id'
				var flow = flows.filter(function(item) {
					return (permission.flow_id == item.id);
				})[0];
				if ( flow !== undefined ) {
					results.push({ id: flow.id, name: flow.name, user_id: flow.user_id, unit_id: flow.unit_id, unit: flow.unit, datatype: flow.datatype, objects: flow.objects, perm: permission.perm });
				}
			}
		});
		
		var json = new FlowSerializer(results).serialize();
		res.send(json);
	} else {
		res.send({ 'code': 401, 'error': 'Not Authorized' }, 401);
	}
});

router.get('/:flow_id([0-9a-z\-]+)', bearerAuth, function (req, res) {
	var flow_id = req.params.flow_id;
	dbFlows.reload(); // BUG: it looks this is not reloaded
	if ( req.user ) {
		var results = Array();
		
		req.user.permissions.map(function(permission){
			//console.log(permission.flow_id + ' ' +permission.perm);
			if ( permission.perm == 'r' || permission.perm == 'rw' ) {
				// todo: push to array the flows item correspondng to 'flow_id'
				var flow = flows.filter(function(item) {
					return (permission.flow_id == item.id && item.id == flow_id);
				})[0];
				if ( flow !== undefined ) {
					results.push({ id: flow.id, name: flow.name, user_id: flow.user_id, unit_id: flow.unit_id, unit: flow.unit, datatype: flow.datatype, objects: flow.objects, perm: permission.perm });
				}
			}
		});
		
		var json = new FlowSerializer(results).serialize();
		res.send(json);
	} else {
		res.send({ 'code': 401, 'error': 'Not Authorized' }, 401);
	}
});

router.post('/', bearerAuth, function (req, res) {
	dbFlows.reload();
	var flow_id = uuid.v4();
	var new_flow = {
		id:			flow_id,
		name: 	req.body.name!==undefined?req.body.name:'unamed',
		unit:  		req.body.unit!==undefined?req.body.unit:'',
		objects:	req.body.objects!==undefined?req.body.objects:new Array(),
	};
	flows.push(new_flow);
	// Add permissions to current user
	(req.user.permissions).push({"flow_id":flow_id,"perm":req.body.permission!==undefined?req.body.permission:'rw'});
	// TODO
	users.map(function(u) {
		if ( req.user.id == u.id ) {
			u.permissions = req.user.permissions;
		};
	});
	//console.log(users);
	dbUsers.push("/users", users);
	
	//console.log(flows);
	dbFlows.push("/flows", flows);
	res.send({ 'code': 201, message: 'Created', flow: new_flow }, 201);
});

router.put('/:flow_id([0-9a-z\-]+)', function (req, res) {
	//todo
	var flow_id = req.params.flow_id;
	dbFlows.reload();
	//console.log(flows);
	var result = flows.filter(function(item) {
		if ( item.id == flow_id ) {
			item.name 		= req.body.name!==undefined?req.body.name:item.name;
			item.unit 		= req.body.unit!==undefined?req.body.unit:item.unit;
			item.objects 	= req.body.objects!==undefined?req.body.objects:item.objects;
	    	return true;
	    }
	})[0];
	// TODO: handle permission into users DB
	
	//console.log(flows);
	dbFlows.push("/flows", flows);
	res.send({ 'code': 200, message: 'Successfully updated', flow: result }, 200);
});

router.delete('/:flow_id([0-9a-z\-]+)', function (req, res) {
	//todo
	var flow_id = req.params.flow_id;
	dbFlows.reload();
	var removeIndex = flows.map(function(item) { return item.id; }).indexOf(flow_id);
	if (removeIndex > -1 && flows.splice(removeIndex, 1) ) {
		var removed_id = flow_id;
		//console.log(flows);
		dbFlows.push("/flows", flows);
		res.send({ 'code': 200, message: 'Successfully deleted', removed_id: removed_id }, 200);
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
	}	
});

function bearerAuth(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers['authorization'];
    if ( typeof bearerHeader !== 'undefined' ) {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        
			req.user = users.filter(function(u) {
        		//console.log(req.token+' != '+u.token);
			   return u.token == req.token;
			})[0];
        next();
    } else {
        res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
    }
}

module.exports = router;

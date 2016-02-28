'use strict';
var express = require('express');
var router = express.Router();
var FlowSerializer = require('../serializers/flow');
var flows = dbFlows.getData("/flows");

router.get('/', function (req, res) {
	dbFlows.reload();
	var json = new FlowSerializer(flows).serialize();
	res.send(json);
});

router.get('/:flow_id([0-9a-z\-]+)', function (req, res) {
	dbFlows.reload();
	var flow_id = req.params.flow_id;
	
	var result = flows.filter(function(item) {
	    return item.id == flow_id;
	})[0];
	if ( result !== undefined ) {
		var json = new FlowSerializer(result).serialize();
		res.send(json);
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
	}
});

router.post('/', function (req, res) {
	//todo
	dbFlows.reload();
	var new_flow = {
		id: uuid.v4(),
		name:  req.body.name!==undefined?req.body.name:item.name,
		unit:  req.body.unit!==undefined?req.body.unit:item.unit,
		objects:  req.body.objects!==undefined?req.body.objects:item.objects,
	};
	flows.push(new_flow);
	//console.log(units);
	dbFlows.push("/flows", flows);
	res.send({ 'code': 201, message: 'Created', unit: new_flow }, 201);
});

router.put('/:flow_id([0-9a-z\-]+)', function (req, res) {
	//todo
	var flow_id = req.params.flow_id;
	dbFlows.reload();
	//console.log(datatypes);
	var result = flows.filter(function(item) {
		if ( item.id == flow_id ) {
			item.name = req.body.name!==undefined?req.body.name:item.name;
			item.unit = req.body.unit!==undefined?req.body.unit:item.unit;
			item.objects = req.body.objects!==undefined?req.body.objects:item.objects;
	    	return true;
	    }
	})[0];
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

module.exports = router;

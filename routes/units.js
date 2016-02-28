'use strict';
var express = require('express');
var router = express.Router();
var UnitSerializer = require('../serializers/unit');
var units = dbUnits.getData("/units");

router.get('/', function (req, res) {
	var type = req.query.type;
	dbUnits.reload();
	console.log(req.query);
	if ( type === undefined ) {
		var json = new UnitSerializer(units).serialize();
		res.send(json);
	} else {
		var id = units.map(function(item) { return item.type; }).indexOf(type);
		if ( id > -1 ) {
			var json = new UnitSerializer(id).serialize();
			res.send(json);
		}
	}
});

router.get('/:unit_id([0-9a-z\-]+)', function (req, res) {
	dbUnits.reload();
	var unit_id = req.params.unit_id;
	
	var result = units.filter(function(item) {
	    return item.id == unit_id;
	})[0];
	if ( result !== undefined ) {
		var json = new UnitSerializer(result).serialize();
		res.send(json);
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
	}
});

router.post('/', function (req, res) {
	// only for admins
	dbUnits.reload();
	console.log(units);
	var new_unit = {
		id: uuid.v4(),
		name:  req.body.name!==undefined?req.body.name:item.name,
		format:  req.body.format!==undefined?req.body.format:item.format,
		type:  req.body.type!==undefined?req.body.type:item.type,
	};
	units.push(new_unit);
	//console.log(units);
	dbUnits.push("/units", units);
	res.send({ 'code': 201, message: 'Created', unit: new_unit }, 201);
});

router.put('/:unit_id([0-9a-z\-]+)', function (req, res) {
	// only for admins
	var unit_id = req.params.unit_id;
	dbUnits.reload();
	//console.log(datatypes);
	var result = units.filter(function(item) {
		if ( item.id == unit_id ) {
			item.name = req.body.name!==undefined?req.body.name:item.name;
			item.format = req.body.format!==undefined?req.body.format:item.format;
			item.type = req.body.type!==undefined?req.body.type:item.type;
	    	return true;
	    }
	})[0];
	//console.log(units);
	dbUnits.push("/units", units);
	res.send({ 'code': 200, message: 'Successfully updated', unit: result }, 200);
});

router.delete('/:unit_id([0-9a-z\-]+)', function (req, res) {
	// only for admins
	var unit_id = req.params.unit_id;
	dbUnits.reload();
	var removeIndex = units.map(function(item) { return item.id; }).indexOf(unit_id);
	if (removeIndex > -1 && units.splice(removeIndex, 1) ) {
		var removed_id = unit_id;
		//console.log(units);
		dbUnits.push("/units", units);
		res.send({ 'code': 200, message: 'Successfully deleted', removed_id: removed_id }, 200);
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
	}
});

module.exports = router;

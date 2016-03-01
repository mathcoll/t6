'use strict';
var express = require('express');
var router = express.Router();
var DataTypeSerializer = require('../serializers/datatype');
var datatypes = dbDatatypes.getData("/datatypes");
//var users = dbUsers.getData("/users");

router.get('/', function (req, res) {
	dbDatatypes.reload();
	var json = new DataTypeSerializer(datatypes).serialize();
	res.send(json);
});

router.post('/', function (req, res) {
	// only for admins
	dbDatatypes.reload();
	console.log(datatypes);
	var new_datatype = {
		id: uuid.v4(),
		name:  req.body.name!==undefined?req.body.name:item.name,
	};
	datatypes.push(new_datatype);
	//console.log(datatypes);
	dbDatatypes.push("/datatypes", datatypes);
	res.send({ 'code': 201, message: 'Created', datatype: new_datatype }, 201);
});

router.put('/:datatype_id([0-9a-z\-]+)', function (req, res) {
	// only for admins
	var datatype_id = req.params.datatype_id;
	dbDatatypes.reload();
	//console.log(datatypes);
	var result = datatypes.filter(function(item) {
		if ( item.id == datatype_id ) {
			item.name = req.body.name!==undefined?req.body.name:item.name;
	    	return true;
	    }
	})[0];
	//console.log(datatypes);
	dbDatatypes.push("/datatypes", datatypes);
	res.send({ 'code': 200, message: 'Successfully updated', datatype: result }, 200);
});

router.delete('/:datatype_id([0-9a-z\-]+)', function (req, res) {
	// only for admins
	var datatype_id = req.params.datatype_id;
	dbDatatypes.reload();
	var removeIndex = datatypes.map(function(item) { return item.id; }).indexOf(datatype_id);
	if (removeIndex > -1 && datatypes.splice(removeIndex, 1) ) {
		var removed_id = datatype_id;
		//console.log(datatypes);
		dbDatatypes.push("/datatypes", datatypes);
		res.send({ 'code': 200, message: 'Successfully deleted', removed_id: removed_id }, 200);
	} else {
		res.send({ 'code': 404, message: 'Not Found' }, 404);
	}
});

module.exports = router;

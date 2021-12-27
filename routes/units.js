"use strict";
var express = require("express");
var router = express.Router();
var UnitSerializer = require("../serializers/unit");
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /units/:unit_id Get Units
 * @apiName Get Units
 * @apiDescription t6 implement a immutable unit list as referential.
 * @apiGroup 0. General
 * @apiVersion 2.0.1
 * 
 * @apiParam {uuid-v4} [unit_id] Unit ID
 * @apiParam {String="Work" "Energy (E)" "Power" "Radiant Flux (P)" "Electric Charge (Q)" "Voltage, Electrical (U)" "Electrical Conductance (S)" "Electrical Capacitance (F)" "Magnetic Flux (Wb)" "Electrical Inductance (H)" "Illuminance (E)" "Torque (M)" "Time (t)" "Current (I)" "Area" "Length" "Power (P)" "Luminance (L)" "Luminous Intensity (l)" "Température" "Temperature (T)" "Volume" "Volume (V)" "Other" "Sound" "Frequency (f)" "Pressure, Stress" "Force, Weight (F)"} [type] Unit Type
 * 
 * @apiUse 200
 * @apiUse 404
 */
router.get("/(:unit_id([0-9a-z\-]+))?", function (req, res) {
	var json;
	var unit_id = req.params.unit_id;
	var type = req.query.type;
	if ( typeof type === "undefined" ) {
		if ( typeof unit_id === "undefined" ) {
			json = units.find();
		} else {
			json = units.find({ "id": unit_id });
		}
	} else {
		json = units.find({"type": { "$eq": type }});
	}

	json = json.length>0?json:[];
	res.status(200).send(new UnitSerializer(json).serialize());
});

/**
 * @api {post} /units Add a Unit
 * @apiName Add a Unit
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiBody {String} [name=unamed] Unit Name
 * @apiBody {String} [format=""] Unit Format
 * @apiBody {String="Work" "Energy (E)" "Power" "Radiant Flux (P)" "Electric Charge (Q)" "Voltage, Electrical (U)" "Electrical Conductance (S)" "Electrical Capacitance (F)" "Magnetic Flux (Wb)" "Electrical Inductance (H)" "Illuminance (E)" "Torque (M)" "Time (t)" "Current (I)" "Area" "Length" "Power (P)" "Luminance (L)" "Luminous Intensity (l)" "Température" "Temperature (T)" "Volume" "Volume (V)" "Other" "Sound" "Frequency (f)" "Pressure, Stress" "Force, Weight (F)"} [type] Unit Type
 * @apiBody {String} [system=""] System
 * @apiBody {String{1024}} [description=""] Description
 * 
 * @apiUse 201
 * @apiUse 401
 */
router.post("/", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		var new_unit = {
			id: uuid.v4(),
			name:	typeof req.body.name!=="undefined"?req.body.name:"unamed",
			format:	typeof req.body.format!=="undefined"?req.body.format:"",
			type:	typeof req.body.type!=="undefined"?req.body.type:"",
			system:	typeof req.body.system!=="undefined"?req.body.system:"",
			description:typeof req.body.description!=="undefined"?(req.body.description).substring(0, 1024):"",
		};
		units.insert(new_unit);

		t6events.addAudit("t6App", "AuthAdmin: {post} /units", "", "", {"status": "200", error_id: "00003"});
		res.header("Location", "/v"+version+"/units/"+new_unit.id);
		res.status(201).send({ "code": 201, message: "Created", unit: new UnitSerializer(new_unit).serialize() }, 201);
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /units", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 16052, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {put} /units/:unit_id Edit a Unit
 * @apiName Edit a Unit
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiParam {uuid-v4} unit_id Unit ID
 * @apiBody {String} [name] Unit Name
 * @apiBody {String="Work" "Energy (E)" "Power" "Radiant Flux (P)" "Electric Charge (Q)" "Voltage, Electrical (U)" "Electrical Conductance (S)" "Electrical Capacitance (F)" "Magnetic Flux (Wb)" "Electrical Inductance (H)" "Illuminance (E)" "Torque (M)" "Time (t)" "Current (I)" "Area" "Length" "Power (P)" "Luminance (L)" "Luminous Intensity (l)" "Température" "Temperature (T)" "Volume" "Volume (V)" "Other" "Sound" "Frequency (f)" "Pressure, Stress" "Force, Weight (F)"} [type] Unit Type
 * @apiBody {String} [format] Unit Format
 * @apiBody {String} [system=""] System
 * @apiBody {String{1024}} [description=""] Description
 * 
 * @apiUse 200
 * @apiUse 401
 */
router.put("/:unit_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		var unit_id = req.params.unit_id;
		var result;
		units.findAndUpdate(
			function(i){return i.id===unit_id;},
			function(item){
				item.name			= typeof req.body.name!=="undefined"?req.body.name:item.name;
				item.format			= typeof req.body.format!=="undefined"?req.body.format:item.format;
				item.type			= typeof req.body.type!=="undefined"?req.body.type:item.type;
				item.system			= typeof req.body.system!=="undefined"?req.body.system:"";
				item.description	= typeof req.body.description!=="undefined"?(req.body.description).substring(0, 1024):"";
				item.meta.revision	= typeof item.meta.revision==="number"?(item.meta.revision):1;
				result = item;
			}
		);
		db_units.save();

		t6events.addAudit("t6App", "AuthAdmin: {put} /units/:unit_id", "", "", {"status": "200", error_id: "00003"});
		res.header("Location", "/v"+version+"/units/"+unit_id);
		res.status(200).send({ "code": 200, message: "Successfully updated", unit: new UnitSerializer(result).serialize() });
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {put} /units/:unit_id", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 16052, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

/**
 * @api {delete} /units/:unit_id Delete a Unit
 * @apiName Delete a Unit
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiParam {uuid-v4} unit_id Unit Id to be deleted
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.delete("/:unit_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		var unit_id = req.params.unit_id;
		var u = units.find({"id": { "$eq": unit_id }});
		if (u) {
			units.remove(u);
			db_units.save();
			t6events.addAudit("t6App", "AuthAdmin: {delete} /units/:unit_id", "", "", {"status": "200", error_id: "00003"});
			res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: unit_id }); // TODO: missing serializer
		} else {
			t6events.addAudit("t6App", "AuthAdmin: {delete} /units/:unit_id", "", "", {"status": "400", error_id: "00004"});
			res.status(404).send(new ErrorSerializer({"id": 16271, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {delete} /units/:unit_id", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 16052, "code": 401, "message": "Unauthorized"}).serialize());
	}
});

module.exports = router;

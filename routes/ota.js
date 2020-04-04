"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");
var sources;
var objects;

router.post("/(:source_id([0-9a-z\-]+))?/deploy", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var source_id = req.params.source_id;
	// find all objects linked to this source
	objects	= db.getCollection("objects");
	var query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "source_id" : source_id },
			]
		};
	var json = objects.find(query);
	if ( json.length > 0 ) {
		json.map(function(o) {

			// This is a temporary solution...
			// only on ipv4
			// only on esp8266.esp8266.nodemcu
			// only on default port 8266
			let exec = require("child_process").exec;
			let dir = `${ota.build_dir}/${o.source_id}`;
			let cmd = `${ota.python3} ${ota.espota_py} -i ${o.ipv4} -p 8266 --auth= -f ${dir}/${o.source_id}.esp8266.esp8266.nodemcu.bin`;
			
			t6console.log("Deploying");
			let myShellScript = exec(`${cmd}`);
			myShellScript.stdout.on("data", (data)=>{
				//t6console.log(data); 
			});
			myShellScript.stderr.on("data", (data)=>{
				t6console.error(data);
			});
			
		});
		res.status(201).send({ "code": 201, message: "Deploying", deploying_to_objects: json });
	} else {
		res.status(404).send(new ErrorSerializer({"id": 900, "code": 404, "message": "Not Found"}).serialize());
	}
});

module.exports = router;

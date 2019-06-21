"use strict";
var express = require("express");
var router = express.Router();

function getUuid() {
	return uuid.v4();
}
function getTs() {
	return moment().format("X");
}
function getDate() {
	return moment().format("MMMM Do YYYY, H:mm:ss");
}
function getIsoDate() {
	return moment().toISOString();
}
function getDataItem(delay) {
	let dataItem = {
		"meta": {
			"id": getUuid(),
			"timestamp": getTs()-3600*delay
		},
		"user_id": getUuid(),
		"environment": process.env.NODE_ENV,
		"dtepoch": getTs(),
		"value": getUuid(),
		"flow": getUuid(),
		"datetime": getIsoDate()
	};
	return dataItem;
}

let result = {
	data: {
		samples: {
			triggers: {
				eventTrigger: {
					user_id: getUuid(),
					environment: process.env.NODE_ENV,
					dtepoch: getTs(),
					value: getUuid(),
					flow: getUuid(),
					datetime: getIsoDate()
				}
			}
		}
	}
};
router.get("/v1/status", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	if ( ChannelKey == ServiceKey && ChannelKey === ifttt.serviceKey ) {
		res.status(200).send(result);
	} else {
		res.status(401).send({ "errors": {"message": ["Not Authorized"]} });
	}
});

router.post("/v1/test/setup", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	if ( ChannelKey == ServiceKey && ChannelKey === ifttt.serviceKey ) {
		res.status(200).send(result);
	} else {
		res.status(401).send({ "errors": {"message": ["Not Authorized"]} });
	}
});

router.post("/v1/triggers/eventTrigger", function (req, res) {
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	
	let resultT = {
		data:[],
		eventTrigger: result.data.samples.triggers.eventTrigger
	};
	let limit = parseInt(req.body.limit, 10);
	if (!limit && limit !== 0) { limit = 3; }
	if (limit==0) { limit = 0; }
	if (limit>10) { limit = 3; }
	for (let i=0; i<limit; i++) {
		(resultT.data).push(getDataItem(i));
	}
	if ( ChannelKey == ServiceKey && ChannelKey === ifttt.serviceKey ) {
		if ( req.body.triggerFields && typeof req.body.triggerFields.user_id !== "undefined" ) {
			res.status(200).send(resultT);
		} else {
			res.status(400).send({ "errors": [ {"status": "SKIP", "message": "missing Trigger Fields/key"} ] });
		}
	} else {
		res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
	}
});

router.delete("/v1/triggers/eventTrigger/trigger_identity/:trigger_identity([0-9a-z\-]+)", function (req, res) {
	console.log(req.params.trigger_identity);
	res.status(400).send({ "errors": [ {"status": "SKIP", "message": "Not Authorized"} ] });
});

module.exports = router;
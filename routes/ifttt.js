"use strict";
var express = require("express");
var router = express.Router();
let SCOPE_DESCRIPTIONS = {
	"ifttt": "Event when Datapoint is posted to t6.",
	"email": "User email.",
	"ghome": "."
};

function getUuid() {
	return uuid.v4();
}
function getTs() {
	return moment().format("x");
}
function getDate() {
	return moment().format("MMMM Do YYYY, H:mm:ss");
}
function getIsoDate() {
	return moment().toISOString();
}
function getDataItem(delay, userId) {
	let user_id = typeof userId!=="undefined"?userId:getUuid();
	let dataItem = {
		"meta": {
			"id": getTs()-3600*delay,
			"timestamp": parseInt(moment((getTs()-3600*delay)/1000).format("x"), 10)
		},
		"user_id": user_id,
		"environment": process.env.NODE_ENV,
		"dtepoch": getTs(),
		"value": "Fake data "+getUuid(),
		"flow": getUuid(),
		"datetime": getIsoDate()
	};
	return dataItem;
}
let result = {
	data: {
		accessToken: "b29a71b4c58c22af116578a6be6402d2",
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
let resultUser = {
	data: {
		"name": "John Doe",
		"id": getUuid(),
		"url": "http://example.com/users/"+getUuid()
	}
};

router.get("/v1/status", function (req, res) {
	let cfg = oauth2.find(({ name }) => name === "ifttt").config;
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	if ( ChannelKey === ServiceKey && ChannelKey === cfg.serviceKey ) {
		res.status(200).send(result);
	} else {
		res.status(401).send({ "errors": [{"message": "Not Authorized"}] });
	}
});

router.get("/OAuth2/destroy-session", function (req, res) {
	req.session.destroy(function(err) {
		res.render("login", {});
	});
});

router.get("/v1/user/info", function (req, res) {
	let authorization = req.headers["authorization"];
	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( bearer === result.data.accessToken ) {
		res.status(200).send(resultUser);
	} else {
		jsonwebtoken.verify(bearer, jwtsettings.secret, function(err, decoded) {
			if ( !err && decoded ) {
				res.status(200).send({
					data: {
						"name": decoded.firstName+" "+decoded.lastName,
						"id": decoded.id,
						"url": "https://en.gravatar.com/" + decoded.mail_hash + ".json"
					}
				});
			} else {
				res.status(401).send({ "errors": [{"message": "Not Authorized"}] });
			}
		});
	}
});

router.post("/v1/test/setup", function (req, res) {
	let cfg = oauth2.find(({ name }) => name === "ifttt").config;
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	if ( ChannelKey == ServiceKey && ChannelKey === cfg.serviceKey ) {
		res.status(200).send(result);
	} else {
		res.status(401).send({ "errors": [{"message": "Not Authorized"}] });
	}
});

router.post("/v1/triggers/eventTrigger", function (req, res) {
	let cfg = oauth2.find(({ name }) => name === "ifttt").config;
	let ChannelKey = req.headers["ifttt-channel-key"];
	let ServiceKey = req.headers["ifttt-service-key"];
	let authorization = req.headers["authorization"];
	let retention = typeof req.body?.triggerFields?.retention!=="undefined"?req.body.triggerFields.retention:"autogen";
	let limit = typeof req.body.limit!=="undefined"?parseInt(req.body.limit, 10):50;
	let flow_id = req.body?.triggerFields?.flow;
	let where = "";
	let group_by = "";
	let sorting = "DESC";
	let page = 1;

	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( (bearer && bearer === result.data.accessToken) || (ChannelKey === ServiceKey && ChannelKey === cfg.serviceKey) ) {
		t6console.debug("Use case 1");
		let resultT = {
			data:[],
			eventTrigger: result.data.samples.triggers.eventTrigger
		};

		if ( req.body.triggerFields && typeof req.body.triggerFields.user_id !== "undefined" ) {
			//t6console.log("resultT" + resultT);
			let limit = parseInt(req.body.limit, 10);
			if (!limit && limit !== 0) { limit = 3; }
			if (limit===0) { limit = 0; }
			if (limit>10) { limit = 3; }
			for (let i=0; i<limit; i++) {
				(resultT.data).push(getDataItem(i, req.body.triggerFields.user_id));
			}
			resultT.eventTrigger.user_id = req.body.triggerFields.user_id;
			res.status(200).send(resultT);
		} else {
			res.status(400).send({ "errors": [ {"status": "SKIP", "message": "missing Trigger Fields/key"} ] });
		}

	} else if(bearer && flow_id) {
		t6console.debug("Use case 2");
		jsonwebtoken.verify(bearer, jwtsettings.secret, function(err, decoded) {
			if( !err && decoded ) {
				let queryU = { "id": decoded.id };
				t6console.debug(queryU);
				let user = users.findOne(queryU);
				let eventTriggers = [];
				if (isNaN(limit)) {
					limit = 50;
				} else if (limit > 5000) {
					limit = 5000;
				} else if (limit < 1) {
					limit = 1;
				}
				/* Duplicate code for testing */
					let queryF = { "$and": [ { "id" : { "$aeq" : flow_id } }, { "user_id": user.id } ] };
					let flow = flows.chain().find(queryF).limit(1);
					let join = flow.eqJoin(units.chain(), "unit", "id");
					flow = typeof (flow.data())[0]!=="undefined"?(flow.data())[0].left:undefined;

					let flowDT = flows.chain().find({id: flow_id,}).limit(1);
					let joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
					let datatype = typeof (joinDT.data())[0]!=="undefined"?(joinDT.data())[0].right.name:null;
					let fields;
					fields = getFieldsFromDatatype(datatype, true, true);

					let rp = typeof retention!=="undefined"?retention:"autogen";
					if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
						if ( typeof flow!=="undefined" && flow.retention ) {
							if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
								rp = flow.retention;
							} else {
								rp = influxSettings.retentionPolicies.data[0];
								t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
								res.status(412).send(new ErrorSerializer({"id": 2057, "code": 412, "message": "Precondition Failed"}).serialize());
								return;
							}
						} else {
							rp = influxSettings.retentionPolicies.data[0];
							t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
						}
					}

					t6console.debug("Retention is valid:", rp);
					let query = `SELECT ${fields} FROM ${rp}.data WHERE flow_id='${flow_id}' ${where} ${group_by} ORDER BY time ${sorting} LIMIT ${limit} OFFSET ${(page-1)*limit}`;
					t6console.debug("Query to get latest results on Db:", query);

					dbInfluxDB.query(query).then((data) => {
						if ( data.length > 0 ) {
							data.map(function(d) {
								eventTriggers.push({
									user_id: user.id,
									environment: process.env.NODE_ENV,
									dtepoch: Date.parse(d.time),
									value: d.value,
									flow: flow_id,
									datetime: moment(d.time).toISOString(),
									meta: {
										"id": Date.parse(d.time),
										"timestamp": moment(d.time).format("x")/1000
									}
								});
							});
						}
						let resultSuccess = { "data": eventTriggers };
						t6console.debug("Requested:", JSON.stringify(req.body, null, 2));
						t6console.debug("Result:", JSON.stringify(resultSuccess, null, 2));
						res.status(200).send( resultSuccess );
					});
				/* Duplicate code for testing */
				user.iftttTrigger_identity = req.body.trigger_identity; // What for ?
			} else {
				res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
			}
		});
	} else {
		t6console.debug("Use case 3");
		res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
	}
});

router.delete("/v1/triggers/eventTrigger/trigger_identity/:trigger_identity([0-9a-z\-]+)", function (req, res) {
	let authorization = req.headers["authorization"];
	let bearer;
	if ( authorization ) {
		bearer = authorization.split(" ")[1];
	}
	if ( bearer && bearer === result.data.accessToken ) {
		res.status(201).send( {} ); // FAKE MODE
	} else {
		jsonwebtoken.verify(bearer, jwtsettings.secret, function(err, decoded) {
			if( !err && decoded ) {
				let queryU = { "$and": [
					{ "id": decoded.id }
				]};
				let user = users.findOne(queryU);
				user.iftttCode = null;
				user.iftttTrigger_identity = null;
				res.status(201).send({ "errors": [ ] });
			} else {
				res.status(401).send({ "errors": [ {"message": "Not Authorized"} ] });
			}
		});
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
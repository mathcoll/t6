"use strict";
var express = require("express");
var router = express.Router();
var DataSerializer = require("../serializers/data");
var ErrorSerializer = require("../serializers/error");
var users;
var tokens;
var flows;
var objects;
var datatypes;
var units;

function str2bool(v) {
	return ["yes", "true", "t", "1", "y", "yeah", "on", "yup", "certainly", "uh-huh"].indexOf(v)>-1?true:false;
}
function getJson(v) {
	try {
		return JSON.parse(v);
	} catch (e) {
		return v;
	}
}
function decryptPayload(encryptedPayload, sender, encoding) {
	if ( sender && sender.secret_key_crypt ) {
		var decryptedPayload;
		var key = Buffer.from(sender.secret_key_crypt, "hex");
		let textParts = encryptedPayload.split(":");
		let iv = Buffer.from(textParts.shift(), "hex");
		encryptedPayload = textParts.shift();

		let decipher = crypto.createDecipheriv(algorithm, key, iv);
		decipher.setAutoPadding(true);
		decryptedPayload = decipher.update(encryptedPayload, "base64", encoding || "utf8");// ascii, binary, base64, hex, utf8
		decryptedPayload += decipher.final(encoding || "utf8");

		//console.log("\nPayload decrypted:\n", decryptedPayload);
		return decryptedPayload!==""?decryptedPayload:false;
	} else {
		//console.log("decryptPayload", "Error: Missing secret_key_crypt");
		return false;
	}
}
function getFieldsFromDatatype(datatype, asValue) {
	let fields;
	if ( datatype === "boolean" ) {
		fields = "time, valueBoolean";
	} else if ( datatype === "date" ) {
		fields = "time, valueDate";
	} else if ( datatype === "integer" ) {
		fields = "time, valueInteger";
	} else if ( datatype === "json" ) {
		fields = "time, valueJson";
	} else if ( datatype === "string" ) {
		fields = "time, valueString";
	} else if ( datatype === "time" ) {
		fields = "time, valueTime";
	} else if ( datatype === "float" ) {
		fields = "time, valueFloat";
	} else if ( datatype === "geo" ) {
		fields = "time, valueString";
	} else {
		fields = "time, value";
	}
	if( asValue ) {
		fields += " as value";
	}
	return fields;
}

/**
 * @api {get} /data/:flow_id Get DataPoint(s)
 * @apiName Get DataPoint(s)
 * @apiGroup 0 DataPoint
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} flow_id Flow ID you want to get data from
 * @apiParam {uuid-v4} [flow_id] Datapoint ID
 * @apiParam {String} [sort=desc] Set to sorting order, the value can be either "asc" or ascending or "desc" for descending.
 * @apiParam {Number} [page] Page offset
 * @apiParam {Number{1-5000}} [limit] Set the number of expected resources.
 * @apiParam {String="min","max","first","last","sum","count"} [modifier] Modifier function to modify the results
 * @apiSuccess {Object[]} data DataPoint from the Flow
 * @apiSuccess {Object[]} data Data point Object
 * @apiSuccess {String} data.type Data point Type
 * @apiSuccess {Number} data.id Data point Identifier
 * @apiSuccess {Object[]} data.links
 * @apiSuccess {String} data.links.self Data point Url
 * @apiSuccess {Object[]} data.attributes Data point attributes
 * @apiSuccess {Number} data.attributes.time Time of Data point 
 * @apiSuccess {Number} data.attributes.timestamp Unix Timestamp of Data point 
 * @apiSuccess {String} data.attributes.value Value of Data point
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get("/:flow_id([0-9a-z\-]+)/?(:data_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var flow_id = req.params.flow_id;
	var data_id = req.params.data_id;
	var modifier = req.query.modifier;
	//var output = req.accepts("json"); svg
	var query;
	
	if ( !flow_id ) {
		res.status(405).send(new ErrorSerializer({"id": 56, "code": 405, "message": "Method Not Allowed"}).serialize());
	} else {
		flows = db.getCollection("flows");
		units	= db.getCollection("units");

		let where = "";
		if ( data_id ) {
			if ( data_id.toString().length == 10 ) { data_id *= 1000000000; }
			else if ( data_id.toString().length == 13 ) { data_id *= 1000000; }
			else if ( data_id.toString().length == 16 ) { data_id *= 1000; }
			where += " AND time="+data_id;
		} else {
			if ( typeof req.query.start !== "undefined" ) {
				if ( !isNaN(req.query.start) ) {
					where = " AND time>="+req.query.start*1000000;
				} else {
					where = " AND time>="+moment(req.query.start).format("x")*1000000; 
				}
			}	
			if ( typeof req.query.end !== "undefined" ) {
				if ( !isNaN(req.query.end) ) {
					where += " AND time<="+req.query.end*1000000;
				} else {
					where += " AND time<="+moment(req.query.end).format("x")*1000000; 
				}
			}
		}
		var sorting = req.query.order==="asc"?"ASC":(req.query.sort==="asc"?"ASC":"DESC");

		var page = parseInt(req.query.page, 10);
		if (isNaN(page) || page < 1) {
			page = 1;
		}
		var limit = parseInt(req.query.limit, 10);
		if (isNaN(limit)) {
			limit = 10;
		} else if (limit > 5000) {
			limit = 5000;
		} else if (limit < 1) {
			limit = 1;
		}

		var flow = flows.chain().find({ "id" : { "$aeq" : flow_id } }).limit(1);
		var join = flow.eqJoin(units.chain(), "unit", "id");

		var flowsDT = db.getCollection("flows");
		datatypes	= db.getCollection("datatypes");
		var flowDT = flowsDT.chain().find({id: flow_id,}).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), "data_type", "id");
		var datatype = typeof (joinDT.data())[0]!=="undefined"?(joinDT.data())[0].right.name:null;
		let fields;
		//SELECT COUNT(value), MEDIAN(value), PERCENTILE(value, 50), MEAN(value), SPREAD(value), MIN(value), MAX(value) FROM data WHERE flow_id="5" AND time > now() - 104w GROUP BY flow_id, time(4w) fill(null)
		if ( typeof modifier!=="undefined" ) {
			fields = getFieldsFromDatatype(datatype, false);
			switch(modifier) {
				case "min": fields += ", MIN(valueFloat) as value";break;
				case "max": fields += ", MAX(valueFloat) as value";break;
				case "first": fields += ", FIRST(valueFloat) as value";break;
				case "last": fields += ", LAST(valueFloat) as value";break;
				case "sum": fields = "SUM(valueFloat) as value";break;
				case "count": fields = "COUNT(valueFloat) as value";break;
				//case "median": fields += ", MEDIAN(valueFloat)";break;
				//case "mean": fields += ", MEAN(valueFloat)";break;
			}
		} else {
			fields = getFieldsFromDatatype(datatype, true);
		}
		
		query = sprintf("SELECT %s FROM data WHERE flow_id='%s' %s ORDER BY time %s LIMIT %s OFFSET %s", fields, flow_id, where, sorting, limit, (page-1)*limit);
		
		//console.log("query: "+query);
		dbInfluxDB.query(query).then(data => {
			if ( data.length > 0 ) {
				data.map(function(d) {
					d.id = sprintf("%s/%s", flow_id, moment(d.time).format("x")*1000);
					d.timestamp = Date.parse(d.time);
					d.time = Date.parse(d.time);
				});
				data.title = ((join.data())[0].left)!==null?((join.data())[0].left).name:"";
				data.unit = ((join.data())[0].right)!==null?((join.data())[0].right).format:"";
				data.mqtt_topic = ((join.data())[0].left).mqtt_topic;
				data.ttl = 3600; // TODO
				data.flow_id = flow_id;
				data.pageSelf = page;
				data.pageNext = page+1;
				data.pagePrev = page-1;
				data.sort = typeof req.query.sort!=="undefined"?req.query.sort:"asc";
				let total = 9999999999999;//TODO, we should get total from influxdb
				data.pageLast = Math.ceil(total/limit);
				data.limit = limit;
				
				data.group = undefined;
				data.groupRows = undefined;
				data.groupsTagsKeys = undefined;
				data.groups = undefined;

				res.status(200).send(new DataSerializer(data).serialize());
			} else {
				res.status(404).send(new ErrorSerializer({"id": 898, "code": 404, "message": "Not Found"}).serialize());
			};
		}).catch(err => {
			res.status(500).send({query: query, err: err, "id": 899, "code": 500, "message": "Internal Error"});
		});
	}
});

/**
 * @api {post} /data/:flow_id Create a DataPoint
 * @apiName Create a DataPoint
 * @apiDescription Create a DataPoint to t6. This needs to post the datapoint over a flow from your own collection.
 * The payload can be crypted using aes-256-cbc algorithm and optionally signed as well. Using both encrypting and signature require to sign the payload first and then to encrypt the new payload as an enveloppe.
 * On both Sign & Encrypt, it is required to claim the object_id in the body so that the symmetric Secret Key can be found on the object as well as the Crypt Secret.
 * @apiGroup 0 DataPoint
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} flow_id Flow ID you want to add Data Point to
 * @apiParam {String} value Data Point value
 * @apiParam {Boolean} [publish=true] Flag to publish to Mqtt Topic ; This parameter might become deprecated.
 * @apiParam {Boolean} [save=false] Flag to store in database the Value
 * @apiParam {String} [unit=undefined] Unit of the Value
 * @apiParam {String} [mqtt_topic="Default value from the Flow resource"] Mqtt Topic to publish value
 * @apiParam {String} [text=undefined] Optional text to qualify Value
 * @apiParam {uuid-v4} [object_id=undefined] Optional object_id uuid used for Signed payload; for decrypt and encrypting in the Mqtt; The object_id must be own by the user in JWT.
 * @apiParam {String} [latitude="39.800327"] Optional String to identify where does the datapoint is coming from. (This is only used for rule specific operator)
 * @apiParam {String} [longitude="6.343530"] Optional String to identify where does the datapoint is coming from. (This is only used for rule specific operator)
 * @apiParam {String} [signedPayload=undefined] Optional Signed payload containing datapoint resource
 * @apiParam {String} [encryptedPayload=undefined] Optional Encrypted payload containing datapoint resource
 * @apiUse 200
 * @apiUse 201
 * @apiUse 401
 * @apiUse 401sign
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 * @apiUse 500
 */
router.post("/(:flow_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret}), function (req, res, next) {
	let payload = req.body;
	let error;
	let isEncrypted = false;
	let isSigned = false;
	let prerequisite = 0;
	var object_id = payload.object_id;

	if ( payload.signedPayload || payload.encryptedPayload ) {
		var cert = jwtsettings.secret; //- fs.readFileSync("private.key");
		objects	= db.getCollection("objects");

		var query;
		if ( typeof object_id !== "undefined" ) {
			query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "id" : object_id },
				]
			};
			var object = objects.findOne(query);
			if ( object && object.secret_key ) {
				cert = object.secret_key;
			}
		}

		if ( payload.encryptedPayload ) {
			// The payload is encrypted
			isEncrypted = true;
			let decrypted = decryptPayload(payload.encryptedPayload.trim(), object); // ascii, binary, base64, hex, utf8
			payload = decrypted!==false?decrypted:payload;
			payload = getJson(payload);
			//console.log("DEBUG", "\nPayload after decryption (1)", payload);
		}

		if ( typeof payload !== "undefined" && payload.signedPayload ) {
			// The payload is signed
			//console.log("payload.signedPayload", payload.signedPayload);
			isSigned = true;
			jwt.verify(payload.signedPayload, cert, function(err, decoded) {
				if ( !err ) {
					payload = decoded;
					//console.log("DEBUG", "\nPayload Unsigned", payload);
					if ( payload.encryptedPayload ) {
						// The payload is encrypted
						isEncrypted = true;
						let decrypted = decryptPayload(payload.encryptedPayload.trim(), object); // ascii, binary, base64, hex, utf8
						payload = decrypted!==false?decrypted:payload;
						//console.log("DEBUG", "\nPayload after unsigned & decryption", payload);
					}
				} else {
					payload = undefined;
					error = err;
					console.log("Error "+error);
					res.status(401).send(new ErrorSerializer({"id": 62.4, "code": 401, "message": "Invalid Signature",}).serialize());
					next();
				}
			});
		}
	}
	
	if ( typeof payload !== "undefined" && !error ) {
		payload = getJson(payload);
		var flow_id		= typeof req.params.flow_id!=="undefined"?req.params.flow_id:payload.flow_id;
		var time		= (payload.timestamp!=="" && typeof payload.timestamp!=="undefined")?parseInt(payload.timestamp, 10):moment().format("x");
		if ( time.toString().length <= 10 ) { time = moment(time*1000).format("x"); }
		var value		= typeof payload.value!=="undefined"?payload.value:"";
		var publish		= typeof payload.publish!=="undefined"?JSON.parse(payload.publish):true;
		var save		= typeof payload.save!=="undefined"?JSON.parse(payload.save):true;
		var unit		= typeof payload.unit!=="undefined"?payload.unit:"";
		var mqtt_topic	= typeof payload.mqtt_topic!=="undefined"?payload.mqtt_topic:"";
		var latitude	= typeof payload.latitude!=="undefined"?payload.latitude:"";
		var longitude	= typeof payload.longitude!=="undefined"?payload.longitude:"";
		var text		= typeof payload.text!=="undefined"?payload.text:"";

		if ( !flow_id || !req.user.id ) {
			// Not Authorized because token is invalid
			res.status(401).send(new ErrorSerializer({"id": 64, "code": 401, "message": "Not Authorized",}).serialize());
		} else {
			flows		= db.getCollection("flows");
			datatypes	= db.getCollection("datatypes");
			var f = flows.chain().find({id: ""+flow_id,}).limit(1);
			var join = f.eqJoin(datatypes.chain(), "data_type", "id");
			if ( !mqtt_topic && (f.data())[0] && (f.data())[0].left && (f.data())[0].left.mqtt_topic ) {
				mqtt_topic = (f.data())[0].left.mqtt_topic;
			}
			var datatype = typeof (join.data())[0]!=="undefined"?(join.data())[0].right.name:null;
			if ( (f.data())[0].left.require_encrypted && !isEncrypted ) {
				//console.log("(f.data())[0].left", (f.data())[0].left);
				prerequisite += 1;
			}
			if ( (f.data())[0].left.require_signed && !isSigned ) {
				//console.log("(f.data())[0].left", (f.data())[0].left);
				prerequisite += 1;
			}
			/*
			console.log("DEBUG", "payload=", payload);
			console.log("DEBUG", "Flow require isSigned -", (f.data())[0].left.require_signed);
			console.log("DEBUG", ".. & Payload isSigned", isSigned);
			console.log("DEBUG", "Flow require isEncrypted -", (f.data())[0].left.require_encrypted);
			console.log("DEBUG", ".. & Payload isEncrypted", isEncrypted);
			console.log("DEBUG", "Prerequisite Index=", prerequisite, "(>0 means something is required.)");
			*/
			if ( prerequisite <= 0 ) {
				// Cast value according to Flow settings
				var fields = [];
				if ( datatype == "boolean" ) {
					value = str2bool(value);
					fields[0] = {time:""+time, valueBoolean: value,};
				} else if ( datatype == "date" ) {
					value = value;
					fields[0] = {time:""+time, valueDate: value,};
				} else if ( datatype == "integer" ) {
					value = parseInt(value, 10);
					fields[0] = {time:""+time, valueInteger: value+"i",};
				} else if ( datatype == "json" ) {
					value = {value:value,};
					fields[0] = {time:""+time, valueJson: value,};
				} else if ( datatype == "string" ) {
					value = ""+value;
					fields[0] = {time:""+time, valueString: value,};
				} else if ( datatype == "time" ) {
					value = value;
					fields[0] = {time:""+time, valueTime: value,};
				} else if ( datatype == "float" ) {
					value = parseFloat(value);
					fields[0] = {time:""+time, valueFloat: value,};
				} else if ( datatype == "geo" ) {
					value = ""+value;
					fields[0] = {time:""+time, valueString: value,};
				} else {
					value = ""+value;
					fields[0] = {time:""+time, valueString: value,};
				}
				// End casting
				
				/*
				console.log("DEBUG", "value = ", value);
				console.log("DEBUG", "datatype = ", datatype);
				console.log("DEBUG", "text = ", text);
				console.log("DEBUG", "influxdb = ", db_type.influxdb);
				console.log("DEBUG", "save = ", save);
				console.log("DEBUG", "tags = ", tags);
				console.log("DEBUG", "fields = ", fields[0]);
				console.log("DEBUG", "timestamp = ", timestamp);
				*/
				if ( save === true ) {
					if ( db_type.influxdb === true ) {
						/* InfluxDB database */
						var tags = {};
						var timestamp = time*1000000;
						if (flow_id!== "") {
							tags.flow_id = flow_id;
						}
						tags.user_id = req.user.id;
						if (text!== "") {
							fields[0].text = text;
						}

						dbInfluxDB.writePoints([{
							measurement: "data",
							tags: tags,
							fields: fields[0],
							timestamp: timestamp,
						}], { retentionPolicy: "autogen", }).then(err => {
							if (err) {
								console.log({"message": "Error on writePoints to influxDb", "err": err, "tags": tags, "fields": fields[0], "timestamp": timestamp});
							}
							//else console.log("DEBUG", {"message": "Success on writePoints to influxDb", "tags": tags, "fields": fields[0], "timestamp": timestamp});
						}).catch(err => {
							console.log("DEBUG", {"message": "Error catched on writting to influxDb", "err": err, "tags": tags, "fields": fields[0], "timestamp": timestamp});
							console.error("Error catched on writting to influxDb:\n"+err);
						});
					}
				}

				if ( publish === true ) {
					let payloadFact = {"dtepoch": time, "value": value, "flow": flow_id}; // This is the minimal payload
					if ( object_id ) {
						payloadFact.object_id = object_id;
					}
					if ( text ) {
						payloadFact.text = text;
					}
					if ( latitude ) {
						payloadFact.latitude = latitude;
					}
					if ( longitude ) {
						payloadFact.longitude = longitude;
					}
					t6decisionrules.action(req.user.id, payloadFact, mqtt_topic);
				}

				fields.flow_id = flow_id;
				fields.id = time*1000000;
				fields[0].flow_id = flow_id;
				fields[0].parent;
				fields[0].first;
				fields[0].prev;
				fields[0].next;
				fields[0].id = time*1000000;
				fields[0].time = time*1000000;
				fields[0].timestamp = time*1000000;
				fields[0].value = value;
				fields[0].datatype = datatype;
				fields[0].publish = publish;
				fields[0].mqtt_topic = mqtt_topic;

				res.header("Location", "/v"+version+"/flows/"+flow_id+"/"+fields[0].id);
				res.status(200).send(new DataSerializer(fields).serialize());
			} else {
				res.status(412).send(new ErrorSerializer({"id": 64.2, "code": 412, "message": "Precondition Failed "+prerequisite,}).serialize());
			}
		}
	} else {
		res.status(412).send(new ErrorSerializer({"id": 65, "code": 412, "message": "Precondition Failed "+error,}).serialize());
	}
});

module.exports = router;
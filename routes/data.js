'use strict';
var express = require('express');
var router = express.Router();
var DataSerializer = require('../serializers/data');
var ErrorSerializer = require('../serializers/error');
var users;
var tokens;
var flows;
var objects;
var datatypes;
var units;
const algorithm = 'aes-256-cbc';

function str2bool(v) {
	return ["yes", "true", "t", "1", "y", "yeah", "on", "yup", "certainly", "uh-huh"].indexOf(v)>-1?true:false;
}

router.get('/1234/test/mqtt', function (req, res) {
	decisionrules.actionTest('FAKE-e8cedd98-3af6-499c-870f-af6a0fc869e8', {'dtepoch': 1499103302768, 'value': "superValue", 'text': null, 'flow': 'FAKE-076dd068-b25e-48f4-8ad8-1c0d57aa1f5c'}, true, 'testTopic');
	res.status(200).send({message: "OK"});
});

/**
 * @api {get} /data/:flow_id Get DataPoint List
 * @apiName Get DataPoint List
 * @apiGroup 0 DataPoint
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} flow_id Flow ID you want to get data from
 * @apiParam {String} [order] Field to order results
 * @apiParam {String} [sort=desc] Sorting order asc OR desc
 * @apiParam {Number} [page] Page offset
 * @apiParam {Number{1-5000}} [limit] Pagination, results limit
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
 * @apiUse 204
 * @apiUse 401
 * @apiUse 404
 * @apiUse 405
 * @apiUse 429
 * @apiUse 500
 */
router.get('/:flow_id([0-9a-z\-]+)', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var flow_id = req.params.flow_id;
	var output = req.query.output!==undefined?req.query.output:'json';
	
	if ( !flow_id ) {
		res.status(405).send(new ErrorSerializer({'id': 56, 'code': 405, 'message': 'Method Not Allowed'}).serialize());
	}
	if ( !req.user.id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({'id': 57, 'code': 401, 'message': 'Not Authorized'}).serialize());
	} else {
		//var limit = req.params.limit!==undefined?parseInt(req.params.limit):10;
		//var page = req.params.page!==undefined?parseInt(req.params.page):1;
		//var sort = req.query.sort!==undefined?req.query.sort:'time';
		var sorting = req.query.order!==undefined?req.query.order:undefined;
		sorting = req.query.order=='asc'?true:false;
		sorting = req.query.sort!==undefined?req.query.sort:undefined;
		sorting = req.query.sort=='asc'?true:false;
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

		flows = db.getCollection('flows');
		units	= db.getCollection('units');
		var flow = flows.chain().find({ 'id' : { '$aeq' : flow_id } }).limit(1);
		var join = flow.eqJoin(units.chain(), 'unit_id', 'id');

		var flowsDT = db.getCollection('flows');
		datatypes	= db.getCollection('datatypes');
		var flowDT = flowsDT.chain().find({id: flow_id,}).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), 'data_type', 'id');
		var datatype = (joinDT.data())[0]!==undefined?(joinDT.data())[0].right.name:null;
		
		//SELECT COUNT(value), MEDIAN(value), PERCENTILE(value, 50), MEAN(value), SPREAD(value), MIN(value), MAX(value) FROM data WHERE flow_id='5' AND time > now() - 104w GROUP BY flow_id, time(4w) fill(null)
		if ( db_type.influxdb == true ) {
			/* InfluxDB database */
			
			var query = squel.select()
				.from('data')
				.where('flow_id=?', flow_id)
				.limit(limit)
				.offset((page - 1) * limit)
				.order('time', sorting)
			;
			
			// Cast value according to Flow settings
			if ( datatype == 'boolean' ) {
				query.field('time, valueBoolean');
			} else if ( datatype == 'date' ) {
				query.field('time, valueDate');
			} else if ( datatype == 'integer' ) {
				query.field('time, valueInteger');
			} else if ( datatype == 'json' ) {
				query.field('time, valueJson');
			} else if ( datatype == 'string' ) {
				query.field('time, valueString');
			} else if ( datatype == 'time' ) {
				query.field('time, valueTime');
			} else if ( datatype == 'float' ) {
				query.field('time, valueFloat');
			} else if ( datatype == 'geo' ) {
				query.field('time, valueString');
			} else {
				query.field('time, value');
			}
			// End casting

			if ( req.query.start != undefined ) {
				if ( !isNaN(req.query.start) ) {
					//if ( req.query.start.length <= 10 ) req.query.start *= 1000;
					query.where('time>='+req.query.start*1000000);
				} else {
					query.where('time>='+moment(req.query.start).format('x')*1000000); 
				}
			}	
			if ( req.query.end != undefined ) {
				if ( !isNaN(req.query.end) ) {
					//if ( req.query.end.length <= 10 ) req.query.end *= 1000; 
					query.where('time<='+req.query.end*1000000);
				} else {
					query.where('time<='+moment(req.query.end).format('x')*1000000); 
				}
			}

			query = query.toString();
			//console.log('query: '+query);

			dbInfluxDB.query(query).then(data => {
				if ( data.length > 0 ) {
					data.map(function(d) {
						d.id = Date.parse(d.time);
						d.timestamp = Date.parse(d.time);
						d.time = Date.parse(d.time);
						if ( datatype == 'boolean' ) {
							d.value = d.valueBoolean=='true'?true:false;
						} else if ( datatype == 'date' ) {
							d.value = d.valueDate;
						} else if ( datatype == 'integer' ) {
							d.value = parseInt((d.valueInteger).substring(-1));
						} else if ( datatype == 'json' ) {
							d.value = d.valueJson;
						} else if ( datatype == 'string' ) {
							d.value = d.valueString;
						} else if ( datatype == 'time' ) {
							d.value = d.valueTime;
						} else if ( datatype == 'float' ) {
							d.value = parseFloat(d.valueFloat);
						} else if ( datatype == 'geo' ) {
							d.value = d.valueString;
						} else {
							d.value = d.value;
						}
					});

					data.title = ((join.data())[0].left)!==null?((join.data())[0].left).name:'';
					data.unit = ((join.data())[0].right)!==null?((join.data())[0].right).format:'';
					data.mqtt_topic = ((join.data())[0].left).mqtt_topic;
					data.ttl = 3600;
					data.flow_id = flow_id;
					data.page = page;
					data.next = page+1;
					data.prev = page-1;
					data.limit = limit;
					data.order = req.query.order!==undefined?req.query.order:'asc';
					
					if (output == 'json') {
						res.status(200).send(new DataSerializer(data).serialize());
					} else if(output == 'svg') {
						res.status(404).send("SVG Not Implemented with influxDB");
					};
				} else {
					res.status(204).send(new ErrorSerializer({'id': 898, 'code': 204, 'message': 'No Content'}).serialize());
				};
			}).catch(err => {
				res.status(500).send({query: query, err: err, 'id': 899, 'code': 500, 'message': 'Internal Error'});
			});

		} else if ( db_type.sqlite3 == true ) {
			/* sqlite3 database */
			// SELECT strftime('%Y', timestamp), AVG(value), MIN(value), MAX(value), count(value) FROM data WHERE flow_id=5 GROUP BY strftime('%Y', timestamp);
			var query = squel.select()
				.field('timestamp, value, flow_id, timestamp AS id')
				.from('data')
				.where('flow_id=?', flow_id)
				.limit(limit)
				.offset((page - 1) * limit)
				.order('timestamp', sorting)
			;
			
			if ( req.query.start != undefined ) {
				if ( !isNaN(req.query.start) ) {
					//if ( req.query.start.length <= 10 ) req.query.start *= 1000;
					query.where('timestamp>=?', req.query.start);
				} else {
					query.where('timestamp>=?', moment(req.query.start).format('X')); // TODO, should be "x" lower case 
				}
			}	
			if ( req.query.end != undefined ) {
				if ( !isNaN(req.query.end) ) {
					//if ( req.query.end.length <= 10 ) req.query.end *= 1000; 
					query.where('timestamp<=?', req.query.end);
				} else {
					query.where('timestamp<=?', moment(req.query.end).format('X')); // TODO, should be "x" lower case 
				}
			}	
				
			query = query.toString();
			//console.log(query);
			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				if ( data.length > 0 ) {
					data.title = ((join.data())[0].left)!==null?((join.data())[0].left).name:'';
					data.unit = ((join.data())[0].right)!==null?((join.data())[0].right).format:'';
					data.mqtt_topic = ((join.data())[0].left).mqtt_topic;
					data.ttl = 3600;
					data.flow_id = flow_id;
					data.page = page;
					data.next = page+1;
					data.prev = page-1;
					data.limit = limit;
					data.id = moment(data.timestamp).format('x');
					data.time = moment(data.timestamp).format('x');
					data.timestamp = moment(data.timestamp).format('x');
					data.order = req.query.order!==undefined?req.query.order:'asc';
					
					if (output == 'json') {
						res.status(200).send(new DataSerializer(data).serialize());
					} else if(output == 'svg') {
						var D3Node = require('d3-node');
						var d3 = require('d3');
						data.reverse();
						var svgStyles = '.text {color: #fff;} .bar { fill: steelblue; } .bar:hover { fill: brown; } .axis {font: 10px sans-serif;} .axis path, .axis line { fill: none; shape-rendering: crispedges; stroke: #000000; }';
						var d3n = new D3Node({svgStyles:svgStyles});
						
						var chartWidth = 800, chartHeight = 400;
						var margin = {top: 10, right: 10, bottom: 10, left: 100},
						    width = chartWidth - margin.left - margin.right,
						    height = chartHeight - margin.top - margin.bottom;

						var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
						var y = d3.scale.linear().range([height, 0]);
						var xAxis = d3.svg.axis()
						    .scale(x)
						    .orient("bottom")
						    .ticks(data.limit)
						    //.tickFormat(d3.time.format("%d/%m/%Y %H:%M"));
							.tickFormat(d3.time.format("%H:%M"));

						var yAxis = d3.svg.axis()
						    .scale(y)
						    .orient("left")
						    .ticks(10);
						var svg = d3n.createSVG()
						    .attr("width", chartWidth)
						    .attr("height", chartHeight)
						    .append("g")
						    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
						
						data.forEach(function(d) {
							x.domain(data.map(function (d) {
								return new Date(d.timestamp);
							}));
							y.domain([0, d3.max(data, function (d) {
								return d.value;
							})]);
							
							svg.append("g")
							    .attr("class", "x axis")
							    .attr("transform", "translate(0," + (height-margin.top-margin.bottom) + ")")
							    .call(xAxis)
							    .selectAll("text")
							    .style("text-anchor", "middle")
							    .attr("x", function(d, i) { return ((i * ((width-margin.left-margin.right) / data.length))+(x.rangeBand()/2)); })
							    .attr("y", "20")
							    ;

							svg.append("g")
							    .attr("class", "y axis")
							    .attr("transform", "rotate(0)")
							    .call(yAxis)
							    .append("text")
							    .attr("y", "")
							    .attr("dy", "")
							    .style("text-anchor", "middle")
							    .text(data.unit)
							    ;
							
							svg.selectAll("bar")
							    .data(data)
							    .enter().append("rect")
								    .attr("class", "bar")
								    .attr("x", function(d) { return x(new Date(d.timestamp)); })
								    .attr("y", function(d) { return y(d.value); })
								    .attr("width", x.rangeBand())
								    .attr("height", function(d) { return (height-margin.top-margin.bottom) - y(d.value); })
								    ;
							
							svg.selectAll("bar")
						    	.data(data)
							    .enter().append("text")
							    	.attr("class", "text")
								    .text(function(d, i) { return (d.value); })
								    .attr("x", function(d, i) { return ((i * (width / data.length))+(x.rangeBand()/2)); })
								    .attr("y", function(d, i) { return y(d.value)-margin.top+30; })
								    .attr("dx", "0em")
								    .attr("dy", "0em")
								    .attr("fill", "white")
								    .style("text-anchor", "middle")
								    ;
									
							res.setHeader('Content-Type', 'image/svg+xml');
							res.status(200).send( d3n.svgString() );
						});
					}
				} else {
					res.status(404).send(new ErrorSerializer({'id': 598, 'code': 404, 'message': 'Not Found'}).serialize());
				}
			});
		}
	}
});

/**
 * @api {get} /data/:flow_id/:data_id Get DataPoint
 * @apiName Get DataPoint
 * @apiGroup 0 DataPoint
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} flow_id Flow ID you want to get data from
 * @apiParam {Number} [data_id] DataPoint ID you want to get
 * @apiSuccess {Object[]} data Data point Object
 * @apiSuccess {String} data.type Data point Type
 * @apiSuccess {String} data.id Data point Identifier
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
router.get('/:flow_id([0-9a-z\-]+)/:data_id([0-9a-z\-]+)', expressJwt({secret: jwtsettings.secret}), function (req, res) {
	var flow_id = req.params.flow_id;
	var data_id = req.params.data_id;
	var output = req.query.output!==undefined?req.query.output:'json';
	
	if ( !flow_id ) {
		res.status(405).send(new ErrorSerializer({'id': 59, 'code': 405, 'message': 'Method Not Allowed'}).serialize());
	}
	if ( !req.user.id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({'id': 60, 'code': 401, 'message': 'Not Authorized'}).serialize());
	} else {
		var limit = 1;
		var page = 1;
		var sorting = req.query.order=='asc'?true:false;
		
		flows	= db.getCollection('flows');
		units	= db.getCollection('units');
		var flow = flows.chain().find({ 'id' : { '$aeq' : flow_id, }, }).limit(1);
		var mqtt_topic = ((flow.data())[0].mqtt_topic!==undefined)?(flow.data())[0].mqtt_topic:null;
		var join = flow.eqJoin(units.chain(), 'unit_id', 'id');

		var flowsDT = db.getCollection('flows');
		datatypes	= db.getCollection('datatypes');
		var flowDT = flowsDT.chain().find({id: flow_id,}).limit(1);
		var joinDT = flowDT.eqJoin(datatypes.chain(), 'data_type', 'id');
		var datatype = (joinDT.data())[0]!==undefined?(joinDT.data())[0].right.name:null;

		if ( db_type.influxdb == true ) {
			/* InfluxDB database */
			var query = squel.select()
				.from('data')
				.where('flow_id=?', flow_id)
				.where('time='+data_id)
				.limit(limit)
			;
			
			// Cast value according to Flow settings
			if ( datatype == 'boolean' ) {
				query.field('time, valueBoolean');
			} else if ( datatype == 'date' ) {
				query.field('time, valueDate');
			} else if ( datatype == 'integer' ) {
				query.field('time, valueInteger');
			} else if ( datatype == 'json' ) {
				query.field('time, valueJson');
			} else if ( datatype == 'string' ) {
				query.field('time, valueString');
			} else if ( datatype == 'time' ) {
				query.field('time, valueTime');
			} else if ( datatype == 'float' ) {
				query.field('time, valueFloat');
			} else if ( datatype == 'geo' ) {
				query.field('time, valueString');
			} else {
				query.field('time, value');
			}
			// End casting

			query = query.toString();
			//console.log(query);
			
			dbInfluxDB.query(query).then(data => {
				if ( data.length > 0 ) {
					data.map(function(d) {
						d.id = Date.parse(d.time);
						d.timestamp = Date.parse(d.time);
						d.time = Date.parse(d.time);
						if ( datatype == 'boolean' ) {
							d.value = d.valueBoolean=='true'?true:false;
						} else if ( datatype == 'date' ) {
							d.value = d.valueDate;
						} else if ( datatype == 'integer' ) {
							d.value = parseInt((d.valueInteger).substring(-1));
						} else if ( datatype == 'json' ) {
							d.value = d.valueJson;
						} else if ( datatype == 'string' ) {
							d.value = d.valueString;
						} else if ( datatype == 'time' ) {
							d.value = d.valueTime;
						} else if ( datatype == 'float' ) {
							d.value = parseFloat(d.valueFloat);
						} else if ( datatype == 'geo' ) {
							d.value = d.valueString;
						} else {
							d.value = d.value;
						}
					});

					data.title = ((join.data())[0].left)!==null?((join.data())[0].left).name:'';
					data.unit = ((join.data())[0].right)!==null?((join.data())[0].right).format:'';
					data.datatype = datatype;
					data.mqtt_topic = ((join.data())[0].left).mqtt_topic;
					data.ttl = 3600;
					data.flow_id = flow_id;
					data.page = page;
					data.next = page+1;
					data.prev = page-1;
					data.limit = limit;
					data.id = data_id;
					data.order = req.query.order!==undefined?req.query.order:'asc';
					
					if (output == 'json') {
						res.status(200).send(new DataSerializer(data).serialize());
					} else if(output == 'svg') {
						res.status(404).send("SVG Not Implemented with influxDB");
					};
				} else {
					res.status(404).send(new ErrorSerializer({'id': 900, 'code': 404, 'message': 'Not Found',}).serialize());
				};
			}).catch(err => {
				res.status(500).send({query: query, err: err, 'id': 901, 'code': 500, 'message': 'Internal Error',});
			});
		} else if ( db_type.sqlite3 == true ) {
			/* sqlite3 database */
			var query = squel.select()
				.field('timestamp, value, flow_id, timestamp AS id')
				.from('data')
				.where('flow_id=?', flow_id)
				.where('timestamp=?', data_id)
				.limit(limit)
				.toString()
				;

			dbSQLite3.all(query, function(err, data) {
				if (err) console.log(err);
				//data.id = moment(data.timestamp).format('x'); //BUG
				data.flow_id = flow_id;
				data.page = page;
				data.next = page+1;
				data.prev = page-1;
				data.limit = limit;
				data.id = data[0].timestamp;
				data.time = data[0].timestamp;
				data.timestamp = data[0].timestamp;
				data.mqtt_topic = mqtt_topic;
				data.order = req.query.order!==undefined?req.query.order:'asc';
				//console.log(data);
				
				if ( data.length > 0 ) {
					res.status(200).send(new DataSerializer(data).serialize());
				} else {
					res.status(404).send(new ErrorSerializer({'id': 61, 'code': 404, 'message': 'Not Found',}).serialize());
				}
			});
		};
	};
});

function decryptPayload(encryptedPayload, sender) {
	if ( sender && sender.secret_key_crypt ) {
		let iv = crypto.randomBytes(16);
		let decipher = crypto.createDecipheriv(algorithm, Buffer.from(sender.secret_key_crypt, 'utf8'), iv);
		//let decipher = crypto.createDecipheriv(algorithm, sender.secret_key_crypt, iv);
		decipher.setAutoPadding(false);
		let decryptedPayload = decipher.update(encryptedPayload, 'base64', 'utf8') + decipher.final('utf8');
		console.log("decryptedPayload", decryptedPayload);
		return decryptedPayload!==""?decryptedPayload:false;
	} else {
		console.log("decryptPayload", "Missing secret_key_crypt");
		return false;
	}
}

/**
 * @api {post} /data/:flow_id Create a DataPoint
 * @apiName Create a DataPoint
 * @apiDescription Create a DataPoint to t6. This needs to post the datapoint over a flow from your own collection.
 * The payload can be crypted using aes-256-cbc algorithm and optionally signed as well. Using both encrypting and signature require to encrypt the payload first and then to sign the new payload as an enveloppe.
 * On both Sign & Encrypt, it is required to claim the object_id in the body so that the symmetric Secret Key can be found on the object as well as the Crypt Secret.
 * @apiGroup 0 DataPoint
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * 
 * @apiParam {uuid-v4} flow_id Flow ID you want to add Data Point to
 * @apiParam {String} value Data Point value
 * @apiParam {Boolean} [publish=false] Flag to publish to Mqtt Topic
 * @apiParam {Boolean} [save=false] Flag to store in database the Value
 * @apiParam {String} [unit=undefined] Unit of the Value
 * @apiParam {String} [mqtt_topic="Default value from the Flow resource"] Mqtt Topic to publish value
 * @apiParam {String} [text=undefined] Optional text to qualify Value
 * @apiParam {String} [latitude="39.800327"] Optional String to identify where does the datapoint is coming from. (This is only used for rule specific operator)
 * @apiParam {String} [longitude="6.343530"] Optional String to identify where does the datapoint is coming from. (This is only used for rule specific operator)
 * @apiParam {String} [signedPayload=undefined] Optional Signed payload containing datapoint resource
 * @apiParam {String} [encryptedPayload=undefined] Optional Encrypted payload containing datapoint resource
 * @apiParam {String} [object_id=undefined] Optional except when using a Signed payload, the oject_id is required for the Symmetric-key algorithm verification; The object must be own by the user in JWT.
 * @apiUse 200
 * @apiUse 201
 * @apiUse 401
 * @apiUse 401sign
 * @apiUse 405
 * @apiUse 412
 * @apiUse 429
 * @apiUse 500
 */
router.post('/(:flow_id([0-9a-z\-]+))?', expressJwt({secret: jwtsettings.secret}), function (req, res, next) {
	let payload = req.body;
	let error;
	let isEncrypted = false;
	let isSigned = false;
	let prerequisite = 0;
	if ( payload.signedPayload || payload.encryptedPayload ) {
		var object_id = payload.object_id;
		var cert = jwtsettings.secret; //- fs.readFileSync('private.key');
		objects	= db.getCollection('objects');

		var query;
		if ( object_id !== undefined ) {
			query = {
			'$and': [
					{ 'user_id' : req.user.id },
					{ 'id' : object_id },
				]
			};
			var json = objects.findOne(query);
			if ( json && json.secret_key ) {
				cert = json.secret_key;
			}
		}

		if ( payload.encryptedPayload ) {
			// The payload is encrypted
			console.log("payload.encryptedPayload", payload.encryptedPayload);
			isEncrypted = true;
			let decrypted = decryptPayload(payload.encryptedPayload, json);
			payload = decrypted!==false?decrypted:payload;
			console.log("payload after decryption", payload);
		}

		if ( payload.signedPayload ) {
			// The payload is signed
			//console.log("payload.signedPayload", payload.signedPayload);
			isSigned = true;
			jwt.verify(payload.signedPayload, cert, function(err, decoded) {
				if ( !err ) {
					payload = decoded;
					console.log("payload.unsigned", payload);
					if ( payload.encryptedPayload ) {
						// The payload is encrypted
						//console.log("payload.encryptedPayload", payload.encryptedPayload);
						isEncrypted = true;
						let decrypted = decryptPayload(payload.encryptedPayload, json);
						payload = decrypted!==false?decrypted:payload;
						console.log("payload after decryption", payload);
					}
				} else {
					payload = undefined;
					error = err;
					console.log("Error "+error);
					res.status(401).send(new ErrorSerializer({'id': 62.4, 'code': 401, 'message': 'Invalid Signature',}).serialize());
					next();
				}
			});
		}
	}

	if ( payload !== undefined && !error ) {
		var flow_id		= req.params.flow_id!==undefined?req.params.flow_id:payload.flow_id;
		var time		= (payload.timestamp!==''&&payload.timestamp!==undefined)?parseInt(payload.timestamp):moment().format('x');
		if ( time.toString().length <= 10 ) { time = moment(time*1000).format('x'); };
		var value		= payload.value!==undefined?payload.value:"";
		var publish		= payload.publish!==undefined?JSON.parse(payload.publish):false;
		var save		= payload.save!==undefined?JSON.parse(payload.save):true;
		var unit		= payload.unit!==undefined?payload.unit:"";
		var mqtt_topic	= payload.mqtt_topic!==undefined?payload.mqtt_topic:"";
		var latitude	= payload.latitude!==undefined?payload.latitude:"";
		var longitude	= payload.longitude!==undefined?payload.longitude:"";
		var text		= payload.text!==undefined?payload.text:"";

		if ( !flow_id || !req.user.id ){
			// Not Authorized because token is invalid
			res.status(401).send(new ErrorSerializer({'id': 64, 'code': 401, 'message': 'Not Authorized',}).serialize());
		} else {
			flows		= db.getCollection('flows');
			datatypes	= db.getCollection('datatypes');
			var f = flows.chain().find({id: ""+flow_id,}).limit(1);
			var join = f.eqJoin(datatypes.chain(), 'data_type', 'id');
			if ( !mqtt_topic && (f.data())[0] && (f.data())[0].mqtt_topic ) {
				mqtt_topic = (f.data())[0].mqtt_topic;
			}
			var datatype = (join.data())[0]!==undefined?(join.data())[0].right.name:null;

			if ( (f.data())[0].left.require_encrypted && !isEncrypted ) {
				//console.log("(f.data())[0].left", (f.data())[0].left);
				prerequisite += 1;
			}
			if ( (f.data())[0].left.require_signed && !isSigned ) {
				//console.log("(f.data())[0].left", (f.data())[0].left);
				prerequisite += 1;
			}
			console.log("flow", (f.data())[0].left);
			console.log("isSigned", isSigned);
			console.log("isEncrypted", isEncrypted);
			console.log("prerequisite isSigned -", (f.data())[0].left.require_signed);
			console.log("prerequisite isEncrypted -", (f.data())[0].left.require_encrypted);

			if ( prerequisite <= 0 ) {
				// Cast value according to Flow settings
				var fields = [];
				if ( datatype == 'boolean' ) {
					value = str2bool(value);
					fields[0] = {time:""+time, valueBoolean: value,};
				} else if ( datatype == 'date' ) {
					value = value;
					fields[0] = {time:""+time, valueDate: value,};
				} else if ( datatype == 'integer' ) {
					value = parseInt(value);
					fields[0] = {time:""+time, valueInteger: value+'i',};
				} else if ( datatype == 'json' ) {
					value = {value:value,};
					fields[0] = {time:""+time, valueJson: value,};
				} else if ( datatype == 'string' ) {
					value = ""+value;
					fields[0] = {time:""+time, valueString: value,};
				} else if ( datatype == 'time' ) {
					value = value;
					fields[0] = {time:""+time, valueTime: value,};
				} else if ( datatype == 'float' ) {
					value = parseFloat(value);
					fields[0] = {time:""+time, valueFloat: value,};
				} else if ( datatype == 'geo' ) {
					value = ""+value;
					fields[0] = {time:""+time, valueString: value,};
				} else {
					value = ""+value;
					fields[0] = {time:""+time, valueString: value,};
				}
				// End casting

				if ( save == true ) {
					if ( db_type.influxdb == true ) {
						/* InfluxDB database */
						var tags = {};
						var timestamp = time*1000000;
						if (flow_id!== "") tags.flow_id = flow_id;
						tags.user_id = req.user.id;
						if (text!== "") fields[0].text = text;

						dbInfluxDB.writePoints([{
							measurement: 'data',
							tags: tags,
							fields: fields[0],
							timestamp: timestamp,
						}], { retentionPolicy: 'autogen', }).then(err => {
							if (err) console.log({'message': 'Error on writePoints to influxDb', 'err': err, 'tags': tags, 'fields': fields[0], 'timestamp': timestamp});
							//else console.log({'message': 'Success on writePoints to influxDb', 'tags': tags, 'fields': fields[0], 'timestamp': timestamp});
						}).catch(err => {
							console.log({'message': 'Error catched on writting to influxDb', 'err': err, 'tags': tags, 'fields': fields[0], 'timestamp': timestamp});
							console.error('Error catched on writting to influxDb:\n'+err);
						});
					}
					if ( db_type.sqlite3 == true ) {
						/* sqlite3 database */
						var query = squel.insert()
							.into("data")
							.set("timestamp", time)
							.set("value", value)
							.set("flow_id", flow_id)
							.toString();
						dbSQLite3.run(query, function(err) {
							if (err) { }
						});
					};
				}
				
				t6decisionrules.action(req.user.id, {'dtepoch': time, 'value': value, 'text': text, 'flow': flow_id, latitude: latitude, longitude: longitude}, publish, mqtt_topic);

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

				res.header('Location', '/v'+version+'/flows/'+flow_id+'/'+fields[0].id);
				res.status(200).send(new DataSerializer(fields).serialize());
			} else {
				res.status(401).send(new ErrorSerializer({'id': 64.2, 'code': 401, 'message': 'Not Authorized, you must sign and/or encrypt',}).serialize());
			}
		};
	} else {
		res.status(412).send(new ErrorSerializer({'id': 65, 'code': 412, 'message': 'Precondition Failed '+error,}).serialize());
	}
});

module.exports = router;
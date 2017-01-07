'use strict';
var express = require('express');
var router = express.Router();
var DataSerializer = require('../serializers/data');
var ErrorSerializer = require('../serializers/error');
var users;
var tokens;
var flows;
var datatypes;

router.get('/:flow_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var flow_id = req.params.flow_id;
	var output = req.query.output!==undefined?req.query.output:'json';
	
	if ( !flow_id ) {
		res.status(405).send(new ErrorSerializer({'id': 56, 'code': 405, 'message': 'Method Not Allowed'}).serialize());
	}
	if ( !req.bearer.user_id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({'id': 57, 'code': 401, 'message': 'Not Authorized'}).serialize());
	} else {
		var permissions = (req.bearer.permissions);
		var p = permissions.filter(function(p) {
		    return p.flow_id == flow_id; 
		})[0];

		if ( p!== undefined && (p.permission == '644' || p.permission == '620' || p.permission == '600') ) { // TODO
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
			} else if (limit > 500) {
			  limit = 50;
			} else if (limit < 1) {
			  limit = 1;
			}

			flows = db.getCollection('flows');
			var units	= db.getCollection('units');
			var flow = flows.chain().find({ 'id' : { '$aeq' : flow_id } }).limit(1);
			//var flow = flows.findOne({ 'id' : { '$aeq' : flow_id } });
			
			units	= db.getCollection('units');
			var join = flow.eqJoin(units.chain(), 'unit_id', 'id');
	
			//SELECT COUNT(value), MEDIAN(value), PERCENTILE(value, 50), MEAN(value), SPREAD(value), MIN(value), MAX(value) FROM data WHERE flow_id='5' AND time > now() - 104w GROUP BY flow_id, time(4w) fill(null)
			if ( db_type.influxdb == true ) {
				/* InfluxDB database */
				var query = squel.select()
					.field('time, publish, value')
					.from('data')
					.where('flow_id=?', flow_id)
					.limit(limit)
					.offset((page - 1) * limit)
					.order('time', sorting)
				;
				
				query = query.toString();
				//res.send({query: query}, 200);
				dbInfluxDB.query(query, function(err, data) {
					if (err) console.log(err);
					data[0].id = moment(data[0].time).format('x');
					data[0].flow_id = flow_id;
					data[0].page = page;
					data[0].next = page+1;
					data[0].prev = page-1;
					data[0].limit = limit;
					data[0].time = moment(data[0].time).format('x');
					data[0].timestamp = moment(data[0].time).format('x');
					data[0].mqtt_topic = ((join.data())[0].left).mqtt_topic;
					data[0].order = req.query.order!==undefined?req.query.order:'asc';
					
					if (output == 'json') {
						res.status(200).send(new DataSerializer(data[0]).serialize());
					} else if(output == 'svg') {}
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
						data.id = moment(data.timestamp).format('x');
						data.title = ((join.data())[0].left)!==null?((join.data())[0].left).name:'';
						data.unit = ((join.data())[0].right)!==null?((join.data())[0].right).format:'';
						data.ttl = 3600;
						data.flow_id = flow_id;
						data.page = page;
						data.next = page+1;
						data.prev = page-1;
						data.limit = limit;
						data.time = moment(data.timestamp).format('x');
						data.timestamp = moment(data.timestamp).format('x');
						data.mqtt_topic = ((join.data())[0].left).mqtt_topic;
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
		} else {
			// no permission
			res.status(401).send(new ErrorSerializer({'id': 58, 'code': 401, 'message': 'Not Authorized'}).serialize());
		}
	}
});

router.get('/:flow_id([0-9a-z\-]+)/:data_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var flow_id = req.params.flow_id;
	var data_id = req.params.data_id;
	
	if ( !flow_id ) {
		res.status(405).send(new ErrorSerializer({'id': 59, 'code': 405, 'message': 'Method Not Allowed'}).serialize());
	}
	if ( !req.bearer.user_id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({'id': 60, 'code': 401, 'message': 'Not Authorized'}).serialize());
	} else {
		var permissions = (req.bearer.permissions);
		var p = permissions.filter(function(p) {
		    return p.flow_id == flow_id; 
		})[0];
	
		if ( p!== undefined && ( p.permission == '644' || p.permission == '600' ) ) { // TODO
			var limit = 1;
			var page = 1;
			var sorting = req.query.order=='asc'?true:false;
			
			flows	= db.getCollection('flows');
			var f = flows.chain().find({id: flow_id}).limit(1).data();
			var mqtt_topic = (f[0].mqtt_topic!==undefined)?f[0].mqtt_topic:null;

			if ( db_type.influxdb == true ) {
				/* InfluxDB database */
				var query = squel.select()
					.field('time, publish, value')
					.from('data')
					.where('flow_id=?', flow_id)
					.where('time=?', data_id)
					.limit(limit)
					.toString()
				;

				dbInfluxDB.query(query, function(err, data) {
					if (err) console.log(err);
					data[0].id = moment(data[0].time).format('x');
					data[0].flow_id = flow_id;
					data[0].page = page;
					data[0].next = page+1;
					data[0].prev = page-1;
					data[0].limit = limit;
					data[0].id = data[0].time;
					data[0].timestamp = data[0].time;
					data[0].mqtt_topic = mqtt_topic;
					data[0].order = req.query.order!==undefined?req.query.order:'asc';
					
					res.status(200).send(new DataSerializer(data[0]).serialize());
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
						res.status(404).send(new ErrorSerializer({'id': 61, 'code': 404, 'message': 'Not Found'}).serialize());
					}
				});
			}
		} else {
			// no permission
			res.status(401).send(new ErrorSerializer({'id': 62, 'code': 401, 'message': 'Not Authorized'}).serialize());
		}
	}
});

router.post('/(:flow_id([0-9a-z\-]+))?', bearerAuthToken, function (req, res) {
	var flow_id		= req.params.flow_id!==undefined?req.params.flow_id:req.body.flow_id;
	var time		= (req.body.timestamp!==''&&req.body.timestamp!==undefined)?parseInt(req.body.timestamp):moment().format('x');
	if ( time.toString().length <= 10 ) { time = moment(time*1000).format('x'); };
	var value		= req.body.value!==undefined?req.body.value:"";
	var publish		= req.body.publish!==undefined?JSON.parse(req.body.publish):false;
	var save		= req.body.save!==undefined?JSON.parse(req.body.save):true;
	var unit		= req.body.unit!==undefined?req.body.unit:"";
	var mqtt_topic	= req.body.mqtt_topic!==undefined?req.body.mqtt_topic:"";
	var text		= req.body.text!==undefined?req.body.text:""; // Right now, only meteo and checkNetwork are using this 'text' to customize tinyScreen icon displayed.

	if ( !flow_id ) {
		res.status(405).send(new ErrorSerializer({'id': 63, 'code': 405, 'message': 'Method Not Allowed'}).serialize());
	}
	
	if ( !req.user.id ){
		// Not Authorized because token is invalid
		res.status(401).send(new ErrorSerializer({'id': 64, 'code': 401, 'message': 'Not Authorized'}).serialize());
	} else {
		flows	= db.getCollection('flows');
		datatypes	= db.getCollection('datatypes');
		var f = flows.chain().find({id: flow_id}).limit(1);
		var join = f.eqJoin(datatypes.chain(), 'data_type', 'id');
		console.log();
		if ( !mqtt_topic && f[0].mqtt_topic ) {
			mqtt_topic = f[0].mqtt_topic;
		}
		var datatype = (join.data())[0].right.name;
		
		// Cast value according to Flow settings
		var fields = [];
		if ( datatype == 'boolean' ) {
			fields[0] = {time:time, value: value};
		} else if ( datatype == 'date' ) {
			fields[0] = {time:time, value: value};
		} else if ( datatype == 'integer' ) {
			fields[0] = {time:time, value: parseInt(value)};
		} else if ( datatype == 'json' ) {
			fields[0] = {time:time, value: {value:value}};
		} else if ( datatype == 'string' ) {
			fields[0] = {time:time, value: ""+value};
		} else if ( datatype == 'time' ) {
			fields[0] = {time:time, value: value};
		} else if ( datatype == 'float' ) {
			fields[0] = {time:time, value: parseFloat(value)};
		} else {
			fields[0] = {time:time, value: ""+value};
		}
		// End casting
		
		var permissions = (req.bearer.permissions);
		var p = permissions.filter(function(p) {
		    return p.flow_id == flow_id; 
		})[0];

		if ( p.permission == '644' || p.permission == '620' || p.permission == '600' ) { // TODO: Must check if our Bearer is from the flow Owner, Group, or Other, and then, check permissions
			//console.log(data);
			if ( save == true ) {
				if ( db_type.influxdb == true ) {
					/* InfluxDB database */
					var tags = {};
					if (flow_id!== "") tags.flow_id = flow_id;
					if (text!== "") tags.text = text;
					dbInfluxDB.writePoint("data", fields[0], tags, {}, function(err, response) {
						if (err) console.log('Err: '+err);
					});
				}
				if ( db_type.sqlite3 == true ) {
					/* sqlite3 database */
					var query = squel.insert()
						.into("data")
						.set("timestamp", time)
						.set("value", value)
						.set("flow_id", flow_id)
						.toString()
					;
					dbSQLite3.run(query, function(err) {
						if (err) { }
					});
				}
			}
			
			if( publish == true && mqtt_topic !== "" ) {
				if ( text !== "" ) {
					client.publish(mqtt_topic, JSON.stringify({dtepoch:time, value:value, text:text}), {retain: true});
				} else {
					client.publish(mqtt_topic, JSON.stringify({dtepoch:time, value:value}), {retain: true});
				}
			}

			fields.flow_id = flow_id;
			fields[0].parent;
			fields[0].first;
			fields[0].prev;
			fields[0].next;
			fields[0].id = time;
			fields[0].time = time;
			fields[0].timestamp = time;
			fields[0].mqtt_topic = mqtt_topic;
			res.status(200).send(new DataSerializer(fields).serialize());
			
		} else {
			// Not Authorized due to permission
			res.status(401).send(new ErrorSerializer({'id': 65, 'code': 401, 'message': 'Not Authorized'}).serialize());
		}
	}
});

function bearerAuthToken(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers['authorization'];
	tokens	= db.getCollection('tokens');
	users	= db.getCollection('users');
	if ( typeof bearerHeader !== 'undefined' || req.session.bearer ) {
		if ( req.session && !bearerHeader ) { // Login using the session
			req.user = req.session.user;
			req.token = req.session.token;
			req.bearer = req.session.bearer;
			req.bearer.user_id = req.session.user.id;
			req.bearer.permissions = req.session.user.permissions;
		} else {
			var bearer = bearerHeader.split(" ");// TODO split with Bearer as prefix!
			bearerToken = bearer[1];
			req.token = bearerToken;
			req.bearer = tokens.findOne(
				{ '$and': [
		           {'token': { '$eq': req.token }},
		           {'expiration': { '$gte': moment().format('x') }},
				]}
			);
		}
		
		if ( !req.bearer ) {
			res.status(403).send(new ErrorSerializer({'id': 66, 'code': 403, 'message': 'Forbidden'}).serialize());
		} else {
			if ( req.user = users.findOne({'id': { '$eq': req.bearer.user_id }}) ) { // TODO: in case of Session, should be removed !
				req.user.permissions = req.bearer.permissions;
				next();
			} else {
				res.status(404).send(new ErrorSerializer({'id': 67, 'code': 404, 'message': 'Not Found'}).serialize());
			}
		}
	} else {
		res.status(401).send(new ErrorSerializer({'id': 68, 'code': 401, 'message': 'Unauthorized'}).serialize());
	}
}

module.exports = router;

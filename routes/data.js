'use strict';
var express = require('express');
var router = express.Router();
var DataSerializer = require('../serializers/data');
var users;

router.get('/:flow_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var flow_id = req.params.flow_id;
	
	if ( !flow_id ) {
		res.send({ 'code': 405, 'error': 'Method Not Allowed' }, 405);
	}
	if ( !req.bearer.user_id ){
		// Not Authorized because token is invalid
		res.send({ 'code': 401, 'error': 'Not Authorized' }, 401);
	} else {
		var permissions = (req.bearer.permissions);
		var p = permissions.filter(function(p) { 
		    return p.flow_id == flow_id; 
		})[0];
	
		if ( p.perm == 'rw' || p.perm == 'r' ) {
			//var limit = req.params.limit!==undefined?parseInt(req.params.limit):10;
			//var page = req.params.page!==undefined?parseInt(req.params.page):1;
			//var sort = req.query.sort!==undefined?req.query.sort:'time';
			var sorting = req.query.order=='asc'?true:false;
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
	
			//SELECT COUNT(value), MEDIAN(value), PERCENTILE(value, 50), MEAN(value), SPREAD(value), MIN(value), MAX(value) FROM data WHERE flow_id='5' AND time > now() - 104w GROUP BY flow_id, time(4w) fill(null)
			if ( db_type == 'influxdb' ) {
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
					data[0].order = req.query.order!==undefined?req.query.order:'asc';
					
					var json = new DataSerializer(data[0]).serialize();
					res.send(json);
				});
			} else if ( db_type == 'sqlite3' ) {
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
				console.log(query);
				//res.send({q: req.query, query: query}, 200);
				dbSQLite3.all(query, function(err, data) {
					if (err) console.log(err);
					//data.id = moment(data.timestamp).format('x'); //BUG
					data.flow_id = flow_id;
					data.page = page;
					data.next = page+1;
					data.prev = page-1;
					data.limit = limit;
					data.order = req.query.order!==undefined?req.query.order:'asc';
					//console.log(data);
					
					res.send(new DataSerializer(data).serialize());
				});
			}
		} else {
			// no permission
			res.send({ 'code': 401, 'error': 'Not Authorized' }, 401);
		}
	}
});

router.get('/:flow_id([0-9a-z\-]+)/:data_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var flow_id = req.params.flow_id;
	var data_id = req.params.data_id;
	
	if ( !flow_id ) {
		res.send({ 'code': 405, 'error': 'Method Not Allowed' }, 405);
	}
	if ( !req.bearer.user_id ){
		// Not Authorized because token is invalid
		res.send({ 'code': 401, 'error': 'Not Authorized' }, 401);
	} else {
		var permissions = (req.bearer.permissions);
		var p = permissions.filter(function(p) { 
		    return p.flow_id == flow_id; 
		})[0];
	
		if ( p.perm == 'rw' || p.perm == 'r' ) {
			var limit = 1;
			var page = 1;
			var sorting = req.query.order=='asc'?true:false;

			if ( db_type == 'influxdb' ) {
				/* InfluxDB database */
				var query = squel.select()
					.field('time, publish, value')
					.from('data')
					.where('flow_id=?', flow_id)
					.where('time=?', data_id)
					.limit(limit)
					.toString()
				;
				//res.send({query: query}, 200);
				dbInfluxDB.query(query, function(err, data) {
					if (err) console.log(err);
					data[0].id = moment(data[0].time).format('x');
					data[0].flow_id = flow_id;
					data[0].page = page;
					data[0].next = page+1;
					data[0].prev = page-1;
					data[0].limit = limit;
					data[0].order = req.query.order!==undefined?req.query.order:'asc';
					
					var json = new DataSerializer(data[0]).serialize();
					res.send(json);
				});
			} else if ( db_type == 'sqlite3' ) {
				/* sqlite3 database */
				var query = squel.select()
					.field('timestamp, value, flow_id, timestamp AS id')
					.from('data')
					.where('flow_id=?', flow_id)
					.where('timestamp=?', data_id)
					.limit(limit)
					.toString()
					;
				//res.send({query: query}, 200);
				dbSQLite3.all(query, function(err, data) {
					if (err) console.log(err);
					//data.id = moment(data.timestamp).format('x'); //BUG
					data.flow_id = flow_id;
					data.page = page;
					data.next = page+1;
					data.prev = page-1;
					data.limit = limit;
					data.order = req.query.order!==undefined?req.query.order:'asc';
					//console.log(data);
					
					if ( data.length > 0 ) {
						res.send(new DataSerializer(data).serialize());
					} else {
						res.send({ 'code': 404, message: 'Not Found' }, 404);
					}
				});
			}
		} else {
			// no permission
			res.send({ 'code': 401, 'error': 'Not Authorized' }, 401);
		}
	}
});

router.post('/(:flow_id([0-9a-z\-]+))?', bearerAuthToken, function (req, res) {
	var flow_id		= req.params.flow_id!==undefined?req.params.flow_id:req.body.flow_id;
	var time		= req.body.timestamp!==undefined?parseInt(req.body.timestamp):moment().format('x');
	if ( time.toString().length <= 10 ) { time = moment(time*1000).format('x'); };
	
	var value		= req.body.value!==undefined?req.body.value:"";
	var publish		= req.body.publish!==undefined?JSON.parse(req.body.publish):false;
	var save		= req.body.save!==undefined?JSON.parse(req.body.save):true;
	var unit		= req.body.unit!==undefined?req.body.unit:"";
	var mqtt_topic	= req.body.mqtt_topic!==undefined?req.body.mqtt_topic:"";
	var text		= req.body.text!==undefined?req.body.text:""; // Right now, only meteo and checkNetwork are using this 'text' to customize tinyScreen icon displayed.

	if ( !flow_id ) {
		res.send({ 'code': 405, 'error': 'Method Not Allowed' }, 405);
	}
	if ( !req.bearer.user_id ){
		// Not Authorized because token is invalid
		res.send({ 'code': 401, 'error': 'Not Authorized' }, 401);
	} else {
		var permissions = (req.bearer.permissions);
		var p = permissions.filter(function(p) { 
		    return p.flow_id == flow_id; 
		})[0];
	
		if ( p.permission == '644' ) { // TODO: Must check if our Bearer is from the flow Owner, Group, or Other, and then, check permissions
			// In case text != null, we should also save that text to Db!
			
			var data = [ { time:time, value: value } ];
			if ( save == true ) {
				if ( db_type == 'influxdb' ) {
					/* InfluxDB database */
					var tags = {};
					if ( flow_id !== undefined ) tags.flow_id = flow_id;
					if ( unit !== "" ) tags.unit = unit;
					if ( publish !== "" ) tags.publish = publish;
					if ( save !== "" ) tags.save = save;
					if ( text !== "" ) tags.text = text;
					if ( mqtt_topic !== "" ) tags.mqtt_topic = mqtt_topic;
					dbInfluxDB.writePoint("data", data[0], tags, {}, function(err, response) {
						if (err) { }
						if (response) console.log('Res: '+response);
					});
				} else if ( db_type == 'sqlite3' ) {
					/* sqlite3 database */
					var query = squel.insert()
						.into("data")
						.set("timestamp", time)
						.set("value", value)
						.set("flow_id", flow_id)
						.toString()
					;
					//console.log(query);
					dbSQLite3.run(query, function(err) {
						if (err) { }
					});
				}
			}
			
			if( publish == true && mqtt_topic !== undefined ) {
				if ( text !== undefined ) {
					client.publish(mqtt_topic, JSON.stringify({dtepoch:time, value:value, text:text}));
				} else {
					client.publish(mqtt_topic, JSON.stringify({dtepoch:time, value:value}));
				}
			}
			
			data.flow_id = flow_id;
			data.id = time;
			res.send(new DataSerializer(data).serialize());
			
		} else {
			// Not Authorized due to permission
			res.send({ 'code': 401, 'error': 'Not Authorized' }, 401);
		}
	}
});

function bearerAuthToken(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers['authorization'];
	var tokens	= db.getCollection('tokens');
	if ( typeof bearerHeader !== 'undefined' ) {
		var bearer = bearerHeader.split(" ");// TODO split with Bearer as prefix!
		bearerToken = bearer[1];
		req.token = bearerToken;
		req.bearer = tokens.findOne(
			{ '$and': [
	           {'token': { '$eq': req.token }},
	           {'expiration': { '$gte': moment().format('x') }},
			]}
		);
		//console.log(req.bearer);
		if ( !req.bearer ) {
			res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
		}
		next();
	} else {
		res.send({ 'code': 403, 'error': 'Forbidden' }, 403);
	}
}

module.exports = router;

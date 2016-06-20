'use strict';
var express = require('express');
var router = express.Router();
var DataSerializer = require('../serializers/data');
var ErrorSerializer = require('../serializers/error');
var users;
var tokens;
var flows;

router.get('/:flow_id([0-9a-z\-]+)', bearerAuthToken, function (req, res) {
	var flow_id = req.params.flow_id;
	
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
	
		if ( p!== undefined && p.permission == '644' ) { // TODO
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

			flows = db.getCollection('flows');
			//if( flow_id.length < 3 )  flow_id = parseInt(flow_id, 0);
			//var flow = flows.findOne({ 'id' : flow_id });
			var flow = flows.findOne({ 'id' : { '$aeq' : flow_id } });
	
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
					
					res.status(200).send(new DataSerializer(data[0]).serialize());
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
				//console.log(query);
				dbSQLite3.all(query, function(err, data) {
					if (err) console.log(err);
					if ( data.length > 0 ) {
						data.id = moment(data.id).format('x');
						data.title = flow!==null?flow.name:'';
						data.unit = flow!==null?flow.unit:'';
						data.ttl = 3600;
						data.flow_id = flow_id;
						data.page = page;
						data.next = page+1;
						data.prev = page-1;
						data.limit = limit;
						data.order = req.query.order!==undefined?req.query.order:'asc';
						
						res.status(200).send(new DataSerializer(data).serialize());
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
	
		if ( p!== undefined && p.permission == '644' ) { // TODO
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

				dbInfluxDB.query(query, function(err, data) {
					if (err) console.log(err);
					data[0].id = moment(data[0].time).format('x');
					data[0].flow_id = flow_id;
					data[0].page = page;
					data[0].next = page+1;
					data[0].prev = page-1;
					data[0].limit = limit;
					data[0].order = req.query.order!==undefined?req.query.order:'asc';
					
					res.status(200).send(new DataSerializer(data[0]).serialize());
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
	var time		= req.body.timestamp!==''?parseInt(req.body.timestamp):moment().format('x');
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
		var permissions = (req.bearer.permissions);
		var p = permissions.filter(function(p) {
		    return p.flow_id == flow_id; 
		})[0];

		if ( p.permission == '644' ) { // TODO: Must check if our Bearer is from the flow Owner, Group, or Other, and then, check permissions
			// TODO: In case text != null, we should also save that text to Db!
			
			var data = [ { time:time, value: value } ]; // TODO: is it only for influxdb???
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

			data.flow_id = flow_id;
			data[0].parent;
			data[0].first;
			data[0].prev;
			data[0].next;
			data[0].id = time;
			res.status(200).send(new DataSerializer(data).serialize());
			
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

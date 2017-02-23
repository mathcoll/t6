'use strict';
var express = require('express');
var router	= express.Router();
var DataSerializer = require('../serializers/data');
var ErrorSerializer = require('../serializers/error');
var users;
var objects;
var units;
var flows;
var snippets;
var datatypes;
var tokens;
var rules;
var dashboards;
var qt;
var objectTypes = ['rooter', 'microchip', 'sensor', 'computer', 'laptop', 'desktop', 'phone', 'smartphone', 'nodemcu', 'tablet', 'server', 'printer'];

function nl2br(str, isXhtml) {
    var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

function alphaSort(obj1, obj2) {
    return (obj1.name).toLowerCase().localeCompare((obj2.name).toLowerCase());
};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

router.all('*', function (req, res, next) {
	res.locals.ip = req.ip;
	res.locals.session = req.session;
	res.locals.session['user-agent'] = req.headers['user-agent'];
	var mydevice = device(res.locals.session['user-agent']);
	//console.log("type: "+mydevice.type);
	//console.log("model: "+mydevice.model);
	next();
});

router.get('/', function(req, res) {
	if ( req.session.user !== undefined ) events.add('t6App', 'get/', req.session.user.id);
	res.render('index', {
		title : 't6, IoT platform and API',
		currentUrl: req.path,
		user: req.session.user
	});
});

/* OBJECTS */
router.get('/objects', Auth,  function(req, res) {
	objects	= db.getCollection('objects');
	//qt	= dbQuota.getCollection('quota');
	var query = { 'user_id': req.session.user.id };
	var pagination=12;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;

	var o = objects.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data();
	if ( o.length == 0 ) {
		res.redirect('/objects/add');
	} else {
		var objects_length = (objects.chain().find(query).data()).length;
		res.render('objects/objects', {
			title : 'My Objects',
			objects: o,
			objects_length: objects_length,
			new_object: {},
			page: req.query.page,
			pagenb: Math.ceil(objects_length/pagination),
			types: objectTypes,
			message: {},
			user: req.session.user,
			nl2br: nl2br,
			currentUrl: req.path,
			striptags: striptags,
			quota : (quota[req.session.user.role])
		});
	}
});

router.get('/objects/add', Auth, function(req, res) {
	res.render('objects/add', {
		title : 'Add an Object',
		message: {},
		user: req.session.user,
		types: objectTypes,
		new_object: {},
		nl2br: nl2br,
		currentUrl: req.path,
		striptags: striptags
	});
});

router.get('/objects/:object_id([0-9a-z\-]+)', Auth, function(req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	if ( object_id !== undefined ) {
		var queryO = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : object_id },
			]
		};
		var json = {
			object: objects.findOne(queryO),
			flows: flows.findOne({ 'user_id': req.session.user.id })
		};
		if ( json.object ) {
			var qr = qrCode.qrcode(9, 'M');
			qr.addData(baseUrl+'/objects/'+object_id+'/public');
			qr.make();
			var message = req.session.message!==null?req.session.message:null;
			req.session.message = null; // Force to unset
			res.render('objects/object', {
				title : 'Object '+json.object.name,
				object: json.object,
				flows: json.flows,
				user: req.session.user,
				nl2br: nl2br,
				message: message,
				striptags: striptags,
				currentUrl: req.path,
				qr_img: qr.createImgTag(5)
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	}
});

router.get('/objects/:object_id([0-9a-z\-]+)/public', function(req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection('objects');
	users	= db.getCollection('users');
	var queryO = {
		'$and': [
					{ 'isPublic': 'true' },
					{ 'id' : object_id },
				]
	};
	var json = objects.chain().simplesort('user_id').find(queryO).limit(1);
	var meta = ((json.data())[0])!==undefined?((json.data())[0]).meta:'';
	var r = (json.eqJoin(users.chain(), 'user_id', 'id').data())[0];
	if ( r ) {
		r.left.created = moment(meta.created).format('dddd, MMMM Do YYYY, H:mm:ss');
		r.left.updated = moment(meta.updated).format('dddd, MMMM Do YYYY, H:mm:ss');
		res.render('objects/public', {
			title : 'Object '+r.left.name,
			object: r.left,
			owner: r.right,
			user: req.session.user,
			nl2br: nl2br,
			currentUrl: req.path,
			striptags: striptags
		});
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.get('/objects/:object_id([0-9a-z\-]+)/qrprint', Auth, function(req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection('objects');
	if ( object_id !== undefined ) {
		var queryO = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : object_id },
			]
		};
		var json = objects.findOne(queryO);
		if ( json ) {
			var qr = qrCode.qrcode(9, 'M');
			var url = baseUrl+'/objects/'+object_id+'/public';
			qr.addData(url);
			qr.make();
			res.render('objects/qrprint', {
				title : 'Object '+json.name,
				url: url,
				qr_img1: qr.createImgTag(1),
				qr_img2: qr.createImgTag(2),
				qr_img3: qr.createImgTag(3),
				qr_img4: qr.createImgTag(4),
				qr_img5: qr.createImgTag(5),
				object_id: object_id,
				currentUrl: req.path,
				striptags: striptags
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.get('/objects/:object_id([0-9a-z\-]+)/edit', Auth, function(req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection('objects');
	if ( object_id !== undefined ) {
		var queryO = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : object_id },
			]
		};
		var json = objects.findOne(queryO);
		//console.log(json);
		if ( json ) {
			res.render('objects/edit', {
				title : 'Edit Object '+json.name,
				object: json,
				types: objectTypes,
				currentUrl: req.path,
				user: req.session.user
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.post('/objects/:object_id([0-9a-z\-]+)/edit', Auth, function(req, res) {
	var object_id = req.params.object_id;
	if ( object_id !== undefined ) {
		objects	= db.getCollection('objects');
		var queryO = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : object_id },
			]
		};
		var json = (objects.chain().find(queryO).limit(1).data())[0];
		//console.log(json);
		
		if ( json ) {
			json.name 			= req.body.name!==undefined?req.body.name:json.name;
			json.type 			= req.body.type!==undefined?req.body.type:json.type;
			json.description	= req.body.description!==undefined?req.body.description:json.description;
			json.position		= req.body.position!==undefined?req.body.position:json.position;
			json.longitude		= req.body.longitude!==undefined?req.body.longitude:json.longitude;
			json.latitude		= req.body.latitude!==undefined?req.body.latitude:json.latitude;
			json.isPublic		= req.body.isPublic!==undefined?req.body.isPublic:json.isPublic;
			json.ipv4			= req.body.ipv4!==undefined?req.body.ipv4:json.ipv4;
			json.ipv6			= req.body.ipv6!==undefined?req.body.ipv6:json.ipv6;
			json.user_id		= req.session.user.id;
			json.parameters		= new Array();
			
			var pnames = req.body['pnames[]'];
			if( !(pnames instanceof Array) ) {
				pnames = [pnames];
			}
			var pvalues = req.body['pvalues[]'];
			if( !(pvalues instanceof Array) ) {
				pvalues = [pvalues];
			}
			var listed = Array();
			(pnames).map(function(p, i) {
				if ( (pnames)[i] !== undefined && (pnames)[i] !== null && (pnames)[i] !== '' ) {
					var name = ((pnames)[i]).replace(/[^a-zA-Z0-9-_]+/g, '');
					if ( listed.indexOf(name) == -1 ) {
						(json.parameters).push({name: name, value: (pvalues)[i], type: 'String'});
						listed.push(name);
					}
				}
			});
			
			objects.update(json);
			db.save();
			
			res.redirect('/objects/'+object_id);
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.get('/objects/:object_id([0-9a-z\-]+)/remove', Auth, function(req, res) {
	var object_id = req.params.object_id;
	objects	= db.getCollection('objects');
	if ( object_id !== undefined ) {
		var queryO = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : object_id },
			]
		};
		var json = objects.chain().find(queryO).limit(1).remove().data();
		//console.log(json);
		if ( json ) {
			res.redirect('/objects');
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.post('/objects/add', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	var message = undefined;
	var error = undefined;
	var queryQ = { '$and': [
        {'user_id' : req.bearer!==undefined?req.bearer.user_id:req.session.bearer!==undefined?req.session.bearer.user_id:null}
 	]};
	
	var parameters = new Array();
	var pnames = req.body['pnames[]'];
	if( !(pnames instanceof Array) ) {
		pnames = [pnames];
	}
	var pvalues = req.body['pvalues[]'];
	if( !(pvalues instanceof Array) ) {
		pvalues = [pvalues];
	}
	var listed = Array();
	(pnames).map(function(p, i) {
		if ( (pnames)[i] !== undefined && (pnames)[i] !== null && (pnames)[i] !== '' ) {
			var name = ((pnames)[i]).replace(/[^a-zA-Z0-9-_]+/g, '');
			if ( listed.indexOf(name) == -1 ) {
				parameters.push({name: name, value: (pvalues)[i], type: 'String'});
				listed.push(name);
			}
		}
	});
	
	var new_object = {
		id:				uuid.v4(),
		name:			req.body.name!==undefined?req.body.name:'unamed',
		type:  			req.body.type!==undefined?req.body.type:'default',
		description:	req.body.description!==undefined?req.body.description:'',
		position: 	 	req.body.position!==undefined?req.body.position:'',
		longitude:		req.body.longitude!==undefined?req.body.longitude:'',
		latitude:		req.body.latitude!==undefined?req.body.latitude:'',
		isPublic:		req.body.isPublic!==undefined?req.body.isPublic:'false',
		ipv4:  			req.body.ipv4!==undefined?req.body.ipv4:'',
		ipv6:			req.body.ipv6!==undefined?req.body.ipv6:'',
		user_id:		req.session.user.id,
		parameters:		parameters,
	};
	var i = (objects.find(queryQ)).length;
	var query = { 'user_id': req.session.user.id };
	if( i >= (quota[req.session.user.role]).objects ) {
		message = {type: 'danger', value: 'Over Quota!'};
		error = true;
	} else {
		var pagination=12;
		req.query.page=req.query.page!==undefined?req.query.page:1;
		var offset = (req.query.page -1) * pagination;
		
		if ( new_object.name && new_object.type && new_object.user_id ) {
			objects.insert(new_object);
			db.save();
			message = {type: 'success', value: 'Object <a href="/objects/'+new_object.id+'">'+new_object.name+'</a> successfuly added.'};
			req.session.message = message;
		} else {
			message = {type: 'danger', value: 'Please give a name and a type to your Object!'};
			error = true;
		}
	}
	
	if ( error ) {
		res.render('objects/add', {
			title : 'Add an Objects',
			objects: objects.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data(),
			new_object: new_object,
			page: req.query.page,
			pagenb: Math.ceil(((objects.chain().find(query).data()).length) / pagination),
			types: objectTypes,
			user: req.session.user,
			message: message,
			currentUrl: req.path,
			nl2br: nl2br
		});
	} else {
		res.redirect('/objects/'+new_object.id);
	}
});

/* MQTT TOPICS */
router.get('/mqtts?', Auth, function(req, res) {
	flows	= db.getCollection('flows');
	var query = { '$and': [
		{ 'user_id' : { '$eq': req.session.user.id } }
	]};

	var pagination=12;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var message = req.session.message!==null?req.session.message:null;
	req.session.message = null; // Force to unset

	var f = flows.chain().find(query).where(function(f) { return (f.mqtt_topic !== null && f.mqtt_topic !== '' && f.mqtt_topic !== undefined); }).sort(alphaSort).offset(offset).limit(pagination).data();
	//console.log(f);
	if ( f.length == 0 ) {
		res.redirect('/flows/add');
	} else {
		var flows_length = (flows.chain().find(query).where(function(f) { return (f.mqtt_topic !== null && f.mqtt_topic !== '' && f.mqtt_topic !== undefined); }).data()).length;
		res.render('mqtt/mqtts', {
			title : 'Mqtt Topics',
			flows: f,
			flows_length: flows_length,
			page: req.query.page,
			pagenb: Math.ceil(flows_length/pagination),
			user: req.session.user,
			currentUrl: req.path,
			message: message
		});
	}
});

/* FLOWS */
router.get('/flows', Auth, function(req, res) {
	flows	= db.getCollection('flows');
	//qt	= dbQuota.getCollection('quota');

	var query = { 'user_id': req.session.user.id };
	var pagination=12;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var message = req.session.message!==null?req.session.message:null;
	req.session.message = null; // Force to unset

	var f = flows.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data();
	if ( f.length == 0 ) {
		res.redirect('/flows/add');
	} else {
		var flows_length = (flows.chain().find(query).data()).length;
		res.render('flows/flows', {
			title : 'My Flows',
			flows: f,
			flows_length: flows_length,
			page: req.query.page,
			pagenb: Math.ceil(flows_length/pagination),
			user: req.session.user,
			currentUrl: req.path,
			message: message,
			quota : (quota[req.session.user.role])
		});
	}
});

router.get('/flows/add', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	units	= db.getCollection('units');
	datatypes	= db.getCollection('datatypes');
	var query = { 'user_id': req.session.user.id };
	var o = objects.chain().find(query).sort(alphaSort).data();
	var dt = datatypes.chain().find().sort(alphaSort).data();
	var u = units.chain().find().sort(alphaSort).data();
	res.render('flows/add', {
		title : 'Add a Flow',
		message: {},
		objects: o,
		datatypes: dt,
		units: u,
		user: req.session.user,
		new_flow: {objects:[]},
		nl2br: nl2br,
		currentUrl: req.path,
		striptags: striptags
	});
});

router.get('/flows/:flow_id([0-9a-z\-]+)', Auth, function(req, res) {
	var flow_id = req.params.flow_id;
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	if ( flow_id !== undefined ) {
		var queryF = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : flow_id },
			]
		};

		units		= db.getCollection('units');
		datatypes	= db.getCollection('datatypes');
		var f = flows.chain().find(queryF).limit(1);
		var join = f.eqJoin(units.chain(), 'unit_id', 'id');

		if ( (join.data())[0].left ) {
			var message = req.session.message!==null?req.session.message:null;
			req.session.message = null; // Force to unset
			res.render('flows/flow', {
				title :		'Flow '+((join.data())[0].left).name,
				user:		req.session.user,
				nl2br:		nl2br,
				flow:		(join.data())[0].left,
				unit:		(join.data())[0].right,
				datatypes:	datatypes.data,
				snippet:	{p:{}, icon: 'fa fa-line-chart', name: req.query.title!==undefined?req.query.title:((join.data())[0].left).name, flows: [flow_id]},
				flows:		flows.chain().find({ 'user_id': req.session.user.id }).sort(alphaSort).data(),
				message:	message,
				striptags:	striptags,
				objects: 	objects.chain().find({ 'user_id': req.session.user.id }).data(),
				currentUrl:	req.path,
				graph_title:		req.query.title!==undefined?req.query.title:((join.data())[0].left).name,
				graph_startdate:	moment(req.query.startdate!==undefined?req.query.startdate:moment().subtract(1, 'd'), 'x').format('DD/MM/YYYY'),
				graph_startdate2:	req.query.startdate!==undefined?req.query.startdate:moment().subtract(1, 'd').format('x'),
				graph_enddate:		moment(req.query.enddate!==undefined?req.query.enddate:moment().add(1, 'd'), 'x').format('DD/MM/YYYY'),
				graph_enddate2:		req.query.enddate!==undefined?req.query.enddate:moment().add(1, 'd').format('x'),
				graph_max:			req.query.max!==undefined?req.query.max:'50',
				graph_ttl:			req.query.graph_ttl!==undefined?req.query.graph_ttl:'',
				graph_weekendAreas:	req.query.weekendAreas!==undefined?req.query.weekendAreas:'',
				graph_color:		req.query.color!==undefined?req.query.color:'#edc240',
				graph_fill:			req.query.fill!==undefined?req.query.fill:'false',
				graph_autorefresh:	req.query.autorefresh!==undefined?req.query.autorefresh:'false',
				graph_chart_type:	req.query.chart_type!==undefined?req.query.chart_type:'bars',
				graph_layout:		req.query.layout!==undefined?req.query.layout:12,
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl:	req.path,
				err: err
			});
		}
	}
});

router.get('/flows/:flow_id([0-9a-z\-]+)/edit', Auth, function(req, res) {
	var flow_id = req.params.flow_id;
	objects	= db.getCollection('objects');
	units	= db.getCollection('units');
	datatypes	= db.getCollection('datatypes');
	flows	= db.getCollection('flows');
	var query = { 'user_id': req.session.user.id };
	var o = objects.chain().find(query).sort(alphaSort).data();
	var dt = datatypes.chain().find().sort(alphaSort).data();
	var u = units.chain().find().sort(alphaSort).data();
	if ( flow_id !== undefined ) {
		var queryF = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : flow_id },
			]
		};
		var json = {
			flow: flows.findOne(queryF)
		};
		if ( json.flow ) {
			var message = req.session.message!==null?req.session.message:null;
			req.session.message = null; // Force to unset
			res.render('flows/edit', {
				title : 'Edit Flow '+json.flow.name,
				user: req.session.user,
				nl2br: nl2br,
				flow: json.flow,
				message: message,
				striptags: striptags,
				currentUrl: req.path,
				objects: o,
				datatypes: dt,
				units: u,
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	}
});

router.post('/flows/:flow_id([0-9a-z\-]+)/edit', Auth, function(req, res) {
	var flow_id = req.params.flow_id;
	if ( flow_id !== undefined ) {
		flows	= db.getCollection('flows');
		var queryF = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : flow_id },
			]
		};
		var json = (flows.chain().find(queryF).limit(1).data())[0];
		var owner_permission = req.body.owner_permission!==undefined?req.body.owner_permission:'6';
		var group_permission = req.body.group_permission!==undefined?req.body.group_permission:'0';
		var other_permission = req.body.other_permission!==undefined?req.body.other_permission:'0';
		var linked_objects = req.body['objects[]']!==undefined?req.body['objects[]']:new Array();
		if( req.body['objects[]'] instanceof Array ) {
			//
		} else {
			linked_objects = [linked_objects];
		}
		//console.log(json);
		if ( json ) {
			json.id=			""+flow_id;
			json.data_type=		req.body.datatype!==undefined?req.body.datatype:null;
			json.name=			req.body.name!==undefined?req.body.name:null;
			json.permission=	owner_permission+group_permission+other_permission;
			json.objects=		linked_objects;
			json.unit=			''; // TODO
			json.unit_id=		req.body.unit!==undefined?req.body.unit:null;
			//json.user_id=		user_id; // Don't need to update
			json.theme=			req.body.theme!==undefined?req.body.theme:null;
			json.mqtt_topic=	req.body.mqtt_topic!==undefined?req.body.mqtt_topic:null;
			
			flows.update(json);
			db.save();
			
			res.redirect('/flows/'+flow_id);
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.get('/flows/:flow_id([0-9a-z\-]+)/graph', Auth, function(req, res) {
	var flow_id = req.params.flow_id;
	res.render('flows/graph', {
		title : 'Graph a Flow',
		flow_id: flow_id,
		flow: 	{id: flow_id},
		user: req.session.user,
		moment: moment,
		currentUrl: req.path,
		snippet:			{p:{}, icon: 'fa fa-line-chart', name: req.query.title!==undefined?req.query.title:'Default Title', flows: [flow_id]},
		graph_title:		req.query.title!==undefined?req.query.title:'Default Title',
		graph_startdate:	moment(req.query.startdate!==undefined?req.query.startdate:moment().subtract(1, 'd'), 'x').format('DD/MM/YYYY'),
		graph_startdate2:	req.query.startdate!==undefined?req.query.startdate:moment().subtract(1, 'd').format('x'),
		graph_enddate:		moment(req.query.enddate!==undefined?req.query.enddate:moment().add(1, 'd'), 'x').format('DD/MM/YYYY'),
		graph_enddate2:		req.query.enddate!==undefined?req.query.enddate:moment().add(1, 'd').format('x'),
		graph_max:			req.query.max!==undefined?req.query.max:'50',
		graph_ttl:			req.query.graph_ttl!==undefined?req.query.graph_ttl:'',
		graph_weekendAreas:	req.query.weekendAreas!==undefined?req.query.weekendAreas:'',
		graph_color:		req.query.color!==undefined?req.query.color:'#edc240',
		graph_fill:			req.query.fill!==undefined?req.query.fill:'false',
		graph_autorefresh:	req.query.autorefresh!==undefined?req.query.autorefresh:'false',
		graph_chart_type:	req.query.chart_type!==undefined?req.query.chart_type:'bars',
		graph_layout:		req.query.layout!==undefined?req.query.layout:12,
	});
});

router.post('/flows/add', Auth, function(req, res) {
	flows	= db.getCollection('flows');
	objects	= db.getCollection('objects');
	units	= db.getCollection('units');
	datatypes	= db.getCollection('datatypes');
	var error = undefined;
	var user_id = req.bearer!==undefined?req.bearer.user_id:req.session.bearer!==undefined?req.session.bearer.user_id:null;
	var message = '';
	var queryQ = { '$and': [  {'user_id' : user_id} ]};
	
	var flow_id = uuid.v4();
	var owner_permission = req.body.owner_permission!==undefined?req.body.owner_permission:'6';
	var group_permission = req.body.group_permission!==undefined?req.body.group_permission:'0';
	var other_permission = req.body.other_permission!==undefined?req.body.other_permission:'0';
	var linked_objects = req.body['objects[]']!==undefined?req.body['objects[]']:new Array();
	if ( typeof linked_objects !== 'object' ) linked_objects = new Array(linked_objects);
	
	var new_flow = {
		id:				""+flow_id,
		data_type:		req.body.datatype!==undefined?req.body.datatype:null,
		name:			req.body.name!==undefined?req.body.name:null,
		permission:		owner_permission+group_permission+other_permission,
		objects:		linked_objects,
		unit:			'', // TODO
		unit_id:		req.body.unit!==undefined?req.body.unit:null,
		user_id:		user_id,
		theme:			req.body.theme!==undefined?req.body.theme:null,
		mqtt_topic:		req.body.mqtt_topic!==undefined?req.body.mqtt_topic:null
	};
	//console.log(new_flow);
	var i = (flows.find(queryQ)).length;
	if( i >= (quota[req.session.user.role]).flows ) {
		message = {type: 'danger', value: 'Over Quota!'};
		error = true;
	} else {
		if ( new_flow.name && new_flow.data_type && new_flow.user_id && new_flow.unit_id ) {
			flows.insert(new_flow);
			db.save();
			message = {type: 'success', value: 'Flow <a href="/flows/'+new_flow.id+'">'+new_flow.name+'</a> successfully added.'};
			req.session.message = message;
		} else {
			message = {type: 'danger', value: 'Please give a name, a type and a unit to your Flow!'};
			error = true;
		}
	}
	var query = { 'user_id': req.session.user.id };
	var pagination=12;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var f = flows.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data();
	var o = objects.chain().find(query).sort(alphaSort).data();
	var dt = datatypes.chain().find().sort(alphaSort).data();
	var u = units.chain().find().sort(alphaSort).data();
	
	if ( error ) {
		res.render('flows/add', {
			title : 't6 Flows',
			flows: f,
			objects: o,
			datatypes: dt,
			units: u,
			page: req.query.page,
			pagenb: Math.ceil(((flows.chain().find(query).data()).length) / pagination),
			user: req.session.user,
			new_flow: new_flow,
			message: message,
			currentUrl: req.path,
		});
	} else {
		res.redirect('/flows/'+new_flow.id); //
	}
});

router.get('/flows/:flow_id([0-9a-z\-]+)/remove', Auth, function(req, res) {
	var flow_id = req.params.flow_id;
	flows	= db.getCollection('flows');
	if ( flow_id !== undefined ) {
		var queryF = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : flow_id },
			]
		};
		var json = flows.chain().find(queryF).limit(1).data();//.remove()
		if ( json.length != 0 ) {
			flows.chain().find(queryF).limit(1).remove().data();//
			//TODO: Remove also data from the flow
			req.session.message = {type: 'success', value: 'Flow '+flow_id+' and all its data has successfully been removed.'};
			res.redirect('/flows');
		} else {
			req.session.message = {type: 'danger', value: 'Flow '+flow_id+' has not been removed, it remain unfound.'};
			res.redirect('/flows');
		}
	} else {
		req.session.message = {type: 'danger', value: 'Flow '+flow_id+' has not been removed, it remain unfound.'};
		res.redirect('/flows');
	}
});

/* ACCOUNT */
router.get('/account/profile', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	tokens	= db.getCollection('tokens');
	rules	= dbRules.getCollection('rules');
	dashboards= dbDashboards.getCollection('dashboards');
	//qt		= dbQuota.getCollection('quota');
	snippets= dbSnippets.getCollection('snippets');

	var queryO = { 'user_id' : req.session.user.id };
	var queryF = { 'user_id' : req.session.user.id };
	var queryT = { '$and': [
      	           {'user_id' : req.session.user.id},
      	           {'token': { '$ne': '' }},
    	           //{'key': { '$ne': undefined }},
    	           //{'secret': { '$ne': undefined }},
    			]};
	var queryR = { 'user_id' : req.session.user.id };
	var queryS = { 'user_id' : req.session.user.id };
	var queryD = { 'user_id' : req.session.user.id };
	var queryQ = { '$and': [
     	           {'user_id' : req.session.user.id},
    	           {'date': { '$gte': moment().subtract(7, 'days').format('x') }},
    			]};

	var options = {
	  url: 'http://en.gravatar.com/' + req.session.user.mail_hash + '.json',
	  headers: {
	    'User-Agent': 'Mozilla/5.0 Gecko/20100101 Firefox/44.0'
	  }
	};
	request(options, function(error, response, body) {
		if ( !error && response.statusCode != 404 ) {
			var f = (flows.chain().find(queryF).data());
			
			var query = squel.select()
			.field('*')
			.from('data')
			.limit(15)
			.offset(1)
			.order('time', false)
			;
			
			var flowsList="";
			var lastPoints = Array();
			f.forEach(function(flow, i) {
				if (i != 0) { flowsList += " OR "; }
				flowsList += "flow_id='"+flow.id+"'";
			});
			if (flowsList == "") { flowsList = "flow_id='null non set'" };
			query.where(flowsList);
			query = query.toString();
			console.log(query);
			dbInfluxDB.query(query).then(data => {
				if ( data.length > 0 ) {
					data.map(function(d) {
						var v;
						if (d.valueFloat!==null) {
							v = d.valueFloat;
						} else if (d.valueInteger!==null) {
							v = d.valueInteger;
						} else if (d.valueString!==null) {
							v = d.valueString;
						} else {
							v = d.value;
						}
						var point = {flow_id: d.flow_id, time: d.time, value: v, text: d.text,};
						lastPoints.push(point);
					});

					var query = squel.select()
						.field('count(url)')
						.from('quota7d.requests')
						.where('user_id=?', req.session.user.id)
						.where('time>now() - 7d')
						.limit(1)
						.toString();
					dbInfluxDB.query(query).then(data => {
						//console.log(query);
						//console.log(data[0]);
						//console.log(i);
						//console.log((quota[req.user.role]).calls);
						var i = data[0]!==undefined?data[0].count:0;
	
						//console.log(lastPoints);
						res.render('account/profile', {
							title : 'My Profile',
							objects : ((objects.chain().find(queryO).data()).length),
							lastPoints : lastPoints,
							flows : f.length,
							rules : (rules.chain().find(queryR).data().length),
							snippets : (snippets.chain().find(queryS).data().length),
							dashboards : (dashboards.chain().find(queryD).data().length),
							tokens : (tokens.chain().find(queryT).data()),
							calls : i,
							quota : (quota[req.session.user.role]),
							user : req.session.user,
							currentUrl: req.path,
							gravatar : JSON.parse(body),
						});
					});
				} else {
					console.log('ERRORRRR: no data');

					res.render('account/profile', {
						title : 'My Profile',
						objects : ((objects.chain().find(queryO).data()).length),
						lastPoints : null,
						flows : f.length,
						rules : (rules.chain().find(queryR).data().length),
						snippets : (snippets.chain().find(queryS).data().length),
						dashboards : (dashboards.chain().find(queryD).data().length),
						tokens : (tokens.chain().find(queryT).data()),
						calls : 0,// TODO
						quota : (quota[req.session.user.role]),
						user : req.session.user,
						currentUrl: req.path,
						gravatar : JSON.parse(body),
					});
				}
			}).catch(err => {
				console.log('ERRORRRR: '+err);

				res.render('account/profile', {
					title : 'My Profile',
					objects : ((objects.chain().find(queryO).data()).length),
					lastPoints : null,
					flows : f.length,
					rules : (rules.chain().find(queryR).data().length),
					snippets : (snippets.chain().find(queryS).data().length),
					dashboards : (dashboards.chain().find(queryD).data().length),
					tokens : (tokens.chain().find(queryT).data()),
					calls : 0,// TODO
					user : req.session.user,
					currentUrl: req.path,
					gravatar : JSON.parse(body),
				});
			});
		} else {
			console.log('ERRORRRR: Not connected');

			res.render('account/profile', {
				title : 'My Profile',
				objects : ((objects.chain().find(queryO).data()).length),
				lastPoints : null,
				flows : ((flows.chain().find(queryF).data()).length),
				rules : (rules.chain().find(queryR).data().length),
				snippets : (snippets.chain().find(queryS).data().length),
				dashboards : (dashboards.chain().find(queryD).data().length),
				tokens : (tokens.chain().find(queryT).data()),
				calls : 0,// TODO
				user : req.session.user,
				currentUrl: req.path,
				gravatar : null,
			});
		}
	});
});
router.get('/account/register', function(req, res) {
	res.render('register', {
		title : 'Register',
		currentUrl: req.path,
		user: req.session.user
	});
});

router.post('/account/register', function(req, res) {
	users	= db.getCollection('users');
	if ( !validateEmail(req.body.email) ) {
		res.render('register', {
			title : 'Register',
			user: req.session.user,
			currentUrl: req.path,
			message: {type: 'danger', value: 'Please verify your email address!'}
		});
	}
	
	if ( users.chain().find({email: req.body.email,}).data().length > 0 ) {
		res.render('register', {
			title : 'Register',
			user: req.session.user,
			currentUrl: req.path,
			message: {type: 'danger', value: 'Your account has already been created. Please follow the <a href="/account/forgot-password">instructions to reset your password</a> if you forgot it.',}
		});
	} else {
		var my_id = uuid.v4();
		var token = passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.');
		var new_user = {
			id:					my_id,
			firstName:			req.body.firstName!==undefined?req.body.firstName:'',
			lastName:			req.body.lastName!==undefined?req.body.lastName:'',
			email:				req.body.email!==undefined?req.body.email:'',
			role:				'free', // no admin creation from the Front-End dashboard
			token:				token,
			subscription_date:  moment().format('x'),
		};
		if ( new_user.email && new_user.id ) {
			users.insert(new_user);
			events.add('t6App', 'user register', new_user.id);
			var new_token = {
					user_id:			new_user.id,
					token:				token,
			        expiration:			'',
			};
			//var tokens	= db.getCollection('tokens');
			//tokens.insert(new_token);
			
			res.render('emails/welcome', {user: new_user, token: new_token.token}, function(err, html) {
				var to = new_user.firstName+' '+new_user.lastName+' <'+new_user.email+'>';
				var mailOptions = {
					from: from,
					bcc: bcc!==undefined?bcc:null,
					to: to,
					subject: 'Welcome to t6',
					text: 'Html email client is required',
					html: html
				};
				transporter.sendMail(mailOptions, function(err, info){
				    if( err ){
						var err = new Error('Internal Error');
						err.status = 500;
						res.status(err.status || 500).render(err.status, {
							title : 'Internal Error '+process.env.NODE_ENV,
							user: req.session.user,
							currentUrl: req.path,
							err: err,
						});
				    } else {
				    	events.add('t6App', 'user welcome mail', new_user.id);
				    	res.render('account/login', {
							title : 'Login to t6',
							user: req.session.user,
							currentUrl: req.path,
							message: {type: 'success', value: 'Account created successfully. Please, check your inbox!'}
						});
				    };
				});
			});
			
		} else {
			res.render('register', {
				title : 'Register',
				user: req.session.user,
				currentUrl: req.path,
				message: {type: 'danger', value: 'Please, give me your name!'}
			});
		};
	};
});

router.get('/account/login', function(req, res) {
	var message = req.session.message!==null?req.session.message:null;
	req.session.message = null; // Force to unset
	res.render('account/login', {
		title : 'Log-in',
		currentUrl: req.path,
		message: message,
		user: req.session.user
	});
});

router.get('/account/forgot-password', function(req, res) {
	res.render('account/forgot-password', {
		title : 'Forgot your password',
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get('/account/reset-password/:token([0-9a-z\-\.]+)', function(req, res) {
	users	= db.getCollection('users');
	var token = req.params.token;
	var query = { 'token': token };
	var user = (users.chain().find(query).data())[0];
	
	if ( user ) {
		res.render('account/reset-password', {
			title : 'Reset your password',
			currentUrl: req.path,
			token: token,
			user: user
		});
	} else {
		req.session.message = {type: 'danger', value: 'Your token is invalid!'};
		res.redirect('/account/forgot-password/');
	}
});

router.post('/account/reset-password/:token([0-9a-z\-\.]+)', function(req, res) {
	users	= db.getCollection('users');
	var token = req.params.token;
	var password = req.body.password;
	var password2 = req.body.password2;
	var query = { 'token': token };
	var user = (users.chain().find(query).data())[0];
	
	if ( password == password2 ) {
		user.password = md5(password);
		user.passwordLastUpdated = parseInt(moment().format('x'));
		user.token = null;
		users.update(user);
		db.save();
		events.add('t6App', 'user reset password', user.id);
		req.session.message = {type: 'success', value: 'Password has been changed! Please sign-in with your new password.'};
		res.redirect('/account/login');
	} else {
		res.render('account/reset-password', {
			title : 'Reset your password',
			currentUrl: req.path,
			message: {type: 'danger', value: 'Password does not match!'},
			token: token,
			user: user
		});
	}
});

router.post('/account/forgot-password', function(req, res) {
	users	= db.getCollection('users');
	var query = { 'email': req.body.email };
	var user = (users.chain().find(query).data())[0];
	if ( user ) {
		var token = passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.');
		user.token = token;
		users.update(user);
		db.save();
		
		res.render('emails/forgot-password', {user: user, token: token}, function(err, html) {
			var to = user.firstName+' '+user.lastName+' <'+user.email+'>';
			var mailOptions = {
				from: from,
				bcc: bcc!==undefined?bcc:null,
				to: to,
				subject: 'Reset your password to t6',
				text: 'Html email client is required',
				html: html
			};
			transporter.sendMail(mailOptions, function(err, info){
			    if( err ){
					var err = new Error('Internal Error');
					err.status = 500;
					res.status(err.status || 500).render(err.status, {
						title : 'Internal Error',
						user: user,
						currentUrl: req.path,
						err: err
					});
			    } else {
					events.add('t6App', 'user forgot password mail', user.id);
			    	res.render('account/login', {
					title : 'Login to t6',
					user: user,
					currentUrl: req.path,
					message: {type: 'success', value: 'Instructions has been sent to your email. Please, check your inbox!'}
				});
			    }
			});
		});
	} else {
    	res.render('account/forgot-password', {
			title : 'Forgot your password',
			user: req.session.user,
			currentUrl: req.path,
			message: {type: 'danger', value: 'No email has been found with that email address!'}
		});
	}
});

router.get('/account/logout', function(req, res) {
	req.session.destroy();
	req.session = undefined;
	delete req.session;
	res.redirect('back');
});

router.post('/account/login', Auth, function(req, res) {
	if ( req.session.user ) {
		events.add('t6App', 'user POST login', req.session.user.id);
		// Set geoIP to User
		var geo = geoip.lookup(req.ip);
		
		users	= db.getCollection('users');
		var u = users.chain().find({id: req.session.user.id,}).limit(1).data();
		if ( u[0].location === undefined || u[0].location === null ) {
			u[0].location = {geo: geo, ip: req.ip,};
		}
		users.update(u);
		db.save();
		
		//console.log(req.session.user);
		if ( req.url == "/account/login" ) {
		//res.redirect('/dashboards');
			res.redirect('/account/profile');
		} else {
			res.redirect('back');
		}
	}
});

/* RULES */
router.get('/decision-rules', Auth, function(req, res) {
	rules = dbRules.getCollection("rules");
	var queryR = { 'user_id': req.session.user.id, };
	var r = rules.chain().find(queryR).simplesort('on', 'priority', 'name').data();
	res.render('rules/rules', {
		title : 'Decision Rules',
		user: req.session.user,
		currentUrl: req.path,
		rules_length: r.length,
		rules: r,
		quota : (quota[req.session.user.role]),
	});
});

router.post('/decision-rules/save-rule/:rule_id([0-9a-z\-]+)', Auth, function(req, res) {
	/* no put? */
	var rule_id = req.params.rule_id;
	if ( !rule_id || !req.body.name ) {
		res.status(412).send(new ErrorSerializer({'id': 1009,'code': 412, 'message': 'Precondition Failed',}).serialize());
	} else {
		rules = dbRules.getCollection("rules");
		var queryR = {
			'$and': [
						{ 'user_id': req.session.user.id, },
						{ 'id': rule_id, },
					]
				};
		var rule = rules.findOne(queryR);
		if ( !rule ) {
			res.status(404).send(new ErrorSerializer({'id': 1006,'code': 404, 'message': 'Not Found'}).serialize());
		} else {
			rule.name			= req.body.name;
			rule.on				= req.body.on;
			rule.priority		= req.body.priority;
			rule.consequence	= req.body.consequence;
			rule.condition		= req.body.condition;
			rule.flow_control	= req.body.flow_control;
			rules.update(rule);
			res.status(200).send({ 'code': 200, message: 'Successfully updated', rule: rule });
		};
	};
});

/* GENERIC */
router.get('/search', Auth, function(req, res) {
	res.render('search', {
		title : 'Search',
		objects: [],
		flows: [],
		snippets: [],
		dashboards: [],
		currentUrl: req.path,
		user: req.session.user
	});
});

router.post('/search', Auth, function(req, res) {
	objects	= db.getCollection('objects');
	flows	= db.getCollection('flows');
	snippets	= dbSnippets.getCollection('snippets');
	dashboards	= dbDashboards.getCollection('dashboards');
	if (!req.body.q) {
		res.render('search', {
			title : 'Search results',
			objects: [],
			flows: [],
			snippets: [],
			dashboards: [],
			currentUrl: req.path,
			user: req.session.user
		});
	} else {
		var queryO = {
				'$and': [
							{ 'user_id': req.session.user.id },
							{ 'name': {'$regex': [req.body.q, 'i'] } }
						]
					};
		var queryF = {
				'$and': [
							{ 'user_id': req.session.user.id },
							{ 'name': {'$regex': [req.body.q, 'i'] } }
						]
					};
		var queryS = {
				'$and': [
							{ 'user_id': req.session.user.id },
							{ 'name': {'$regex': [req.body.q, 'i'] } }
						]
					};
		var queryD = {
				'$and': [
							{ 'user_id': req.session.user.id },
							{ 'name': {'$regex': [req.body.q, 'i'] } }
						]
					};
		res.render('search', {
			title : 'Search results',
			objects: objects.find(queryO),
			flows: flows.find(queryF),
			snippets: snippets.find(queryS),
			dashboards: dashboards.find(queryD),
			q:req.body.q,
			user: req.session.user,
			currentUrl: req.path,
			nl2br: nl2br
		});
	}
});

router.get('/about', function(req, res) {
	res.redirect('/privacy-policies');
});

router.get('/privacy-policies', function(req, res) {
	res.render('privacy-policies', {
		title : 'Privacy Policies',
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get('/contact', function(req, res) {
	res.render('contact', {
		title : 'Contact us',
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get('/mail/welcome', function(req, res) {
	var fake_user = req.session.user;
	var fake_token = {
		user_id:			fake_user.id,
		token:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
        expiration:			'',
	};
	res.render('emails/welcome', {
		title : '',
		baseUrl: baseUrl,
		baseUrlCdn: baseUrlCdn,
		user: fake_user,
		currentUrl: req.path,
		token: fake_token.token,
	});
});

router.get('/mail/forgot-password', function(req, res) {
	var fake_user = req.session.user;
	var fake_token = {
		user_id:			fake_user.id,
		token:				passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
        expiration:			'',
	};
	res.render('emails/forgot-password', {
		title : '',
		baseUrl: baseUrl,
		baseUrlCdn: baseUrlCdn,
		user: fake_user,
		currentUrl: req.path,
		token: fake_token.token,
	});
});

router.get('/mail/loginfailure', function(req, res) {
	var geo = geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{};
	geo.ip = req.ip;
	res.render('emails/loginfailure', {
		title : '',
		baseUrl: baseUrl,
		baseUrlCdn: baseUrlCdn,
		currentUrl: req.path,
		device: device(res.locals.session['user-agent']),
		geoip: geo,
	});
});

router.get('/features/api', function(req, res) {
	res.redirect('/docs');
});

router.get('/features/:feature([0-9a-z\-]+)', function(req, res) {
	var feature = req.params.feature;
	res.render('features/'+feature, {
		title : 't6 Feature',
		currentUrl: req.path,
		user: req.session.user
	});
});

router.get('/plans', function(req, res) {
	res.render('plans', {
		title : 't6 Plans',
		currentUrl: req.path,
		quota: quota,
		user: req.session.user
	});
});

router.get('/status', function(req, res) {
	res.render('status', {
		title : 't6 API Status',
		currentUrl: req.path,
		quota: quota,
		user: req.session.user
	});
});

router.get('/unauthorized', function(req, res) {
	res.render('unauthorized', {
		title : 'Unauthorized, Please log-in again to t6',
		currentUrl: req.path,
		user: req.session.user
	});
});

/* DASHBOARDS */
router.get('/dashboards', Auth, function(req, res) {
	dashboards	= dbDashboards.getCollection('dashboards');
	//qt		= dbQuota.getCollection('quota');
	var query = { 'user_id': req.session.user.id };
	var pagination=12;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var message = req.session.message!==null?req.session.message:null;
	req.session.message = null; // Force to unset

	var d = dashboards.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data();
	if ( d.length == 0 ) {
		res.redirect('/dashboards/add');
	} else {
		var dashboards_length = (dashboards.chain().find(query).data()).length;
		res.render('dashboards/dashboards', {
			title : 'My Dashboards',
			dashboards: d,
			dashboards_length: dashboards_length,
			page: req.query.page,
			pagenb: Math.ceil(dashboards_length/pagination),
			user: req.session.user,
			currentUrl: req.path,
			message: message,
			quota : (quota[req.session.user.role])
		});
	}
});

router.get('/dashboards/add', Auth, function(req, res) {
	dashboards	= dbDashboards.getCollection('dashboards');
	snippets	= dbSnippets.getCollection('snippets');
	var query = { 'user_id': req.session.user.id };
	var d = dashboards.chain().find(query).sort(alphaSort).data();
	var s = snippets.chain().find(query).sort(alphaSort).data();
	res.render('dashboards/add', {
		title : 'Add a Dashboard',
		message: {},
		dashboards: d,
		new_dashboard: {snippets:[]},
		user: req.session.user,
		snippets: s,
		nl2br: nl2br,
		currentUrl: req.path,
		striptags: striptags
	});
});

router.get('/dashboards/(:dashboard_id)/edit', Auth, function(req, res) {
	var dashboard_id = req.params.dashboard_id;
	dashboards	= dbDashboards.getCollection('dashboards');

	if ( dashboard_id !== undefined ) {
		snippets	= dbSnippets.getCollection('snippets');
		var s = snippets.chain().find({ 'user_id': req.session.user.id }).sort(alphaSort).data();
		var queryD = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : dashboard_id },
			]
		};
		var json = dashboards.findOne(queryD);
		//console.log(json);
		if ( json ) {
			res.render('dashboards/edit', {
				title : 'Edit Dashboard '+json.name,
				message: {},
				new_dashboard: json,
				user: req.session.user,
				snippets: s,
				nl2br: nl2br,
				currentUrl: req.path,
				striptags: striptags
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.post('/dashboards/(:dashboard_id)/edit', Auth, function(req, res) {
	var dashboard_id = req.params.dashboard_id;
	dashboards	= dbDashboards.getCollection('dashboards');
	if ( dashboard_id !== undefined ) {
		var queryD = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : dashboard_id },
			]
		};
		var json = (dashboards.chain().find(queryD).limit(1).data())[0];
		//console.log(json);
		
		if ( json ) {
			var linked_snippets = req.body['snippets[]']!==undefined?req.body['snippets[]']:new Array();
			if ( typeof linked_snippets !== 'object' ) linked_snippets = new Array(linked_snippets);
			json.name 			= req.body.name!==undefined?req.body.name:json.name;
			json.description	= req.body.description!==undefined?req.body.description:json.description;
			json.layout			= req.body.layout!==undefined?req.body.layout:null;
			json.snippets		= linked_snippets;
			json.user_id		= req.session.user.id;
			
			dashboards.update(json);
			db.save();
			
			res.redirect('/dashboards/'+dashboard_id);
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.post('/dashboards/add', Auth, function(req, res) {
	dashboards	= dbDashboards.getCollection('dashboards');
	snippets	= dbSnippets.getCollection('snippets');
	var error = undefined;
	var user_id = req.bearer!==undefined?req.bearer.user_id:req.session.bearer!==undefined?req.session.bearer.user_id:null;
	var message = '';
	var linked_snippets = req.body['snippets[]']!==undefined?req.body['snippets[]']:new Array();
	if ( typeof linked_snippets !== 'object' ) linked_snippets = new Array(linked_snippets);

	var queryQ = { '$and': [  {'user_id' : user_id} ]};
	var dashboard_id = uuid.v4();
	var new_dashboard = {
		id:			dashboard_id,
		user_id:		user_id,
		snippets:		linked_snippets,
		layout: 		req.body.layout!==undefined?req.body.layout:null,
		name:			req.body.name!==undefined?req.body.name:null,
		description:	req.body.description!==undefined?req.body.description:null,
	};
	//console.log(new_dashboard);
	var i = (dashboards.find(queryQ)).length;
	if( i >= (quota[req.session.user.role]).dashboards ) {
		message = {type: 'danger', value: 'Over Quota!'};
		error = true;
	} else {
		if ( new_dashboard.name && new_dashboard.user_id ) {
			dashboards.insert(new_dashboard);
			db.save();
			message = {type: 'success', value: 'Dashboard <a href="/dashboards/'+new_dashboard.id+'">'+new_dashboard.name+'</a> successfully added.'};
			req.session.message = message;
		} else {
			message = {type: 'danger', value: 'Please give a name to your Dashboard!'};
			error = true;
		}
	}
	var query = { 'user_id': req.session.user.id };
	var pagination=12;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var d = dashboards.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data();
	var s = snippets.chain().find(query).sort(alphaSort).data();
	
	if ( error ) {
		res.render('dashboards/add', {
			title : 't6 Dashboards',
			dashboards: d,
			new_dashboard: new_dashboard,
			page: req.query.page,
			pagenb: Math.ceil(((dashboards.chain().find(query).data()).length) / pagination),
			user: req.session.user,
			snippets: s,
			message: message,
			currentUrl: req.path,
		});
	} else {
		res.redirect('/dashboards/'); //+new_dashboard.id
	}
});

router.post('/dashboards/(:dashboard_id)/setName', Auth, function(req, res) {
	var dashboard_id = req.params.dashboard_id;
	dashboards	= dbDashboards.getCollection('dashboards');
	if ( dashboard_id !== undefined && req.body.name == "name" && req.body.value !== undefined ) {
		var queryD = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : dashboard_id },
			]
		};
		var upd_dashboard = dashboards.findOne(queryD);
		if ( upd_dashboard ) {
			upd_dashboard.name = req.body.value;
			dashboards.update(upd_dashboard);
			db.save();
			res.status(200).send({ 'code': 200, message: 'Successfully updated', dashboard: (upd_dashboard).name });
		} else {
			var err = new Error('Not Found');
			err.status = 400;
			res.status(err.status || 500).render(err.status, {
				title : 'Error on upd_dashboard',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.post('/dashboards/(:dashboard_id)/setDescription', Auth, function(req, res) {
	var dashboard_id = req.params.dashboard_id;
	dashboards	= dbDashboards.getCollection('dashboards');
	if ( dashboard_id !== undefined && req.body.name == "description" && req.body.value !== undefined ) {
		var queryD = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : dashboard_id },
			]
		};
		var upd_dashboard = dashboards.findOne(queryD);
		if ( upd_dashboard ) {
			upd_dashboard.description = req.body.value;
			if ( dashboards.update(upd_dashboard) ) {
				db.save();
				res.status(200).send({ 'code': 200, message: 'Successfully updated', dashboard: (upd_dashboard).description });
			} else {
				var err = new Error('1 Internal Server Error');
				err.status = 500;
				res.status(err.status || 500).send(err.status, {
					title : 'Error on update/save',
					user: req.session.user,
					currentUrl: req.path,
					err: err
				});
			}
		} else {
			var err = new Error('2 Internal Server Error');
			console.log(err);
			err.status = 500;
			res.status(err.status || 500).send(err.status, {
				title : 'Error on upd_dashboard',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.get('/dashboards/(:dashboard_id)/remove', Auth, function(req, res) {
	var dashboard_id = req.params.dashboard_id;
	if ( dashboard_id !== undefined ) {
		var queryD = {
			'$and': [
					{ 'user_id': req.session.user.id },
					{ 'id' : dashboard_id },
			]
		};
		dashboards	= dbDashboards.getCollection('dashboards');
		var json = dashboards.chain().find(queryD).limit(1).data();
		if ( json.length != 0 ) {
			dashboards.chain().find(queryD).limit(1).remove();
			dbDashboards.save();
			req.session.message = {type: 'success', value: 'Dashboard '+dashboard_id+' has successfully been removed.'};
			res.redirect('/dashboards');
		} else {
			req.session.message = {type: 'danger', value: 'Dashboard '+dashboard_id+' has not been removed, it remain unfound.'};
			res.redirect('/dashboards');
		}
	} else {
		req.session.message = {type: 'danger', value: 'Dashboard '+dashboard_id+' has not been removed, it remain unfound.'};
		res.redirect('/dashboards');
	}
});

router.get('/dashboards/?(:dashboard_id)?', Auth, function(req, res) {
	var dashboard_id = req.params.dashboard_id;
	var layout = req.query.layout;
	dashboards	= dbDashboards.getCollection('dashboards');
	if ( dashboard_id !== undefined ) {
		var queryD = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : dashboard_id },
			]
		};
		var json = {
			dashboard: dashboards.findOne(queryD)
		};
		if ( json.dashboard ) {
			if ( (layout != json.dashboard.layout) && ( layout === 'onecolumn' || layout === 'twocolumnsright' || layout === 'twocolumnsleft') ) { //TODO: Add better sanity-check here !!!!
				/* Update layout if necessary */
				json.dashboard.layout = layout;
				if ( dashboards.update(json.dashboard) ) {
					db.save();
					req.session.message = {type: 'success', value: 'Successfully switched layout'};
				} else {
					req.session.message = {type: 'danger', value: 'Error on update/save'};
				}
			} else if ( layout !== undefined ) {
				req.session.message = {type: 'danger', value: 'Error please check your data'};
			}
			
			//var s = (json.eqJoin(snippets.chain(), 'user_id', 'id').data())[0];
			// TODO, but let's do it simple for now:
			var snippetHtml = '';
			snippets = dbSnippets.getCollection('snippets');
			for( var i=0; i<(json.dashboard.snippets).length; i++ ) {
				var s = snippets.findOne({id: json.dashboard.snippets[i]});
				if ( s ) {
	 				var snippet = {
						title		: s.name!==undefined?s.name:'',
						type		: s.type,
						currentUrl	: req.path,
						user		: req.session.user,
						snippet		: s,
						graph_title:		req.query.title!==undefined?req.query.title:'Default Title',
						graph_startdate:	moment(req.query.startdate!==undefined?req.query.startdate:moment().subtract(1, 'd'), 'x').format('DD/MM/YYYY'),
						graph_startdate2:	req.query.startdate!==undefined?req.query.startdate:moment().subtract(1, 'd').format('x'),
						graph_enddate:		moment(req.query.enddate!==undefined?req.query.enddate:moment().add(1, 'd'), 'x').format('DD/MM/YYYY'),
						graph_enddate2:		req.query.enddate!==undefined?req.query.enddate:moment().add(1, 'd').format('x'),
						graph_max:			req.query.max!==undefined?req.query.max:'50',
						graph_ttl:			req.query.graph_ttl!==undefined?req.query.graph_ttl:'',
						graph_weekendAreas:	req.query.weekendAreas!==undefined?req.query.weekendAreas:'',
						graph_color:		req.query.color!==undefined?req.query.color:'#edc240',
						graph_fill:			req.query.fill!==undefined?req.query.fill:'false',
						graph_autorefresh:	req.query.autorefresh!==undefined?req.query.autorefresh:'false',
						graph_chart_type:	req.query.chart_type!==undefined?req.query.chart_type:'bars',
						graph_layout:		req.query.layout!==undefined?req.query.layout:12,
					};
					snippet.type = snippet.type!==undefined?snippet.type:'valuedisplay';
					res.render('./snippets/'+snippet.type, snippet, function(err, html) {
						if( !err ) snippetHtml += html;
					});
				} // Snippet not Found
			};
			// TODO Add more secure way to check layout value
			var layout = json.dashboard.layout!==undefined?json.dashboard.layout:'onecolumn';
			var message = req.session.message!==null?req.session.message:null;
			req.session.message = null; // Force to unset
			res.render('dashboards/'+layout, {
				title : 'Dashboard',
				user: req.session.user,
				dashboard: json.dashboard,
				snippetHtml: snippetHtml,
				currentUrl: req.path,
				nl2br: nl2br,
				version: version,
				message: message
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	}
});

/* SNIPPETS */
router.get('/snippets', Auth, function(req, res) {
	snippets	= dbSnippets.getCollection('snippets');
	//qt		= dbQuota.getCollection('quota');
	var query = { 'user_id': req.session.user.id };
	var pagination=12;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var message = req.session.message!==null?req.session.message:null;
	req.session.message = null; // Force to unset

	var s = snippets.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data();
	if ( s.length == 0 ) {
		res.redirect('/snippets/add');
	} else {
		var snippets_length = (snippets.chain().find(query).data()).length;
		res.render('snippets/snippets', {
			title : 'My Snippets',
			snippets: s,
			snippets_length: snippets_length,
			page: req.query.page,
			pagenb: Math.ceil(snippets_length/pagination),
			user: req.session.user,
			currentUrl: req.path,
			message: message,
			quota : (quota[req.session.user.role])
		});
	}
});

router.get('/snippets/add', Auth, function(req, res) {
	snippets	= dbSnippets.getCollection('snippets');
	flows		= db.getCollection('flows');
	var query = { 'user_id': req.session.user.id };
	var f = flows.chain().find(query).sort(alphaSort).data();
	res.render('snippets/add', {
		title : 'Add a Snippet',
		message: {},
		flows: f,
		user: req.session.user,
		new_snippet: {},
		nl2br: nl2br,
		currentUrl: req.path,
		striptags: striptags
	});
});

router.post('/snippets/add', Auth, function(req, res) {
	var user_id = req.bearer!==undefined?req.bearer.user_id:req.session.bearer!==undefined?req.session.bearer.user_id:null;
	snippets	= dbSnippets.getCollection('snippets');
	flows		= db.getCollection('flows');
	var query = { 'user_id': req.session.user.id };
	var f = flows.chain().find(query).sort(alphaSort).data();
	var queryS = { '$and': [  {'user_id' : user_id} ]};
	var message = '';
	var error = undefined;
	if ( false || !user_id ) { // useless :-)
		res.status(412).send(new ErrorSerializer({'id': 1909,'code': 412, 'message': 'Precondition Failed'}).serialize());
	} else {
		var flows;
		if( req.body['flows[]'] instanceof Array ) {
			flows = req.body['flows[]']!==undefined?req.body['flows[]']:new Array();
		} else {
			flows = [req.body['flows[]']!==undefined?req.body['flows[]']:new Array()];
		}
		
		var snippet_id = uuid.v4();
		var new_snippet = {
			id:				snippet_id,
			user_id:		user_id,
			type:			req.body.type!==undefined?req.body.type:'valuedisplay',
			name:			req.body.name!==undefined?req.body.name:null,
			icon:			req.body.icon!==undefined?req.body.icon:null,
			color:			req.body.color!==undefined?req.body.color:null,
			flows:			flows,
			p:				{
				datatype: req.body['p[datatype]'],
				unit: req.body['p[unit]'],
				startdate: req.body['p[startdate]'],
				enddate: req.body['p[enddate]'],
				background: req.body['p[background]'],
				lineColor: req.body['p[lineColor]'],
				fillColor: req.body['p[fillColor]'],
				normalRangeColor: req.body['p[normalRangeColor]']
			}
		};
		//console.log(new_snippet);
		//res.status(200).send(new_snippet);
		var i = (snippets.find(queryS)).length;
		if( i >= (quota[req.session.user.role]).snippets ) {
			message = {type: 'danger', value: 'Over Quota!'};
			req.session.message = message;
			error = true;
		} else {
			if ( new_snippet.name ) {
				snippets.insert(new_snippet);
				db.save();
				message = {type: 'success', value: 'Snippet <a href="/snippets/'+new_snippet.id+'">'+new_snippet.name+'</a> successfully added to your shelves.'};
				req.session.message = message;
			} else {
				message = {type: 'danger', value: 'Please give a name to your Snippet!'};
				req.session.message = message;
				error = true;
			}
		}
		if ( error ) {
			var query = { 'user_id': req.session.user.id };
			var pagination=12;
			req.query.page=req.query.page!==undefined?req.query.page:1;
			var offset = (req.query.page -1) * pagination;
			res.render('snippets/add', {
				title : 't6 Snippets',
				snippets: snippets.chain().find(query).sort(alphaSort).offset(offset).limit(pagination).data(),
				flows: f,
				new_snippet: new_snippet,
				page: req.query.page,
				pagenb: Math.ceil(((snippets.chain().find(query).data()).length) / pagination),
				user: req.session.user,
				message: req.session.message,
				currentUrl: req.path,
			});
		} else {
			res.redirect('/snippets/'); //+new_snippet.id
		}
	}
});

router.get('/snippets/:snippet_id([0-9a-z\-]+)', function(req, res) {
	var snippet_id = req.params.snippet_id;
	snippets	= dbSnippets.getCollection('snippets');

	if ( snippet_id !== undefined ) {
		// TODO: If req.session && (req.session.user.id == snipper.user_id) ==> permission must be > 4xx
		// TODO: If req.session && (req.session.user.id != snipper.user_id) ==> permission must be > xx4
		//var queryS = { '$and': [ { 'user_id': req.session.user.id }, { 'id' : snippet_id }, ] };
		var queryS = { 'id' : snippet_id };
		var json = (snippets.chain().find(queryS).limit(1).data())[0];
		if ( json ) {
			res.render('snippets/'+json.type, {
				title :				json.name,
				currentUrl:			req.path,
				user:				req.session.user,
				snippet:			json,
				graph_title:		req.query.title!==undefined?req.query.title:json.name,
				graph_startdate:	moment(req.query.startdate!==undefined?req.query.startdate:moment().subtract(1, 'd'), 'x').format('DD/MM/YYYY'),
				graph_startdate2:	req.query.startdate!==undefined?req.query.startdate:moment().subtract(1, 'd').format('x'),
				graph_enddate:		moment(req.query.enddate!==undefined?req.query.enddate:moment().add(1, 'd'), 'x').format('DD/MM/YYYY'),
				graph_enddate2:		req.query.enddate!==undefined?req.query.enddate:moment().add(1, 'd').format('x'),
				graph_max:			req.query.max!==undefined?req.query.max:'50',
				graph_ttl:			req.query.graph_ttl!==undefined?req.query.graph_ttl:'',
				graph_weekendAreas:	req.query.weekendAreas!==undefined?req.query.weekendAreas:'',
				graph_color:		req.query.color!==undefined?req.query.color:'#edc240',
				graph_fill:			req.query.fill!==undefined?req.query.fill:'false',
				graph_autorefresh:	req.query.autorefresh!==undefined?req.query.autorefresh:'false',
				graph_chart_type:	req.query.chart_type!==undefined?req.query.chart_type:'bars',
				graph_layout:		req.query.layout!==undefined?req.query.layout:12,
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
		
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.get('/snippets/:snippet_id([0-9a-z\-]+)/remove', Auth, function(req, res) {
	var snippet_id = req.params.snippet_id;
	snippets	= dbSnippets.getCollection('snippets');
	if ( snippet_id !== undefined ) {
		var queryS = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'id' : snippet_id },
			]
		};
		var json = snippets.chain().find(queryS).limit(1).data();
		if ( json.length != 0 ) {
			snippets.chain().find(queryS).limit(1).remove().data();
			//TODO: We should also remove Snippets instances on dashboards...
			req.session.message = {type: 'success', value: 'Snippet '+snippet_id+' has successfully been removed.'};
			res.redirect('/snippets');
		} else {
			req.session.message = {type: 'danger', value: 'Snippet '+snippet_id+' has not been removed, it remain unfound.'};
			res.redirect('/snippets');
		}
	} else {
		req.session.message = {type: 'danger', value: 'Snippet '+snippet_id+' has not been removed, it remain unfound.'};
		res.redirect('/snippets');
	}
});

/* API KEYS */
router.get('/keys', Auth, function(req, res) {
	tokens	= db.getCollection('tokens');
	//qt	= dbQuota.getCollection('quota');
	var query = { '$and': [
   	           {'user_id' : req.session.user.id},
 	           {'token': { '$ne': '' }},
 	           //{'key': { '$ne': undefined }},
 	           //{'secret': { '$ne': undefined }},
 			]};
	var pagination=12;
	req.query.page=req.query.page!==undefined?req.query.page:1;
	var offset = (req.query.page -1) * pagination;
	var message = req.session.message!==null?req.session.message:null;
	req.session.message = null; // Force to unset

	var t = tokens.chain().find(query).simplesort('expiration').offset(offset).limit(pagination).data();
	//console.log(t[2].permissions);
	if ( t.length == 0 ) {
		res.redirect('/keys/add');
	} else {
		var tokens_length = (tokens.chain().find(query).data()).length;
		res.render('keys/keys', {
			title : 'My Keys',
			tokens: t,
			tokens_length: tokens_length,
			page: req.query.page,
			pagenb: Math.ceil(tokens_length/pagination),
			user: req.session.user,
			currentUrl: req.path,
			message: message,
			quota : (quota[req.session.user.role])
		});

		// Find and remove expired tokens from Db
		var expired = tokens.find(
			{ '$and': [
		           {'user_id' : req.session.user.id},
		           { 'expiration' : { '$lt': moment().format('x') } },
		           { 'expiration' : { '$ne': '' } },
			]}
		);
		if ( expired ) {
			tokens.remove(expired);
			db.save();
		}
	}
});

router.get('/keys/add', function(req, res) {
	tokens	= db.getCollection('tokens');
	flows		= db.getCollection('flows');
	objects		= db.getCollection('objects');
	var query = { 'user_id': req.session.user.id };
	var t = tokens.chain().find(query).data();
	var f = flows.chain().find(query).sort(alphaSort).data();
	var o = objects.chain().find(query).sort(alphaSort).data();
	res.render('keys/add', {
		title : 'Add an API Key',
		message: {},
		tokens: t,
		flows: f,
		objects: o,
		user: req.session.user,
		new_snippet: {},
		nl2br: nl2br,
		currentUrl: req.path,
		striptags: striptags
	});
});

router.post('/keys/add', function(req, res) {
	tokens	= db.getCollection('tokens');
	flows		= db.getCollection('flows');
	var query = { 'user_id': req.session.user.id };
	var t = tokens.chain().find(query).data();
	var f = flows.chain().find(query).sort(alphaSort).data();

	var owner_permission = req.body.owner_permission!==undefined?req.body.owner_permission:'6';
	var group_permission = req.body.group_permission!==undefined?req.body.group_permission:'0';
	var other_permission = req.body.other_permission!==undefined?req.body.other_permission:'0';
	var linked_flows = req.body['flows[]']!==undefined?req.body['flows[]']:new Array();
	if( req.body['flows[]'] instanceof Array ) {
		//
	} else {
		linked_flows = [linked_flows];
	}
	var linked_objects = req.body['objects[]']!==undefined?req.body['objects[]']:new Array();
	if( req.body['objects[]'] instanceof Array ) {
		//
	} else {
		linked_objects = [linked_objects];
	}
	var expiration = req.body.expiration;
	if ( expiration == '1 hours' ) {
		expiration = moment().add(1, 'hours').format('x');
	} else if ( expiration == '7 days' ) {
		expiration = moment().add(7, 'days').format('x');
	} else if ( expiration == '1 months' ) {
		expiration = moment().add(1, 'months').format('x');
	} else {
		expiration = moment().add(1, 'hours').format('x');
	}
	var permission = owner_permission+group_permission+other_permission;
	var permissions = new Array();
	linked_flows.forEach(function(flow_id) {
		permissions.push({flow_id: flow_id, permission: permission});
	});
	var permissionsObjects = new Array();
	linked_objects.forEach(function(object_id) {
		permissionsObjects.push({object_id: object_id, permission: permission});
	});
	var new_token = {
		user_id: req.session.user.id,
		expiration: expiration,
		permissions: permissions,
		permissionsObjects: permissionsObjects,
		token: passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.'),
	};
	
	if ( tokens.insert(new_token) ) {
		req.session.message = {type: 'success', value: 'Token '+new_token.token+' has successfully been created.'};
		res.redirect('/keys/');
		//res.redirect('/keys/'+new_token.token);
	} else {
		res.render('keys/add', {
			title : 'Add an API Key',
			message: {},
			tokens: t,
			flows: f,
			user: req.session.user,
			new_snippet: {},
			nl2br: nl2br,
			currentUrl: req.path,
			striptags: striptags
		});
	}
});

router.get('/keys/:token([0-9a-z\-.]+)/edit', function(req, res) {
	var token = req.params.token;
	tokens	= db.getCollection('tokens');
	flows		= db.getCollection('flows');
	objects		= db.getCollection('objects');
	var query = { 'user_id': req.session.user.id };
	if ( token !== undefined ) {
		var queryT = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'token' : token },
			]
		};
		var json = tokens.findOne(queryT);
		var f = flows.chain().find(query).sort(alphaSort).data();
		var o = objects.chain().find(query).sort(alphaSort).data();
		//console.log(json);
		if ( json ) {
			var message = req.session.message!==null?req.session.message:message = {type: '', value: ''};
			req.session.message = null; // Force to unset
			res.render('keys/edit', {
				title : 'Edit Key '+json.token,
				token: json,
				flows: f,
				objects: o,
				message: message,
				currentUrl: req.path,
				user: req.session.user
			});
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.post('/keys/:token([0-9a-z\-.]+)/edit', function(req, res) {
	var token = req.params.token;
	if ( token !== undefined ) {
		tokens	= db.getCollection('tokens');
		var queryT = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'token' : token },
			]
		};
		var json = (tokens.chain().find(queryT).limit(1).data())[0];
		//console.log(json);
		if ( json ) {
			var owner_permission = req.body.owner_permission!==undefined?req.body.owner_permission:'6';
			var group_permission = req.body.group_permission!==undefined?req.body.group_permission:'0';
			var other_permission = req.body.other_permission!==undefined?req.body.other_permission:'0';
			var permission = owner_permission+group_permission+other_permission;
			var linked_flows = req.body['flows[]']!==undefined?req.body['flows[]']:new Array();
			json.permissions = new Array();
			if( req.body['flows[]'] instanceof Array ) {
				//
			} else {
				linked_flows = [linked_flows];
			}
			linked_flows.forEach(function(flow_id) {
				json.permissions.push({flow_id: flow_id, permission: permission});
			});
			var linked_objects = req.body['objects[]']!==undefined?req.body['objects[]']:new Array();
			json.permissionsObjects = new Array();
			if( req.body['objects[]'] instanceof Array ) {
				//
			} else {
				linked_objects = [linked_objects];
			}
			linked_objects.forEach(function(object_id) {
				json.permissionsObjects.push({object_id: object_id, permission: permission});
			});
			
			if ( req.body.expiration == '1 hours' ) {
				json.expiration = moment().add(1, 'hours').format('x');
			} else if ( req.body.expiration == '7 days' ) {
				json.expiration = moment().add(7, 'days').format('x');
			} else if ( req.body.expiration == '1 months' ) {
				json.expiration = moment().add(1, 'months').format('x');
			} else if ( req.body.expiration == 'keep' ) {
				//
			} else {
				json.expiration = moment().add(1, 'hours').format('x');
			}
			db.save();
			tokens.update(json);
			req.session.message = {type: 'success', value: 'Token '+token+' has successfully been updated.'};
			
			res.redirect('/keys/');
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.get('/keys/:token([0-9a-z\-.]+)/remove', Auth, function(req, res) {
	var token = req.params.token;
	tokens	= db.getCollection('tokens');
	if ( token !== undefined ) {
		var queryT = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'token' : token },
			]
		};
		var json = tokens.chain().find(queryT).limit(1).remove().data();
		if ( json ) {
			req.session.message = {type: 'success', value: 'Token '+token+' has successfully been revoked.'};
			res.redirect('/keys');
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

router.get('/keys/:token([0-9a-z\-.]+)/extend', Auth, function(req, res) {
	var token = req.params.token;
	tokens	= db.getCollection('tokens');
	if ( token !== undefined ) {
		var queryT = {
		'$and': [
				{ 'user_id': req.session.user.id },
				{ 'token' : token },
			]
		};
		var json = (tokens.chain().find(queryT).limit(1).data())[0];
	
		if ( json ) {
			var duration = parseInt(json.expiration - json.meta.created);
			duration = duration<(1*60*60*24*1000*(365.25/12))?duration:(1*60*60*24*1000*(365.25/12)); // Max 1 month 
			var exp = parseInt(json.expiration)+parseInt(duration);
			/*console.log("Cur Exp.: "+ json.expiration );
			console.log("Cur Exp.: "+ moment(json.expiration).format('MMMM Do YYYY, h:mm:ss a') );
			console.log("Created: "+ json.meta.created );
			console.log("Created: "+ moment(json.meta.created).format('MMMM Do YYYY, h:mm:ss a') );
			console.log("Duration: "+ duration );
			console.log("New Exp.: "+ exp );
			console.log("New Exp.: "+ moment(exp).format('MMMM Do YYYY, h:mm:ss a') );
			*/
			json.expiration	=		exp;
			tokens.update(json);
			db.save();
	
			req.session.message = {type: 'success', value: 'Token '+token+' has successfully been extended to '+moment(exp).format('MMMM Do YYYY, h:mm:ss a')};
			res.redirect('/keys');
		} else {
			var err = new Error('Not Found');
			err.status = 404;
			res.status(err.status || 500).render(err.status, {
				title : 'Not Found',
				user: req.session.user,
				currentUrl: req.path,
				err: err
			});
		}
	} else {
		var err = new Error('Not Found');
		err.status = 404;
		res.status(err.status || 500).render(err.status, {
			title : 'Not Found',
			user: req.session.user,
			currentUrl: req.path,
			err: err
		});
	}
});

/* USER ACCOUNTS */
router.get('/accounts', Auth, function(req, res) {
	if ( req.session.user.role == 'admin' ) { // TODO
		users	= db.getCollection('users');
		var query = {};
		var pagination=12;
		req.query.page=req.query.page!==undefined?req.query.page:1;
		var offset = (req.query.page -1) * pagination;
		var message = req.session.message!==null?req.session.message:null;
		req.session.message = null; // Force to unset
	
		var u = users.chain().find(query).simplesort('subscription_date', 1).offset(offset).limit(pagination).data();
		
		if ( u.length == 0 ) {
			res.redirect('/account/register');
		} else {
			var users_length = (users.chain().find(query).data()).length;
			res.render('accounts/accounts', {
				title : 'User Accounts',
				users: u,
				page: req.query.page,
				pagenb: Math.ceil(users_length/pagination),
				user: req.session.user,
				md5: md5,
				users_length: users_length,
				currentUrl: req.path,
				message: message,
			});
		}
	} else {
		//console.log(req.session.user.role);
		res.redirect('/unauthorized');
	}
});

function Auth(req, res, next) {
	users	= db.getCollection('users');
	tokens	= db.getCollection('tokens');
	flows	= db.getCollection('flows');

	var email = req.body.email;
	var password = req.body.password;
	if ( email && password ) {
		//console.log("I have an Email and a Password");
		var queryU = {
				'$and': [
							{ 'email': email },
							{ 'password': md5(password) },
							// TODO: expiration !! {'expiration': { '$gte': moment().format('x') }},
						]
					};
		var user = users.findOne(queryU);
		//console.log("User: ");
		//console.log(queryU);
		//console.log(user);
		if ( user ) {
			var SESS_ID = passgen.create(64, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.');
			//console.log("I have created a SESS_ID: "+SESS_ID);

			req.session.user = user;
			req.session.token = '';
			req.session.bearer = {user_id: user.id};
			// TODO: set permissions to 644 ; Should be 600 !!
			var permissions = new Array();
			(flows.find({'user_id':req.session.user.id})).map(function(p) {
				permissions.push( { flow_id: p.id, permission: p.permission } );
			}); // End permissions on all User Flows
			//console.log(permissions);
			
			req.session.bearer.permissions = permissions;
			req.session.user.permissions = req.session.bearer.permissions;
			req.session.user.mail_hash = md5(req.session.user.email);
			
			req.session.session_id = SESS_ID;
			//console.log(req.session);
			res.cookie('session_id', SESS_ID);
			next();
		} else {
			// Invalid Credentials
			var query = squel.select()
				.field('count(*)')
				.from(events.getMeasurement())
				.where('what=?', 'user login failure')
				.where('who=?', req.body.email)
				.where('time>now() - 1h')
				.toString()
				;
			dbInfluxDB.query(query).then(data => {
				if( data[0].count_who > 2 ) {
					var geo = geoip.lookup(req.ip)!==null?geoip.lookup(req.ip):{};
					geo.ip = req.ip;
					res.render('emails/loginfailure', {device: device(res.locals.session['user-agent']), geoip: geo}, function(err, html) {
						var to = req.body.email;
						var mailOptions = {
							from: from,
							bcc: bcc!==undefined?bcc:null,
							to: to,
							subject: 't6 warning notification',
							text: 'Html email client is required',
							html: html
						};
						transporter.sendMail(mailOptions, function(err, info){
						    if( err ){ }
						});
					});
				}
			}).catch(err => {
				console.log(err);
				//
		    });
			events.add('t6App', 'user login failure', req.body.email);
			res.redirect('/unauthorized');
		}
	} else {
		//console.log("I haven't any Key nor Secret");
		// trying to retrieve User from the session... if any...
		if ( req.session !== undefined && req.session.user !== undefined && req.session.user.id !== undefined ) {
			if( !(req.session && req.session.user) ) {				
				res.redirect('/unauthorized');
			} else {
				//console.log("I have a session_id: "+req.cookies.session_id);
				next();
			}
		} else {
			res.redirect('/unauthorized');
		}
	}
}

module.exports = router;

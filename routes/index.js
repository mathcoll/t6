'use strict';
var express = require('express');
var router = express.Router();
var ErrorSerializer = require('../serializers/error');
var tokens;
var users;
//var qt;

/**
 * @apiDefine 200
 * @apiSuccess 200 Success
 * @apiSuccessExample 200 Response
 *     HTTP/1.1 200 Success
 *     {
 *       "message": "Success",
 *       "id": "",
 *       "code": 200
 *     }
 */

/**
 * @apiDefine 201
 * @apiSuccess 201 Created
 * @apiSuccessExample 201 Response
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Created",
 *       "id": "",
 *       "code": 201
 *     }
 */

/**
 * @apiDefine 400
 * @apiError 400 Require a Bearer Authentication.
 * @apiErrorExample 400 Response
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Bad Request",
 *       "id": "",
 *       "code": 400
 *     }
 */

/**
 * @apiDefine 401
 * @apiError 401 Require a Bearer Authentication.
 * @apiErrorExample 401 Response
 *     HTTP/1.1 401 Not Authorized
 *     {
 *       "message": "Not Authorized",
 *       "id": "",
 *       "code": 401
 *     }
 */

/**
 * @apiDefine 403
 * @apiError 403 Forbidden - Token used in transaction is not valid. Check your token and/or permission.
 * @apiErrorExample 403 Response
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Forbidden",
 *       "id": "",
 *       "code": 403
 *     }
 */

/**
 * @apiDefine 404
 * @apiError 404 Not Found - We couldn't find the resource you are trying to access.
 * @apiErrorExample 404 Response
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Not Found",
 *       "id": "",
 *       "code": 404
 *     }
 */

/**
 * @apiDefine 405
 * @apiError 405 Method Not Allowed - API endpoint does not accept the method used.
 * @apiErrorExample 405 Response
 *     HTTP/1.1 405 Method Not Allowed
 *     {
 *       "message": "Not Authorized",
 *       "id": "",
 *       "code": 405
 *     }
 */

/**
 * @apiDefine 412
 * @apiError 412 Precondition Failed.
 * @apiErrorExample 412 Response
 *     HTTP/1.1 412 Precondition Failed
 *     {
 *       "message": "Precondition Failed",
 *       "id": "",
 *       "code": 412
 *     }
 */

/**
 * @apiDefine 429
 * @apiError 429 Too Many Requests.
 * @apiErrorExample 429 Response
 *     HTTP/1.1 429 Too Many Requests
 *     {
 *       "message": "Too Many Requests",
 *       "id": "",
 *       "code": 429
 *     }
 */

/**
 * @apiDefine 500
 * @apiError 500 Internal Error.
 * @apiErrorExample 500 Response
 *     HTTP/1.1 500 Internal Error
 *     {
 *       "message": "Internal Error",
 *       "id": "",
 *       "code": 500
 *     }
 */

/**
 * @apiDefine Auth
 * @apiHeader {String} Authorization Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept] application/json
 * @apiHeader {String} [Content-Type] application/json
 */

/**
 * @apiDefine AuthAdmin Admin access rights needed.
 * Only t6 Administrator user have permission to this Endpoint.
 * 
 * @apiHeader {String} Authorization Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept] application/json
 * @apiHeader {String} [Content-Type] application/json
 */

//catch API calls for quotas
router.all('*', function (req, res, next) {
	tokens	= db.getCollection('tokens');
	users	= db.getCollection('users');

	var o = {
		key:		req.user!==undefined?req.user.key:'',
		secret:		req.user!==undefined?req.user.secret:null,
		user_id:	req.user!==undefined?req.user.id:'anonymous',
		session_id:	req.user!==undefined?req.user.session_id:null,
		verb:		req.method,
		url:		req.originalUrl,
		date:		moment().format('x')
	};

	if ( req.headers.authorization ) {
		if ( !req.user ) {
			var jwtdecoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			req.user = jwtdecoded;
		}
		
		var limit = req.user!==null?(quota[req.user.role]).calls:-1;
		if (req.user !== null && req.user.role  !== null ) {
			res.header('X-RateLimit-Limit', limit);
		}
		var i;
		
		var query = squel.select()
			.field('count(url)')
			.from('quota7d.requests')
			.where('user_id=?', o.user_id!==null?o.user_id:'')
			.where('time>now() - 7d')
			.limit(1)
			.toString();
		dbInfluxDB.query(query).then(data => {
			//console.log(query);
			//console.log(data[0].count);
			//console.log(i);
			//console.log((quota[req.user.role]).calls);
			i = data[0]!==undefined?data[0].count:0;
			
			if ( limit-i > 0 ) {
				res.header('X-RateLimit-Remaining', limit-i);
				//res.header('X-RateLimit-Reset', '');
			}
			res.header('Cache-Control', 'no-cache, max-age=360, private, must-revalidate, proxy-revalidate');
			
			if( (req.user && i >= limit) ) {
				events.add('t6Api', 'api 429', req.user!==null?req.user.id:'');
				res.status(429).send(new ErrorSerializer({'id': 99, 'code': 429, 'message': 'Too Many Requests'}));
			} else {
				if ( db_type.influxdb == true ) {
					var tags = {user_id: o.user_id, session_id: o.session_id!==undefined?o.session_id:null, verb: o.verb, environment: process.env.NODE_ENV };
					var fields = {url: o.url};
					//CREATE RETENTION POLICY "quota7d" on "t6" DURATION 7d REPLICATION 1 SHARD DURATION 1d
					dbInfluxDB.writePoints([{
						measurement: 'requests',
						tags: tags,
						fields: fields,
					}], { retentionPolicy: 'quota7d', precision: 's', })
					.then(err => {
						//console.error('OK ===>'+err);
						//console.log(tags);
						//console.log(fields);
						events.add('t6Api', 'api call', req.user!==null?req.user.id:'');
						next();
					}).catch(err => {
						//console.error('ERROR ===> Error writting logs for quota:\n'+err);
						//console.log(tags);
						//console.log(fields);
						next();
				    });
				}
				//qt.insert(o);
			};
		}).catch(err => {
			//console.error('ERROR ===> Error getting logs for quota:\n'+err);
			//console.log(query);
			res.status(429).send(new ErrorSerializer({'id': 101, 'code': 429, 'message': 'Too Many Requests; or we can\'t perform your request.'}));
	    });
	} else {
		next(); // no User Auth..
	}
});


/**
 * @api {post} /authenticate Create a JWT Token
 * @apiName Create a JWT Token
 * @apiGroup User
 * @apiVersion 2.0.1
 * 
 * @apiParam {String} username Your own username
 * @apiParam {String} password Your own password
 * @apiUse 200
 * @apiUse 401
 * @apiUse 403
 * @apiUse 500
 */
router.post('/authenticate', function (req, res) {
	var email = req.body.username;
	var password = req.body.password;
	if ( email && password ) {
		var queryU = {
		'$and': [
					{ 'email': email },
					{ 'password': md5(password) },
					// TODO: expiration !! {'expiration': { '$gte': moment().format('x') }},
				]
		};
		
		var user = users.findOne(queryU);
		user.permissions = null;
		user.gravatar = null;
	}
	if ( !user || !email || !password ) {
        return res.status(403).send(new ErrorSerializer({'id': 102, 'code': 403, 'message': 'Forbidden'}));
    } else {
        var token = jwt.sign(user, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
        return res.status(200).json( {status: 'ok', token: token} );
    }
});

/**
 * @api {get} /status API Status
 * @apiName API Status
 * @apiGroup General
 * @apiVersion 2.0.1
 */
router.get('/status', function(req, res, next) {
	var status = {
		version: version,
		status: 'running',
		mqtt_info: mqtt_info,
		appName: process.env.NAME,
		started_at: moment(process.env.STARTED*1000).format('DD/MM/Y H:m:s'),
	};
	res.status(200).send(status);
});


/**
 * @api {get} /index PWA index cards
 * @apiName API IndexCards
 * @apiGroup General
 * @apiVersion 2.0.1
 */
router.get('/index', function(req, res, next) {
	var index = [
	    {
			title: 'Data Flows as Time-series',
			description: 'Communication becomes easy in the platform with Timestamped values. Flows allows to retrieve and classify data.',
			image: process.env.BASE_URL_HTTPS+'/img/opl_img3.jpg',
			url: '#/features/architecture',
	    },
	    {
			title: 'Connected Objects',
			description: 'Embedded, Automatization, Domotic, Sensors, any Objects can be connected and communicate to t6 via API.',
			image: process.env.BASE_URL_HTTPS+'/img/opl_img3.jpg',
			url: '#/features/architecture',
	    },
	    {
			title: 'Tokens for security',
			description: 'Bearer Tokens allows to manage Objects & Flows API. Permissions based on access Tokens.',
			image: process.env.BASE_URL_HTTPS+'/img/opl_img2.jpg',
			url: '#/features/architecture',
	    },
	    {
			title: 'Dashboards',
			description: 'Graphics, data-management, Monitoring, Reporting',
			image: process.env.BASE_URL_HTTPS+'/img/opl_img.jpg',
			url: '#/features/customize-dashboards',
	    },
	    {
			title: 'Decision Rules to get smart',
			description: 'Trigger action from Mqtt and decision-tree. Let\'s your Objects talk to the platform as events.',
			image: '',
			url: '#/decision-rules',
	    },
	    {
			title: 'Sense events',
			description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.',
			image: '',
			url: '/docs',
	    },
	    {
			title: 't6 is Mobile-first',
			description: 'Mobile & tablet designs works on all devices, browsers & resolutions. Designs adjust and fit to the screen size on Dashboard website.',
			image: '//cdn.internetcollaboratif.info/img/phone.jpg',
			url: '',
	    },
	];
	res.status(200).send(index);
});

module.exports = router;

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
 * @apiGroup General
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
	}
	if ( !user || !email || !password ) {
        return res.status(403).send(new ErrorSerializer({'id': 102, 'code': 403, 'message': 'Forbidden'}));
    } else {
    	var payload = JSON.parse(JSON.stringify(user));
    	payload.permissions = undefined;
    	payload.token = undefined;
    	payload.password = undefined;
    	payload.gravatar = undefined;
    	payload.meta = undefined;
    	payload.$loki = undefined;
    	payload.token_type = "Bearer";
    	payload.scope = "Application";
    	payload.sub = '/users/'+user.id;
    	payload.iss = req.ip+' - '+user.location.ip;
        var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
        
        // Add the refresh token to the list
    	tokens	= db.getCollection('tokens');
    	var refreshPayload = user.id + '.' + crypto.randomBytes(40).toString('hex');
    	var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, 'seconds').format('X');
    	tokens.insert({ user_id: user.id, refreshToken: refreshPayload, expiration: refreshTokenExp, });
        return res.status(200).json( {status: 'ok', token: token, refreshToken: refreshPayload, refreshTokenExp: refreshTokenExp} );
    }
});


/**
 * @api {post} /refresh Refresh a JWT Token
 * @apiName Refresh a JWT Token
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiHeader {String} Authorization Bearer &lt;Token&gt;
 * @apiHeader {String} [Accept] application/json
 * @apiHeader {String} [Content-Type] application/json
 * 
 * @apiUse 200
 * @apiUse 403
 */
router.post('/refresh', function (req, res) {
	// get the refreshToken from body
	var refreshToken = req.body.refreshToken;
	// Find that refreshToken in Db
	tokens	= db.getCollection('tokens');
	var queryT = {
			'$and': [
						{ 'refreshToken': refreshToken },
						{'expiration': { '$gte': moment().format('x') }},
					]
			};
	var myToken = tokens.findOne(queryT);
	if ( !myToken ) {
        return res.status(403).send(new ErrorSerializer({'id': 109, 'code': 403, 'message': 'Forbidden or Token Expired'}));
	} else {
		let user = users.findOne({ 'id': myToken.user_id });
		if ( !user ) {
	        return res.status(403).send(new ErrorSerializer({'id': 110, 'code': 403, 'message': 'Forbidden or Token Expired'}));
	    } else {
	    	var payload = JSON.parse(JSON.stringify(user));
	    	payload.permissions = undefined;
	    	payload.token = undefined;
	    	payload.password = undefined;
	    	payload.gravatar = undefined;
	    	payload.meta = undefined;
	    	payload.$loki = undefined;
	    	payload.token_type = "Bearer";
	    	payload.scope = "Application";
	    	payload.sub = '/users/'+user.id;
	    	payload.iss = req.ip+' - '+user.location.ip;
	        var token = jwt.sign(payload, jwtsettings.secret, { expiresIn: jwtsettings.expiresInSeconds });
	        
	        // Add the refresh token to the list
	    	tokens	= db.getCollection('tokens');
	    	var refreshPayload = user.id + '.' + crypto.randomBytes(40).toString('hex');
	    	var refreshTokenExp = moment().add(jwtsettings.refreshExpiresInSeconds, 'seconds').format('X');
	    	tokens.insert({ user_id: user.id, refreshToken: refreshPayload, expiration: refreshTokenExp, });
	        return res.status(200).json( {status: 'ok', token: token, refreshToken: refreshPayload, refreshTokenExp: refreshTokenExp} );
	    }
	}
});

/**
 * @api {get} /status API Status
 * @apiName API Status
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
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
 * @apiName API Cards Index
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 */
router.get('/index', function(req, res, next) {
	var index = [
 	    {
			title: 't6 is Mobile-first',
			titlecolor: '#000000',
			description: 'Mobile & tablet designs works on all devices, browsers & resolutions. Designs adjust and fit to the screen size on Dashboard website.',
			image: '//cdn.internetcollaboratif.info/img/phone.jpg',
	    },
	    {
			title: 'Data Flows as Time-series',
			titlecolor: '#ffffff',
			description: 'Communication becomes easy in the platform with Timestamped values. Flows allows to retrieve and classify data.',
			image: '//cdn.internetcollaboratif.info/img/opl_img3.jpg',
			action: {id: 'flows', label: 'Get Started'},
	    },
	    {
			title: 'Connected Objects',
			titlecolor: '#ffffff',
			description: 'Embedded, Automatization, Domotic, Sensors, any Objects can be connected and communicate to t6 via API.',
			image: '//cdn.internetcollaboratif.info/img/opl_img3.jpg',
			action: {id: 'objects', label: 'Get Started'},
	    },
	    {
			title: 'Tokens for security',
			titlecolor: '#ffffff',
			description: 'JWT Tokens allows to manage Objects & Flows API. Permissions based on access Tokens.',
			image: '//cdn.internetcollaboratif.info/img/opl_img2.jpg',
			action: {id: 'loginForm', label: 'Get Started'},
	    },
	    {
			title: 'Dashboards',
			titlecolor: '#ffffff',
			description: 'Graphics, data-management, Monitoring, Reporting',
			image: '//cdn.internetcollaboratif.info/img/opl_img2.jpg',
			action: {id: 'dashboards', label: 'Get Started'},
	    },
	    {
			title: 'Decision Rules to get smart',
			titlecolor: '#ffffff',
			description: 'Trigger action from Mqtt and decision-tree. Let\'s your Objects talk to the platform as events.',
			image: '//cdn.internetcollaboratif.info/img/opl_img.jpg',
			action: {id: 'rules', label: 'Get Started'},
	    },
	    {
			title: 'Sense events',
			titlecolor: '#ffffff',
			description: 'Whether it\'s your own sensors or external Flows from Internet, sensors collect values and communicate them to t6.',
			image: '//cdn.internetcollaboratif.info/img/opl_img.jpg',
			action: {id: 'mqtts', label: 'Get Started'},
	    },
	];
	res.status(200).send(index);
});


/**
 * @api {get} /terms PWA Terms & Privacy
 * @apiName API Get Terms & Privacy
 * @apiGroup General
 * @apiVersion 2.0.1
 * 
 * @apiUse 200
 */
router.get('/terms', function(req, res, next) {
	var terms = [
 	    {
			title: 'T6 Privacy',
			description: 'If you require any more information or have any questions about our privacy policy, please feel free to contact us by email at <a href="mailto:contact@internetcollaboratif.info" rel="noopener" target="_blank">Privacy</a>. At <a href="https://api.internetcollaboratif.info" rel="noopener" target="_blank">T6</a> we consider the privacy of our visitors to be extremely important. This privacy policy document describes in detail the types of personal information is collected and recorded by <a href="https://api.internetcollaboratif.info" rel="noopener" target="_blank">T6</a> and how we use it.',
	    },
 	    {
			title: 'Log Files',
			description: 'Like many other Web sites, <a href="https://api.internetcollaboratif.info" rel="noopener" target="_blank">T6</a> makes use of log files. These files merely logs visitors to the site - usually a standard procedure for hosting companies and a part of hosting services\'s analytics. The information inside the log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and possibly the number of clicks. This information is used to analyze trends, administer the site, track user\'s movement around the site, and gather demographic information. IP addresses, and other such information are not linked to any information that is personally identifiable.',
	    },
 	    {
			title: 'Cookies and Web Beacons',
			description: '<a href="https://api.internetcollaboratif.info" rel="noopener" target="_blank">T6</a> uses cookies to store information about visitors\' preferences, to record user-specific information on which pages the site visitor accesses or visits, and to personalize or customize our web page content based upon visitors\' browser type or other information that the visitor sends via their browser. <a href="https://api.internetcollaboratif.info" rel="noopener" target="_blank">T6</a> has no access to or control over these cookies that are used by third-party advertisers.',
	    },
 	    {
			title: 'Third Party Privacy Policies',
			description: 'You should consult the respective privacy policies of these third-party ad servers for more detailed information on their practices as well as for instructions about how to opt-out of certain practices. <a href="https://api.internetcollaboratif.info" rel="noopener" target="_blank">T6</a>\'s privacy policy does not apply to, and we cannot control the activities of, such other advertisers or web sites. You may find a comprehensive listing of these privacy policies and their links here: <a href="http://www.privacypolicyonline.com/privacy-policy-links" title="Privacy Policy Links" rel="noopener" target="_blank">Privacy Policy Links</a>. If you wish to disable cookies, you may do so through your individual browser options. More detailed information about cookie management with specific web browsers can be found at the browsers\' respective websites. <a href="http://www.privacypolicyonline.com/what-are-cookies" rel="noopener" target="_blank">What Are Cookies?</a>',
	    },
 	    {
			title: 'Children\'s Information',
			description: 'We believe it is important to provide added protection for children online. We encourage parents and guardians to spend time online with their children to observe, participate in and/or monitor and guide their online activity. <a href="https://api.internetcollaboratif.info" rel="noopener" target="_blank">T6</a> does not knowingly collect any personally identifiable information from children under the age of 13. If a parent or guardian believes that <a href="https://api.internetcollaboratif.info" rel="noopener" target="_blank">T6</a> has in its database the personally-identifiable information of a child under the age of 13, please contact us immediately (using the contact in the first paragraph) and we will use our best efforts to promptly remove such information from our records.',
	    },
 	    {
			title: 'Online Privacy Policy Only',
			description: 'This privacy policy applies only to our online activities and is valid for visitors to our website and regarding information shared and/or collected there. This policy does not apply to any information collected offline or via channels other than this website.',
	    },
 	    {
			title: 'Consent',
			description: 'By using our website T6, you hereby consent to our privacy policy and agree to its terms.',
	    },
 	    {
			title: 'Update',
			description: 'This Privacy Policy was last updated on: Saturday, November 04th, 2017. Should we update, amend or make any changes to our privacy policy, those changes will be posted here.',
	    },
	];
	res.status(200).send(terms);
});

module.exports = router;

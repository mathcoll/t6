"use strict";
var express = require("express");
var ErrorSerializer = require("../serializers/error");
var router = express.Router();

/**
 * @api {put} /config/logLevel Set Loglevel
 * @apiName Set Loglevel
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.put("/logLevel", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let value = typeof req.body.value!=="undefined"?req.body.value:logLevel;
		t6config.set_logLevel(value);
		t6events.addAudit("t6App", "AuthAdmin: {post} /config/logLevel", "", "", {"status": "200", error_id: "00003"});
		res.status(202).send({"response": "value set", value: value});
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /config/logLevel", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});

/**
 * @api {put} /config/smtp Set smtp server
 * @apiDescription 
 * @apiName Set smtp server
 * @apiGroup 8. Administration
 * @apiVersion 2.0.1
 * @apiUse AuthAdmin
 * @apiPermission AuthAdmin
 * 
 * @apiUse 202
 * @apiUse 401
 * @apiUse 403
 * @apiUse 404
 */
router.put("/smtp", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	if ( req.user.role === "admin" ) {
		let value = typeof req.body!=="undefined"?req.body:{};
		if(!value || !value.mailhost || !value.mailauth || !value.dkim) {
			// ERROR 412
			t6events.addAudit("t6App", "AuthAdmin: {post} /config/smtp", "", "", {"status": "412", error_id: "00006"});
			res.status(412).send({"response": "value not set"});
		} else {
			t6config.set_smtp(value);
			if(req.body.testmail === true) {
				var mailOptions = {
					from: bcc,
					bcc: typeof bcc!=="undefined"?bcc:null,
					to: bcc,
					subject: "Test email after config changed",
					text: "Test email after config changed",
					html: "Test email after config changed"
				};
				transporter.sendMail(mailOptions, function(err, info){
					if( err ){
						res.status(500).send({ "code": 500, message: "Error updating user" }); 
					} else {
						t6events.addStat("t6App", "Test email after config changed", user.id, user.id);
					}
				});
			}
			t6events.addAudit("t6App", "AuthAdmin: {post} /config/smtp", "", "", {"status": "200", error_id: "00003"});
			res.status(202).send({"response": "value set", value: value});
		}
	} else {
		t6events.addAudit("t6App", "AuthAdmin: {post} /config/smtp", "", "", {"status": "400", error_id: "00004"});
		res.status(401).send(new ErrorSerializer({"id": 8052, "code": 401, "message": "Forbidden"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
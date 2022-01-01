"use strict";
var t6mailer = module.exports = {};
var bcc;

t6mailer.setBcc = function(email) {
	bcc = email;
};

t6mailer.getBcc = function() {
	return bcc;
};

t6mailer.sendMail = (envelope) => new Promise((resolve, reject) => {
	if ( process.env.NODE_ENV === "production" ) {
		transporter.sendMail(envelope).then(function(info) {
			t6events.addStat("t6App", "sendMail", envelope.user_id, envelope.user_id, {"user_id": envelope.user_id, "status": "info", "info": info});
			t6events.addAudit("t6App", "sendMail", envelope.user_id, envelope.user_id, {"status": 200});
			resolve({"status": "info", "info": info});
		}).catch(function(err) {
			t6events.addStat("t6App", "sendMail", envelope.user_id, envelope.user_id, {"user_id": envelope.user_id, "status": "error", "info": err});
			t6events.addAudit("t6App", "sendMail", envelope.user_id, envelope.user_id, {"status": 500, error_id: "00005"});
			reject({"status": "error", "info": err});
		});
	} else {
		envelope.to = t6mailer.getBcc();
		transporter.sendMail(envelope).then(function(info) {
			t6console.debug("sendMail Info", envelope.to, envelope.bcc, info);
			resolve({"status": "info", "info": info});
		}).catch(function(err) {
			t6console.error("sendMail err", envelope.to, envelope.bcc, err);
			reject({"status": "error", "info": err});
		});
	}
});

module.exports = t6mailer;
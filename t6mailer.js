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
			t6events.add("t6App", "sendMail", envelope.user_id, envelope.user_id, {"user_id": envelope.user_id, "status": "info", "info": info});
			resolve({"status": "info", "info": info});
		}).catch(function(err) {
			t6events.add("t6App", "sendMail", envelope.user_id, envelope.user_id, {"user_id": envelope.user_id, "status": "error", "info": err});
			reject({"status": "error", "info": err});
		});
	} else {
		envelope.to = envelope.bcc;
		t6console.debug("sendMail To/Bcc", envelope.to, envelope.bcc);
		transporter.sendMail(envelope).then(function(info) {
			t6console.debug(info);
			resolve({"status": "info", "info": info});
		}).catch(function(err) {
			t6console.error(err);
			reject({"status": "error", "info": err});
		});
	}
});

module.exports = t6mailer;
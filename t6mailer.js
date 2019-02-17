'use strict';
var t6mailer = module.exports = {};
var bcc;

t6mailer.setBcc = function(email) {
	bcc = email;
};

t6mailer.getBcc = function() {
	return bcc;
};

t6mailer.sendMail = function(envelope) {
	if ( process.env.NODE_ENV === 'production' ) {
		transporter.sendMail(envelope, function(err, info) {
			if( err ){
				return err;
			} else {
				return info;
			};
		});
	} else {
		envelope.to = bcc;
		transporter.sendMail(envelope, function(err, info) {
			if( err ){
				return {'status': 'err', 'info': err};
			} else {
				return {'status': 'info', 'info': info};
			};
		});
	};
};

module.exports = t6mailer;
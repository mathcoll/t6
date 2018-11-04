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
				var err = new Error('Internal Error');
			} else {
				return;
			};
		});
	} else {
		//envelope.to = bcc;
		transporter.sendMail(envelope, function(err, info) {
			if( err ){
				console.log('Email error', err);
				var err = new Error('Internal Error');
			} else {
				return;
			};
		});
	};
};

module.exports = t6mailer;
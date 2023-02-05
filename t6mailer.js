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

t6mailer.generateOTP = (user, res) => new Promise((resolve, reject) => {
	let email = user.email;
	let otp = otpGen.generate(otpChars, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false, digits: true });
	let hash = otpTool.createNewOTP(email, otp, otpKey, otpExpiresAfter, otpAlgorithm);
	t6console.debug("generateOTP for ", user.email);
	resolve( {email, otp, hash} );
	
	res.render("emails/otp", {"geoip": user.geoip, "device": user.device, "user": user, "otp": otp, "duration": `${otpExpiresAfter} minutes`}, function(err, html) {
		let mailOptions = {
			from: from,
			bcc: typeof bcc!=="undefined"?bcc:null,
			to: user.email,
			user_id: user.user_id,
			subject: `t6 Two-factor authentication: Enter your OTP ${otp}`,
			text: "Html email client is required",
			html: html
		};
		t6mailer.sendMail(mailOptions).then(function(info){
			t6console.debug("generateOTP INFO" + info);
		}).catch(function(error){
			t6console.error("t6mailer.generateOTP error" + error.info.code + error.info.response + error.info.responseCode + error.info.command);
		});
	});
});

module.exports = t6mailer;
"use strict";
var t6config = module.exports = {};
global.transporter = {};

t6config.set_logLevel = function(value) {
	logLevel = value; // LOG|DEBUG|INFO|WARNING|ERROR
};

t6config.set_smtp = function(smtp) {
	mailhost			= typeof smtp.mailhost!=="undefined"?smtp.mailhost:mailhost;
	mailauth			= typeof smtp.mailauth!=="undefined"?smtp.mailauth:mailauth;
	let dkim = {
		domainName	: typeof smtp.dkim.domainName!=="undefined"?smtp.dkim.domainName:"",
		keySelector	: typeof smtp.dkim.keySelector!=="undefined"?smtp.dkim.keySelector:"",
	}
	mailDKIMCertificate	= typeof smtp.mailDKIMCertificate!=="undefined"?smtp.mailDKIMCertificate:mailDKIMCertificate;
	fs.access(mailDKIMCertificate, fs.constants.W_OK, (err) => {
		if (err) {
			transporter = nodemailer.createTransport({
				host : mailhost,
				port: 587,
				ignoreTLS : true,
				auth : mailauth,
				dkim : {
					domainName : dkim.domainName,
					keySelector : dkim.keySelector
				}
			});
		} else {
			transporter = nodemailer.createTransport({
				host : mailhost,
				port: 587,
				ignoreTLS : true,
				auth : mailauth,
				dkim : {
					domainName : dkim.domainName,
					keySelector : dkim.keySelector,
					privateKey : fs.readFileSync(mailDKIMCertificate, "utf8")
				}
			});
		}
		t6console.log(`mailDKIMCertificate ${err ? "is not found. Transporter is not using DKIM" : "found. Transporter is using DKIM certificate."}`);
	});
};

module.exports = t6config;
"use strict";
var t6console = module.exports = {};

t6console.log = function(...logmessage) {
	if ( logLevel.indexOf("LOG") > -1 ) {
		console.log(moment().format(logDateFormat), "[LOG]".green, logmessage);
	}
};

t6console.debug = function(...debugmessage) {
	if ( logLevel.indexOf("DEBUG") > -1 ) {
		console.debug(moment().format(logDateFormat), "[DEBUG]".cyan, debugmessage);
	}
};

t6console.info = function(...infomessage) {
	if ( logLevel.indexOf("INFO") > -1 ) {
		console.info(moment().format(logDateFormat), "[INFO]".blue, infomessage);
	}
};

t6console.warn = function(...warningmessage) {
	if ( logLevel.indexOf("WARNING") > -1 ) {
		console.warn(moment().format(logDateFormat), "[WARNING]".yellow, warningmessage);
	}
};

t6console.warning = function(...warningmessage) {
	if ( logLevel.indexOf("WARNING") > -1 ) {
		console.warn(moment().format(logDateFormat), "[WARNING]".yellow, warningmessage);
	}
};

t6console.error = function(...errormessage) {
	if ( logLevel.indexOf("ERROR") > -1 ) {
		console.error(moment().format(logDateFormat), "[ERROR]".red, errormessage);
	}
	if ( logAuditOnError ) {
		t6events.addAudit("t6App", `t6console.error: ${errormessage}`, "", "", {"status": "500", error_id: "00000"});
	}
};

t6console.critical = function(...criticalmessage) {
	console.error(moment().format(logDateFormat), "[CRITICAL]".red, criticalmessage);
	if ( logAuditOnError ) {
		t6events.addAudit("t6App", `t6console.critical: ${criticalmessage}`, "", "", {"status": "500", error_id: "00001"});
	}
	if ( sendMailOnCriticalError && criticalmessage ) {
		var envelope = {
			from:		from,
			bcc:		bcc,
			to:			bcc,
			user_id:	bcc,
			subject:	`Critical Error on t6 ${app.get("env")}`,
			text:		`${criticalmessage}`,
			html:		`${criticalmessage}`
		};
		t6mailer.sendMail(envelope);
	}
	if ( sendTextMessageOnCriticalError && twilioSettings.accountSid && twilioSettings.authToken && event.params.to) {
		const clientTwilio = new twilio(twilioSettings.accountSid, twilioSettings.authToken);
		clientTwilio.messages
			.create({
				body: `Critical Error on t6 ${app.get("env")} ${criticalmessage}`,
				to: event.params.to, // Text this number
				from: twilioSettings.from, // From a valid Twilio number
			})
			.then((message) => t6console.debug("Twilio Message Sid:", message.sid));
	}
};

module.exports = t6console;
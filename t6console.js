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
	t6events.addAudit("t6App", `Error: ${errormessage}`, "", "", {"status": "50x"});
};

module.exports = t6console;
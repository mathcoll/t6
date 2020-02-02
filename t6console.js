"use strict";
var t6console = module.exports = {};

t6console.log = function(logmessage) {
	if ( logLevel.indexOf("LOG") > -1 ) {
		console.log(moment().format(logDateFormat), "[LOG]", logmessage);
	}
};

t6console.debug = function(debugmessage) {
	if ( logLevel.indexOf("DEBUG") > -1 ) {
		console.log(moment().format(logDateFormat), "[DEBUG]", debugmessage);
	}
};

t6console.info = function(infomessage) {
	if ( logLevel.indexOf("INFO") > -1 ) {
		console.log(moment().format(logDateFormat), "[INFO]", infomessage);
	}
};

t6console.warn = function(warningmessage) {
	if ( logLevel.indexOf("WARNING") > -1 ) {
		console.log(moment().format(logDateFormat), "[WARNING]", warningmessage);
	}
};

t6console.warning = function(warningmessage) {
	if ( logLevel.indexOf("WARNING") > -1 ) {
		console.log(moment().format(logDateFormat), "[WARNING]", warningmessage);
	}
};

t6console.error = function(errormessage) {
	if ( logLevel.indexOf("ERROR") > -1 ) {
		console.error(moment().format(logDateFormat), "[ERROR]", errormessage);
	}
};

module.exports = t6console;
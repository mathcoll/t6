"use strict";
var exec		= require('exec');
var moment		= require('moment');
var request		= require('request');

var bearer		= 'GFlWfiCrebUZLSAbvn.SElHPXthdKDdFIWuM..INsPLBEtYpXntZwpBYXvKrE.xg'; // until 28/3/2018 à 13:12:50
var api			= 'http://127.0.0.1:3000/v2.0.1/data/';
var publish		= true;
var save		= true;
var mqtt_topic	= 'couleurs/Freebox';
var unit		= 'byte';
var timestamp	= moment().format('x');

function send(api, flow_id, value, timestamp, publish, save, unit, mqtt_topic) {
	var body = {flow_id: flow_id, value:value, timestamp: timestamp, publish: publish, save: save, unit: unit, mqtt_topic: mqtt_topic};
	//console.log(body);
	request({
		url: api,
		method: 'POST',
		json: true,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer '+bearer,
		},
		body: body
	}, function (error, response, body){
		//console.log(error + response);
	});
};

var get = request.get('http://mafreebox.freebox.fr/pub/fbx_info.txt').on('response', function (response) {
	response.on('data', function (chunk) {
		var br = (chunk.toString()).match( /bit ATM +([0-9]+) kb\/s +([0-9]+) kb\/s/im );
		if ( br && br.length > -1 ) {
			var downrate	= br[1];
			var uprate		= br[2];
			var unit		= 'kb/s';
			//console.log("br:" + downrate + " / " + uprate);
			send(api, 16, uprate, timestamp, publish, save, unit, mqtt_topic+'/ATMup');
			send(api, 17, downrate, timestamp, publish, save, unit, mqtt_topic+'/ATMdown');
		}
		
		var margin = (chunk.toString()).match( /Marge de bruit +([0-9.]+) dB +([0-9.]+) dB/im );
		if ( margin && margin.length > -1 ) {
			var downmargin	= margin[1];
			var upmargin	= margin[2];
			var unit		= 'dB';
			//console.log("margin:" + downmargin + " / " + upmargin);
			send(api, 18, downmargin, timestamp, publish, save, unit, mqtt_topic+'/marginDown');
			send(api, 19, upmargin, timestamp, publish, save, unit, mqtt_topic+'/marginUp');
		}
		
		var attenuation = (chunk.toString()).match( /nuation +([0-9.]+) dB +([0-9.]+) dB/im );
		if ( attenuation && attenuation.length > -1 ) {
			var downattn	= attenuation[1];
			var upattn		= attenuation[2];
			var unit		= 'dB';
			//console.log("attenuation:" + downattn + " / " + upattn);
			//send(api, ?, downattn, timestamp, publish, save, unit, mqtt_topic+'/??'); // TODO
			//send(api, ?, upattn, timestamp, publish, save, unit, mqtt_topic+'/??'); // TODO
		}
		
		var fec = (chunk.toString()).match( /FEC +([0-9]+) +([0-9]+)/im );
		if ( fec && fec.length > -1 ) {
			var downfec		= fec[1];
			var upfec		= fec[2];
			var unit		= '';
			//console.log("FEC:" + downfec + " / " + upfec);
			send(api, 10, downfec, timestamp, publish, save, unit, mqtt_topic+'/FECdown');
			send(api, 11, upfec, timestamp, publish, save, unit, mqtt_topic+'/FECup');
		}
		
		var crc = (chunk.toString()).match( /CRC +([0-9]+) +([0-9]+)/im );
		if ( crc && crc.length > -1 ) {
			var downcrc		= crc[1];
			var upcrc		= crc[2];
			var unit		= '';
			//console.log("CRC:" + downcrc + " / " + upcrc);
			send(api, 14, downcrc, timestamp, publish, save, unit, mqtt_topic+'/CRCdown');
			send(api, 15, upcrc, timestamp, publish, save, unit, mqtt_topic+'/CRCup');
		}
		
		var hec = (chunk.toString()).match( /HEC +([0-9]+) +([0-9]+)/im );
		if ( hec && hec.length > -1 ) {
			var downhec		= hec[1];
			var uphec		= hec[2];
			var unit		= '';
			//console.log("HEC:" + downhec + " / " + uphec);
			send(api, 12, downhec, timestamp, publish, save, unit, mqtt_topic+'/HECdown');
			send(api, 13, uphec, timestamp, publish, save, unit, mqtt_topic+'/HECup');
		}
	});
	response.on('end', function () {
		console.log("End");
	});
});
'use strict';
var express = require('express');
var router	= express.Router();
var proxy	= require('express-http-proxy');

/*
router.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', (req.headers.origin || '*'));
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Max-Age', 10);
	
	res.header('tsv', 'N');
	res.header('Cache-Control', 'no-cache');
	res.header('Expires', 'Thu, 01 Dec 1994 16:00:00 GMT');
	res.header('Connection', 'Keep-Alive');
	next();
});
*/

router.use('/16', proxy('192.168.0.16', {
	filter: function(req, res) {
		return req.method == 'GET';
	},
	forwardPath: function(req, res) {
		return require('url').parse(req.url).path;
	}
}));

router.use('/17', proxy('192.168.0.17', {
	filter: function(req, res) {
		return req.method == 'GET';
	},
	forwardPath: function(req, res) {
		return require('url').parse(req.url).path;
	}
}));

router.use('/yoctopuce/cov-5', function (req, res) {
	var yoctolib= require('yoctolib');
	var YAPI = yoctolib.YAPI;
	var YVoc = yoctolib.YVoc;
	YAPI.RegisterHub('http://192.168.0.7:4444/');
	var sensor = YVoc.FirstVoc();  
	var value = sensor.get_currentValue();
	var html = "<a class='list-group-item' href='#'><h4 class='list-group-item-heading'> <span aria-hidden='true' class='glyphicon glyphicon-asterisk'></span> COV module by YoctoPuce</h4>Le senseur est capable de détecter les alcools, aldéhydes, hydro-carbones aliphatiques, amines, hydro-carbones aromatiques (vapeurs d'essence, etc), oxydes de carbone, CH4, LPG, cétones et acides organiques. <span class='badge'>"+value+"ppm</span>";
		html += "<br />";
		html += "<div class='progress'>";
		html += "			<div class='progress-bar progress-bar-success' style='width: 45%'>";
		if ( value < 1000) html += "				<b>↓</b> "+value+"ppm";
		html += "			</div>";
		html += "			<div class='progress-bar progress-bar-warning' style='width: 45%'>";
		if ( value >= 1000 && value < 1600) html += "				<b>↓</b> "+value+"ppm";
		html += "			</div>";
		html += "			<div class='progress-bar progress-bar-danger' style='width: 10%'>";
		if ( value >= 1600 ) html += "				<b>↓</b> "+value+"ppm";
		html += "			</div>";
		html += "		</div>";
		html += "</a>";
	res.send(html, 200);
});

module.exports = router;

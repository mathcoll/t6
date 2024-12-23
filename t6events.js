"use strict";
var t6events = module.exports = {};
var measurement = "events";
var retention = "autogen";

t6events.setMeasurement = function(m) {
	measurement = m;
};

t6events.getMeasurement = function() {
	return measurement;
};

t6events.setRP = function(rp) {
	retention = rp;
};

t6events.getRP = function() {
	return retention;
};

t6events.addAudit = function(where, what, who, client_id=null, params=null) {
	where = where + ":" + process.env.NODE_ENV;
	params.error_id = (typeof params.error_id!=="undefined" && params.error_id!==null)?params.error_id.toString():"";
	//TODO : make sure 'what' does not contains multiple lines
	if ( db_type.influxdb ) {
		var tags = {rp: retention, what: what.replace(/(\r\n|\n|\r)/gm, ""), where: where};
		var fields = {who: typeof who!=="undefined"?who:"", status: parseFloat((params!==null && typeof params.status!=="undefined")?params.status:""), error_id: params.error_id};
		let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
		dbWrite.writePoints([{
			measurement: measurement,
			tags: tags,
			fields: fields,
		}], { retentionPolicy: retention }).then((err) => {
			if(err) {
				t6console.warning("addAudit, t6events.addAudit: Error", err);
			} else {
				t6console.debug("addAudit, t6events.addAudit: Ok", measurement, tags, fields);
			}
		}).catch((err) => {
			t6console.warning("addAudit, Error writting event to influxDb:", {measurement, fields, tags, retention}, err);
		});
	}
}

t6events.addStat = function(where, what, who, client_id=null, params=undefined) {
	where = where + ":" + process.env.NODE_ENV;
	let d = (logLevel.indexOf("DEBUG")>-1)?"debug/":"";
	if(client_id!==null) {
		let user_id = typeof who!=="undefined"?who:null;
		client_id = typeof client_id!=="undefined"?client_id:"";

		params = typeof params==="object"?params:{};
		params.environment = where;
		params.user_id = user_id;
		
		var options = {
			method: "POST",
			url: `https://www.google-analytics.com/${d}mp/collect?v=2&firebase_app_id=${trackings.firebaseConfig.server.appId}&measurement_id=${trackings.firebaseConfig.server.measurementId}&api_secret=${trackings.firebaseConfig.server.api_secret}`,
			body: JSON.stringify({
				"user_id": user_id,
				"client_id": client_id,
				"nonPersonalizedAds": true,
				"consent": {
					"ad_user_data": "DENIED",
					"ad_personalization": "DENIED"
				},
				"events": [{
					name: what.replace(/[^a-zA-Z]/g,"_"),
					params: params,
				}]
			})
		};
		request(options, function(error, response, body) {
			if ( !error && typeof response!=="undefined" && typeof response.statusCode!=="undefined" && response.statusCode !== 404 ) {
				t6console.info(`GA4 Event "${what.replace(/[^a-zA-Z]/g,"_")}" on measurement_id: ${trackings.firebaseConfig.server.measurementId}`);
				t6console.info("GA4 user_id:", user_id);
				t6console.info("GA4 client_id:", client_id);
				t6console.info("GA4 environment:", where);
				t6console.info("GA4 params:", params);
				t6console.info("GA4 statusCode:", response.statusCode);
				if (d==="debug/") { t6console.debug("GA4 body:", body); }
			} else {
				t6console.error("GA4 Error:", error, typeof response!=="undefined"?response.statusCode:"response is undefined or 404.", options);
			}
		});
	}
};

module.exports = t6events;
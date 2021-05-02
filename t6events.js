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

t6events.add = function(where, what, who, client_id=null, params=null) {
	where = where + ":" + process.env.NODE_ENV;
	if ( db_type.influxdb ) {
		var tags = {rp: retention, what: what, where: where};
		var fields = {who: who};
		let dbWrite = typeof dbTelegraf!=="undefined"?dbTelegraf:dbInfluxDB;
		dbWrite.writePoints([{
			measurement: measurement,
			tags: tags,
			fields: fields,
		}], { retentionPolicy: retention, }).then(err => {
			return true;
		}).catch(err => {
			t6console.error("Error writting event to influxDb:", err);
		});
	}
	let d = process.env.NODE_ENV==="production"?"":"debug/";
	if(client_id!==null) {
		let user_id = typeof who!=="undefined"?who:null;
		client_id = typeof client_id!=="undefined"?client_id:"";
		
		params = typeof params!=="object"?params:{};
		params.environnment = where;
		params.user_id = user_id;
		
		var options = {
			method: "POST",
			url: `https://www.google-analytics.com/${d}mp/collect?v=2&firebase_app_id=${trackings.firebaseConfig.server.appId}&measurement_id=${trackings.firebaseConfig.server.measurementId}&api_secret=${trackings.firebaseConfig.server.api_secret}`,
			body: JSON.stringify({
				"user_id": user_id,
				"client_id": client_id,
				"nonPersonalizedAds": true,
				"events": [{
					name: what.replace(/[^a-zA-Z]/g,"_"),
					params: params,
				}]
			})
		};
		request(options, function(error, response, body) {
			if ( !error && response.statusCode !== 404 ) {
				t6console.info(`GA4 Event "${what.replace(/[^a-zA-Z]/g,"_")}" on measurement_id: ${trackings.firebaseConfig.server.measurementId}`);
				t6console.info("GA4 user_id:", user_id);
				t6console.info("GA4 client_id:", client_id);
				t6console.info("GA4 environnment:", where);
				t6console.info("GA4 params:", params);
				t6console.info("GA4 statusCode:", response.statusCode);
				if (d==="debug/") { t6console.log("GA4 body:", body); }
			} else {
				t6console.error("GA4 Error:", error, response.statusCode);
			}
		});
	}
};

module.exports = t6events;
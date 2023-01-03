#!/usr/bin/node
"use strict";

const speedTest = require("speedtest-net");
(async () => {
	let st;
	try {
		st = await speedTest({acceptLicense: true, acceptGdpr: true});
	} catch (err) {
		console.log(err.message);
	} finally {
		//console.log(st);
		if (process.argv[2] === "download") {
			console.log(speedText(st.download.bandwidth));
		} else if (process.argv[2] === "upload") {
			console.log(speedText(st.upload.bandwidth));
		}
		process.exit(0);
	}
})();

function speedText(speed) {
	let bits = speed * 8;
	const places = [0, 1, 2, 3, 3];
	let unit = 0;
	while (bits >= 2000 && unit < 4) {
		unit++;
		bits /= 1000;
	}
	//const units = ['', 'K', 'M', 'G', 'T'];
	//return `${bits.toFixed(places[unit])} ${units[unit]}bps`;
	return `${bits.toFixed(places[unit])}`;
}
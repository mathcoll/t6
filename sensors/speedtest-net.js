#!/usr/bin/node

"use strict";

if (process.argv[2] === "download") {
	require("speedtest-net")().on("downloadspeed", (speed) => {
		console.log((speed * 125).toFixed(2));
	});
} else if (process.argv[2] === "upload") {
	require("speedtest-net")().on("uploadspeed", (speed) => {
		console.log((speed * 125).toFixed(2));
	});
}

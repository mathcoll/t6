"use strict";
var snippet = {
	name: "flowgraph",
	value: "Graph a Flow over axis",
	options: {
		width: {default_value: "12", type: "select", available_values: ["4", "6", "8", "12"]},
		type: {default_value: "line", type: "select", available_values: ["bar", "line", "radar", "pie", "polarArea", "bubble", "scatter"]},
		color: {default_value: "#FF0000", type: "text"},
		legend_font_color: {default_value: "#FF0000", type: "text"},
		border_color: {default_value: "#FF0000", type: "text"},
		border_width: {default_value: 4, type: "select", available_values: [2, 4, 6, 8, 10, 12]},
		background_color: {default_value: "#FF0000", type: "text"},
		point_background_color: {default_value: "#FF0000", type: "text"},
		limit: {default_value: 15, type: "integer"},
		fill: {default_value: false, type: "switch", available_values: [true, false, "origin", "start", "end"]},
		show_line: {default_value: false, type: "switch", available_values: [true, false]},
		stepped_line: {default_value: false, type: "select", available_values: [true, false, "before", "after"]},

		title_display: {default_value: false, type: "switch", available_values: [true, false]},
		title_font_size: {default_value: 12, type: "integer"},
		title_font_family: {default_value: "Helvetica", type: "select", available_values: ["Helvetica", "Helvetica Neue", "Arial", "sans-serif"]},

		legend_display: {default_value: false, type: "select", available_values: [true, false]},
		legend_position: {default_value: false, type: "select", available_values: ["top", "bottom", "left", "right"]},
		legend_align: {default_value: false, type: "select", available_values: ["start", "center", "end"]},
	},
	activateOnce: function(params) {
		let opt = this.getOptions(this);
		if ( typeof params.attributes.options !== "undefined" ) {
			this.options.width.value = typeof params.attributes.options.width.value!=="undefined"?params.attributes.options.width.value:this.options.width.default_value;
		} else {
			this.options.width.value = "12";
		}
		document.getElementById(params.id).parentNode.classList.add("mdl-cell--" + this.options.width.value + "-col");

		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		let width = document.getElementById("snippet-graph-"+params.id)!==null?document.getElementById("snippet-graph-"+params.id).offsetWidth:100;
		let height = 250;
		let limit = opt.limit&&typeof opt.limit.value!=="undefined"?opt.limit.value:5;
		let svgUrl = `${app.baseUrl}/${app.api_version}/exploration/line?flow_id=${params.attributes.flows[0]}&limit=${limit}&sort=desc&width=${width}&height=${height}`;
		fetch(svgUrl, myInit)
		.then(
			app.fetchStatusHandler
		)
		.then(function(response) {
			setInterval(function() {app.refreshFromNow("snippet-time-"+params.id, parseInt(response.headers.get("X-latest-time"), 10), true);}, 2000);
			return response.text();
		})
		.then((svg) => {
			document.getElementById("snippet-graph-"+params.id).insertAdjacentHTML("afterbegin", svg);
		});
	},
	getHtml: function(params) {
		if (!params) {
			params = {};
		}
		params.unit;
		var html = `
		<div id="${params.id}" class="flowgraph tile card-flowgraph material-animate margin-top-4 material-animated mdl-shadow--2dp">
			<div class="contextual">
				<div class="mdl-list__item-primary-content">
					<i class="material-icons">${params.icon}</i>
					<span class="heading">${params.name} <span id="unit-${params.id}">(${params.unit})</span></span>
					<span class="heading pull-right">
						<button data-snippet-id="${params.id}" class="edit-snippet mdl-button mdl-js-button mdl-button--icon">
							<i class="material-icons">settings</i>
						</button>
					</span>
				</div>
				<div class="mdl-list__item-secondary-content">
					<div class="mdl-list__item" id="snippet-graph-${params.id}" style="width:100%;">
					</div>
				</div>
			</div>
			<div class="mdl-list__item-sub-title" id="snippet-time-${params.id}">◾◾/◾◾/◾◾◾◾ ◾◾:◾◾:◾◾</span>
		</div>`;
		return html;
	},
};
snippet.getOptions = function(s) { return s.options; };
snippet.setOptions = function(opt) {
	var merged = {};
	for (var attrname in this.options) { merged[attrname] = this.options[attrname]; }
	for (var attrname in opt) { merged[attrname] = opt[attrname]; }
	this.options = merged;
	return merged;
};
app.snippetTypes.push(snippet);
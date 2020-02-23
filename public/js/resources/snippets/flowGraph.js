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
		this.options.width.value = typeof params.attributes.options.width.value!=="undefined"?params.attributes.options.width.value:this.options.width.default_value;
		document.getElementById(params.id).parentNode.classList.add("mdl-cell--" + this.options.width.value + "-col");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var opt = this.getOptions(this);
		var limit = opt.limit&&typeof opt.limit.value!=="undefined"?opt.limit.value:5;
		var url = app.baseUrl+"/"+app.api_version+"/data/"+params.attributes.flows[0]+"?sort=desc&limit="+limit;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			var ctx = document.getElementById("chart-"+params.id).getContext("2d");
			var datapoints = [];
			if( typeof response.data!=="undefined" && response.data.type!=="errors" ) {
				response.data.forEach(function(d) {
					datapoints.push({ x: new Date(d.attributes.timestamp), y: d.attributes.value });
				});
				var type = opt.type&&typeof opt.type.value!=="undefined"?opt.type.value:opt.type.default_value;
				var unit = " ("+sprintf(typeof response.links.unit!=="undefined"?response.links.unit:"", "")+")";
				var data = {
					datasets: [{
						label: typeof params.flowNames!=="undefined"?params.flowNames[0]:"",
						backgroundColor: opt.background_color&&typeof opt.background_color.value!=="undefined"?opt.background_color.value:opt.background_color.default_value,
						borderColor: opt.border_color&&typeof opt.border_color.value!=="undefined"?opt.border_color.value:opt.border_color.default_value,
						borderWidth: opt.border_width&&typeof opt.border_width.value!=="undefined"?opt.border_width.value:opt.border_width.default_value,
						fill: opt.fill&&typeof opt.fill.value!=="undefined"?opt.fill.value:opt.fill.default_value,
						showLine: opt.show_line&&typeof opt.show_line.value!=="undefined"?opt.show_line.value:opt.show_line.default_value,
						steppedLine: opt.stepped_line&&typeof opt.stepped_line.value!=="undefined"?opt.stepped_line.value:opt.stepped_line.default_value,
						pointStyle: "rectRounded",
						hoverRadius: 10,
						pointBackgroundColor: opt.point_background_color&&typeof opt.point_background_color.value!=="undefined"?opt.point_background_color.value:opt.point_background_color.default_value,
						data: datapoints,
					}]
				};
				var options = {
					title: {
						display: opt.title_display&&typeof opt.title_display.value!=="undefined"?opt.title_display.value:opt.title_display.default_value,
						text: typeof params.flowNames!=="undefined"?params.flowNames[0]:"Snippet Title",
						fontSize: opt.title_font_size&&typeof opt.title_font_size.value!=="undefined"?opt.title_font_size.value:opt.title_font_size.default_value,
						fontFamily: opt.title_font_family&&typeof opt.title_font_family.value!=="undefined"?opt.title_font_family.value:opt.title_font_family.default_value,
					},
					legend: {
						display: opt.legend_display&&typeof opt.legend_display.value!=="undefined"?opt.legend_display.value:opt.legend_display.default_value,
						position: opt.legend_position&&typeof opt.legend_position.value!=="undefined"?opt.legend_position.value:opt.legend_position.default_value,
								align: opt.legend_align&&typeof opt.legend_align.value!=="undefined"?opt.legend_align.value:opt.legend_align.default_value,
						labels: {
							fontColor: opt.legend_font_color&&typeof opt.legend_font_color.value!=="undefined"?opt.legend_font_color.value:opt.legend_font_color.default_value
						}
					},
					tooltips: {
						enable: false
					},
					scales: {
						xAxes: [{
							type: "time",
							time: {
								unit: "hour"
							},
							ticks: {
								source: "auto",
							}
						}]
					},
					maintainAspectRatio: false,
					responsive: true,
					animation: { duration: 0, },
				};
				var c = document.getElementById("chart-"+params.id);
				c.height = 250;
				var myChart = new Chart(ctx, {
					type: type,
					data: data,
					options: options
				});
				var id = response.data[0].attributes.id;
				var time = response.data[0].attributes.time;
				var value = response.data[0].attributes.value;
				var ttl = response.links.ttl;
				document.getElementById("unit-"+params.id).innerHTML = unit;
				setInterval(function() {app.refreshFromNow("snippet-time-"+params.id, time, true)}, 2000);
			} else {
				var c = document.getElementById("chart-"+params.id);
				c.height = 250;
				var ctx = c.getContext("2d");
				ctx.textAlign = "center";
				ctx.fillText("Data error occured; please check Snippet settings :-(", c.width/2, c.height/2);
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem("settings.debug") == "true" ) {
				toast("getSnippet Inside error..." + error, {timeout:3000, type: "error"});
			}
		});
	},
	getHtml: function(params) {
		if (!params) {
			params = {}
		}
		params.unit
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
						<canvas id="chart-${params.id}"></canvas>
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
"use strict";
var snippet = {
	name: "flowgraph",
	value: "Graph a Flow over axis",
	
	options: {
		width: {defaultValue: "12", value: "12", type: "select", availableValues: ["4", "6", "8", "12"]},
		
		type: {defaultValue: "top", value: "line", type: "select", availableValues: ["bar", "line", "radar", "pie", "polarArea", "bubble", "scatter"]},
		color: {defaultValue: "#FF0000", type: "text", value: "#0d87b0"},
		legendFontColor: {defaultValue: "#FF0000", type: "text", value: "#0d87b0"},
		borderColor: {defaultValue: "#FF0000", type: "text", value: "#0d87b0"},
		backgroundColor: {defaultValue: "#FF0000", type: "text", value: "#0d87b0"},
		pointBackgroundColor: {defaultValue: "#FF0000", type: "text", value: "#0d87b0"},
		limit: {defaultValue: 15, value: 50, type: "integer"},
		fill: {defaultValue: false, value: false, type: "switch", availableValues: [true, false]},
		showLine: {defaultValue: false, value: true, type: "switch", availableValues: [true, false]},
		steppedLine: {defaultValue: false, value: false, type: "select", availableValues: [true, false, "before", "after"]},

		titleDisplay: {defaultValue: false, value: false, type: "switch", availableValues: [true, false]},
		titleFontSize: {defaultValue: 28, value: 28, type: "integer"},
		titleFontFamily: {defaultValue: "Helvetica", value: "Helvetica", type: "select", availableValues: ["Helvetica", "Helvetica Neue", "Arial", "sans-serif"]},

		legend: {defaultValue: "top", value: "bottom", type: "select", availableValues: [true, false, "top", "bottom"]},
		legendPosition: {defaultValue: false, value: "bottom", type: "select", availableValues: ["top", "bottom", "left", "right"]},
		legendDisplay: {defaultValue: false, value: false, type: "switch", availableValues: [true, false]},
	},
	activateOnce: function(params) {
		this.options.width.value = this.options.width.value!==null?this.options.width.value:this.options.width.defaultValue;
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
			response.data.forEach(function(d) {
				datapoints.push({ x: new Date(d.attributes.timestamp), y: d.attributes.value });
			});
			var type = opt.type&&typeof opt.type.value!=="undefined"?opt.type.value:"line";
			var unit = " ("+sprintf(typeof response.links.unit!=="undefined"?response.links.unit:"", "")+")";
			var data = {
				datasets: [{
					label: typeof params.flowNames!=="undefined"?params.flowNames[0]:"",
					backgroundColor: opt.backgroundColor&&typeof opt.backgroundColor.value!=="undefined"?opt.backgroundColor.value:"rgb(255, 99, 132)",
					borderColor: opt.borderColor&&typeof opt.borderColor.value!=="undefined"?opt.borderColor.value:"rgb(255, 99, 132)",
					fill: opt.fill&&typeof opt.fill.value!=="undefined"?opt.fill.value:false,
					showLine: opt.showLine&&typeof opt.showLine.value!=="undefined"?opt.showLine.value:false,
					steppedLine: opt.steppedLine&&typeof opt.steppedLine.value!=="undefined"?opt.steppedLine.value:false,
					pointBackgroundColor: opt.pointBackgroundColor&&typeof opt.pointBackgroundColor.value!=="undefined"?opt.pointBackgroundColor.value:"rgb(255, 99, 132)",
					data: datapoints,
				}]
			};
			var options = {
				title: {
					display: opt.titleDisplay&&typeof opt.titleDisplay.value!=="undefined"?opt.titleDisplay.value:true,
					text: "Snippet Title",
					fontSize: opt.titleFontSize&&typeof opt.titleFontSize.value!=="undefined"?opt.titleFontSize.value:28,
					fontFamily: opt.titleFontFamily&&typeof opt.titleFontFamily.value!=="undefined"?opt.titleFontFamily.value:"Helvetica", //""Helvetica Neue", "Helvetica", "Arial", sans-serif"
				},
				legend: {
					display: opt.legendDisplay&&typeof opt.legendDisplay.value!=="undefined"?opt.legendDisplay.value:true,
					position: opt.legendPosition&&typeof opt.legendPosition.value!=="undefined"?opt.legendPosition.value:"bottom",
					labels: {
						fontColor: opt.legendFontColor&&typeof opt.legendFontColor.value!=="undefined"?opt.legendFontColor.value:"rgb(255, 99, 132)"
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
app.snippetTypes.push(snippet);
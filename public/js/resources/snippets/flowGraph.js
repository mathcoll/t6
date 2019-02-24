'use strict';
var snippet = {
	name: "flowgraph",
	value: "Graph a Flow over axis",
	
	options: {
		color: {defaultValue: "#FF0000", type: 'text'},
		legend: {defaultValue: "top", type: 'select', availableValues: [true, false, "top", "bottom"]},
		limit: {defaultValue: 500, value: 1000, type: 'integer'},
	},
	activateOnce: function(params) {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var limit = params.limit&&params.limit.value!==undefined?params.limit.value:500;
		var url = app.baseUrl+"/"+app.api_version+'/data/'+params.attributes.flows[0]+'?sort=desc&limit='+limit;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			var ctx = document.getElementById("chart-"+params.id).getContext('2d');
			var datapoints = [];
			response.data.forEach(function(d) {
				datapoints.push({ x: new Date(d.attributes.timestamp), y: d.attributes.value });
			});
			var type = 'line';
			var data = {
				datasets: [{
					label: params.flowNames[0],
					backgroundColor: 'rgb(255, 99, 132)',
					borderColor: 'rgb(255, 99, 132)',
					fill: false,
					showLine: false,
					steppedLine: false, //true, false, 'before', 'after'
					pointBackgroundColor: 'rgb(255, 99, 132)',
					data: datapoints,
				}]
			};
			var options = {
				title: {
					display: false,
					text: 'Snippet Title',
					fontSize: 28,
					fontFamily: 'Helvetica', //"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
				},
				legend: {
					display: true,
					position: 'bottom', //'left', 'right', 'top'
					labels: {
						fontColor: 'rgb(255, 99, 132)'
					}
				},
				tooltips: {
					enable: false
				},
				scales: {
					xAxes: [{
						type: 'time',
						time: {
							unit: 'hour'
						},
						ticks: {
							source: 'auto',
						}
					}]
				},
				animation: {
					duration: 0, // general animation time
				},
			};
			var myLineChart = new Chart(ctx, {
				type: type,
				data: data,
				options: options
			});
			
			var id = response.data[0].attributes.id;
			var time = response.data[0].attributes.time;
			var value = response.data[0].attributes.value;
			var unit = response.links.unit!==undefined?response.links.unit:'';
			var ttl = response.links.ttl;
			document.getElementById('snippet-time-'+params.id).innerHTML = moment(time).format(app.date_format) + "<small>, " + moment(time).fromNow() + "</small>";
			setInterval(function() {app.refreshFromNow('snippet-time-'+params.id, time)}, 10000);
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('getSnippet Inside error...' + error, {timeout:3000, type: 'error'});
			}
		});
	},
	getHtml: function(params) {
		if (!params) {
			params = {}
		}
		var html = `
		<div class="flowgraph tile card-flowgraph material-animate margin-top-4 material-animated mdl-shadow--2dp">
			<div class="contextual">
				<div class="mdl-list__item-primary-content">
					<i class="material-icons">${params.icon}</i>
					<span class="heading">${params.name}</span>
					<span class="heading pull-right">
						<button data-snippet-id="${params.id}" class="edit-snippet mdl-button mdl-js-button mdl-button--icon">
							<i class="material-icons">settings</i>
						</button>
					</span>
				</div>
			</div>
			<div class="mdl-list__item-primary-content">
				<div class="mdl-list__item" id="snippet-graph-${params.id}" style="width:100%; height:200px;">
					<canvas id="chart-${params.id}"></canvas>
				</span>
			</div>
			<div class="mdl-list__item-sub-title" id="snippet-time-${params.id}"></span>
		</div>`;
		return html;
	},
}
app.snippetTypes.push(snippet);
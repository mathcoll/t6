'use strict';
var snippet = {
	name: "cardChart",
	value: "Chart on a card",
	
	options: {
		color: {defaultValue: "#FF0000", type: 'text'},
		legend: {defaultValue: "top", type: 'select', availableValues: [true, false, "top", "bottom"]}
	},
	getSample: function() {
		var params = {
			
		};
		return snippet.getHtml(params);
	},
	activateOnce: function(params) {
		
	},
	getHtml: function(params) {
		if (!params) {
			params = {}
		}
		//else snippet += "		<div class='card-header' style='background: linear-gradient(60deg,#66bb6a,#66bb6a);'>";
		var html = `
		<div class="card card-chart material-animate margin-top-4 material-animated mdl-shadow--2dp">
			<div class="card-header" style="background: ${params.color}">
			<div class="ct-chart" id="dailySalesChart"></div>
			</div>
			<div class="card-body">
				<i class="material-icons">${params.icon}</i>
				<h4 class="card-title">${params.name}</h4>
				<p class="card-category">Subtitle</p>
			</div>
			<div class="card-footer">
				<div class="stats">
					<i class="material-icons" id="snippet-time-${params.id}">access_time</i> Last
				</div>
			</div>
		</div>`
		return html;
	},
}
app.snippetTypes.push(snippet);
'use strict';
var snippet = {
	name: "cardChart",
	value: "Chart on a card",
	
	options: {
		width: {defaultValue: "12", value: "12", type: 'select', availableValues: ["4", "6", "8", "12"]},
		color: {defaultValue: "#FF0000", type: 'text'},
		legend: {defaultValue: "top", type: 'select', availableValues: [true, false, "top", "bottom"]}
	},
	getSample: function() {
		var params = {
			
		};
		return snippet.getHtml(params);
	},
	activateOnce: function(params) {
		this.options.width.value = this.options.width.value!==null?this.options.width.value:this.options.width.defaultValue;
		document.getElementById(params.id).parentNode.classList.add("mdl-cell--" + this.options.width.value + "-col");
	},
	getHtml: function(params) {
		if (!params) {
			params = {}
		}
		//else snippet += "		<div class='card-header' style='background: linear-gradient(60deg,#66bb6a,#66bb6a);'>";
		var html = `
		<div id="${params.id}" class="card card-chart material-animate margin-top-4 material-animated mdl-shadow--2dp">
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
};
snippet.getOptions = function(s) { return s.options; }
app.snippetTypes.push(snippet);
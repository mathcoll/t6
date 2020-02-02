"use strict";
var snippet = {
	name: "sparkline",
	value: "Spark line",
	
	options: {
		width: {defaultValue: "12", value: "12", type: "select", availableValues: ["4", "6", "8", "12"]},
		color: {defaultValue: "#FF0000", type: "text"},
		legend: {defaultValue: "top", type: "select", availableValues: [true, false, "top", "bottom"]}
	},
	activateOnce: function(params) {
		this.options.width.value = this.options.width.value!==null?this.options.width.value:this.options.width.defaultValue;
		document.getElementById(params.id).parentNode.classList.add("mdl-cell--" + this.options.width.value + "-col");
	},
	getHtml: function(params) {
		if (!params) {
			params = {};
		}
		var html = `
		<div id="${params.id}" class="sparkline tile card-sparkline material-animate margin-top-4 material-animated mdl-shadow--2dp">
			<span class="mdl-list__item mdl-list__item--two-line">
				<span class="mdl-list__item-primary-content">
					<i class="material-icons">trending_up</i>
					<span class="heading">${params.title}</span>
					<span class="mdl-list__item-sub-title" id="snippet-time-${params.id}">◾◾/◾◾/◾◾◾◾ ◾◾:◾◾:◾◾</span>
				</span>
				<span class="mdl-list__item-secondary-content">
					<span class="mdl-list__item-sub-title mdl-chip mdl-chip__text" id="snippet-value-${params.id}"></span>
				</span>
				<span class="mdl-list__item" id="snippet-sparkline-" style="width:100%; height:200px;">
					<span class="mdl-list__item-sub-title mdl-chip mdl-chip__text">sparkline</span>
				</span>
			</span>
		</div>`;
		return html;
	},
};
snippet.getOptions = function(s) { return s.options; };
app.snippetTypes.push(snippet);
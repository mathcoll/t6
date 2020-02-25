"use strict";
var snippet = {
	name: "sparkline",
	value: "Spark line",

	options: {
		width: {default_value: "12", type: "select", available_values: ["4", "6", "8", "12"]},
		color: {defaultValue: "#FF0000", type: "text"},
		legend: {defaultValue: "top", type: "select", availableValues: [true, false, "top", "bottom"]}
	},
	activateOnce: function(params) {
		if ( typeof params.attributes.options !== "undefined" ) {
			this.options.width.value = typeof params.attributes.options.width.value!=="undefined"?params.attributes.options.width.value:this.options.width.default_value;
		} else  {
			this.options.width.value = "12";
		}
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
snippet.setOptions = function(opt) {
	var merged = {};
	var s = this;
	for (var attrname in s.options) { merged[attrname] = s.options[attrname]; }
	for (var attrname in opt) { merged[attrname] = opt[attrname]; }
	this.options = merged;
	return merged;
};
app.snippetTypes.push(snippet);
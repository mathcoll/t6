'use strict';
var snippet = {
	name: "simplerow",
	value: "Display one row for each value",
	
	options: {
		color: {defaultValue: "#FF0000", type: 'text'},
		legend: {defaultValue: "top", type: 'select', availableValues: [true, false, "top", "bottom"]}
	},
	activateOnce: function(params) {
		
	},
	getHtml: function(params) {
		if (!params) {
			params = {}
		}
		params.time = moment().format(app.date_format);
		var html = `<div class="simplerow tile card-simplerow material-animate margin-top-4 material-animated mdl-shadow--2dp">		
			<span class="mdl-list__item mdl-list__item--two-line">
				<span class="mdl-list__item-primary-content">
					<i class="material-icons">widgets</i>
					<span class="heading">${params.name}</span>
					<span class="mdl-list__item-sub-title" id="snippet-time-${params.id}">
						${params.time}
					</span>
				</span>
				<span class="mdl-list__item-secondary-content">
					<span class="mdl-list__item-sub-title mdl-chip mdl-chip__text" id="snippet-value-${params.id}">
						${params.value}
					</span>
				</span>
				<span class="heading pull-right">
					<button class="edit-snippet mdl-button mdl-js-button mdl-button--icon">
						<i class="material-icons">settings</i>
					</button>
				</span>
			</span>
		</div>`;
		return html;
	},
}
app.snippetTypes.push(snippet);
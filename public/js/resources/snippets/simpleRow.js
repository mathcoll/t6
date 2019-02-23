'use strict';
var snippet = {
	name: "simplerow",
	value: "Display one row for each value",
	
	options: {
		color: {defaultValue: "#FF0000", type: 'text'},
		legend: {defaultValue: "top", type: 'select', availableValues: [true, false, "top", "bottom"]}
	},
	getSample: function() {
		var html = "";
		html += "<div class='simplerow tile card-simplerow material-animate margin-top-4 material-animated mdl-shadow--2dp'>";		
		html += "<span class='mdl-list__item mdl-list__item--two-line'>";
		html += "<span class='mdl-list__item-primary-content'>";
		html += "<i class='material-icons'>widgets";
		html += "</i>";
		html += "<span class='heading'>Flow ID";
		html += "</span>";
		html += "<span class='mdl-list__item-sub-title' id='snippet-time-'>23/02/2019, 22:40";
		html += "<small>, 26 minutes ago";
		html += "</small>";
		html += "</span>";
		html += "</span>";
		html += "<span class='mdl-list__item-secondary-content'>";
		html += "<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text' id='snippet-value-'>value";
		html += "</span>";
		html += "</span>";
		html += "<span class='heading pull-right'>";
		html += "<button class='edit-snippet mdl-button mdl-js-button mdl-button--icon'>";
		html += "<i class='material-icons'>settings";
		html += "</i>";
		html += "</button>";
		html += "</span>";
		html += "</span>";
		html += "</div>";
		return html;
	},
	getHtml: function(params) {
		return "<div class='flowgraph tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>"+params.name+"</div>";
		//sprintf("<div class='valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>%s</div>", "");
	},
}
app.snippetTypes.push(snippet);
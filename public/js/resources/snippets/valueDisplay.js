'use strict';
var snippet = {
	name: "valueDisplay",
	value: "Value Display",
	
	options: {
		color: {defaultValue: "#FF0000", type: 'text'},
		legend: {defaultValue: "top", type: 'select', availableValues: [true, false, "top", "bottom"]}
	},
	getSample: function() {
		var html = "";
		html += "<div class='valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp is-ontime'>";
		html += "<div class='contextual'>";
		html += "	<div class='mdl-list__item-primary-content'> <i class='material-icons'>widgets</i>";
		html += "	<span class='heading'>Lorem ipsum dolor sit amet</span>";
		html += "		<span class='heading pull-right'>";
		html += "			<button class='edit-snippet mdl-button mdl-js-button mdl-button--icon'>";
		html += "				<i class='material-icons'>settings</i>";
		html += "				</button>";
		html += "		</span>";
		html += "	</div>";
		html += "<div class='mdl-list__item-secondary-content'>";
		html += "				<span class='snippet-value1' id='snippet-value1-'>";
		html += "				<i class='material-icons md-48'>trending_flat</i> 19 °C";
		html += "			</span>";
		html += "		<hr style=''>";
		html += "<span class='snippet-value2' id='snippet-value2-'>";
		html += "		<i class='material-icons'>trending_down</i> 19 °C";
		html += "	</span>";
		html += "	<hr style=''>";
		html += "		<span class='snippet-value3' id='snippet-value3-'>";
		html += "			<i class='material-icons'>trending_up</i> 20 °C</span>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='mdl-list__item-sub-title' id='snippet-time-'>23/02/2019, 22:40<small>, 13 minutes ago</small></div>";
		html += "</div>";
		return html;
	},
	getHtml: function(params) {
		return "<div class='valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>"+params.name+"</div>";
		//sprintf("<div class='valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>%s</div>", "");
	},
}
app.snippetTypes.push(snippet);
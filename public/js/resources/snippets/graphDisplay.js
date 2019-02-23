'use strict';
var snippet = {
	name: "graphDisplay",
	value: "Display a Graph from a flow",
	
	options: {
		color: {defaultValue: "#FF0000", type: 'text'},
		legend: {defaultValue: "top", type: 'select', availableValues: [true, false, "top", "bottom"]}
	},
	getSample: function() {
		return "<div class='graphdisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>This is graphdisplay sample code</div>";
	},
	getHtml: function(params) {
		return "<div class='graphdisplay tile card-graphdisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>"+params.name+"</div>";
		//sprintf("<div class='valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>%s</div>", "");
	},
}
app.snippetTypes.push(snippet);
var snippet = {
	id: "valueDisplay.js",
	name: "Value Display",
	options: {
		color: {defaultVvalue: "#FF0000"},
		legend: {defaultVvalue: "top", availableValues: [true, false, "top", "bottom"]}
	},
	getHtml: function(params) {
		return "<div class='valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>"+params.name+"</div>";
		//sprintf("<div class='valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp'>%s</div>", "");
	},
}
app.snippetTypes.push(snippet);
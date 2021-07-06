"use strict";
var snippet = {
	name: "valueDisplay",
	value: "Value Display",

	options: {
		width: {default_value: "6", type: "select", available_values: ["4", "6", "8", "12"]},
		color: {defaultValue: "#FF0000", type: "text"},
		legend: {defaultValue: "top", type: "select", availableValues: [true, false, "top", "bottom"]}
	},
	activateOnce: function(params) {
		if ( typeof params.attributes.options !== "undefined" ) {
			this.options.width.value = typeof params.attributes.options.width.value!=="undefined"?params.attributes.options.width.value:this.options.width.default_value;
		} else {
			this.options.width.value = "12";
		}
		document.getElementById(params.id).parentNode.classList.add("mdl-cell--" + this.options.width.value + "-col");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var limit = 4;
		var url = app.baseUrl+"/"+app.api_version+"/data/"+params.attributes.flows[0]+"?sort=desc&limit="+limit;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		}).then(function(response) {
			var id = response.data[0].attributes.id;
			var time = response.data[0].attributes.time;
			var unit = typeof response.links.unit_format!=="undefined"?response.links.unit_format:"%s";
			var ttl = typeof response.links.ttl!=="undefined"?response.links.ttl:3600;
			console.log("DEBUG", ttl);
			var value = [];
			for (var i=0; i<limit-1; i++) {
				var cur = i;
				var prev = i+1;
				if ( response.data[cur].attributes.value === response.data[prev].attributes.value ) {
					value[prev] = "<i class='material-icons md-48'>trending_flat</i> " + sprintf(unit, response.data[cur].attributes.value);
				} else if( response.data[cur].attributes.value < response.data[prev].attributes.value ) {
					value[prev] = "<i class='material-icons md-48'>trending_down</i> " + sprintf(unit, response.data[cur].attributes.value);
				} else if( response.data[cur].attributes.value > response.data[prev].attributes.value ) {
					value[prev] = "<i class='material-icons md-48'>trending_up</i> " + sprintf(unit, response.data[cur].attributes.value);
				}
				if ( moment().subtract(ttl, "seconds") > moment(time) ) {
					document.getElementById("snippet-value"+prev+"-"+params.id).parentNode.parentNode.parentNode.classList.remove("is-ontime");
					document.getElementById("snippet-value"+prev+"-"+params.id).parentNode.parentNode.parentNode.classList.add("is-outdated");
				} else {
					document.getElementById("snippet-value"+prev+"-"+params.id).parentNode.parentNode.parentNode.classList.remove("is-outdated");
					document.getElementById("snippet-value"+prev+"-"+params.id).parentNode.parentNode.parentNode.classList.add("is-ontime");
				}
				document.getElementById("snippet-value"+prev+"-"+params.id).innerHTML = value[prev];
			}
			setInterval(function() {app.refreshFromNow("snippet-time-"+params.id, time, true);}, 2000);
		}).catch(function (error) {
			if ( localStorage.getItem("settings.debug") == "true" ) {
				toast("getSnippet Inside error..." + error, {timeout:3000, type: "error"});
			}
		});
	},
	getHtml: function(params) {
		if (!params) {
			params = {};
		}
		params.time = moment().format(app.date_format);
		var html = `
		<div id="${params.id}" class="valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp is-ontime">
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
				<div class="mdl-list__item-secondary-content">
					<span class="snippet-value1" id="snippet-value1-${params.id}" style="color:${params.color} !important">
						<i class="material-icons md-48">trending_flat</i> ◾◾ ◾◾
					</span>
					<hr style="">
					<span class="snippet-value2" id="snippet-value2-${params.id}" style="color:${params.color} !important">
						<i class="material-icons">trending_flat</i> ◾◾ ◾◾
					</span>
					<hr style="">
					<span class="snippet-value3" id="snippet-value3-${params.id}" style="color:${params.color} !important">
						<i class="material-icons">trending_flat</i> ◾◾ ◾◾
					</span>
				</div>
			</div>
			<div class="mdl-list__item-sub-title" id="snippet-time-${params.id}">◾◾/◾◾/◾◾◾◾ ◾◾:◾◾:◾◾</div>
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
'use strict';
var snippet = {
	name: "valueDisplay",
	value: "Value Display",
	
	options: {
		color: {defaultValue: "#FF0000", type: 'text'},
		legend: {defaultValue: "top", type: 'select', availableValues: [true, false, "top", "bottom"]}
	},
	activateOnce: function(params) {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var limit = 4;
		var url = app.baseUrl+"/"+app.api_version+'/data/'+params.attributes.flows[0]+'?sort=desc&limit='+limit;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			var id = response.data[0].attributes.id;
			var time = response.data[0].attributes.time;
			var value = response.data[0].attributes.value;
			var unit = response.links.unit!==undefined?response.links.unit:'';
			var ttl = response.links.ttl;
			var value = [];
			for (var i=0; i<limit-1; i++) {
				var cur = i;
				var prev = i+1;
				if ( response.data[cur].attributes.value == response.data[prev].attributes.value ) {
					value[prev] = "<i class='material-icons md-48'>trending_flat</i> " + response.data[cur].attributes.value;
				} else if( response.data[cur].attributes.value < response.data[prev].attributes.value ) {
					value[prev] = "<i class='material-icons md-48'>trending_down</i> " + response.data[cur].attributes.value;
				} else if( response.data[cur].attributes.value > response.data[prev].attributes.value ) {
					value[prev] = "<i class='material-icons md-48'>trending_up</i> " + response.data[cur].attributes.value;
				}
				if ( moment().subtract(ttl, 'seconds') > moment(time) ) {
					document.getElementById('snippet-value'+prev+'-'+params.id).parentNode.parentNode.parentNode.classList.remove('is-ontime');
					document.getElementById('snippet-value'+prev+'-'+params.id).parentNode.parentNode.parentNode.classList.add('is-outdated');
				} else {
					document.getElementById('snippet-value'+prev+'-'+params.id).parentNode.parentNode.parentNode.classList.remove('is-outdated');
					document.getElementById('snippet-value'+prev+'-'+params.id).parentNode.parentNode.parentNode.classList.add('is-ontime');
				}
				document.getElementById('snippet-value'+prev+'-'+params.id).innerHTML = value[prev];
			}
			
			document.getElementById('snippet-time-'+params.id).innerHTML = moment(time).format(app.date_format) + "<small>, " + moment(time).fromNow() + "</small>";
			setInterval(function() {app.refreshFromNow('snippet-time-'+params.id, moment(), true)}, 6000);
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('getSnippet Inside error...' + error, {timeout:3000, type: 'error'});
			}
		});
	},
	getHtml: function(params) {
		if (!params) {
			params = {}
		}
		params.time = moment().format(app.date_format);
		var html = `<div class="valuedisplay tile card-valuedisplay material-animate margin-top-4 material-animated mdl-shadow--2dp is-ontime">
		<div class="contextual">
			<div class="mdl-list__item-primary-content">
				<i class="material-icons">widgets</i>
			<span class="heading">${params.name}</span>
				<span class="heading pull-right">
					<button class="edit-snippet mdl-button mdl-js-button mdl-button--icon">
						<i class="material-icons">settings</i>
						</button>
				</span>
			</div>
			<div class="mdl-list__item-secondary-content">
						<span class="snippet-value1" id="snippet-value1-${params.id}">
						<i class="material-icons md-48">trending_flat</i>
					</span>
				<hr style="">
			<span class="snippet-value2" id="snippet-value2-${params.id}">
				<i class="material-icons">trending_down</i>
			</span>
			<hr style="">
				<span class="snippet-value3" id="snippet-value3-${params.id}">
					<i class="material-icons">trending_up</i>
				</span>
				</div>
			</div>
			<div class="mdl-list__item-sub-title" id="snippet-time-${params.id}">${params.time}</div>
		</div>`;
		return html;
	},
}
app.snippetTypes.push(snippet);
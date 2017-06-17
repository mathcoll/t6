(function() {
	'use strict';

	var app = {
		api_version: 'v2.0.1',
		spinner: document.querySelector('section#loading-spinner'),
		baseUrl: '',
		bearer: '',
		userHash: '',
		date_format: 'DD/MM/YYYY, HH:mm',
	};

	// Add service worker code here
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
		.register('./service-worker.js')
		.then(function() {
			console.log('[ServiceWorker] Registered');
		})
		.catch(function (error) {
			console.log('[ServiceWorker] error occured...'+ error);
		});
	}
	
	/*Notification.requestPermission(function(status) {
		// status is "granted", if accepted by user
	});*/

	var cardsWidth = {'objects': '12', 'flows': '12', 'snippets': '12', 'dashboards': '12', 'rules': '12', 'mqtts': '12', 'login': '12'}
	var icons = {'objects': 'devices_other', 'flows': 'settings_input_component', 'snippets': 'widgets', 'dashboards': 'dashboards', 'rules': '', 'mqtts': '', 'login': ''}
	var containers = {};
	containers.index = document.querySelector('section#index');
	containers.objects = document.querySelector('section#objects');
	containers.object = document.querySelector('section#object');
	containers.flows = document.querySelector('section#flows');
	containers.flow = document.querySelector('section#flow');
	containers.dashboards = document.querySelector('section#dashboards');
	containers.dashboard = document.querySelector('section#dashboard');
	containers.snippets = document.querySelector('section#snippets');
	containers.snippet = document.querySelector('section#snippet');
	containers.profile = document.querySelector('section#profile');

	
	app.nl2br = function (str, isXhtml) {
		var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	};

	app.setExpandAction = function() {
		componentHandler.upgradeDom();
		var expandButtons = document.querySelectorAll('.showdescription_button');
		for (var i in expandButtons) {
			if ( (expandButtons[i]).childElementCount > -1 ) {
				(expandButtons[i]).addEventListener('click', function(evt) {
					var id = (evt.target.parentElement).getAttribute('for');
					document.getElementById(id).classList.toggle('hidden');
					if ( evt.target.innerHTML == 'expand_more' ) {
						evt.target.innerHTML = 'expand_less';
					} else {
						evt.target.innerHTML = 'expand_more';
					}
				}, false);
			}
		}
	} //setExpandAction
	
	app.setSection = function(section) {
		document.querySelector('section.is-active').classList.remove('is-active');
		document.querySelector('#'+section).classList.add('is-active');
		window.scrollTo(0, 0);
	};

	app.setItemsClickAction = function(type) {
		var items = document.querySelectorAll("[data-action='view']");
		for (var i in items) {
			if ( type == 'objects' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displayObject(item.dataset.id, false);
					evt.preventDefault();
				});
			} else if ( type == 'flows' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displayFlow(item.dataset.id);
					evt.preventDefault();
				});
			} else if ( type == 'dashboards' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displayDashboard(item.dataset.id);
					evt.preventDefault();
				});
			} else if ( type == 'snippets' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displaySnippet(item.dataset.id);
					evt.preventDefault();
				});
			}
		}
	}; //setItemsClickAction

	app.setListActions = function(type) {
		var dialog = document.querySelector('#dialog');
		if ( type == 'objects' ) {
			var deleteButtons = document.querySelectorAll('#objects .delete-button');
			for (var d=0;d<deleteButtons.length;d++) {
				//console.log(deleteButtons[d]);
				deleteButtons[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = 'Delete Object';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.currentTarget.dataset.name+'\"?</p>'; //
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button cancel-button">No, Cancel</button> <button class="mdl-button btn danger">Yes</button>';
					dialog.showModal();
					evt.preventDefault();
					
					dialog.querySelector('.cancel-button').addEventListener('click', function(evt) {
						dialog.close();
						evt.preventDefault();
					});
				});
			}
			var editButtons = document.querySelectorAll('#objects .edit-button');
			for (var e=0;e<editButtons.length;e++) {
				//console.log(editButtons[e]);
				editButtons[e].addEventListener('click', function(evt) {
					app.displayObject(evt.currentTarget.dataset.id, true);
					evt.preventDefault();
				});
			}
		} else if ( type == 'flows' ) {
			var deleteButtons = document.querySelectorAll('#flows .delete-button');
			for (var d=0;d<deleteButtons.length;d++) {
				//console.log(deleteButtons[d]);
				deleteButtons[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = 'Delete Flow';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.currentTarget.dataset.name+'\"?</p>'; //
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button cancel-button">No, Cancel</button> <button class="mdl-button btn danger">Yes</button>';
					dialog.showModal();
					evt.preventDefault();
	
					dialog.querySelector('.cancel-button').addEventListener('click', function(evt) {
						dialog.close();
						evt.preventDefault();
					});
				});
			}
		} else if ( type == 'dashboards' ) {
			var deleteButtons = document.querySelectorAll('#dashboards .delete-button');
			for (var d=0;d<deleteButtons.length;d++) {
				//console.log(deleteButtons[d]);
				deleteButtons[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = 'Delete Dashboard';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.currentTarget.dataset.name+'\"?</p>'; //
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button cancel-button">No, Cancel</button> <button class="mdl-button btn danger">Yes</button>';
					dialog.showModal();
					evt.preventDefault();
	
					dialog.querySelector('.cancel-button').addEventListener('click', function(evt) {
						dialog.close();
						evt.preventDefault();
					});
				});
			}
		} else if ( type == 'snippets' ) {
			var deleteButtons = document.querySelectorAll('#snippets .delete-button');
			for (var d=0;d<deleteButtons.length;d++) {
				//console.log(deleteButtons[d]);
				deleteButtons[d].addEventListener('click', function(evt) {
					dialog.querySelector('h3').innerHTML = 'Delete Snippet';
					dialog.querySelector('.mdl-dialog__content').innerHTML = '<p>Do you really want to delete \"'+evt.currentTarget.dataset.name+'\"?</p>'; //
					dialog.querySelector('.mdl-dialog__actions').innerHTML = '<button class="mdl-button cancel-button">No, Cancel</button> <button class="mdl-button btn danger">Yes</button>';
					dialog.showModal();
					evt.preventDefault();
	
					dialog.querySelector('.cancel-button').addEventListener('click', function(evt) {
						dialog.close();
						evt.preventDefault();
					});
				});
			}
		}
	} //setListActions

	app.displayObject = function(id, isEditMode) {
		window.scrollTo(0, 0);
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/objects/'+id;
		fetch(url, myInit)
		.then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var object = response.data[i];
				var node = "";
				node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
				node += "	<div class=\"mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-card__title\">";
				node += "			<h2 class=\"mdl-card__title-text\">";
				node += "				<i class=\"material-icons\">"+icons.objects+"</i>";
				node += "				"+object.attributes.name;
				node += "			</h2>";
				node += "		</div>";
				if ( object.attributes.description ) {
					node += app.getField(null, null, app.nl2br(object.attributes.description), isEditMode, false, false, true);
				}
				if ( object.attributes.meta.created ) {
					node += app.getField('event', 'Created', moment(object.attributes.meta.created).format(app.date_format), false, false, false, true);
				}
				if ( object.attributes.meta.updated ) {
					node += app.getField('event', 'Updated', moment(object.attributes.meta.updated).format(app.date_format), false, false, false, true);
				}
				if ( object.attributes.meta.revision ) {
					node += app.getField('update', 'Revision: ', object.attributes.meta.revision, false, false, false, true);
				}
				if ( object.attributes.type ) {
					node += app.getField('extension', 'Type', object.attributes.type, isEditMode, false, false, true);
				}
				if ( object.attributes.ipv4 ) {
					node += app.getField('my_location', 'IPv4', object.attributes.ipv4, isEditMode, false, false, true);
				}
				if ( object.attributes.ipv6 ) {
					node += app.getField('my_location', 'IPv6', object.attributes.ipv6, isEditMode, false, false, true);
				}
				if ( object.attributes.is_public == "true" && !isEditMode ) {
					node += app.getField('visibility', 'Visibility', object.attributes.is_public, isEditMode, false, false, true);
					node += app.getQrcodeImg('event', '', object.id, false, false, false);
					app.getQrcode('event', '', object.id, false, false, false);
				} else {
					node += app.getField('visibility_off', 'Visibility', object.attributes.is_public, isEditMode, false, false, true);
				}
				if ( object.attributes.longitude ) {
					node += app.getField('place', 'Longitude', object.attributes.longitude, isEditMode, false, false, true);
				}
				if ( object.attributes.latitude ) {
					node += app.getField('place', 'Latitude', object.attributes.latitude, isEditMode, false, false, true);
				}
				if ( object.attributes.position ) {
					node += app.getField('pin_drop', 'Position', object.attributes.position, isEditMode, false, false, true);
				}
				if ( object.attributes.longitude && object.attributes.latitude ) {
					node += app.getMap('my_location', 'osm', object.attributes.longitude, object.attributes.latitude, false, false);
				}
				node += "	</div>";
				node += "</section>";

				(containers.object).querySelector('.page-content').innerHTML = node;
				componentHandler.upgradeDom();
				
				if ( object.attributes.longitude && object.attributes.latitude ) {
					var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point(new ol.proj.transform([object.attributes.longitude, object.attributes.latitude], 'EPSG:4326', 'EPSG:3857')),
						name: object.attributes.name,
						position: object.attributes.position,
					});
					var iconStyle = new ol.style.Style({
						image: new ol.style.Icon(({
							anchor: [12, 12],
							anchorXUnits: 'pixels',
							anchorYUnits: 'pixels',
							opacity: .8,
							size: [24, 24],
							src: app.baseUrl+'/js/OpenLayers/img/marker.png'
						}))
					});
					iconFeature.setStyle(iconStyle);
					var vectorSource = new ol.source.Vector({});
					vectorSource.addFeature(iconFeature);
					var vectorLayer = new ol.layer.Vector({
						source: vectorSource
					});
					var popup = new ol.Overlay({
						element: document.getElementById('popup'),
						//positioning: 'top',
						stopEvent: false
					});
					var map = new ol.Map({
						layers: [
					         new ol.layer.Tile({ source: new ol.source.OSM() }),
					         vectorLayer,
					         ],
					         target: 'osm',
					         view: new ol.View({
					        	 center: ol.proj.fromLonLat([object.attributes.longitude, object.attributes.latitude]),
					        	 zoom: 2,
					         }),
					});
					map.updateSize();
		        }
				app.setSection('object');
			}
		})
		.catch(function (error) {
			toast('displayObject error occured...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	}; //displayObject

	app.displayFlow = function(id) {
		window.scrollTo(0, 0);
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/flows/'+id;
		fetch(url, myInit)
		.then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var flow = response.data[i];
				var node = "";
				node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+flow.id+"\">";
				node += "	<div class=\"mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<i class=\"material-icons\">"+icons.flows+"</i>";
				node += "				"+flow.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
				if ( flow.attributes.description ) {
					node += app.getField(null, null, app.nl2br(flow.attributes.description), false, false, false, true);
				}
				if ( flow.attributes.meta.created ) {
					node += app.getField('event', 'Created', moment(flow.attributes.meta.created).format(app.date_format), false, false, false, true);
				}
				if ( flow.attributes.meta.updated ) {
					node += app.getField('event', 'Updated', moment(flow.attributes.meta.updated).format(app.date_format), false, false, false, true);
				}
				if ( flow.attributes.meta.revision ) {
					node += app.getField('update', 'Revision: ', flow.attributes.meta.revision, false, false, false, true);
				}
				if ( flow.attributes.type ) {
					node += app.getField('extension', 'Type', flow.attributes.type, false, false, false, true);
				}
				if ( flow.attributes.permission ) {
					node += app.getField('visibility', 'Permission', flow.attributes.permission, false, false, false, true);
				}
				node += "	</div>";
				node += "</section>";
				
				node += "<section class='mdl-grid mdl-cell--12-col' id='"+flow.id+"'>";
				node += "	<div class='mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
				node += "		<span class='mdl-list__item mdl-list__item--two-line'>";
				node += "			<span class='mdl-list__item-primary-content'>";
				node +=	"				<span>"+flow.attributes.name+" ("+flow.attributes.unit+")</span>";
				node +=	"				<span class='mdl-list__item-sub-title' id='snippet-time-"+flow.id+"'></span>";
				node +=	"			</span>";
				node +=	"		</span>";
				node += "		<span class='mdl-list__item' id='flow-graph-"+flow.id+"' style='width:100%; height:200px;'>";
				node += "			<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text'></span>";
				node += "		</span>";
				var options = {
					series: { lines : { show: true, fill: 'false', lineWidth: 3, steps: false } },
					colors: [flow.attributes.color],
					points : { show : true },
					legend: { show: true, position: "sw" },
					grid: {
						borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
						borderColor: { top: "", right: "", bottom: "", left: "" },
						// markings: weekendAreas,
						clickable: true,
						hoverable: true,
						autoHighlight: true,
						mouseActiveRadius: 5
					},
					xaxis: { mode: "time", autoscale: true, timeformat: "%d/%m/%Y<br/>%Hh%M" },
					yaxis: [ { autoscale: true, position: "left" }, { autoscale: true, position: "right" } ],
				};

				var my_flow_data_url = app.baseUrl+'/'+app.api_version+'/data/'+flow.id+'?limit=100&sort=desc';
				fetch(my_flow_data_url, myInit)
				.then(function(fetchResponse){ 
					return fetchResponse.json();
				})
				.then(function(data) {
					var dataset = [data.data.map(function(i) {
						return [i.attributes.timestamp, i.attributes.value];
				    })];
					$.plot($('#flow-graph-'+flow.id), dataset, options);
				})
				.catch(function (error) {
					toast('displayFlow error out...' + error, 5000);
				});
				node +=	"	</div>";
				node +=	"</section>";

				(containers.flow).querySelector('.page-content').innerHTML = node;
				app.setExpandAction();
				componentHandler.upgradeDom();
				app.setSection('flow');
			}
		})
		.catch(function (error) {
			toast('displayFlow error occured...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	}; //displayFlow

	app.displayDashboard = function(id) {
		window.scrollTo(0, 0);
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/dashboards/'+id;
		fetch(url, myInit)
		.then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var dashboard = response.data[i];
				var node;
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
				node += "	<div class=\"mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<h2 class=\"mdl-card__title-text\">"+dashboard.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
				if ( dashboard.attributes.description ) {
					node += app.getField(null, null, app.nl2br(dashboard.attributes.description), false, false, false, true);
				}
				if ( dashboard.attributes.meta.created ) {
					node += app.getField('event', 'Created', moment(dashboard.attributes.meta.created).format(app.date_format), false, false, false, true);
				}
				if ( dashboard.attributes.meta.updated ) {
					node += app.getField('event', 'Updated', moment(dashboard.attributes.meta.updated).format(app.date_format), false, false, false, true);
				}
				if ( dashboard.attributes.meta.revision ) {
					node += app.getField('update', 'Revision: ', dashboard.attributes.meta.revision, false, false, false, true);
				}
				node += "		</div>";
				node += "	</div>";
				node += "</section>";
				(containers.dashboard).querySelector('.page-content').innerHTML = node;
				app.setExpandAction();
				componentHandler.upgradeDom();
				
				for ( var i=0; i < dashboard.attributes.snippets.length; i++ ) {
					app.getSnippet(icons.snippets, dashboard.attributes.snippets[i]);
				}

				app.setSection('dashboard');
			}
		})
		.catch(function (error) {
			toast('displayDashboard error occured...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	}; //displayDashboard
	
	/*
	app.getAllEventListeners = function(el) {
		var allListeners = {}, listeners;

		while(el) {
			listeners = getEventListeners(el);

			for(event in listeners) {
				allListeners[event] = allListeners[event] || [];
				allListeners[event].push({listener: listeners[event], element: el});  
			}

			el = el.parentNode;
		}

		return allListeners;
	}
	*/

	app.displaySnippet = function(id) {
		window.scrollTo(0, 0);
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/snippets/'+id;
		fetch(url, myInit)
		.then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var snippet = response.data[i];
				var node = "";
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
				node += "	<div class=\"mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<h2 class=\"mdl-card__title-text\">";
				node += "					<i class=\"material-icons\">"+icons.snippets+"</i>";
				node += "					"+snippet.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
				if ( snippet.attributes.description ) {
					node += app.getField(null, null, app.nl2br(snippet.attributes.description), false, false, false, true);
				}
				if ( snippet.attributes.meta.created ) {
					node += app.getField('event', 'Created', moment(snippet.attributes.meta.created).format(app.date_format), false, false, false, true);
				}
				if ( snippet.attributes.meta.updated ) {
					node += app.getField('event', 'Updated', moment(snippet.attributes.meta.updated).format(app.date_format), false, false, false, true);
				}
				if ( snippet.attributes.meta.revision ) {
					node += app.getField('update', 'Revision: ', snippet.attributes.meta.revision, false, false, false, true);
				}
				node += "		</div>";
				node += "	</div>";
				node += "</section>";
				
				node += "<section class='mdl-grid mdl-cell--12-col' id='"+snippet.id+"'>";
				node += "	<div class=\"mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += app.getField(null, 'Name', snippet.attributes.name, false, false, false, true);
				node += app.getField(null, 'Type', snippet.attributes.type, false, false, false, true);
				node += app.getField(null, 'Icon', snippet.attributes.icon, false, false, false, true);
				node += app.getField(null, 'Color', snippet.attributes.color, false, false, false, true);
				node += "	</div>";
				node +=	"</section>";
				
				(containers.snippet).querySelector('.page-content').innerHTML = node;
				app.setExpandAction();
				componentHandler.upgradeDom();
				app.setSection('snippet');
			}
		})
		.catch(function (error) {
			toast('displayFlow error occured...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	}; //displaySnippet

	app.displayListItem = function(type, width, iconName, item) {
		var name = item.attributes.name!==undefined?item.attributes.name:"";
		var description = item.attributes.description!==undefined?item.attributes.description.substring(0, 128):"";
		var node = "";
		node += "<section class=\"mdl-grid mdl-cell--"+width+"-col\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+item.id+"\">";
		node += "	<div class=\"mdl-cell mdl-cell--"+width+"-col mdl-card mdl-shadow--2dp\">";
		node += "		<div class=\"mdl-card__title mdl-js-button mdl-js-ripple-effect\">";
		node += "			<h2 class=\"mdl-card__title-text\">";
		node += "			<i class=\"material-icons\">"+iconName+"</i>";
		node += "			"+name+"</h2>";
		node += "		</div>";
		if ( description ) {
			node += app.getField(null, null, description, false, false, false, true);
		}
		node += "		<div class=\"mdl-card__actions mdl-card--border\">";
		node += "			<button id=\"menu_"+item.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		node += "				<i class=\"material-icons\">menu</i>";
		node += "			</button>";
		node += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+item.id+"\">";
		node += "				<li class=\"mdl-menu__item\">";
		node += "					<i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+item.id+"\" data-name=\""+name+"\">delete</i>Delete";
		node += "				</li>";
		node += "				<li class=\"mdl-menu__item\">";
		node += "					<i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+item.id+"\" data-name=\""+name+"\">edit</i>Edit";
		node += "				</li>";
		node += "			</ul>";
		node += "		</div>";
		node += "	</div>";
		node += "</section>";
		
		return node;
	} //displayListItem

	app.fetchItems = function(type, filter) {
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };

		if (type == 'objects') {
			var icon = icons.objects;
			var width = cardsWidth.objects;
			var container = (containers.objects).querySelector('.page-content');
			var url = app.baseUrl+'/'+app.api_version+'/objects';
			if ( filter !== undefined ) {
				url += "?name="+escape(filter);
			}
			var title = 'My Objects';
		} else if (type == 'flows') {
			var icon = icons.flows;
			var width = cardsWidth.flows;
			var container = (containers.flows).querySelector('.page-content');
			var url = app.baseUrl+'/'+app.api_version+'/flows';
			if ( filter !== undefined ) {
				url += "?name="+escape(filter);
			}
			var title = 'My Flows';
		} else if (type == 'dashboards') {
			var icon = icons.dashboards;
			var width = cardsWidth.dashboards;
			var container = (containers.dashboards).querySelector('.page-content');
			var url = app.baseUrl+'/'+app.api_version+'/dashboards';
			var title = 'My Dashboards';
		} else if (type == 'snippets') {
			var icon = icons.snippets;
			var width = cardsWidth.snippets;
			var container = (containers.snippets).querySelector('.page-content');
			var url = app.baseUrl+'/'+app.api_version+'/snippets';
			var title = 'My Snippets';
		} else {
			type='undefined';
			toast('Error ' + error, 5000);
		}

		if (type) {
			fetch(url, myInit)
			.then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				if ( filter !== undefined ) { // If we have some filters we should clear the display first
					container.innerHTML = "";
				}
				for (var i=0; i < (response.data).length ; i++ ) {
					var item = response.data[i];
					var node = app.displayListItem(type, width, icon, item);
					container.innerHTML += node;
				}
				componentHandler.upgradeDom();
				app.setItemsClickAction(type);
				app.setListActions(type);
			})
			.catch(function (error) {
				toast('fetchItems '+type+' error occured...'+ error, 5000);
			});
		} else {
			toast('Error: No type defined', 5000);
		}
		app.spinner.setAttribute('hidden', true);
	}; //fetchItems

	app.fetchProfile = function() {
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (containers.profile).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/users/me/token';
		var title = 'My Profile';

		fetch(url, myInit)
		.then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			var user = response.data;
			var gravatar = user.attributes.gravatar.entry[0];
			var node = "";
			node += "<section class=\"mdl-grid\">";
			node += "	<div class=\"mdl-card mdl-card--small mdl-cell mdl-cell--12-col mdl-shadow--2dp mdl-card--horizontal\">";
			//node += "		<div class=\"mdl-card__supporting-text\">";
			//node += "		</div>";
			node += "		<div class=\"mdl-card__image\" style=\"color:"+gravatar.profile_background.color+"; background:url("+gravatar.profile_background.url+") no-repeat scroll 50% 50%\">";
			node += "  			<h2 class=\"mdl-card__title\" style=\"color:"+gravatar.profile_background.color+";\">"+user.attributes.first_name+" "+user.attributes.last_name+"</h2>";
			node += "			<img src=\"//gravatar.com/avatar/"+hex_md5(user.attributes.email)+"\" alt=\"User Profile\">";
			node += app.getField('location_on', 'Location', gravatar.current_location, false, false, false, true);
			for (var phone in gravatar.phone_numbers) {
				node += app.getField('phone', gravatar.phone_numbers[phone].type, gravatar.phone_numbers[phone].value, false, false, false, true);
			}
			node += "		</div>";
            node += "  		<div class=\"mdl-card__supporting-text mdl-grid--no-spacing\">";
            node += "			<ul class='no-padding'>"; 
            for (var account in gravatar.accounts) {
            	node += "  	 		  <li><a href=\""+gravatar.accounts[account].url+"\"><i class=\"material-icons\">link</i>" + gravatar.accounts[account].shortname + "</a></li>";
            }
            node += "  			</ul>";
            node += "  		</div>";
            node += "  		<div class=\"mdl-card__supporting-text mdl-grid--no-spacing\">";
            node += "			<ul class='no-padding'>"; 
            for (var url in gravatar.urls) {
            	node += "  	 		  <li><a href=\""+gravatar.urls[url].value+"\"><i class=\"material-icons\">bookmark</i>" + gravatar.urls[url].title + "</a></li>";
            }
            node += "  			</ul>";
            node += "  		</div>";
			node += "  		<div class=\"mdl-card__actions mdl-card--border\">";
			node += "    		<button class=\"mdl-card__button mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" href=\"" + gravatar.profile_url + "\">SEE PROFILE</button>";
			node += "    		<button class=\"mdl-card__button mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\">EDIT ON GRAVATAR</button>";
			node += "  		</div>";
			node += "	</div>";
			node += "</section>";
			container.innerHTML = node;
			
		})
		.catch(function (error) {
			toast('fetchProfile error out...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	}; //fetchProfile

	app.fetchIndex = function() {
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (containers.index).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/index';
		var title = '';

		fetch(url, myInit)
		.then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			var node = "";
			for (var i=0; i < (response).length ; i++ ) {
				var index = response[i];
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if( index.image ) {
					node += "		<div class=\"mdl-card__title\" style=\"background-image:url("+index.image+");\">";
				} else {
					node += "		<div class=\"mdl-card__title\">";
				}
				node += "				<h2 class=\"mdl-card__title-text\">" + index.title + "</h2>" + 
	            "					</div>" +
	            "  	 				<div class=\"mdl-card__supporting-text\">" + index.description + "</div>" +
	            "  	 				<div class=\"mdl-card__actions mdl-card--border\">" +
	            "						<a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" href=\""+ index.url +"\"> Get Started</a>" +
	            "					</div>" +
	            "			</div>";
				node += "</section>";
            }
			container.innerHTML = node;
		})
		.catch(function (error) {
			toast('fetchIndex error out...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	}; //fetchIndex

	app.getField = function(icon, label, value, isEditable, isActionable, isThreeLines, isVisible) {
		var field = "";
		var hidden = isVisible===true?"":" hidden";
		if ( isThreeLines == true) {
			field = "<div class='mdl-list__item mdl-list__item--three-line "+hidden+"'>";
		} else {
			field = "<div class='mdl-list__item "+hidden+"'>";
		}

		//- PRIMARY
		if ( icon != null || label != null ) {
			field += "<span class='mdl-list__item-primary-content'>";
			if ( icon != null ) {
				field += "<i class='material-icons'>"+icon+"</i>";
			}
			if ( label != null ) {
				field += "<label>"+label+"</label>";
			}
			field += "</span>";
		}
		//- ---------

		//- SECONDARY
		field += "<span class='mdl-list__item-secondary-content'>";
		if ( isEditable == true ) {
			field += "<span class='mdl-list__item-sub-title'><input type='text' value='"+value+"' /></span>";
		} else {
			field += "<span class='mdl-list__item-sub-title'>"+value+"</span>";
		}
		field += "</span>";
		//- ---------

		//- ACTIONS
		if ( isActionable == true ) {
			field += "<span class='mdl-list__item-secondary-content'>";
			field += "	<span class='mdl-list__item-secondary-action'></span>";
			field += "</span>";
		}
		field += "</div>";
		//- ---------
		
		return field;
	} //getField

	app.getSnippet = function(icon, snippet_id) {
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var dashboard_container = (containers.dashboard).querySelector('.page-content');
		var url = app.baseUrl+'/'+app.api_version+'/snippets/'+snippet_id;

		fetch(url, myInit)
		.then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			var my_snippet = response.data[0];
			var snippet = "<section class='mdl-grid mdl-cell--12-col' id='"+my_snippet.id+"'>";
			snippet +=	"	<div class='mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
			snippet +=	"		<span class='mdl-list__item mdl-list__item--two-line'>";
			snippet +=	"			<span class='mdl-list__item-primary-content'>";
			snippet +=	"				<i class='material-icons'>"+icon+"</i>";
			snippet +=	"				<span>"+my_snippet.attributes.name+"</span>";
			snippet +=	"				<span class='mdl-list__item-sub-title' id='snippet-time-"+my_snippet.id+"'></span>";
			snippet +=	"			</span>";
			
			if ( my_snippet.attributes.type == 'valuedisplay' ) {
				snippet += "		<span class='mdl-list__item-secondary-content'>";
				snippet += "			<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text' id='snippet-value-"+my_snippet.id+"'></span>";
				snippet += "		</span>";
			} else if ( my_snippet.attributes.type == 'sparkline' ) {
				snippet += "		<span class='mdl-list__item-secondary-content'>";
				snippet += "			<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text' id='snippet-value-"+my_snippet.id+"'></span>";
				snippet += "		</span>";
				snippet += "		<span class='mdl-list__item' id='snippet-sparkline-"+my_snippet.id+"' style='width:100%; height:200px;'>";
				snippet += "			<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text'></span>";
				snippet += "		</span>";
			} else if ( my_snippet.attributes.type == 'flowgraph' ) {
				snippet += "	</span>";
				snippet += "	<span class='mdl-list__item-primary-content'>";
				snippet += "		<span class='mdl-list__item' id='snippet-graph-"+my_snippet.id+"' style='width:100%; height:200px;'>";
				snippet += "			<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text'></span>";
				snippet += "		</span>";
				var options = {
					series: { lines : { show: true, fill: 'false', lineWidth: 3, steps: false } },
					colors: [my_snippet.attributes.color],
					points : { show : true },
					legend: { show: true, position: "sw" },
					grid: {
						borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
						borderColor: { top: "", right: "", bottom: "", left: "" },
						// markings: weekendAreas,
						clickable: true,
						hoverable: true,
						autoHighlight: true,
						mouseActiveRadius: 5
					},
					xaxis: { mode: "time", autoscale: true, timeformat: "%d/%m/%Y<br/>%Hh%M" },
					yaxis: [ { autoscale: true, position: "left" }, { autoscale: true, position: "right" } ],
				};

				var my_snippet_data_url = app.baseUrl+'/'+app.api_version+'/data/'+my_snippet.attributes.flows[0]+'?limit=100&sort=desc';
				fetch(my_snippet_data_url, myInit)
				.then(function(fetchResponse){ 
					return fetchResponse.json();
				})
				.then(function(data) {
					var dataset = [data.data.map(function(i) {
						return [i.attributes.timestamp, i.attributes.value];
				    })];
					$.plot($('#snippet-graph-'+my_snippet.id), dataset, options);
				})
				.catch(function (error) {
					toast('fetchIndex error out...' + error, 5000);
				});
			}
			
			if ( false ) {
				snippet += "			<span class='mdl-list__item-secondary-action'>";
				snippet += "				<i class='material-icons'>chevron_right</i>";
				snippet += "			</span>";
			}

			snippet += "	</span>";
			snippet += "	</div>";
			snippet += "</section>";
			var c = document.createElement('div');
			c.innerHTML = snippet;
			dashboard_container.appendChild(c);
			componentHandler.upgradeDom();
			
			if ( my_snippet.attributes.type == 'valuedisplay' ) {
				var url_snippet = app.baseUrl+"/"+app.api_version+'/data/'+my_snippet.attributes.flows[0]+'?sort=desc&limit=1';
				fetch(url_snippet, myInit)
				.then(function(fetchResponse){ 
					return fetchResponse.json();
				})
				.then(function(response) {
					//console.log("Get data from Flow: "+ url_snippet);
					var id = response.data[0].attributes.id;
					var time = response.data[0].attributes.time;
					var value = response.data[0].attributes.value;
					var unit = response.links.unit!==undefined?response.links.unit:'';
					var ttl = response.links.ttl;
					document.getElementById('snippet-value-'+my_snippet.id).innerHTML = value+" "+unit;
					document.getElementById('snippet-time-'+my_snippet.id).innerHTML = moment(time).format(app.date_format) + ", " + moment(time).fromNow();;
				})
				.catch(function (error) {
					toast('getSnippet Inside error...' + error, 5000);
				});
			}
			//console.log(dashboard_container);
			//return snippet;
		})
		.catch(function (error) {
			toast('getSnippet error out...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	} //getSnippet

	app.getQrcodeImg = function(icon, label, id) {
		var field = "<div class='mdl-list__item'>";
		field += "	<span class='mdl-list__item-primary-content'>";
		field += "		<img src='' id='qr-"+id+"' class='img-responsive' />";
		field += "	</span>";
		field += "</div>";
		return field;
	} //getQrcodeImg

	app.getQrcode = function(icon, label, id) {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/objects/"+id+"/qrcode/18/H";
		
		fetch(url, myInit)
		.then(function(fetchResponse){
			return fetchResponse.json();
		})
		.then(function(response) {
			if ( response ) {
				var container = document.getElementById('qr-'+id);
				container.setAttribute('src', response.data);
			}
		})
		.catch(function (error) {
			toast('fetch Qrcode error out...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	} //getQrcode

	app.getMap = function(icon, id, longitude, latitude, isEditable, isActionable) {
		var field = "<div class='mdl-list__item'>";
		field += "	<span class='mdl-list__item-primary-content' id='"+id+"' style='width:100%; height:400px;'></span>";
		field += "</div>";
		return field;
	} //getMap

	document.getElementById('search-exp').addEventListener('keypress', function(e) {
	    if(e.keyCode === 13) {
	        e.preventDefault();
	        var input = this.value;
	        alert("Searching for "+input);
	    }
	});
	
	document.getElementById('filter-exp').addEventListener('keypress', function(e) {
	    if(e.keyCode === 13) {
	        e.preventDefault();
	        var input = this.value;
	        var type = 'objects';
	        if ( document.querySelector('section#objects').classList.contains('is-active') ) {
	        	type = 'objects';
	        } else if ( document.querySelector('section#flows').classList.contains('is-active') ) {
	        	type = 'flows';
	        }
	        app.fetchItems(type, this.value);
	    }
	});

	app.fetchIndex('index');
	app.fetchItems('objects');
	app.fetchItems('flows');
	app.fetchItems('dashboards');
	app.fetchItems('snippets');
	app.fetchProfile();
})();

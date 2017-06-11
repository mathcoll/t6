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
	
	window.addEventListener('hashchange', function() {
	    console.log('this view\'s id is ', location.hash.substr(1));
	});

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
	containers.dashboards = document.querySelector('section#dashboards');
	containers.dashboard = document.querySelector('section#dashboard');
	containers.snippets = document.querySelector('section#snippets');
	containers.snippet = document.querySelector('section#snippet');
	containers.profile = document.querySelector('section#profile');

	
	app.nl2br = function (str, isXhtml) {
		var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	};
	
	app.setSection = function(section) {
		document.querySelector('section.is-active').classList.remove('is-active');
		document.querySelector('#'+section).classList.add('is-active');
	};

	app.updateActions = function(type) {
		var items = document.querySelectorAll("[data-action='view']");
		for (var i in items) {
			if ( type == 'objects' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displayObject(item.dataset.id);
					evt.preventDefault();
				});
			} else if ( type == 'dashboards' && (items[i]) !== undefined && (items[i]).childElementCount > -1 && (items[i]).getAttribute('data-type') == type ) {
				((items[i]).querySelector("div.mdl-card__title")).addEventListener('click', function(evt) {
					var item = evt.target.parentNode.parentNode.parentNode;
					app.displayDashboard(item.dataset.id);
					evt.preventDefault();
				});
			}
		}
	};

	app.displayObject = function(id) {
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
				var node = "" +
				"<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">" +
				"	<div class=\"mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp\">" +
				"		<div class=\"mdl-card__title\">" +
				"			<h2 class=\"mdl-card__title-text\">"+object.attributes.name+"</h2>" +
				"		</div>";

				if ( object.attributes.description ) {
					node += app.getField(null, null, app.nl2br(object.attributes.description), false, false, false, true);
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
					node += app.getField('extension', 'Type', object.attributes.type, false, false, false, true);
				}
				if ( object.attributes.ipv4 ) {
					node += app.getField('my_location', 'IPv4', object.attributes.ipv4, false, false, false, true);
				}
				if ( object.attributes.ipv6 ) {
					node += app.getField('my_location', 'IPv6', object.attributes.ipv6, false, false, false, true);
				}
				if ( object.attributes.is_public == "true" ) {
					node += app.getField('visibility', 'Visibility', object.attributes.is_public, false, false, false, true);
					node += app.getQrcodeImg('event', '', object.id, false, false, false);
					app.getQrcode('event', '', object.id, false, false, false);
				} else {
					node += app.getField('visibility_off', 'Visibility', object.attributes.is_public, false, false, false, true);
				}
				if ( object.attributes.longitude ) {
					node += app.getField('place', 'Longitude', object.attributes.longitude, false, false, false, true);
				}
				if ( object.attributes.latitude ) {
					node += app.getField('place', 'Latitude', object.attributes.latitude, false, false, false, true);
				}
				if ( object.attributes.position ) {
					node += app.getField('pin_drop', 'Position', object.attributes.position, false, false, false, true);
				}
				if ( object.attributes.longitude && object.attributes.latitude ) {
					node += app.getMap('my_location', 'osm', object.attributes.longitude, object.attributes.latitude, false, false);
				}
				
				"	</div>" +
				"</section>";

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
	};

	app.displayDashboard = function(id) {
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
				
				for ( var i=0; i < dashboard.attributes.snippets.length; i++ ) {
					var icon = icons.snippets;
					app.getSnippet(icon, dashboard.attributes.snippets[i], (containers.dashboard).querySelector('.page-content'));
				}
				//app.setExpandAction(); // BUG

				app.setSection('dashboard');
			}
		})
		.catch(function (error) {
			toast('displayDashboard error occured...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	};
	
	app.setExpandAction = function() {
		componentHandler.upgradeDom();
		var showdescription_button = document.querySelector('.showdescription_button');
		showdescription_button.addEventListener('click', function(evt) {
			var id = (evt.target.parentElement).getAttribute('for');
			document.getElementById(id).classList.toggle('hidden');
			if ( evt.target.innerHTML == 'expand_more' ) {
				evt.target.innerHTML = 'expand_less';
			} else {
				evt.target.innerHTML = 'expand_more';
			}
		}, false);
	}

	app.displayListItem = function(type, width, iconName, title, line1, line2, id) {
		var node = "" +
		"<section class=\"mdl-grid mdl-cell--"+width+"-col\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+id+"\">" +
		"	<div class=\"mdl-cell mdl-cell--"+width+"-col mdl-card mdl-shadow--2dp\">" +
		"		<div class=\"mdl-card__title mdl-js-button mdl-js-ripple-effect\">" +
		"			<h2 class=\"mdl-card__title-text\">"+title+"</h2>" +
		"		</div>" +
		"		<div class=\"mdl-card__supporting-text\">" +
		" 			"+line1+
		"		</div>" +
		"		<div class=\"mdl-card__actions mdl-card--border\">" +
		"			<button id=\"menu_"+id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">" +
		"				<i class=\"material-icons\">"+iconName+"</i>" +
		"			</button>" +
		"			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+id+"\">" +
		"				<li class=\"mdl-menu__item\">" +
		"					<i class=\"material-icons mdl-js-button mdl-js-ripple-effect\">delete</i>Delete" +
		"				</li>" +
		"				<li class=\"mdl-menu__item\">" +
		"					<i class=\"material-icons\">edit</i>Edit" +
		"				</li>" +
		"			</ul>" +
		"		</div>" +
		"	</div>" +
		"</section>";
		return node;
	}

	app.fetchItems = function(type) {
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
			var title = 'My Objects';
		} else if (type == 'flows') {
			var icon = icons.flows;
			var width = cardsWidth.flows;
			var container = (containers.flows).querySelector('.page-content');
			var url = app.baseUrl+'/'+app.api_version+'/flows';
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
				for (var i=0; i < (response.data).length ; i++ ) {
					var item = response.data[i];
					var node = app.displayListItem(type, width, icon, item.attributes.name!==undefined?item.attributes.name:"", item.attributes.description!==undefined?item.attributes.description.substring(0, 128):"", item.attributes.position!==undefined?item.attributes.position:"", item.id);
					container.innerHTML += node;
				}
				componentHandler.upgradeDom();
				app.updateActions(type);
			})
			.catch(function (error) {
				toast('fetchItems '+type+' error occured...'+ error, 5000);
			});
		} else {
			toast('Error: No type defined', 5000);
		}
		app.spinner.setAttribute('hidden', true);
	};

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
			//console.log(user);
			container.innerHTML = "" +
			"<section class=\"mdl-grid\">" +
			"	<div class=\"mdl-card mdl-cell mdl-cell--12-col mdl-shadow--2dp mdl-card--horizontal\">" +
			"		<div class=\"mdl-card__media\" style=\"background:no-repeat scroll 50% 50%\">" +
			"			<img src=\"//gravatar.com/avatar/"+hex_md5(user.attributes.email)+"\" alt=\"User Profile\">" +
			"		</div>" +
			"		<div class=\"mdl-card__title\">" +
			"			<h2 class=\"mdl-card__title-text\">"+user.attributes.first_name+" "+user.attributes.last_name+"</h2>" +
			"		</div>" +
			"		<div class=\"mdl-card__supporting-text\">" +
			"		</div>" +
			"		<div class=\"mdl-card__actions mdl-card--border\">" +
			"			<a rel=\"nofollow\" class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\">Get Started</a>" +
			"		</div>" +
			"		<div class=\"mdl-card__menu\">" +
			"			<button class=\"mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect\"><i class=\"material-icons\">share</i></button>" +
			"		</div>" +
			"	</div>" +
			"</section>";
			//console.log(container.innerHTML);

			var myHeaders = new Headers();
			var myInit = { method: 'GET', headers: myHeaders, 'mode': 'no-cors' };
			fetch("http://en.gravatar.com/"+app.userHash+".json", myInit)
			.then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				var gravatar = response.entry[0];
				//console.log(gravatar);
				//console.log(gravatar.profileBackground);
			})
			.catch(function (error) {
				toast('fetchProfile error in...' + error, 5000);
			});
		})
		.catch(function (error) {
			toast('fetchProfile error out...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	};

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
	};

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
	}

	app.getSnippet = function(icon, snippet_id, dashboard_container) {
		app.spinner.removeAttribute('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+app.bearer);
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var container = (containers.index).querySelector('.page-content');
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
			} 
			if ( false ) {
				snippet += "			<span class='mdl-list__item-secondary-action'>";
				snippet += "				<i class='material-icons'>chevron_right</i>";
				snippet += "			</span>";
			} 
	
			snippet +=	"		</span>";
			if ( my_snippet.attributes.type == 'flowgraph' ) {
				snippet +=	"		<span class='mdl-list__item'>";
				snippet += "			<span class='mdl-list__item-secondary-content'>";
				snippet += "				<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text' id='snippet-graph-"+my_snippet.id+"'></span>";
				snippet += "			</span>";
				snippet +=	"		</span>";
			}
			snippet +=	"	</div>";
			snippet +=	"</section>";
			
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
				//
				//"?limit=1&order=asc"
			}
			dashboard_container.innerHTML += snippet;
			//console.log(dashboard_container);
			//componentHandler.upgradeDom();
			//return snippet;
		})
		.catch(function (error) {
			toast('getSnippet error out...' + error, 5000);
		});
		app.spinner.setAttribute('hidden', true);
	}

	app.getQrcodeImg = function(icon, label, id) {
		var field = "<div class='mdl-list__item'>";
		field += "	<span class='mdl-list__item-primary-content'>";
		field += "		<img src='' id='qr-"+id+"' class='img-responsive' />";
		field += "	</span>";
		field += "</div>";
		return field;
	}

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
	}

	app.getMap = function(icon, id, longitude, latitude, isEditable, isActionable) {
		var field = "<div class='mdl-list__item'>";
		field += "	<span class='mdl-list__item-primary-content' id='"+id+"' style='width:100%; height:400px;'></span>";
		field += "</div>";
		return field;
	}

	app.fetchIndex('index');
	app.fetchItems('objects');
	app.fetchItems('dashboards');
	app.fetchItems('snippets');
	app.fetchItems('flows');
	//fetchProfile();
})();

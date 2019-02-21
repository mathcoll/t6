app.resources.objects = {
	onEdit(evt) {
		var object_id = evt.target.parentNode.getAttribute('data-id')?evt.target.parentNode.getAttribute('data-id'):evt.target.getAttribute('data-id');
		if ( !object_id ) {
			toast('No Object id found!', {timeout:3000, type: 'error'});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			var body = {
				type: myForm.querySelector("select[name='Type']").value,
				name: myForm.querySelector("input[name='Name']").value,
				description: myForm.querySelector("textarea[name='Description']").value,
				position: myForm.querySelector("input[name='Position']")!==null?myForm.querySelector("input[name='Position']").value:'',
				longitude: myForm.querySelector("input[name='Longitude']")!==null?myForm.querySelector("input[name='Longitude']").value:'',
				latitude: myForm.querySelector("input[name='Latitude']")!==null?myForm.querySelector("input[name='Latitude']").value:'',
				ipv4: myForm.querySelector("input[name='IPv4']")!==null?myForm.querySelector("input[name='IPv4']").value:'',
				ipv6: myForm.querySelector("input[name='IPv6']")!==null?myForm.querySelector("input[name='IPv6']").value:'',
				secret_key_crypt: myForm.querySelector("input[id='secret_key_crypt']")!==null?myForm.querySelector("input[id='secret_key_crypt']").value:'',
				secret_key: myForm.querySelector("input[id='secret_key']")!==null?myForm.querySelector("input[id='secret_key']").value:'',
				isPublic: myForm.querySelector("label.mdl-switch").classList.contains("is-checked")==true?'true':'false',
				meta: {revision: myForm.querySelector("input[name='meta.revision']").value, },
			};
	
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'PUT', headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+'/'+app.api_version+'/objects/'+object_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection('objects');
				toast('Object has been saved.', {timeout:3000, type: 'done'});
				//var objectContainer = document.querySelector("section#objects div[data-id='"+object_id+"']");
				//objectContainer.querySelector("h2").innerHTML = body.name;
				//objectContainer.querySelector("div.mdl-list__item--three-line.small-padding span.mdl-list__item-sub-title").innerHTML = app.nl2br(body.description.substring(0, app.cardMaxChars));
			})
			.catch(function (error) {
				if ( dataLayer !== undefined ) {
					dataLayer.push({
						'eventCategory': 'Interaction',
						'eventAction': 'Save Object',
						'eventLabel': 'Object has not been saved.',
						'eventValue': '0',
						'event': 'Error'
					});
				}
				toast('Object has not been saved.', {timeout:3000, type: 'error'});
			});
			evt.preventDefault();
		}
	},
	onAdd(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			type: myForm.querySelector("select[name='Type']").value,
			name: myForm.querySelector("input[name='Name']").value,
			description: myForm.querySelector("textarea[name='Description']").value,
			position: myForm.querySelector("input[name='Position']")!==null?myForm.querySelector("input[name='Position']").value:'',
			longitude: myForm.querySelector("input[name='Longitude']")!==null?myForm.querySelector("input[name='Longitude']").value:'',
			latitude: myForm.querySelector("input[name='Latitude']")!==null?myForm.querySelector("input[name='Latitude']").value:'',
			ipv4: myForm.querySelector("input[name='IPv4']")!==null?myForm.querySelector("input[name='IPv4']").value:'',
			ipv6: myForm.querySelector("input[name='IPv6']")!==null?myForm.querySelector("input[name='IPv6']").value:'',
			secret_key: myForm.querySelector("input[id='secret_key']")!==null?myForm.querySelector("input[id='secret_key']").value:'',
			secret_key_crypt: myForm.querySelector("input[id='secret_key_crypt']")!==null?myForm.querySelector("input[id='secret_key_crypt']").value:'',
			isPublic: myForm.querySelector("label.mdl-switch").classList.contains("is-checked")==true?'true':'false',
		};

		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+'/'+app.api_version+'/objects/';
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection('objects');
			toast('Object has been added.', {timeout:3000, type: 'done'});
		})
		.catch(function (error) {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					'eventCategory': 'Interaction',
					'eventAction': 'Add Object',
					'eventLabel': 'Object has not been added.',
					'eventValue': '0',
					'event': 'Error'
				});
			}
			toast('Object has not been added.', {timeout:3000, type: 'error'});
		});
		evt.preventDefault();
	},
	onDelete(id) {
		
	},
	display(id, isAdd, isEdit, isPublic) {
		window.scrollTo(0, 0);
		if (isPublic) {
			displayPublic(id, isAdd, isEdit, isPublic);
		}
		if (id instanceof Object && isAdd) {
			displayAdd(id, isAdd, isEdit, isPublic);
		} else {
			history.pushState( {section: 'object' }, window.location.hash.substr(1), '#object?id='+id );
		}
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/objects/'+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var object = response.data[i];
				document.title = (app.sectionsPageTitles['object']).replace(/%s/g, object.attributes.name);
				var node = "";
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<i class=\"material-icons\">"+app.icons.objects+"</i>";
				node += "				<h2 class=\"mdl-card__title-text\">"+object.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+object.id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell--12-col hidden' id='description-"+object.id+"'>";

				node += app.getField(app.icons.objects, 'Id', object.id, {type: 'text'});
				if ( object.attributes.description && isEdit!=true ) {
					var description = app.nl2br(object.attributes.description);
					node += app.getField(app.icons.description, 'Description', description, {type: 'text'});
				}
				if ( object.attributes.meta.created ) {
					node += app.getField(app.icons.date, 'Created', moment(object.attributes.meta.created).format(app.date_format), {type: 'text'});
				}
				if ( object.attributes.meta.updated ) {
					node += app.getField(app.icons.date, 'Updated', moment(object.attributes.meta.updated).format(app.date_format), {type: 'text'});
				}
				if ( object.attributes.meta.revision ) {
					node += app.getField(app.icons.update, 'Revision', object.attributes.meta.revision, {type: 'text'});
				}
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle('Parameters');
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if ( isEdit==true ) {
					var description = object.attributes.description;
					node += app.getField(null, 'meta.revision', object.attributes.meta.revision, {type: 'hidden', id: 'meta.revision', pattern: app.patterns.meta_revision});
					node += app.getField(app.icons.objects, 'Name', object.attributes.name, {type: 'text', id: 'Name', isEdit: isEdit, pattern: app.patterns.name, error:'Name should be set and more than 3 chars length.'});
					node += app.getField(app.icons.description, 'Description', description, {type: 'textarea', id: 'Description', isEdit: isEdit});
				}
				if ( object.attributes.type ) {
					var d = app.types.find( function(type) { return type.name == object.attributes.type; });
					d = d!==undefined?d:'';
					if ( isEdit==true ) {
						node += app.getField(app.icons.type, 'Type', d.name, {type: 'select', id: 'Type', isEdit: isEdit, options: app.types });
					} else {
						node += app.getField(app.icons.type, 'Type', d.value, {type: 'select', id: 'Type', isEdit: isEdit, options: app.types });
					}
				}
				if ( object.attributes.ipv4 || isEdit==true ) {
					node += app.getField('my_location', 'IPv4', object.attributes.ipv4, {type: 'text', id: 'IPv4', isEdit: isEdit, pattern: app.patterns.ipv4, error:'IPv4 should be valid.'});
				}
				if ( object.attributes.ipv6 || isEdit==true ) {
					node += app.getField('my_location', 'IPv6', object.attributes.ipv6, {type: 'text', id: 'IPv6', isEdit: isEdit, pattern: app.patterns.ipv6, error:'IPv6 should be valid.'});
				}
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle('Security');
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if ( object.attributes.secret_key || isEdit==true ) {
					node += app.getField('verified_user', 'Secret Key in symmetric signature', object.attributes.secret_key!==undefined?object.attributes.secret_key:'', {type: 'text', id: 'secret_key', style:'text-transform: none !important;', isEdit: isEdit, pattern: app.patterns.secret_key, error:''});
					node += app.getField('', '', 'When flow require signed payload, you should provide your secret to verify signature.', {type: 'text', isEdit: false});
				}
				if ( object.attributes.secret_key_crypt || isEdit==true ) {
					node += app.getField('vpn_key', 'Secret Key in symmetric cryptography', object.attributes.secret_key_crypt!==undefined?object.attributes.secret_key_crypt:'', {type: 'text', id: 'secret_key_crypt', style:'text-transform: none !important;', isEdit: isEdit, pattern: app.patterns.secret_key_crypt, error:''});
				}
				if ( object.attributes.is_public == "true" && isEdit==false ) {
					node += app.getField('visibility', object.attributes.is_public=='true'?"Object is having a public url":"Object is only visible to you", object.attributes.is_public, {type: 'switch', id: 'Visibility', isEdit: isEdit});
					node += app.getQrcodeImg(app.icons.date, '', object.id, {type: 'text', isEdit: isEdit});
					app.getQrcode(app.icons.date, '', object.id, {type: 'text', isEdit: isEdit});
				} else {
					node += app.getField('visibility', object.attributes.is_public=='true'?"Object is having a public url":"Object is only visible to you", object.attributes.is_public, {type: 'switch', id: 'Visibility', isEdit: isEdit});
				}
				node += "	</div>";
				node += "</section>";

				if ( isEdit || (object.attributes.parameters !== undefined && object.attributes.parameters.length > -1 ) ) {
					node += app.getSubtitle('Custom Parameters');
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					for ( var i in object.attributes.parameters ) {
						node += app.getField('note', object.attributes.parameters[i].name, object.attributes.parameters[i].value, {type: 'text', id: object.attributes.parameters[i].name, isEdit: isEdit});
					}
					if ( isEdit ) node += app.getField('note', ['Name', 'Value'], ['', ''], {type: '2inputs', pattern: [app.patterns.customAttributeName, app.patterns.customAttributeValue], error: ['Name should not contains any space nor special char.', 'Value is free.'], id: ['Name[]', 'Value[]'], isEdit: true});
					node += "	</div>";
					node += "</section>";
				}

				if ( isEdit || (object.attributes.longitude || object.attributes.latitude || object.attributes.position) ) {
					node += app.getSubtitle('Localization');
					node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField('place', 'Longitude', object.attributes.longitude, {type: 'text', id: 'Longitude', isEdit: isEdit, pattern: app.patterns.longitude, error:'Longitude should be valid.'});
					node += app.getField('place', 'Latitude', object.attributes.latitude, {type: 'text', id: 'Latitude', isEdit: isEdit, pattern: app.patterns.latitude, error:'Latitude should be valid.'});
					node += app.getField('pin_drop', 'Position', object.attributes.position, {type: 'text', id: 'Position', isEdit: isEdit, pattern: app.patterns.position, error:'Should not be longer than 255 chars.'});
					node += app.getMap('my_location', 'osm', object.attributes.longitude, object.attributes.latitude, false, false, false);
					node += "	</div>";
					node += "</section>";
				}

				var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
				if ( isEdit ) {
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+object.id+"'>";
					if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>View</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>View Object</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[1]+"' class='save-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>save</i>";
					node += "			<label>Save</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save changes to Object</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "</section>";
				} else {
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+object.id+"'>";
					if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='list-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>List</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Objects</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone delete-button'>";
					node += "		<button id='"+btnId[1]+"' class='delete-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>delete</i>";
					node += "			<label>Delete</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Delete Object...</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[2]+"' class='edit-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
					node += "			<i class='material-icons'>edit</i>";
					node += "			<label>Edit</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[2]+"'>Edit Object</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "</section>";
				}

				(app.containers.object).querySelector('.page-content').innerHTML = node;
				componentHandler.upgradeDom();
				
				app.refreshButtonsSelectors();
				if ( isEdit ) {
					app.buttons.backObject.addEventListener('click', function(evt) { app.resources.objects.display(object.id, false, false, false); }, false);
					app.buttons.saveObject.addEventListener('click', function(evt) { app.resources.objects.onEdit(evt); }, false);
					
					var element = document.getElementById('switch-Visibility').parentNode;
					if ( element ) {
						element.addEventListener('change', function(e) {
							var label = e.target.parentElement.querySelector('div.mdl-switch__label');
							label.innerText = element.classList.contains('is-checked')!==false?"Object is having a public url":"Object is only visible to you";
						});
					}
				} else {
					app.buttons.listObject.addEventListener('click', function(evt) { app.setSection('objects'); evt.preventDefault(); }, false);
					// buttons.deleteObject2.addEventListener('click',
					// function(evt) { console.log('SHOW MODAL AND CONFIRM!');
					// }, false);
					app.buttons.editObject2.addEventListener('click', function(evt) { app.resources.objects.display(object.id, true); evt.preventDefault(); }, false);
				}
				
				if ( object.attributes.longitude && object.attributes.latitude ) {
					/* Localization Map */
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
						// positioning: 'top',
						stopEvent: false
					});
					var map = new ol.Map({
						layers: [
							new ol.layer.Tile({ source: new ol.source.OSM() }),
							vectorLayer,
						],
						target: 'osm',
						interactions: [],
						view: new ol.View({
							center: ol.proj.fromLonLat([parseFloat(object.attributes.longitude), parseFloat(object.attributes.latitude)]),
							zoom: 18,
						}),
					});
					setTimeout(function() {map.updateSize();}, 1000);
					/* End Localization Map */
				}

				app.setExpandAction();
				app.setSection('object');
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('displayObject error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	},
	displayPublic(id, isAdd, isEdit, isPublic) {
		window.scrollTo(0, 0);
		history.pushState( {section: 'object' }, window.location.hash.substr(1), '#object?id='+id );
		
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/objects/'+id+'/public';
		fetch(url, myInit)
		.then(
			fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var object = response.data[i];
				var node = "";
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<i class=\"material-icons\">"+app.icons.objects+"</i>";
				node += "				<h2 class=\"mdl-card__title-text\">"+object.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+object.id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell--12-col hidden' id='description-"+object.id+"'>";

				node += app.getField(app.icons.objects, 'Id', object.id, {type: 'input'});
				if ( object.attributes.description || isEdit!=true ) {
					var description = app.nl2br(object.attributes.description);
					node += app.getField(app.icons.description, 'Description', description, {type: 'text'});
				}
				if ( object.attributes.meta.created ) {
					node += app.getField(app.icons.date, 'Created', moment(object.attributes.meta.created).format(app.date_format), {type: 'text'});
				}
				if ( object.attributes.meta.updated ) {
					node += app.getField(app.icons.date, 'Updated', moment(object.attributes.meta.updated).format(app.date_format), {type: 'text'});
				}
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle('Parameters');
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if ( object.attributes.ipv4 || isEdit==true ) {
					node += app.getField('my_location', 'IPv4', object.attributes.ipv4, {type: 'text', isEdit: isEdit, pattern: app.patterns.ipv4, error:'IPv4 should be valid.'});

				}
				if ( object.attributes.ipv6 || isEdit==true ) {
					node += app.getField('my_location', 'IPv6', object.attributes.ipv6, {type: 'text', isEdit: isEdit, pattern: app.patterns.ipv6, error:'IPv6 should be valid.'});
				}
				node += "	</div>";
				node += "</section>";

				if ( object.attributes.parameters && object.attributes.parameters.length > -1 ) { 
					node += app.getSubtitle('Custom Parameters');
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					for ( var i in object.attributes.parameters ) {
						node += app.getField('note', object.attributes.parameters[i].name, object.attributes.parameters[i].value, {type: 'text'});
					}
					node += "	</div>";
					node += "</section>";
				}

				if ( object.attributes.longitude || object.attributes.latitude || object.attributes.position ) {
					node += app.getSubtitle('Localization');
					node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					if ( object.attributes.longitude ) {
						node += app.getField('place', 'Longitude', object.attributes.longitude, {type: 'text'});
					}
					if ( object.attributes.latitude ) {
						node += app.getField('place', 'Latitude', object.attributes.latitude, {type: 'text'});
					}
					if ( object.attributes.position ) {
						node += app.getField('pin_drop', 'Position/Localization (should be descriptive)', object.attributes.position, {type: 'text'});
					}
					if ( object.attributes.longitude && object.attributes.latitude ) {
						node += app.getMap('my_location', 'osm', object.attributes.longitude, object.attributes.latitude, false, false, false);
					}
					node += "	</div>";
					node += "</section>";
				}

				(app.containers.object).querySelector('.page-content').innerHTML = node;
				componentHandler.upgradeDom();
				
				if ( object.attributes.longitude && object.attributes.latitude ) {
					/* Localization Map */
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
						// positioning: 'top',
						stopEvent: false
					});
					var map = new ol.Map({
						layers: [
							new ol.layer.Tile({ source: new ol.source.OSM() }),
							vectorLayer,
						],
						target: 'osm',
						interactions: [],
						view: new ol.View({
							center: ol.proj.fromLonLat([parseFloat(object.attributes.longitude), parseFloat(object.attributes.latitude)]),
							zoom: 18,
						}),
					});
					setTimeout(function() {map.updateSize();}, 1000);
					/* End Localization Map */
				}

				app.setExpandAction();
				// app.setSection('object');
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('displayObject error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	},
	displayAdd(object, isAdd, isEdit, isPublic) {
		history.pushState( {section: 'object_add' }, window.location.hash.substr(1), '#object_add' );
		var node = "";
		object.id = object.id!==""?object.id:app.getUniqueId();
		object.attributes.longitude = parseFloat(object.attributes.longitude!==''?object.attributes.longitude:0).toFixed(6);
		object.attributes.latitude = parseFloat(object.attributes.latitude!==''?object.attributes.latitude:0).toFixed(6);
		
		node += app.getSubtitle('Description');
		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.objects, 'Name', object.attributes.name, {type: 'text', id: 'Name', isEdit: true, pattern: app.patterns.name, error:'Name should be set and more than 3 chars length.'});
		node += app.getField(app.icons.description, 'Description', app.nl2br(object.attributes.description), {type: 'textarea', id: 'Description', isEdit: true});
		node += app.getField(app.icons.type, 'Type', object.attributes.type, {type: 'select', id: 'Type', options: app.types, isEdit: true });
		node += app.getField('my_location', 'IPv4', object.attributes.ipv4, {type: 'text', id: 'IPv4', isEdit: true, pattern: app.patterns.ipv4, error:'IPv4 should be valid.'});
		node += app.getField('my_location', 'IPv6', object.attributes.ipv6, {type: 'text', id: 'IPv6', isEdit: true, pattern: app.patterns.ipv6, error:'IPv6 should be valid.'});
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle('Security');
		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField('verified_user', 'Secret Key in symmetric signature', object.attributes.secret_key!==undefined?object.attributes.secret_key:'', {type: 'text', id: 'secret_key', style:'text-transform: none !important;', isEdit: true, pattern: app.patterns.secret_key, error:''});
		node += app.getField('', '', 'When flow require signed payload, you should provide your secret to verify signature.', {type: 'text', isEdit: false});
		node += app.getField('vpn_key', 'Secret Key in symmetric cryptography', object.attributes.secret_key_crypt!==undefined?object.attributes.secret_key_crypt:'', {type: 'text', id: 'secret_key_crypt', style:'text-transform: none !important;', isEdit: true, pattern: app.patterns.secret_key_crypt, error:''});
		node += app.getField('visibility', 'Object is only visible to you', object.attributes.is_public, {type: 'switch', id: 'Visibility', isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle('Custom Parameters');
		node += "<section class=\"mdl-grid mdl-cell--12-col\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField('note', ['Name', 'Value'], ['', ''], {type: '2inputs', pattern: [app.patterns.customAttributeName, app.patterns.customAttributeValue], error: ['Name should not contains any space nor special char.', 'Value is free.'], id: ['Name[]', 'Value[]'], isEdit: true});
		node += "	</div>";
		node += "</section>";

		node += app.getSubtitle('Localization');
		node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField('place', 'Longitude', object.attributes.longitude, {type: 'text', id: 'Longitude', isEdit: true, pattern: app.patterns.longitude, error:'Longitude should be valid.'});
		node += app.getField('place', 'Latitude', object.attributes.latitude, {type: 'text', id: 'Latitude', isEdit: true, pattern: app.patterns.latitude, error:'Latitude should be valid.'});
		node += app.getField('pin_drop', 'Position/Localization (should be descriptive)', object.attributes.position, {type: 'text', id: 'Position', isEdit: true, pattern: app.patterns.position, error:'Should not be longer than 255 chars.'});
		node += app.getMap('my_location', 'osm', object.attributes.longitude, object.attributes.latitude, false, false, false);
		node += "	</div>";
		node += "</section>";
		
		var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
		node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+object.id+"'>";
		if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
		node += "	<div class='mdl-cell--1-col-phone pull-left'>";
		node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Objects</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--1-col-phone pull-right'>";
		node += "		<button id='"+btnId[1]+"' class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save new Object</label>";
		node += "		</button>";
		node += "	</div>";
		if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
		node += "</section>";

		(app.containers.object_add).querySelector('.page-content').innerHTML = node;
		componentHandler.upgradeDom();

		app.getLocation();
		/* Localization Map */
		var iconFeature = new ol.Feature({
			geometry: new ol.geom.Point(new ol.proj.transform([parseFloat(object.attributes.longitude), parseFloat(object.attributes.latitude)], 'EPSG:4326', 'EPSG:3857')),
			name: '',
			position: '',
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
			// positioning: 'top',
			stopEvent: false
		});

		var map = new ol.Map({
			layers: [
				new ol.layer.Tile({ source: new ol.source.OSM() }),
				vectorLayer,
			],
			target: 'osm',
			interactions: ol.interaction.defaults().extend([ new ol.interaction.DragRotateAndZoom() ]),
			view: new ol.View({
				center: ol.proj.fromLonLat([parseFloat(object.attributes.longitude), parseFloat(object.attributes.latitude)]),
				zoom: 18,
			}),
		});
		setTimeout(function() {map.updateSize();}, 1000);
		/* End Localization Map */
		
		app.refreshButtonsSelectors();
		app.buttons.addObjectBack.addEventListener('click', function(evt) { app.setSection('objects'); evt.preventDefault(); }, false);
		app.buttons.addObject.addEventListener('click', function(evt) { app.resources.objects.onAdd(evt); }, false);

		var element = document.getElementById('switch-Visibility').parentNode;
		if ( element ) {
			element.addEventListener('change', function(e) {
				var label = e.target.parentElement.querySelector('div.mdl-switch__label');
				label.innerText = element.classList.contains('is-checked')!==false?"Object is having a public url":"Object is only visible to you";
			});
		}
		app.setExpandAction();
	},
	displayItem(object) {
		/* On the list Views */
	}
};
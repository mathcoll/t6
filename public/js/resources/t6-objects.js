"use strict";
app.resources.objects = {
	onEdit: function(evt) {
		var object_id = evt.target.parentNode.getAttribute("data-id")?evt.target.parentNode.getAttribute("data-id"):evt.target.getAttribute("data-id");
		if ( !object_id ) {
			toast("No Object id found!", {timeout:3000, type: "error"});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			var body = {
				type: myForm.querySelector("select[name='Type']").value,
				name: myForm.querySelector("input[name='Name']").value,
				description: myForm.querySelector("textarea[name='Description']").value,
				position: myForm.querySelector("input[name='Position']")!==null?myForm.querySelector("input[name='Position']").value:"",
				longitude: myForm.querySelector("input[name='Longitude']")!==null?myForm.querySelector("input[name='Longitude']").value:"",
				latitude: myForm.querySelector("input[name='Latitude']")!==null?myForm.querySelector("input[name='Latitude']").value:"",
				ipv4: myForm.querySelector("input[name='IPv4']")!==null?myForm.querySelector("input[name='IPv4']").value:"",
				ipv6: myForm.querySelector("input[name='IPv6']")!==null?myForm.querySelector("input[name='IPv6']").value:"",
				secret_key_crypt: myForm.querySelector("input[id='secret_key_crypt']")!==null?myForm.querySelector("input[id='secret_key_crypt']").value:"",
				secret_key: myForm.querySelector("input[id='secret_key']")!==null?myForm.querySelector("input[id='secret_key']").value:"",
				isPublic: myForm.querySelector("label.mdl-switch").classList.contains("is-checked")===true?"true":"false",
				fqbn: myForm.querySelector("input[id='fqbn']")!==null?myForm.querySelector("input[id='fqbn']").value:"",
				source_id: myForm.querySelector("select[id='source_id']")!==null?myForm.querySelector("select[id='source_id']").value:"",
				meta: {revision: myForm.querySelector("input[name='meta.revision']").value, },
			};
	
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: "PUT", headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+"/"+app.api_version+"/objects/"+object_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection("objects");
				toast("Object has been saved.", {timeout:3000, type: "done"});
				//var objectContainer = document.querySelector("section#objects div[data-id='"+object_id+"']");
				//objectContainer.querySelector("h2").innerHTML = body.name;
				//objectContainer.querySelector("div.mdl-list__item--three-line.small-padding span.mdl-list__item-sub-title").innerHTML = app.nl2br(body.description.substring(0, app.cardMaxChars));
			})
			.catch(function (error) {
				toast("Object has not been saved.", {timeout:3000, type: "error"});
			});
			evt.preventDefault();
		}
	},
	onAdd: function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			type: myForm.querySelector("select[name='Type']").value,
			name: myForm.querySelector("input[name='Name']").value,
			description: myForm.querySelector("textarea[name='Description']").value,
			position: myForm.querySelector("input[name='Position']")!==null?myForm.querySelector("input[name='Position']").value:"",
			longitude: myForm.querySelector("input[name='Longitude']")!==null?myForm.querySelector("input[name='Longitude']").value:"",
			latitude: myForm.querySelector("input[name='Latitude']")!==null?myForm.querySelector("input[name='Latitude']").value:"",
			ipv4: myForm.querySelector("input[name='IPv4']")!==null?myForm.querySelector("input[name='IPv4']").value:"",
			ipv6: myForm.querySelector("input[name='IPv6']")!==null?myForm.querySelector("input[name='IPv6']").value:"",
			secret_key: myForm.querySelector("input[id='secret_key']")!==null?myForm.querySelector("input[id='secret_key']").value:"",
			secret_key_crypt: myForm.querySelector("input[id='secret_key_crypt']")!==null?myForm.querySelector("input[id='secret_key_crypt']").value:"",
			isPublic: myForm.querySelector("label.mdl-switch").classList.contains("is-checked")===true?"true":"false",
			fqbn: myForm.querySelector("input[id='fqbn']")!==null?myForm.querySelector("input[id='fqbn']").value:"",
			source_id: myForm.querySelector("select[id='source_id']")!==null?myForm.querySelector("select[id='source_id']").value:"",
		};

		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "POST", headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+"/"+app.api_version+"/objects/";
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection("objects");
			toast("Object has been added.", {timeout:3000, type: "done"});
		})
		.catch(function (error) {
			toast("Object has not been added.", {timeout:3000, type: "error"});
		});
		evt.preventDefault();
	},
	onDelete: function(id) {
		
	},
	display: function(id, isAdd, isEdit, isPublic) {
		window.scrollTo(0, 0);
		if (isPublic) {
			displayPublic(id, isAdd, isEdit, isPublic);
		}
		if (id instanceof Object && isAdd) {
			displayAdd(id, isAdd, isEdit, isPublic);
		} else {
			history.pushState( {section: "object" }, window.location.hash.substr(1), "#object?id="+id );
		}
		app.containers.spinner.removeAttribute("hidden");
		app.containers.spinner.classList.remove("hidden");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/objects/"+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var object = response.data[i];
				var description = object.attributes.description!==undefined?object.attributes.description:"";

				document.title = (app.sectionsPageTitles["object"]).replace(/%s/g, object.attributes.name);
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

				node += app.getField(app.icons.objects, "Id", object.id, {type: "text", style:"text-transform: none !important;"});
				if ( object.attributes.description && isEdit!==true ) {
					node += app.getField(app.icons.description, "Description", description, {type: "text"});
				}
				if ( object.attributes.meta.created ) {
					node += app.getField(app.icons.date, "Created", moment(object.attributes.meta.created).format(app.date_format), {type: "text"});
				}
				if ( object.attributes.meta.updated ) {
					node += app.getField(app.icons.date, "Updated", moment(object.attributes.meta.updated).format(app.date_format), {type: "text"});
				}
				if ( object.attributes.meta.revision ) {
					node += app.getField(app.icons.update, "Revision", object.attributes.meta.revision, {type: "text"});
				}
				node += "		</div>";
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle("Parameters");
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if ( isEdit===true ) {
					node += app.getField(null, "meta.revision", object.attributes.meta.revision, {type: "hidden", id: "meta.revision", pattern: app.patterns.meta_revision});
					node += app.getField(app.icons.name, "Name", object.attributes.name, {type: "text", id: "Name", isEdit: isEdit, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
					node += app.getField(app.icons.description, "Description", description, {type: "textarea", id: "Description", isEdit: isEdit});
				}
				if ( object.attributes.type ) {
					var d = app.types.find( function(type) { return type.name == object.attributes.type; });
					d = d!==undefined?d:"";
					if ( isEdit===true ) {
						node += app.getField(app.icons.type, "Type", d.name, {type: "select", id: "Type", isEdit: isEdit, options: app.types });
					} else {
						node += app.getField(app.icons.type, "Type", d.value, {type: "select", id: "Type", isEdit: isEdit, options: app.types });
					}
				}
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle("Security");
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if ( object.attributes.secret_key || isEdit===true ) {
					node += app.getField("verified_user", "Secret Key in symmetric signature", object.attributes.secret_key!==undefined?object.attributes.secret_key:"", {type: "text", style:"text-transform: none !important;", id: "secret_key", isEdit: isEdit, pattern: app.patterns.secret_key, error:""});
					node += app.getField("", "", "When flow require signed payload, you should provide your secret to verify signature.", {type: "text", isEdit: false});
				}
				if ( object.attributes.secret_key_crypt || isEdit===true ) {
					node += app.getField("vpn_key", "Secret Key in symmetric cryptography", object.attributes.secret_key_crypt!==undefined?object.attributes.secret_key_crypt:"", {type: "text", style:"text-transform: none !important;", id: "secret_key_crypt", isEdit: isEdit, pattern: app.patterns.secret_key_crypt, error:"This must be a 64 hexadecimal chars length A-F & 0-9"});
				}
				if ( object.attributes.is_public == "true" && isEdit===false ) {
					node += app.getField("visibility", object.attributes.is_public=="true"?"Object is having a public url":"Object is only visible to you", object.attributes.is_public, {type: "switch", id: "Visibility", isEdit: isEdit});
					node += app.getQrcodeImg(app.icons.date, "", object.id, {type: "text", isEdit: isEdit});
					app.getQrcode(app.icons.date, "", object.id, {type: "text", isEdit: isEdit});
				} else {
					node += app.getField("visibility", object.attributes.is_public=="true"?"Object is having a public url":"Object is only visible to you", object.attributes.is_public, {type: "switch", id: "Visibility", isEdit: isEdit});
				}
				node += "	</div>";
				node += "</section>";

				if ( isEdit || (object.attributes.fqbn !== undefined ) ) {
					node += app.getSubtitle("Over The Air (OTA)");
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField("code", "Fqbn string", object.attributes.fqbn!==undefined?object.attributes.fqbn:"", {type: "text", style:"text-transform: none !important;", id: "fqbn", isEdit: isEdit});

					if ( localStorage.getItem("sources") != "null" ) {
						var sources = JSON.parse(localStorage.getItem("sources")).map(function(source) {
							return {value: source.name, name: source.id};
						});
					}
					node += app.getField(app.icons.sources, "Source (restricted to root source)", object.attributes.source_id, {type: "select", id: "source_id", isEdit: isEdit, options: sources });
					if ( object.attributes.ipv4 || isEdit===true ) {
						node += app.getField("my_location", "IPv4", object.attributes.ipv4, {type: "text", id: "IPv4", isEdit: isEdit, inputmode: "numeric", pattern: app.patterns.ipv4, error:"IPv4 should be valid."});
					}
					if ( object.attributes.ipv6 || isEdit===true ) {
						node += app.getField("my_location", "IPv6", object.attributes.ipv6, {type: "text", id: "IPv6", isEdit: isEdit, inputmode: "numeric", pattern: app.patterns.ipv6, error:"IPv6 should be valid."});
					}
					node += "	</div>";
					node += "</section>";
				}

				if ( isEdit || (object.attributes.parameters !== undefined && object.attributes.parameters.length > -1 ) ) {
					node += app.getSubtitle("Custom Parameters");
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					for ( var i in object.attributes.parameters ) {
						node += app.getField("note", object.attributes.parameters[i].name, object.attributes.parameters[i].value, {type: "text", id: object.attributes.parameters[i].name, isEdit: isEdit});
					}
					if ( isEdit ) {
						node += app.getField("note", ["Name", "Value"], ["", ""], {type: "2inputs", pattern: [app.patterns.customAttributeName, app.patterns.customAttributeValue], error: ["Name should not contains any space nor special char.", "Value is free."], id: ["Name[]", "Value[]"], isEdit: true});
					}
					node += "	</div>";
					node += "</section>";
				}

				if ( isEdit || (object.attributes.longitude || object.attributes.latitude || object.attributes.position) ) {
					node += app.getSubtitle("Localization");
					node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField("place", "Longitude", object.attributes.longitude, {type: "text", id: "Longitude", isEdit: isEdit, inputmode: "numeric", pattern: app.patterns.longitude, error:"Longitude should be valid."});
					node += app.getField("place", "Latitude", object.attributes.latitude, {type: "text", id: "Latitude", isEdit: isEdit, inputmode: "numeric", pattern: app.patterns.latitude, error:"Latitude should be valid."});
					node += app.getField("pin_drop", "Position", object.attributes.position, {type: "text", id: "Position", isEdit: isEdit, pattern: app.patterns.position, error:"Should not be longer than 255 chars."});
					node += app.getMap("my_location", "osm", object.attributes.longitude, object.attributes.latitude, false, false, false);
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
					if( app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
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
					if( !app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "</section>";
				}

				(app.containers.object).querySelector(".page-content").innerHTML = node;
				componentHandler.upgradeDom();
				
				app.refreshButtonsSelectors();
				if ( isEdit ) {
					app.buttons.backObject.addEventListener("click", function(evt) { app.resources.objects.display(object.id, false, false, false); }, false);
					app.buttons.saveObject.addEventListener("click", function(evt) { app.resources.objects.onEdit(evt); }, false);
					
					var element = document.getElementById("switch-Visibility").parentNode;
					if ( element ) {
						element.addEventListener("change", function(e) {
							var label = e.target.parentElement.querySelector("div.mdl-switch__label");
							label.innerText = element.classList.contains("is-checked")!==false?"Object is having a public url":"Object is only visible to you";
						});
					}
				} else {
					app.buttons.listObject.addEventListener("click", function(evt) { app.setSection("objects"); evt.preventDefault(); }, false);
					// buttons.deleteObject2.addEventListener("click",
					// function(evt) { console.log('SHOW MODAL AND CONFIRM!');
					// }, false);
					app.buttons.editObject2.addEventListener("click", function(evt) { app.resources.objects.display(object.id, false, true, false); evt.preventDefault(); }, false);
				}
				
				if ( object.attributes.longitude && object.attributes.latitude ) {
					/* Localization Map */
					var map = L.map("osm").setView([parseFloat(object.attributes.latitude), parseFloat(object.attributes.longitude)], 13);
					L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
						attribution: '© <a href="//osm.org/copyright">OpenStreetMap</a>',
						minZoom: 1,
						maxZoom: 20,
						trackResize: true,
						dragging: isEdit
					}).addTo(map);
					var popup = L.popup();
					var marker = L.marker([parseFloat(object.attributes.latitude), parseFloat(object.attributes.longitude)], {draggable: isEdit}).addTo(map);
					if (isEdit !== true) {
						map.dragging.disable();
					} else {
						marker.on('dragend', function(event) {
							var position = marker.getLatLng();
							marker.setLatLng(position, {
								draggable: true
							}).bindPopup(position).update();
							document.getElementById('Latitude').value = parseFloat(position.lat, 10).toFixed(6);
							document.getElementById('Longitude').value = parseFloat(position.lng, 10).toFixed(6);
						});
					}
					//map.on('click', onMapClick);
					setTimeout(function() {map.invalidateSize(true);}, 1000);
					/* End Localization Map */
				}

				app.setExpandAction();
				app.setSection("object");
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem("settings.debug") == "true" ) {
				toast("displayObject error occured..." + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute("hidden", true);
	},
	displayPublic: function(id, isAdd, isEdit, isPublic) {
		window.scrollTo(0, 0);
		history.pushState( {section: "object" }, window.location.hash.substr(1), "#object?id="+id );
		
		app.containers.spinner.removeAttribute("hidden");
		app.containers.spinner.classList.remove("hidden");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/objects/"+id+"/public";
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

				node += app.getField(app.icons.objects, "Id", object.id, {type: "input"});
				if ( object.attributes.description || isEdit!==true ) {
					var description = object.attributes.description!==undefined?object.attributes.description:"";
					node += app.getField(app.icons.description, "Description", description, {type: "text"});
				}
				if ( object.attributes.meta.created ) {
					node += app.getField(app.icons.date, "Created", moment(object.attributes.meta.created).format(app.date_format), {type: "text"});
				}
				if ( object.attributes.meta.updated ) {
					node += app.getField(app.icons.date, "Updated", moment(object.attributes.meta.updated).format(app.date_format), {type: "text"});
				}
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle("Parameters");
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				if ( object.attributes.ipv4 || isEdit===true ) {
					node += app.getField("my_location", "IPv4", object.attributes.ipv4, {type: "text", isEdit: isEdit, inputmode: "numeric", pattern: app.patterns.ipv4, error:"IPv4 should be valid."});

				}
				if ( object.attributes.ipv6 || isEdit===true ) {
					node += app.getField("my_location", "IPv6", object.attributes.ipv6, {type: "text", isEdit: isEdit, inputmode: "numeric", pattern: app.patterns.ipv6, error:"IPv6 should be valid."});
				}
				node += "	</div>";
				node += "</section>";

				if ( object.attributes.parameters && object.attributes.parameters.length > -1 ) { 
					node += app.getSubtitle("Custom Parameters");
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					for ( var j in object.attributes.parameters ) {
						node += app.getField("note", object.attributes.parameters[j].name, object.attributes.parameters[j].value, {type: "text"});
					}
					node += "	</div>";
					node += "</section>";
				}

				if ( object.attributes.longitude || object.attributes.latitude || object.attributes.position ) {
					node += app.getSubtitle("Localization");
					node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					if ( object.attributes.longitude ) {
						node += app.getField("place", "Longitude", object.attributes.longitude, {type: "text"});
					}
					if ( object.attributes.latitude ) {
						node += app.getField("place", "Latitude", object.attributes.latitude, {type: "text"});
					}
					if ( object.attributes.position ) {
						node += app.getField("pin_drop", "Position/Localization (should be descriptive)", object.attributes.position, {type: "text"});
					}
					if ( object.attributes.longitude && object.attributes.latitude ) {
						node += app.getMap("my_location", "osm", object.attributes.longitude, object.attributes.latitude, false, false, false);
					}
					node += "	</div>";
					node += "</section>";
				}

				(app.containers.object).querySelector(".page-content").innerHTML = node;
				componentHandler.upgradeDom();
				
				if ( object.attributes.longitude && object.attributes.latitude ) {
					/* Localization Map */
					var map = L.map("osm").setView([parseFloat(object.attributes.latitude), parseFloat(object.attributes.longitude)], 13);
					L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
						attribution: '© <a href="//osm.org/copyright">OpenStreetMap</a>',
						minZoom: 1,
						maxZoom: 20,
						trackResize: true,
						dragging: false
					}).addTo(map);
					var popup = L.popup();
					var marker = L.marker([parseFloat(object.attributes.latitude), parseFloat(object.attributes.longitude)], {draggable: false}).addTo(map);
					setTimeout(function() {map.invalidateSize(true);}, 1000);
					/* End Localization Map */
				}

				app.setExpandAction();
				// app.setSection("object");
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem("settings.debug") == "true" ) {
				toast("displayObject error occured..." + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute("hidden", true);
	},
	displayAdd: function(object, isAdd, isEdit, isPublic) {
		history.pushState( {section: "object_add" }, window.location.hash.substr(1), "#object_add" );
		var node = "";
		object.id = object.id!==""?object.id:app.getUniqueId();
		object.attributes.longitude = parseFloat(object.attributes.longitude!==""?object.attributes.longitude:0).toFixed(6);
		object.attributes.latitude = parseFloat(object.attributes.latitude!==""?object.attributes.latitude:0).toFixed(6);
		var description = object.attributes.description!==undefined?object.attributes.description:"";
		
		node += app.getSubtitle("Description");
		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.name, "Name", object.attributes.name, {type: "text", id: "Name", isEdit: true, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
		node += app.getField(app.icons.description, "Description", description, {type: "textarea", id: "Description", isEdit: true});
		node += app.getField(app.icons.type, "Type", object.attributes.type, {type: "select", id: "Type", options: app.types, isEdit: true });
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle("Security");
		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+object.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField("verified_user", "Secret Key in symmetric signature", object.attributes.secret_key!==undefined?object.attributes.secret_key:"", {type: "text", id: "secret_key", style:"text-transform: none !important;", isEdit: true, pattern: app.patterns.secret_key, error:""});
		node += app.getField("", "", "When flow require signed payload, you should provide your secret to verify signature.", {type: "text", isEdit: false});
		node += app.getField("vpn_key", "Secret Key in symmetric cryptography", object.attributes.secret_key_crypt!==undefined?object.attributes.secret_key_crypt:"", {type: "text", id: "secret_key_crypt", style:"text-transform: none !important;", isEdit: true, pattern: app.patterns.secret_key_crypt, error:""});
		node += app.getField("visibility", "Object is only visible to you", object.attributes.is_public!==undefined?object.attributes.is_public:false, {type: "switch", id: "Visibility", isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle("Over The Air (OTA)");
		node += "<section class=\"mdl-grid mdl-cell--12-col\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField("code", "Fqbn string", object.attributes.fqbn!==undefined?object.attributes.fqbn:"", {type: "text", style:"text-transform: none !important;", id: "fqbn", isEdit: true});
		if ( localStorage.getItem("sources") != "null" ) {
			var sources = JSON.parse(localStorage.getItem("sources")).map(function(source) {
				return {value: source.name, name: source.id};
			});
		}
		node += app.getField(app.icons.sources, "Source (restricted to root source)", object.attributes.source_id, {type: "select", id: "source_id", isEdit: true, options: sources });		node += app.getField("my_location", "IPv4", object.attributes.ipv4, {type: "text", id: "IPv4", isEdit: true, inputmode: "numeric", pattern: app.patterns.ipv4, error:"IPv4 should be valid."});
		node += app.getField("my_location", "IPv6", object.attributes.ipv6, {type: "text", id: "IPv6", isEdit: true, inputmode: "numeric", pattern: app.patterns.ipv6, error:"IPv6 should be valid."});
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle("Custom Parameters");
		node += "<section class=\"mdl-grid mdl-cell--12-col\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField("note", ['Name', 'Value'], ["", ""], {type: "2inputs", pattern: [app.patterns.customAttributeName, app.patterns.customAttributeValue], error: ["Name should not contains any space nor special char.", "Value is free."], id: ["Name[]", "Value[]"], isEdit: true});
		node += "	</div>";
		node += "</section>";

		node += app.getSubtitle("Localization");
		node += "<section class=\"mdl-grid mdl-cell--12-col\" style=\"padding-bottom: 50px !important;\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField("place", "Longitude", object.attributes.longitude, {type: "text", id: "Longitude", isEdit: true, inputmode: "numeric", pattern: app.patterns.longitude, error:"Longitude should be valid."});
		node += app.getField("place", "Latitude", object.attributes.latitude, {type: "text", id: "Latitude", isEdit: true, inputmode: "numeric", pattern: app.patterns.latitude, error:"Latitude should be valid."});
		node += app.getField("pin_drop", "Position/Localization (should be descriptive)", object.attributes.position, {type: "text", id: "Position", isEdit: true, pattern: app.patterns.position, error:"Should not be longer than 255 chars."});
		node += app.getMap("my_location", "osmAdd", object.attributes.longitude, object.attributes.latitude, false, false, false);
		node += "	</div>";
		node += "</section>";
		
		var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
		node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+object.id+"'>";
		if( app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
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
		if( !app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "</section>";

		(app.containers.object_add).querySelector(".page-content").innerHTML = node;
		componentHandler.upgradeDom();

		app.getLocation();
		/* Localization Map */
		var map = L.map("osmAdd").setView([parseFloat(object.attributes.latitude), parseFloat(object.attributes.longitude)], 13);
		L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
			attribution: "© <a href='//osm.org/copyright'>OpenStreetMap</a>",
			minZoom: 1,
			maxZoom: 20,
			trackResize: true,
			dragging: true
		}).addTo(map);
		var popup = L.popup();
		var marker = L.marker([parseFloat(object.attributes.latitude), parseFloat(object.attributes.longitude)], {draggable: true}).addTo(map);
		marker.on('dragend', function(event) {
			var position = marker.getLatLng();
			marker.setLatLng(position, {
				draggable: true
			}).bindPopup(position).update();
			document.getElementById('Latitude').value = parseFloat(position.lat, 10).toFixed(6);
			document.getElementById('Longitude').value = parseFloat(position.lng, 10).toFixed(6);
		});
		setTimeout(function() {map.invalidateSize(true);}, 1000);
		/* End Localization Map */
		
		app.refreshButtonsSelectors();
		app.buttons.addObjectBack.addEventListener("click", function(evt) { app.setSection("objects"); evt.preventDefault(); }, false);
		app.buttons.addObject.addEventListener("click", function(evt) { app.resources.objects.onAdd(evt); }, false);

		var element = document.getElementById("switch-Visibility").parentNode;
		if ( element ) {
			element.addEventListener("change", function(e) {
				var label = e.target.parentElement.querySelector("div.mdl-switch__label");
				label.innerText = element.classList.contains("is-checked")!==false?"Object is having a public url":"Object is only visible to you";
			});
		}
		app.setExpandAction();
	},
	displayItem: function(object) {
		var type = "objects";
		var name = object.attributes.name!==undefined?object.attributes.name:"";
		var description = object.attributes.description!==undefined?object.attributes.description.substring(0, app.cardMaxChars):"";
		var attributeType = object.attributes.type!==undefined?object.attributes.type:"";
		
		var element = "";
		element += "<div class=\"mdl-grid mdl-cell\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+object.id+"\">";
		element += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		element += "		<div class=\"mdl-card__title\">";
		element += "			<i class=\"material-icons\">"+app.icons.objects+"</i>";
		element += "			<h3 class=\"mdl-card__title-text\">"+name+"</h3>";
		element += "		</div>";
		element += app.getField(null, null, description, {type: "textarea", isEdit: false});
		element += "<div class='mdl-list__item--three-line small-padding'>";
		element += "		<span class='type' id='"+object.id+"-connected'><i class='material-icons md-32'>"+(object.attributes.is_connected===true?"flash_on":"flash_off")+"</i></span>";
		element += "		<div class='mdl-tooltip mdl-tooltip--top' for='"+object.id+"-connected'>"+(object.attributes.is_connected===true?"Connected":"Disconnected")+"</div>";
		if ( object.attributes.type ) {
			var d = app.types.find( function(type) { return type.name == object.attributes.type; });
			d = d!==undefined?d:"";
			element += "	<span class='type' id='"+object.id+"-type'><i class='material-icons md-32'>"+d.name+"</i></span>";
			element += "	<div class='mdl-tooltip mdl-tooltip--top' for='"+object.id+"-type'>"+d.value+"</div>";
		}
		if ( object.attributes.is_public == "true" ) {
			element += "	<span class='isPublic' id='"+object.id+"-isPublic'><i class='material-icons md-32'>visibility</i></span>";
			element += "	<div class='mdl-tooltip mdl-tooltip--top' for='"+object.id+"-isPublic'>Public</div>";
		}
		if ( (object.attributes.longitude && object.attributes.latitude) || object.attributes.position ) {
			element += "	<span class='isLocalized' id='"+object.id+"-isLocalized'><i class='material-icons md-32'>location_on</i></span>";
			element += "	<div class='mdl-tooltip mdl-tooltip--top' for='"+object.id+"-isLocalized'>Localized</div>";	
		}
		if ( object.attributes.secret_key != "" ) {
			element += "	<span class='Signature' id='"+object.id+"-Signature'><i class='material-icons md-32'>verified_user</i></span>";
			element += "	<div class='mdl-tooltip mdl-tooltip--top' for='"+object.id+"-Signature'>Signature Secret Key</div>";
		}
		if ( object.attributes.secret_key_crypt != "" ) {
			element += "	<span class='Crypt' id='"+object.id+"-Crypt'><i class='material-icons md-32'>vpn_key</i></span>";
			element += "	<div class='mdl-tooltip mdl-tooltip--top' for='"+object.id+"-Crypt'>Encryption Secret Key</div>";
		}
		element += "</div>";
		element += "		<div class=\"mdl-card__actions mdl-card--border\">";
		element += "			<span class=\"pull-left mdl-card__date\">";
		element += "				<button data-id=\""+object.id+"\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">update</i>";
		element += "				</button>";
		element += "				<span data-date=\"created\" class=\"visible\">Created on "+moment(object.attributes.meta.created).format(app.date_format) + "</span>";
		if ( object.attributes.meta.updated ) {
			element += "				<span data-date=\"updated\" class=\"hidden\">Updated on "+moment(object.attributes.meta.updated).format(app.date_format) + "</span>";
		} else {
			element += "				<span data-date=\"updated\" class=\"hidden\">Never been updated yet.</span>";
		}
		element += "			</span>";
		element += "			<span class=\"pull-right mdl-card__menuaction\">";
		element += "				<button id=\"menu_"+object.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">"+app.icons.menu+"</i>";
		element += "				</button>";
		element += "			</span>";
		element += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+object.id+"\">";
		element += "				<li class=\"mdl-menu__item delete-button\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+object.id+"\" data-name=\""+name+"\">"+app.icons.delete+"</i>Delete</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+object.id+"\" data-name=\""+name+"\">"+app.icons.edit+"</i>Edit</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons copy-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+object.id+"\">"+app.icons.copy+"</i><textarea class=\"copytextarea\">"+object.id+"</textarea>Copy ID to clipboard</a>";
		element += "				</li>";
		element += "			</ul>";
		element += "		</div>";
		element += "	</div>";
		element += "</div>";

		return element;
	}
};
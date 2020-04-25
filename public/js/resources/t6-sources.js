"use strict";
app.resources.sources = {
	onEdit: function(evt) {
		var source_id = evt.target.parentNode.getAttribute("data-id")?evt.target.parentNode.getAttribute("data-id"):evt.target.getAttribute("data-id");
		if ( !source_id ) {
			toast("No Source id found!", {timeout:3000, type: "error"});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			var body = {
				name: myForm.querySelector("input[name='Name']").value,
				content: myForm.querySelector("textarea[id='Code']").value,
				password: myForm.querySelector("input[id='password']")!==null?myForm.querySelector("input[id='password']").value:"",
			};
	
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: "PUT", headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+"/"+app.api_version+"/sources/"+source_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection("sources");
				toast("Source has been saved.", {timeout:3000, type: "done"});
				//var objectContainer = document.querySelector("section#sources div[data-id='"+source_id+"']");
				//objectContainer.querySelector("h2").innerHTML = body.name;
				//objectContainer.querySelector("div.mdl-list__item--three-line.small-padding span.mdl-list__item-sub-title").innerHTML = app.nl2br(body.description.substring(0, app.cardMaxChars));
			})
			.catch(function (error) {
				toast("Source has not been saved.", {timeout:3000, type: "error"});
			});
			evt.preventDefault();
			app.getSources();
		}
	},
	onAdd: function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
				name: myForm.querySelector("input[name='Name']").value,
				content: myForm.querySelector("textarea[id='Code']").value,
				password: myForm.querySelector("input[id='password']")!==null?myForm.querySelector("input[id='password']").value:"",
		};

		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "POST", headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+"/"+app.api_version+"/sources/";
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection("sources");
			toast("Source has been added.", {timeout:3000, type: "done"});
		})
		.catch(function (error) {
			toast("Source has not been added.", {timeout:3000, type: "error"});
		});
		evt.preventDefault();
		app.getSources();
	},
	onDelete: function(id) {
		app.getSources();
	},
	onBuild: function(id, filter_object_id) {
		// Get all objects linked to the source
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/ota/"+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			// build all objects
			for (var i=0; i < (response.data).length ; i++ ) {
				let object_id = response.data[i].id;
				if (filter_object_id===null || filter_object_id === object_id) {
					var myHeaders = new Headers();
					myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
					myHeaders.append("Content-Type", "application/json");
					var myInit = { method: "POST", headers: myHeaders };
					var url = app.baseUrl+"/"+app.api_version+"/objects/"+object_id+"/build";
					fetch(url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(fetchResponse){ 
						return fetchResponse.json();
					})
					.then(function(response) {
						// let's wait
					});
				}
			}
			var len = filter_object_id===null?(response.data).length:1;
			toast("Source is building all "+len+" Object(s). This can take several minutes.", {timeout:10000, type: "info"});
		});
		
	},
	onUnlinkObject: function(source_id, object_id) {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "POST", headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/objects/"+object_id+"/unlink/"+source_id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			document.getElementById("object_"+object_id).classList.add("removed");
			toast("Object is unlinked from this source.", {timeout:3000, type: "info"});
		});
		
	},
	onDeploy: function(id, object_id) {
		// Get all objects linked to the source
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "POST", headers: myHeaders };
		var o = object_id!==null?"/"+object_id:"";
		var url = app.baseUrl+"/"+app.api_version+"/ota/"+id+"/deploy"+o;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			toast("Source is deploying to all "+(response.deploying_to_objects.data).length+" available Object(s). This can take several minutes.", {timeout:10000, type: "info"});
		});
		
	},
	display: function(id, isAdd, isEdit, isPublic) {
		window.scrollTo(0, 0);
		if (id instanceof Object && isAdd) {
			displayAdd(id, isAdd, isEdit, isPublic);
		} else {
			history.pushState( {section: "source" }, window.location.hash.substr(1), "#source?id="+id );
		}
		app.initNewSection("source");
		app.containers.spinner.removeAttribute("hidden");
		app.containers.spinner.classList.remove("hidden");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/sources/"+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var source = response.data[i];
				var content = source.attributes.content!==undefined?source.attributes.content:"";

				document.title = (app.sectionsPageTitles["source"]).replace(/%s/g, source.attributes.name);
				var node = "";
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+source.id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<i class=\"material-icons\">"+app.icons.sources+"</i>";
				node += "				<h2 class=\"mdl-card__title-text\">"+source.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+source.id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell--12-col hidden' id='description-"+source.id+"'>";

				node += app.getField(app.icons.code, "Id", source.id, {type: "text", style:"text-transform: none !important;"});
				if ( source.attributes.meta.created ) {
					node += app.getField(app.icons.date, "Created", moment(source.attributes.meta.created).format(app.date_format), {type: "text"});
				}
				if ( source.attributes.meta.updated ) {
					node += app.getField(app.icons.date, "Updated", moment(source.attributes.meta.updated).format(app.date_format), {type: "text"});
				}
				if ( source.attributes.meta.revision ) {
					node += app.getField(app.icons.update, "Revision", source.attributes.meta.revision, {type: "text"});
				}
				node += "		</div>";
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle("Security");
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += app.getField("verified_user", "OTA Password", source.attributes.password!==undefined?source.attributes.password:"", {type: "text", style:"text-transform: none !important;", id: "password", isEdit: isEdit, pattern: app.patterns.password, error:""});
				node += "	</div>";
				node += "</section>";
				
				node += app.getSubtitle("Parameters");
				node += "<section class=\"mdl-grid mdl-cell--12-col\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += app.getField(null, "meta.revision", source.attributes.meta.revision, {type: "hidden", id: "meta.revision", pattern: app.patterns.meta_revision});
				node += app.getField(app.icons.name, "Name", source.attributes.name, {type: "text", id: "Name", isEdit: isEdit, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
				node += app.getField(app.icons.code, "Arduino Source Code", content, {type: "textarea", id: "Code", isEdit: isEdit});
				node += "	</div>";
				node += "</section>";
				
				node += "<section class=\"mdl-cell--12-col\" id=\"children\">";
				node += "</section>";
				
				node += "<section class=\"mdl-cell--12-col\" id=\"objects_linked\">";
				node += "</section>";

				var myHeaders = new Headers();
				myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
				myHeaders.append("Content-Type", "application/json");
				var myInit = { method: "GET", headers: myHeaders };
				var url = app.baseUrl+"/"+app.api_version+"/sources/"+source.id+"/child";
				fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse){ 
					return fetchResponse.json();
				})
				.then(function(child) {
					var node_child = "";
					if((child.data).length>0) {
						var elChild = document.createElement("div");
						elChild.innerHTML = app.getSubtitle("Source children");
						document.getElementById("children").appendChild(elChild);
					}
					for (var i=0; i < (child.data).length ; i++ ) {
						var c = child.data[i];
						node_child += "<section class=\"mdl-grid mdl-cell--12-col\">";
						node_child += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
						node_child += "	<span class=\"pull-left mdl-card__date\">";
						node_child += app.getField(app.icons.code, "Name", c.attributes.name!==undefined?c.attributes.name:"", {type: "text", isEdit: false});
						node_child += app.getField(app.icons.version, "Version", c.attributes.version!==undefined?c.attributes.version:"", {type: "text", isEdit: false});
						node_child += app.getField(app.icons.date, "Created", moment(c.attributes.meta.created).format(app.date_format), {type: "text", isEdit: false});
						node_child += "	</span>";
						node_child += "	<span class=\"pull-right mdl-card__menuaction edit_children_source\">";
						node_child += "		<button data-id=\""+c.id+"\" class=\"child_edit_btn mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
						node_child += "			<i class=\"material-icons\">"+app.icons.edit+"</i>";
						node_child += "		</button>";
						node_child += "	</span>";
						node_child += "	</div>";
						node_child += "</section>";
					}
					document.getElementById("children").innerHTML += node_child;
					app.refreshButtonsSelectors();
					for (var i in app.buttons.editSourceChild) {
						if ( app.buttons.editSourceChild[i].childElementCount > -1 ) {
							app.buttons.editSourceChild[i].addEventListener("click", function(evt) {
								app.resources.sources.display(evt.target.parentNode.getAttribute("data-id"), false, true, false);
								evt.preventDefault();
							}, false);
						}
					}
				});

				var myHeaders = new Headers();
				myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
				myHeaders.append("Content-Type", "application/json");
				var myInit = { method: "GET", headers: myHeaders };
				var url = app.baseUrl+"/"+app.api_version+"/ota/"+source.id+"?ota-status=true";
				fetch(url, myInit)
				.then(
					app.fetchStatusHandler
				).then(function(fetchResponse){ 
					return fetchResponse.json();
				})
				.then(function(o_links) {
					var node_objects_linked = "";
					if((o_links.data).length>0) {
						var elObjects = document.createElement("div");
						elObjects.innerHTML = app.getSubtitle("Objects linked");
						document.getElementById("objects_linked").appendChild(elObjects);
					}
					for (var i=0; i < (o_links.data).length ; i++ ) {
						var o = o_links.data[i];
						node_objects_linked += "<section class=\"mdl-grid mdl-cell--12-col\" id=\"object_"+o.id+"\" data-type=\"linkedObject\">";
						node_objects_linked += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
						node_objects_linked += "		<div class=\"mdl-list__item--three-line small-padding  mdl-card--expand\">";
						node_objects_linked += app.getField(app.icons.objects, null, o.attributes.name!==undefined?o.attributes.name:"", {type: "text", isEdit: false});
						node_objects_linked += app.getField("my_location", "IPv4", o.attributes.ipv4!==undefined?o.attributes.ipv4:"", {type: "text", isEdit: false});
						node_objects_linked += app.getField(app.icons.code, "Fqbn string", o.attributes.fqbn!==undefined?o.attributes.fqbn:"", {type: "text", isEdit: false});
						node_objects_linked += app.getField(app.icons.code, "version", o.attributes.source_version!==undefined?o.attributes.source_version:"", {type: "text", isEdit: false});
						node_objects_linked += app.getField(o.attributes.is_connected===true?"flash_on":"flash_off", "Status", o.attributes.is_connected===true?"Active":"Inactive", {type: "text", isEdit: false});
						node_objects_linked += "		</div>";
						node_objects_linked += "		<div class=\"mdl-card__actions mdl-card--border\">";
						node_objects_linked += "			<button data-id=\""+o.id+"\" class=\"object_link_off_btn mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\">";
						node_objects_linked += "				<i class=\"material-icons\">"+app.icons.link_off+"</i>Unlink";
						node_objects_linked += "			</button>";
						node_objects_linked += "			<button data-id=\""+o.id+"\" class=\"object_build_btn mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\">";
						node_objects_linked += "				<i class=\"arduino-icon build\"> </i> Build";
						node_objects_linked += "			</button>";
						node_objects_linked += "			<button data-id=\""+o.id+"\" class=\"object_deploy_btn mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\">";
						node_objects_linked += "				<i class=\"arduino-icon deploy\"> </i> Deploy";
						node_objects_linked += "			</button>";
						node_objects_linked += "			<button data-id=\""+o.id+"\" class=\"object_edit_btn mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\">";
						node_objects_linked += "				<i class=\"material-icons\">"+app.icons.edit+"</i>Edit";
						node_objects_linked += "			</button>";
						node_objects_linked += "		</div>";
						node_objects_linked += "	</div>";
						node_objects_linked += "</section>";
					}
					document.getElementById("objects_linked").innerHTML += node_objects_linked;
					app.refreshButtonsSelectors();
					for (var i in app.buttons.editSourceObject) {
						if ( app.buttons.editSourceObject[i].childElementCount > -1 ) {
							app.buttons.editSourceObject[i].addEventListener("click", function(evt) {
								app.resources.objects.display(evt.target.parentNode.getAttribute("data-id"), false, true, false);
								evt.preventDefault();
							}, false);
						}
					}
					for (var i in app.buttons.link_offSourceObject) {
						if ( app.buttons.link_offSourceObject[i].childElementCount > -1 ) {
							app.buttons.link_offSourceObject[i].addEventListener("click", function(evt) {
								app.resources.sources.onUnlinkObject(source.id, evt.target.parentNode.getAttribute("data-id"));
								evt.preventDefault();
							}, false);
						}
					}
					for (var i in app.buttons.deploySourceObject) {
						if ( app.buttons.deploySourceObject[i].childElementCount > -1 ) {
							app.buttons.deploySourceObject[i].addEventListener("click", function(evt) {
								app.resources.sources.onDeploy(source.id, evt.target.parentNode.getAttribute("data-id"));
								evt.preventDefault();
							}, false);
						}
					}
					for (var i in app.buttons.buildSourceObject) {
						if ( app.buttons.buildSourceObject[i].childElementCount > -1 ) {
							app.buttons.buildSourceObject[i].addEventListener("click", function(evt) {
								app.resources.sources.onBuild(source.id, evt.target.parentNode.getAttribute("data-id"));
								evt.preventDefault();
							}, false);
						}
					}
				});

				var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
				if ( isEdit ) {
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+source.id+"'>";
					if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>View</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>View Source</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[1]+"' class='save-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
					node += "			<i class='material-icons'>save</i>";
					node += "			<label>Save</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save changes to Source</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "</section>";
				} else {
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+source.id+"'>";
					if( app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='list-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>List</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Sources</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone delete-button'>";
					node += "		<button id='"+btnId[1]+"' class='delete-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
					node += "			<i class='material-icons'>delete</i>";
					node += "			<label>Delete</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Delete Source...</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[2]+"' class='build-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
					node += "			<i class='arduino-icon build'> </i>";
					node += "			<label>Build All</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[2]+"'>Build Arduino</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[3]+"' class='deploy-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
					node += "			<i class='arduino-icon deploy'> </i>";
					node += "			<label>Deploy All</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[3]+"'>Deploy to Objects</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[4]+"' class='edit-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
					node += "			<i class='material-icons'>edit</i>";
					node += "			<label>Edit</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[4]+"'>Edit Source</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "</section>";
				}

				(app.containers.source).querySelector(".page-content").innerHTML = node;
				componentHandler.upgradeDom();
				
				app.refreshButtonsSelectors();
				if ( isEdit ) {
					app.buttons.backSource.addEventListener("click", function(evt) { app.resources.sources.display(source.id, false, false, false); }, false);
					app.buttons.saveSource.addEventListener("click", function(evt) { app.resources.sources.onEdit(evt); }, false);
				} else {
					app.buttons.listSource.addEventListener("click", function(evt) { app.setSection("sources"); evt.preventDefault(); }, false);
					// buttons.deleteObject2.addEventListener("click",
					// function(evt) { console.log('SHOW MODAL AND CONFIRM!');
					// }, false);
					app.buttons.editSource2.addEventListener("click", function(evt) { app.resources.sources.display(source.id, false, true, false); evt.preventDefault(); }, false);
					app.buttons.buildSource.addEventListener("click", function(evt) { app.resources.sources.onBuild(source.id, null); evt.preventDefault(); }, false);
					app.buttons.deploySource.addEventListener("click", function(evt) { app.resources.sources.onDeploy(source.id, null); evt.preventDefault(); }, false);
				}
				
				app.setExpandAction();
				app.setSection("source");
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem("settings.debug") == "true" ) {
				toast("displaySource error occured..." + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute("hidden", true);
	},
	displayPublic: function(id, isAdd, isEdit, isPublic) {
	},
	displayAdd: function(source, isAdd, isEdit, isPublic) {
		history.pushState( {section: "source_add" }, window.location.hash.substr(1), "#source_add" );
		app.initNewSection("source_add");
		var node = "";
		source.id = source.id!==""?source.id:app.getUniqueId();
		var content = source.attributes.content!==undefined?source.attributes.content:"";

		node += app.getSubtitle("Security");
		node += "<section class=\"mdl-grid mdl-cell--12-col\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField("verified_user", "OTA Password", source.attributes.password!==undefined?source.attributes.password:"", {type: "text", style:"text-transform: none !important;", id: "password", isEdit: true, pattern: app.patterns.password, error:""});
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle("Parameters");
		node += "<section class=\"mdl-grid mdl-cell--12-col\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.name, "Name", source.attributes.name, {type: "text", id: "Name", isEdit: true, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
		node += app.getField(app.icons.code, "Arduino Source Code", content, {type: "textarea", id: "Code", isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
		node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+source.id+"'>";
		if( app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "	<div class='mdl-cell--1-col-phone pull-left'>";
		node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Sources</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--1-col-phone pull-right'>";
		node += "		<button id='"+btnId[1]+"' class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+source.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save new Source</label>";
		node += "		</button>";
		node += "	</div>";
		if( !app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "</section>";

		(app.containers.source_add).querySelector(".page-content").innerHTML = node;
		componentHandler.upgradeDom();

		app.refreshButtonsSelectors();
		app.buttons.addSourceBack.addEventListener("click", function(evt) { app.setSection("sources"); evt.preventDefault(); }, false);
		app.buttons.addSource.addEventListener("click", function(evt) { app.resources.sources.onAdd(evt); }, false);
		app.setExpandAction();
	},
	displayItem: function(source) {
		var type = "sources";
		var name = source.attributes.name!==undefined?source.attributes.name:"";
		var content = source.attributes.content!==undefined?source.attributes.content.substring(0, app.cardMaxChars):"";

		var element = "";
		element += "<div class=\"mdl-grid mdl-cell\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+source.id+"\">";
		element += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		element += "		<div class=\"mdl-card__title\">";
		element += "			<i class=\"material-icons\">"+app.icons.sources+"</i>";
		element += "			<h3 class=\"mdl-card__title-text\">"+name+"</h3>";
		element += "		</div>";
		element += app.getField(null, null, content, {type: "textarea", isEdit: false});
		element += "		<div class=\"mdl-card__actions mdl-card--border\">";
		element += "			<span class=\"pull-left mdl-card__date\">";
		element += "				<button data-id=\""+source.id+"\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">update</i>";
		element += "				</button>";
		element += "				<span data-date=\"created\" class=\"visible\">Created on "+moment(source.attributes.meta.created).format(app.date_format) + "</span>";
		if ( source.attributes.meta.updated ) {
			element += "				<span data-date=\"updated\" class=\"hidden\">Updated on "+moment(source.attributes.meta.updated).format(app.date_format) + "</span>";
		} else {
			element += "				<span data-date=\"updated\" class=\"hidden\">Never been updated yet.</span>";
		}
		element += "			</span>";
		element += "			<span class=\"pull-right mdl-card__menuaction\">";
		element += "				<button id=\"menu_"+source.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">"+app.icons.menu+"</i>";
		element += "				</button>";
		element += "			</span>";
		element += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+source.id+"\">";
		element += "				<li class=\"mdl-menu__item delete-button\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+source.id+"\" data-name=\""+name+"\">"+app.icons.delete+"</i>Delete</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+source.id+"\" data-name=\""+name+"\">"+app.icons.edit+"</i>Edit</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons copy-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+source.id+"\">"+app.icons.copy+"</i><textarea class=\"copytextarea\">"+source.id+"</textarea>Copy ID to clipboard</a>";
		element += "				</li>";
		element += "			</ul>";
		element += "		</div>";
		element += "	</div>";
		element += "</div>";

		return element;
	}
};
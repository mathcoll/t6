"use strict";
app.resources.snippets = {
	onEdit: function(evt) {
		var snippet_id = evt.target.parentNode.getAttribute("data-id")?evt.target.parentNode.getAttribute("data-id"):evt.target.getAttribute("data-id");
		if ( !snippet_id ) {
			toast("No Snippet id found!", {timeout:3000, type: "error"});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			var body = {
				name: myForm.querySelector("input[name='Name']").value,
				type: myForm.querySelector("select[name='Type']").value,
				icon: myForm.querySelector("select[name='Icon']").value,
				color: myForm.querySelector("input[name='Color']").value,
				flows: Array.prototype.map.call(myForm.querySelectorAll(".mdl-chips .mdl-chip"), function(flow) { return ((JSON.parse(localStorage.getItem("flows")))[flow.getAttribute("data-id")]).id; }),
				options: myForm.querySelector("textarea[name='Graph Options']").value&&JSON.parse(myForm.querySelector("textarea[name='Graph Options']").value)!=="undefined"?JSON.parse(myForm.querySelector("textarea[name='Graph Options']").value):undefined,
				meta: {revision: myForm.querySelector("input[name='meta.revision']").value, },
			};

			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: "PUT", headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+"/"+app.api_version+"/snippets/"+snippet_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection("snippets");
				var snippetsList = JSON.parse(localStorage.getItem("snippets"));
				app.snippets = [];
				snippetsList.map(function(sn) {
					if( sn.id == snippet_id ) {
						app.snippets.push( {id: sn.id, name:response.snippet.data.attributes.name, type: response.snippet.data.type, sType: response.snippet.data.attributes.type});
					} else {
						app.snippets.push( {id: sn.id, name:sn.name, type: sn.type} );
					}
				});
				localStorage.setItem("snippets", JSON.stringify(app.snippets));
				toast("Snippet has been saved.", {timeout:3000, type: "done"});
				//var snippetContainer = document.querySelector("section#snippets div[data-id=""+snippet_id+""]");
				//snippetContainer.querySelector("h2").innerHTML = body.name;
			})
			.catch(function (error) {
				toast("Snippet has not been saved.", {timeout:3000, type: "error"});
			});
			evt.preventDefault();
		}
	},
	onAdd: function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			name: myForm.querySelector("input[name='Name']").value,
			type: myForm.querySelector("select[name='Type']").value,
			icon: myForm.querySelector("select[name='Icon']").value,
			color: myForm.querySelector("input[name='Color']").value,
			options: myForm.querySelector("textarea[name='Graph Options']").value&&JSON.parse(myForm.querySelector("textarea[name='Graph Options']").value)!=="undefined"?JSON.parse(myForm.querySelector("textarea[name='Graph Options']").value):undefined,
			flows: Array.prototype.map.call(myForm.querySelectorAll(".mdl-chips .mdl-chip"), function(flow) { return ((JSON.parse(localStorage.getItem("flows")))[flow.getAttribute("data-id")]).id; }),
		};
		if ( localStorage.getItem("settings.debug") == "true" ) {
			console.log("DEBUG onAddSnippet", JSON.stringify(body));
		}
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "POST", headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+"/"+app.api_version+"/snippets/";
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection("snippets");
			var snippetsList = new Array();
			if ( JSON.parse(localStorage.getItem("snippets")) != "null" && JSON.parse(localStorage.getItem("snippets")).length > -1 ) {
				snippetsList = JSON.parse(localStorage.getItem("snippets"));
			}
			snippetsList.push( {id: response.snippet.data.id, name:response.snippet.data.attributes.name, type: response.snippet.data.type, sType: response.snippet.data.attributes.type});
			localStorage.setItem("snippets", JSON.stringify(snippetsList));
			toast("Snippet has been added.", {timeout:3000, type: "done"});
		})
		.catch(function (error) {
			toast("Snippet has not been added.", {timeout:3000, type: "error"});
		});
		evt.preventDefault();
	},
	onDelete: function(snippet_id) {
		var snippetsList = JSON.parse(localStorage.getItem("snippets"));
		app.snippets = [];
		snippetsList.filter(function(sn) {
			if( sn.id != snippet_id ) {
				app.snippets.push( {id: sn.id, name:sn.name, type: sn.type} );
			}
		});
		localStorage.setItem("snippets", JSON.stringify(app.snippets));
	},
	display: function(id, isAdd, isEdit, isPublic) {
		history.pushState( {section: "snippet" }, window.location.hash.substr(1), "#snippet?id="+id );

		window.scrollTo(0, 0);
		app.containers.spinner.removeAttribute("hidden");
		app.containers.spinner.classList.remove("hidden");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/snippets/"+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var snippet = response.data[i];
				document.title = (app.sectionsPageTitles["snippet"]).replace(/%s/g, snippet.attributes.name);
				var node;
				var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
				if ( isEdit ) {

					node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+snippet.id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += "		<div class=\"mdl-list__item\">";
					node += "			<span class='mdl-list__item-primary-content'>";
					node += "				<i class=\"material-icons\">"+app.icons.snippets+"</i>";
					node += "				<h2 class=\"mdl-card__title-text\">"+snippet.attributes.name+"</h2>";
					node += "			</span>";
					node += "			<span class='mdl-list__item-secondary-action'>";
					node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+snippet.id+"'>";
					node += "					<i class='material-icons'>expand_more</i>";
					node += "				</button>";
					node += "			</span>";
					node += "		</div>";
					node += "		<div class='mdl-cell--12-col hidden' id='description-"+snippet.id+"'>";

					node += app.getField(app.icons.snippets, "Id", snippet.id, {type: "text", style:"text-transform: none !important;"});
					if ( snippet.attributes.meta.created ) {
						node += app.getField(app.icons.date, "Created", moment(snippet.attributes.meta.created).format(app.date_format), {type: "text"});
					}
					if ( snippet.attributes.meta.updated ) {
						node += app.getField(app.icons.date, "Updated", moment(snippet.attributes.meta.updated).format(app.date_format), {type: "text"});
					}
					if ( snippet.attributes.meta.revision ) {
						node += app.getField(app.icons.update, "Revision", snippet.attributes.meta.revision, {type: "text"});
					}
					node += "	</div>";
					node += "</section>";
					
					node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField(null, "meta.revision", snippet.attributes.meta.revision, {type: "hidden", id: "meta.revision", pattern: app.patterns.meta_revision});
					node += app.getField(app.icons.name, "Name", snippet.attributes.name, {type: "text", id: "Name", isEdit: isEdit, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
					node += app.getField(app.icons.icon, "Icon", snippet.attributes.icon, {type: "select", id: "Icon", isEdit: isEdit, options: app.types });
					node += app.getField(app.icons.color, "Color", snippet.attributes.color, {type: "text", style:"text-transform: none !important;", id: "Color", isEdit: isEdit});
					node += app.getField("add_circle_outline", "Type", snippet.attributes.type, {type: "select", id: "Type", options: app.snippetTypes, isEdit: isEdit });
					if ( localStorage.getItem("flows") !== "null" ) {
						var flows = JSON.parse(localStorage.getItem("flows")).map(function(flow) {
							return {value: flow.name, name: flow.id};
						});
						node += app.getField(app.icons.flows, "Flows to add", "", {type: "select", id: "flowsChipsSelect", isEdit: true, options: flows });
					} else {
						app.getFlows();
						node += app.getField(app.icons.flows, "Flows to add (you should add some flows first)", "", {type: "select", id: "flowsChipsSelect", isEdit: true, options: {} });
					}
					node += app.getField(null, "Sample", null, {type: "container", id: "TypeSample", options: {}, isEdit: false });
					node += "		<div class='mdl-list__item--three-line small-padding  mdl-card--expand mdl-chips chips-initial input-field' id='flowsChips'>";
					node += "			<span class='mdl-chips__arrow-down__container mdl-selectfield__arrow-down__container'><span class='mdl-chips__arrow-down'></span></span>";
					node += "		</div>";
					node += "	</div>"; // mdl-shadow--2dp
					
					node +=	"</section>";
					
					node += app.getSubtitle("Graph Options");
					node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+rule.id+"_parameters\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField(app.icons.description, "Graph Options", typeof snippet.attributes.options!=="undefined"?JSON.stringify(snippet.attributes.options):"", {type: "textarea", id: "Graph_Options", isEdit: true});
					node += "	</div>";
					node += "</section>";

					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+id+"'>";
					if( app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>View</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>View Snippet</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[1]+"' class='save-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>save</i>";
					node += "			<label>Save</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save changes to Snippet</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "</section>";
					
					(app.containers.snippet).querySelector(".page-content").innerHTML = node;
					componentHandler.upgradeDom();
					app.setExpandAction();
					
					app.refreshButtonsSelectors();
					app.buttons.backSnippet.addEventListener("click", function(evt) { app.resources.snippets.display(snippet.id, false, false, false); }, false);
					app.buttons.saveSnippet.addEventListener("click", function(evt) { app.resources.snippets.onEdit(evt); }, false);

					document.getElementById("flowsChipsSelect").parentNode.querySelector("div.mdl-selectfield__list-option-box ul").addEventListener("click", function(evt) {
						var id = evt.target.getAttribute("data-value");
						var name = evt.target.innerText;
						app.addChipTo("flowsChips", {name: name, id: id, type: "flows"});
						evt.preventDefault();
					}, false);

					document.getElementById("Type").parentNode.querySelector("div.mdl-selectfield__list-option-box ul").addEventListener("click", function(evt) {
						var index = evt.target.getAttribute("data-value");
						var value = evt.target.innerText;
						var s = app.snippetTypes.find(function(sn) {
							return (sn.value).toLowerCase()===value.toLowerCase();
						});
						(app.containers.snippet).querySelector("#TypeSample").innerHTML = s.getHtml({id: snippet.id, icon: snippet.attributes.icon, name: snippet.attributes.name, color: snippet.attributes.color});
						s.activateOnce(snippet);
						evt.preventDefault();
					}, false);
					if( snippet.attributes.type ) {
						var s = app.snippetTypes.find(function(sn) {
							return (sn.name).toLowerCase()===(snippet.attributes.type).toLowerCase();
						});
						(app.containers.snippet).querySelector("#TypeSample").innerHTML = s.getHtml({id: snippet.id, icon: snippet.attributes.icon, name: snippet.attributes.name, color: snippet.attributes.color});
						s.activateOnce(snippet);
					}

					if ( snippet.attributes.flows && snippet.attributes.flows.length > -1 && localStorage.getItem("flows") !== "null" ) {
						snippet.attributes.flows.map(function(s) {
							//Flows list, we put the index not the flow_id into the selector:
							var n=0;
							var theFlow = (JSON.parse(localStorage.getItem("flows"))).find(function(storedF) { storedF.index = n++; return storedF.id == s; });
							app.addChipTo("flowsChips", {name: theFlow.name, id: theFlow.index, type: "flows"});
						});
					}
						
				} else {
					node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += "		<div class=\"mdl-list__item\">";
					node += "			<span class='mdl-list__item-primary-content'>";
					node += "				<h2 class=\"mdl-card__title-text\">";
					node += "					<i class=\"material-icons\">"+app.icons.snippets+"</i>";
					node += "					"+snippet.attributes.name+"</h2>";
					node += "			</span>";
					node += "			<span class='mdl-list__item-secondary-action'>";
					node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
					node += "					<i class='material-icons'>expand_more</i>";
					node += "				</button>";
					node += "			</span>";
					node += "		</div>";
					node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
					if ( snippet.attributes.meta.created ) {
						node += app.getField(app.icons.date, "Created", moment(snippet.attributes.meta.created).format(app.date_format), {type: "text"});
					}
					if ( snippet.attributes.meta.updated ) {
						node += app.getField(app.icons.date, "Updated", moment(snippet.attributes.meta.updated).format(app.date_format), {type: "text"});
					}
					if ( snippet.attributes.meta.revision ) {
						node += app.getField(app.icons.update, "Revision", snippet.attributes.meta.revision, {type: "text"});
					}
					node += app.getField(app.icons.icon, "Icon", snippet.attributes.icon, {type: "select", id: "Icon", isEdit: isEdit, options: app.types });
					node += app.getField(app.icons.color, "Color", snippet.attributes.color, {type: "text", style:"text-transform: none !important;", id: "Color", isEdit: isEdit});
					node += app.getField("add_circle_outline", "Type", snippet.attributes.type, {type: "select", id: "Type", options: app.snippetTypes, isEdit: isEdit });
					node += app.getField(app.icons.flows, "Linked Flows #", snippet.attributes.flows.length, {type: "text"});
					node += "	</div>"; // mdl-shadow--2dp
					node +=	"</section>";
					
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+flow.id+"'>";
					if( app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='list-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>List</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Snippets</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone delete-button'>";
					node += "		<button id='"+btnId[1]+"' class='delete-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>delete</i>";
					node += "			<label>Delete</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Delete Snippet</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[2]+"' class='edit-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>edit</i>";
					node += "			<label>Edit</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[2]+"'>Edit Snippet</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "</section>";

					//Snippet preview
					app.getSnippet(app.icons.snippets, snippet.id, (app.containers.snippet).querySelector(".page-content"));

					(app.containers.snippet).querySelector(".page-content").innerHTML = node;
					componentHandler.upgradeDom();

					var s = app.snippetTypes.find(function(sn) {
						return (sn.name).toLowerCase()===(snippet.attributes.type).toLowerCase();
					});
					s.setOptions(snippet.attributes.options);
					
					app.setExpandAction();
					
					app.refreshButtonsSelectors();
					app.buttons.listSnippet.addEventListener("click", function(evt) { app.setSection("snippets"); evt.preventDefault(); }, false);
					// buttons.deleteSnippet2.addEventListener("click",
					// function(evt) { console.log("SHOW MODAL AND CONFIRM!");
					// }, false);
					app.buttons.editSnippet2.addEventListener("click", function(evt) { app.resources.snippets.display(snippet.id, false, true, false); evt.preventDefault(); }, false);
				}
				app.setSection("snippet");
			}
		})
		.catch(function (error) {
			console.log(error);
			if ( localStorage.getItem("settings.debug") == "true" ) {
				toast("displaySnippet error occured..." + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute("hidden", true);
	},
	displayPublic: function(id, isAdd, isEdit, isPublic) {
	},
	displayAdd: function(snippet, isAdd, isEdit, isPublic) {
		var node = "";
		
		node = "<section class='mdl-grid mdl-cell--12-col' data-id='"+snippet.id+"'>";
		node += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
		node += app.getField(app.icons.name, "Name", snippet.attributes.name, {type: "text", id: "Name", isEdit: true, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
		node += app.getField(app.icons.icon, "Icon", snippet.attributes.icon, {type: "select", id: "Icon", isEdit: true, options: app.types });
		node += app.getField(app.icons.color, "Color", snippet.attributes.color, {type: "text", id: "Color", isEdit: true});
		node += app.getField("add_circle_outline", "Type", snippet.attributes.type, {type: "select", id: "Type", options: app.snippetTypes, isEdit: true });
		node += app.getField(null, "Sample", null, {type: "container", id: "TypeSample", options: {}, isEdit: false });

		if ( localStorage.getItem("flows") != "null" ) {
			var flows = JSON.parse(localStorage.getItem("flows")).map(function(flow) {
				return {value: flow.name, name: flow.id};
			});
			node += app.getField(app.icons.flows, "Flows to add", "", {type: "select", id: "flowsChipsSelect", isEdit: true, options: flows });
		} else {
			app.getFlows();
			node += app.getField(app.icons.flows, "Flows to add (you should add flow first)", "", {type: "select", id: "flowsChipsSelect", isEdit: true, options: {} });
		}
		node += "		<div class='mdl-list__item--three-line small-padding  mdl-card--expand mdl-chips chips-initial input-field' id='flowsChips'>";
		node += "			<span class='mdl-chips__arrow-down__container mdl-selectfield__arrow-down__container'><span class='mdl-chips__arrow-down'></span></span>";
		node += "		</div>";
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle("Graph Options");
		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+rule.id+"_parameters\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.description, "Graph Options", typeof snippet.attributes.options!=="undefined"?JSON.stringify(snippet.attributes.options):"", {type: "textarea", id: "Graph_Options", isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
		node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+flow.id+"'>";
		if( app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "	<div class='mdl-cell--1-col-phone pull-left'>";
		node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+snippet.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Snippets</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--1-col-phone pull-right'>";
		node += "		<button id='"+btnId[1]+"' class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+snippet.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save new Snippet</label>";
		node += "		</button>";
		node += "	</div>";
		if( !app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "</section>";

		(app.containers.snippet_add).querySelector(".page-content").innerHTML = node;
		componentHandler.upgradeDom();
		document.getElementById("flowsChipsSelect").parentNode.querySelector("div.mdl-selectfield__list-option-box ul").addEventListener("click", function(evt) {
			var id = evt.target.getAttribute("data-value");
			var name = evt.target.innerText;
			app.addChipTo("flowsChips", {name: name, id: id, type: "flows"});
			evt.preventDefault();
		}, false);
		document.getElementById("Type").parentNode.querySelector("div.mdl-selectfield__list-option-box ul").addEventListener("click", function(evt) {
			var index = evt.target.getAttribute("data-value");
			var value = evt.target.innerText;
			var s = app.snippetTypes.find(function(sn) {
				return sn.value===value;
			});
			(app.containers.snippet_add).querySelector("#TypeSample").innerHTML = s.getHtml({id: snippet.id, icon: snippet.icon, name: snippet.name, color: snippet.color});
			s.activateOnce(snippet);
			evt.preventDefault();
		}, false);
		
		app.refreshButtonsSelectors();
		app.buttons.addSnippetBack.addEventListener("click", function(evt) { app.setSection("snippets"); evt.preventDefault(); }, false);
		app.buttons.addSnippet.addEventListener("click", function(evt) { app.resources.snippets.onAdd(evt); }, false);

		app.setExpandAction();
	},
	displayItem: function(snippet) {
		var type = "snippets";
		var name = snippet.attributes.name!==undefined?snippet.attributes.name:"";
		var description = snippet.attributes.description!==undefined?snippet.attributes.description.substring(0, app.cardMaxChars):"";
		var attributeType = snippet.attributes.type!==undefined?snippet.attributes.type:"";
		
		var element = "";
		element += "<div class=\"mdl-grid mdl-cell\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+snippet.id+"\">";
		element += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		element += "		<div class=\"mdl-card__title\">";
		element += "			<i class=\"material-icons\">"+app.icons.objects+"</i>";
		element += "			<h3 class=\"mdl-card__title-text\">"+name+"</h3>";
		element += "		</div>";
		element += "<div class='mdl-list__item--three-line small-padding'>";
		if ( snippet.attributes.type ) {
			element += "	<div class='mdl-list__item-sub-title'>";
			var s = app.snippetTypes.find(function(sn) {
				return (sn.name).toLowerCase()===(snippet.attributes.type).toLowerCase();
			});
			if ( !s ) {
				console.log("DEBUG", "type not found !!!", (snippet.attributes.type).toLowerCase());
			}
			element += "		<i class='material-icons md-28'>add_circle_outline</i>"+app.snippetTypes.find( function(s) { return (s.name).toLowerCase() == (snippet.attributes.type).toLowerCase(); }).value;
			element += "	</div>";
		}
		if ( snippet.attributes.color ) {
			element += "	<div class='mdl-list__item-sub-title'>";
			element += "		<i class='material-icons md-28'>format_color_fill</i><span style='text-transform:uppercase; color:"+snippet.attributes.color+"'>"+snippet.attributes.color+"</span>";
			element += "	</div>";
		}
		element += "	<span class='mdl-list__item-sub-title'>";
		element += "		<i class='material-icons md-28'>"+snippet.attributes.icon+"</i>"+app.types.find( function(t) { return t.name == snippet.attributes.icon; }).value;
		element += "	</span>";
		element += "</div>";
		element += "		<div class=\"mdl-card__actions mdl-card--border\">";
		element += "			<span class=\"pull-left mdl-card__date\">";
		element += "				<button data-id=\""+snippet.id+"\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">update</i>";
		element += "				</button>";
		element += "				<span data-date=\"created\" class=\"visible\">Created on "+moment(snippet.attributes.meta.created).format(app.date_format) + "</span>";
		if ( snippet.attributes.meta.updated ) {
			element += "				<span data-date=\"updated\" class=\"hidden\">Updated on "+moment(snippet.attributes.meta.updated).format(app.date_format) + "</span>";
		} else {
			element += "				<span data-date=\"updated\" class=\"hidden\">Never been updated yet.</span>";
		}
		element += "			</span>";
		element += "			<span class=\"pull-right mdl-card__menuaction\">";
		element += "				<button id=\"menu_"+snippet.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">"+app.icons.menu+"</i>";
		element += "				</button>";
		element += "			</span>";
		element += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+snippet.id+"\">";
		element += "				<li class=\"mdl-menu__item delete-button\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+snippet.id+"\" data-name=\""+name+"\">"+app.icons.delete+"</i>Delete</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+snippet.id+"\" data-name=\""+name+"\">"+app.icons.edit+"</i>Edit</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons copy-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+snippet.id+"\">"+app.icons.copy+"</i><textarea class=\"copytextarea\">"+snippet.id+"</textarea>Copy ID to clipboard</a>";
		element += "				</li>";
		element += "			</ul>";
		element += "		</div>";
		element += "	</div>";
		element += "</div>";

		return element;
	}
};
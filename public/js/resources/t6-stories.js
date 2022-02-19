"use strict";
app.resources.stories = {
	onEdit: function(evt) {
		var story_id = evt.target.parentNode.getAttribute("data-id")?evt.target.parentNode.getAttribute("data-id"):evt.target.getAttribute("data-id");
		if ( !story_id ) {
			toast("No Story id found!", {timeout:3000, type: "error"});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			var body = {
				flow_id: myForm.querySelector("select[id='FlowId']").value,
				name: myForm.querySelector("input[id='Name']").value,
				retention: myForm.querySelector("select[name='Retention']").value,
				start: myForm.querySelector("input[id='Start']").value,
				end: myForm.querySelector("input[id='End']").value,
				meta: {revision: myForm.querySelector("input[name='meta.revision']").value, },
			};
			if ( localStorage.getItem("settings.debug") === "true" ) {
				console.log("DEBUG onEditStory", JSON.stringify(body));
			}
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: "PUT", headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+"/"+app.api_version+"/stories/"+story_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection("stories");
				toast("Story has been edited.", {timeout:3000, type: "done"});
			})
			.catch(function (error) {
				toast("Story has not been edited.", {timeout:3000, type: "error"});
			});
			evt.preventDefault();
		}
	},
	onAdd: function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			flow_id: myForm.querySelector("select[id='FlowId']").value,
			name: myForm.querySelector("input[id='Name']").value,
			retention: myForm.querySelector("select[name='Retention']").value,
			start: myForm.querySelector("input[id='Start']").value,
			end: myForm.querySelector("input[id='End']").value,
		};
		if ( localStorage.getItem("settings.debug") === "true" ) {
			console.log("DEBUG onAddStory", JSON.stringify(body));
		}
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "POST", headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+"/"+app.api_version+"/stories/";
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection("stories");
			toast("Story has been added.", {timeout:3000, type: "done"});
		})
		.catch(function (error) {
			toast("Story has not been added.", {timeout:3000, type: "error"});
		});
		evt.preventDefault();
	},
	onDelete: function(id) {
	},
	display: function(id, isAdd, isEdit, isPublic) {
		history.pushState( {section: "story" }, window.location.hash.substr(1), "#story?id="+id );
		app.initNewSection("story");
		
		window.scrollTo(0, 0);
		app.containers.spinner.removeAttribute("hidden");
		app.containers.spinner.classList.remove("hidden");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/stories/"+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var story = response.data[i];
				document.title = (app.sectionsPageTitles["story"]).replace(/%s/g, story.attributes.name);
				var node;
				var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
				
				if ( isEdit ) {
					node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+story.id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += "		<div class=\"mdl-list__item\">";
					node += "			<span class='mdl-list__item-primary-content'>";
					node += "				<i class=\"material-icons mdl-textfield__icon\">"+app.icons.stories+"</i>";
					node += "				<h2 class=\"mdl-card__title-text\">"+story.attributes.name+"</h2>";
					node += "			</span>";
					node += "			<s&pan class='mdl-list__item-secondary-action'>";
					node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+story.id+"'>";
					node += "					<i class='material-icons'>expand_more</i>";
					node += "				</button>";
					node += "			</span>";
					node += "		</div>";
					node += "		<div class='mdl-cell--12-col hidden' id='description-"+story.id+"'>";

					node += app.getField(app.icons.code, "Id", story.id, {type: "text", style:"text-transform: none !important;"});
					if ( story.attributes.meta.created ) {
						node += app.getField(app.icons.date, "Created", moment(story.attributes.meta.created).format(app.date_format), {type: "text"});
					}
					if ( story.attributes.meta.updated ) {
						node += app.getField(app.icons.date, "Updated", moment(story.attributes.meta.updated).format(app.date_format), {type: "text"});
					}
					if ( story.attributes.meta.revision ) {
						node += app.getField(app.icons.update, "Revision", story.attributes.meta.revision, {type: "text"});
					}
					node += "	</div>";
					node += "</section>";

					node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+story.id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField(null, "meta.revision", story.attributes.meta.revision, {type: "hidden", id: "meta.revision", pattern: app.patterns.meta_revision});
					if ( localStorage.getItem("flows") !== "null" ) {
						let flows = JSON.parse(localStorage.getItem("flows")).map(function(flow) {
							return {value: flow.name, name: flow.id};
						});
						node += app.getField(app.icons.flows, "Flow", story.attributes.flow_id, {type: "select", id: "FlowId", isEdit: true, options: flows });
					} else {
						app.getFlows();
						node += app.getField(app.icons.flows, "Flow (you should add some flows first)", "", {type: "select", id: "FlowId", isEdit: true, options: {} });
					}
					node += app.getField(app.icons.name, "Name", story.attributes.name, {type: "text", id: "Name", isEdit: isEdit, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
					node += app.getField(app.icons.retention, "Retention", story.attributes.retention, {type: "select", id: "Retention", isEdit: isEdit, options: app.allRetentions});
					node += app.getField(app.icons.date, "Start date", story.attributes.start, {type: "text", id: "Start", isEdit: isEdit, pattern: app.patterns.date, error:"Date must be valid"});
					node += app.getField(app.icons.date, "End date", story.attributes.end, {type: "text", id: "End", isEdit: isEdit, pattern: app.patterns.date, error:"Date must be valid"});
					node += "	</div>";
					node += "</section>";

					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += "		<a href=\"/stories/"+id+"\" target=\"_blank\">Read the full story</a>";
					node += "	</div>";
					node += "</section>";
					
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+id+"'>";
					if( app.isLtr() ) { node += "	<div class='mdl-layout-spacer'></div>"; }
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>View</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>View Story</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[1]+"' class='save-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>save</i>";
					node += "			<label>Save</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save changes to Story</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) { node += "	<div class='mdl-layout-spacer'></div>"; }
					node += "</section>";
					
					(app.containers.story).querySelector(".page-content").innerHTML = node;
					componentHandler.upgradeDom();
					app.setExpandAction();
					
					app.refreshButtonsSelectors();
					app.buttons.backStory.addEventListener("click", function(evt) { app.resources.stories.display(story.id, false, false, false); }, false);
					app.buttons.saveStory.addEventListener("click", function(evt) { app.resources.stories.onEdit(evt); }, false);
						
				} else {
					node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += "		<div class=\"mdl-list__item\">";
					node += "			<span class='mdl-list__item-primary-content'>";
					node += "				<h2 class=\"mdl-card__title-text\">";
					node += "					<i class=\"material-icons\">"+app.icons.stories+"</i>";
					node += "					"+story.attributes.name+"</h2>";
					node += "			</span>";
					node += "			<span class='mdl-list__item-secondary-action'>";
					node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
					node += "					<i class='material-icons'>expand_more</i>";
					node += "				</button>";
					node += "			</span>";
					node += "		</div>";
					node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
					node += app.getField(app.icons.stories, "Id", story.id, {type: "text"});
					if ( story.attributes.meta.created ) {
						node += app.getField(app.icons.date, "Created", moment(story.attributes.meta.created).format(app.date_format), {type: "text"});
					}
					if ( story.attributes.meta.updated ) {
						node += app.getField(app.icons.date, "Updated", moment(story.attributes.meta.updated).format(app.date_format), {type: "text"});
					}
					if ( story.attributes.meta.revision ) {
						node += app.getField(app.icons.update, "Revision", story.attributes.meta.revision, {type: "text"});
					}
					node += "	</div>"; // mdl-shadow--2dp
					node +=	"</section>";

					node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+story.id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField(null, "meta.revision", story.attributes.meta.revision, {type: "hidden", id: "meta.revision", pattern: app.patterns.meta_revision});
					if ( localStorage.getItem("flows") !== "null" ) {
						let flows = JSON.parse(localStorage.getItem("flows")).map(function(flow) {
							return {value: flow.name, name: flow.id};
						});
						node += app.getField(app.icons.flows, "Flow", story.attributes.flow_id, {type: "select", id: "FlowId", isEdit: true, options: flows });
					} else {
						app.getFlows();
						node += app.getField(app.icons.flows, "Flow (you should add some flows first)", story.attributes.flow_id, {type: "select", id: "FlowId", isEdit: true, options: {} });
					}
					node += app.getField(app.icons.name, "Name", story.attributes.name, {type: "text", id: "Name", isEdit: isEdit, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
					node += app.getField(app.icons.retention, "Retention", story.attributes.retention!==undefined?story.attributes.retention:"Default", {type: "select", id: "Retention", isEdit: isEdit, options: app.allRetentions });
					node += app.getField(app.icons.date, "Start date", story.attributes.start, {type: "text", id: "Start", isEdit: isEdit, pattern: app.patterns.date, error:"Date must be valid"});
					node += app.getField(app.icons.date, "End date", story.attributes.end, {type: "text", id: "End", isEdit: isEdit, pattern: app.patterns.date, error:"Date must be valid"});
					node += "	</div>";
					node += "</section>";

					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += "		<a href=\"/stories/"+id+"\" target=\"_blank\">Read the full story</a>";
					node += "	</div>";
					node += "</section>";
					
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+story.id+"'>";
					if( app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='list-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+story.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>List</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Stories</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone delete-button'>";
					node += "		<button id='"+btnId[1]+"' class='delete-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+story.id+"'>";
					node += "			<i class='material-icons'>delete</i>";
					node += "			<label>Delete</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Delete Story</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[2]+"' class='edit-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+story.id+"'>";
					node += "			<i class='material-icons'>edit</i>";
					node += "			<label>Edit</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[2]+"'>Edit Story</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) {
						node += "	<div class='mdl-layout-spacer'></div>";
					}
					node += "</section>";

					(app.containers.story).querySelector(".page-content").innerHTML = node;
					componentHandler.upgradeDom();
					app.setExpandAction();
					
					app.refreshButtonsSelectors();
					app.buttons.listStory.addEventListener("click", function(evt) { app.setSection("stories"); evt.preventDefault(); }, false);
					// buttons.deleteRule2.addEventListener("click",
					// function(evt) { console.log("SHOW MODAL AND CONFIRM!");
					// }, false);
					app.buttons.editStory2.addEventListener("click", function(evt) { app.resources.stories.display(story.id, false, true, false); evt.preventDefault(); }, false);
				}
				app.setSection("story");
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem("settings.debug") === "true" ) {
				toast("displayStory error occured..." + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute("hidden", true);
	},
	displayPublic: function(id, isAdd, isEdit, isPublic) {
	},
	displayAdd: function(story, isAdd, isEdit, isPublic) {
		history.pushState( {section: "story_add" }, window.location.hash.substr(1), "#story_add" );
		app.initNewSection("story_add");
		var node = "";

		var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
		node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+story.id+"'>";
		if( app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "	<div class='mdl-cell--1-col-phone pull-left'>";
		node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+story.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Rules</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--1-col-phone pull-right'>";
		node += "		<button id='"+btnId[1]+"' class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+story.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save new Rule</label>";
		node += "		</button>";
		node += "	</div>";
		if( !app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "</section>";

		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+story.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		if ( localStorage.getItem("flows") !== "null" ) {
			let flows = JSON.parse(localStorage.getItem("flows")).map(function(flow) {
				return {value: flow.name, name: flow.id};
			});
			node += app.getField(app.icons.flows, "Flow", story.attributes.flow_id, {type: "select", id: "FlowId", isEdit: true, options: flows });
		} else {
			app.getFlows();
			node += app.getField(app.icons.flows, "Flow (you should add some flows first)", "", {type: "select", id: "FlowId", isEdit: true, options: {} });
		}
		node += app.getField(app.icons.name, "Name", typeof story.attributes.name!=="undefined"?story.attributes.name:"", {type: "text", id: "Name", isEdit: true, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
		node += app.getField(app.icons.retention, "Retention", story.attributes.retention!==undefined?story.attributes.retention:"Default", {type: "select", id: "Retention", isEdit: true, options: app.allRetentions });
		node += app.getField(app.icons.date, "Start date", typeof story.attributes.start!=="undefined"?story.attributes.start:"", {type: "text", id: "Start", isEdit: true, pattern: app.patterns.date, error:"Date must be valid"});
		node += app.getField(app.icons.date, "End date", typeof story.attributes.end!=="undefined"?story.attributes.end:"", {type: "text", id: "End", isEdit: true, pattern: app.patterns.date, error:"Date must be valid"});
		node += "	</div>";
		node += "</section>";

		(app.containers.story_add).querySelector(".page-content").innerHTML = node;
		componentHandler.upgradeDom();
		
		app.refreshButtonsSelectors();
		
		app.buttons.addStoryBack.addEventListener("click", function(evt) { app.setSection("stories"); evt.preventDefault(); }, false);
		app.buttons.addStory.addEventListener("click", function(evt) { app.resources.stories.onAdd(evt); }, false);

		app.setExpandAction();
	},
	displayItem: function(story) {
		var type = "stories";
		var name = story.attributes.name!==undefined?story.attributes.name:"";
		var description = story.attributes.description!==undefined?story.attributes.description.substring(0, app.cardMaxChars):"";
		var attributeType = story.attributes.type!==undefined?story.attributes.type:"";
		var cssDisabled = story.attributes.active!==true?"is-disabled":"";
		
		var element = "";
		element += "<div class=\"mdl-grid mdl-cell\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+story.id+"\">";
		element += "	<div class=\"mdl-card mdl-shadow--2dp "+cssDisabled+"\">";
		element += "		<div class=\"mdl-card__title\">";
		element += "			<i class=\"material-icons\">"+app.icons.stories+"</i>";
		element += "			<h3 class=\"mdl-card__title-text\">"+name+"</h3>";
		element += "		</div>";
		element += app.getField(null, null, description, {type: "textarea", isEdit: false});
		element += "		<div class=\"mdl-card__actions mdl-card--border\">";
		element += "			<span class=\"pull-left mdl-card__date\">";
		element += "				<button data-id=\""+story.id+"\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">update</i>";
		element += "				</button>";
		element += "				<span data-date=\"created\" class=\"visible\">Created on "+moment(story.attributes.meta.created).format(app.date_format) + "</span>";
		if ( story.attributes.meta.updated ) {
			element += "				<span data-date=\"updated\" class=\"hidden\">Updated on "+moment(story.attributes.meta.updated).format(app.date_format) + "</span>";
		} else {
			element += "				<span data-date=\"updated\" class=\"hidden\">Never been updated yet.</span>";
		}
		element += "			</span>";
		element += "			<span class=\"pull-right mdl-card__menuaction\">";
		element += "				<button id=\"menu_"+story.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">"+app.icons.menu+"</i>";
		element += "				</button>";
		element += "			</span>";
		element += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+story.id+"\">";
		element += "				<li class=\"mdl-menu__item delete-button\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+story.id+"\" data-name=\""+name+"\">"+app.icons.delete+"</i>Delete</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+story.id+"\" data-name=\""+name+"\">"+app.icons.edit+"</i>Edit</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons copy-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+story.id+"\">"+app.icons.copy+"</i><textarea class=\"copytextarea\">"+story.id+"</textarea>Copy ID to clipboard</a>";
		element += "				</li>";
		element += "			</ul>";
		element += "		</div>";
		element += "	</div>";
		element += "</div>";

		return element;
	}
};
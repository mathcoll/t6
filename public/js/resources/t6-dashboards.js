'use strict';
app.resources.dashboards = {
	onEdit: function(evt) {
		var dashboard_id = evt.target.parentNode.getAttribute('data-id')?evt.target.parentNode.getAttribute('data-id'):evt.target.getAttribute('data-id');
		if ( !dashboard_id ) {
			toast('No Dashboard id found!', {timeout:3000, type: 'error'});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			var body = {
				name: myForm.querySelector("input[name='Name']").value,
				description: myForm.querySelector("textarea[name='Description']").value,
				snippets: Array.prototype.map.call(myForm.querySelectorAll(".mdl-chips .mdl-chip"), function(snippet) { return ((JSON.parse(localStorage.getItem('snippets')))[snippet.getAttribute('data-id')]).id; }),
				meta: {revision: myForm.querySelector("input[name='meta.revision']").value, },
			};
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				console.log('DEBUG onEditDashboard', JSON.stringify(body));
			}
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'PUT', headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+'/'+app.api_version+'/dashboards/'+dashboard_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection('dashboards');
				toast('Dashboard has been saved.', {timeout:3000, type: 'done'});
				//var dashboardContainer = document.querySelector("section#dashboards div[data-id='"+dashboard_id+"']");
				//dashboardContainer.querySelector("h2").innerHTML = body.name;
			})
			.catch(function (error) {
				if ( dataLayer !== undefined ) {
					dataLayer.push({
						'eventCategory': 'Interaction',
						'eventAction': 'Save Dashboard',
						'eventLabel': 'Dashboard has not been saved.',
						'eventValue': '0',
						'event': 'Error'
					});
				}
				toast('Dashboard has not been saved.', {timeout:3000, type: 'error'});
			});
			evt.preventDefault();
		}
	},
	onAdd: function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			name: myForm.querySelector("input[name='Name']").value,
			description: myForm.querySelector("textarea[name='Description']").value,
			snippets: Array.prototype.map.call(myForm.querySelectorAll(".mdl-chips .mdl-chip"), function(snippet) { return ((JSON.parse(localStorage.getItem('snippets')))[snippet.getAttribute('data-id')]).id; }),
		};
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('DEBUG onAddDashboard', JSON.stringify(body));
		}
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+'/'+app.api_version+'/dashboards/';
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection('dashboards');
			toast('Dashboard has been added.', {timeout:3000, type: 'done'});
		})
		.catch(function (error) {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					'eventCategory': 'Interaction',
					'eventAction': 'Add Dashboard',
					'eventLabel': 'Dashboard has not been added.',
					'eventValue': '0',
					'event': 'Error'
				});
			}
			toast('Dashboard has not been added.', {timeout:3000, type: 'error'});
		});
		evt.preventDefault();
	},
	onDelete: function(id) {
	},
	display: function(id, isAdd, isEdit, isPublic) {
		history.pushState( {section: 'dashboard' }, window.location.hash.substr(1), '#dashboard?id='+id );
		
		window.scrollTo(0, 0);
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/dashboards/'+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var dashboard = response.data[i];
				document.title = (app.sectionsPageTitles['dashboard']).replace(/%s/g, dashboard.attributes.name);

				var node;
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<h2 class=\"mdl-card__title-text\">"+dashboard.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
				if ( dashboard.attributes.description ) {
					var description = app.nl2br(dashboard.attributes.description);
					node += app.getField(app.icons.description, 'Description', description, {type: 'text', isEdit: false});
				}
				if ( dashboard.attributes.meta.created ) {
					node += app.getField(app.icons.date, 'Created', moment(dashboard.attributes.meta.created).format(app.date_format), {type: 'text', isEdit: false});
				}
				if ( dashboard.attributes.meta.updated ) {
					node += app.getField(app.icons.date, 'Updated', moment(dashboard.attributes.meta.updated).format(app.date_format), {type: 'text', isEdit: false});
				}
				if ( dashboard.attributes.meta.revision ) {
					node += app.getField(app.icons.update, 'Revision', dashboard.attributes.meta.revision, {type: 'text', isEdit: false});
				}
				node += "		</div>";
				node += "	</div>";
				node += "</section>";

				var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
				if ( isEdit ) {
					node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField(null, 'meta.revision', dashboard.attributes.meta.revision, {type: 'hidden', id: 'meta.revision', pattern: app.patterns.meta_revision});
					node += app.getField(app.icons.dashboards, 'Name', dashboard.attributes.name, {type: 'text', id: 'Name', isEdit: isEdit, pattern: app.patterns.name, error:'Name should be set and more than 3 chars length.'});
					node += app.getField(app.icons.description, 'Description', app.nl2br(dashboard.attributes.description), {type: 'textarea', id: 'Description', isEdit: isEdit});

					if ( localStorage.getItem('snippets') != 'null' ) {
						var snippets = JSON.parse(localStorage.getItem('snippets')).map(function(snippet) {
							return {value: snippet.name, name: snippet.id, sType: snippet.sType};
						});
						node += app.getField(app.icons.snippets, 'Snippets to add', '', {type: 'select', id: 'snippetsChipsSelect', isEdit: true, options: snippets });
					} else {
						app.getSnippets();
						node += app.getField(app.icons.snippets, 'Snippets to add (you should add some snippets first)', '', {type: 'select', id: 'snippetsChipsSelect', isEdit: true, options: {} });
					}

					node += "		<div class='mdl-list__item--three-line small-padding  mdl-card--expand mdl-chips chips-initial input-field' id='snippetsChips'>";
					node += "			<span class='mdl-chips__arrow-down__container mdl-selectfield__arrow-down__container'><span class='mdl-chips__arrow-down'></span></span>";
					node += "		</div>";
					node += "	</div>";
					node += "</section>";
					
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+id+"'>";
					if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>View</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>View Dashboard</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[1]+"' class='save-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>save</i>";
					node += "			<label>Save</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save changes to Dashboard</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "</section>"
				} else {
					/* View mode */
					for ( var i=0; i < dashboard.attributes.snippets.length; i++ ) {
						app.getSnippet(app.icons.snippets, dashboard.attributes.snippets[i], (app.containers.dashboard).querySelector('.page-content'));
					}
				}
				(app.containers.dashboard).querySelector('.page-content').innerHTML = node;
				app.setExpandAction();
				componentHandler.upgradeDom();
				
				app.refreshButtonsSelectors();
				if ( isEdit ) {
					app.buttons.backDashboard.addEventListener('click', function(evt) { app.resources.dashboards.display(dashboard.id, false, false, false); }, false);
					app.buttons.saveDashboard.addEventListener('click', function(evt) { app.resources.dashboards.onEdit(evt); }, false);

					document.getElementById('snippetsChipsSelect').parentNode.querySelector('div.mdl-selectfield__list-option-box ul').addEventListener('click', function(evt) {
						var id = evt.target.getAttribute('data-value');
						var n=0;
						if ( localStorage.getItem('snippets') != 'null' ) {
							var s = JSON.parse(localStorage.getItem('snippets')).find(function(snippet) {
								if ( n == id ) return snippet;
								else n++;
							});
						}
						var sType = s.sType;
						var name = evt.target.innerText; // == s.name
						app.addChipSnippetTo('snippetsChips', {name: s.name, id: id, sType: s.sType, type: 'snippets'});
						evt.preventDefault();
					}, false);

					if ( dashboard.attributes.snippets && dashboard.attributes.snippets.length > -1 ) {
						dashboard.attributes.snippets.map(function(s) {
							//Snippet list, we put the index not the snippet_id into the selector:
							var n=0;
							if ( localStorage.getItem('snippets') != 'null' ) {
								var theSnippet = (JSON.parse(localStorage.getItem('snippets'))).find(function(storedS) { storedS.index = n++; return storedS.id == s; });
								if ( theSnippet ) {
									app.addChipSnippetTo('snippetsChips', {name: theSnippet.name, id: theSnippet.index, sType: theSnippet.sType, type: 'snippets'});
								}
							}
						});
					}
				}

				componentHandler.upgradeDom();
				app.setExpandAction();

				var sn = document.querySelectorAll('#snippetsChips .mdl-chip');
				[].forEach.call(sn, app.addDnDHandlers);
				app.setSection('dashboard');
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('displayDashboard error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	},
	displayPublic: function(id, isAdd, isEdit, isPublic) {
	},
	displayAdd: function(dashboard, isAdd, isEdit, isPublic) {
		var node = "";
		node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+dashboard.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.dashboards, 'Name', dashboard.attributes.name, {type: 'text', id: 'Name', isEdit: true, pattern: app.patterns.name, error:'Name should be set and more than 3 chars length.'});
		node += app.getField(app.icons.description, 'Description', app.nl2br(dashboard.attributes.description), {type: 'textarea', id: 'Description', isEdit: true});

		var snippets;
		if ( localStorage.getItem('snippets') != 'null' ) {
			snippets = JSON.parse(localStorage.getItem('snippets')).map(function(snippet) {
				return {value: snippet.name, name: snippet.id, sType: snippet.sType};
			});
		} else {
			app.getSnippets();
			toast('You should add a Snippet first, it seems you don\' have any yet.', {timeout:3000, type: 'warning'});
			snippets = [{value: 'undefined', name: 'undefined', sType: 'undefined'}];
		}
		node += app.getField(app.icons.snippets, 'Snippets to add', '', {type: 'select', id: 'snippetsChipsSelect', isEdit: true, options: snippets });
		
		node += "		<div class='mdl-list__item--three-line small-padding  mdl-card--expand mdl-chips chips-initial input-field' id='snippetsChips'>";
		node += "			<span class='mdl-chips__arrow-down__container mdl-selectfield__arrow-down__container'><span class='mdl-chips__arrow-down'></span></span>";
		node += "		</div>";
		node += "	</div>";
		node += "</section>";
		
		var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
		node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+flow.id+"'>";
		if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
		node += "	<div class='mdl-cell--1-col-phone pull-left'>";
		node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+dashboard.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Dashboards</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--1-col-phone pull-right'>";
		node += "		<button id='"+btnId[1]+"' class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+dashboard.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save new Dashboard</label>";
		node += "		</button>";
		node += "	</div>";
		if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
		node += "</section>";

		(app.containers.dashboard_add).querySelector('.page-content').innerHTML = node;
		componentHandler.upgradeDom();
		document.getElementById('snippetsChipsSelect').parentNode.querySelector('div.mdl-selectfield__list-option-box ul').addEventListener('click', function(evt) {
			var id = evt.target.getAttribute('data-value');
			var n=0;
			var s = JSON.parse(localStorage.getItem('snippets')).find(function(snippet) {
				if ( n == id ) return snippet;
			else n++;
			});
			var sType = s.sType;
			var name = evt.target.innerText;
			app.addChipSnippetTo('snippetsChips', {name: name, id: id, sType: sType, type: 'snippets'});
			evt.preventDefault();
		}, false);
		
		app.refreshButtonsSelectors();
		app.buttons.addDashboardBack.addEventListener('click', function(evt) { app.setSection('dashboards'); evt.preventDefault(); }, false);
		app.buttons.addDashboard.addEventListener('click', function(evt) { app.resources.dashboards.onAdd(evt); }, false);

		app.setExpandAction();
	},
	displayItem: function(dashboard) {
		var type = 'dashboards';
		var name = dashboard.attributes.name!==undefined?dashboard.attributes.name:"";
		var description = dashboard.attributes.description!==undefined?dashboard.attributes.description.substring(0, app.cardMaxChars):'';
		var attributeType = dashboard.attributes.type!==undefined?dashboard.attributes.type:'';
		
		var element = "";
		element += "<div class=\"mdl-grid mdl-cell\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+dashboard.id+"\">";
		element += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		element += "		<div class=\"mdl-card__title\">";
		element += "			<i class=\"material-icons\">"+app.icons.objects+"</i>";
		element += "			<h3 class=\"mdl-card__title-text\">"+name+"</h3>";
		element += "		</div>";
		element += app.getField(null, null, description, {type: 'textarea', isEdit: false});
		element += "		<div class=\"mdl-card__actions mdl-card--border\">";
		element += "			<span class=\"pull-left mdl-card__date\">";
		element += "				<button data-id=\""+dashboard.id+"\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">update</i>";
		element += "				</button>";
		element += "				<span data-date=\"created\" class=\"visible\">Created on "+moment(dashboard.attributes.meta.created).format(app.date_format) + "</span>";
		if ( dashboard.attributes.meta.updated ) {
			element += "				<span data-date=\"updated\" class=\"hidden\">Updated on "+moment(dashboard.attributes.meta.updated).format(app.date_format) + "</span>";
		} else {
			element += "				<span data-date=\"updated\" class=\"hidden\">Never been updated yet.</span>";
		}
		element += "			</span>";
		element += "			<span class=\"pull-right mdl-card__menuaction\">";
		element += "				<button id=\"menu_"+dashboard.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">"+app.icons.menu+"</i>";
		element += "				</button>";
		element += "			</span>";
		element += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+dashboard.id+"\">";
		element += "				<li class=\"mdl-menu__item delete-button\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+dashboard.id+"\" data-name=\""+name+"\">"+app.icons.delete+"</i>Delete</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+dashboard.id+"\" data-name=\""+name+"\">"+app.icons.edit+"</i>Edit</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons copy-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+dashboard.id+"\">"+app.icons.copy+"</i><textarea class=\"copytextarea\">"+dashboard.id+"</textarea>Copy ID to clipboard</a>";
		element += "				</li>";
		element += "			</ul>";
		element += "		</div>";
		element += "	</div>";
		element += "</div>";

		return element;
	}
};
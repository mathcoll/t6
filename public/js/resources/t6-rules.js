'use strict';
app.resources.rules = {
	onEdit: function(evt) {
	},
	onAdd: function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			name: myForm.querySelector("input[name='Name']").value,
			active: !myForm.querySelector("input[id='switch-active']").parentNode.classList.contains('is-checked')?false:true,
			rule: {
				priority: myForm.querySelector("input[name='Priority']").value,
				conditions: JSON.parse(myForm.querySelector("textarea[name='Event Conditions']").value),
				event: {
					type: myForm.querySelector("select[name='Event Type']").value,
					params: JSON.parse(myForm.querySelector("textarea[name='Event Parameters']").value),
				}
			}
		};
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('DEBUG onAddRule', JSON.stringify(body));
		}
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+'/'+app.api_version+'/rules/';
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection('rules');
			toast('Rule has been added.', {timeout:3000, type: 'done'});
		})
		.catch(function (error) {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					'eventCategory': 'Interaction',
					'eventAction': 'Add Rule ',
					'eventLabel': 'Rule has not been added.',
					'eventValue': '0',
					'event': 'Error'
				});
			}
			toast('Rule has not been added.', {timeout:3000, type: 'error'});
		});
		evt.preventDefault();
	},
	onDelete: function(id) {
	},
	display: function(id, isAdd, isEdit, isPublic) {
		history.pushState( {section: 'rule' }, window.location.hash.substr(1), '#rule?id='+id );
		
		window.scrollTo(0, 0);
		app.containers.spinner.removeAttribute('hidden');
		app.containers.spinner.classList.remove('hidden');
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'GET', headers: myHeaders };
		var url = app.baseUrl+'/'+app.api_version+'/rules/'+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var rule = response.data[i];
				document.title = (app.sectionsPageTitles['rule']).replace(/%s/g, rule.attributes.name);
				var node;
				var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
				if ( isEdit ) {

					node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+rule.id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += "		<div class=\"mdl-list__item\">";
					node += "			<span class='mdl-list__item-primary-content'>";
					node += "				<i class=\"material-icons\">"+app.icons.rules+"</i>";
					node += "				<h2 class=\"mdl-card__title-text\">"+rule.attributes.name+"</h2>";
					node += "			</span>";
					node += "			<span class='mdl-list__item-secondary-action'>";
					node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+rule.id+"'>";
					node += "					<i class='material-icons'>expand_more</i>";
					node += "				</button>";
					node += "			</span>";
					node += "		</div>";
					node += "		<div class='mdl-cell--12-col hidden' id='description-"+rule.id+"'>";

					node += app.getField(app.icons.rules, 'Id', rule.id, {type: 'text'});
					if ( rule.attributes.meta.created ) {
						node += app.getField(app.icons.date, 'Created', moment(rule.attributes.meta.created).format(app.date_format), {type: 'text'});
					}
					if ( rule.attributes.meta.updated ) {
						node += app.getField(app.icons.date, 'Updated', moment(rule.attributes.meta.updated).format(app.date_format), {type: 'text'});
					}
					if ( rule.attributes.meta.revision ) {
						rule += app.getField(app.icons.update, 'Revision', rule.attributes.meta.revision, {type: 'text'});
					}
					node += "	</div>";
					node += "</section>";
					
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+id+"'>";
					if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>View</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>View Rule</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[1]+"' class='save-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>save</i>";
					node += "			<label>Save</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save changes to Rule</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "</section>";
					
					(app.containers.rule).querySelector('.page-content').innerHTML = node;
					componentHandler.upgradeDom();
					app.setExpandAction();
					
					app.refreshButtonsSelectors();
					app.buttons.backRule.addEventListener('click', function(evt) { app.resources.rules.display(rule.id, false, false, false); }, false);
					app.buttons.saveRule.addEventListener('click', function(evt) { app.resources.rules.onEdit(evt); }, false);
						
				} else {
					node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+id+"\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += "		<div class=\"mdl-list__item\">";
					node += "			<span class='mdl-list__item-primary-content'>";
					node += "				<h2 class=\"mdl-card__title-text\">";
					node += "					<i class=\"material-icons\">"+app.icons.rules+"</i>";
					node += "					"+rule.attributes.name+"</h2>";
					node += "			</span>";
					node += "			<span class='mdl-list__item-secondary-action'>";
					node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+id+"'>";
					node += "					<i class='material-icons'>expand_more</i>";
					node += "				</button>";
					node += "			</span>";
					node += "		</div>";
					node += "		<div class='mdl-cell mdl-cell--12-col hidden' id='description-"+id+"'>";
					if ( rule.attributes.meta.created ) {
						node += app.getField(app.icons.date, 'Created', moment(rule.attributes.meta.created).format(app.date_format), {type: 'text'});
					}
					if ( rule.attributes.meta.updated ) {
						node += app.getField(app.icons.date, 'Updated', moment(rule.attributes.meta.updated).format(app.date_format), {type: 'text'});
					}
					if ( rule.attributes.meta.revision ) {
						node += app.getField(app.icons.update, 'Revision', rule.attributes.meta.revision, {type: 'text'});
					}
					node += "	</div>"; // mdl-shadow--2dp
					node +=	"</section>";
					
					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+flow.id+"'>";
					if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='list-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>List</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Rules</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone delete-button'>";
					node += "		<button id='"+btnId[1]+"' class='delete-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>delete</i>";
					node += "			<label>Delete</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Delete Rule</label>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[2]+"' class='edit-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>edit</i>";
					node += "			<label>Edit</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[2]+"'>Edit Rule</label>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "</section>";

					(app.containers.rule).querySelector('.page-content').innerHTML = node;
					componentHandler.upgradeDom();
					app.setExpandAction();
					
					app.refreshButtonsSelectors();
					app.buttons.listRule.addEventListener('click', function(evt) { app.setSection('rules'); evt.preventDefault(); }, false);
					// buttons.deleteRule2.addEventListener('click',
					// function(evt) { console.log('SHOW MODAL AND CONFIRM!');
					// }, false);
					app.buttons.editRule2.addEventListener('click', function(evt) { app.resources.rules.display(rule.id, false, true, false); evt.preventDefault(); }, false);
				}
				app.setSection('rule');
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem('settings.debug') == 'true' ) {
				toast('displayRule error occured...' + error, {timeout:3000, type: 'error'});
			}
		});
		app.containers.spinner.setAttribute('hidden', true);
	},
	displayPublic: function(id, isAdd, isEdit, isPublic) {
	},
	displayAdd: function(rule, isAdd, isEdit, isPublic) {
		var node = "";
		node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+rule.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.rules, 'Name', rule.attributes.name, {type: 'text', id: 'Name', isEdit: true, pattern: app.patterns.name, error:'Name should be set and more than 3 chars length.'});
		node += app.getField('add_circle_outline', 'Event Type', rule.attributes.event.type, {type: 'select', id: 'EventType', options: app.EventTypes, isEdit: true });
		node += app.getField('swap_vert', 'Priority', rule.attributes.priority, {type: 'text', id: 'Priority', isEdit: true, pattern: app.patterns.integerNotNegative, error:'Should be a positive integer.'});
		node += app.getField('traffic', rule.attributes.active!='false'?"Rule is active":"Rule is disabled", rule.attributes.active!==undefined?rule.attributes.active:true, {type: 'switch', id:'active', isEdit: true});
		node += "	</div>";
		node += "</section>";


		node += app.getSubtitle('Event Conditions');
		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+rule.id+"_parameters\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.description, 'Event Conditions', app.nl2br(rule.attributes.event.conditions), {type: 'textarea', id: 'EventConditions', isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		node += app.getSubtitle('Event Parameters');
		node += "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+rule.id+"_parameters\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField('note', ['Name', 'Value'], ['', ''], {type: '2inputs', pattern: [app.patterns.customAttributeName, app.patterns.customAttributeValue], error: ['Name should not contains any space nor special char.', 'Value is free.'], id: ['Name[]', 'Value[]'], isEdit: true});
		node += app.getField(app.icons.description, 'Event Parameters', app.nl2br(rule.attributes.event.parameters), {type: 'textarea', id: 'EventParams', isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
		node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+rule.id+"'>";
		if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
		node += "	<div class='mdl-cell--1-col-phone pull-left'>";
		node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Rules</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--1-col-phone pull-right'>";
		node += "		<button id='"+btnId[1]+"' class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+object.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save new Rule</label>";
		node += "		</button>";
		node += "	</div>";
		if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
		node += "</section>";

		(app.containers.rule_add).querySelector('.page-content').innerHTML = node;
		componentHandler.upgradeDom();
		
		app.refreshButtonsSelectors();
		
		if ( document.getElementById('switch-active') ) {
			document.getElementById('switch-active').addEventListener('change', function(e) {
				var label = e.target.parentElement.querySelector('div.mdl-switch__label');
				if ( document.getElementById('switch-active').checked == true ) {
					label.innerText = "Rule is active";
				} else {
					label.innerText = "Rule is disabled";
				}
			});
		}
		
		app.buttons.addRuleBack.addEventListener('click', function(evt) { app.setSection('rules'); evt.preventDefault(); }, false);
		app.buttons.addRule.addEventListener('click', function(evt) { app.resources.rules.onAdd(evt); }, false);

		app.setExpandAction();
	},
	displayItem: function(rule) {
		/* On the list Views */
	}
};
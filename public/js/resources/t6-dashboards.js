app.resources.dashboards = {
	onEdit(evt) {
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
				console.log('DEBUG onSaveDashboard', JSON.stringify(body));
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
	onAdd(evt) {
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
			fetchStatusHandler
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
	onDelete(id) {
	},
	display(id, isAdd, isEdit, isPublic) {
	},
	displayPublic(id, isAdd, isEdit, isPublic) {
	},
	displayAdd(object, isAdd, isEdit, isPublic) {
	},
	displayItem(object) {
		/* On the list Views */
	}
};
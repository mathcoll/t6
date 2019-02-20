app.resources.snippets = {
	onEdit(evt) {
		var snippet_id = evt.target.parentNode.getAttribute('data-id')?evt.target.parentNode.getAttribute('data-id'):evt.target.getAttribute('data-id');
		if ( !snippet_id ) {
			toast('No Snippet id found!', {timeout:3000, type: 'error'});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			var body = {
				name: myForm.querySelector("input[name='Name']").value,
				type: myForm.querySelector("select[name='Type']").value,
				icon: myForm.querySelector("select[name='Icon']").value,
				color: myForm.querySelector("input[name='Color']").value,
				flows: Array.prototype.map.call(myForm.querySelectorAll(".mdl-chips .mdl-chip"), function(flow) { return ((JSON.parse(localStorage.getItem('flows')))[flow.getAttribute('data-id')]).id; }),
				meta: {revision: myForm.querySelector("input[name='meta.revision']").value, },
			};
	
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'PUT', headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+'/'+app.api_version+'/snippets/'+snippet_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection('snippets');
				toast('Snippet has been saved.', {timeout:3000, type: 'done'});
				//var snippetContainer = document.querySelector("section#snippets div[data-id='"+snippet_id+"']");
				//snippetContainer.querySelector("h2").innerHTML = body.name;
			})
			.catch(function (error) {
				if ( dataLayer !== undefined ) {
					dataLayer.push({
						'eventCategory': 'Interaction',
						'eventAction': 'Save Snippet',
						'eventLabel': 'Snippet has not been saved.',
						'eventValue': '0',
						'event': 'Error'
					});
				}
				toast('Snippet has not been saved.', {timeout:3000, type: 'error'});
			});
			evt.preventDefault();
		}
	},
	onAdd(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			name: myForm.querySelector("input[name='Name']").value,
			type: myForm.querySelector("select[name='Type']").value,
			icon: myForm.querySelector("select[name='Icon']").value,
			color: myForm.querySelector("input[name='Color']").value,
			flows: Array.prototype.map.call(myForm.querySelectorAll(".mdl-chips .mdl-chip"), function(flow) { return ((JSON.parse(localStorage.getItem('flows')))[flow.getAttribute('data-id')]).id; }),
		};
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('DEBUG onAddSnippet', JSON.stringify(body));
		}
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+'/'+app.api_version+'/snippets/';
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection('snippets');
			toast('Snippet has been added.', {timeout:3000, type: 'done'});
		})
		.catch(function (error) {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					'eventCategory': 'Interaction',
					'eventAction': 'Add Snippet',
					'eventLabel': 'Snippet has not been added.',
					'eventValue': '0',
					'event': 'Error'
				});
			}
			toast('Snippet has not been added.', {timeout:3000, type: 'error'});
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
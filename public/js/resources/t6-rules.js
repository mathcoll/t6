app.resources.rules = {
	onEdit(evt) {
	},
	onAdd(evt) {
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
			fetchStatusHandler
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
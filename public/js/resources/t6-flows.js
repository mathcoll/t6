app.resources.flows = {
	onEdit(evt) {
		var flow_id = evt.target.parentNode.getAttribute('data-id')?evt.target.parentNode.getAttribute('data-id'):evt.target.getAttribute('data-id');
		if ( !flow_id ) {
			toast('No Flow id found!', {timeout:3000, type: 'error'});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode.parentNode;
			var body = {
				name: myForm.querySelector("input[name='Name']").value,
				mqtt_topic: myForm.querySelector("input[name='MQTT Topic']").value,
				data_type: myForm.querySelector("select[name='DataType']").value,
				unit: myForm.querySelector("select[name='Unit']").value,
				require_signed: myForm.querySelector("label.mdl-switch[data-id='switch-edit_require_signed']").classList.contains("is-checked")==true?'true':'false',
				require_encrypted: myForm.querySelector("label.mdl-switch[data-id='switch-edit_require_encrypted']").classList.contains("is-checked")==true?'true':'false',
				meta: {revision: myForm.querySelector("input[name='meta.revision']").value, },
			};
	
			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: 'PUT', headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+'/'+app.api_version+'/flows/'+flow_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection('flows');
				toast('Flow has been saved.', {timeout:3000, type: 'done'});
				//var flowContainer = document.querySelector("section#flows div[data-id='"+flow_id+"']");
				//flowContainer.querySelector("h2").innerHTML = body.name;
			})
			.catch(function (error) {
				if ( dataLayer !== undefined ) {
					dataLayer.push({
						'eventCategory': 'Interaction',
						'eventAction': 'Save Flow',
						'eventLabel': 'Flow has not been saved.',
						'eventValue': '0',
						'event': 'Error'
					});
				}
				toast('Flow has not been saved.', {timeout:3000, type: 'error'});
			});
			evt.preventDefault();
		}
	},
	onAdd(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			name: myForm.querySelector("input[name='Name']").value,
			mqtt_topic: myForm.querySelector("input[name='MQTT Topic']").value,
			data_type: myForm.querySelector("select[name='DataType']").value,
			unit: myForm.querySelector("select[name='Unit']").value,
			require_signed: myForm.querySelector("label.mdl-switch[data-id='switch-add_require_signed']").classList.contains("is-checked")==true?'true':'false',
			require_encrypted: myForm.querySelector("label.mdl-switch[data-id='switch-add_require_encrypted']").classList.contains("is-checked")==true?'true':'false',
		};
		if ( localStorage.getItem('settings.debug') == 'true' ) {
			console.log('DEBUG onAddFlow', JSON.stringify(body));
		}
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem('bearer'));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: 'POST', headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+'/'+app.api_version+'/flows/';
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection('flows');
			toast('Flow has been added.', {timeout:3000, type: 'done'});
		})
		.catch(function (error) {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					'eventCategory': 'Interaction',
					'eventAction': 'Add Flow',
					'eventLabel': 'Flow has not been added.',
					'eventValue': '0',
					'event': 'Error'
				});
			}
			toast('Flow has not been added.', {timeout:3000, type: 'error'});
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
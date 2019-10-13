"use strict";
app.resources.flows = {
	onEdit: function(evt) {
		var flow_id = evt.target.parentNode.getAttribute("data-id")?evt.target.parentNode.getAttribute("data-id"):evt.target.getAttribute("data-id");
		if ( !flow_id ) {
			toast("No Flow id found!", {timeout:3000, type: "error"});
		} else {
			var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
			
			console.log(myForm.querySelector("input[name='MQTT Topic']").value);
			var body = {
				name: myForm.querySelector("input[name='Name']").value,
				mqtt_topic: myForm.querySelector("input[name='MQTT Topic']").value,
				data_type: myForm.querySelector("select[name='DataType']").value,
				unit: myForm.querySelector("select[name='Unit']").value,
				require_signed: myForm.querySelector("label.mdl-switch[data-id='switch-edit_require_signed']").classList.contains("is-checked")===true?"true":"false",
				require_encrypted: myForm.querySelector("label.mdl-switch[data-id='switch-edit_require_encrypted']").classList.contains("is-checked")===true?"true":"false",
				meta: {revision: myForm.querySelector("input[name='meta.revision']").value, },
			};

			var myHeaders = new Headers();
			myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
			myHeaders.append("Content-Type", "application/json");
			var myInit = { method: "PUT", headers: myHeaders, body: JSON.stringify(body) };
			var url = app.baseUrl+"/"+app.api_version+"/flows/"+flow_id;
			fetch(url, myInit)
			.then(
				app.fetchStatusHandler
			).then(function(fetchResponse){ 
				return fetchResponse.json();
			})
			.then(function(response) {
				app.setSection("flows");
				var flowsList = JSON.parse(localStorage.getItem("flows"));
				app.flows = [];
				flowsList.map(function(fl) {
					if( fl.id == flow_id ) {
						app.flows.push( {id: fl.id, name:response.flow.data.attributes.name, type: response.flow.data.type} );
					} else {
						app.flows.push( {id: fl.id, name:fl.name, type: fl.type} );
					}
				});
				localStorage.setItem("flows", JSON.stringify(app.flows));
				toast("Flow has been saved.", {timeout:3000, type: "done"});
				//var flowContainer = document.querySelector("section#flows div[data-id=""+flow_id+""]");
				//flowContainer.querySelector("h2").innerHTML = body.name;
			})
			.catch(function (error) {
				if ( dataLayer !== undefined ) {
					dataLayer.push({
						"eventCategory": "Interaction",
						"eventAction": "Save Flow",
						"eventLabel": "Flow has not been saved.",
						"eventValue": "0",
						"event": "Error"
					});
				}
				toast("Flow has not been saved."+error, {timeout:3000, type: "error"});
			});
			evt.preventDefault();
		}
	},
	onAdd: function(evt) {
		var myForm = evt.target.parentNode.parentNode.parentNode.parentNode;
		var body = {
			name: myForm.querySelector("input[name='Name']").value,
			mqtt_topic: myForm.querySelector("input[name='MQTT Topic']").value,
			data_type: myForm.querySelector("select[name='DataType']").value,
			unit: myForm.querySelector("select[name='Unit']").value,
			require_signed: myForm.querySelector("label.mdl-switch[data-id='switch-add_require_signed']").classList.contains("is-checked")===true?"true":"false",
			require_encrypted: myForm.querySelector("label.mdl-switch[data-id='switch-add_require_encrypted']").classList.contains("is-checked")===true?"true":"false",
		};
		if ( localStorage.getItem("settings.debug") == "true" ) {
			console.log("DEBUG onAddFlow", JSON.stringify(body));
		}
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "POST", headers: myHeaders, body: JSON.stringify(body) };
		var url = app.baseUrl+"/"+app.api_version+"/flows/";
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			app.setSection("flows");
			var flowsList = new Array();
			if ( JSON.parse(localStorage.getItem("flows")) != "null" && JSON.parse(localStorage.getItem("flows")).length > -1 ) {
				flowsList = JSON.parse(localStorage.getItem("flows"));
			}
			flowsList.push({id: response.flow.data.id, name:response.flow.data.attributes.name, type: response.flow.data.type});
			localStorage.setItem("flows", JSON.stringify(flowsList));
			toast("Flow has been added.", {timeout:3000, type: "done"});
		})
		.catch(function (error) {
			if ( dataLayer !== undefined ) {
				dataLayer.push({
					"eventCategory": "Interaction",
					"eventAction": "Add Flow",
					"eventLabel": "Flow has not been added.",
					"eventValue": "0",
					"event": "Error"
				});
			}
			toast("Flow has not been added.", {timeout:3000, type: "error"});
		});
		evt.preventDefault();
	},
	onDelete: function(flow_id) {
		var flowsList = JSON.parse(localStorage.getItem("flows"));
		app.flows = [];
		flowsList.filter(function(fl) {
			if( fl.id != flow_id ) {
				app.flows.push( {id: fl.id, name:fl.name, type: fl.type} );
			}
		});
		localStorage.setItem("flows", JSON.stringify(app.flows));
	},
	display: function(id, isAdd, isEdit, isPublic) {
		history.pushState( {section: "flow" }, window.location.hash.substr(1), "#flow?id="+id );
		
		window.scrollTo(0, 0);
		app.containers.spinner.removeAttribute("hidden");
		app.containers.spinner.classList.remove("hidden");
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Bearer "+localStorage.getItem("bearer"));
		myHeaders.append("Content-Type", "application/json");
		var myInit = { method: "GET", headers: myHeaders };
		var url = app.baseUrl+"/"+app.api_version+"/flows/"+id;
		fetch(url, myInit)
		.then(
			app.fetchStatusHandler
		).then(function(fetchResponse){ 
			return fetchResponse.json();
		})
		.then(function(response) {
			for (var i=0; i < (response.data).length ; i++ ) {
				var flow = response.data[i];
				document.title = (app.sectionsPageTitles["flow"]).replace(/%s/g, flow.attributes.name);
				
				((app.containers.flow).querySelector(".page-content")).innerHTML = "";
				var datapoints = "";
				
				var node = "";
				node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+flow.id+"\">";
				node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
				node += "		<div class=\"mdl-list__item\">";
				node += "			<span class='mdl-list__item-primary-content'>";
				node += "				<i class=\"material-icons\">"+app.icons.flows+"</i>";
				node += "				<h2 class=\"mdl-card__title-text\">"+flow.attributes.name+"</h2>";
				node += "			</span>";
				node += "			<span class='mdl-list__item-secondary-action'>";
				node += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='description-"+flow.id+"'>";
				node += "					<i class='material-icons'>expand_more</i>";
				node += "				</button>";
				node += "			</span>";
				node += "		</div>";
				node += "		<div class='mdl-cell--12-col hidden' id='description-"+flow.id+"'>";

				node += app.getField(app.icons.flows, "Id", flow.id, {type: "text", style:"text-transform: none !important;"});
				if ( flow.attributes.description && isEdit!==true ) {
					node += app.getField(app.icons.description, "Description", app.nl2br(flow.attributes.description), {type: "text"});
				}
				if ( flow.attributes.meta.created ) {
					node += app.getField(app.icons.date, "Created", moment(flow.attributes.meta.created).format(app.date_format), {type: "text"});
				}
				if ( flow.attributes.meta.updated ) {
					node += app.getField(app.icons.date, "Updated", moment(flow.attributes.meta.updated).format(app.date_format), {type: "text"});
				}
				if ( flow.attributes.meta.revision ) {
					node += app.getField(app.icons.update, "Revision", flow.attributes.meta.revision, {type: "text"});
				}
				node += "		</div>";
				node += "	</div>";
				node += "</section>";
				
				var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
				if ( isEdit ) {
					if ( !localStorage.getItem("units") ) {
						app.getUnits();
					}
					var allUnits = JSON.parse(localStorage.getItem("units"));

					if ( !localStorage.getItem("datatypes") ) {
						app.getDatatypes();
					}
					var allDatatypes = JSON.parse(localStorage.getItem("datatypes"));

					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					node += app.getField(null, "meta.revision", flow.attributes.meta.revision, {type: "hidden", id: "meta.revision", pattern: app.patterns.meta_revision});
					node += app.getField(app.icons.name, "Name", flow.attributes.name!==undefined?flow.attributes.name:"", {type: "text", id: "Name", isEdit: isEdit});
					//var description = flow.attributes.description!==undefined?app.nl2br(flow.attributes.description):"";
					//node += app.getField(app.icons.description, "Description", description, {type: "text", id: "Description", isEdit: isEdit});
					node += app.getField(app.icons.mqtts, "MQTT Topic", flow.attributes.mqtt_topic!==undefined?flow.attributes.mqtt_topic:"", {type: "text", style:"text-transform: none !important;", id: "MQTTTopic", isEdit: isEdit});
					node += app.getField(app.icons.units, "Unit", flow.attributes.unit, {type: "select", id: "Unit", isEdit: true, options: allUnits });
					node += app.getField(app.icons.datatypes, "DataType", flow.attributes.data_type, {type: "select", id: "DataType", isEdit: true, options: allDatatypes });
					node += app.getField("verified_user", flow.attributes.require_signed!==false?"Require signed payload from Object":"Does not require signed payload from Object", flow.attributes.require_signed, {type: "switch", id: "edit_require_signed", isEdit: isEdit});
					node += app.getField("vpn_key", flow.attributes.require_encrypted!==false?"Require encrypted payload from Object":"Does not require encrypted payload from Object", flow.attributes.require_encrypted, {type: "switch", id: "edit_require_encrypted", isEdit: isEdit});
					node += "	</div>";
					node += "</section>";

					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+id+"'>";
					if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>View</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>View Flow</div>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[1]+"' class='save-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+id+"'>";
					node += "			<i class='material-icons'>save</i>";
					node += "			<label>Save</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save Flow</div>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "</section>";
					
				} else {
					node += "<section class=\"mdl-grid mdl-cell--12-col\">";
					node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
					if ( flow.attributes.type ) {
						node += app.getField("extension", "Type", flow.attributes.type, {type: "text", id: "Type", isEdit: isEdit});
					}
					if ( flow.attributes.mqtt_topic ) {
						node += app.getField(app.icons.mqtts, "MQTT Topic", flow.attributes.mqtt_topic, {type: "text", style:"text-transform: none !important;", id: "MQTTTopic", isEdit: isEdit});
					}
					if ( flow.attributes.unit && localStorage.getItem("units") !== "null" && JSON.parse(localStorage.getItem("units")) ) {
						var unit = JSON.parse(localStorage.getItem("units")).find( function(u) { return u.name == flow.attributes.unit; });
						node += app.getField(app.icons.units, "Unit", unit.value, {type: "select", id: "Unit", isEdit: isEdit, options: app.units });
					} else {
						app.getUnits();
					}
					if ( flow.attributes.data_type ) {
						var datatype = JSON.parse(localStorage.getItem("datatypes")).find( function(d) { return d.name == flow.attributes.data_type; }).value;
						node += app.getField(app.icons.datatypes, "DataType", datatype, {type: "select", id: "DataType", isEdit: isEdit, options: app.datatypes });
					}
					node += app.getField("verified_user", flow.attributes.require_signed!==false?"Require signed payload from Object":"Does not require signed payload from Object", flow.attributes.require_signed, {type: "switch", id: "show_require_signed", isEdit: isEdit});
					node += app.getField("vpn_key", flow.attributes.require_encrypted!==false?"Require encrypted payload from Object":"Does not require encrypted payload from Object", flow.attributes.require_encrypted, {type: "switch", id: "show_require_encrypted", isEdit: isEdit});
					node += "	</div>";
					node += "</section>";
					
					node += "<section class='mdl-grid mdl-cell--12-col' id='"+flow.id+"'>";
					node += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
					node += "		<span class='mdl-list__item mdl-list__item--two-line'>";
					node += "			<span class='mdl-list__item-primary-content'>";
					node +=	"				<span>"+flow.attributes.name+" ("+unit.value+"/"+datatype+")</span>";
					node +=	"				<span class='mdl-list__item-sub-title' id='flow-graph-time-"+flow.id+"'></span>";
					node +=	"			</span>";
					node +=	"		</span>";
					node += "		<span class='mdl-list__item' id='flow-graph-"+flow.id+"' style='width:100%; height:200px;'>";
					node += "			<span class='mdl-list__item-sub-title mdl-chip mdl-chip__text'></span>";
					node += "		</span>";
					var options = {
						series: { lines : { show: true, fill: "false", lineWidth: 3, steps: false } },
						colors: [flow.attributes.color!==""?flow.attributes.color:"#000000"],
						points : { show : true },
						legend: { show: true, position: "sw" },
						grid: {
							borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
							borderColor: { top: "", right: "", bottom: "", left: "" },
							// markings: weekendAreas,
							clickable: true,
							hoverable: true,
							autoHighlight: true,
							mouseActiveRadius: 5
						},
						xaxis: { mode: "time", autoscale: true, timeformat: "%d/%m/%Y<br/>%Hh%M" },
						yaxis: [ { autoscale: true, position: "left" }, { autoscale: true, position: "right" } ],
					};

					var my_flow_data_url = app.baseUrl+"/"+app.api_version+"/data/"+flow.id+"?limit=100&sort=desc";
					fetch(my_flow_data_url, myInit)
					.then(
						app.fetchStatusHandler
					).then(function(fetchResponse){ 
						return fetchResponse.json();
					})
					.then(function(data) {
						datapoints += "	<div class='mdl-cell--12-col mdl-card mdl-shadow--2dp'>";
						datapoints += "		<div class='mdl-list__item small-padding'>";
						datapoints += "			<span class='mdl-list__item-primary-content'>";
						datapoints += "				<i class='material-icons'>"+app.icons.datapoints+"</i>";
						datapoints += "				Data Points";
						datapoints += "			</span>";
						datapoints += "			<span class='mdl-list__item-secondary-action'>";
						datapoints += "				<button role='button' class='mdl-button mdl-js-button mdl-button--icon right showdescription_button' for='datapoints-"+flow.id+"'>";
						datapoints += "					<i class='material-icons'>expand_more</i>";
						datapoints += "				</button>";
						datapoints += "			</span>";
						datapoints += "		</div>";
						datapoints += "		<div class='mdl-cell mdl-cell--12-col hidden' id='datapoints-"+flow.id+"'>";
						var dataset = [data.data.map(function(i) {
							var value;
							if( datatype == "geo" ) {
								var geoPosition = {longitude: "", latitude: ""};
								[geoPosition.longitude, geoPosition.latitude] = (i.attributes.value).split(";");
								value = geoPosition.longitude + ", " + geoPosition.latitude;
							} else {
								value = (unit.format).replace(/%s/g, i.attributes.value);
							}
							datapoints += app.getField(app.icons.datapoints, moment(i.attributes.timestamp).format(app.date_format), value, {type: "text", isEdit: false});
							return [i.attributes.timestamp, i.attributes.value];
						})];
						componentHandler.upgradeDom();
						//$.plot($("#flow-graph-"+flow.id), dataset, options);
						datapoints += "		</div>";
						datapoints += "	</div>";
						
						var dtps = document.createElement("div");
						dtps.className = "mdl-grid mdl-cell--12-col";
						dtps.dataset.id = "last-datapoints_"+flow.id;
						dtps.innerHTML = datapoints;
						((app.containers.flow).querySelector(".page-content")).appendChild(dtps);
						
						componentHandler.upgradeDom();
						app.setExpandAction();
						
					})
					.catch(function (error) {
						if (error == "Error: Not Found") {
							toast("No data found, graph remain empty.", {timeout:3000, type: "warning"});
						} else {
							if ( localStorage.getItem("settings.debug") == "true" ) {
								toast("displayFlow error out..." + error, {timeout:3000, type: "error"});
							}
						}
					});
					node +=	"	</div>";
					node +=	"</section>";

					node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+flow.id+"'>";
					if( app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "	<div class='mdl-cell--1-col-phone pull-left'>";
					node += "		<button id='"+btnId[0]+"' class='list-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>chevron_left</i>";
					node += "			<label>List</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Flows</div>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone delete-button'>";
					node += "		<button id='"+btnId[1]+"' class='delete-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>delete</i>";
					node += "			<label>Delete</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Delete Flow...</div>";
					node += "		</button>";
					node += "	</div>";
					node += "	<div class='mdl-cell--1-col-phone pull-right'>";
					node += "		<button id='"+btnId[2]+"' class='edit-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
					node += "			<i class='material-icons'>edit</i>";
					node += "			<label>Edit</label>";
					node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[2]+"'>Edit Flow</div>";
					node += "		</button>";
					node += "	</div>";
					if( !app.isLtr() ) node += "	<div class='mdl-layout-spacer'></div>";
					node += "</section>";
				}
				
				var c = document.createElement("div");
				c.className = "page-content mdl-grid mdl-grid--no-spacing";
				c.dataset.idsupercoollllll = flow.id;
				c.innerHTML = node;
				(app.containers.flow).querySelector(".page-content").remove();
				(app.containers.flow).appendChild(c);

				app.refreshButtonsSelectors();
				if ( isEdit ) {
					app.buttons.backFlow.addEventListener("click", function(evt) { app.resources.flows.display(flow.id, false, false, false) }, false);
					app.buttons.saveFlow.addEventListener("click", function(evt) { app.resources.flows.onEdit(evt); }, false);

					var element1 = document.getElementById("switch-edit_require_signed").parentNode;
					if ( element1 ) {
						element1.addEventListener("change", function(e) {
							var label = e.target.parentElement.querySelector("div.mdl-switch__label");
							label.innerText = element1.classList.contains("is-checked")!==false?"Require signed payload from Object":"Does not require signed payload from Object";
						});
					}
					var element2 = document.getElementById("switch-edit_require_encrypted").parentNode;
					if ( element2 ) {
						element2.addEventListener("change", function(e) {
							var label = e.target.parentElement.querySelector("div.mdl-switch__label");
							label.innerText = element2.classList.contains("is-checked")!==false?"Require encrypted payload from Object":"Does not require encrypted payload from Object";
						});
					}
				} else {
					app.buttons.listFlow.addEventListener("click", function(evt) { app.setSection("flows"); evt.preventDefault(); }, false);
					// buttons.deleteFlow2.addEventListener("click",
					// function(evt) { console.log("SHOW MODAL AND CONFIRM!");
					// }, false);
					app.buttons.editFlow2.addEventListener("click", function(evt) { app.resources.flows.display(flow.id, false, true, false) }, false);
				}
				
				componentHandler.upgradeDom();
				app.setExpandAction();
				app.setSection("flow");
			}
		})
		.catch(function (error) {
			if ( localStorage.getItem("settings.debug") == "true" ) {
				toast("displayFlow error occured..." + error, {timeout:3000, type: "error"});
			}
		});
		app.containers.spinner.setAttribute("hidden", true);
	},
	displayPublic: function(id, isAdd, isEdit, isPublic) {
	},
	displayAdd: function(flow, isAdd, isEdit, isPublic) {
		if ( !localStorage.getItem("units") ) {
			app.getUnits();
		}
		var allUnits = JSON.parse(localStorage.getItem("units"));

		if ( !localStorage.getItem("datatypes") ) {
			app.getDatatypes();
		}
		var allDatatypes = JSON.parse(localStorage.getItem("datatypes"));
		
		var node = "";
		node = "<section class=\"mdl-grid mdl-cell--12-col\" data-id=\""+flow.id+"\">";
		node += "	<div class=\"mdl-cell--12-col mdl-card mdl-shadow--2dp\">";
		node += app.getField(app.icons.flows, "Name", flow.attributes.name, {type: "text", id: "Name", isEdit: true, pattern: app.patterns.name, error:"Name should be set and more than 3 chars length."});
		node += app.getField(app.icons.mqtts, "MQTT Topic", flow.attributes.mqtt_topic, {type: "text", id: "MQTTTopic", isEdit: true});
		node += app.getField(app.icons.units, "Unit", flow.attributes.unit, {type: "select", id: "Unit", isEdit: true, options: allUnits });
		node += app.getField(app.icons.datatypes, "DataType", flow.attributes.datatype, {type: "select", id: "DataType", isEdit: true, options: allDatatypes });
		node += app.getField("verified_user", flow.attributes.require_signed!==false?"Does not require signed payload  from Object":"Does not require signed payload from Object", flow.attributes.require_signed, {type: "switch", id: "add_require_signed", isEdit: true});
		node += app.getField("vpn_key", flow.attributes.require_encrypted!==false?"Does not require encrypted payload from Object":"Does not require encrypted payload from Object", flow.attributes.require_encrypted, {type: "switch", id: "add_require_encrypted", isEdit: true});
		node += "	</div>";
		node += "</section>";
		
		var btnId = [app.getUniqueId(), app.getUniqueId(), app.getUniqueId()];
		node += "<section class='mdl-grid mdl-cell--12-col fixedActionButtons' data-id='"+flow.id+"'>";
		if( app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "	<div class='mdl-cell--1-col-phone pull-left'>";
		node += "		<button id='"+btnId[0]+"' class='back-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
		node += "			<i class='material-icons'>chevron_left</i>";
		node += "			<label>List</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[0]+"'>List all Flows</label>";
		node += "		</button>";
		node += "	</div>";
		node += "	<div class='mdl-cell--1-col-phone pull-right'>";
		node += "		<button id='"+btnId[1]+"' class='add-button mdl-cell mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' data-id='"+flow.id+"'>";
		node += "			<i class='material-icons'>edit</i>";
		node += "			<label>Save</label>";
		node += "			<div class='mdl-tooltip mdl-tooltip--top' for='"+btnId[1]+"'>Save new Flow</label>";
		node += "		</button>";
		node += "	</div>";
		if( !app.isLtr() ) {
			node += "	<div class='mdl-layout-spacer'></div>";
		}
		node += "</section>";

		(app.containers.flow_add).querySelector(".page-content").innerHTML = node;
		componentHandler.upgradeDom();
		
		app.refreshButtonsSelectors();
		app.buttons.addFlowBack.addEventListener("click", function(evt) { app.setSection("flows"); evt.preventDefault(); }, false);
		app.buttons.addFlow.addEventListener("click", function(evt) { app.resources.flows.onAdd(evt); }, false);

		var element1 = document.getElementById("switch-add_require_signed").parentNode;
		if ( element1 ) {
			element1.addEventListener("change", function(e) {
				var label = e.target.parentElement.querySelector("div.mdl-switch__label");
				label.innerText = element1.classList.contains("is-checked")!==false?"Require signed payload from Object":"Does not require signed payload from Object";
			});
		}
		var element2 = document.getElementById("switch-add_require_encrypted").parentNode;
		if ( element2 ) {
			element2.addEventListener("change", function(e) {
				var label = e.target.parentElement.querySelector("div.mdl-switch__label");
				label.innerText = element2.classList.contains("is-checked")!==false?"Require encrypted payload from Object":"Does not require encrypted payload from Object";
			});
		}
		app.setExpandAction();
	},
	displayItem: function(flow) {
		var type = "flows";
		var name = flow.attributes.name!==undefined?flow.attributes.name:"";
		var description = flow.attributes.description!==undefined?flow.attributes.description.substring(0, app.cardMaxChars):"";
		var attributeType = flow.attributes.type!==undefined?flow.attributes.type:"";
		
		var element = "";
		element += "<div class=\"mdl-grid mdl-cell\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+flow.id+"\">";
		element += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		element += "		<div class=\"mdl-card__title\">";
		element += "			<i class=\"material-icons\">"+app.icons.flows+"</i>";
		element += "			<h3 class=\"mdl-card__title-text\">"+name+"</h3>";
		element += "		</div>";
		element += "<div class='mdl-list__item--three-line small-padding'>";
		if ( flow.attributes.unit ) {
			element += "	<div class='mdl-list__item-sub-title'>";
			if ( localStorage.getItem("units") !== "null" && JSON.parse(localStorage.getItem("units")) ) {
				element += "		<i class='material-icons md-28'>"+app.icons.units+"</i>"+JSON.parse(localStorage.getItem('units')).find( function(u) { return u.name == flow.attributes.unit; }).value;
			} else {
				element += "		<i class='material-icons md-28'>"+app.icons.units+"</i> ?";
			}
			element += "	</div>";
		}
		if ( flow.attributes.data_type ) {
			element += "	<div class='mdl-list__item-sub-title'>";
			element += "		<i class='material-icons md-28'>"+app.icons.datatypes+"</i>"+JSON.parse(localStorage.getItem('datatypes')).find( function(d) { return d.name == flow.attributes.data_type; }).value;
			element += "	</div>";
		}
		if ( flow.attributes.require_signed === true ) {
			element += "	<div class='mdl-list__item-sub-title'>";
			element += "		<i class='material-icons md-28'>verified_user</i> Require signed payload from Object"
			element += "	</div>";
		}
		if ( flow.attributes.require_encrypted === true ) {
			element += "	<div class='mdl-list__item-sub-title'>";
			element += "		<i class='material-icons md-28'>vpn_key</i> Require encrypted payload from Object"
			element += "	</div>";
		}
		element += "</div>";
		element += "		<div class=\"mdl-card__actions mdl-card--border\">";
		element += "			<span class=\"pull-left mdl-card__date\">";
		element += "				<button data-id=\""+flow.id+"\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">update</i>";
		element += "				</button>";
		element += "				<span data-date=\"created\" class=\"visible\">Created on "+moment(flow.attributes.meta.created).format(app.date_format) + "</span>";
		if ( flow.attributes.meta.updated ) {
			element += "				<span data-date=\"updated\" class=\"hidden\">Updated on "+moment(flow.attributes.meta.updated).format(app.date_format) + "</span>";
		} else {
			element += "				<span data-date=\"updated\" class=\"hidden\">Never been updated yet.</span>";
		}
		element += "			</span>";
		element += "			<span class=\"pull-right mdl-card__menuaction\">";
		element += "				<button id=\"menu_"+flow.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">"+app.icons.menu+"</i>";
		element += "				</button>";
		element += "			</span>";
		element += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+flow.id+"\">";
		element += "				<li class=\"mdl-menu__item delete-button\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+flow.id+"\" data-name=\""+name+"\">"+app.icons.delete+"</i>Delete</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+flow.id+"\" data-name=\""+name+"\">"+app.icons.edit+"</i>Edit</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons copy-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+flow.id+"\">"+app.icons.copy+"</i><textarea class=\"copytextarea\">"+flow.id+"</textarea>Copy ID to clipboard</a>";
		element += "				</li>";
		element += "			</ul>";
		element += "		</div>";
		element += "	</div>";
		element += "</div>";

		return element;
	}
};
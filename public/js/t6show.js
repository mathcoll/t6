"use strict";

let applicationServerKey = "BHnrqPBEjHfdNIeFK5wdj0y7i5eGM2LlPn62zxmvN8LsBTFEQk1Gt2zrKknJQX91a8RR87w8KGP_1gDSy8x6U7s";
let config;
class MaterialLightParser {
	createButton(b) {
		let uuid = typeof b.id!=="undefined"?b.id:b.trigger;
		let out = `
		<div>
			<label for="${uuid}" class="mdl-list__item mdl-js-ripple-effect">
				<div class="mdl-button__label">
					<button class="mdl-button mdl-js-button mdl-js-ripple-effect ${typeof b.class!=="undefined"?b.class:""}" id="${uuid}" value="${b.value}" data-action="${b.action}" data-method="${b.method}" data-trigger="${b.trigger}">`;
		if (b.icon) {
			out += `<i class="material-icons mdl-list__item-icon">${b.icon}</i>`;
		}
		out += `
					${b.label}</button>
				</div>
			</label>
		</div>`;
		return out;
	}
	createImage(i) {
		return `<img src="${i.src}" alt="${i.alt}" />`;
	}
	createHeaderLink(l) {
		let out = "";
		if(typeof l.spacer!=="undefined") {
			out += `<div class="mdl-menu__item">&nbsp;</div>`;
		} else {
			out += `<a class="mdl-navigation__link  ${typeof l.class!=="undefined"?l.class:""}" href="${l.link}">`;
			out += `<span class="mdl-list__item-primary-content">`;
			if (l.icon) {
				out += `<i class="material-icons mdl-list__item-icon">${l.icon}</i>`;
			}
			out += `${l.name}</span></a>`;
		}
		return out;
	}
	createSection(s) {
		let out = "";
		out += `<section id="${s.id}" class="mdl-cell--${typeof s.width!=="undefined"?s.width:"12"}-col">`;
		if (s.title) {
			out += `<div class="mdl-card"><div class=""><h3 class="mdl-card__title-text">${s.title}</h3></div></div>`;
		}
		if (s.icon) {
			out += `<i class="material-icons mdl-list__item-icon">${s.icon}</i>`;
		}
		if (s.content) {
			out += this.parse(s.content);
		}
		out += `</section>`;
		return out;
	}
	createTabContent(tc) {
		let out = "";
		out += `<a class="mdl-tabs__tab ${tc.class}" href="#${tc.id}">`;
		if (tc.icon) {
			out += `<i class="material-icons mdl-list__item-icon">${tc.icon}</i>`;
		}
		out += tc.name;
		out += `</a>`;
		return out;
	}
	createPanelContent(pc) {
		return `<section class="mdl-tabs__panel mdl-grid mdl-cell--${typeof pc.width!=="undefined"?pc.width:"12"}-col ${typeof pc.class!=="undefined"?pc.class:""}" id="${pc.id}">${this.parse(pc.body)}</section>`;
	}
	createCard(c) {
		let out = `
		<div class="mdl-grid mdl-cell--${typeof c.width!=="undefined"?c.width:"12"}-col">
			<div class="mdl-card mdl-shadow--2dp">
				<div class="mdl-card__title">
					<h3 class="mdl-card__title-text">`;
					if (c.icon) {
						out += `<i class="material-icons mdl-list__item-icon">${c.icon}</i>`;
					}
		out += `	${c.title}</h3>
				</div>`;
		if(c.body) {
			out += `<div class="mdl-list__item--three-line small-padding mdl-card--expand">
						<span class="mdl-list__item-sub-title">${this.parse(c.body)}</span>
					</div>`;
		}
		out += (typeof c.actions!=="undefined" && Object.keys(c.actions).length!==0)?`<div class="mdl-card__actions mdl-card--border">${this.parse(c.actions)}</div>`:"";
		out += "</div></div>";
		return out;
	}
	createList(l) {
		let out = "";
		out += `<li class="mdl-list__item mdl-cell--${typeof l.width!=="undefined"?l.width:"12"}-col mdl-list__item--three-line">`;
		out += `	<span class="mdl-list__item-primary-content">`;
		if (l.icon) {
			out += `<i class="material-icons ${l.class}">${l.icon}</i>`;
		}
		if (l.label) {
			out += `<span>${l.label}</span>`;
		}
		if (l.body || l.body_id) {
			out += `<span class="mdl-list__item-text-body mdl-grid mdl-cell--6-col" id="${typeof l.body_id!=="undefined"?l.body_id:""}"><span class="mdl-chip"><span class="mdl-chip__text">${l.body}</span></span></span>`;
		}
		out += `	</span>`;
		out += `	<span class="mdl-list__item-secondary-content mdl-grid mdl-cell--6-col">`;
		out += this.parse(l);
		//out += `		<a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">star</i></a>`;
		out += `	</span>`;
		out += `	</li>`;
		return out;
	}
	createText(t) {
		let out = "";
		out += `<div class="mdl-textfield mdl-js-textfield mdl-grid mdl-cell--${typeof t.width!=="undefined"?t.width:"12"}-col ${t.class}" id="${t.id}">`;
		if (t.icon) {
			out += `<i class="material-icons">${t.icon}</i>`;
		}
		out += `${t.text}`;
		out += `</div>`;
		return out;
	}
	createBadge(b) {
		return `<span class="mdl-badge" data-badge="${b.data}">${b.text}</span>`;
	}
	createRow(r) {
		return `<div class="mdl-grid mdl-cell--${typeof r.width!=="undefined"?r.width:"12"}-col" id="row_${r.row_id}">${this.parse(r)}</div>`;
	}
	createColumn(c) {
		return `<div class="mdl-grid mdl-cell--${typeof c.width!=="undefined"?c.width:"12"}-col" id="col_${c.col_id}">` + (c.text ? c.text : "") + this.parse(c) + "</div>";
	}
	createInput(i) {
		let out = "";
		out += `<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label ${i.expandable===true?"mdl-textfield--expandable":""}">`;
		if (i.icon) {
			out += `<i class="material-icons mdl-list__item-icon" style="position:absolute;">${i.icon}</i>`;
		}
		out += `<input class="mdl-textfield__input" style="padding-left:30px;" type="text" id="${i.id}" placeholder="${i.placeholder}" ${i.pattern!==""?"pattern=\""+(i.pattern)+"\"":""}>`;
		if (i.label) {
			out += `<label class="mdl-textfield__label" for="${i.id}">${i.label}</label>`;
		}
		if (i.expandable) {
			out += `<div class="mdl-textfield__expandable-holder"><input class="mdl-textfield__input" type="text" id="${i.id}"><label class="mdl-textfield__label" for="sample-expandable">${i.label}</label></div>`;
		}
		if (i.error) {
			out += `<span class="mdl-textfield__error">${i.error}</span>`;
		}
		out += `</div>`;
		return out;
	}
	createSlider(s) {
		return `
		<label for="${s.id}" class="mdl-slider">
			<div class="mdl-slider__label">${s.label}</div>
			<div class="mdl-chip">
				<span class="mdl-chip__text" id="label_${s.id}"></span>
			</div>
			<div>
				<span class="switchLabels">${s.min}</span>
				<input class="mdl-slider mdl-js-slider" type="${typeof s.type!=="undefined"?s.type:"range"}" id="${s.id}" min="${parseInt(s.min, 10)}" max="${parseInt(s.max, 10)}" value="${parseInt(s.value, 10)}" step="${parseInt(s.step, 10)}" data-action="${s.action}" data-label_id="label_${s.id}" data-unit="${s.unit?s.unit:"%s"}">
				<span class="sliderLabels" style="right: 20px;">${s.max}</span>
			</div>
		</label>`;
	}
	createSwitch(s) {
		let value = s.defaultState==="checked"?s.valueChecked:s.valueUnchecked;
		return `
		<label for="${s.id}" class="mdl-list__item mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-list__item-secondary-action" data-action="${s.action}" data-valuechecked="${s.valueChecked}" data-valueunchecked="${s.valueUnchecked}">
			<div class="mdl-switch__label">
				<div class="mode"></div>
				<span class="type"></span>
				<span class="value"></span>
			</div>
			<div class="mdl-grid mdl-cell--12-col">
				<span class="switchLabels" style="left: 0;position: absolute;">${s.labelUnchecked}</span>
				<input type="checkbox" id="${s.id}" class="mdl-switch__input" ${s.defaultState==="checked"?"checked":""}>
				<span class="switchLabels" style="right: 0;position: absolute;">${s.labelChecked}</span>
			</div>
		</label>`;
	}
	createSnack() {
		return `<div id="snackbar" class="mdl-js-snackbar mdl-snackbar">
			<div class="mdl-snackbar__text"></div>
			<button class="mdl-snackbar__action" type="button"></button>
		</div>`;
	}
	createDrawer(d) {
		let out = "";
		out += `<div class="mdl-layout__drawer" aria-hidden="true">
			<span class="mdl-layout-title">${d.title}</span>
			<nav class="mdl-navigation mdl-list__item">`;
			for (const link of d.links) {
				out += this.createHeaderLink(link);
			}
		out += typeof d.text!=="undefined"?this.createText(d.text):"";
		out += `<div class="mdl-menu__item">&nbsp;</div>`;
		out += "</nav></div>";
		return out;
	}
	createHeader(h) {
		let out = "";
		out += `<header class="mdl-layout__header ${typeof h.class!=="undefined"?h.class:"mdl-layout__header--waterfall"}">`;
			out += `<div class="mdl-layout__drawer-button">
						<i class="material-icons">menu</i>
					</div>`;
			out += `<div class="mdl-layout__header-row">
						<span id="title">${h.drawer.title}</span>
						<div class="mdl-layout-spacer"></div>
						<nav class="mdl-navigation">`;
			for (const link of h.links) {
				out += this.createHeaderLink(link);
			}
			out += `	</nav>`;
			out += `</div>
				</header>`;

		out += this.createDrawer(h.drawer);
		return out;
	}
	createFooter(f) {
		let out = "";
		out += `<footer class="mdl-mega-footer">
		<div class="mdl-mega-footer__middle-section">`;
		for (const section of f.sections) {
			out += `<div class="mdl-mega-footer__drop-down-section">
				<h1 class="mdl-mega-footer__heading">${section.title}</h1>
				<ul class="mdl-mega-footer__link-list">`;
					for (const link of section.links) {
						out += `<li><a href="${link.href}">${link.label}</a></li>`;
					}
			out += `</ul>
			</div>`;
		}
		out += `</div></footer>`;
		return out;
	}
	openDialog(d) {
		return `<dialog class="mdl-dialog" id="dialog_${d.id}">
			<h4 class="mdl-dialog__title">${d.title}</h4>
			<div class="mdl-dialog__content">
				<p>${d.body}</p>
			</div>
			<div class="mdl-dialog__actions">
				<button type="button" class="mdl-button close">Close</button>
			</div>
		</dialog>`;
	}
	parse(s) {
		let S = "";
		if (typeof s!=="undefined") {
			/* Cannot have multiple */
			if (s.title) {
				document.title = "%s - %s".format(typeof config.t6.ssdp.friendlyName!=="undefined"?config.t6.ssdp.friendlyName:"Unnamed", s.title);
			}
			if (s.header) {
				S += this.createHeader(s.header);
			}
			if (s.drawer) {
				S += this.createDrawer(s.drawer);
			}
			if (s.rows) {
				S += `<main class="mdl-layout__content-----">`;
				for (const row of s.rows) {
					S += this.createRow(row);
				}
				S += `</main>`;
			}
			if (s.tab_contents) {
				S += `<main class="mdl-tabs mdl-js-tabs mdl-js-ripple-effect">`;
					S += `<nav class="mdl-tabs__tab-bar">`;
					for (const tab of s.tab_contents) {
						S += this.createTabContent(tab);
					}
					S += `</nav>`;
				for (const panel of s.tab_contents) {
					S += this.createPanelContent(panel);
				}
				S += `</main>`;
			}
			if (s.columns) {
				for (const column of s.columns) {
					S += this.createColumn(column);
				}
			}
			if (s.cards) {
				for (const card of s.cards) {
					S += this.createCard(card);
				}
			}
			if (s.inputs) {
				for (const input of s.inputs) {
					S += this.createInput(input);
				}
			}
			if (s.lists) {
				S += `<ul class="mdl-list">`;
				for (const list in s.lists) {
					S += this.createList(s.lists[list]);
				}
				S += `</ul>`;
			}
			if (s.footer) {
				S += this.createFooter(s.footer);
			}

			/* Can have multiple */
			if (s.buttons) {
				for (const button of s.buttons) {
					S += this.createButton(button);
				}
			}
			if (s.images) {
				for (const image of s.images) {
					S += this.createImage(image);
				}
			}
			if (s.texts) {
				for (const text of s.texts) {
					S += this.createText(text);
				}
			}
			if (s.badges) {
				for (const badge of s.badges) {
					S += this.createBadge(badge);
				}
			}
			if (s.sliders) {
				for (const slider of s.sliders) {
					S += this.createSlider(slider);
				}
			}
			if (s.switches) {
				for (const switche of s.switches) {
					S += this.createSwitch(switche);
				}
			}
			if (s.sections) {
				for (const section of s.sections) {
					S += this.createSection(section);
				}
			}

			/* Singletons */
			if (s.button) {
				S += this.createButton(s.button);
			}
			if (s.image) {
				S += this.createImage(s.image);
			}
			if (s.text) {
				S += this.createText(s.text);
			}
			if (s.badge) {
				S += this.createBadge(s.badge);
			}
			if (s.slider) {
				S += this.createSlider(s.slider);
			}
			if (s.input) {
				S += this.createInput(s.input);
			}
			if (s.switche) {
				S += this.createSwitch(s.switche);
			}
		}
		return S;
	}
	showSnackbar(snack) {
		document.querySelector("#snackbar div.mdl-snackbar__text").innerText = snack.message;
		document.querySelector("#snackbar button.mdl-snackbar__action").innerText = snack.actionText;
		document.querySelector("#snackbar button.mdl-snackbar__action").removeAttribute("aria-hidden");
		document.querySelector("#snackbar").classList.add("mdl-snackbar--active");
		(document.querySelector("#snackbar button.mdl-snackbar__action")).addEventListener("click", function(evt) {
			document.querySelector("#snackbar").classList.remove("mdl-snackbar--active");
			evt.preventDefault();
		}, {passive: false});
	}
	showSensorValue(id, value) {
		document.querySelector("#"+id).innerHTML = `<span class="mdl-chip"><span class="mdl-chip__text">${value}</span></span>`;
	}
}

let ml = new MaterialLightParser();
let req = new XMLHttpRequest();
req.onreadystatechange = function() {
	if (this.readyState === 4 && (this.status === 200 || this.status === 201 || this.status === 412)) {
		let json = JSON.parse(req.responseText);
		if(json.status === "NOK" || json.status === "nok" || json.status === "OK" || json.status === "ok" || json.status === "UNDERSTOOD") {
			if(json.value) {
				document.querySelector("#sensorValue").classList.add("is-not-visible");
				document.querySelector("#sensorValue").classList.remove("is-visible");
				ml.showSensorValue("sensorValue", json.sensorValue); // TODO: hardcoded
				document.querySelector("#sensorValue").classList.remove("is-not-visible");
				document.querySelector("#sensorValue").classList.add("is-visible");
			} else {
				var snack = {
					message: json.snack,
					timeout: 2000,
					actionHandler: function(event) { document.querySelector("#snackbar").classList.remove("mdl-snackbar--active"); },
					actionText: "Dismiss"
				};
				ml.showSnackbar(snack);
			}
		}
	}
};
req.onerror = function(url) {
	console.error("Error fetching " + url);
};
String.prototype.format = function() {
	return [...arguments].reduce((p,c) => p.replace(/%s/,c), this);
};

let uuid = function() {
	var uuid = "", i, random;
	for (i = 0; i < 32; i++) {
		random = Math.random() * 16 | 0;
		if (i == 8 || i == 12 || i == 16 || i == 20) {
			uuid += "-";
		}
		uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
	}
	return uuid;
};

let actionate = () => {
	if(typeof componentHandler!=="undefined") {
		componentHandler.upgradeDom();
	}
	document.getElementById("app").MaterialLayout.init();
	document.getElementById("title").innerText = "%s (%s)".format(document.querySelector("#title").innerText, typeof config.t6.ssdp.friendlyName!=="undefined"?config.t6.ssdp.friendlyName:"Unnamed");
	document.getElementById("config.wifi.ssid").value = config.wifi.ssid;
	document.getElementById("config.wifi.password").value = config.wifi.password;
	document.getElementById("config.t6.t6Object_id").value = config.t6.t6Object_id;
	document.getElementById("config.t6.t6ObjectSecretKey").value = config.t6.t6ObjectSecretKey;
	document.getElementById("config.t6.scheme").value = config.t6.scheme;
	document.getElementById("config.t6.host").value = config.t6.host;
	document.getElementById("config.t6.port").value = config.t6.port;
	document.getElementById("config.t6.http.localPort").value = config.t6.http.localPort;
	document.getElementById("config.t6.ssdp.localPort").value = config.t6.ssdp.localPort;
	document.getElementById("config.t6.ssdp.advertiseInterval").value = config.t6.ssdp.advertiseInterval;
	document.getElementById("config.t6.ssdp.presentationURL").value = config.t6.ssdp.presentationURL;
	document.getElementById("config.t6.ssdp.friendlyName").value = config.t6.ssdp.friendlyName;
	document.getElementById("config.t6.ssdp.modelName").value = config.t6.ssdp.modelName;
	document.getElementById("config.t6.ssdp.modelNumber").value = config.t6.ssdp.modelNumber;
	document.getElementById("config.t6.ssdp.deviceType").value = config.t6.ssdp.deviceType;
	document.getElementById("config.t6.ssdp.modelURL").value = config.t6.ssdp.modelURL;
	document.getElementById("config.t6.ssdp.manufacturer").value = config.t6.ssdp.manufacturer;
	document.getElementById("config.t6.ssdp.manufacturerURL").value = config.t6.ssdp.manufacturerURL;
	document.getElementById("config.t6.websockets.host").value = config.t6.websockets.host;
	document.getElementById("config.t6.websockets.port").value = config.t6.websockets.port;
	document.getElementById("config.t6.websockets.path").value = config.t6.websockets.path;
	document.getElementById("config.t6.websockets.t6wsKey").value = config.t6.websockets.t6wsKey;
	document.getElementById("config.t6.websockets.t6wsSecret").value = config.t6.websockets.t6wsSecret;
	document.getElementById("config.t6.websockets.messageInterval").value = config.t6.websockets.messageInterval;
	document.getElementById("config.t6.websockets.messageIntervalOnceClaimed").value = config.t6.websockets.messageIntervalOnceClaimed;
	document.getElementById("config.t6.websockets.reconnectInterval").value = config.t6.websockets.reconnectInterval;
	document.getElementById("config.t6.websockets.timeoutInterval").value = config.t6.websockets.timeoutInterval;
	document.getElementById("config.t6.websockets.disconnectAfterFailure").value = config.t6.websockets.disconnectAfterFailure;
	if(config.t6.servicesStatus.http === true) {
		document.getElementById("config.t6.servicesStatus.http").parentElement.parentElement.MaterialSwitch.on();
	} else {
		document.getElementById("config.t6.servicesStatus.http").parentElement.parentElement.MaterialSwitch.off();
	}
	if(config.t6.servicesStatus.audio === true) {
		document.getElementById("config.t6.servicesStatus.audio").parentElement.parentElement.MaterialSwitch.on();
	} else {
		document.getElementById("config.t6.servicesStatus.audio").parentElement.parentElement.MaterialSwitch.off();
	}
	if(config.t6.servicesStatus.mdns === true) {
		document.getElementById("config.t6.servicesStatus.mdns").parentElement.parentElement.MaterialSwitch.on();
	} else {
		document.getElementById("config.t6.servicesStatus.mdns").parentElement.parentElement.MaterialSwitch.off();
	}
	if(config.t6.servicesStatus.sockets === true) {
		document.getElementById("config.t6.servicesStatus.sockets").parentElement.parentElement.MaterialSwitch.on();
	} else {
		document.getElementById("config.t6.servicesStatus.sockets").parentElement.parentElement.MaterialSwitch.off();
	}
	if(config.t6.servicesStatus.ssdp === true) {
		document.getElementById("config.t6.servicesStatus.ssdp").parentElement.parentElement.MaterialSwitch.on();
	} else {
		document.getElementById("config.t6.servicesStatus.ssdp").parentElement.parentElement.MaterialSwitch.off();
	}
	let buttons = document.querySelectorAll("button");
	for (var i in buttons) {
		if ( (buttons[i]).childElementCount > -1 ) {
			(buttons[i]).addEventListener("click", function(evt) {
					let action = evt.currentTarget.dataset.action;
					let clicked_elt = document.getElementById(evt.currentTarget.dataset.trigger);
					if (clicked_elt) {
						let value = typeof clicked_elt.parentElement.MaterialTextfield!=="undefined"?clicked_elt.parentElement.MaterialTextfield.input_.value:clicked_elt.textContent;
						// Must be an input with a non empty value ... OR not an input so value could be empty
						let condition = ((typeof clicked_elt.parentElement.MaterialTextfield!=="undefined" && value!=="") || (typeof clicked_elt.parentElement.MaterialTextfield=="undefined"));
						if (typeof action !=="undefined" && condition ) {
							let trigger = evt.currentTarget.dataset.trigger;
							let options = {
								method: typeof evt.currentTarget.dataset.method!=="undefined"?evt.currentTarget.dataset.method:"POST",
							};
							if(action === "/config") {
								switch(trigger) {
									case "config.wifi" :
										options.body = JSON.stringify({wifi: {ssid: document.getElementById("config.wifi.ssid").value, password: document.getElementById("config.wifi.password").value}});
										break;
									case "config.t6" :
										options.body = JSON.stringify({t6: {t6Object_id: document.getElementById("config.t6.t6Object_id").value, t6ObjectSecretKey: document.getElementById("config.t6.t6ObjectSecretKey").value, scheme: document.getElementById("config.t6.scheme").value, host: document.getElementById("config.t6.host").value, port: document.getElementById("config.t6.port").value}});
										break;
									case "config.t6.http" :
										options.body = JSON.stringify({"t6": {"http": {"localPort": document.getElementById("config.t6.http.localPort").value }, "servicesStatus": { "http": document.getElementById("config.t6.servicesStatus.http").parentElement.parentElement.querySelector(".mdl-switch__input").checked } }});
										break;
									case "config.t6.audio" :
										options.body = JSON.stringify({ "t6": { "servicesStatus": { "audio": document.getElementById("config.t6.servicesStatus.audio").parentElement.parentElement.querySelector(".mdl-switch__input").checked } } });
										break;
									case "config.t6.mdns" :
										options.body = JSON.stringify({ "t6": { "mdns": { "localPort": 80 }, "servicesStatus": { "mdns": document.getElementById("config.t6.servicesStatus.mdns").parentElement.parentElement.querySelector(".mdl-switch__input").checked } } });
										break;
									case "config.t6.ssdp" :
										options.body = JSON.stringify({ "t6": { "ssdp": { "localPort": document.getElementById("config.t6.ssdp.localPort").value, "advertiseInterval": document.getElementById("config.t6.ssdp.advertiseInterval").value, "presentationURL": document.getElementById("config.t6.ssdp.presentationURL").value, "friendlyName": document.getElementById("config.t6.ssdp.friendlyName").value, "modelName": document.getElementById("config.t6.ssdp.modelName").value, "modelNumber": document.getElementById("config.t6.ssdp.modelNumber").value, "deviceType": document.getElementById("config.t6.ssdp.deviceType").value, "modelURL": document.getElementById("config.t6.ssdp.modelURL").value, "manufacturer": document.getElementById("config.t6.ssdp.manufacturer").value, "manufacturerURL": document.getElementById("config.t6.ssdp.manufacturerURL").value }, "servicesStatus": { "ssdp": document.getElementById("config.t6.servicesStatus.ssdp").parentElement.parentElement.querySelector(".mdl-switch__input").checked } } });
										break;
									case "config.t6.websockets" :
										options.body = JSON.stringify({ "t6": { "websockets": { "host": document.getElementById("config.t6.websockets.host").value, "port": document.getElementById("config.t6.websockets.port").value, "path": document.getElementById("config.t6.websockets.path").value, "t6wsKey": document.getElementById("config.t6.websockets.t6wsKey").value, "t6wsSecret": document.getElementById("config.t6.websockets.t6wsKey").value, "expiration": 1234, "messageInterval": document.getElementById("config.t6.websockets.messageInterval").value, "messageIntervalOnceClaimed": document.getElementById("config.t6.websockets.messageIntervalOnceClaimed").value, "reconnectInterval": document.getElementById("config.t6.websockets.reconnectInterval").value, "timeoutInterval": document.getElementById("config.t6.websockets.timeoutInterval").value, "disconnectAfterFailure": document.getElementById("config.t6.websockets.disconnectAfterFailure").value }, "servicesStatus": { "sockets": true } } });
										break;
									default :
										options.body = JSON.stringify({});
										break;
								}
							}
							if(action !== "") {
								fetch(action.format(value), options)
								.then((response) => {
									if(action === "/description.xml") {
										let dialog_id = uuid();
										let xml = response.text().then(function(xml) {
											window.document.body.insertAdjacentHTML("afterbegin", ml.openDialog({id: dialog_id, title: "SSDP Description", body: xml}));
											let dialog = document.getElementById("dialog_"+dialog_id);
											if (!dialog.showModal) {
												dialogPolyfill.registerDialog(dialog);
											}
											dialog.showModal();
											dialog.querySelector("button:not([disabled]).close").addEventListener("click", function() { dialog.close();dialog.remove(); });
										});
									} else {
										response.json().then(function(json) {
											if(json.status === "OK" || json.status === "UNDERSTOOD") {
												if(typeof json.value !== "undefined") {
													document.querySelector("#"+trigger).classList.add("is-not-visible");
													document.querySelector("#"+trigger).classList.remove("is-visible");
													ml.showSensorValue(trigger, json.value);
													document.querySelector("#"+trigger).classList.remove("is-not-visible");
													document.querySelector("#"+trigger).classList.add("is-visible");
												}
												if(typeof json.snack !== "undefined") {
													let snack = {
														message: json.snack,
														timeout: 2000,
														actionHandler: function(event) { document.querySelector("#snackbar").classList.remove("mdl-snackbar--active"); },
														actionText: "Dismiss"
													};
													ml.showSnackbar(snack);
												}
												if(typeof json.pins!=="undefined" && json.pins.length>-1) {
													(json.pins).map(function(pin) {
														if(pin[Object.keys(pin)].value === "1") {
															document.getElementById(Object.keys(pin)).parentElement.MaterialSwitch.on();
														} else if(pin[Object.keys(pin)].value === "0" && document.getElementById(Object.keys(pin))) {
															document.getElementById(Object.keys(pin)).parentElement.MaterialSwitch.off();
														}
														document.getElementById(Object.keys(pin)).parentElement.querySelector(".mdl-switch__label .mode").textContent = pin[Object.keys(pin)].mode;
														document.getElementById(Object.keys(pin)).parentElement.querySelector(".mdl-switch__label .type").textContent = pin[Object.keys(pin)].type;
														document.getElementById(Object.keys(pin)).parentElement.querySelector(".mdl-switch__label .value").textContent = pin[Object.keys(pin)].value;
													});
												}
											}
										});
									}
								});
							}
							evt.preventDefault();
						}
					}
			}, {passive: false});
		}
	}
	let switches = document.querySelectorAll("label.mdl-switch");
	for (var i in switches) {
		if ( (switches[i]).childElementCount > -1 ) {
			(switches[i]).addEventListener("change", function(evt) {
				let value = evt.currentTarget.classList.contains("is-checked")===true?evt.currentTarget.dataset.valuechecked:evt.currentTarget.dataset.valueunchecked;
				let action = evt.currentTarget.dataset.action;
				if(action !== "") {
					req.open(typeof evt.currentTarget.dataset.method!=="undefined"?evt.currentTarget.dataset.method:"GET", action.format(value), true);
					req.send();
				}
				evt.preventDefault();
			}, {passive: false});
		}
	}
	let sliders = document.querySelectorAll("input.mdl-slider");
	for (var i in sliders) {
		if ( (sliders[i]).childElementCount > -1 ) {
			(sliders[i]).addEventListener("input", function(evt) {
				let label_id = evt.currentTarget.dataset.label_id;
				let unit = typeof evt.currentTarget.dataset.unit!=="undefined"?evt.currentTarget.dataset.unit:"%";
				let value = evt.currentTarget.MaterialSlider.element_.value;
				document.getElementById(label_id).textContent = unit.format(value);
			}, {passive: false});
			(sliders[i]).addEventListener("change", function(evt) {
				let action = evt.currentTarget.dataset.action;
				let value = evt.currentTarget.MaterialSlider.element_.value;
				req.open(typeof evt.currentTarget.dataset.method!=="undefined"?evt.currentTarget.dataset.method:"GET", action.format(value), true);
				req.send();
				evt.preventDefault();
			}, {passive: false});
		}
	}
};
let materializeLight = (inputJson) => {
	return ml.parse(inputJson) + ml.createSnack();
};
const loadScript = (FILE_URL, async=true, type="text/javascript") => {
	return new Promise((resolve, reject) => {
		try {
			const scriptEle = document.createElement("script");
			scriptEle.type = type;
			scriptEle.async = async;
			scriptEle.src =FILE_URL;
			scriptEle.addEventListener("load", (ev) => {
				resolve({ status: true, ev: ev });
			});
			scriptEle.addEventListener("error", (ev) => {
				reject({
					status: false,
					message: `Failed to load the script ＄{FILE_URL}`
				});
			});
			document.body.appendChild(scriptEle);
		} catch (error) {
			reject(error);
		}
	});
};

document.onreadystatechange = function () {
	fetch("./config.json", {mode: "no-cors"})
	.then((res) => res.json().catch(error => { console.log("Fetch Error:", error); }))
	.then((cfg) => {
		config = cfg;
		if(typeof config!=="undefined") {
			console.log("Config loaded successfully (1)");
			document.getElementById("app").innerHTML = materializeLight(ui);
			actionate();
		}
	})
	.catch(error => {
		console.log("Config loaded error:", error);
	});
	
	fetch("./getValues?pin=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39", {mode: "no-cors"})
	.then((res) => res.json())
	.then((values) => {
		if(typeof values.pins!=="undefined" && values.pins.length>-1) {
			(values.pins).map(function(pin, index) {
				if(document.getElementById(Object.keys(pin)) && document.getElementById(Object.keys(pin)).parentElement && document.getElementById(Object.keys(pin)).parentElement.parentElement.MaterialSwitch) {
					if(pin[Object.keys(pin)].value === "1") {
						document.getElementById(Object.keys(pin)).parentElement.parentElement.MaterialSwitch.on();
					} else if(pin[Object.keys(pin)].value === "0" && document.getElementById(Object.keys(pin))) {
						document.getElementById(Object.keys(pin)).parentElement.parentElement.MaterialSwitch.off();
					}
				}
				if(typeof document.getElementById(Object.keys(pin))!=="undefined" && document.getElementById(Object.keys(pin)) && document.getElementById(Object.keys(pin)).parentElement.parentElement) {
					document.getElementById(Object.keys(pin)).parentElement.parentElement.querySelector(".mdl-switch__label .mode").textContent = typeof pin[Object.keys(pin)].mode?pin[Object.keys(pin)].mode:"";
					document.getElementById(Object.keys(pin)).parentElement.parentElement.querySelector(".mdl-switch__label .type").textContent = typeof pin[Object.keys(pin)].type?pin[Object.keys(pin)].type:"";
					document.getElementById(Object.keys(pin)).parentElement.parentElement.querySelector(".mdl-switch__label .value").textContent = typeof pin[Object.keys(pin)].value?pin[Object.keys(pin)].value:"";
				}
			});
		}
	})
	.catch(error => {
		console.log("Error", error);
	});
}

let registerServiceWorker = function() {
	return navigator.serviceWorker.register("/sw.js", { scope: "/" })
	.then(function(registration) {
		if ( localStorage.getItem("settings.debug") === "true" ) {
			console.log("[ServiceWorker] Registered with scope:", registration.scope);
		}
		if ( (typeof firebase !== "object" || typeof firebase === "undefined") && typeof firebase.apps !== "object" && typeof firebase.apps.length !== "number" ) {
			firebase.initializeApp(firebaseConfig);
		}
		firebase.messaging().useServiceWorker(registration);
		console.log("[pushSubscription]", firebase.messaging().getToken());

		firebase.analytics();
		return registration;
	})
	.catch(function(err) {
		console.log("[ServiceWorker] error occured..."+ err);
	});
};
let urlBase64ToUint8Array = function(base64String) {
	const padding = "=".repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding)  .replace(/\-/g, "+") .replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (var i=0; i<rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
	return outputArray;
};
let subscribeUserToPush = function() {
	return registerServiceWorker()
	.then(function(registration) {
		const subscribeOptions = {
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
		};
		if ( registration ) {
			return registration.pushManager.subscribe(subscribeOptions);
		} else {
			return false;
		}
	})
	.then(function(pushSubscription) {
		var j = JSON.parse(JSON.stringify(pushSubscription));
		if ( j && j.keys ) {
			localStorage.setItem("settings.pushSubscription.endpoint", j.endpoint);
			localStorage.setItem("settings.pushSubscription.keys.p256dh", j.keys.p256dh);
			localStorage.setItem("settings.pushSubscription.keys.auth", j.keys.auth);
		}
		console.log("[pushSubscription]", j);
		return pushSubscription;
	})
	.catch(function (error) {
		console.log("[pushSubscription]", "subscribeUserToPush"+error);
	});
};
let askPermission = function() {
	return new Promise(function(resolve, reject) {
		const permissionResult = Notification.requestPermission(function(result) {
			resolve(result);
		});
		if (permissionResult) {
			permissionResult.then(resolve, reject);
		}
	})
	.then(function(permissionResult) {
		if (permissionResult !== "granted") {
			throw new Error("We weren't granted permission.");
		}
	});
};

if (location.protocol === "https:") {
	askPermission();
	subscribeUserToPush();
}
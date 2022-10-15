"use strict";

let applicationServerKey = "BHnrqPBEjHfdNIeFK5wdj0y7i5eGM2LlPn62zxmvN8LsBTFEQk1Gt2zrKknJQX91a8RR87w8KGP_1gDSy8x6U7s";

class MaterialLightParser {
	createButton(b) {
		return `<button class="mdl-button mdl-js-button mdl-js-ripple-effect" value="${b.value}" data-action="${b.action}" data-trigger="${b.trigger}">${b.label}</button>`;
	}
	createImage(i) {
		return `<img src="${i.src}" alt="${i.alt}" />`;
	}
	createCard(c) {
		let out = `
		<div class="mdl-grid mdl-cell--${c.width}-col">
			<div class="mdl-card mdl-shadow--2dp">
				<div class="mdl-card__title">
					<h3 class="mdl-card__title-text">${c.title}</h3>
				</div>`;
		if(c.body) {
			out += `<div class="mdl-list__item--three-line small-padding mdl-card--expand">
						<span class="mdl-list__item-sub-title">${this.parse(c.body)}</span>
					</div>`;
		} 
		out += typeof c.actions!=="undefined"?`<div class="mdl-card__actions mdl-card--border">${this.parse(c.actions)}</div>`:"";
		out += "</div></div>";
		return out;
	}
	createList(i, l) {
		let out = i===0?`<ul class="mdl-list">${this.parse(l)}`:"";
		out += `<li class="mdl-list__item mdl-cell--${l.width}-col"><span class="mdl-list__item-primary-content">`;
		if (l.icon) {
			out += `<i class="material-icons mdl-list__item-icon">${l.icon}</i>`;
		}
		if (typeof (l.item)==="object") {
			out += this.parse(l.item);
			out += "</span></li>";
		} else {
			out += l.item;
			out += "</span></li>";
		}
		out += i===0?"</ul>":"";
		return out;
	}
	createText(t) {
		return `<div class="mdl-textfield mdl-js-textfield mdl-grid mdl-cell--${t.width}-col ${t.class}" id="${t.id}">${t.text}</div>`;
	}
	createBadge(b) {
		return `<span class="mdl-badge" data-badge="${b.data}">${b.text}</span>`;
	}
	createRow(r) {
		return `<div class="mdl-grid mdl-cell--${r.width}-col" id="row_${r.row_id}">
		${this.parse(r)}
		</div>`;
	}
	createColumn(c) {
		return `<div class="mdl-grid mdl-cell--${c.width}-col" id="col_${c.col_id}">` + (c.text ? c.text : "") + this.parse(c) + "</div>";
	}
	createSlider(s) {
		return `
		<label for="${s.id}" class="mdl-slider">
			<div class="mdl-slider__label">${s.label}</div>
			<span class="switchLabels">${s.min}</span>
			<input class="mdl-slider mdl-js-slider" type="range" id="${s.id}" min="${parseInt(s.min, 10)}" max="${parseInt(s.max, 10)}" value="${parseInt(s.value, 10)}" step="${parseInt(s.step, 10)}" data-action="${s.action}">
			<span class="sliderLabels" style="right: 20px;">${s.max}</span>
		</label>`;
	}
	createSwitch(s) {
		let value = s.defaultState==="checked"?s.valueChecked:s.valueUnchecked;
		return `
		<label for="${s.id}" class="mdl-switch mdl-js-switch mdl-js-ripple-effect" data-action="${s.action}" data-valuechecked="${s.valueChecked}" data-valueunchecked="${s.valueUnchecked}">
			<div class="mdl-switch__label">
				${s.label}
				<span class="mode"></span>
				<span class="type"></span>
				<span class="value"></span>
			</div>
			<span class="switchLabels">${s.labelUnchecked}</span>
			<input type="checkbox" id="${s.id}" class="mdl-switch__input" ${s.defaultState==="checked"?"checked":""}>
			<span class="switchLabels" style="right: 0;position: absolute;">${s.labelChecked}</span>
		</label>`;
	}
	createSnack() {
		return `<div id="snackbar" class="mdl-js-snackbar mdl-snackbar">
			<div class="mdl-snackbar__text"></div>
			<button class="mdl-snackbar__action" type="button"></button>
		</div>`;
	}
	parse(s) {
		let S = "";
		if (typeof s!=="undefined") {

			/* Cannot have multiple */
			if (s.title) {
				document.title = s.title;
			}
			if (s.rows) {
				for (const row of s.rows) {
					S += this.createRow(row);
				}
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
			if (s.lists) {
				for (let i in s.lists) {
					S += this.createList(i, s.lists[i]);
				}
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
			if (s.switche) {
				S += this.createSwitch(s.switche);
			}
		}
		return S;
	}
	showSnackbar(snack) {
		document.querySelector("#snackbar div.mdl-snackbar__text").innerText = snack.message;
		document.querySelector("#snackbar button.mdl-snackbar__action").innerText = snack.actionText;
		document.querySelector("#snackbar").classList.add("mdl-snackbar--active");
		(document.querySelector("#snackbar button.mdl-snackbar__action")).addEventListener("click", function(evt) {
				document.querySelector("#snackbar").classList.remove("mdl-snackbar--active");
				evt.preventDefault();
		}, {passive: false});
	}
	showSensorValue(id, value) {
		document.querySelector("#"+id).textContent = value;
	}
}
let ml = new MaterialLightParser();
let req = new XMLHttpRequest();

req.onreadystatechange = function() {
	if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
		let json = JSON.parse(req.responseText);
		if(json.status === "ok" || json.status === "UNDERSTOOD") {
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
String.prototype.format = function() {
	return [...arguments].reduce((p,c) => p.replace(/%s/,c), this);
};
let actionate = () => {
	let buttons = document.querySelectorAll("button");
	for (var i in buttons) {
		if ( (buttons[i]).childElementCount > -1 ) {
			(buttons[i]).addEventListener("click", function(evt) {
					let action = evt.currentTarget.dataset.action;
					if (typeof action !=="undefined" ) {
						let trigger = evt.currentTarget.dataset.trigger;
						fetch(action.format())
						.then((response) => {
							response.json().then(function(json) {
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
								if(json.status === "OK" || json.status === "UNDERSTOOD") {
									if(json.value) {
										document.querySelector("#"+trigger).classList.add("is-not-visible");
										document.querySelector("#"+trigger).classList.remove("is-visible");
										ml.showSensorValue(trigger, json.value);
										document.querySelector("#"+trigger).classList.remove("is-not-visible");
										document.querySelector("#"+trigger).classList.add("is-visible");
									} else {
										let snack = {
											message: json.snack,
											timeout: 2000,
											actionHandler: function(event) { document.querySelector("#snackbar").classList.remove("mdl-snackbar--active"); },
											actionText: "Dismiss"
										};
										ml.showSnackbar(snack);
									}
								}
							});
						});
						evt.preventDefault();
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
				req.open("GET", action.format(value), true);
				req.send();
				evt.preventDefault();
			}, {passive: false});
		}
	}
	let sliders = document.querySelectorAll("input.mdl-slider");
	for (var i in sliders) {
		if ( (sliders[i]).childElementCount > -1 ) {
			(sliders[i]).addEventListener("change", function(evt) {
				let action = evt.currentTarget.dataset.action;
				let value = evt.currentTarget.MaterialSlider.element_.value;
				req.open("GET", action.format(value), true);
				req.send();
				evt.preventDefault();
			}, {passive: false});
		}
	}
};
let materializeLight = (inputJson) => {
	return ml.parse(inputJson) + ml.createSnack();
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

//askPermission();
//subscribeUserToPush();

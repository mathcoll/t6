'use strict';

class MaterialLightParser {
	createButton(b) {
		return `<button class="mdl-button mdl-js-button mdl-js-ripple-effect" value="${b.value}" data-action="${b.action}">${b.label}</button>`;
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
		return `<div class="mdl-textfield mdl-js-textfield">${t.body}</div>`;
	}
	createBadge(b) {
		return `<span class="mdl-badge" data-badge="${b.data}">${b.body}</span>`;
	}
	createRow(r) {
		return `<div class="mdl-grid mdl-cell--12-col">${this.parse(r)}</div>`;
	}
	createColumn(c) {
		return `<div class="mdl-cell--${c.width}-col">` + (c.text ? c.text : "") + this.parse(c) + "</div>";
	}
	createSlider(s) {
		return `
		<p style="width:100%">
			<input class="mdl-slider mdl-js-slider" type="${s.type}" id="${s.id}" min="${parseInt(s.min, 10)}" max="${parseInt(s.max, 10)}" value="${parseInt(s.value, 10)}" step="${parseInt(s.step, 10)}">
		</p>`;
	}
	createSwitch(s) {
		return `
		<label for="${s.id}" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
			<input type="checkbox" id="${s.id}" class="mdl-switch__input" ${s.checked===true?"checked":""}>
			<span class="mdl-switch__label">${s.label}</span>
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
		if (s.rows) {
			for (let i in s.rows) {
				S += this.createRow(s.rows[i]);
			}
		}
		if (s.columns) {
			for (let i in s.columns) {
				S += this.createColumn(s.columns[i]);
			}
		}
		if (s.buttons) {
			for (let i in s.buttons) {
				S += this.createButton(s.buttons[i]);
			}
		}
		if (s.images) {
			for (let i in s.images) {
				S += this.createImage(s.images[i]);
			}
		}
		if (s.texts) {
			for (let i in s.texts) {
				S += this.createText(s.texts[i]);
			}
		}
		if (s.cards) {
			for (let i in s.cards) {
				S += this.createCard(s.cards[i]);
			}
		}
		if (s.badges) {
			for (let i in s.badges) {
				S += this.createBadge(s.badges[i]);
			}
		}
		if (s.slider) {
			S += this.createSlider(s.slider);
		}
		if (s.switch) {
			S += this.createSwitch(s.switch);
		}
		if (s.lists) {
			for (let i in s.lists) {
				S += this.createList(i, s.lists[i]);
			}
		}
		return S;
	}
	showSnackbar(snack) {
		document.querySelector("#snackbar").MaterialSnackbar.showSnackbar(snack);
	}
}
let ml = new MaterialLightParser();
let req = new XMLHttpRequest();

req.onreadystatechange = function() {
	if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
		let json = JSON.parse(req.responseText);
		if(json.status === "ok" || json.status === "UNDERSTOOD") {
			var snack = {
				message: json.snack,
				timeout: 2000,
				actionHandler: function(event) { document.querySelector("#snackbar").classList.remove("mdl-snackbar--active"); },
				actionText: "Dismiss"
			}
			ml.showSnackbar(snack);
		}
	}
};
let actionate = () => {
	let buttons = document.querySelectorAll("button");
	for (var i in buttons) {
		if ( (buttons[i]).childElementCount > -1 ) {
			(buttons[i]).addEventListener("click", function(evt) {
				let value = evt.currentTarget.dataset.action;
				req.open("GET", "/"+value, true);
				req.send();
				evt.preventDefault();
			}, {passive: false});
		}
	}
	let switches = document.querySelectorAll("label.mdl-switch");
	for (var i in switches) {
		if ( (switches[i]).childElementCount > -1 ) {
			(switches[i]).addEventListener("change", function(evt) {
				let value = evt.currentTarget.classList.contains("is-checked")===true?"true":"false";
				req.open("GET", "/"+value, true);
				req.send();
				evt.preventDefault();
			}, {passive: false});
		}
	}
	let sliders = document.querySelectorAll("input.mdl-slider");
	for (var i in sliders) {
		if ( (sliders[i]).childElementCount > -1 ) {
			(sliders[i]).addEventListener("change", function(evt) {
				let snack = {
					message: "Value: "+evt.currentTarget.getAttribute("value"),
					timeout: 1000,
					actionHandler: function(event) { document.querySelector("#snackbar").classList.remove("mdl-snackbar--active"); },
					actionText: "Dismiss"
				}
				ml.showSnackbar(snack);
				//req.open("GET", "/"+(evt.currentTarget.dataset.action), true);
				//req.send();
				evt.preventDefault();
			}, {passive: false});
		}
	}
};
let materializeLight = (inputJson) => {
	return ml.parse(inputJson) + ml.createSnack();
};
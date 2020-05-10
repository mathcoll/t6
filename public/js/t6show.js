class MaterialLightParser {
	createButton(b) {
		return '<button class="mdl-button mdl-js-button mdl-js-ripple-effect" value="'+ b.value + '">' + b.label + '</button>';
	}
	createImage(i) {
		return '<img src="'+ i.src + '" alt="'+ i.alt + '" />';
	}
	createCard(c) {
		let out = '';
		out += '<div class="mdl-grid mdl-cell--' + c.width + '-col"><div class="mdl-card mdl-shadow--2dp"><div class="mdl-card__title"><h3 class="mdl-card__title-text">' + c.title + '</h3></div><div class="mdl-list__item--three-line small-padding	mdl-card--expand"><span class="mdl-list__item-sub-title">' + this.parse(c.body) + '</span></div>';
		out += typeof c.actions!=="undefined"?'<div class="mdl-card__actions mdl-card--border">' + this.parse(c.actions) + '</div>':'';
		out += '</div></div>';
		return out;
	}
	createList(i, l) {
		let out = i===0?'<ul class="mdl-list">' + this.parse(l):'';
		out += '<li class="mdl-list__item mdl-cell--' + l.width + '-col"><span class="mdl-list__item-primary-content">';
		if (l.icon) {
			out += '<i class="material-icons mdl-list__item-icon">'+ l.icon +'</i>';
		}
		out += l.item+'</span></li>';
		out += i===0?'</ul>':'';
		return out;
	}
	createText(t) {
		return '<div class="mdl-textfield mdl-js-textfield">' + t.body + '</div>';
	}
	createBadge(b) {
		return '<span class="mdl-badge" data-badge="' + b.data + '">' + b.body + '</span>';
	}
	createRow(r) {
		return '<div class="mdl-grid mdl-cell--12-col">' + this.parse(r) + '</div>';
	}
	createColumn(c) {
		return '<div class="mdl-cell--' + c.width + '-col">' + (c.text ? c.text : '') + this.parse(c) + '</div>';
	}
	createSlider(s) {
		let out = '';
		out += '<p style="width:100%">';
		out += '<input class="mdl-slider mdl-js-slider" type="'+s.type+'" id="'+s.id+'" min="'+parseInt(s.min, 10)+'" max="'+parseInt(s.max, 10)+'" value="'+parseInt(s.value, 10)+'" step="'+parseInt(s.step, 10)+'">';
		out += '</p>';
		return out;
	}
	createSwitch(s) {
		let out = '';
		out += '<label for="'+s.id+'" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">';
		out += '<input type="checkbox" id="'+s.id+'" class="mdl-switch__input" '+(s.checked===true?'checked':'')+'>';
		out += '<span class="mdl-switch__label">'+s.label+'</span>';
		out += '</label>';
		return out;
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
}
let materializeLight = (inputJson) => {
	return new MaterialLightParser().parse(inputJson);
}
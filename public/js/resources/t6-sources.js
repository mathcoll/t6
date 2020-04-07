"use strict";
app.resources.sources = {
	onEdit: function(evt) {
	},
	onAdd: function(evt) {
	},
	onDelete: function(id) {
	},
	display: function(id, isAdd, isEdit, isPublic) {
	},
	displayPublic: function(id, isAdd, isEdit, isPublic) {
	},
	displayAdd: function(source, isAdd, isEdit, isPublic) {
	},
	displayItem: function(source) {
		var type = "sources";
		var name = source.attributes.name!==undefined?source.attributes.name:"";
		var description = source.attributes.description!==undefined?source.attributes.description.substring(0, app.cardMaxChars):"";
		var attributeType = source.attributes.type!==undefined?source.attributes.type:"";
		
		var element = "";
		element += "<div class=\"mdl-grid mdl-cell\" data-action=\"view\" data-type=\""+type+"\" data-id=\""+source.id+"\">";
		element += "	<div class=\"mdl-card mdl-shadow--2dp\">";
		element += "		<div class=\"mdl-card__title\">";
		element += "			<i class=\"material-icons\">"+app.icons.objects+"</i>";
		element += "			<h3 class=\"mdl-card__title-text\">"+name+"</h3>";
		element += "		</div>";
		element += app.getField(null, null, description, {type: "textarea", isEdit: false});
		element += "		<div class=\"mdl-card__actions mdl-card--border\">";
		element += "			<span class=\"pull-left mdl-card__date\">";
		element += "				<button data-id=\""+source.id+"\" class=\"swapDate mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">update</i>";
		element += "				</button>";
		element += "				<span data-date=\"created\" class=\"visible\">Created on "+moment(source.attributes.meta.created).format(app.date_format) + "</span>";
		if ( source.attributes.meta.updated ) {
			element += "				<span data-date=\"updated\" class=\"hidden\">Updated on "+moment(source.attributes.meta.updated).format(app.date_format) + "</span>";
		} else {
			element += "				<span data-date=\"updated\" class=\"hidden\">Never been updated yet.</span>";
		}
		element += "			</span>";
		element += "			<span class=\"pull-right mdl-card__menuaction\">";
		element += "				<button id=\"menu_"+source.id+"\" class=\"mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect\">";
		element += "					<i class=\"material-icons\">"+app.icons.menu+"</i>";
		element += "				</button>";
		element += "			</span>";
		element += "			<ul class=\"mdl-menu mdl-menu--top-right mdl-js-menu mdl-js-ripple-effect\" for=\"menu_"+source.id+"\">";
		element += "				<li class=\"mdl-menu__item delete-button\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons delete-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+source.id+"\" data-name=\""+name+"\">"+app.icons.delete+"</i>Delete</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons edit-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+source.id+"\" data-name=\""+name+"\">"+app.icons.edit+"</i>Edit</a>";
		element += "				</li>";
		element += "				<li class=\"mdl-menu__item\">";
		element += "					<a class='mdl-navigation__link'><i class=\"material-icons copy-button mdl-js-button mdl-js-ripple-effect\" data-id=\""+source.id+"\">"+app.icons.copy+"</i><textarea class=\"copytextarea\">"+source.id+"</textarea>Copy ID to clipboard</a>";
		element += "				</li>";
		element += "			</ul>";
		element += "		</div>";
		element += "	</div>";
		element += "</div>";

		return element;
	}
};
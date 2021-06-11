"use strict";
var express = require("express");
var router = express.Router();
const fsP = require("fs").promises;

async function walk(dir, fileList = []) {
	const files = await fsP.readdir(dir);
	for (const file of files) {
		const stat = await fsP.stat(path.join(dir, file));
		if (stat.isDirectory()) {
			fileList = await walk(path.join(dir, file), fileList);
		}
		else fileList.push({date: file.substring(0, 10), f: file.substring(0, file.length-4), title: file.substring(11, file.length-4)});
	}
	return fileList;
}

router.get("/", function(req, res) {
	walk(path.join(__dirname, "../views/emails/newsletters/")).then((articles) => {
		res.render("news-list", {
			currentUrl: req.path,
			articles: (articles).reverse(),
		});
	});
});

router.get("/:file", function(req, res) {
	var file = req.params.file;
	res.render(path.join(__dirname, "../views/emails/newsletters/", file), {
		currentUrl: req.path,
		moment: moment,
		user: {"firstName": "", "lastName": ""},
	});
});

module.exports = router;
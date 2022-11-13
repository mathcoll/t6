"use strict";
var express = require("express");
var router = express.Router();
var ErrorSerializer = require("../serializers/error");
const fsP = require("fs").promises;

async function walk(dir, fileList = []) {
	const files = await fsP.readdir(dir);
	for (const file of files) {
		const stat = await fsP.stat(path.join(dir, file));
		if (stat.isDirectory()) {
			fileList = await walk(path.join(dir, file), fileList);
		}
		else { fileList.push({date: file.substring(0, 10), f: file.substring(0, file.length-4), title: file.substring(11, file.length-4)}); }
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

router.get("(/newsletters)?/:file", function(req, res) {
	let file;
	let tpl = req.params.file;
	if ( (tpl).match(/newsletters/g) > -1 ) {
		file = path.join(__dirname, "../views/emails/newsletters/", tpl+".pug");
	} else {
		file = path.join(__dirname, "../views/emails/", tpl+".pug");
	}
	fs.chmod(file, 0o600 , (err) => {
		if (!err) {
			res.render(file, {
				currentUrl: req.path,
				moment: moment,
				tpl: tpl,
				user: {"firstName": "", "lastName": ""},
			});
		} else {
			t6console.debug("Error", err);
			res.status(404).send(new ErrorSerializer({"id": 7055, "code": 404, "message": "Not Found"}).serialize());
		}
	});
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
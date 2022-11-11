"use strict";
var t6databases = module.exports = {};
global.resources = ["objects", "flows", "rules", "snippets", "dashboards", "tokens", "access_tokens", "users", "units", "datatypes", "categories", "annotations", "otahistory", "uis", "sources", "jobs", "stories", "measures"];
global.loadedResources = [];
/*
this.db.getCollection('collName').on('insert', onChange);
this.db.getCollection('collName').on('update', onChange);
this.db.getCollection('collName').on('delete', onChange);
*/
t6databases.onLoad = async function(data) {
	if(resources.length == loadedResources.length) {
		t6console.log("");
		t6console.log("===========================================================");
		t6console.log("================== Initializing Databases... ==============");
		t6console.log("===========================================================");
		t6console.info("resources", resources);
		t6console.info("loadedResources", loadedResources);
		t6console.log("-", objects.count(), "objects");
		t6console.log("-", flows.count(), "flows");
		t6console.log("-", rules.count(), "rules");
		t6console.log("-", snippets.count(), "snippets");
		t6console.log("-", tokens.count(), "tokens");
		t6console.log("-", access_tokens.count(), "access tokens");
		t6console.log("-", users.count(), "users");
		t6console.log("-", units.count(), "units");
		t6console.log("-", datatypes.count(), "datatypes");
		t6console.log("-", categories.count(), "categories");
		t6console.log("-", annotations.count(), "annotations");
		t6console.log("-", dashboards.count(), "dashboards");
		t6console.log("-", sources.count(), "sources");
		t6console.log("-", OtaHistory.count(), "otaHistory");
		t6console.log("-", uis.count(), "uis");
		t6console.log("-", jobs.count(), "jobs");
		t6console.log("-", stories.count(), "stories");
		t6console.log("-", measures.count(), "fusionBuffer measures");
	}
}

t6databases.init = async function() {
	global.dbLoadTime = new Date();
	t6console.info("Setting correct permission on Databases...");
	let dbs = [
		path.join(__dirname, "data", `db-${os.hostname()}.json`),
		path.join(__dirname, "data", `snippets-${os.hostname()}.json`),
		path.join(__dirname, "data", `dashboards-${os.hostname()}.json`),
		path.join(__dirname, "data", `sources-${os.hostname()}.json`),
		path.join(__dirname, "data", `otahistory-${os.hostname()}.json`),
		path.join(__dirname, "data", `uis-${os.hostname()}.json`),
		path.join(__dirname, "data", `fusion-buffer-${os.hostname()}.json`),
		
		path.join(__dirname, "data", `t6db-accessTokens__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-datatypes__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-flows__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-jobs__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-objects__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-rules__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-tokens__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-users__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-units__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-classifications__${os.hostname()}.json`),
		path.join(__dirname, "data", `t6db-stories__${os.hostname()}.json`),
	];
	dbs.forEach((file) => {
		fs.chmod(file, 0o600 , (err) => {
			if(err) {
				t6console.warn(`- ${file} ${err ? "can't be chmoded" : "is 0600 now."}`);
			}
		});
	});

	global.db_objects = new loki(
		path.join(__dirname, "data", `t6db-objects__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbObjects}
	);
	global.db_flows = new loki(
		path.join(__dirname, "data", `t6db-flows__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbFlows}
	);
	global.db_rules = new loki(
		path.join(__dirname, "data", `t6db-rules__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbRules}
	);
	global.dbSnippets = new loki(
		path.join(__dirname, "data", `snippets-${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbSnippets}
	);
	global.db_tokens = new loki(
		path.join(__dirname, "data", `t6db-tokens__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbTokens}
	);
	global.db_access_tokens = new loki(
		path.join(__dirname, "data", `t6db-accessTokens__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbAccessTokens}
	);
	global.db_users = new loki(
		path.join(__dirname, "data", `t6db-users__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbUsers}
	);
	global.db_units = new loki(
		path.join(__dirname, "data", `t6db-units__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbUnits}
	);
	global.db_datatypes = new loki(
		path.join(__dirname, "data", `t6db-datatypes__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbDatatypes}
	);
	global.db_classifications = new loki(
		path.join(__dirname, "data", `t6db-classifications__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbClassifications}
	);
	global.dbDashboards = new loki(
		path.join(__dirname, "data", `dashboards-${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbDashboards}
	);
	global.dbSources = new loki(
		path.join(__dirname, "data", `sources-${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbSources}
	);
	global.dbOtaHistory = new loki(
		path.join(__dirname, "data", `otahistory-${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbOtaHistory}
	);
	global.dbUis = new loki(
		path.join(__dirname, "data", `uis-${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbUis}
	);
	global.db_jobs = new loki(
		path.join(__dirname, "data", `t6db-jobs__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbJobs}
	);
	global.db_stories = new loki(
		path.join(__dirname, "data", `t6db-stories__${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbStories}
	);
	global.dbFusionBuffer = new loki(
		path.join(__dirname, "data", `fusion-buffer-${os.hostname()}.json`),
		{autoload: true, autosave: true, autoloadCallback: t6databases.initDbFusionBuffer}
	);
};

t6databases.initDbObjects = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "objects";
		let db = global.db_objects;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.objects = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbFlows = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "flows";
		let db = global.db_flows;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.flows = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbRules = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "rules";
		let db = global.db_rules;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.rules = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbSnippets = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "snippets";
		let db = global.dbSnippets;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.snippets = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbTokens = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "tokens";
		let db = global.db_tokens;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.tokens = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbAccessTokens = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "accesstokens";
		let db = global.db_access_tokens;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.access_tokens = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbUsers = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "users";
		let db = global.db_users;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.users = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);

			/* One shot Db cleaning */
			/*
			t6console.debug("Cleaning Database for Users");
			(global.users).chain().update(
				function(user){
					delete user.data;
					delete user.quotausage;
					delete user.quota;
					delete user.permissions;
					user.subscription = {
						"changePassword": (typeof user.unsubscription!=="undefined" && typeof user.unsubscription.changePassword!=="undefined")?null:user.subscription_date,
						"newsletter": (typeof user.unsubscription!=="undefined" && typeof user.unsubscription.newsletter!=="undefined")?null:user.subscription_date,
						"monthlyreport": (typeof user.unsubscription!=="undefined" && typeof user.unsubscription.monthlyreport!=="undefined")?null:user.subscription_date,
						"reminder": (typeof user.unsubscription!=="undefined" && typeof user.unsubscription.reminder!=="undefined")?null:user.subscription_date,
					}
					// reminderMail => date à laquelle un reminder email à été envoyé
				}
			);
			db_users.save();
			t6console.debug(global.users.data[0]);
			*/
			/* One shot Db cleaning */
			resolve(`loaded`);
		}
	});
};
t6databases.initDbUnits = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "units";
		let db = global.db_units;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.units = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbDatatypes = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "datatypes";
		let db = global.db_datatypes;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.datatypes = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbClassifications = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = ["categories", "annotations"];
		let db = global.db_classifications;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for classifications} is not set`);
			reject(`-n/a resources in classifications} collection.`);
		} else {
			if ( db.getCollection(collectionName[0]) === null ) {
				db.addCollection(collectionName[0]);
				t6console.warn(`- Collection ${collectionName[0]} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName[0]} already exists.`);
			}
			global.categories = db.getCollection(collectionName[0]);
			loadedResources.push(collectionName[0]);

			if ( db.getCollection(collectionName[1]) === null ) {
				db.addCollection(collectionName[1]);
				t6console.warn(`- Collection ${collectionName[1]} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName[1]} already exists.`);
			}
			global.annotations = db.getCollection(collectionName[1]);
			loadedResources.push(collectionName[1]);
			
			db.on("loaded", t6databases.onLoad);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbDashboards = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "dashboards";
		let db = global.dbDashboards;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.dashboards = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbSources = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "sources";
		let db = global.dbSources;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.sources = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbOtaHistory = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "otahistory";
		let db = global.dbOtaHistory;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.OtaHistory = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbUis = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "uis";
		let db = global.dbUis;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.uis = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbJobs = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "jobs";
		let db = global.db_jobs;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.jobs = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbStories = function() {
	return new Promise((resolve, reject) => {
		let collectionName = "stories";
		let db = global.db_stories;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.stories = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};
t6databases.initDbFusionBuffer = async function() {
	return new Promise((resolve, reject) => {
		let collectionName = "measures";
		let db = global.dbFusionBuffer;
		if ( db === null || typeof db === "undefined" ) {
			t6console.error(`db for ${collectionName} is not set`);
			reject(`-n/a resources in ${collectionName} collection.`);
		} else {
			if ( db.getCollection(collectionName) === null ) {
				db.addCollection(collectionName);
				t6console.warn(`- Collection ${collectionName} is created.`);
			} else {
				//t6console.log(`- Collection ${collectionName} already exists.`);
			}
			global.measures = db.getCollection(collectionName);
			db.on("loaded", t6databases.onLoad);
			loadedResources.push(collectionName);
			resolve(`loaded`);
		}
	});
};

module.exports = t6databases;
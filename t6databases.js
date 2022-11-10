"use strict";
var t6databases = module.exports = {};

t6databases.init = async function() {
	global.dbLoadTime = new Date();
	t6console.log("");
	t6console.log("===========================================================");
	t6console.log("================== Initializing Databases... ==============");
	t6console.log("===========================================================");
	global.db_objects = new loki(path.join(__dirname, "data", `t6db-objects__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbObjects});
	global.db_flows = new loki(path.join(__dirname, "data", `t6db-flows__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbFlows});
	global.db_users = new loki(path.join(__dirname, "data", `t6db-users__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbUsers});
	global.db_tokens = new loki(path.join(__dirname, "data", `t6db-tokens__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbTokens});
	global.db_access_tokens = new loki(path.join(__dirname, "data", `t6db-accessTokens__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbAccessTokens});
	global.db_units = new loki(path.join(__dirname, "data", `t6db-units__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbUnits});
	global.db_datatypes = new loki(path.join(__dirname, "data", `t6db-datatypes__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbDatatypes});
	global.db_rules = new loki(path.join(__dirname, "data", `t6db-rules__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbRules});
	global.db_classifications = new loki(path.join(__dirname, "data", `t6db-classifications__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbClassifications});

	global.dbSnippets = new loki(path.join(__dirname, "data", `snippets-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbSnippets});
	global.dbDashboards = new loki(path.join(__dirname, "data", `dashboards-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbDashboards});
	global.dbSources = new loki(path.join(__dirname, "data", `sources-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbSources});
	global.dbOtaHistory = new loki(path.join(__dirname, "data", `otahistory-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbOtaHistory});
	global.dbUis = new loki(path.join(__dirname, "data", `uis-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbUis});
	global.db_jobs = new loki(path.join(__dirname, "data", `t6db-jobs__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbJobs});
	global.db_stories = new loki(path.join(__dirname, "data", `t6db-stories__${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbStories});
	global.dbFusionBuffer = new loki(path.join(__dirname, "data", `fusion-buffer-${os.hostname()}.json`), {autoload: true, autosave: true, autoloadCallback: t6databases.initDbFusionBuffer});
};

t6databases.initDbRules = async function() {
	return new Promise((resolve, reject) => {
		if ( db_rules === null ) {
			t6console.error("db Rules is failing");
		}
		if ( db_rules.getCollection("rules") === null ) {
			t6console.error("- Collection Rules is failing");
			db_rules.addCollection("rules");
		} else {
			global.rules = db_rules.getCollection("rules");
			t6console.log(db_rules.getCollection("rules").count(), "resources in Rules collection.");
			resolve("");
		}
	});
};

t6databases.initDbSnippets = async function() {
	return new Promise((resolve, reject) => {
		if ( dbSnippets === null ) {
			t6console.error("db Snippets is failing");
		}
		if ( dbSnippets.getCollection("snippets") === null ) {
			t6console.error("- Collection Snippets is failing");
		} else {
			t6console.log(dbSnippets.getCollection("snippets").count(), "resources in Snippets collection.");
			resolve("");
		}
	});
};

t6databases.initDbDashboards = async function() {
	return new Promise((resolve, reject) => {
		if ( dbDashboards === null ) {
			t6console.error("db Dashboards is failing");
		}
		if ( dbDashboards.getCollection("dashboards") === null ) {
			t6console.error("- Collection Dashboards is failing");
		} else {
			t6console.log(dbDashboards.getCollection("dashboards").count(), "resources in Dashboards collection.");
			resolve("");
		}
	});
};

t6databases.initDbSources = async function() {
	return new Promise((resolve, reject) => {
		if ( dbSources === null ) {
			t6console.error("db Sources is failing");
		}
		if ( dbSources.getCollection("sources") === null ) {
			t6console.error("- Collection Sources is failing");
		} else {
			t6console.log(dbSources.getCollection("sources").count(), "resources in Sources collection.");
			resolve("");
		}
	});
};

t6databases.initDbOtaHistory = async function() {
	return new Promise((resolve, reject) => {
		if ( dbOtaHistory === null ) {
			t6console.error("db OtaHistory is failing");
		}
		if ( dbOtaHistory.getCollection("otahistory") === null ) {
			t6console.error("- Collection OtaHistory is failing");
		} else {
			t6console.log(dbOtaHistory.getCollection("otahistory").count(), "resources in OtaHistory collection.");
			resolve("");
		}
	});
};

t6databases.initDbUis = async function() {
	return new Promise((resolve, reject) => {
		if ( dbUis === null ) {
			t6console.error("db UIs is failing");
		}
		if ( dbUis.getCollection("uis") === null ) {
			t6console.error("- Collection UIs is failing");
		} else {
			t6console.log(dbUis.getCollection("uis").count(), "resources in UIs collection.");
			resolve("");
		}
	});
};

t6databases.initDbJobs = async function() {
	return new Promise((resolve, reject) => {
		if ( db_jobs === null ) {
			t6console.error("db Jobs is failing");
		}
		if ( db_jobs.getCollection("jobs") === null ) {
			t6console.error("- Collection Jobs is created");
			db_jobs.addCollection("jobs");
		} else {
			global.jobs = db_jobs.getCollection("jobs");
			t6console.log(db_jobs.getCollection("jobs").count(), "resources in Jobs collection.");
			resolve("");
		}
	});
};

t6databases.initDbFusionBuffer = async function() {
	return new Promise((resolve, reject) => {
		if ( dbFusionBuffer === null ) {
			t6console.error("db FusionBuffer is failing");
		}
		if ( dbFusionBuffer.getCollection("measures") === null ) {
			t6console.error("- Collection FusionBuffer is failing");
		} else {
			t6console.log(dbFusionBuffer.getCollection("measures").count(), "resources in FusionBuffer collection.");
			resolve("");
		}
	});
};

t6databases.initDbFlows = async function() {
	return new Promise((resolve, reject) => {
		if ( db_flows === null ) {
			t6console.error("db flows is failing");
		}
		if ( db_flows.getCollection("flows") === null ) {
			t6console.error("- Collection flows is created");
			db_flows.addCollection("flows");
		} else {
			global.flows = db_flows.getCollection("flows");
			t6console.log(db_flows.getCollection("flows").count(), "resources in flows collection.");
			resolve("");
		}
	});
};

t6databases.initDbObjects = async function() {
	return new Promise((resolve, reject) => {
		if ( db_objects === null ) {
			t6console.error("db objects is failing");
		}
		if ( db_objects.getCollection("objects") === null ) {
			t6console.error("- Collection objects is created");
			db_objects.addCollection("objects");
		} else {
			global.objects = db_objects.getCollection("objects");
			t6console.log(db_objects.getCollection("objects").count(), "resources in objects collection.");
			resolve("");
		}
	});
};

t6databases.initDbUsers = async function() {
	return new Promise((resolve, reject) => {
		if ( db_users === null ) {
			t6console.error("db users is failing");
		}
		if ( db_users.getCollection("users") === null ) {
			t6console.error("- Collection users is created");
			db_users.addCollection("users");
		} else {
			global.users = db_users.getCollection("users");
			t6console.log(db_users.getCollection("users").count(), "resources in users collection.");
			resolve("");
			
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
		}
	});
};

t6databases.initDbAccessTokens = async function() {
	return new Promise((resolve, reject) => {
		if ( db_access_tokens === null ) {
			t6console.error("db AccessTokens is failing");
		}
		if ( db_access_tokens.getCollection("accesstokens") === null ) {
			t6console.error("- Collection AccessTokens is failing");
			db_access_tokens.addCollection("accesstokens");
		} else {
			global.access_tokens = db_access_tokens.getCollection("accesstokens");
			let expired = access_tokens.find( { "$and": [ { "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } }]} );
			if ( expired ) { access_tokens.remove(expired); db_access_tokens.save(); }
			t6console.log(db_access_tokens.getCollection("accesstokens").count(), "resources in AccessTokens collection.");
			resolve("");
		}
	});
};

t6databases.initDbTokens = async function() {
	return new Promise((resolve, reject) => {
		if ( db_tokens === null ) {
			t6console.error("db tokens is failing");
		}
		if ( db_tokens.getCollection("tokens") === null ) {
			t6console.error("- Collection tokens is created");
			db_tokens.addCollection("tokens");
		} else {
			global.tokens = db_tokens.getCollection("tokens");
			let expired = tokens.find( { "$and": [ { "expiration" : { "$lt": moment().format("x") } }, { "expiration" : { "$ne": "" } }]} );
			if ( expired ) { tokens.remove(expired); db_tokens.save(); }
			t6console.log(db_tokens.getCollection("tokens").count(), "resources in tokens collection.");
			resolve("");
		}
	});
};

t6databases.initDbStories = function() {
	return new Promise((resolve, reject) => {
		if ( db_stories === null ) {
			t6console.error("db stories is failing");
		}
		if ( db_stories.getCollection("stories") === null ) {
			t6console.error("- Collection stories is created");
			db_stories.addCollection("stories");
		} else {
			global.stories = db_stories.getCollection("stories");
			t6console.log(db_stories.getCollection("stories").count(), "resources in Stories collection.");
			resolve("");
		}
	});
};

t6databases.initDbUnits = async function() {
	return new Promise((resolve, reject) => {
		if ( db_units === null ) {
			t6console.error("db units is failing");
		}
		if ( db_units.getCollection("units") === null ) {
			t6console.error("- Collection units is created");
			db_units.addCollection("units");
		} else {
			global.units = db_units.getCollection("units");
			t6console.log(db_units.getCollection("units").count(), "resources in units collection.");
			resolve("");
		}
	});
};

t6databases.initDbDatatypes = async function() {
	return new Promise((resolve, reject) => {
		if ( db_datatypes === null ) {
			t6console.error("db datatypes is failing");
		}
		if ( db_datatypes.getCollection("datatypes") === null ) {
			t6console.error("- Collection datatypes is created");
			db_datatypes.addCollection("datatypes");
		} else {
			global.datatypes = db_datatypes.getCollection("datatypes");
			t6console.log(db_datatypes.getCollection("datatypes").count(), "resources in datatypes collection.");
			resolve("");
		}
	});
};

t6databases.initDbClassifications = async function() {
	return new Promise((resolve, reject) => {
		if ( db_classifications === null ) {
			t6console.error("db classifications is failing");
		}
		if ( db_classifications.getCollection("categories") === null ) {
			t6console.error("- Collection categories is created");
			db_classifications.addCollection("categories");
		} else {
			global.categories = db_classifications.getCollection("categories");
			t6console.log(db_classifications.getCollection("categories").count(), "resources in categories collection.");
		}
		if ( db_classifications.getCollection("annotations") === null ) {
			t6console.error("- Collection annotations is created");
			db_classifications.addCollection("annotations");
		} else {
			global.annotations = db_classifications.getCollection("annotations");
			t6console.log(db_classifications.getCollection("annotations").count(), "resources in annotations collection.");
			resolve("");
		}
	});
};

module.exports = t6databases;
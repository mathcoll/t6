"use strict";
var express = require("express");
var router = express.Router();
var ModelSerializer = require("../serializers/model");
var ErrorSerializer = require("../serializers/error");
const options = {
	epochs: 0,
	validationData: null,
	verbose: process.env.NODE_ENV === "production" ?0:1/*,
	callbacks: {
		onEpochBegin: async (epoch, logs) => {
			t6console.debug(`Epoch ${epoch + 1} of ${config.epochs} ...`)
		},
		onEpochEnd: async (epoch, logs) => {
			t6console.debug(`  train-set loss: ${typeof logs.loss!=="undefined"?logs.loss.toFixed(4):"ukn"}`);
			t6console.debug(`  train-set accuracy: ${typeof logs.acc!=="undefined"?logs.acc.toFixed(4):"ukn"}`);
		},
		onTrainBegin: async (epoch, logs) => {
			t6console.debug(`  train begin`);
		}
	}*/
};
const executeQuery = async (query) => {
	// Execute your InfluxDB query here and return the result
	// For example:
	return await dbInfluxDB.query(query);
};
// Function to execute all queries concurrently and gather their results
const executeAllQueries = async (queries) => {
	try {
		const results = await Promise.all(queries.map(query => executeQuery(query)));
		return results;
	} catch (error) {
		console.error("Error executing queries:", error);
		throw error;
	}
};
const normalize = (inputData, min, max) => {
	return typeof inputData!=="undefined"?(parseFloat(inputData) - min)/(max - min):0;
};
const oneHotEncode = (classIndex, classes) => {
	return Array.from(tf.oneHot(classIndex, classes.length).dataSync());
};
// Function to find the nearest timestamp from an array of rows
const findNearestTimestamp = (timestamp, rows) => {
	let nearestTimestamp = null;
	let minDifference = Infinity;

	for (const row of rows) {
		const currentTimestamp = new Date(row.time);
		const difference = Math.abs(currentTimestamp - timestamp);
		if (difference < minDifference) {
			minDifference = difference;
			nearestTimestamp = currentTimestamp;
			nearestRow = row;
		}
	}
	return nearestRow;
};

/**
 * @api {get} /models/:model_id? Get Models
 * @apiDescription Getting a Model will returns the history and current_status as well as the attributes you have set on the Model creation.
 * @apiName Get Models
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [model_id] Model Id
 * @apiParam {String} [size=20] Size of the resultset
 * @apiParam {Number} [page] Page offset
 * @apiBody {String} [name] 
 * 
 * @apiUse 200
 */
router.get("/?(:model_id([0-9a-z\-]+))?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var model_id = req.params.model_id;
	var name = req.query.name;
	var size = typeof req.query.size!=="undefined"?req.query.size:20;
	var page = typeof req.query.page!=="undefined"?req.query.page:1;
	page = page>0?page:1;
	var offset = Math.ceil(size*(page-1));
	var query;
	if ( typeof model_id !== "undefined" ) {
		query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : model_id },
			]
		};
	} else {
		if ( typeof name !== "undefined" ) {
			query = {
			"$and": [
					{ "user_id" : req.user.id },
					{ "name": { "$regex": [name, "i"] } }
				]
			};
		} else {
			query = {
			"$and": [
					{ "user_id" : req.user.id },
				]
			};
		}
	}
	var json = models.chain().find(query).offset(offset).limit(size).data();

	var total = models.find(query).length;
	json.size = size;
	json.pageSelf = page;
	json.pageFirst = 1;
	json.pagePrev = json.pageSelf>json.pageFirst?Math.ceil(json.pageSelf)-1:json.pageFirst;
	json.pageLast = Math.ceil(total/size);
	json.pageNext = json.pageSelf<json.pageLast?Math.ceil(json.pageSelf)+1:undefined;
	json = json.length>0?json:[];

	res.status(200).send(new ModelSerializer(json).serialize());
});

/**
 * @api {get} /models/:model_id/download/:file/? Download Models
 * @apiName Download Models
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} model_id The model Id you'd like to download binary from
 * @apiParam {String="weights.bin","model.json"} file The file you'd like to download
 * 
 * @apiUse 200
 * @apiUse 404
 * @apiUse 412
 * @apiUse 500
 */
router.get("/?(:model_id([0-9a-z\-]+))/download/:file(weights\.bin|model\.json)/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var model_id = req.params.model_id;
	var file = req.params.file;
	var query = {
		"$and": [
				{ "user_id" : req.user.id },
				{ "id" : model_id },
			]
		};
	var json = models.findOne(query);
	if ( typeof model_id!=="undefined" && model_id!==null ) { // TODO && model_id is uuidv4
		if(json!==null) {
			let path = `${mlModels.models_user_dir}/${req.user.id}/${model_id}`;
			let filename = `${path}/${file}`;
			if (!fs.existsSync(path)) {
				res.status(404).send(new ErrorSerializer({"id": 14275, "code": 404, "message": "Not Found"}).serialize());
			} else {
				res.attachment(file);
				try {
					let stream = fs.createReadStream(filename);
					res.set({
						"Content-Disposition": `attachment; filename=${file}`,
						"Content-Type": "application/octet-stream",
					});
					stream.pipe(res);
				} catch (err) {
					t6console.debug("err: ", err);
					t6events.addAudit("t6App", "Download model error: {get} /models/:model_id/download/", "", "", {"status": "500", error_id: 14277});
					res.status(500).send(new ErrorSerializer({"id": 14277, "code": 500, "message": "Precondition Failed"}).serialize());
				}
			}
		} else {
			res.status(404).send(new ErrorSerializer({"id": 14274, "code": 404, "message": "Not Found"}).serialize());
		}
	} else {
		res.status(412).send(new ErrorSerializer({"id": 14276, "code": 412, "message": "Precondition Failed"}).serialize());
	}
});

/**
 * @api {put} /models/:model_id Edit a Model
 * @apiName Edit a Model
 * @apiDescription Editing a Model will reset the history, the training_balance, the mins and maxs, the data_length, and the current_status
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 *
 * @apiUse Auth
 * @apiParam {uuid-v4} [model_id] The model Id you'd like to edit
 * @apiBody {String} [retention=autogen] Data retention to look for
 * @apiBody {String=forecast,classification} [strategy=classification] Strategy
 * @apiBody {Boolean=true false} [normalize=true] Normalize boolean
 * @apiBody {String} [window_time_frame=60m] Window Time Frame (60 minutes by default)
 * @apiBody {Boolean=true false} [splitToArray=false] splitToArray boolean
 * @apiBody {Boolean=true false} [shuffle=false] shuffle boolean
 * @apiBody {Number} [validation_split=0.8] Ratio of subset data to use on validation during training
 * @apiBody {Integer} [batch_size=100]  Batch size during training
 * @apiBody {Integer} [epochs=100] Number of epochs in training
 * @apiBody {String[]} flow_ids Array of Flow Ids involved in training
 * @apiBody {String[]} [continuous_features] Array of Continuous features
 * @apiBody {String[]} [categorical_feature] Array of Categorical features
 * @apiBody {Object[]} [categorical_features_classes] Array of Categorical classes
 * @apiBody {String} [categorical_features_classes.name] Categorical classes names ; should refers to "categorical_features" from the list above
 * @apiBody {String[]} [categorical_features_classes.values] Categorical classes values
 * @apiBody {Object} datasets  
 * @apiBody {Object} datasets.training Training Object containing details about data to train
 * @apiBody {Date} datasets.training.start Start date to take Datapoints for training. As Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {Date} datasets.training.end End date to take Datapoints for training. As Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {String} datasets.training[duration] Not implemented yet !
 * @apiBody {Integer} datasets.training.limit Number of Datapoints to retrieve for each Flows
 * @apiBody {Integer} datasets.training.balance_limit Restrict the Datapoints to a balanced limit so that all classes have the same amount of Datapoints
 * @apiBody {Object} datasets.testing Testing Object containing details about data to test
 * @apiBody {Date} datasets.testing.start Start date to take Datapoints for training. As Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {Date} datasets.testing.end End date to take Datapoints for testing. As Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {String} datasets.testing[duration] Not implemented yet !
 * @apiBody {Integer} datasets.training.limit Number of Datapoints to retrieve for each Flows
 * @apiBody {String="adagrad" "adadelta" "adamax" "rmsprop" "momentum" "sgd" "adam"} compile.optimizer=adam Training optimizer
 * @apiBody {Object[]} layers  
 * @apiBody {String=input,output,hidden} layers.type 
 * @apiBody {Integer} layers.units 
 * @apiBody {String=relu, softmax} layers.activation Activation function in the dense layer
 * @apiBody {Object} compile  
 * @apiBody {Number} compile.learningrate=0.001 Learning Rate
 * @apiBody {String="categoricalCrossentropy" "meanSquaredError" "binaryCrossentropy"} compile.loss=binaryCrossentropy Training loss function
 * @apiBody {String[]} compile.metrics="['accuracy']" Training metrics
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 404
 * @apiUse 409
 */
router.put("/:model_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var model_id = req.params.model_id;
	if ( model_id ) {
		var query = {
			"$and": [
					{ "id": model_id },
					{ "user_id": req.user.id },
				]
			};
		var model = models.findOne( query );
		if ( model ) {
			if ( req.body.meta && req.body.meta.revision && (req.body.meta.revision - rule.meta.revision) !== 0 ) {
				res.status(409).send(new ErrorSerializer({"id": 14001, "code": 409, "message": "Bad Request"}).serialize());
			} else {
				var result;
				models.chain().find({ "id": model_id }).update(function(item) {
					item.history		= {};
					item.training_balance= {};
					item.min= {};
					item.max= {};
					item.current_status	= "READY";
					item.current_status_last_update	= moment().format(logDateFormat);
					item.data_length	= undefined;
					item.features		= undefined;
					item.name			= typeof req.body.name!=="undefined"?req.body.name:item.name;
					item.meta.revision	= typeof item.meta.revision==="number"?(item.meta.revision):1;
					item.flow_ids		= typeof req.body.flow_ids!=="undefined"?req.body.flow_ids:item.flow_ids;
					item.normalize		= typeof req.body.normalize!=="undefined"?req.body.normalize:item.normalize;
					item.shuffle		= typeof req.body.shuffle!=="undefined"?req.body.shuffle:item.shuffle;
					item.strategy		= typeof req.body.strategy!=="undefined"?req.body.strategy:item.strategy,
					item.window_time_frame	= typeof req.body.window_time_frame!=="undefined"?req.body.window_time_frame:item.window_time_frame;
					item.splitToArray	= typeof req.body.splitToArray!=="undefined"?req.body.splitToArray:item.splitToArray;
					item.labels			= typeof req.body.labels!=="undefined"?req.body.labels:item.labels;
					item.continuous_features	= typeof req.body.continuous_features!=="undefined"?req.body.continuous_features:item.continuous_features;
					item.categorical_features	= typeof req.body.categorical_features!=="undefined"?req.body.categorical_features:item.categorical_features; // TODO depend on datatype
					item.categorical_features_classes	= typeof req.body.categorical_features_classes!=="undefined"?req.body.categorical_features_classes:item.categorical_features_classes;
					item.retention		= typeof req.body.retention!=="undefined"?req.body.retention:item.retention;
					item.batch_size		= typeof req.body.batch_size!=="undefined"?req.body.batch_size:100;
					item.epochs			= typeof req.body.epochs!=="undefined"?req.body.epochs:100;
					item.validation_split	= typeof req.body.validation_split!=="undefined"?req.body.validation_split:item.validation_split;
					item.layers			= typeof req.body.layers!=="undefined"?req.body.layers:item.layers;
					item.datasets	= {
						"training": {
							"start": typeof req.body.datasets.training.start!=="undefined"?req.body.datasets.training.start:item.datasets.training.start,
							"end": typeof req.body.datasets.training.end!=="undefined"?req.body.datasets.training.end:item.datasets.training.end,
							"duration": typeof req.body.datasets.training.duration!=="undefined"?req.body.datasets.training.duration:item.datasets.training.duration,
							"limit": typeof req.body.datasets.training.limit!=="undefined"?req.body.datasets.training.limit:item.datasets.training.limit,
							"balance_limit": typeof req.body.datasets.training.balance_limit!=="undefined"?req.body.datasets.training.balance_limit:item.datasets.training.balance_limit
						},
						"testing": {
							"start": typeof req.body.datasets.testing.start!=="undefined"?req.body.datasets.testing.start:item.datasets.testing.start,
							"end": typeof req.body.datasets.testing.end!=="undefined"?req.body.datasets.testing.end:item.datasets.testing.end,
							"duration": typeof req.body.datasets.testing.duration!=="undefined"?req.body.datasets.testing.duration:item.datasets.testing.duration,
							"limit": typeof req.body.datasets.testing.limit!=="undefined"?req.body.datasets.testing.limit:item.datasets.testing.limit
						}
					};
					item.compile	= {
						"optimizer": (typeof req.body.compile!=="undefined" && typeof req.body.compile.optimizer!=="undefined")?req.body.compile.optimizer:item.compile.optimizer,
						"learningrate": (typeof req.body.compile!=="undefined" && typeof req.body.compile.learningrate!=="undefined")?req.body.compile.learningrate:item.compile.learningrate,
						"loss": (typeof req.body.compile!=="undefined" && typeof req.body.compile.loss!=="undefined")?req.body.compile.loss:item.compile.loss,
						"metrics": (typeof req.body.compile!=="undefined" && typeof req.body.compile.metrics!=="undefined")?req.body.compile.metrics:item.compile.metrics,
					}
					result = item;
				});
				if ( typeof result !== "undefined" ) {
					db_models.save();
					res.header("Location", "/v"+version+"/models/"+model_id);
					res.status(200).send({ "code": 200, message: "Successfully updated", model: new ModelSerializer(result).serialize() });
				} else {
					res.status(404).send(new ErrorSerializer({"id": 14273, "code": 404, "message": "Not Found"}).serialize());
				}
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 14272, "code": 401, "message": "Forbidden"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 14271, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {post} /models/ Create new Model
 * @apiName Create new Models
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiBody {String} [retention=autogen] Data retention to look for
 * @apiBody {String=forecast,classification} [strategy=classification] Strategy
 * @apiBody {Boolean=true false} [normalize=true] Normalize boolean
 * @apiBody {String} [window_time_frame=60m] Window Time Frame (60 minutes by default)
 * @apiBody {Boolean=true false} [splitToArray=false] splitToArray boolean
 * @apiBody {Boolean=true false} [shuffle=false] shuffle boolean
 * @apiBody {Number} [validation_split=0.8] Ratio of subset data to use on validation during training
 * @apiBody {Integer} [batch_size=100]  Batch size during training
 * @apiBody {Integer} [epochs=100] Number of epochs in training
 * @apiBody {String[]} flow_ids Array of Flow Ids involved in training
 * @apiBody {String[]} [continuous_features] Array of Continuous features
 * @apiBody {String[]} [categorical_feature] Array of Categorical features
 * @apiBody {Object[]} [categorical_features_classes] Array of Categorical classes
 * @apiBody {String} [categorical_features_classes.name] Categorical classes names ; should refers to "categorical_features" from the list above
 * @apiBody {String[]} [categorical_features_classes.values] Categorical classes values
 * @apiBody {Object} datasets  
 * @apiBody {Object} datasets.training Training Object containing details about data to train
 * @apiBody {Date} datasets.training.start Start date to take Datapoints for training. As Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {Date} datasets.training.end End date to take Datapoints for training. As Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {String} datasets.training[duration] Not implemented yet !
 * @apiBody {Integer} datasets.training.limit Number of Datapoints to retrieve for each Flows
 * @apiBody {Integer} datasets.training.balance_limit Restrict the Datapoints to a balanced limit so that all classes have the same amount of Datapoints
 * @apiBody {Object} datasets.testing Testing Object containing details about data to test
 * @apiBody {Date} datasets.testing.start Start date to take Datapoints for training. As Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {Date} datasets.testing.end End date to take Datapoints for testing. As Timestamp or formatted date YYYY-MM-DD HH:MM:SS
 * @apiBody {String} datasets.testing[duration] Not implemented yet !
 * @apiBody {Integer} datasets.training.limit Number of Datapoints to retrieve for each Flows
 * @apiBody {String="adagrad" "adadelta" "adamax" "rmsprop" "momentum" "sgd" "adam"} compile.optimizer=adam Training optimizer
 * @apiBody {Object[]} layers  
 * @apiBody {String=input,output,hidden} layers.type 
 * @apiBody {Integer} layers.units 
 * @apiBody {String=relu, softmax} layers.activation Activation function in the dense layer
 * @apiBody {Number} compile.learningrate=0.001 Learning Rate
 * @apiBody {String="categoricalCrossentropy" "meanSquaredError" "binaryCrossentropy"} compile.loss=binaryCrossentropy Training loss function
 * @apiBody {String[]} compile.metrics="['accuracy']" Training metrics
 * 
 * @apiUse 201
 * @apiUse 429
 */
router.post("/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	/* Check for quota limitation */
	var queryR = { "user_id" : req.user.id };
	var i = (models.find(queryR)).length;
	if( i >= (quota[req.user.role]).models ) {
		res.status(429).send(new ErrorSerializer({"id": 12329, "code": 429, "message": "Too Many Requests"}).serialize());
	} else {
		if ( typeof req.user.id !== "undefined" ) {
			var model_id = uuid.v4();
			var newModel = {
				id:			model_id,
				user_id:	req.user.id,
				name: 		typeof req.body.name!=="undefined"?req.body.name:"unamed",
				flow_ids:	typeof req.body.flow_ids!=="undefined"?req.body.flow_ids:[],
				normalize:	typeof req.body.normalize!=="undefined"?req.body.normalize:true,
				shuffle:	typeof req.body.shuffle!=="undefined"?req.body.shuffle:false,
				strategy:	typeof req.body.strategy!=="undefined"?req.body.strategy:"classification",
				window_time_frame:	typeof req.body.window_time_frame!=="undefined"?req.body.window_time_frame:"60m",
				splitToArray:typeof req.body.splitToArray!=="undefined"?req.body.splitToArray:false,
				labels:		typeof req.body.labels!=="undefined"?req.body.labels:["oov"],
				continuous_features: typeof req.body.continuous_features!=="undefined"?req.body.continuous_features:["value"],
				categorical_feature: typeof req.body.categorical_features!=="undefined"?req.body.categorical_features:[], // TODO depend on datatype
				categorical_features_classes: typeof req.body.categorical_features_classes!=="undefined"?req.body.categorical_features_classes:[],
				retention:	typeof req.body.retention!=="undefined"?req.body.retention:"autogen",
				validation_split:	typeof req.body.validation_split!=="undefined"?req.body.validation_split:0.8,
				batch_size:	typeof req.body.batch_size!=="undefined"?req.body.batch_size:100,
				epochs:		typeof req.body.epochs!=="undefined"?req.body.epochs:100,
				current_status: "READY",
				current_status_last_update: moment().format(logDateFormat),
				training_balance:	{},
				layers: 	typeof req.body.layers!=="undefined"?req.body.layers:[ { "type": "input", "units": 1, "activation": "relu" }, { "type": "output", "activation": "softmax" }],
				datasets: {
					training: {
						start: typeof req.body.datasets.training.start!=="undefined"?req.body.datasets.training.start:new Date(),
						end: typeof req.body.datasets.training.end!=="undefined"?req.body.datasets.training.end:new Date(),
						duration: typeof req.body.datasets.training.duration!=="undefined"?req.body.datasets.training.duration:null,
						limit: typeof req.body.datasets.training.limit!=="undefined"?req.body.datasets.training.limit:null,
						balance_limit: typeof req.body.datasets.training.balance_limit!=="undefined"?req.body.datasets.training.balance_limit:null
					},
					testing: {
						start: typeof req.body.datasets.testing.start!=="undefined"?req.body.datasets.testing.start:new Date(),
						end: typeof req.body.datasets.testing.end!=="undefined"?req.body.datasets.testing.end:new Date(),
						duration: typeof req.body.datasets.testing.duration!=="undefined"?req.body.datasets.testing.duration:null,
						limit: typeof req.body.datasets.testing.limit!=="undefined"?req.body.datasets.testing.limit:null
					}
				},
				compile:{
					optimizer: typeof req.body.compile?.optimizer!=="undefined"?req.body.compile.optimizer:"adam",
					learningrate: typeof req.body.compile?.learningrate!=="undefined"?req.body.compile.learningrate:0.001,
					loss: typeof req.body.compile?.loss!=="undefined"?req.body.compile.loss:"binaryCrossentropy",
					metrics: typeof req.body.compile?.metrics!=="undefined"?req.body.compile.metrics:["accuracy"],
				}
			};
			t6events.addStat("t6Api", "model add", newModel.id, req.user.id);
			t6events.addAudit("t6Api", "model add", req.user.id, newModel.id, {error_id: null, status: 201});
			models.insert(newModel);
			
			res.header("Location", "/v"+version+"/models/"+newModel.id);
			res.status(201).send({ "code": 201, message: "Created", model: new ModelSerializer(newModel).serialize() });
		}
	}
});

/**
 * @api {delete} /models/:model_id Delete Model
 * @apiName Delete Models
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [model_id] The model Id you'd like to edit
 * 
 * @apiUse 200
 * @apiUse 404
 */
router.delete("/:model_id([0-9a-z\-]+)", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var model_id = req.params.model_id;
	var query = {
		"$and": [
			{ "user_id" : req.user.id, }, // delete only model from current user
			{ "id" : model_id, },
		],
	};
	var s = models.find(query);
	if ( s.length > 0 ) {
		models.remove(s);
		db_models.saveDatabase();
		t6events.addAudit("t6Api", "model delete", req.user.id, model_id, {error_id: null, status: 200});
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: model_id }); // TODO: missing serializer
	} else {
		t6events.addAudit("t6Api", "model delete", req.user.id,model_id , {error_id: 14271, status: 404});
		res.status(404).send(new ErrorSerializer({"id": 14271, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {get} /models/:model_id/predict Predict over a Model
 * @apiName Predict over a Model
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [model_id] The model Id you'd like to edit
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 412
 */
router.get("/:model_id([0-9a-z\-]+)/predict/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let model_id = req.params.model_id;
	let user_id = req.user.id;
	let inputData = Array.isArray(req.body)===false?[req.body]:req.body;
	if (!req.body || !inputData) {
		return res.status(412).send(new ErrorSerializer({ "id": 14185, "code": 412, "message": "Precondition Failed" }).serialize());
	}
	if (model_id) {
		let query = {
			"$and": [
					{ "id": model_id },
					{ "user_id": req.user.id },
				]
			};
		let t6Model = models.findOne( query );
		if ( t6Model ) {
			const path = `${mlModels.models_user_dir}/${req.user.id}/${t6Model.id}`;
			if (!fs.existsSync(path)) {
				res.status(412).send(new ErrorSerializer({"id": 14186, "code": 412, "message": "Model not yet trained: Precondition Failed"}).serialize());
			} else {
				t6machinelearning.loadLayersModel(`file:///${path}/model.json`, t6Model)
				.then((tfModel) => {
					tfModel.summary();
					//inputData.map((m) => m.flow_id=t6Model.flow_ids.indexOf(m.flow_id));
					inputData.map((m) => {
						let category_id = (m.meta!==null && typeof m.meta!=="undefined" && typeof m.meta.categories!=="undefined") ? (m.meta.categories[0]) : null;
						m.label = (category_id!==null && typeof category_id!=="undefined" && category_id!=="") ? categories.findOne({ id: category_id }).name : 0;
						if (t6Model.normalize === true && m.flow_id) {
							const min = t6Model.min[m.flow_id];
							const max = t6Model.max[m.flow_id];
							t6console.debug("inputData value before normalize", min, "<=", m.value, "<=", max);
							m.value = normalize(parseFloat(m.value), min, max);
							t6console.debug("inputData value after normalize", m.value);
						}
						return m;
					});
					//t6console.debug("inputData 2", inputData);
					/*
					if (t6Model.continuous_features?.length > 0) {
						t6Model.continuous_features.map((cName) => {
							t6Model.flow_ids.map((f_id) => {
								t6machinelearning.addContinuous(cName, f_id, t6Model.min[f_id], t6Model.max[f_id]);
							})
						});
					}
					if (t6Model.categorical_features?.length > 0) {
						t6Model.categorical_features.map((cName) => {
							let cClasses = (t6Model.categorical_features_classes.filter((f) => f.name===cName)).map((m) => m.values)[0];
							cClasses = (Array.isArray(cClasses)===true)?cClasses:[];
							if(cName === "flow_id") {
								t6machinelearning.addCategorical(cName, t6Model.flow_ids);
							} else {
								t6machinelearning.addCategorical(cName, cClasses);
							}
						});
					}
					*/
					const dataMap = new Map();
					inputData.map((datapoint) => {
						const time = parseInt(moment(typeof datapoint.time!=="undefined"?datapoint:datapoint.timestamp).format("x"), 10);
						if (!dataMap.has(time)) {
							dataMap.set(time, { values: [], labels: [], flow_ids: [] });
						}
						datapoint.meta			= (typeof datapoint.meta!=="undefined" && datapoint.meta!==null)?getJson(datapoint.meta):{ categories: ["oov"] };
						const category_id		= datapoint.meta.categories[0];
						const category			= categories.findOne({id: category_id});
						const labelName			= category?category.name:"oov";
						const oneHotEncodedLbl	= oneHotEncode(t6Model.labels.indexOf(labelName), t6Model.labels);

						dataMap.get(time).values.push(parseInt(datapoint.value));
						dataMap.get(time).labels.push(oneHotEncodedLbl);
						if(t6Model.flow_ids.length>1) {
							const oneHotEncodedFid	= oneHotEncode(t6Model.flow_ids.indexOf(datapoint.flow_id), t6Model.flow_ids);
							dataMap.get(time).flow_ids.push(oneHotEncodedFid);
						} else {
							dataMap.get(time).flow_ids.push([t6Model.flow_ids.indexOf(datapoint.flow_id)]);
						}
						//t6console.debug("dataMap values.push", parseInt(datapoint.value));
						//t6console.log("LABEL:", datapoint.label);
					});
					/*
					dataMap.forEach((d) => {
						t6console.debug("values:", d.values);
						t6console.debug("labels:", d.labels);
						t6console.debug("flow_ids:", d.flow_ids);
					});
					*/
					t6machinelearning.loadDataSets_v2(dataMap, t6Model)
					.then((dataset) => {
						const valuesTensor	= dataset.valuesTensor;
						const flowsTensor	= dataset.flowsTensor;
						const labelsTensor	= dataset.labelsTensor;
						const inputTensor	= dataset.inputTensor;
						const featuresTensor= dataset.featuresTensor;
						const inputShape	= [1, inputTensor.shape[1]];
						//const outputShape = [1, valuesTensor.shape[1]];
						const outputShape	= labelsTensor.shape[1];
						
						const totalSize						= inputTensor.shape[0];
						const trainSize						= Math.floor(totalSize * (1 - t6Model.validation_split));
						const evaluateSize					= totalSize - trainSize;
						const batchSize						= valuesTensor.shape[0]; // Get the number of data points
						const numFeatures					= inputTensor.shape[1]; // Get the number of features
						const timeSteps						= 1; // Assuming each data point represents a single time step
						const reshapedInput					= inputTensor.reshape([totalSize, timeSteps, numFeatures]);
						t6console.debug("ML MODEL LOADED with inputShape", inputShape);
						t6console.debug("ML MODEL LOADED with outputShape", outputShape);
						t6console.debug("ML MODEL LOADED with t6Model.validation_split", t6Model.validation_split);
						t6console.debug("ML DATASET totalSize", totalSize);
						t6console.debug("ML DATASET evaluateSize", evaluateSize);
						t6console.debug("ML DATASET trainSize", trainSize);
						t6console.debug("ML DATASET batchSize", batchSize);
						t6console.debug("ML DATASET timeSteps", timeSteps);
						t6console.debug("ML DATASET numFeatures", numFeatures);
						
						options.epochs			= t6Model.epochs;
						t6machinelearning.predict(tfModel, reshapedInput).then((prediction) => {
							let p = [];
							let arr = Array.from(prediction.dataSync()); // TODO: multiple predictions ?
							arr.map((score, i) => {
								t6console.error("Model predict LABEL:", (t6Model.labels)[i], score.toFixed(4));
								p.push({ label: (t6Model.labels)[i], prediction: parseFloat(score.toFixed(4)) });
							});
							//t6console.debug("prediction", prediction, arr);
							const bestMatchPrediction = Math.max(...arr);
							const bestMatchIndex = arr.indexOf(bestMatchPrediction);
							res.status(200).send({ "code": 200, value: inputData[0].value, labels: t6Model.labels, predictions: p, bestMatchIndex: bestMatchIndex, bestMatchPrediction: parseFloat(bestMatchPrediction.toFixed(4)), bestMatchLabel: (t6Model.labels)[bestMatchIndex] }); // TODO: missing serializer
							t6events.addStat("t6App", "ML Prediction", user_id, user_id, {"user_id": user_id, "model_path": path+t6Model.id});
						}).catch(function(err) {
							t6console.error("Model predict ERROR", err);
						});
					})
					.catch((error) => {
						t6console.error("Model predict ERROR", error);
						res.status(412).send(new ErrorSerializer({ "id": 14187, "code": 412, "message": "Precondition Failed", error: error }).serialize());
					});
				});
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 14272, "code": 401, "message": "Forbidden"}).serialize());
		}
	}
});

/**
 * @api {post} /models/:model_id/train Train a Model
 * @apiName Train a Model
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} model_id The model Id you'd like to edit
 * @apiQuery {boolean} [force=false] Force parameter used when a training is already ongoing
 * 
 * @apiUse 202
 * @apiUse 401
 * @apiUse 404
 * @apiUse 409
 * @apiUse 412
 */
router.post("/:model_id([0-9a-z\-]+)/train/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let model_id = req.params.model_id;
	let user_id = req.user.id;
	if ( model_id ) {
		let query = {
			"$and": [
					{ "id": model_id },
					{ "user_id": user_id },
				]
			};
		let t6Model = models.findOne( query );
		let limit = t6Model.datasets.training.limit;
		let validation_split = typeof t6Model.validation_split!=="undefined"?t6Model.validation_split:60;
		let offset = 0;
		if (str2bool(req.query.force)!==true && t6Model.current_status==="TRAINING") {
			res.status(409).send(new ErrorSerializer({"id": 14056, "code": 409, "message": "Conflict, Training already in progress. Please use force query parameter to start a new training or wait."}).serialize());
			return;
		}
		if (t6Model.datasets.training.limit <= t6Model.batch_size) {
			res.status(412).send(new ErrorSerializer({"id": 14057, "code": 412, "message": "Precondition Failed: batch size must be less than the training length"}).serialize());
			return;
		}
		// get data from each flows
		t6Model.current_status = "TRAINING";
		t6Model.current_status_last_update	= moment().format(logDateFormat);
		let queryTs = [];
		t6Model.flow_ids.map(async (flow_id) => {
			let flow = flows.findOne({id: flow_id});
			let retention = flow?.retention;
			let rp = typeof retention!=="undefined"?retention:"autogen";
			if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
				if ( typeof flow!=="undefined" && flow.retention ) {
					if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
						rp = flow.retention;
					} else {
						rp = influxSettings.retentionPolicies.data[0];
						//t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
						res.status(412).send(new ErrorSerializer({"id": 14057, "code": 412, "message": "Precondition Failed"}).serialize());
						return;
					}
				} else {
					rp = influxSettings.retentionPolicies.data[0];
					//t6console.debug("Defaulting Retention from setting (retention parameter is invalid)", retention, rp);
				}
			}
			let fieldvalue = getFieldsFromDatatype(datatypes.findOne({id: flow.data_type}).name, false, false);
			let andDates = "";
			let sorting = "ORDER BY time DESC";
			if( t6Model.datasets.training.start!==null && t6Model.datasets.training.start!=="" ) {
				andDates += `AND time>='${moment(t6Model.datasets.training.start).toISOString()}' `;
				sorting = "ORDER BY time ASC";
			}
			if( t6Model.datasets.training.end!==null && t6Model.datasets.training.end!=="" ) {
				andDates += `AND time<='${moment(t6Model.datasets.training.end).toISOString()}' `;
			}
			t6Model.strategy = typeof t6Model.strategy!=="undefined"?t6Model.strategy:"classification";
			let window = Math.round((flow.time_to_live!==undefined && flow.time_to_live!==null)?flow.time_to_live/60:60);
			let where = "";
			let gp_time = `GROUP BY time(${typeof t6Model.window_time_frame!=="undefined"?t6Model.window_time_frame:"60m"}) fill(previous)`;
			let lim = limit!==null?`LIMIT ${limit} OFFSET ${offset}`:"";
			if(flow.time_to_live!==null) {
				queryTs.push(`SELECT time, LAST(${fieldvalue}) as value, LAST(meta) as meta FROM ${rp}.data WHERE ${where} user_id='${req.user.id}' ${andDates} AND flow_id='${flow_id}' ${gp_time} ${lim}`);
			} else {
				queryTs.push(`SELECT time, ${fieldvalue} as value, meta as meta FROM ${rp}.data WHERE ${where} user_id='${req.user.id}' ${andDates} AND flow_id='${flow_id}' ${lim}`);
			}
		});
		t6console.log("queryTs:", queryTs);
		executeAllQueries(queryTs)
		.then((flowData) => {
			// Calculate min and max values for each flow specified in queryTs
			const minMaxValues = queryTs.map((query, index) => {
				const d = flowData[index];
				const min = Math.min(...d.map((m) => m.value));
				const max = Math.max(...d.map((m) => m.value));
				let f_id = t6Model.flow_ids[index]; // Assume the indexes are the sames.. Might be buggy if influxDb return no data on a specific flow
				t6Model.min[f_id] = min;
				t6Model.max[f_id] = max;
				return {
					query: query,
					flow_id: f_id,
					min: min,
					max: max
				};
			});
			//t6console.log("Min and max values for each flow from queryTs:", minMaxValues);
			let classCounts = {};
			flowData.map((row, i) => {
				const f_id = t6Model.flow_ids[i];
				row.map((datapoint) => {
					datapoint.meta			= (typeof datapoint.meta!=="undefined" && datapoint.meta!==null)?getJson(datapoint.meta):{ categories: ["oov"] };
					const category_id		= datapoint.meta.categories[0];
					const category			= categories.findOne({id: category_id});
					const labelName			= category?category.name:"oov";
					const oneHotEncodedLbl	= oneHotEncode(t6Model.labels.indexOf(labelName), t6Model.labels);
					datapoint.label			= oneHotEncodedLbl;
					if (t6Model.normalize) {
						let normalizedValue;
						normalizedValue = normalize(datapoint.value, t6Model.min[f_id], t6Model.max[f_id]);
						//t6console.debug("TRAINING: dataMap normalize value", datapoint.value, f_id, t6Model.min[f_id], t6Model.max[f_id], normalizedValue);
						datapoint.value			= !isNaN(normalizedValue)?normalizedValue:datapoint.value;
					} else {
						datapoint.value			= datapoint.value;
					}
					if(t6Model.flow_ids.length>1) {
						const oneHotEncodedFid	= oneHotEncode(t6Model.flow_ids.indexOf(f_id), t6Model.flow_ids);
						datapoint.flow_id		= oneHotEncodedFid;
					} else {
						datapoint.flow_id		= [t6Model.flow_ids.indexOf(f_id)];
					}
					if (labelName!=="oov") {
						// Do not count oov, because it it used as minorityClass
						classCounts[labelName] = typeof classCounts[labelName]==="undefined"?0:classCounts[labelName]+1;
					}
					//t6console.debug("TRAINING: oneHotEncodedLbl", labelName, t6Model.labels.indexOf(labelName), oneHotEncodedLbl);
					//t6console.debug("TRAINING: oneHotEncodedFid", t6Model.flow_ids.indexOf(f_id), datapoint.flow_id);
				});
			});
			const minorityClass = Math.min(...Object.entries(classCounts).map((cls) => cls[1]));
	
			// Flattening all Flows datapoints together
			const flattenedData = flowData.flat();
			flattenedData.sort((a, b) => new Date(a.time) - new Date(b.time));

			const dataMap = new Map();
			let balancedDatapointsCount = {};
			flattenedData.map((datapoint) => {
				const time = parseInt(moment(datapoint.time).format("x"), 10);
				balancedDatapointsCount[datapoint.label] = typeof balancedDatapointsCount[datapoint.label]!=="undefined"?balancedDatapointsCount[datapoint.label]:0;
				// Balance dataset : based on the minorityClass !!! // TODO
				if( balancedDatapointsCount[datapoint.label]<minorityClass ) {
					if (!dataMap.has(time)) {
						dataMap.set(time, { values: [], labels: [], flow_ids: [] });
					}
					dataMap.get(time).values.push(datapoint.value);
					dataMap.get(time).labels.push(datapoint.label);
					dataMap.get(time).flow_ids.push(datapoint.flow_id);
				}
				balancedDatapointsCount[datapoint.label]++;
			});

			t6Model.balancedDatapointsCount	= balancedDatapointsCount;
			t6Model.minorityClass			= minorityClass;
			t6Model.training_balance		= t6Model.labels.map((labelName) => { return balancedDatapointsCount[oneHotEncode(t6Model.labels.indexOf(labelName), t6Model.labels)] });
			t6Model.data_length				= [...dataMap.entries()].length;

			t6console.debug("flattenedData length", flattenedData.length);
			t6console.debug("dataMap entries length", t6Model.data_length);
			t6console.debug("dataMap keys length", [...dataMap.keys()].length);
			t6console.debug("dataMap values length", [...dataMap.values()].length);
			t6console.debug("balancedDatapointsCount", balancedDatapointsCount);

			//t6console.debug([...dataMap.entries()]);
			//t6console.debug([...dataMap.keys()]);
			//t6console.debug([...dataMap.values()]);
			t6machinelearning.loadDataSets_v2(dataMap, t6Model)
			.then((dataset) => {
				let valuesTensor	= dataset.valuesTensor;
				let flowsTensor	= dataset.flowsTensor;
				let labelsTensor	= dataset.labelsTensor;
				let inputTensor	= dataset.inputTensor;
				let featuresTensor= dataset.featuresTensor;
				let inputShape	= [1, inputTensor.shape[1]];
				//let outputShape = [1, valuesTensor.shape[1]];
				let outputShape	= labelsTensor.shape[1];
				t6machinelearning.buildModel(inputShape, outputShape)
				.then((tfModel) => {
					tfModel.summary();
					options.epochs = t6Model.epochs;
					const totalSize						= inputTensor.shape[0];
					const trainSize						= Math.floor(totalSize * (1 - t6Model.validation_split));
					const evaluateSize					= totalSize - trainSize;
					const batchSize						= valuesTensor.shape[0]; // Get the number of data points
					const numFeatures					= inputTensor.shape[1]; // Get the number of features
					const timeSteps						= 1; // TODO
					const reshapedInput					= inputTensor.reshape([totalSize, timeSteps, numFeatures]);
					const reshapedLabels				= labelsTensor.reshape([totalSize, timeSteps, labelsTensor.shape[1]]);
					const [inputXTrain, inputXEvaluate]	= tf.split(reshapedInput, [trainSize, evaluateSize]);
					const [inputLabelsTrain, inputLabelsEvaluate]	= tf.split(reshapedLabels, [trainSize, evaluateSize]);
					t6console.debug("ML MODEL BUILT with inputShape", inputShape);
					t6console.debug("ML MODEL BUILT with outputShape", outputShape);
					t6console.debug("ML MODEL BUILT with t6Model.validation_split", t6Model.validation_split);
					t6console.debug("ML DATASET totalSize", totalSize);
					t6console.debug("ML DATASET evaluateSize", evaluateSize);
					t6console.debug("ML DATASET trainSize", trainSize);
					t6console.debug("ML DATASET batchSize", batchSize);
					t6console.debug("ML DATASET timeSteps", timeSteps);
					t6console.debug("ML DATASET numFeatures", numFeatures);

					t6machinelearning.trainModel(tfModel, inputXTrain, inputLabelsTrain, options)
					.then((trained) => {
						t6console.debug("ML TRAINED");
						t6Model.history.training = {
							loss	: trained.history.loss,
							accuracy: trained.history.acc
						};
						if(evaluateSize>0) {
							t6machinelearning.evaluateModel(tfModel, inputXEvaluate, inputLabelsEvaluate)
							.then((evaluate) => {
								t6Model.history.evaluation = {
									loss	: evaluate.loss,
									accuracy: evaluate.accuracy
								};
								//t6console.debug("trained: loss", t6Model.history.training.loss);
								//t6console.debug("trained: accuracy", t6Model.history.training.accuracy);
								//t6console.debug("evaluate: loss", t6Model.history.evaluation.loss);
								//t6console.debug("evaluate: accuracy", t6Model.history.evaluation.accuracy);
								let user = users.findOne({"id": req.user.id });
								if (user && typeof user.pushSubscription !== "undefined" ) {
									let payload = `{"type": "message", "title": "Model is trained", "body": "- Features[Con]: ${t6Model.continuous_features?.length}\\n- Features[Cat]: ${t6Model.categorical_features?.length}\\n- Label(s): ${t6Model.labels?.length}\\n- Flow(s): ${t6Model.flow_ids?.length}\\n- Total dataset: ${totalSize}\\n- Train dataset: ${trainSize} (${(1-t6Model.validation_split)*100}%)\\n- Balance limit *: ${t6Model.minorityClass}\\n- Evaluate dataset *: ${evaluateSize} (${t6Model.validation_split*100}%)\\n- Evaluate loss: ${evaluate.loss}\\n- Evaluate accuracy: ${evaluate.accuracy}", "icon": null, "vibrate":[200, 100, 200, 100, 200, 100, 200]}`;
									let result = t6notifications.sendPush(user, payload);
									if(result && typeof result.statusCode!=="undefined" && (result.statusCode === 404 || result.statusCode === 410)) {
										t6console.debug("pushSubscription", pushSubscription);
										t6console.debug("Can't sendPush because of a status code Error", result.statusCode);
										users.chain().find({ "id": user.id }).update(function(u) {
											u.pushSubscription = {};
											db_users.save();
										});
										t6console.debug("pushSubscription is now disabled on User", error);
									}
								}
								const path = `${mlModels.models_user_dir}/${user.id}/`;
								if (!fs.existsSync(path)) { fs.mkdirSync(path); }
								t6console.debug("Model saving to", path+t6Model.id);
								t6events.addStat("t6App", "ML Trained Model saved", user_id, user_id, {"user_id": user_id, "model_path": path+t6Model.id});
								t6machinelearning.save(tfModel, `file://${path}${t6Model.id}`).then((saved) => {
									t6console.debug("Model saved", saved);
									t6Model.current_status = "TRAINED";
									t6Model.current_status_last_update	= moment().format(logDateFormat);
									db_models.save(); // saving the status
								});
							});
						} else {
							t6console.debug("Missing Validating data", evaluateSize);
						}
					});
				})
				.catch((error) => {
					t6console.error("ML Error:", error);
				});
				//res.status(200).send(result);
				// TODO : END Training Here
			}); // END loadDataSets_v2
			// TODO : loadDataSets_v2 is not using tidy ... so we should dispose tensors
		})
		.then(() => {
			t6Model.process						= "asynchroneous";
			t6Model.notification				= "push-notification";
			t6Model.history				= {};
			res.status(202).send(new ModelSerializer(t6Model).serialize());
			db_models.save(); // saving the status
		})
		.catch((error) => {
			t6console.error('Error fetching data:', error);
			res.status(404).send(new ErrorSerializer({"id": 14272, "code": 404, "message": "Not Found"}).serialize());
		});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 14271, "code": 404, "message": "Not Found"}).serialize());
	}
});

/**
 * @api {post} /models/:model_id/upload Upload a custom Model
 * @apiName Upload a custom Model
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [model_id] The model Id you'd like to edit
 * 
 * @apiUse 404
 */
let upload = multer({ dest: "/tmp/" });
router.post("/:model_id([0-9a-z\-]+)/upload/?", upload.array("files[]", 10), expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let model_id = req.params.model_id;
	let user_id = req.user.id;
	if (model_id) {
		let modelFiles = req.files;
		t6console.log("modelFiles", modelFiles);
		modelFiles.map((f) => {
			t6console.log("f", f);
			let is = fs.createReadStream(f.path);
			let os = fs.createWriteStream(`tmp/models/${user_id}/${model_id}/${f.originalname}`);
			is.pipe(os);
			is.on("end",function() {
				fs.unlinkSync(f.path);
			});
		});
		res.status(200).send({ "code": 200, }); // TODO: missing serializer
	} else {
		res.status(404).send(new ErrorSerializer({ "id": 14271, "code": 404, "message": "Not Found" }).serialize());
	}
});

/**
 * @api {get} /models/:model_id/explain/training Explain a Trained Model with a graph
 * @apiName Explain a Trained Model with a graph
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [model_id] The model Id you'd like to graph training
 * @apiQuery {Integer} [width] output width of SVG chart
 * @apiQuery {Integer} [height] output height of SVG chart
 * @apiQuery {Integer} [margin] margin on SVG chart
 * 
 * @apiSuccess {Svg} Svg image file
 * 
 * @apiUse 200
 * @apiUse 401
 * @apiUse 412
 */
router.get("/:model_id([0-9a-z\-]+)/explain/training?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let model_id = req.params.model_id;
	let width = typeof parseInt(req.query.width, 10)!=="undefined"?parseInt(req.query.width, 10):500;
	let height = typeof parseInt(req.query.height, 10)!=="undefined"?parseInt(req.query.height, 10):200;
	let margin = typeof parseInt(req.query.margin, 10)!=="undefined"?parseInt(req.query.margin, 10):20;
	let user_id = req.user.id;
	let inputData = Array.isArray(req.body)===false?[req.body]:req.body;
	if (!req.body || !inputData) {
		return res.status(412).send(new ErrorSerializer({ "id": 14186, "code": 412, "message": "Precondition Failed" }).serialize());
	}
	if (model_id) {
		let query = {
			"$and": [
					{ "id": model_id },
					{ "user_id": req.user.id },
				]
			};
		let t6Model = models.findOne( query );
		if ( t6Model ) {
			if (t6Model.current_status!=="TRAINED") {
				res.status(412).send(new ErrorSerializer({"id": 14187, "code": 412, "message": "Model not yet trained: Precondition Failed"}).serialize());
			} else {
				const d3nInstance = new D3Node();
				let svg = d3nInstance.createSVG(width, height);
				const epochs = [...t6Model.history.training.accuracy.map((a, i) => { return i; })]; // TODO : should be a simplier way
				const accuracy = t6Model.history.training.accuracy;
				const loss = t6Model.history.training.loss;
				const minAcc = Math.min(...t6Model.history.training.accuracy.map((a) => a));
				const maxAcc = Math.max(...t6Model.history.training.accuracy.map((a) => a));
				const minLoss = Math.min(...t6Model.history.training.loss.map((l) => l));
				const maxLoss = Math.max(...t6Model.history.training.loss.map((l) => l));

				// Create scales for x and y axes
				const xScale = d3nInstance.d3.scaleLinear().domain([0, epochs.length - 1]).range([margin, width-margin]);
				const yAccuracyScale = d3nInstance.d3.scaleLinear().domain([minAcc, maxAcc]).range([height-margin, margin]);
				const yLossScale = d3nInstance.d3.scaleLinear().domain([minLoss, maxLoss]).range([height-margin, margin]);

				// Create line generators for accuracy and loss
				const accuracyLine = d3nInstance.d3.line().x((d, i) => xScale(epochs[i])).y(d => yAccuracyScale(d));
				const lossLine = d3nInstance.d3.line().x((d, i) => xScale(epochs[i])).y(d => yLossScale(d));

				// Append accuracy line to the SVG
				svg.append('path').datum(accuracy).attr('fill', 'none').attr('stroke', 'blue').attr('stroke-width', 2).attr('d', accuracyLine);

				// Append loss line to the SVG
				svg.append('path').datum(loss).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 2).attr('d', lossLine);

				// Add x-axis
				svg.append('g').attr('transform', `translate(0, ${height - margin})`).call(d3nInstance.d3.axisBottom(xScale));

				// Add y-axis for Accuracy
				svg.append('g')
					.attr('transform', `translate(${margin}, 0)`)
					.call(d3nInstance.d3.axisLeft(yAccuracyScale))
					.append('text')
					.attr('fill', '#000')
					.attr('transform', 'rotate(-90)')
					.attr('y', 10)
					.attr('dy', '0em')
					.attr('text-anchor', 'end')
					.text('Accuracy');

				// Add y-axis for Loss
				svg.append('g')
					.attr('transform', `translate(${width - margin}, 0)`)
					.call(d3nInstance.d3.axisRight(yLossScale))
					.append('text')
					.attr('fill', '#000')
					.attr('transform', 'rotate(-90)')
					.attr('y', 20)
					.attr('dy', '0em')
					.attr('text-anchor', 'end')
					.text('Loss');

				// Add legend for accuracy
				svg.append('rect')
					.attr('x', margin)
					.attr('y',  height-(margin/2))
					.attr('width', 10)
					.attr('height',  10)
					.attr('fill', 'blue');
				svg.append('text')
					.attr('x', margin+15)
					.attr('y', height-15)
					.text('Accuracy');

				// Add legend for loss
				svg.append('rect')
					.attr('x', (width/2) - 45)
					.attr('y',  height-(margin/2))
					.attr('width', 10)
					.attr('height', 10)
					.attr('fill', 'red');
				svg.append('text')
					.attr('x', (width/2) - 30)
					.attr('y', height-15)
					.text('Loss');

					res.setHeader("content-type", "image/svg+xml");
				res.status(200).send(d3nInstance.svgString());
			}
		} else {
			res.status(401).send(new ErrorSerializer({"id": 14273, "code": 401, "message": "Forbidden"}).serialize());
		}
	} else {
		return res.status(412).send(new ErrorSerializer({ "id": 14188, "code": 412, "message": "Precondition Failed" }).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
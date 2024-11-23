"use strict";
var express = require("express");
var router = express.Router();
var ModelSerializer = require("../serializers/model");
var ErrorSerializer = require("../serializers/error");
const { exists } = require("fs-extra");
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
	t6console.debug("executeQuery", query);
	const results = await dbInfluxDB.query(query);
	return results;
};
const executeAllQueries = async (queries) => {
	return await Promise.all(queries.map((query) => executeQuery(query)));
};
const getQueries = async (user_id, flows, t6Model) => {
	return new Promise(async (resolve, reject) => {
		try {
			let queryTs = [];
			const results = await Promise.all(
				t6Model.flow_ids.map((flow_id) => {
					let flow = flows.findOne({id: flow_id});
					if( !flow ) {
						// t6console.debug("Promise.all flow NOK: ", flow_id, flow);
						throw new Error({"id": 1405777, "code": 412, "message": "Precondition Failed"});
					}
					let limit		= typeof t6Model.datasets.training.limit!=="undefined"?t6Model.datasets.training.limit:100;
					// t6console.debug("inside Promise.all flow.flow_id: ", flow.id);
					// t6console.debug("inside Promise.all limit: ", limit);
					let offset		= 0;
					let retention	= flow?.retention;
					let rp			= typeof retention!=="undefined"?retention:"autogen";
					if( typeof retention==="undefined" || (influxSettings.retentionPolicies.data).indexOf(retention)===-1 ) {
						if ( typeof flow!=="undefined" && flow.retention ) {
							if ( (influxSettings.retentionPolicies.data).indexOf(flow.retention)>-1 ) {
								rp = flow.retention;
							} else {
								rp = influxSettings.retentionPolicies.data[0];
								//t6console.debug("Defaulting Retention from setting (flow.retention is invalid)", flow.retention, rp);
								throw new Error({"id": 1405778, "code": 412, "message": "Precondition Failed"});
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
					let window		= "";
					let where		= "";
					let gp_time		= "";
					let lim			= "";
					let selectors	= "";
					let curr_q		= "";
					lim = limit!==null?`LIMIT ${limit} OFFSET ${offset}`:"";
					if(typeof t6Model.window_time_frame!=="undefined") {
						window = Math.round((flow.time_to_live!==undefined && flow.time_to_live!==null)?flow.time_to_live/60:60);
						gp_time = `GROUP BY time(${typeof t6Model.window_time_frame!=="undefined"?t6Model.window_time_frame:`${window}m`}) fill(previous)`;
						selectors = `time, LAST(${fieldvalue}) as value, LAST(meta) as meta`;
					} else {
						selectors = `time, ${fieldvalue} as value, meta as meta`;
					}
					if(flow.time_to_live!==null) {
						curr_q = `SELECT ${selectors} FROM ${rp}.data WHERE ${where} user_id='${user_id}' ${andDates} AND flow_id='${flow_id}' ${gp_time} ${lim}`;
						// queryTs.push(curr_q);
					} else {
						curr_q = `SELECT ${selectors} FROM ${rp}.data WHERE ${where} user_id='${user_id}' ${andDates} AND flow_id='${flow_id}' ${lim}`;
						// queryTs.push(curr_q);
					}
					return curr_q;
					//return queryTs;
				})
			);
			resolve(results);
		} catch (error) {
			t6console.log("Precondition Failed, Error executing getQueries", error);
			throw new Error({"id": 1405779, "code": 412, "message": "Precondition Failed, Error executing getQueries", error});
		}
	});
};
const normalize = (inputData, min, max) => {
	return typeof inputData!=="undefined"?(parseFloat(inputData) - min)/(max - min):0;
};
const oneHotEncode = (classIndex, classes) => {
	return classes.length>=2?Array.from(tf.oneHot(classIndex, classes.length).dataSync()):0; // TODO: 0 ?? oov ??
};
const findNearestDatapoints = (timestamp, dataArrays) => {
	let closestValues		= [];
	let closestFlows		= [];
	let closestLabels		= [];
	for (let dataArray of dataArrays) {
		let closestValue	= null;
		let closestFlow		= null;
		let closestLabel	= null;
		let minTimeDifference = Infinity;
		for (let datapoint of dataArray) {
			const timeDifference = Math.abs(timestamp - datapoint.time);
			if (timeDifference < minTimeDifference) {
				closestValue		= datapoint.value;
				closestFlow			= datapoint.flow_id;
				closestLabel		= datapoint.label;	// TODO : Labels should not comes from multiple flows ?
				minTimeDifference	= timeDifference;
			}
		}
		closestValues.push(closestValue);
		closestFlows.push(closestFlow);
		closestLabels.push(closestLabel);
	}
	return {closestValues, closestFlows, closestLabels};
};
function preprocessInputData(rows, t6Model) {
	let mergedRows = [];
	const flowData = [];
	let balancedDatapointsCount = {};
	let classCounts = {};
	for(let index=0; index<Object.keys(rows).length; index++) {
		let rowArray = Object.values(rows)[index];
		let flowId = t6Model.flow_ids[index];
		const currTime = new Date();
		const updatedRows = rowArray.map((datapoint) => {
			datapoint.flow_id		= t6Model.flow_ids.length>1?oneHotEncode(index, t6Model.flow_ids):t6Model.flow_ids.indexOf(flowId);
			datapoint.time			= moment( typeof datapoint.time!=="undefined"?datapoint.time:(typeof datapoint.timestamp!=="undefined"?datapoint.timestamp:currTime), ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", "DD.MM.YYYY", "DD.MM.YYYY HH:mm:ss", "x", "X"], true).format("x");
			datapoint.meta			= (typeof datapoint.meta!=="undefined" && datapoint.meta!==null)?getJson(datapoint.meta):{ categories: ["oov"] };
			const category_id		= datapoint.meta.categories[0];
			const category			= categories.findOne({id: category_id});
			const labelName			= category?category.name:"oov";
			const oneHotEncodedLbl	= oneHotEncode(t6Model.labels.indexOf(labelName), t6Model.labels);
			datapoint.label			= oneHotEncodedLbl;
			if(t6Model.normalize===true) {
				datapoint.initialValue	= datapoint.value;
				datapoint.value	= normalize(datapoint.value, t6Model.min[flowId], t6Model.max[flowId]);
				// t6console.debug("Normalized to", datapoint.value);
			}
			balancedDatapointsCount[datapoint.label] = typeof balancedDatapointsCount[datapoint.label]!=="undefined"?balancedDatapointsCount[datapoint.label]+1:1;
			if (labelName!=="oov") {
				// Do not count oov, because it is used as minorityClass
				classCounts[labelName] = typeof classCounts[labelName]!=="undefined"?classCounts[labelName]+1:1;
			}
			return datapoint;
		});
		mergedRows.push(updatedRows);// Add the updated rows to the mergedRows array
		flowData[flowId] = mergedRows[index];
	}
	const minorityClass = Math.min(...Object.entries(classCounts).map((cls) => cls[1]));
	t6Model.minorityClass			= minorityClass;
	t6Model.balancedDatapointsCount	= balancedDatapointsCount;
	t6Model.training_balance		= t6Model.labels.map((labelName) => { return balancedDatapointsCount[oneHotEncode(t6Model.labels.indexOf(labelName), t6Model.labels)] });
	return {mergedRows, flowData, balancedDatapointsCount, minorityClass, training_balance: t6Model.training_balance};
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
 * @apiBody {String} [window_time_frame] Window Time Frame, this parameter will fill datapoints according to time_frame
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
 * @apiBody {Object[]} layers Layers are the primary building block for constructing a Model. Each layer will typically perform some computation to transform its input to its output. Layers will automatically take care of creating and initializing the various internal variables/weights they need to function.
 * @apiBody {String=input,hidden,output} layers.type 
 * @apiBody {String=dense,dropout} layers.mode=dense 
 * @apiBody {Integer} layers.units=1 
 * @apiBody {String="elu" "hardSigmoid" "linear" "relu" "relu6" "selu" "sigmoid" "softmax" "softplus" "softsign" "tanh" "swish" "mish"} layers.activation Activation is the element-wise activation function passed as the activation argument.
 * @apiBody {Number} layers.rate=0.2 Float between 0 and 1. Fraction of the input units to drop.
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
					item.window_time_frame	= req.body.window_time_frame!==null?req.body.window_time_frame:item.window_time_frame;
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
 * @apiBody {String} [window_time_frame] Window Time Frame, this parameter will fill datapoints according to time_frame
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
 * @apiBody {Object[]} layers Layers are the primary building block for constructing a Model. Each layer will typically perform some computation to transform its input to its output. Layers will automatically take care of creating and initializing the various internal variables/weights they need to function.
 * @apiBody {String=input,hidden,output} layers.type 
 * @apiBody {String=dense,dropout} layers.mode=dense 
 * @apiBody {Integer} layers.units=1 
 * @apiBody {String="elu" "hardSigmoid" "linear" "relu" "relu6" "selu" "sigmoid" "softmax" "softplus" "softsign" "tanh" "swish" "mish"} layers.activation Activation is the element-wise activation function passed as the activation argument.
 * @apiBody {Number} layers.rate=0.2 Float between 0 and 1. Fraction of the input units to drop.
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
		res.status(429).send(new ErrorSerializer({"id": 14329, "code": 429, "message": "Too Many Requests"}).serialize());
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
				window_time_frame:	req.body.window_time_frame,
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
 * @api {get} /models/:model_id/predict Predict using a Model
 * @apiName Predict using a Model
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiParam {uuid-v4} [model_id] The model Id you'd like to use for prediction
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
			if (t6Model.current_status!=="TRAINED") {
				return res.status(412).send(new ErrorSerializer({ "id": 14186, "code": 412, "message": "Precondition Failed" }).serialize());
			} else {
				const path = `${mlModels.models_user_dir}/${req.user.id}/${t6Model.id}`;
				if (!fs.existsSync(path)) {
					res.status(412).send(new ErrorSerializer({"id": 14187, "code": 412, "message": "Model not yet trained: Precondition Failed"}).serialize());
				} else {
					t6machinelearning.loadLayersModel(`file:///${path}/model.json`, t6Model).then((tfModel) => {
						tfModel.summary();

						let predictData = [];
						t6Model.flow_ids.map((flow_id) => {
							predictData[flow_id] = [];
						});
						inputData.map((point) => {
							t6console.debug("pushing point ---->", point.flow_id);
							t6console.debug((predictData[point.flow_id]).length);
							(predictData[point.flow_id]).push(point);
						});

						let {mergedRows, flowData, balancedDatapointsCount, minorityClass, training_balance} = preprocessInputData(predictData, t6Model);
						const dataMap = new Map();
						const currTime = new Date();

						mergedRows[0].map((r) => {
							const date = moment( typeof r.time!=="undefined"?r.time:(typeof r.timestamp!=="undefined"?r.timestamp:currTime), ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", "DD.MM.YYYY", "DD.MM.YYYY HH:mm:ss", "x", "X"], true).format("x");
							// t6console.debug("Date from array", date, Object.values(flowData));
							const {closestValues, closestFlows, closestLabels} = findNearestDatapoints(date, Object.values(flowData));
							dataMap.set(date, { values: closestValues, flow_ids: closestFlows, labels: closestLabels });
						});
						t6Model.data_length = [...dataMap.entries()].length;
						t6Model.training_balance = training_balance;

						t6Model.predictionInProgress = true;
						t6machinelearning.loadDataSets_v2(dataMap, t6Model).then((dataset) => {
							let numFeatures;
							let inputShape;
							let valuesTensor	= dataset.valuesTensor;
							let flowsTensor		= dataset.flowsTensor;
							let labelsTensor	= dataset.labelsTensor;
							let inputTensor		= dataset.inputTensor;
							let featuresTensor	= dataset.featuresTensor;
							const timeSteps		= 1; // TODO
							const totalSize		= inputTensor.shape[0]; // Get the number of data points
							const batchSize		= inputTensor.shape[0];
							const trainSize		= Math.floor(totalSize * (1 - t6Model.validation_split));
							const evaluateSize	= totalSize - trainSize;

							numFeatures			= inputTensor.shape[1]; // Get the number of features
							inputShape			= numFeatures;

							// inputTensor = inputTensor.reshape([1, 1, numFeatures]); // BUG : activate this reshape when RNN
							//const reshapedInput								= inputTensor.reshape([batchSize, numFeatures]);		// BUG : activate this reshape when no RNN

							t6console.debug("ML MODEL BUILDING with inputTensor.shape", inputTensor.shape);
							t6console.debug("ML MODEL BUILDING with inputShape", inputShape);
							t6machinelearning.predict(tfModel, inputTensor).then((prediction) => {
								let p = [];
								let arr = Array.from(prediction.dataSync()); // TODO: multiple predictions ?
								arr.map((score, i) => {
									t6console.debug("Model prediction:", (t6Model.labels)[i], score.toFixed(4));
									p.push({ label: (t6Model.labels)[i], prediction: parseFloat(score.toFixed(4)) });
								});
								const bestMatchPrediction = Math.max(...arr);
								const bestMatchIndex = arr.indexOf(bestMatchPrediction);
								res.status(200).send({ "code": 200, initialValue: inputData[0].initialValue, value: inputData[0].value, labels: t6Model.labels, predictions: p, bestMatchIndex: bestMatchIndex, bestMatchPrediction: parseFloat(bestMatchPrediction.toFixed(4)), bestMatchLabel: (t6Model.labels)[bestMatchIndex] }); // TODO: missing serializer
								t6events.addStat("t6App", "ML Prediction", user_id, user_id, {"user_id": user_id, "model_path": path+t6Model.id});
							}).catch(function(error) {
								t6console.error("Model predict ERROR", error);
								res.status(412).send(new ErrorSerializer({ "id": 14187, "code": 412, "message": "Precondition Failed", error: error }).serialize());
								t6events.addStat("t6App", "ML Prediction Error 14187", user_id, user_id, {"user_id": user_id, "model_path": path+t6Model.id});
							});
						}).catch((error) => {
							t6console.error("Model loadDataSets ERROR", error);
							res.status(412).send(new ErrorSerializer({ "id": 14189, "code": 412, "message": "Precondition Failed", error: error }).serialize());
						});
					});
				}
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
	const model_id		= req.params.model_id;
	const user_id		= req.user.id;
	if ( model_id ) {
		let query = { "$and": [ { "id": model_id }, { "user_id": user_id }, ] };
		let t6Model = models.findOne( query );
		if (!t6Model) {
			res.status(412).send(new ErrorSerializer({"id": 14058, "code": 412, "message": "Precondition Failed: undefined model"}).serialize());
			return;
		}
		if (t6Model.datasets.training.limit <= t6Model.batch_size) {
			res.status(412).send(new ErrorSerializer({"id": 14057, "code": 412, "message": "Precondition Failed: batch size must be less than the training length"}).serialize());
			return;
		}
		if (str2bool(req.query.force)!==true && t6Model.current_status==="TRAINING") {
			res.status(409).send(new ErrorSerializer({"id": 14056, "code": 409, "message": "Conflict, Training already in progress. Please use force query parameter to start a new training or wait."}).serialize());
			return;
		}
		let limit				= typeof t6Model.datasets.training.limit!=="undefined"?t6Model.datasets.training.limit:100;
		let validation_split	= typeof t6Model.validation_split!=="undefined"?t6Model.validation_split:60;
		const startDate			= typeof t6Model.datasets.training.start!=="undefined"?moment(t6Model.datasets.training.start):moment().startOf("day");
		const endDate			= typeof t6Model.datasets.training.end!=="undefined"?moment(t6Model.datasets.training.end):moment().endOf("day");
		const timeWindow		= typeof t6Model.window_time_frame!=="undefined"?t6Model.window_time_frame:"60m";
		const batch_size		= typeof t6Model.batch_size!=="undefined"?t6Model.batch_size:1;
		let offset				= 0;
		if (startDate.isAfter(endDate)) {
			res.status(412).send(new ErrorSerializer({"id": 14059, "code": 412, "message": "Precondition Failed: invalid dates."}).serialize());
			return;
		}
		// get data from each flows
		t6Model.current_status = "TRAINING";
		t6Model.min = typeof t6Model.min!=="undefined"?t6Model.min:{}
		t6Model.max = typeof t6Model.max!=="undefined"?t6Model.max:{}
		t6Model.current_status_last_update	= moment().format(logDateFormat);
		// let queryTs = [];
		t6console.log("initializing queryTs on flows:", t6Model.flow_ids);
		getQueries(req.user.id, flows, t6Model)
		.then((queryTs) => {
			t6console.debug("initialized queryTs", queryTs);
			t6console.debug("going to executeAllQueries");
			executeAllQueries(queryTs).then((allRows) => {
				return {allRows, queryTs};
			}).then((executeAllQueriesResults) => {
				let rows = executeAllQueriesResults.allRows;
				let queryTs = executeAllQueriesResults.queryTs;
				const dateArray = [];
				let currentDate = startDate.clone();
				let duration;
				if(typeof t6Model.window_time_frame==="undefined") {
					executeAllQueriesResults.allRows[0].map((r) => { // TODO: expecting flow index zero to be the one defining times
						// t6console.debug("r", r);
						dateArray.push(moment(r.time).format("x"));
					});
				} else {
					switch(timeWindow.slice(-1)) {
						case "Y": duration = moment.duration({"years" : timeWindow.substring(0, timeWindow.length - 1)}); break;
						case "Q": duration = moment.duration({"quarters" : timeWindow.substring(0, timeWindow.length - 1)}); break;
						case "M": duration = moment.duration({"months" : timeWindow.substring(0, timeWindow.length - 1)}); break;
						case "w": duration = moment.duration({"weeks" : timeWindow.substring(0, timeWindow.length - 1)}); break;
						case "d": duration = moment.duration({"days" : timeWindow.substring(0, timeWindow.length - 1)}); break;
						case "h": duration = moment.duration({"hours" : timeWindow.substring(0, timeWindow.length - 1)}); break;
						case "m": duration = moment.duration({"minutes" : timeWindow.substring(0, timeWindow.length - 1)}); break;
						case "s": duration = moment.duration({"seconds" : timeWindow.substring(0, timeWindow.length - 1)}); break;
					}
					while (currentDate.isBefore(endDate) ) {
						dateArray.push(currentDate.add(duration).format("x"));
					}
				}
				const minMaxValues = queryTs.map((query, index) => {
					t6console.debug("initializing minMaxValues index:", index);
					// Calculate min and max values for each flow specified in queryTs
					const r = rows[index];
					const min = Math.min(...r.map((m) => m.value));
					const max = Math.max(...r.map((m) => m.value));
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
				t6console.debug("initialized minMaxValues", minMaxValues);
				let {mergedRows, flowData, balancedDatapointsCount, minorityClass, training_balance} = preprocessInputData(rows, t6Model);
				const dataMap = new Map();
				dateArray.map((date) => {
					const {closestValues, closestFlows, closestLabels} = findNearestDatapoints(date, Object.values(flowData), t6Model);
					dataMap.set(date, { values: closestValues, flow_ids: closestFlows, labels: closestLabels });
					// t6console.debug("Date from array", date, {closestValues, closestFlows, closestLabels});
				});
				t6Model.data_length = [...dataMap.entries()].length;
				t6Model.training_balance = training_balance;
				// t6Model.min["time"] = Math.min(...r.map((m) => m.value));
				// t6Model.max["time"] = Math.max(...r.map((m) => m.value));
	
				// t6console.debug("ML defining time window array from:");
				// t6console.debug("- startDate:", startDate);
				// t6console.debug("- endDate:", endDate);
				// t6console.debug("- timeWindow:", timeWindow);
				// t6console.debug("- dateArray.length:", dateArray.length);
				// t6console.debug("ML dataMap:");
				// t6console.debug("- dataMap entries length", t6Model.data_length);
				// t6console.debug("- dataMap keys length", [...dataMap.keys()].length);
				// t6console.debug("- dataMap values length", [...dataMap.values()].length);
				// t6console.debug([...dataMap.entries()]);
				// t6console.debug([...dataMap.keys()]);
				// t6console.debug([...dataMap.values()]);
				// [...dataMap.entries()].map((row, i) => {
				// 	let index = i+1;
				// 	t6console.debug(index, parseInt(row[0], 10), row[1].values, row[1].flow_ids, row[1].labels);
				// });
	
				t6Model.predictionInProgress = false;
				return t6machinelearning.loadDataSets_v2(dataMap, t6Model);						// DEBUG
				// return t6machinelearning.loadDataSets_timeseries(dataMap, t6Model);					// DEBUG : force LSTM timeseries
				// TODO : loadDataSets_v2 is using tidy but not a promise ... so we should dispose tensors
			})
			.then((dataset) => {
				t6console.debug("DEBUG after loadDataSets");
				let numFeatures;
				let inputShape;
				let outputShape;
				let labelsTensor	= dataset.labelsTensor;
				let inputTensor		= dataset.inputTensor;
				const timeSteps		= 1; // TODO
				const totalSize		= inputTensor.shape[0]; // Get the number of data points
				const trainSize		= Math.floor(totalSize * (1 - t6Model.validation_split));
	
				numFeatures		= inputTensor.shape[1]; // Get the number of features
				inputShape		= numFeatures;
				outputShape		= labelsTensor.shape[1];
	
				t6console.debug("ML MODEL BUILDING with inputTensor.shape", inputTensor.shape);
				t6console.debug("ML MODEL BUILDING with inputShape", inputShape);
				t6console.debug("ML MODEL BUILDING with labelsTensor.shape", labelsTensor.shape);
				t6console.debug("ML MODEL BUILDING with outputShape", outputShape);
				t6machinelearning.buildModel(inputShape, outputShape).then((tfModel) => {
					return {tfModel, dataset};
				}).then((modelResult) => {
					t6console.debug("ML MODEL BUILT");
					let tfModel		= modelResult.tfModel;
	
					let numFeatures;
					let inputShape;
					let outputShape;
					let valuesTensor	= modelResult.dataset.valuesTensor;
					let flowsTensor		= modelResult.dataset.flowsTensor;
					let labelsTensor	= modelResult.dataset.labelsTensor;
					let inputTensor		= modelResult.dataset.inputTensor;
					let featuresTensor	= modelResult.dataset.featuresTensor;
					const timeSteps		= 1; // TODO												// Bug: already set earlier
					const totalSize		= inputTensor.shape[0]; // Get the number of data points 	// Bug: already set earlier
					const batchSize		= inputTensor.shape[0];										// Bug: already set earlier
					const trainSize		= Math.floor(totalSize * (1 - t6Model.validation_split));	// Bug: already set earlier
					const evaluateSize	= totalSize - trainSize;									// Bug: already set earlier

					numFeatures		= inputTensor.shape[1]; // Get the number of features			// Bug: already set earlier
					inputShape		= numFeatures;													// Bug: already set earlier
					outputShape		= labelsTensor.shape[1];										// Bug: already set earlier
					options.epochs	= t6Model.epochs;
					options.batchSize = batchSize;
					tfModel.summary();

					// t6console.debug("inputTensor");
					// t6console.debug(inputTensor.dataSync());
					// t6console.debug("inputTensor", inputTensor);
					// t6console.debug("labelsTensor", labelsTensor);

					// const reshapedInput								= inputTensor.reshape([batchSize, timeSteps, numFeatures]); // BUG : activate this reshape when RNN
					const reshapedInput								= inputTensor.reshape([batchSize, numFeatures]);		// BUG : activate this reshape when no RNN
					const reshapedLabels							= labelsTensor.reshape([batchSize, outputShape]);
					let [inputXTrain, inputXEvaluate]				= tf.split(reshapedInput, [trainSize, evaluateSize]);
					let [inputLabelsTrain, inputLabelsEvaluate]	= tf.split(reshapedLabels, [trainSize, evaluateSize]);

					// t6console.debug("inputXTrain.dataSync()");
					// t6console.debug(inputXTrain.dataSync());
					// t6console.debug("inputLabelsTrain.dataSync()");
					// t6console.debug(inputLabelsTrain.dataSync());

					t6console.debug("ML DATASET totalSize", totalSize);
					t6console.debug("ML DATASET evaluateSize", evaluateSize);
					t6console.debug("ML DATASET trainSize", trainSize);
					t6console.debug("ML DATASET batchSize", batchSize);
					t6console.debug("ML DATASET timeSteps", timeSteps);
					t6console.debug("ML DATASET numFeatures", numFeatures);
					t6console.debug("ML DATASET numLabels", labelsTensor.shape[1]);
					t6console.debug("ML DATASET reshapedInput.shape", reshapedInput?.shape);
					t6console.debug("ML DATASET reshapedLabels.shape", reshapedLabels?.shape);
					t6console.debug("ML DATASET inputXTrain.shape", inputXTrain.shape);
					t6console.debug("ML DATASET inputXEvaluate.shape", inputXEvaluate.shape);
					t6console.debug("ML DATASET inputLabelsTrain.shape", inputLabelsTrain.shape);
					t6console.debug("ML DATASET inputLabelsEvaluate.shape", inputLabelsEvaluate.shape);

					t6console.debug("ML IS READY TO BE TRAINED");
					t6console.debug("reminder queryTs", queryTs);
					t6console.debug("inputXTrain", inputXTrain.dataSync() );
					t6console.debug("inputLabelsTrain", inputLabelsTrain.dataSync() );
					t6machinelearning.trainModel(tfModel, inputXTrain, inputLabelsTrain, options).then((trained) => {
						/*
							LSTM Error
							ValueError: Total size of new array must be unchanged.
						*/
						t6console.debug("ML IS TRAINED 1/2");
						return {trained, evaluateSize, inputXEvaluate, inputLabelsEvaluate};
					}).then((trainedResult) => {
						t6console.debug("ML IS TRAINED 2/2");
						let trained				= trainedResult.trained;
						let inputXEvaluate		= trainedResult.inputXEvaluate;
						let inputLabelsEvaluate	= trainedResult.inputLabelsEvaluate;
						t6Model.history.training = { loss: trained.history.loss, accuracy: trained.history.acc };
						if(trainedResult.evaluateSize>0) {
							t6console.debug("ML IS READY TO BE EVALUATED");
							t6machinelearning.evaluateModel(tfModel, inputXEvaluate, inputLabelsEvaluate).then((evaluate) => {
								t6console.debug("ML IS EVALUATED");
								t6Model.history.evaluation = {
									loss	: evaluate.loss,
									accuracy: evaluate.accuracy
								};
								//t6console.debug("trained: loss", t6Model.history.training.loss);
								//t6console.debug("trained: accuracy", t6Model.history.training.accuracy);
								//t6console.debug("evaluate: loss", t6Model.history.evaluation.loss);
								//t6console.debug("evaluate: accuracy", t6Model.history.evaluation.accuracy);
								let user = users.findOne({"id": user_id });
								if (user && typeof user.pushSubscription!=="undefined" && typeof user.pushSubscription.endpoint!=="undefined" ) {
									let payload = `{"type": "message", "title": "Model is trained", "body": "- Features[Con]: ${t6Model.continuous_features?.length}\\n- Features[Cat]: ${t6Model.categorical_features?.length}\\n- Label(s): ${t6Model.labels?.length}\\n- Flow(s): ${t6Model.flow_ids?.length}\\n- Total dataset: ${totalSize}\\n- Train dataset: ${trainSize} (${(1-t6Model.validation_split)*100}%)\\n- Balance limit *: ${t6Model.minorityClass}\\n- Evaluate dataset *: ${evaluateSize} (${t6Model.validation_split*100}%)\\n- Evaluate loss: ${evaluate.loss}\\n- Evaluate accuracy: ${evaluate.accuracy}", "icon": null, "vibrate":[200, 100, 200, 100, 200, 100, 200]}`;
									let result = t6notifications.sendPush(user, payload);
									result.catch((error) => {
										t6console.debug("pushSubscription error", error);
									});
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
								const path = `${mlModels.models_user_dir}/${user_id}/`;
								if (!fs.existsSync(path)) { fs.mkdirSync(path); }
								t6console.debug("Model saving to", path+t6Model.id);
								t6events.addStat("t6App", "ML Trained Model saved", user_id, user_id, {"user_id": user_id, "model_path": path+t6Model.id});
								t6machinelearning.save(tfModel, `file://${path}${t6Model.id}`).then((saved) => {
									t6console.debug("Model saved", saved);
									t6Model.current_status = "TRAINED";
									t6Model.current_status_last_update	= moment().format(logDateFormat);
									db_models.save(); // saving the status // BUG, what if evaluate size is == 0?
								});
								// t6console.debug("DEBUG before dispose");
								return t6machinelearning.dispose(tfModel);
							}).catch((error) => {
								t6console.error("Error during evaluating training :", error);
								let user = users.findOne({"id": user_id });
								if (user && typeof user.pushSubscription!=="undefined" && typeof user.pushSubscription.endpoint!=="undefined" ) {
									let payload = `{"type": "message", "title": "Error during evaluating training", "body": "${error}", "icon": null, "vibrate":[200, 100, 200, 100, 200, 100, 200]}`;
									let result = t6notifications.sendPush(user, payload);
									result.catch((error) => {
										t6console.debug("pushSubscription error", error);
									});
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
							});
						} else {
							t6console.debug("ML NOT READY FOR EVALUATION");
							t6console.debug("Missing Validating data", evaluateSize);
							let user = users.findOne({"id": user_id });
							if (user && typeof user.pushSubscription!=="undefined" && typeof user.pushSubscription.endpoint!=="undefined" ) {
								let payload = `{"type": "message", "title": "Missing Validating data", "body": "evaluateSize: ${evaluateSize}", "icon": null, "vibrate":[200, 100, 200, 100, 200, 100, 200]}`;
								let result = t6notifications.sendPush(user, payload);
								result.catch((error) => {
									t6console.debug("pushSubscription error", error);
								});
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
						}
					}).catch((error) => {
						t6console.error("Error during training :", error);
						let user = users.findOne({"id": user_id });
						if (user && typeof user.pushSubscription!=="undefined" && typeof user.pushSubscription.endpoint!=="undefined" ) {
							let payload = `{"type": "message", "title": "Error during training", "body": "${error}", "icon": null, "vibrate":[200, 100, 200, 100, 200, 100, 200]}`;
							let result = t6notifications.sendPush(user, payload);
							result.catch((error) => {
								t6console.debug("pushSubscription error", error);
							});
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
					});
				})
			})
			.catch((error) => {
				t6console.error("Error during loadDataSets:", error);
				let user = users.findOne({"id": user_id });
				if (user && typeof user.pushSubscription!=="undefined" && typeof user.pushSubscription.endpoint!=="undefined" ) {
					let errorStr = error.toString().replace("\n"," ");
					let payload = `{"type": "message", "title": "Error during loadDataSets", "body": "${errorStr}", "icon": null, "vibrate":[200, 100, 200, 100, 200, 100, 200]}`;
					let result = t6notifications.sendPush(user, payload);
					result.catch((error) => {
						t6console.debug("pushSubscription error", error);
					});
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
			});
		}).then(() => {
			// t6console.debug("DEBUG after dispose");
			t6Model.process			= "asynchroneous";
			t6Model.notification	= "push-notification";
			t6Model.history			= {};
			res.status(202).send(new ModelSerializer(t6Model).serialize());
			db_models.save(); // saving the status
		}).catch((error) => {
			t6console.error("Error fetching data (queryTs):", error);
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
		t6console.debug("modelFiles", modelFiles);
		modelFiles.map((f) => {
			t6console.debug("f", f);
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
router.get("/:model_id([0-9a-z\-]+)/explain/:mode(training|evaluation)?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let model_id = req.params.model_id;
	let width = typeof parseInt(req.query.width, 10)!=="undefined"?parseInt(req.query.width, 10):500;
	let height = typeof parseInt(req.query.height, 10)!=="undefined"?parseInt(req.query.height, 10):200;
	let margin = typeof parseInt(req.query.margin, 10)!=="undefined"?parseInt(req.query.margin, 10):20;
	let user_id = req.user.id;
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
				const modeData = t6Model.history[req.params.mode];
				const d3nInstance = new D3Node();
				let svg = d3nInstance.createSVG(width, height);
				const epochs = [...modeData.accuracy.map((a, i) => { return i; })]; // TODO : should be a simplier way
				const accuracy = modeData.accuracy;
				const loss = modeData.loss;
				const minAcc = Math.min(...modeData.accuracy.map((a) => a));
				const maxAcc = Math.max(...modeData.accuracy.map((a) => a));
				const minLoss = Math.min(...modeData.loss.map((l) => l));
				const maxLoss = Math.max(...modeData.loss.map((l) => l));

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
					.attr('transform', 'rotate(-90)')
					.attr('y', 10)
					.attr('dy', '0em')
					.attr('text-anchor', 'end')
					.attr('fill', 'blue')
					.text('Accuracy');

				// Add y-axis for Loss
				svg.append('g')
					.attr('transform', `translate(${width - margin}, 0)`)
					.call(d3nInstance.d3.axisRight(yLossScale))
					.append('text')
					.attr('transform', 'rotate(-90)')
					.attr('y', 20)
					.attr('dy', '0em')
					.attr('text-anchor', 'end')
					.attr('fill', 'red')
					.text('Loss');

				// Add legend for accuracy
				svg.append('rect')
					.attr('x', margin)
					.attr('y',  height-(margin/2))
					.attr('width', 10)
					.attr('height', 10)
					.attr('fill', 'blue');
				svg.append('text')
					.attr('x', margin+15)
					.attr('y', height-15)
					.style('fill', 'blue')
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
					.style('fill', 'red')
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

/**
 * @api {get} /models/:model_id/explain/model Draw deeplearning model
 * @apiName Draw deeplearning model
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
router.get("/:model_id([0-9a-z\-]+)/explain/model?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let model_id = req.params.model_id;
	let margin = typeof parseInt(req.query.margin, 10)!=="undefined"?parseInt(req.query.margin, 10):20;
	let width = (typeof parseInt(req.query.width, 10)!=="undefined"?parseInt(req.query.width, 10):500) + margin;
	let height = (typeof parseInt(req.query.height, 10)!=="undefined"?parseInt(req.query.height, 10):200) + margin;
	let user_id = req.user.id;
	if (model_id) {
		let query = { "$and": [ { "id": model_id }, { "user_id": req.user.id }, ] };
		let t6Model = models.findOne(query);
		if (t6Model) {
			const d3nInstance = new D3Node();

			// Draw arrows between layers
			const layerWidth = width / t6Model.layers.length;
			const y = height / 2;
			const max_neuron_in_layer = Math.max(...(t6Model.layers).map((l) => typeof l.units!=="undefined"?l.units:1));
			const minSpacing = 20;
			const radius = (height - ((max_neuron_in_layer+1)*minSpacing))/(max_neuron_in_layer*2);
			const unitSpacing = (radius*5/2);
			t6console.debug("height", height);
			t6console.debug("radius", radius);
			t6console.debug("minSpacing", minSpacing);
			t6console.debug("unitSpacing", unitSpacing);
			t6console.debug("max_neuron_in_layer", max_neuron_in_layer);
			let svg = d3nInstance.createSVG(width, height+2*margin).append('g').attr('transform', `translate(${margin}, ${margin})`);

			// Draw circles and lines for layers
			for (let i = 0; i < t6Model.layers.length; i++) {
				const layer = t6Model.layers[i];
				layer.units = typeof layer.units!=="undefined"?layer.units:1;
				const mode = layer.mode;
				const x = i * layerWidth/2;
				const yOffset = unitSpacing * (layer.units - 1) / 2;
				for (let j = 0; j < layer.units; j++) {
					const cx = x;
					const cy = (height / 2) - yOffset + j * unitSpacing;
					svg.append('circle')
						.attr('cx', cx)
						.attr('cy', cy)
						.attr('r', radius)
						.attr('fill', '#ccc');

					svg.append('text')
						.attr('x', cx)
						.attr('y', cy)
						.attr('text-anchor', 'middle')
						.attr('dominant-baseline', 'middle')
						.text(layer.type.substring(0, 1).toUpperCase());

					if(layer.type==="output") {
						svg.append('text')
							.attr('x', cx + unitSpacing)
							.attr('y', cy)
							.attr('text-anchor', 'left')
							.attr('dominant-baseline', 'middle')
							.text(t6Model.labels[j]);
					}
					
					if (i > 0) {
						const prevLayerMode = (t6Model.layers[i - 1]).mode;
						const prevLayer = t6Model.layers[i - 1];
						const prevX = (i - 1) * layerWidth/2;
						const prevYOffset = unitSpacing * (prevLayer.units - 1) / 2;
						let color;
						if (prevLayerMode === "dense") {
							color = "#000";
						} else if (prevLayerMode === "dropout") {
							color = "#FF0000";
						}
						for (let k = 0; k < prevLayer.units; k++) {
							const prevCx = prevX;
							const prevCy = (height / 2) - prevYOffset + k * unitSpacing;
							svg.append('line')
								.attr('x1', prevCx + radius)
								.attr('y1', prevCy)
								.attr('x2', cx - radius)
								.attr('y2', cy)
								.attr('stroke', color)
								.attr('stroke-width', '1')
								.style("stroke-dasharray", (prevLayerMode === "dropout")?("3, 3"):("0, 0"));
						}
					}
				}
				if(layer.mode==="dropout") {
					svg.append('text')
						.attr('x', x)
						.attr('y', margin)
						.attr('text-anchor', 'middle')
						.attr('dominant-baseline', 'middle')
						.style("font-size", "12px")
						.text(`${layer.units} ${layer.mode.charAt(0).toUpperCase() + layer.mode.slice(1)} ${typeof layer.rate!=="undefined"?layer.rate+"%":""}`);
				} else {
					svg.append('text')
						.attr('x', x)
						.attr('y', margin)
						.attr('text-anchor', 'middle')
						.attr('dominant-baseline', 'middle')
						.style("font-size", "12px")
						.text(`${layer.units} ${layer.type} units`);
					svg.append('text')
						.attr('x', x)
						.attr('y', height-margin)
						.attr('text-anchor', 'middle')
						.attr('dominant-baseline', 'middle')
						.style("font-size", "12px")
						.text(`Ac. func. ${layer.activation}`);
				}
			}

			res.setHeader("content-type", "image/svg+xml");
			res.status(200).send(d3nInstance.svgString());
		} else {
			res.status(401).send(new ErrorSerializer({ "id": 14274, "code": 401, "message": "Forbidden" }).serialize());
		}
	} else {
		return res.status(412).send(new ErrorSerializer({ "id": 14190, "code": 412, "message": "Precondition Failed" }).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
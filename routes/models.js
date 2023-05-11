"use strict";
var express = require("express");
var router = express.Router();
var ModelSerializer = require("../serializers/model");
var ErrorSerializer = require("../serializers/error");
const options = {
	verbose: process.env.NODE_ENV === "production" ?0:2/*,
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
 * @api {put} /models/:model_id Edit a Model
 * @apiName Edit a Model
 * @apiDescription Editing a Model will reset the history and current_status
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * @apiBody {String} [name] 
 * 
 * @apiUse 200
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
					item.current_status	= "";
					item.features = undefined;
					item.name			= typeof req.body.name!=="undefined"?req.body.name:item.name;
					item.meta.revision	= typeof item.meta.revision==="number"?(item.meta.revision):1;
					item.flow_ids		= typeof req.body.flow_ids!=="undefined"?req.body.flow_ids:item.flow_ids;
					item.continuous_features	= typeof req.body.continuous_features!=="undefined"?req.body.continuous_features:item.continuous_features;
					item.categorical_features	= typeof req.body.categorical_features!=="undefined"?req.body.categorical_features:item.categorical_features; // TODO depend on datatype
					item.categorical_features_classes	= typeof req.body.categorical_features_classes!=="undefined"?req.body.categorical_features_classes:item.categorical_features_classes;
					item.retention		= typeof req.body.retention!=="undefined"?req.body.retention:item.retention;
					item.batch_size		= typeof req.body.batch_size!=="undefined"?req.body.batch_size:100;
					item.epochs			= typeof req.body.epochs!=="undefined"?req.body.epochs:100;
					item.validation_split	= typeof req.body.validation_split!=="undefined"?req.body.validation_split:item.validation_split;
					item.datasets	= {
						"training": {
							"start": typeof req.body.datasets.training.start!=="undefined"?req.body.datasets.training.start:item.datasets.training.start,
							"end": typeof req.body.datasets.training.end!=="undefined"?req.body.datasets.training.end:item.datasets.training.end,
							"duration": typeof req.body.datasets.training.duration!=="undefined"?req.body.datasets.training.duration:item.datasets.training.duration,
							"limit": typeof req.body.datasets.training.limit!=="undefined"?req.body.datasets.training.limit:item.datasets.training.limit
						},
						"testing": {
							"start": typeof req.body.datasets.testing.start!=="undefined"?req.body.datasets.testing.start:item.datasets.testing.start,
							"end": typeof req.body.datasets.testing.end!=="undefined"?req.body.datasets.testing.end:item.datasets.testing.end,
							"duration": typeof req.body.datasets.testing.duration!=="undefined"?req.body.datasets.testing.duration:item.datasets.testing.duration,
							"limit": typeof req.body.datasets.testing.limit!=="undefined"?req.body.datasets.testing.limit:item.datasets.testing.limit
						}
					};
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
 * @apiBody {String} [name] 
 * 
 * @apiUse 200
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
				features:	typeof req.body.features!=="undefined"?req.body.features:["value"],
				continuous_features: typeof req.body.continuous_features!=="undefined"?req.body.continuous_features:["value"],
				categorical_feature: typeof req.body.categorical_features!=="undefined"?req.body.categorical_features:[], // TODO depend on datatype
				categorical_features_classes: typeof req.body.categorical_features_classes!=="undefined"?req.body.categorical_features_classes:[],
				retention:	typeof req.body.retention!=="undefined"?req.body.retention:"autogen",
				validation_split:	typeof req.body.validation_split!=="undefined"?req.body.validation_split:0.8,
				batch_size:	typeof req.body.batch_size!=="undefined"?req.body.batch_size:100,
				epochs:		typeof req.body.epochs!=="undefined"?req.body.epochs:100,
				current_status: "",
				datasets: {
					training: {
						start: typeof req.body.datasets.training.start!=="undefined"?req.body.datasets.training.start:new Date(),
						end: typeof req.body.datasets.training.end!=="undefined"?req.body.datasets.training.end:new Date(),
						duration: typeof req.body.datasets.training.duration!=="undefined"?req.body.datasets.training.duration:null,
						limit: typeof req.body.datasets.training.limit!=="undefined"?req.body.datasets.training.limit:null
					},
					testing: {
						start: typeof req.body.datasets.testing.start!=="undefined"?req.body.datasets.testing.start:new Date(),
						end: typeof req.body.datasets.testing.end!=="undefined"?req.body.datasets.testing.end:new Date(),
						duration: typeof req.body.datasets.testing.duration!=="undefined"?req.body.datasets.testing.duration:null,
						limit: typeof req.body.datasets.testing.limit!=="undefined"?req.body.datasets.testing.limit:null
					}
				}
			};
			t6events.addStat("t6Api", "model add", newModel.id, req.user.id);
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
 * 
 * @apiUse 200
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
		res.status(200).send({ "code": 200, message: "Successfully deleted", removed_id: model_id }); // TODO: missing serializer
	} else {
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
 * 
 * @apiUse 200
 * @apiUse 412
 */
router.get("/:model_id([0-9a-z\-]+)/predict/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	let model_id = req.params.model_id;
	let user_id = req.user.id;
	let inputData = Array.isArray(req.body)===false?[req.body]:req.body;
	if ( !req.body || !inputData ) {
		return res.status(412).send(new ErrorSerializer({"id": 14185, "code": 412, "message": "Precondition Failed"}).serialize());
	}
	if ( model_id ) {
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
				t6machinelearning.loadLayersModel(`file:///${path}/model.json`).then((tfModel) => {
					t6machinelearning.init(t6Model);
					t6machinelearning.loadDataSets(inputData, t6Model, 0)
					.then((dataset) => {
						t6console.debug("dataset x size", dataset.x.size);
						t6console.debug("dataset x shape", dataset.x.shape);
						t6console.debug("dataset x dtype", dataset.x.dtype);
						t6console.debug("dataset x rankType", dataset.x.rankType);
						t6console.debug("dataset y size", dataset.y.size);
						t6console.debug("dataset y shape", dataset.y.shape);
						t6console.debug("dataset y dtype", dataset.y.dtype);
						t6console.debug("dataset y rankType", dataset.y.rankType);
						t6machinelearning.buildModel()
						.then((tfModel) => {
							t6machinelearning.predict_1(tfModel, t6Model, dataset.x).then((prediction) => {
								prediction.print();
								let p = [];
								let arr = Array.from(prediction.dataSync());
								// TODO: multiple Tensors when predicting multiple values
								arr.map((score, i) => {
									p.push({ label: (t6Model.labels)[i], prediction: score.toFixed(4) });
								});
								t6console.debug("prediction", arr);
								res.status(200).send({ "code": 200, labels: t6Model.labels, prediction: p, bestMatch: (t6Model.labels)[arr.indexOf(Math.max(...arr))] }); // TODO: missing serializer
								t6events.addStat("t6App", "ML Prediction", user_id, user_id, {"user_id": user_id, "model_path": path+t6Model.id});
							});
						});
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
		if (str2bool(req.query.force)!==true && t6Model.current_status==="running") {
			res.status(409).send(new ErrorSerializer({"id": 14056, "code": 409, "message": "Conflict, Training in progress"}).serialize());
			return;
		}

		let queryTs = t6Model.flow_ids.map( (flow_id) => {
			let flow = flows.findOne({id: flow_id});
			let retention = flow.retention;
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
			//t6console.debug("Retention is valid:", rp);
			//t6console.debug("flow:", flow);
			let fields = getFieldsFromDatatype(datatypes.findOne({id: flow.data_type}).name, true, true);
			let andDates = "";
			let sorting = "DESC";
			if( t6Model.datasets.training.start!==null && t6Model.datasets.training.start!=="" ) {
				andDates += `AND time>='${moment(t6Model.datasets.training.start).toISOString()}' `;
				sorting = "ASC";
			}
			if( t6Model.datasets.training.end!==null && t6Model.datasets.training.end!=="" ) {
				andDates += `AND time<='${moment(t6Model.datasets.training.end).toISOString()}' `;
			}
			let where = ""; //"meta!='' AND ";
			return `SELECT ${fields}, flow_id, meta FROM ${rp}.data WHERE ${where} user_id='${req.user.id}' ${andDates} AND flow_id='${flow_id}' ORDER BY time ${sorting} LIMIT ${limit} OFFSET ${offset}`;
		}).join("; ");
		t6console.debug("queryTs:", queryTs);

		// Get values from TS
		dbInfluxDB.query(queryTs).then((data) => {
			data = data.flat();
			data = shuffle(data);
			if ( data.length > 0 ) {
				t6console.debug("ML data.length:", data.length);
				t6Model.min = Math.min(...data.filter((d) => t6Model.flow_ids.indexOf(d.flow_id)===0).map((m) => m.value));
				t6Model.max = Math.max(...data.filter((d) => t6Model.flow_ids.indexOf(d.flow_id)===0).map((m) => m.value));
				// TODO // TODO // TODO // TODO // TODO // TODO // TODO
				data.map((m) => {
					m.meta = JSON.parse(typeof m.meta!=="undefined"?m.meta:null);
					let category_id = (m.meta!==null && typeof m.meta!=="undefined" && typeof m.meta.categories!=="undefined")?(m.meta.categories[0]):null;
					m.label = (category_id!==null)?categories.findOne({id: category_id}).name:0;
					return m;
				});
				t6machinelearning.init(t6Model);
				t6Model.continuous_features.map((cName) => {
					t6machinelearning.addContinuous(cName, t6Model.min, t6Model.max);
				});
				t6Model.categorical_features.map((cName) => {
					let cClasses = t6Model.categorical_features_classes;
					cClasses = (Array.isArray(cClasses)===true)?cClasses:[];
					if(cName === "flow_id") {
						t6machinelearning.addCategorical(cName, t6Model.flow_ids);
					} else {
						t6machinelearning.addCategorical(cName, cClasses.map((c) => c.values)[0]);
					}
				});
				t6machinelearning.loadDataSets(data, t6Model, t6Model.validation_split)
				.then((dataset) => {
					t6console.log("ML DATASET COMPLETED");
					t6machinelearning.buildModel([t6Model.batch_size, dataset.xTensor.size/dataset.trainXs.length], t6Model.labels.length)
					.then((tfModel) => {
						t6console.debug("ML MODEL BUILT");
						t6console.debug("== FEATURES ==");
						t6console.debug("continuous_features", t6Model.continuous_features);
						t6console.debug("categorical_features", t6Model.categorical_features);

						t6console.debug("== featureTensor ==");
						t6console.debug("featureTensor", dataset.trainXs);
						t6console.debug("featureTensor length", dataset.trainXs.length);
						t6console.debug("featureTensor shape", dataset.xTensor.shape);
						t6console.debug("featureTensor size", dataset.xTensor.size);
						t6console.debug("featureTensor rank", dataset.xTensor.rank);
						t6console.debug("featureTensor rankType", dataset.xTensor.rankType);

						t6console.debug("== labelTensor ==");
						t6console.debug("labelTensor", dataset.trainYs);
						t6console.debug("labelTensor shape", dataset.yTensor.shape);
						t6console.debug("labelTensor rank", dataset.yTensor.rank);
						t6console.debug("labelTensor rankType", dataset.yTensor.rankType);
						res.status(202).send({ "code": 202, current_status: "running", process: "asynchroneous", model_id: model_id, limit: limit, validation_split: validation_split, notification: "push-notification", valid_length: dataset.xValidSize, continuous_features: t6Model.continuous_features, categorical_features: t6Model.categorical_features, categorical_features_classes: t6Model.categorical_features_classes, flow_ids: t6Model.flow_ids, labels: t6Model.labels }); // TODO: missing serializer
						options.validationData	= dataset.validDs;
						options.epochs			= t6Model.epochs;
						t6Model.current_status = "running";
						db_models.save(); // saving the status

						t6machinelearning.trainModelDs(tfModel, dataset.trainDs, options)
						.then((trained) => {
							t6console.log("ML TRAINED");
							t6Model.history = {
								loss	: trained.history.loss,
								accuracy: trained.history.acc
							};
							if(dataset.validDs.size>0) {
								t6machinelearning.evaluateModel(tfModel, dataset.validDs)
								.then((evaluate) => {
									t6console.debug("evaluate: loss", evaluate.loss);
									t6console.debug("evaluate: accuracy", evaluate.accuracy);
									t6Model.history.evaluation = {
										loss	: evaluate.loss,
										accuracy: evaluate.accuracy
									};
									let user = users.findOne({"id": req.user.id });
									if (user && typeof user.pushSubscription !== "undefined" ) {
										let payload = `{"type": "message", "title": "Model trained", "body": "- Features[Con]: ${t6Model.continuous_features.length}\\n- Features[Cat]: ${t6Model.categorical_features.length}\\n- Labels: ${t6Model.labels.length}\\n- Flows: ${t6Model.flow_ids.length}\\n- Train dataset: ???\\n- Validate dataset: ${dataset.xValidSize}\\n- loss: ${evaluate.loss}\\n- accuracy: ${evaluate.accuracy}", "icon": null, "vibrate":[200, 100, 200, 100, 200, 100, 200]}`;
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
										t6console.debug("Model saved");
										t6Model.current_status = "";
										db_models.save(); // saving the status
									});
								});
							} else {
								t6console.debug("Missing Validating data", dataset.trainDs.size, dataset.validDs.size);
							}
						});
					});
				})
				.catch((error) => {
					t6console.error("ML Error:", error);
				});
			} else {
				res.status(404).send(new ErrorSerializer({err: "No data found", "id": 14058, "code": 404, "message": "Not found"}).serialize());
			}
		}).catch((err) => {
			t6console.error("id=14059", err);
			res.status(500).send(new ErrorSerializer({err: err, "id": 14059, "code": 500, "message": "Internal Error"}).serialize());
		});
	} else {
		res.status(404).send(new ErrorSerializer({"id": 14271, "code": 404, "message": "Not Found"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
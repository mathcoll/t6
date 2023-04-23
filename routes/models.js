"use strict";
var express = require("express");
var router = express.Router();
var ModelSerializer = require("../serializers/model");
var ErrorSerializer = require("../serializers/error");

/**
 * @api {get} /models/:model_id? Get Models
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
 * @api {put} /models/:model_id Edit Model
 * @apiName Add Models
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
					item.name			= typeof req.body.name!=="undefined"?req.body.name:item.name;
					item.meta.revision	= typeof item.meta.revision==="number"?(item.meta.revision):1;
					item.flow_ids		= typeof req.body.flow_ids!=="undefined"?req.body.flow_ids:item.flow_ids;
					item.retention		= typeof req.body.retention!=="undefined"?req.body.retention:item.retention,
					item.batch_size		= typeof req.body.batch_size!=="undefined"?req.body.batch_size:100,
					item.epochs			= typeof req.body.epochs!=="undefined"?req.body.epochs:100,
					item.training_size_ratio	= typeof req.body.training_size_ratio!=="undefined"?req.body.training_size_ratio:item.training_size_ratio,
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
				retention:	typeof req.body.retention!=="undefined"?req.body.retention:"autogen",
				training_size_ratio:	typeof req.body.training_size_ratio!=="undefined"?req.body.training_size_ratio:0.8,
				batch_size:	typeof req.body.batch_size!=="undefined"?req.body.batch_size:100,
				epochs:		typeof req.body.epochs!=="undefined"?req.body.epochs:100,
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
 * @api {post} /models/:model_id/train Train a Model
 * @apiName Train a Model
 * @apiGroup 14. Models
 * @apiVersion 2.0.1
 * 
 * @apiUse Auth
 * 
 * @apiUse 202
 */
router.post("/:model_id([0-9a-z\-]+)/train/?", expressJwt({secret: jwtsettings.secret, algorithms: jwtsettings.algorithms}), function (req, res) {
	var model_id = req.params.model_id;
	if ( model_id ) {
		let query = {
			"$and": [
					{ "id": model_id },
					{ "user_id": req.user.id },
				]
			};
		var t6Model = models.findOne( query );

		let limit = t6Model.datasets.training.limit;
		let training_size_ratio = typeof t6Model.training_size_ratio!=="undefined"?t6Model.training_size_ratio:60;
		let offset = 0;
		let queryTs = t6Model.flow_ids.map( (flow_id, index) => {
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
			return `SELECT ${fields}, flow_id, meta FROM ${rp}.data WHERE user_id='${req.user.id}' ${andDates} AND flow_id='${flow_id}' ORDER BY time ${sorting} LIMIT ${limit} OFFSET ${offset}`;
		}).join("; ");
		t6console.debug("queryTs:", queryTs);

		// Get values from TS
		dbInfluxDB.query(queryTs).then((data) => {
			data = data.flat();
			data = shuffle(data);
			if ( data.length > 0 ) {
				// split training and testing
				let [trainingDatafromDB, testingDatafromDB] = getRandomSample(data, (training_size_ratio * data.length));

				trainingDatafromDB.map(function(dtr) {
					// TODO : can have multiple categories
					// TODO : let's begin with only one category and using that category as the only one feature in ML training
					let category = (dtr.meta && typeof JSON.parse(dtr.meta)!=="undefined") ? categories.findOne({id: JSON.parse(dtr.meta).categories[0]}) : {name: null};
					t6console.debug({value: dtr.value, category: category.name, time: moment(dtr.time).format("YYYY-MM-DD HH:mm")});
					//t6console.debug(moment(dtr.time).format("YYYY-MM-DD HH:mm"), dtr.flow_id, dtr.value, category.name);
				});
				
				t6machinelearning.init(3); // TODO
				const trainData = t6machinelearning.loadDataArray(trainingDatafromDB, t6Model.batch_size);
				const testData = t6machinelearning.loadDataArray(testingDatafromDB, t6Model.batch_size);
				const tfModel = t6machinelearning.buildModel();
				tfModel.summary();
				t6machinelearning.trainModel(tfModel, trainData, t6Model.epochs).then((info) => {
					t6console.debug("info", info);
					t6machinelearning.evaluateModel(tfModel, testData).then((evaluate) => {
						t6console.debug("evaluate:", evaluate);
						t6console.debug("evaluate: loss", evaluate.loss);
						t6console.debug("evaluate: accuracy", evaluate.accuracy);
						let user = users.findOne({"id": req.user.id });
						if (user && typeof user.pushSubscription !== "undefined" ) {
							let payload = `{"type": "message", "title": "Model trained", "body": "loss: ${evaluate.loss}, accuracy: ${evaluate.accuracy}", "icon": null, "vibrate":[200, 100, 200, 100, 200, 100, 200]}`;
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
						let path = `${mlModels.models_user_dir}/${user.id}/`;
						if (!fs.existsSync(path)) { fs.mkdirSync(path); }
						t6console.debug("Model saving to", path+t6Model.id);
						t6machinelearning.save(tfModel, `file://${path}${t6Model.id}`).then((saved) => {
							t6console.debug("Model saved to", saved);
						});
					});
				});
			} else {
				t6console.debug(query);
				res.status(404).send(new ErrorSerializer({err: "No data found", "id": 14058, "code": 404, "message": "Not found"}).serialize());
			}
		}).catch((err) => {
			t6console.error("id=14059", err);
			res.status(500).send(new ErrorSerializer({err: err, "id": 14059, "code": 500, "message": "Internal Error"}).serialize());
		});

		if ( t6Model ) {
			res.status(202).send({ "code": 202, message: "Training started", model_id: model_id }); // TODO: missing serializer
		} else {
			res.status(401).send(new ErrorSerializer({"id": 14272, "code": 401, "message": "Forbidden"}).serialize());
		}
	} else {
		res.status(404).send(new ErrorSerializer({"id": 14271, "code": 404, "message": "Not Found"}).serialize());
	}
});

t6console.log(`Route ${path.basename(__filename)} loaded`.padEnd(59));
module.exports = router;
"use strict";
var t6machinelearning = module.exports = {};
/*
tf.enableDebugMode();
tf.env().set("PROD", false);
//tf.enableProdMode();
t6console.debug(tf.env().flags);
*/

let t6Model;
let continuousFeats = [];
let continuousFeatsMins = [];
let continuousFeatsMaxs = [];
let categoricalFeats = [];

t6machinelearning.init = async function(model) {
	return new Promise((resolve) => {
		t6Model = model;
		continuousFeats = [];
		continuousFeatsMins = [];
		continuousFeatsMaxs = [];
		categoricalFeats = [];
		t6console.debug("================== t6machinelearning.init =================");
		t6console.debug("strategy", typeof t6Model.strategy!=="undefined"?t6Model.strategy:"classification");
		t6console.debug("Normalize", t6Model.normalize);
		t6console.debug("splitToArray", t6Model.splitToArray);
		t6console.debug("shuffle", t6Model.shuffle);
		t6console.debug("labels", t6Model.labels);
		t6console.debug("labelsCount", t6Model.labels.length);
		t6console.debug("batch_size", t6Model.batch_size);
		t6console.debug("data_length", t6Model.data_length);
		t6console.debug("min", t6Model.min);
		t6console.debug("max", t6Model.max);
		t6console.debug("Compile optimizer", typeof t6Model.compile?.optimizer!=="undefined"?t6Model.compile?.optimizer:"adam");
		t6console.debug("Compile loss", typeof t6Model.compile?.loss!=="undefined"?t6Model.compile?.loss:"binaryCrossentropy");
		t6console.debug("Compile metrics", typeof t6Model.compile?.metrics!=="undefined"?t6Model.compile?.metrics:["accuracy"]);
		t6console.debug("===========================================================");
		resolve(t6Model);
	});
};

t6machinelearning.addContinuous = function(featureName, flow_id, min, max) {
	if (typeof continuousFeatsMins[featureName] === "undefined") {
		continuousFeatsMins[featureName] = [];
	}
	if (typeof continuousFeatsMaxs[featureName] === "undefined") {
		continuousFeatsMaxs[featureName] = [];
	}
	continuousFeatsMins[featureName][flow_id] = min;
	continuousFeatsMaxs[featureName][flow_id] = max;
	continuousFeats.push(featureName);
	t6console.debug(`ADDED "${featureName}" on ${flow_id} to Continuous Features, and having min: ${min} / max: ${max}`);
	return true;
}

t6machinelearning.addCategorical = function(featureName, classes) {
	categoricalFeats[featureName] = (Array.isArray(classes)===true && classes.length>-1)?classes:[];
	if(featureName!=="flow_id" && featureName!=="value" && categoricalFeats[featureName].indexOf("oov")===-1) {
		categoricalFeats[featureName].unshift("oov");
		t6console.debug(`ADDED value "oov" to Categorical list`);
	}
	t6console.debug(`ADDED "${featureName}" to Categorical Features with ${categoricalFeats[featureName].length} classes`, categoricalFeats[featureName]);
	return true;
}

t6machinelearning.buildModel = async function(inputShape, outputShape) {
	t6console.debug("buildModel inputShape", inputShape);
	t6console.debug("buildModel outputShape", outputShape);
	t6console.debug("buildModel t6Model.strategy", t6Model.strategy);
	return await new Promise((resolve) => {
		const model = tf.sequential();
		if(t6Model.strategy==="classification") {
			model.add(tf.layers.dense({
				inputShape: inputShape,
				//batchInputShape: inputShape,
				units: 1,
				activation: "sigmoid" // sigmoid | relu
			}));
			model.add(tf.layers.dense({
				units: outputShape,
				activation: "softmax" // sigmoid | softmax
			}));
		} else if(t6Model.strategy==="forecast") {
			const input_layer_neurons = 100;
			const rnn_input_layer_features = 2; // TODO : if it's the feature it should be dynamic (10)
			const rnn_input_layer_timesteps = input_layer_neurons / rnn_input_layer_features;
			const n_layers = 5;
			const rnn_input_shape = [rnn_input_layer_features, rnn_input_layer_timesteps];
			const rnn_output_neurons = 20;
			const output_layer_shape = rnn_output_neurons;
			const output_layer_neurons = 1;
			t6console.debug("buildModel input_layer_neurons", input_layer_neurons);
			t6console.debug("buildModel rnn_input_layer_features", rnn_input_layer_features);
			t6console.debug("buildModel rnn_input_layer_timesteps", rnn_input_layer_timesteps);
			t6console.debug("buildModel n_layers", n_layers);
			t6console.debug("buildModel rnn_input_shape", rnn_input_shape);
			t6console.debug("buildModel rnn_output_neurons", rnn_output_neurons);
			t6console.debug("buildModel output_layer_shape", output_layer_shape);
			t6console.debug("buildModel output_layer_neurons", output_layer_neurons);
			model.add(tf.layers.dense({units: input_layer_neurons, inputShape: inputShape})); // [50] ????
			model.add(tf.layers.reshape({targetShape: rnn_input_shape}));
			let lstm_cells = [];
			for (let index=0; index<n_layers; index++) {
				lstm_cells.push(tf.layers.lstmCell({ units: rnn_output_neurons }));
			}
			/*
			model.add(tf.layers.lstm({
				units: 64, // Number of LSTM units
				inputShape: inputShape, // Shape of the input data (time steps, features)
				returnSequences: true // Set to true if you have multiple time steps
			}));
			*/
			model.add(tf.layers.rnn({
				cell: lstm_cells,
				inputShape: rnn_input_shape,
				returnSequences: false
			}));
			model.add(tf.layers.dense({ units: output_layer_neurons, inputShape: [output_layer_shape] }));
		}

		let optimizer;
		let learningrate = typeof t6Model.compile.learningrate?t6Model.compile.learningrate:0.001;
		switch(t6Model.compile.optimizer) {
			case "adagrad":
				optimizer = tf.train.adagrad(learningrate);
				break;
			case "adadelta":
				optimizer = tf.train.adadelta(learningrate);
				break;
			case "adamax":
				optimizer = tf.train.adamax(learningrate);
				break;
			case "rmsprop":
				optimizer = tf.train.rmsprop(learningrate);
				break;
			case "momentum":
				optimizer = tf.train.momentum(learningrate);
				break;
			case "sgd":
				optimizer = tf.train.sgd(learningrate);
				break;
			case "adam":
			default:
				optimizer = tf.train.adam(learningrate);
				break;
		}
		model.compile({
			optimizer: optimizer,
			loss: typeof t6Model.compile.loss!=="undefined"?t6Model.compile.loss:"binaryCrossentropy",
			metrics: typeof t6Model.compile.metrics!=="undefined"?t6Model.compile.metrics:["accuracy"]
		});
		t6console.debug("MODEL weights:");
		model.weights.forEach(w => {
			t6console.debug(" ", w.name, w.shape);
		});
		resolve(model);
	});
};

t6machinelearning.getIndexedLabel = function(label) {
	return (typeof label!=="undefined" && labels.indexOf(label)>-1 && label!==null)?labels.indexOf(label):0;
};

t6machinelearning.loadDataSets = async function(data, t6Model, testSize) {
	return await new Promise((resolve) => {
		//t6console.debug("raw data", data);
		return tf.tidy(() => {
			let batchSize = t6Model.batch_size;
			if(t6Model.shuffle===true) {
				tf.util.shuffle(data);
			}
			const normalize = (inputData, min, max) => {
				return typeof inputData!=="undefined"?(parseFloat(inputData) - min)/(max - min):0;
			};
			const splitToArray = (inputData, splitStr=" ") => {
				return typeof inputData!=="undefined"?inputData.split(splitStr):0;
			};
			const oneHotEncode = (classIndex, classes) => {
				return Array.from(tf.oneHot(classIndex, classes.length).dataSync());
				//return tf.oneHot(classIndex, classes.length).dataSync();
			};
			const x = data.map((r) => {
				let result = [];
				let featureValues = [];
				continuousFeats.forEach((f) => {
					featureValues[f] = [];
					if (continuousFeats.indexOf(f) > -1) {
						if (t6Model.normalize === true) {
							const min = continuousFeatsMins[f][r.flow_id];
							const max = continuousFeatsMaxs[f][r.flow_id];
							return featureValues[f].push(normalize(r[f], min, max)); // normalize // TODO: ADDING TWICE because value is on both flows
						} else if (t6Model.splitToArray === true) {
							return featureValues[f].push(splitToArray(r[f]));
						} else {
							return featureValues[f].push(r[f]);
						}
					}
				});
				continuousFeats.map((f) => {
					if (featureValues[f].length > 0) {
						result.push(featureValues[f]);
					}
				});
				Object.keys(categoricalFeats).map((f) => {
					featureValues[f] = [];
					let indexInCategory = categoricalFeats[f].indexOf(r[f]);
					let classes = [...categoricalFeats[f]];
					if(classes.length<2) {
						classes.unshift(0);
					}
					indexInCategory = indexInCategory>-1?indexInCategory:0; // by default de 0 indexed oneHot.. because we unshifted a "0"
					// TODO: But, it might bug, since we unshift only when not yet existing ... and user can force a zero value at a index > 0 !!
					// So we should juste have: let indexInCategory = classes.indexOf(r[f]); ??
					const oneHotEncoded = oneHotEncode(indexInCategory, classes);
					return featureValues[f].push(...oneHotEncoded); // ...
				});
				Object.keys(categoricalFeats).map((f) => {
					if(featureValues[f].length>0) {
						result.push(featureValues[f]);
					}
				});
				//t6console.debug("result1", result);
				//t6console.debug("result2", tf.util.flatten(result));
				return tf.util.flatten(result);
			});
			const y = data.map((r) => {
				//t6console.debug("y label", r.value, r.label, r.meta.categories[0]);
				return oneHotEncode(t6Model.labels.indexOf(r.label), t6Model.labels);
			});

			const featureTensor = x;
			const labelTensor = y;
			const xTensor = tf.tensor2d(featureTensor);
			const yTensor = tf.tensor2d(labelTensor);
			const splitIdx = parseInt((1 - testSize) * data.length, 10);
			const ds = tf.data
				.zip({
					xs: tf.data.array(featureTensor),
					ys: tf.data.array(labelTensor)
				});

			resolve({
				trainDs: ds.take(splitIdx).batch(batchSize),
				validDs: ds.skip(splitIdx + 1).batch(batchSize),
				xTensor: xTensor,
				xArray: tf.data.array(featureTensor),
				yTensor: yTensor,
				trainXs: featureTensor,
				trainYs: labelTensor,
				xValidSize: ds.skip(splitIdx + 1).size
			});
		});
	});
};

t6machinelearning.loadDataSets_v2 = async function(dataMap, t6Model) {
	return await new Promise((resolve) => {
		//return tf.tidy(() => {
			// Prepare arrays for the aggregated data
			//const times		= Array.from(dataMap.keys());
			const times		= Array.from(dataMap.keys()).map(time => time);
			const values	= Array.from(dataMap.values()).map(data => data.values);
			const flow_ids	= Array.from(dataMap.values()).map(data => data.flow_ids).flat();
			const labels	= Array.from(dataMap.values()).map(data => data.labels).flat();

			// Convert arrays to tensors
			const timeTensor	= tf.tensor2d(times.map((time) => [time]), [times.length, 1]); // TODO : might adjust according to number of features ?
			const valuesTensor	= tf.tensor2d(values.map((value) => value));
			const flowsTensor	= tf.tensor2d(flow_ids);
			const labelsTensor	= tf.tensor2d(labels);

			// Concatenate tensors along axis 1
			const inputTensor = tf.concat([timeTensor, valuesTensor, flowsTensor, labelsTensor], 1);
			const mergedArray = inputTensor.arraySync();
			//t6console.debug("mergedArray data:", mergedArray);
			
			//labels.map((l) => {
				//t6console.log("LABEL", l);
			//});
			let featuresTensor = mergedArray;
			if(t6Model.shuffle===true) {
				tf.util.shuffle(inputTensor);
			}
			//featuresTensor.map((feat) => {
			//	if (t6Model.split_to_array === true) {
			//	}
			//});

			/*
				t6Model.training_balance = {};
				if(t6Model.labels.indexOf("oov")===-1) { t6Model.labels.push("oov"); }
				t6Model.training_balance["oov"] = 0;
				let data = mergedArray.map((m) => {
					let label = m;
					let category_id = t6Model.labels[label];
					t6console.log("category_id", m.length, m.pop(), label, category_id);
					if(category_id!==null && category_id!=="oov") {
						m.label = categories.findOne({id: category_id}).name;
						if(m.label && t6Model.labels.indexOf(m.label)===-1) {
							t6Model.labels.push(m.label);
							t6console.debug("category found and added", category_id, t6Model.labels.indexOf(m.label));
						}
						if(m.label && typeof t6Model.training_balance[m.label]!=="undefined") {
							t6Model.training_balance[m.label]++;
						} else {
							t6Model.training_balance[m.label] = 1;
						}
					} else {
						m.label = "oov";
						if(typeof t6Model.training_balance[m.label]!=="undefined") {
							t6Model.training_balance[m.label]++;
						} else {
							t6Model.training_balance[m.label] = 1;
						}
					}
					return m;
				});
			*/
			
			//t6console.debug("t6Model", t6Model);
			// GET BALANCED DATA
			// get random values until it reach balance_limit on each labels
			/*
			let iData = [];
			t6Model.labels.map( (label) => {
				const label_name = label;
				const dataLabel = featuresTensor.filter((f) => f.label===label_name)	// get only the current label
					.sort(() => Math.random() - 0.5)						// shuffle the results with the current label
					.slice(0, t6Model.datasets.training.balance_limit);		// take only requested limit values
				t6Model.training_balance[label] = dataLabel.length;
				iData = iData.concat(dataLabel);
			});
			t6Model.data_length = iData.length;
			*/
			t6machinelearning.init(t6Model);
			if (t6Model.continuous_features?.length > 0) {
				t6Model.continuous_features.map((cName) => {
					t6Model.flow_ids.map((f_id) => {
						t6machinelearning.addContinuous(cName, f_id, t6Model.min[f_id], t6Model.max[f_id]);
					});
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

			//t6console.debug("times", times);
			//t6console.debug("values", values);
			//t6console.debug("flow_ids", flow_ids);
			//t6console.debug("labels", labels);
			//t6console.debug("timeTensor data:", timeTensor.arraySync());
			//t6console.debug("valuesTensor data:", valuesTensor.arraySync());
			//t6console.debug("flowsTensor data:", flowsTensor.arraySync());
			//t6console.debug("labelsTensor data:", labelsTensor.arraySync());
			//t6console.debug("featuresTensor data:", featuresTensor);
			// For a single Flow it should looks like: [[ 1709155549184, -1, 0, 0 ], [ 1708966281216, 1, 0, 1 ], ... ]
			//											  timestamp normalized?Value flowId LabelIndex

			resolve({valuesTensor, flowsTensor, labelsTensor, inputTensor, featuresTensor});
		//});
	});
};

t6machinelearning.trainModelDs = async function(model, dataset, options) {
	return await new Promise((resolve) => {
		resolve(model.fitDataset(dataset, options));
	});
};

t6machinelearning.trainModel = async function(model, x, y, options) {
	return await new Promise((resolve) => {
		resolve(model.fit(x, y, options));
	});
};

t6machinelearning.evaluateModelDs = async function(model, testingData) {
	const result = await model.evaluateDataset(testingData);
	return await new Promise((resolve) => {
		const testLoss = result[0].dataSync()[0];
		const testAcc = result[1].dataSync()[0];
		//t6console.debug("testLoss", testLoss.toFixed(4));
		//t6console.debug("testAcc", testAcc.toFixed(4));
		resolve({loss: testLoss.toFixed(4), accuracy: testAcc.toFixed(4)});
	});
};

t6machinelearning.evaluateModel = async function(model, x, y) {
	const result = await model.evaluate(x, y);
	return await new Promise((resolve) => {
		const testLoss = result[0].dataSync()[0];
		const testAcc = result[1].dataSync()[0];
		//t6console.debug("testLoss", testLoss.toFixed(4));
		//t6console.debug("testAcc", testAcc.toFixed(4));
		resolve({loss: testLoss.toFixed(4), accuracy: testAcc.toFixed(4)});
	});
};

t6machinelearning.save = async function(model, path) {
	return await new Promise((resolve) => {
		model.save(path).then(() => {
			resolve(path);
		});
	});
};

t6machinelearning.loadSavedModel = async function(path) {
	return new Promise((resolve, reject) => {
		tf.node.loadSavedModel(path, ["serve"], "serving_default").then((result) => {
			resolve(result);
		}).catch(function(err) {
			reject(err);
		});
	});
};

t6machinelearning.loadLayersModel = async function(path, t6Model) {
	t6console.debug("loadLayersModel");
	return new Promise((resolve, reject) => {
		t6console.debug("before init");
		t6machinelearning.init(t6Model);
		t6console.debug("end init");
		tf.loadLayersModel(path).then((result) => {
			resolve(result);
		}).catch(function(err) {
			reject(err);
		});
	});
};

t6machinelearning.getMetaGraphsFromSavedModel = async function(path) {
	return new Promise((resolve, reject) => {
		tf.node.getMetaGraphsFromSavedModel(path).then((result) => {
			resolve(result);
		}).catch(function(err) {
			reject(err);
		});
	});
};

t6machinelearning.predict = async function(tfModel, inputDatasetX, options={}) {
	return new Promise((resolve) => {
		let prediction;
		t6console.debug("ML PREDICTION strategy", t6Model.strategy);
		if(t6Model.strategy==="classification") {
			prediction = tfModel.predict(inputDatasetX, options);
		} else if(t6Model.strategy==="forecast") {
			prediction = tfModel.predict(tf.tensor(inputDatasetX), options); // TODO using tensor ????
		}
		const argMaxIndex = tf.argMax(prediction, 1).dataSync()[0];
		t6console.debug("ML PREDICTION argMaxIndex", argMaxIndex);
		t6console.debug("ML PREDICTION:"); // I should not have [ [[1],]] but [ [[1, 0],]] ????
		prediction.print();
		resolve(prediction);
	});
};

module.exports = t6machinelearning;
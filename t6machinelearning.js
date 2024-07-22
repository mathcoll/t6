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
		t6console.debug("INIT Model strategy", typeof t6Model.strategy!=="undefined"?t6Model.strategy:"classification");
		t6console.debug("INIT Model Normalize", t6Model.normalize);
		t6console.debug("INIT Model splitToArray", t6Model.splitToArray);
		t6console.debug("INIT Model shuffle", t6Model.shuffle);
		t6console.debug("INIT Model labels", t6Model.labels);
		t6console.debug("INIT Model labelsCount", t6Model.labels.length);
		t6console.debug("INIT Model batch_size", t6Model.batch_size);
		t6console.debug("INIT Model data_length", t6Model.data_length);
		t6console.debug("INIT Model min", t6Model.min);
		t6console.debug("INIT Model max", t6Model.max);
		t6console.debug("INIT Model minorityClass", t6Model.minorityClass);
		t6console.debug("INIT Model validation_split", t6Model.validation_split);
		t6console.debug("INIT Model training_balance:", t6Model.training_balance);
		t6console.debug("INIT Model balancedDatapointsCount", t6Model.balancedDatapointsCount);
		t6console.debug("INIT Model Compile optimizer", typeof t6Model.compile?.optimizer!=="undefined"?t6Model.compile?.optimizer:"adam");
		t6console.debug("INIT Model Compile loss", typeof t6Model.compile?.loss!=="undefined"?t6Model.compile?.loss:"binaryCrossentropy");
		t6console.debug("INIT Model Compile metrics", typeof t6Model.compile?.metrics!=="undefined"?t6Model.compile?.metrics:["accuracy"]);
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

t6machinelearning.getLayer = async function(l) {
	return await new Promise((resolve) => {
		let layer;
		let rnn_output_neurons = 20;
		l.name = typeof l.name!=="undefined"?l.name.replace(/[^\w+]/gim, "_").trim():"";
		switch(l.mode) {
			case "dropout":
				l.rate = typeof l.rate!=="undefined"?l.rate:0.2;
				layer = tf.layers.dropout(l);
				break;
			case "reshape":
				l.targetShape = parseInt(l.ndim, 10)>-1?[l.ndim, l.inputShape]:l.inputShape;
				layer = tf.layers.reshape({name: l.name, targetShape: l.targetShape});
				t6console.debug("LAYER reshape inputShape", l.inputShape);
				t6console.debug("LAYER reshape targetShape", l.targetShape);
				// l.inputShape = [l.inputShape];
				// layer = tf.layers.dense(l);
				break;
			case "lstm":
				l.targetShape = parseInt(l.ndim, 10)>-1?[1, l.ndim, l.inputShape]:l.inputShape;
				l.returnSequences = typeof l.returnSequences!=="undefined"?l.returnSequences:true;
				l.cellNumber = typeof l.cellNumber!=="undefined"?l.cellNumber:1;
				layer = tf.layers.reshape({targetShape: l.targetShape});
				t6console.debug("LAYER lstm inputShape", l.inputShape);
				t6console.debug("LAYER lstm targetShape", l.targetShape);
				l.cell = [];
				for (let i=0; i<l.cellNumber; i++) {
					(l.cell).push(tf.layers.lstmCell({units: rnn_output_neurons}));
				}
				layer = tf.layers.lstm(l);
				break;
			case "simpleRNN":
				l.inputShape = [1, l.inputShape];
				l.returnSequences = typeof l.returnSequences!=="undefined"?l.returnSequences:true;
				layer = tf.layers.simpleRNN(l);
				break;
			case "rnn":
				l.inputShape = [1, l.inputShape];
				l.returnSequences = typeof l.returnSequences!=="undefined"?l.returnSequences:true;
				l.cellNumber = typeof l.cellNumber!=="undefined"?l.cellNumber:1;
				l.cell = [];
				for (let i=0; i<l.cellNumber; i++) {
					(l.cell).push(tf.layers.lstmCell({units: rnn_output_neurons}));
				}
				layer = tf.layers.rnn(l);
				break;
			case "dense":
			default:
				l.mode = "dense";
				layer = tf.layers.dense(l);
				break;
		}
		// t6console.debug("buildModel getLayer", l);
		resolve(layer);
	});
}

t6machinelearning.addLayersToModel = async function(model, inputShape, outputShape) {
	return await new Promise((resolve) => {
		let mdls=0;
		mdls = t6Model.layers.map(async (layer) => {
			if (layer.type==="input") {
				layer.inputShape = inputShape;
			}
			if (layer.type==="hidden") {
				layer.inputShape = inputShape;
				layer.units = typeof layer.units!=="undefined"?layer.units:1;
			}
			if (layer.type==="output") {
				layer.units = outputShape;
			}
			t6console.debug(`ML MODEL ADDING ${layer.type} layer`, layer.mode, `${layer.units} unit(s)`, layer.activation);
			await model.add(await t6machinelearning.getLayer(layer));
			return mdls++;
		});
		t6console.debug(`ML MODEL ADDED ${mdls.length} layers`);
		resolve(mdls);
	});
}

t6machinelearning.createSequences = function(data, sequenceLength) {
	const xs = [];
	const ys = [];
	for (let i = 0; i < data.length - sequenceLength; i++) {
		const x = data.slice(i, i + sequenceLength).map(value => [value]);
		const y = data[i + sequenceLength];
		xs.push(x);
		ys.push(y);
	}
	return [tf.tensor3d(xs), tf.tensor2d(ys, [ys.length, 1])];
}

t6machinelearning.buildModel = async function(inputShape, outputShape) {
	return await new Promise(async (resolve) => {
		const model = tf.sequential();
		let mdls = await t6machinelearning.addLayersToModel(model, inputShape, outputShape);
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
		t6console.debug("ML MODEL COMPILING");
		model.compile({
			optimizer: optimizer,
			loss: typeof t6Model.compile.loss!=="undefined"?t6Model.compile.loss:"binaryCrossentropy",
			metrics: typeof t6Model.compile.metrics!=="undefined"?t6Model.compile.metrics:["accuracy"]
		});
		t6console.debug("ML MODEL weights:");
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
							return featureValues[f].push(normalize(r[f], min, max));
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
			const ds = tf.data.zip({
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
	//return await new Promise((resolve) => {
		return tf.tidy(() => {
			t6machinelearning.init(t6Model);
			let batchSize = t6Model.batch_size;

			// Prepare arrays for the aggregated data
			const times			= Array.from(dataMap.keys()).map((time) => parseInt(time, 10));
			const values		= Array.from(dataMap.values()).map((data) => data.values); //.flat();
			const flow_ids		= Array.from(dataMap.values()).map((data) => data.flow_ids); //.flat();
			const labels		= Array.from(dataMap.values()).map((data) => data.labels); //.flat();
			t6console.debug("loadDataSets_v2 2 dataMap.size", dataMap.size);

			// t6console.debug("loadDataSets_v2 2 time.length", times.length);
			// times.map((time, i) => {
			// 	t6console.debug("loadDataSets_v2 2 time", i+1, time);
			// });
			// t6console.debug("loadDataSets_v2 2 values.length", values.length);
			// values.map((value, i) => {
			// 	t6console.debug("loadDataSets_v2 2 value", i+1, value);
			// });
			// t6console.debug("loadDataSets_v2 2 flow_ids.length", flow_ids.length);
			// flow_ids.map((flow, i) => {
			// 	t6console.debug("loadDataSets_v2 2 flow", i+1, flow);
			// });
			// t6console.debug("loadDataSets_v2 2 labels.length", labels.length);
			// labels.map((label, i) => {
			// 	t6console.debug("loadDataSets_v2 2 label", i+1, label);
			// });

			// Convert arrays to tensor
			const timeTensor	= tf.tensor(times.map((time) => time));
			t6console.debug("loadDataSets_v2 3 timeTensor.size", timeTensor.size);
			t6console.debug("loadDataSets_v2 3 timeTensor.shape", timeTensor.shape);

			const valuesTensor	= tf.tensor(values.map((value) => value));
			t6console.debug("loadDataSets_v2 3 valuesTensor.size", valuesTensor.size);
			t6console.debug("loadDataSets_v2 3 valuesTensor.shape", valuesTensor.shape);

			const flowsTensor	= tf.tensor(flow_ids.map((flow_id) => flow_id));
			t6console.debug("loadDataSets_v2 3 flowsTensor.size", flowsTensor.size);
			t6console.debug("loadDataSets_v2 3 flowsTensor.shape", flowsTensor.shape);

			const labelsTensor	= tf.tensor(labels.map((label) => label));
			t6console.debug("loadDataSets_v2 3 labelsTensor.size", labelsTensor.size);
			t6console.debug("loadDataSets_v2 3 labelsTensor.shape", labelsTensor.shape);
			//const reshapedLabelsTensor = labelsTensor.reshape([times.length, t6Model.labels.length]);
			let reshapedLabelsTensor;
			if (!t6Model.predictionInProgress) {
				t6console.debug("loadDataSets_v2 3 t6Model.flow_ids.length", t6Model.flow_ids.length);
				t6console.debug("loadDataSets_v2 3 t6Model.labels.length", t6Model.labels.length);
				t6console.debug("loadDataSets_v2 3 labelsTensor.size", labelsTensor.size);
				t6console.debug("loadDataSets_v2 3 labelsTensor.shape", labelsTensor.shape);
				if(t6Model.labels.length===0) {
					reshapedLabelsTensor = labelsTensor.reshape([times.length, t6Model.flow_ids.length]);
				} else {
					reshapedLabelsTensor = labelsTensor.reshape([times.length, t6Model.flow_ids.length * t6Model.labels.length]);
				}
				// reshapedLabelsTensor = labelsTensor.reshape([times.length, t6Model.labels.length]);
				t6console.debug("loadDataSets_v2 3 reshapedLabelsTensor.size", reshapedLabelsTensor.size);
				t6console.debug("loadDataSets_v2 3 reshapedLabelsTensor.shape", reshapedLabelsTensor.shape);
			}
			let components = [];
			if (t6Model.continuous_features.indexOf("value") > -1) {
				components.push(valuesTensor);
				t6console.debug("loadDataSets_v2 Added values to concat components");
			}
			if (t6Model.continuous_features.indexOf("time") > -1) {
				// t6Model.min["time"] = tf.min(timeTensor, 0, true).arraySync();
				// t6Model.max["time"] = tf.max(timeTensor, 0, true).arraySync();
				// t6console.debug("loadDataSets_v2 timeTensor MIN :", tf.min(timeTensor, 0, true).arraySync());
				// t6console.debug("loadDataSets_v2 timeTensor MAX", tf.max(timeTensor, 0, true).arraySync());
				components.push(timeTensor.reshape([timeTensor.size, 1])); // Reshape time
				t6console.debug("loadDataSets_v2 Added times to concat components");
			}
			if (t6Model.continuous_features.indexOf("flow") > -1) { // TODO : Should not be a continuous feature TODO TODO TODO
				components.push(flowsTensor);
				t6console.debug("loadDataSets_v2 Added flows to concat components");
			}
			
			t6console.debug("loadDataSets_v2 concatenating components", components.map((c) => {return c.shape;}));
			let inputTensor = tf.concat(components, 1);

			const mergedArray = inputTensor.arraySync();

			let featuresTensor = mergedArray;
			if(t6Model.shuffle===true) {
				t6console.debug("loadDataSets_v2 Shuffling data");
				tf.util.shuffle(inputTensor);
			}

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

			// t6console.debug("LOADING DS times", times);
			// t6console.debug("LOADING DS values", values);
			// t6console.debug("LOADING DS flow_ids", flow_ids);
			// t6console.debug("LOADING DS labels", labels);

			// t6console.debug("LOADING DS timeTensor data:", timeTensor.arraySync());
			// t6console.debug("LOADING DS valuesTensor data:", valuesTensor.arraySync());
			// t6console.debug("LOADING DS flowsTensor data:", flowsTensor.arraySync());
			// t6console.debug("LOADING DS labelsTensor data:", labelsTensor.arraySync());
			// t6console.debug("LOADING DS featuresTensor data:", featuresTensor);

			// t6console.debug("LOADING DS batchSize:", batchSize);
			// t6console.debug("LOADING DS times.length:", times.length);
			// t6console.debug("LOADING DS values.length:", values.length);
			// t6console.debug("LOADING DS flow_ids.length:", flow_ids.length);
			// t6console.debug("LOADING DS labels.length:", labels.length);
			// t6console.debug("");
			// t6console.debug("LOADING DS timeTensor.size:", timeTensor.size);
			// t6console.debug("LOADING DS valuesTensor.size:", valuesTensor.size);
			// t6console.debug("LOADING DS flowsTensor.size:", flowsTensor.size);
			// t6console.debug("LOADING DS labelsTensor.size:", labelsTensor.size);
			// t6console.debug("LOADING DS reshapedLabelsTensor.size:", reshapedLabelsTensor?.size);
			// t6console.debug("LOADING DS inputTensor.size:", inputTensor.size);
			// t6console.debug("");
			// t6console.debug("LOADING DS timeTensor.shape:", timeTensor.shape);
			// t6console.debug("LOADING DS valuesTensor.shape:", valuesTensor.shape);
			// t6console.debug("LOADING DS flowsTensor.shape:", flowsTensor.shape);
			// t6console.debug("LOADING DS labelsTensor.shape:", labelsTensor.shape);
			// t6console.debug("LOADING DS reshapedLabelsTensor.shape:", reshapedLabelsTensor?.shape);
			// t6console.debug("LOADING DS inputTensor.shape:", inputTensor.shape);
			// t6console.debug("");
			// t6console.debug("LOADING DS timeTensor.dtype:", timeTensor.dtype);
			// t6console.debug("LOADING DS valuesTensor.dtype:", valuesTensor.dtype);
			// t6console.debug("LOADING DS flowsTensor.dtype:", flowsTensor.dtype);
			// t6console.debug("LOADING DS labelsTensor.dtype:", labelsTensor.dtype);
			// t6console.debug("LOADING DS reshapedLabelsTensor.dtype:", reshapedLabelsTensor?.dtype);
			// t6console.debug("LOADING DS inputTensor.dtype:", inputTensor.dtype);
			// t6console.debug("");

			//resolve({valuesTensor, flowsTensor, balancedInputTensor, balancedLabelsTensor, shuffledData});
			return {valuesTensor, flowsTensor, labelsTensor: reshapedLabelsTensor, inputTensor, featuresTensor};
		}); // END OF tf.tidy(
	//});
};

t6machinelearning.loadDataSets_timeseries = async function(dataMap, t6Model) {
	//return await new Promise((resolve) => {
		return tf.tidy(() => {
			t6machinelearning.init(t6Model);
			let batchSize = t6Model.batch_size;
			const sequenceLength = 1;

			// Prepare arrays for the aggregated data
			const times			= Array.from(dataMap.keys()).map((time) => parseInt(time, 10));
			const values		= Array.from(dataMap.values()).map((data) => data.values); //.flat();
			const flow_ids		= Array.from(dataMap.values()).map((data) => data.flow_ids); //.flat();
			const labels		= Array.from(dataMap.values()).map((data) => data.labels); //.flat();
			t6console.debug("loadDataSets_timeseries 2 dataMap.size", dataMap.size);

			// t6console.debug("loadDataSets_timeseries 2 time.length", times.length);
			// times.map((time, i) => {
			// 	t6console.debug("loadDataSets_timeseries 2 time", i+1, time);
			// });
			// t6console.debug("loadDataSets_timeseries 2 values.length", values.length);
			// values.map((value, i) => {
			// 	t6console.debug("loadDataSets_timeseries 2 value", i+1, value);
			// });
			// t6console.debug("loadDataSets_timeseries 2 flow_ids.length", flow_ids.length);
			// flow_ids.map((flow, i) => {
			// 	t6console.debug("loadDataSets_timeseries 2 flow", i+1, flow);
			// });
			// t6console.debug("loadDataSets_timeseries 2 labels.length", labels.length);
			// labels.map((label, i) => {
			// 	t6console.debug("loadDataSets_timeseries 2 label", i+1, label);
			// });

			// t6console.debug("loadDataSets_timeseries 3 values", values.flat());
			const [valuesTensor, labelsTensor] = t6machinelearning.createSequences(values.flat(), sequenceLength);
			// t6console.debug("loadDataSets_timeseries 3 valuesTensor", valuesTensor);
			// t6console.debug("loadDataSets_timeseries 3 labelsTensor", labelsTensor);
			// valuesTensor.print(true);

			// Convert arrays to tensor
			const timeTensor	= tf.tensor(times.map((time) => time));
			t6console.debug("loadDataSets_timeseries 3 timeTensor.size", timeTensor.size);
			t6console.debug("loadDataSets_timeseries 3 timeTensor.shape", timeTensor.shape);

			// const valuesTensor	= tf.tensor(values.map((value) => value));
			// t6console.debug("loadDataSets_timeseries 3 valuesTensor.size", valuesTensor.size);
			// t6console.debug("loadDataSets_timeseries 3 valuesTensor.shape", valuesTensor.shape);

			const flowsTensor	= tf.tensor(flow_ids.map((flow_id) => flow_id));
			t6console.debug("loadDataSets_timeseries 3 flowsTensor.size", flowsTensor.size);
			t6console.debug("loadDataSets_timeseries 3 flowsTensor.shape", flowsTensor.shape);

			// const labelsTensor	= tf.tensor(labels.map((label) => label));
			// t6console.debug("loadDataSets_timeseries 3 labelsTensor.size", labelsTensor.size);
			// t6console.debug("loadDataSets_timeseries 3 labelsTensor.shape", labelsTensor.shape);
			//const reshapedLabelsTensor = labelsTensor.reshape([times.length, t6Model.labels.length]);
			let reshapedLabelsTensor;
			if (!t6Model.predictionInProgress) {
				t6console.debug("loadDataSets_timeseries 3 t6Model.flow_ids.length", t6Model.flow_ids.length);
				t6console.debug("loadDataSets_timeseries 3 t6Model.labels.length", t6Model.labels.length);
				t6console.debug("loadDataSets_timeseries 3 labelsTensor.size", labelsTensor.size);
				t6console.debug("loadDataSets_timeseries 3 labelsTensor.shape", labelsTensor.shape);
				t6console.debug("loadDataSets_timeseries 3 t6Model.labels.length", t6Model.labels.length);
				if(t6Model.labels.length===0) {
					// reshapedLabelsTensor = labelsTensor.reshape([times.length, t6Model.flow_ids.length]); // ERROR "Message: Input to reshape is a tensor with 38 values, but the requested shape has 48"
					reshapedLabelsTensor = labelsTensor.reshape([times.length-sequenceLength, t6Model.flow_ids.length]); // ERROR during training: "ValueError: Total size of new array must be unchanged."
				} else {
					reshapedLabelsTensor = labelsTensor.reshape([times.length, t6Model.flow_ids.length * t6Model.labels.length]);
				}
				// reshapedLabelsTensor = labelsTensor.reshape([times.length, t6Model.labels.length]);
				t6console.debug("loadDataSets_timeseries 3 reshapedLabelsTensor.size", reshapedLabelsTensor.size);
				t6console.debug("loadDataSets_timeseries 3 reshapedLabelsTensor.shape", reshapedLabelsTensor.shape);
			}
			let components = [];
			if (t6Model.continuous_features.indexOf("value") > -1) {
				components.push(valuesTensor);
				t6console.debug("loadDataSets_timeseries Added values to concat components");
			}
			if (t6Model.continuous_features.indexOf("time") > -1) {
				// t6Model.min["time"] = tf.min(timeTensor, 0, true).arraySync();
				// t6Model.max["time"] = tf.max(timeTensor, 0, true).arraySync();
				// t6console.debug("loadDataSets_v2 timeTensor MIN :", tf.min(timeTensor, 0, true).arraySync());
				// t6console.debug("loadDataSets_v2 timeTensor MAX", tf.max(timeTensor, 0, true).arraySync());
				components.push(timeTensor.reshape([timeTensor.size, 1])); // Reshape time
				t6console.debug("loadDataSets_timeseries Added times to concat components");
			}
			if (t6Model.continuous_features.indexOf("flow") > -1) { // TODO : Should not be a continuous feature TODO TODO TODO
				components.push(flowsTensor);
				t6console.debug("loadDataSets_timeseries Added flows to concat components");
			}
			
			t6console.debug("loadDataSets_timeseries concatenating components", components.map((c) => {return c.shape;}));
			let inputTensor = tf.concat(components, 1);

			const mergedArray = inputTensor.arraySync();

			let featuresTensor = mergedArray;
			if(t6Model.shuffle===true) {
				t6console.debug("loadDataSets_timeseries Shuffling data");
				tf.util.shuffle(inputTensor);
			}

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

			// t6console.debug("LOADING DS times", times);
			// t6console.debug("LOADING DS values", values);
			// t6console.debug("LOADING DS flow_ids", flow_ids);
			// t6console.debug("LOADING DS labels", labels);

			// t6console.debug("LOADING DS timeTensor data:", timeTensor.arraySync());
			// t6console.debug("LOADING DS valuesTensor data:", valuesTensor.arraySync());
			// t6console.debug("LOADING DS flowsTensor data:", flowsTensor.arraySync());
			// t6console.debug("LOADING DS labelsTensor data:", labelsTensor.arraySync());
			// t6console.debug("LOADING DS featuresTensor data:", featuresTensor);

			// t6console.debug("LOADING DS batchSize:", batchSize);
			// t6console.debug("LOADING DS times.length:", times.length);
			// t6console.debug("LOADING DS values.length:", values.length);
			// t6console.debug("LOADING DS flow_ids.length:", flow_ids.length);
			// t6console.debug("LOADING DS labels.length:", labels.length);
			// t6console.debug("");
			// t6console.debug("LOADING DS timeTensor.size:", timeTensor.size);
			// t6console.debug("LOADING DS valuesTensor.size:", valuesTensor.size);
			// t6console.debug("LOADING DS flowsTensor.size:", flowsTensor.size);
			// t6console.debug("LOADING DS labelsTensor.size:", labelsTensor.size);
			// t6console.debug("LOADING DS reshapedLabelsTensor.size:", reshapedLabelsTensor?.size);
			// t6console.debug("LOADING DS inputTensor.size:", inputTensor.size);
			// t6console.debug("");
			// t6console.debug("LOADING DS timeTensor.shape:", timeTensor.shape);
			// t6console.debug("LOADING DS valuesTensor.shape:", valuesTensor.shape);
			// t6console.debug("LOADING DS flowsTensor.shape:", flowsTensor.shape);
			// t6console.debug("LOADING DS labelsTensor.shape:", labelsTensor.shape);
			// t6console.debug("LOADING DS reshapedLabelsTensor.shape:", reshapedLabelsTensor?.shape);
			// t6console.debug("LOADING DS inputTensor.shape:", inputTensor.shape);
			// t6console.debug("");
			// t6console.debug("LOADING DS timeTensor.dtype:", timeTensor.dtype);
			// t6console.debug("LOADING DS valuesTensor.dtype:", valuesTensor.dtype);
			// t6console.debug("LOADING DS flowsTensor.dtype:", flowsTensor.dtype);
			// t6console.debug("LOADING DS labelsTensor.dtype:", labelsTensor.dtype);
			// t6console.debug("LOADING DS reshapedLabelsTensor.dtype:", reshapedLabelsTensor?.dtype);
			// t6console.debug("LOADING DS inputTensor.dtype:", inputTensor.dtype);
			// t6console.debug("");

			//resolve({valuesTensor, flowsTensor, balancedInputTensor, balancedLabelsTensor, shuffledData});
			return {valuesTensor, flowsTensor, labelsTensor: reshapedLabelsTensor, inputTensor, featuresTensor};
		}); // END OF tf.tidy(
	//});
};

t6machinelearning.dispose = function(model) {
	model.dispose();
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
		prediction = tfModel.predict(inputDatasetX, options);
		const argMaxIndex = tf.argMax(prediction, 1).dataSync()[0];
		t6console.debug("ML PREDICTION argMaxIndex", argMaxIndex);
		t6console.debug("ML PREDICTION:");
		prediction.print();
		resolve(prediction);
	});
};

module.exports = t6machinelearning;
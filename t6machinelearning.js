"use strict";
var t6machinelearning = module.exports = {};
const tf = require("@tensorflow/tfjs-node"); // Load the binding (CPU computation)
//require("@tensorflow/tfjs-node-gpu"); // Or load the binding (GPU computation)
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

t6machinelearning.init = function(t6Model) {
	t6Model = t6Model;
	continuousFeats = [];
	continuousFeatsMins = [];
	continuousFeatsMaxs = [];
	categoricalFeats = [];
	t6console.debug("================== t6machinelearning.init =================");
	t6console.debug("labels", t6Model.labels);
	t6console.debug("labelsCount", t6Model.labels.length);
	t6console.debug("batch_size", t6Model.batch_size);
	t6console.debug("min", t6Model.min);
	t6console.debug("max", t6Model.max);
	t6console.debug("===========================================================");
};

t6machinelearning.addContinuous = function(featureName, min, max) {
	continuousFeatsMins[featureName] = min;
	continuousFeatsMaxs[featureName] = max;
	continuousFeats.push(featureName);
	t6console.debug(`ADDED "${featureName}" to Continuous Features, and having min: ${min} / max: ${max}`);
	return true;
}

t6machinelearning.addCategorical = function(featureName, classes) {
	categoricalFeats[featureName] = (Array.isArray(classes)===true && classes.length>-1)?classes:[];
	if(featureName!=="flow_id" && featureName!=="value" && categoricalFeats[featureName].indexOf(0)===-1) {
		categoricalFeats[featureName].unshift(0);
		t6console.debug(`ADDED value "0" to Categorical list`);
	}
	t6console.debug(`ADDED "${featureName}" to Categorical Features with ${categoricalFeats[featureName].length} classes`, categoricalFeats[featureName]);
	return true;
}

t6machinelearning.buildModel = async function(inputShape, outputShape) {
	t6console.debug("inputShape", inputShape);
	t6console.debug("outputShape", outputShape);
	return await new Promise((resolve) => {
		const model = tf.sequential();
		model.add(tf.layers.dense({
			inputShape: inputShape,
			units: 1,
			activation: "relu"
		}));
		model.add(tf.layers.dense({
			units: outputShape,
			activation: "sigmoid"
		}));
		/*
		Adadelta -Implements the Adadelta algorithm.
		Adagrad - Implements the Adagrad algorithm.
		Adam - Implements the Adam algorithm.
		Adamax - Implements the Adamax algorithm.
		Ftrl - Implements the FTRL algorithm.
		Nadam - Implements the NAdam algorithm.
		Optimizer - Base class for Keras optimizers.
		RMSprop - Implements the RMSprop algorithm.
		SGD - Stochastic Gradient Descent Optimizer.
		*/
		model.compile({
			optimizer: tf.train.adam(0.001),
			loss: "categoricalCrossentropy", // categoricalCrossentropy | meanSquaredError | binaryCrossentropy
			metrics: ['accuracy']
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
		return tf.tidy(() => {
			let batchSize = t6Model.batch_size;
			tf.util.shuffle(data);

			const normalize = (inputData, min, max) => {
				return typeof inputData!=="undefined"?(parseFloat(inputData) - min)/(max - min):0;
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
					if(continuousFeats.indexOf(f)>-1) {
						let min = continuousFeatsMins[f];
						let max = continuousFeatsMaxs[f];
						return featureValues[f].push(normalize(r[f], min, max)); // normalize
					}
				});
				continuousFeats.map((f) => {
					if(featureValues[f].length>0) {
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
				return tf.util.flatten(result);
			});
			const y = data.map((r) => {
				return oneHotEncode(t6Model.labels.indexOf(r.label), t6Model.labels);
			});

			const featureTensor = x;
			const labelTensor = y;
			const xTensor = tf.tensor(featureTensor);
			const yTensor = tf.tensor(labelTensor);
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

t6machinelearning.trainModelDs = async function(model, dataset, options) {
	return await new Promise((resolve) => {
		resolve(model.fitDataset(dataset, options));
	});
};

t6machinelearning.trainModel = async function(model, datasetXs, datasetYs, options) {
	return await new Promise((resolve) => {
		resolve(model.fit(datasetXs, datasetYs, options));
	});
};

t6machinelearning.evaluateModel = async function(model, testingData) {
	const result = await model.evaluateDataset(testingData);
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
	return new Promise((resolve) => {
		tf.node.loadSavedModel(path, ["serve"], "serving_default").then((result) => {
			resolve(result);
		}).catch(function(err) {
			reject(err);
		});
	});
};

t6machinelearning.loadLayersModel = async function(path) {
	return new Promise((resolve) => {
		tf.loadLayersModel(path).then((result) => {
			resolve(result);
		}).catch(function(err) {
			reject(err);
		});
	});
};

t6machinelearning.getMetaGraphsFromSavedModel = async function(path) {
	return new Promise((resolve) => {
		tf.node.getMetaGraphsFromSavedModel(path).then((result) => {
			resolve(result);
		}).catch(function(err) {
			reject(err);
		});
	});
};

t6machinelearning.predict = async function(tfModel, inputDatasetX, options={}) {
	return new Promise((resolve) => {
		const prediction = tfModel.predict(tf.tensor(inputDatasetX), options);
		const argMaxIndex = tf.argMax(prediction, 1).dataSync()[0];
		t6console.debug("ML PREDICTION", argMaxIndex);
		t6console.debug("ML PREDICTION");
		prediction.print();
		resolve(prediction);
	});
};

module.exports = t6machinelearning;
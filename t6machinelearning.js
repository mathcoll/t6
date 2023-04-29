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

let t6Model, labelsCount, labels, batch_size, features, featureCount, min, max;

t6machinelearning.init = function(t6Model) {
	t6Model = t6Model;
	labels = t6Model.labels;
	labelsCount = t6Model.labels.length;
	features = t6Model.features;
	featureCount = t6Model.features.length;
	batch_size = t6Model.batch_size;
	min = t6Model.min;
	max = t6Model.max;
	t6console.debug("================== t6machinelearning.init =================");
	t6console.debug("labels", labels);
	t6console.debug("labelsCount", labelsCount);
	t6console.debug("features", features);
	t6console.debug("featureCount", featureCount);
	t6console.debug("batch_size", batch_size);
	t6console.debug("min", min);
	t6console.debug("max", max);
	t6console.debug("===========================================================");
};

t6machinelearning.buildModel = async function() {
	return await new Promise((resolve) => {
		const model = tf.sequential();
		model.add(tf.layers.dense({
			inputShape: [featureCount],
			units: 16,
			activation: "relu"
		}));
		model.add(tf.layers.dense({
			units: labelsCount,
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
			loss: "meanSquaredError", // categoricalCrossentropy | meanSquaredError | binaryCrossentropy
			metrics: ['accuracy']
		});
		t6console.debug("Model.weights:");
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
	let batchSize = t6Model.batch_size;
	return await new Promise((resolve) => {
		//t6Model.flow_ids
		const oneHotEncodeClasses = category => Array.from(tf.oneHot(category, labelsCount).dataSync());
		const oneHotEncodeFlows = flow_id => Array.from(tf.oneHot(flow_id, t6Model.flow_ids.length).dataSync());
		const x = data.map(r => t6Model.features.map(f => {
			const val = r[f];
			if (f==="x" && r["flow_id"]===t6Model.flow_ids[0]) {
				return val === undefined ? 0 : (parseFloat(val) - min) / (max - min); // normalize values to be between 0-1
			}
		}));
		const flow_id = data.map(r => t6Model.features.map(f => {
			if(f==="flow_id") {
				//t6console.debug("oneHot flow_id", oneHotEncodeFlows(r.flow_id), r.flow_id);
				return oneHotEncodeFlows(r.flow_id);
			}
		}));
		const y = data.map(r => {
			const category = parseInt(r.category===undefined?0:(labels.indexOf(r.category)>-1?labels.indexOf(r.category):0), 10);
			//t6console.debug("Y category", r, r.category, category, oneHot(category));
			return oneHotEncodeClasses(category);
		});
		//const xs = tf.concat([tf.tensor1d(tf.data.array(x)), tf.tensor1d(flow_id, t6Model.flow_ids)], 1);
		const ds = tf.data
			.zip({ xs: tf.data.array(x), ys: tf.data.array(y) })
			//.zip({ xs: xs, ys: tf.data.array(y)})
			.shuffle(data.length);
		const splitIdx = parseInt((1 - testSize) * data.length, 10);
		labels.map((l, i) => {
			t6console.debug("oneHot labels", oneHotEncodeClasses(i), l);
		});
		resolve({
			trainDs: ds.take(splitIdx).batch(batchSize),
			validDs: ds.skip(splitIdx + 1).batch(batchSize),
			x: tf.tensor(x), //.slice(splitIdx)
			y: tf.tensor(y), //.slice(splitIdx),
			xValidSize: ds.skip(splitIdx + 1).size
		});
	});
};

t6machinelearning.loadDataArray = function(dataArray, batches=batch_size, predictLabel=false) {
	//t6console.debug("LOAD 0", dataArray, batches);
	// normalize data values between 0-1
	const normalize = (n) => {
		//t6console.debug("NORMALIZE", n);
		if (!n || typeof n.value==="undefined") {
			return null;
		}
		let index = t6machinelearning.getIndexedLabel(typeof n.category!=="undefined"?n.category:0);
		let res = {
			//xs: parseFloat(n.value).toFixed(4), //
			xs: (parseFloat(n.value) - min) / (max - min), // normalize values to be between 0-1
			ys: typeof index!=="undefined"?index:0
		};
		return res;
	};

	// transform input array (xs) to 3D tensor
	// binarize output label (ys)
	const transform = (t) => {
		//t6console.debug("TRANSFORM", t);
		const zeros = (new Array(labelsCount)).fill(0);
		let res = {
			xs: tf.tensor(parseFloat(t.xs), [1], "float32"), // convert input value to a tensor
			ys: tf.tensor1d(zeros.map((z, i) => {
				return i === t.ys ?  1 : 0; 
 			}))
		};
		return res ;
	};

	// only use a subset of the data
	const filter = (f) => {
		//t6console.debug("FILTER", f, labelsCount);
		return f.ys < labelsCount;
	};
	
	// load, normalize, transform, batch
	let res;
	if( predictLabel===false ) {
		res = tf.data.array(dataArray).map(normalize).filter(filter).map(transform).batch(batches);
	} else {
		res = tf.data.array(dataArray).map(normalize).map(transform).batch(batches);
	}
	//res.forEachAsync(op => t6console.debug(op));
	return res;
};

t6machinelearning.trainModel = async function(model, trainingDataset, testingDataset, epochs) {
	return await new Promise((resolve) => {
		const options = {
			epochs: epochs,
			verbose: 0,
			validationData: testingDataset,
			callbacks: {
				onEpochBegin: async (epoch, logs) => {
					t6console.debug(`Epoch ${epoch + 1} of ${epochs} ...`)
				},
				onEpochEnd: async (epoch, logs) => {
					t6console.debug(`  train-set loss: ${typeof logs.loss!=="undefined"?logs.loss.toFixed(4):"ukn"}`);
					t6console.debug(`  train-set accuracy: ${typeof logs.acc!=="undefined"?logs.acc.toFixed(4):"ukn"}`);
				},
				onTrainBegin: async (epoch, logs) => {
					t6console.debug(`  train begin`);
				}
			}
		};
		resolve(model.fitDataset(trainingDataset, options));
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

t6machinelearning.predict_1 = async function(tfModel, t6Model, inputDatasetX) {
	return new Promise((resolve) => {
		const prediction = tfModel.predict(inputDatasetX);
		resolve(prediction);
	});
};
t6machinelearning.predict_2 = async function(tfModel, t6Model, inputData, normalizationData) {
	let {inputMax, inputMin, labelMin, labelMax} = normalizationData;
	inputMax = tf.tensor(inputMax);
	inputMin = tf.tensor(inputMin);
	const [xs, preds] = tf.tidy(() => {
		const xsNorm = tf.linspace(0, 1, 100);
		const predictions = tfModel.predict(xsNorm.reshape([100, 1]));
		const unNormXs = xsNorm
			.mul(inputMax.sub(inputMin))
			.add(inputMin);
		const unNormPreds = predictions
			.mul(labelMax.sub(labelMin))
			.add(labelMin);
	    // Un-normalize the data
		return [unNormXs.dataSync(), unNormPreds.dataSync()];
	});
	const predictedPoints = Array.from(xs).map((val, i) => {
		return {x: val, y: preds[i]}
	});
};
t6machinelearning.predict_3 = async function(tfModel, t6Model, inputData) {
	return new Promise((resolve) => {
		t6machinelearning.init(t6Model.labels, t6Model.batch_size, t6Model.min, t6Model.max);
		//t6console.debug("inputData", inputData.x);
		//t6console.debug("inputData.length", inputData.length);
		//t6console.debug("inputData tensor", tf.tensor(inputData, [1, inputData.length]));
		//const prediction = tfModel.predict(tf.tensor(inputData, [1, inputData.length])).arraySync();
		const prediction = tfModel.predict(inputData.reshape([100, 1])).arraySync();
		resolve(prediction);
	});
};

module.exports = t6machinelearning;
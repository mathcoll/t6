"use strict";
var t6machinelearning = module.exports = {};
const tf = require("@tensorflow/tfjs-node"); // Load the binding (CPU computation)
//require("@tensorflow/tfjs-node-gpu"); // Or load the binding (GPU computation)

let numOfClasses, labels, batch_size, min, max;

t6machinelearning.init = function(lab, bs, mn, mx) {
	numOfClasses = lab.length;
	labels = lab;
	batch_size = bs;
	min = mn;
	max = mx;
	t6console.debug("================== t6machinelearning.init ==================");
	t6console.debug("numOfClasses", numOfClasses);
	t6console.debug("labels", labels);
	t6console.debug("batch_size", batch_size);
	t6console.debug("min", min);
	t6console.debug("max", max);
};

t6machinelearning.buildModel_timeserie = function() {
	const model = tf.sequential();

	model.add(tf.layers.lstm({
		inputShape: [1], // [steps, features]
		units: 32,
		activation: 'relu'
	}));
	model.add(tf.layers.dense({
		units: 1
	}));
	model.compile({
		optimizer: 'adam',
		loss: tf.losses.meanSquaredError, // categoricalCrossentropy | meanSquaredError
		metrics: ['mse']
	});

	model.weights.forEach(w => {
		console.log(w.name, w.shape);
	});

	return model;
};

t6machinelearning.buildModel = function() {
	const model = tf.sequential();

	model.add(tf.layers.dense({
		inputShape: [1],
		units: 32,
		activation: 'relu'
	}));/*
	model.add(tf.layers.dense({
		units: numOfClasses,
		activation: 'softmax'
	}));*/
	model.add(tf.layers.dense({
		units: numOfClasses,
		activation: 'sigmoid'
	}));

	// compile the model
	model.compile({
		optimizer: 'adam',
		loss: 'categoricalCrossentropy', // categoricalCrossentropy | meanSquaredError
		metrics: ['accuracy']
	});

	model.weights.forEach(w => {
		console.log(w.name, w.shape);
	});

	return model;
};

t6machinelearning.getIndexedLabel = function(label) {
	return (typeof label!=="undefined" && labels.indexOf(label)>-1 && label!==null)?labels.indexOf(label):0;
}

t6machinelearning.loadDataArray = function(dataArray, batches=batch_size) {
	// normalize data values between 0-1
	const normalize = (n) => {
		//t6console.debug("INDEX = ", n.label, t6machinelearning.getIndexedLabel(n.label));
		//t6console.debug(n);
		//t6console.debug(t6machinelearning.getIndexedLabel(n.label));
		if (!n || typeof n.x==="undefined") {
			return null;
		}
		return {
			//xs: parseFloat(n.x).toFixed(4), //
			xs: (parseFloat(n.x).toFixed(4) - min) / (max - min), // normalize values to be between 0-1
			ys: typeof t6machinelearning.getIndexedLabel(n.label)!=="undefined"?t6machinelearning.getIndexedLabel(n.label):"0"
		};
	};

	// transform input array (xs) to 3D tensor
	// binarize output label (ys)
	const transform = (t) => {
		// array of zeros
		const zeros = (new Array(numOfClasses)).fill(0);
		return {
			xs: tf.tensor1d([t.xs]), // convert input value to a tensor
			//xs: tf.tensor1d([t.xs, t.time]), // convert input value to a tensor
			ys: tf.tensor1d(zeros.map((z, i) => {
				return i === t.ys ? 1 : 0;
			}))
		};
	};

	// only use a subset of the data
	const filter = (f) => {
		//t6console.debug("numOfClasses", numOfClasses, f, labels);
		return f.ys < numOfClasses;
	};

	// load, normalize, transform, batch
	const res = tf.data
		.array(dataArray)
		.map(normalize)
		.filter(filter)
		.map(transform)
		.batch(batches);
	//res.forEachAsync(op => console.log(op));
	return res;
};

t6machinelearning.trainModel = async function(model, trainingData, epochs) {
	return await new Promise((resolve, reject) => {
		const options = {
			epochs: epochs,
			verbose: 0,
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
		resolve(model.fitDataset(trainingData, options));
	});
};

t6machinelearning.evaluateModel = async function(model, testingData) {
	const result = await model.evaluateDataset(testingData);
	return await new Promise((resolve, reject) => {
		const testLoss = result[0].dataSync()[0];
		const testAcc = result[1].dataSync()[0];
		t6console.debug("testLoss", testLoss.toFixed(4));
		t6console.debug("testAcc", testAcc.toFixed(4));
		resolve({loss: testLoss.toFixed(4), accuracy: testAcc.toFixed(4)});
	});
};

t6machinelearning.save = async function(model, path) {
	return await new Promise((resolve, reject) => {
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

t6machinelearning.loadLayersModel = async function(path) {
	return new Promise((resolve, reject) => {
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

t6machinelearning.predict = async function(model, tensor) {
	return new Promise((resolve) => {
		const prediction = model.predict(t6machinelearning.loadDataArray(tensor, batch_size));
		resolve(prediction);
	});
};

module.exports = t6machinelearning;
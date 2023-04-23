"use strict";
var t6machinelearning = module.exports = {};
const tf = require("@tensorflow/tfjs-node"); // Load the binding (CPU computation)
//require("@tensorflow/tfjs-node-gpu"); // Or load the binding (GPU computation)

let numOfClasses;

t6machinelearning.init = function(noc) {
	numOfClasses = noc;
};

t6machinelearning.buildModel = function() {
	const model = tf.sequential();

	// add the model layers
	model.add(tf.layers.dense({
		inputShape: [1],
		units: 32,
		activation: 'relu'
	}));
	/*
	model.add(tf.layers.dense({
		units: 32,
		activation: 'relu'
	}));
	model.add(tf.layers.dense({
		units: 64,
		activation: 'relu'
	}));
	*/
	model.add(tf.layers.dense({
		units: numOfClasses,
		activation: 'softmax'
	}));

	// compile the model
	model.compile({
		optimizer: 'adam',
		loss: 'categoricalCrossentropy',
		metrics: ['accuracy']
	});

	model.weights.forEach(w => {
		console.log(w.name, w.shape);
	});

	return model;
};

t6machinelearning.loadDataArray = function(dataArray, batches) {
	// normalize data values between 0-1
	const normalize = (n) => {
		if (!n || typeof n.value==="undefined") {
			return null;
		}
		return {
			xs: parseInt(n.value, 10) / 1000, // normalize values to be between 0-1
			ys: (typeof n.category!=="undefined" && labels.indexOf(n.category)>-1)?labels.indexOf(n.category):0
		};
	};

	// transform input array (xs) to 3D tensor
	// binarize output label (ys)
	const transform = (t) => {
		// array of zeros
		const zeros = (new Array(numOfClasses)).fill(0);
		return {
			//xs: parseFloat(t.xs),
			xs: tf.tensor1d([t.xs]), // convert input value to a tensor
			ys: tf.tensor1d(zeros.map((z, i) => {
				return i === t.ys ? 1 : 0;
			}))
		};
	};

	// only use a subset of the data
	const filter = (f) => {
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

module.exports = t6machinelearning;
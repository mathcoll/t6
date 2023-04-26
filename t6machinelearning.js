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
	t6console.debug("================== t6machinelearning.init =================");
	t6console.debug("numOfClasses", numOfClasses);
	t6console.debug("labels", labels);
	t6console.debug("batch_size", batch_size);
	t6console.debug("min", min);
	t6console.debug("max", max);
	t6console.debug("===========================================================");
};

t6machinelearning.buildModel = async function() {
	return await new Promise((resolve, reject) => {
		const model = tf.sequential();
		model.add(tf.layers.dense({
			inputShape: [1],
			units: 32,
			activation: "relu"
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
			optimizer: 'adam',
			loss: 'categoricalCrossentropy', // categoricalCrossentropy | meanSquaredError
			metrics: ['accuracy']
		});
		model.weights.forEach(w => {
			console.log(w.name, w.shape);
		});
		resolve(model);
	});
};

t6machinelearning.getIndexedLabel = function(label) {
	return (typeof label!=="undefined" && labels.indexOf(label)>-1 && label!==null)?labels.indexOf(label):0;
}

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
		const zeros = (new Array(numOfClasses)).fill(0);
		let res = {
			xs: tf.tensor(parseFloat(t.xs), [1], "float32"), // convert input value to a tensor
			ys: tf.tensor1d(zeros.map((z, i) => {
				return i === t.ys ? 1 : 0;
			}))
		};
		return res;
	};

	// only use a subset of the data
	const filter = (f) => {
		//t6console.debug("FILTER", f, numOfClasses);
		return f.ys < numOfClasses;
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
		t6console.debug("result0", result[0].dataSync());
		t6console.debug("result1", result[1].dataSync());
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

t6machinelearning.predict_1 = async function(tfModel, t6Model, inputData) {
	return new Promise((resolve, reject) => {
		t6machinelearning.init(t6Model.labels, t6Model.batch_size, t6Model.min, t6Model.max)
		const prediction = tfModel.predict(inputData);
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
	return new Promise((resolve, reject) => {
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
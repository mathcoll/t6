"use strict";
var t6imagesprocessing = module.exports = {};
//require("@tensorflow/tfjs-node"); // optional
const { Canvas, Image } = require("canvas");
const faceapi = require("face-api.js");
faceapi.env.monkeyPatch({ Canvas, Image });

t6imagesprocessing.faceExpressionRecognition = async function(img, dir, filename, ext) {
	const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
	await faceDetectionNet.loadFromDisk(`${ip.models_dir}/weights`);
	await faceapi.nets.faceLandmark68Net.loadFromDisk(`${ip.models_dir}/weights`);
	await faceapi.nets.faceExpressionNet.loadFromDisk(`${ip.models_dir}/weights`);
	
	const results = await faceapi.detectAllFaces(img , new faceapi.SsdMobilenetv1Options())
		.withFaceLandmarks()
		.withFaceExpressions();
	
	t6console.debug("faceExpressionRecognition results", results);
	
	const out = faceapi.createCanvasFromMedia(img);
	faceapi.draw.drawDetections(out, results.map(res => res.detection));
	faceapi.draw.drawFaceExpressions(out, results);

	fs.writeFile(path.join(dir, `${filename}-faceExpressionRecognition${ext}`), out.toBuffer("image/png"), function(err) {
		if(err) {
			t6console.error("Can't save image to storage:'", err);
		} else {
			t6console.debug("Successfully wrote image file to storage");
		}
	});
}

module.exports = t6imagesprocessing;
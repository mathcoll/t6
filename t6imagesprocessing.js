"use strict";
var t6imagesprocessing = module.exports = {};
require("@tensorflow/tfjs-node"); // optional
const faceapi = require("@vladmandic/face-api");
const { Canvas, Image } = require("canvas");
faceapi.env.monkeyPatch({ Canvas, Image });
faceapi.nets.tinyFaceDetector.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.faceLandmark68Net.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.ageGenderNet.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.faceExpressionNet.loadFromDisk(`${ip.models_dir}/weights`);

t6imagesprocessing.ageAndGenderRecognition = async function(img, dir, filename, ext, save=false) {
	return new Promise((resolve, reject) => {
		faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceExpressions()
			.withAgeAndGender()
			.then((results) => {
				//TODO : returns only the first detection ?!
				resolve( { age: results[0].age, gender: results[0].gender} );
				if (save===true) {
					const out = faceapi.createCanvasFromMedia(img);
					faceapi.draw.drawDetections(out, results.map((res) => res.detection));
					faceapi.draw.drawFaceLandmarks(out, results.map((res) => res.landmarks));
					faceapi.draw.drawFaceExpressions(out, results);
					fs.writeFile(path.join(dir, `${filename}-ageAndGenderRecognition${ext}`), out.toBuffer("image/png"), function(err) {
						if(err) {
							t6console.error("t6imagesprocessing: Can't save image to storage:", err);
							reject();
						} else {
							t6console.debug("t6imagesprocessing: ageAndGenderRecognition", "Successfully wrote image file to storage");
							resolve();
						}
					});
				} else {
					t6console.debug("t6imagesprocessing: No saving image.");
					reject();
				}
			});
	});
};

t6imagesprocessing.faceExpressionRecognition = async function(img, dir, filename, ext, save=false) {
	return new Promise((resolve, reject) => {
		faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceExpressions()
			.then((results) => {
				//TODO : returns only the first detection ?!
				resolve( {expressions: results[0].expressions} );
				if (save===true) {
					const out = faceapi.createCanvasFromMedia(img);
					faceapi.draw.drawDetections(out, results.map((res) => res.detection));
					faceapi.draw.drawFaceLandmarks(out, results.map((res) => res.landmarks));
					faceapi.draw.drawFaceExpressions(out, results);
					fs.writeFile(path.join(dir, `${filename}-faceExpressionRecognition${ext}`), out.toBuffer("image/png"), function(err) {
						if(err) {
							t6console.error("t6imagesprocessing: Can't save image to storage:", err);
							reject();
						} else {
							t6console.debug("t6imagesprocessing: faceExpressionRecognition", "Successfully wrote image file to storage");
							resolve();
						}
					});
				} else {
					t6console.debug("t6imagesprocessing: No saving image.");
					reject();
				}
			});
	});
};

module.exports = t6imagesprocessing;
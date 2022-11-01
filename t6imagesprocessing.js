"use strict";
var t6imagesprocessing = module.exports = {};
require("@tensorflow/tfjs-node"); // optional
const faceapi = require("@vladmandic/face-api");
const { Canvas, Image } = require("canvas");
faceapi.env.monkeyPatch({ Canvas, Image });
faceapi.nets.ssdMobilenetv1.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.tinyFaceDetector.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.faceLandmark68Net.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.ageGenderNet.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.faceExpressionNet.loadFromDisk(`${ip.models_dir}/weights`);

t6imagesprocessing.ageAndGenderRecognition = async function(img, dir, filename, ext, save=false) {
	return new Promise((resolve, reject) => {
		if(img instanceof Image || img instanceof Canvas) {
			faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({inputSize: 512, scoreThreshold: 0.5}))
			.withFaceLandmarks()
			.withFaceExpressions()
			.withAgeAndGender()
			.then((results) => {
				if(results && results.length > 0) {
					//TODO : returns only the first detection ?!
					resolve( { age: results[0].age, gender: results[0].gender} );
					if (save===true) {
						const out = faceapi.createCanvasFromMedia(img);
						faceapi.draw.drawDetections(out, results.map((res) => res.detection));
						faceapi.draw.drawFaceLandmarks(out, results.map((res) => res.landmarks));
						faceapi.draw.drawFaceExpressions(out, results);
						fs.writeFile(path.join(dir, `${filename}-ageAndGenderRecognition${ext}`), out.toBuffer("image/png"), function(err) {
							if(err) {
								t6console.error("t6imagesprocessing/ageAndGenderRecognition: Can't save image to storage:", err);
							} else {
								t6console.debug("t6imagesprocessing/ageAndGenderRecognition:", "Successfully wrote image file to storage");
							}
						});
					} else {
						t6console.debug("t6imagesprocessing/ageAndGenderRecognition: No saving image.");
					}
				} else {
					t6console.debug("t6imagesprocessing/ageAndGenderRecognition: No result.", results);
					resolve({age: 0, gender: 0});
				}
			})
			.catch((err) => {
				t6console.error("t6imagesprocessing/ageAndGenderRecognition: Error1", err);
				resolve({age: 0, gender: 0});
			});
		} else {
			t6console.error("t6imagesprocessing/ageAndGenderRecognition: Error2", "Not an Image");
			resolve({age: 0, gender: 0});
		}
	});
};

t6imagesprocessing.faceExpressionRecognition = async function(img, dir, filename, ext, save=false) {
	return new Promise((resolve, reject) => {
		if(img instanceof Image || img instanceof Canvas) {
			faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceExpressions()
			.then((results) => {
				if(results && results.length > 0) {
					//TODO : returns only the first detection ?!
					resolve( {expressions: results[0].expressions} );
					if (save===true) {
						const out = faceapi.createCanvasFromMedia(img);
						faceapi.draw.drawDetections(out, results.map((res) => res.detection));
						faceapi.draw.drawFaceLandmarks(out, results.map((res) => res.landmarks));
						faceapi.draw.drawFaceExpressions(out, results);
						fs.writeFile(path.join(dir, `${filename}-faceExpressionRecognition${ext}`), out.toBuffer("image/png"), function(err) {
							if(err) {
								t6console.error("t6imagesprocessing/faceExpressionRecognition: Can't save image to storage:", err);
							} else {
								t6console.debug("t6imagesprocessing/faceExpressionRecognition:", "Successfully wrote image file to storage");
							}
						});
					} else {
						t6console.debug("t6imagesprocessing/faceExpressionRecognition: No saving image.");
					}
				} else {
					t6console.debug("t6imagesprocessing/faceExpressionRecognition: No result.");
					resolve({expressions: {neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0}});
				}
			})
			.catch((err) => {
				t6console.error("t6imagesprocessing/faceExpressionRecognition: Error1", err);
				resolve({expressions: {neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0}});
			});
		} else {
			t6console.error("t6imagesprocessing/faceExpressionRecognition: Error2", "Not an Image");
			resolve({expressions: {neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0}});
		}
	});
};

module.exports = t6imagesprocessing;
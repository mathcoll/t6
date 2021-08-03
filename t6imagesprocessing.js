"use strict";
var t6imagesprocessing = module.exports = {};
const tf = require("@tensorflow/tfjs-node"); // optional
const faceapi = require("@vladmandic/face-api");
const { Canvas, Image } = require("canvas");
faceapi.env.monkeyPatch({ Canvas, Image });
faceapi.nets.tinyFaceDetector.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.faceLandmark68Net.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.ageGenderNet.loadFromDisk(`${ip.models_dir}/weights`);
faceapi.nets.faceExpressionNet.loadFromDisk(`${ip.models_dir}/weights`);

t6imagesprocessing.faceExpressionRecognition = function(img, dir, filename, ext, save=false) {
	return new Promise((resolve, reject) => {
		faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceExpressions()
			.withAgeAndGender()
			//.withFaceDescriptors()
			.then((results) =>{
				/*
				t6console.debug("results before forEach !!!");
				t6console.debug(results);
				results.forEach(result => {
					const { age, gender, genderProbability, expressions, angle } = result;
					t6console.debug("age", age);
					t6console.debug("gender", gender);
					t6console.debug("genderProbability", genderProbability);
					t6console.debug("expressions", expressions);
					t6console.debug("angle", angle);
				});
				t6console.debug("faceExpressionRecognition just before resolving promise in ImagesProcessing");
				t6console.debug("faceExpressionRecognition results", results[0].expressions);
				*/
				//TODO : returns only the first detection ?!
				resolve( {age: results[0].age, gender: results[0].gender, genderProbability: results[0].genderProbability, expressions: results[0].expressions, angle: results[0].angle} );

				if (save===true) {
					const out = faceapi.createCanvasFromMedia(img);
					faceapi.draw.drawDetections(out, results.map(res => res.detection));
					faceapi.draw.drawFaceLandmarks(out, results.map(res => res.landmarks))
					faceapi.draw.drawFaceExpressions(out, results);
					
					fs.writeFile(path.join(dir, `${filename*1e6}-faceExpressionRecognition${ext}`), out.toBuffer("image/png"), function(err) {
						if(err) {
							t6console.error("Can't save image to storage:", err);
						} else {
							t6console.debug("Successfully wrote image file to storage");
						}
					});
				} else {
					t6console.debug("No saving image.");
				}
			});
	});
}

module.exports = t6imagesprocessing;
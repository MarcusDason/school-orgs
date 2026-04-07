import * as faceapi from "face-api.js";

let isLoaded = false; 

export const loadModels = async () => {
  if (isLoaded) return; 

  const MODEL_URL = "/models";

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

  isLoaded = true;
};

export const detectFace = async (img) => {
  return await faceapi.detectAllFaces(
    img,
    new faceapi.TinyFaceDetectorOptions()
  );
};
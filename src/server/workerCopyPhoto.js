const { workerData, parentPort } = require('worker_threads');
const fs = require('fs-extra');

const { newPhotos, dir } = workerData;
newPhotos.map((file) => {
  const destFileName = `${dir}${file.slice(file.lastIndexOf('\\') + 1)}`;
  fs.copyFile(file, destFileName, (err) => {
    if (err) throw err;

    parentPort.postMessage({});
  });
});

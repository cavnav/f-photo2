const express = require('express');
const bodyParser = require('body-parser');

const os = require('os');
const fs = require('fs');

const { Worker } = require('worker_threads');
const usbDetect = require('usb-detection');
const drivelist = require('drivelist');
const find = require('find');

const app = express();

let state = {
  newPhotos: [],
  countNewPhotos: 0,
  copyProgress: 0,
  countCopiedPhotos: 0,
};

// ------------------------------------------------------------------------------------------------

app.use(express.static('dist'));
app.use(bodyParser.json());

app.get('/api/getUsbDevices', (req, res) => {
  const driveLetters = [];
  (async () => {
    const drives = await drivelist.list();
    console.log(111, drives);
    drives
      .filter(drive => drive.isUSB)
      .map((drive) => {
        const [mountpoint] = drive.mountpoints;
        driveLetters.push(mountpoint.path);
      });

    res.send({
      driveLetters
    });
  })();
});

app.get('/api/getNewPhotos', (req, res) => {
  find.file(/\.jpg$|\.png$/i, 'F:/', (files) => {
    setState({
      newPhotos: [...files],
      countNewPhotos: files.length,
    });
    res.send({
      countNewPhotos: state.countNewPhotos,
    });
  });
});

app.get('/api/checkCopyProgress', (req, res) => {
  res.send({
    copyProgress: state.copyProgress,
  });
});

app.post('/api/copyPhotos', (req, res) => {
  const { userDirName } = req.body;
  const rootDir = 'E:/f-photo/';
  const dir = `${rootDir}${userDirName}/`;

  res.send(req.body);

  if (fs.existsSync(dir)) {
    return;
  }

  fs.mkdirSync(dir);

  setState({
    copyProgress: 0,
    countCopiedPhotos: 0,
  });

  startCopy({}).catch(err => console.log(err));

  async function startCopy({ numWorkers = 2 }) {
    const photosPerWorker = Math.round(state.countNewPhotos / numWorkers);
    const promises = [...Array(numWorkers)].map((_, ind) => {
      const chunkPhotos = state.newPhotos.slice(photosPerWorker * ind, photosPerWorker * (ind + 1));
      return copyPhotoByWorker({ arr: chunkPhotos, dir });
    });

    const result = await Promise.all(promises);
    return result;
  }
});

app.post('/api/saveSettings', (req, res) => {
  usbDetect
    .find()
    .then((devices) => {
      const path = './src/server/settings.json';
      const rawdata = fs.readFileSync(path);
      const settings = JSON.parse(rawdata);
      const { productId, vendorId } = devices.filter(
        device => device.serialNumber
      )[0];
      const usbId = `${productId}_${vendorId}`;

      const settingsUpd = JSON.stringify(
        {
          ...settings,
          selectedUsbDrive: {
            [usbId]: req.body.driveLetter
          }
        },
        null,
        2
      );
      fs.writeFileSync(path, settingsUpd);

      res.send(req.body);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));

function copyPhotoByWorker({ arr, dir }) {
  return new Promise((rs, rj) => {
    const worker = new Worker(
      './src/server/workerCopyPhoto.js',
      {
        workerData: {
          newPhotos: arr,
          dir,
        }
      }
    );
    worker.on('message', () => {
      const countCopiedPhotosUpd = state.countCopiedPhotos + 1;
      setState({
        copyProgress: calcCopyProgress({ countCopiedPhotos: countCopiedPhotosUpd }),
        countCopiedPhotos: countCopiedPhotosUpd,
      });
      rs();
    });
    worker.on('error', rj);
    worker.on('exit', (code) => {
      if (code !== 0) { rj(new Error(`Worker stopped with exit code ${code}`)); }
    });
  });
}

function calcCopyProgress({ countCopiedPhotos }) {
  const { countNewPhotos, } = state;
  return Math.floor(countCopiedPhotos * 100 / countNewPhotos);
}

function setState(propsUpd) {
  state = {
    ...state,
    ...propsUpd,
  };
}

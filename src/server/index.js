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
  rootDir: 'E:/f-photo/',
  curDir: 'E:/f-photo/one/',
};

// ------------------------------------------------------------------------------------------------

app.use(express.static('dist'));
app.use(bodyParser.json());

app.get('/api/getUsbDevices', (req, res) => {
  const driveLetters = [];
  (async () => {
    const drives = await drivelist.list();
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
    console.log('photo', files[0]);
    res.send({
      countNewPhotos: state.countNewPhotos,
    });
  });
});

app.get('/api/browsePhotos', (req, res) => {
  const photos = state.newPhotos.map((photo) => {
    const photoUpd = getPhotoName({ file: photo });
    return `${state.curDir}${photoUpd}`;
  });
  res.send({
    photos,
  });
});

app.get('/api/checkCopyProgress', (req, res) => {
  res.send({
    copyProgress: state.copyProgress,
  });
});

app.post('/api/copyPhotos', (req, res) => {
  const { userDirName } = req.body;
  const destDir = `${state.rootDir}${userDirName}/`;

  if (fs.existsSync(destDir)) {
    return;
  }

  fs.mkdirSync(destDir);

  setState({
    copyProgress: 0,
    countCopiedPhotos: 0,
    curDir: destDir,
  });

  startCopy({ photos: state.newPhotos, destDir });

  res.send(req.body);

  function startCopy({ photos, destDir }) {
    photos.length && setTimeout(() => {
      const [photo] = photos;
      const photoName = getPhotoName({ file: photo });
      const destPath = `${destDir}${photoName}`;
      fs.copyFile(photo, destPath, (err) => {
        if (err) throw err;

        const countCopiedPhotosUpd = state.countCopiedPhotos + 1;
        setState({
          copyProgress: calcCopyProgress({ countCopiedPhotos: countCopiedPhotosUpd }),
          countCopiedPhotos: countCopiedPhotosUpd,
        });
      });

      startCopy({ photos: photos.slice(1), destDir });
    }, 1000);
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

function getPhotoName({ file }) {
  return file.slice(file.lastIndexOf('\\') + 1);
}

const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs-extra');

const { Worker } = require('worker_threads');
const usbDetect = require('usb-detection');
const drivelist = require('drivelist');
const find = require('find');

const app = express();

let state = {
  newPhotos: [],
  browseFiles: [],
  countNewPhotos: 0,
  copyProgress: 0,
  countCopiedPhotos: 0,
  rootDir: getRootDir(),
  curDir: '',
  usbDriveLetter: undefined,
};

console.log('state', state);

// ------------------------------------------------------------------------------------------------

app.use(express.static('E:/f-photo/'));
app.use(express.static('public'));
app.use(express.static('dist'));

app.use(bodyParser.json());

app.get('/api/getUsbDevices', (req, res) => {
  (async () => {
    const drives = await drivelist.list();
    const [usbDriveLetter] = drives
      .filter(drive => drive.isUSB)
      .slice(-1)
      .map((drive) => {
        const [mountpoint] = drive.mountpoints.slice(-1);
        return mountpoint.path;
      });

    setState({
      usbDriveLetter,
    });
    
    res.send({
      driveLetter: usbDriveLetter,
    });
  })();
});

app.get('/api/getNewPhotos', async (req, res) => {

  if (!state.usbDriveLetter) {
    setState({
      newPhotos: [],
      countNewPhotos: 0,
    });
    res.send({
      countNewPhotos: state.countNewPhotos,
    });

    return;
  }

  findFiles({
    path: state.usbDriveLetter,
    onResolve: ({ files }) => {
      setState({
        newPhotos: [...files],
        countNewPhotos: files.length,
      });
      res.send({
        countNewPhotos: state.countNewPhotos,
      }); 
    }
  });
});

app.get('/api/browsePhotos', (req, res) => {
  findFiles({
    onResolve,
  });


  // -------------------------
  function onResolve({ files }) {
    const browseFiles = files.map((file) => {
      const fileUpd = getPhotoName({ file });
      return `${state.curDir}${fileUpd}`;
    });

    setState({
      browseFiles,
    });

    res.send({
      photos: browseFiles,
    });
  }
});

app.get('/api/toward', (req, res) => {
  res.send({
    copyProgress: state.copyProgress,
  });
});

app.get('/api/backward', (req, res) => {
  res.send({
    copyProgress: state.copyProgress,
  });
});

app.get('/api/checkCopyProgress', (req, res) => {
  res.send({
    copyProgress: state.copyProgress,
  });
});

app.post('/api/copyPhotos', (req, res) => {
  console.log('req.body', getCurMoment());
  // const { userDirName } = req.body;
  const userDirName = getCurMoment();
  const destDir = `${state.rootDir}${userDirName}/`;

  res.send(req.body);

  console.log('destDir', destDir)

  if (fs.existsSync(destDir)) {
    return;
  }

  fs.mkdirSync(destDir);

  setState({
    copyProgress: 0,
    countCopiedPhotos: 0,
  });

  startCopy({ photos: state.newPhotos, destDir });

  

  function startCopy({ photos, destDir }) {
    photos.length && setTimeout(() => {
      const [photo] = photos;
      const photoName = getPhotoName({ file: photo });
      const destPath = `${destDir}${photoName}`;

      fs.copyFile(photo, destPath, (err) => {
        if (err) throw err;

        const countCopiedPhotosUpd = state.countCopiedPhotos + 1;
        
        const copyProgress = calcCopyProgress({ countCopiedPhotos: countCopiedPhotosUpd });
        
        if (copyProgress === 100) {
          setTimeout(() => clearUpUSB.then(res => {
            setState({
              copyProgress,
              countCopiedPhotos: countCopiedPhotosUpd,
            });
          }));
          return;
        }

        setState({
          copyProgress,
          countCopiedPhotos: countCopiedPhotosUpd,
        });

        startCopy({ photos: photos.slice(1), destDir });
      });
    });
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

function calcCopyProgress({ countCopiedPhotos }) {
  const { countNewPhotos, } = state;
  return Math.floor(countCopiedPhotos * 100 / countNewPhotos);
}

function findFiles({ 
  path = state.curDir,
  onResolve = () => {} 
}) {
  const fullPath = `${state.rootDir}${state.curDir}`;
  console.log('find', state.curDir, path, onResolve);
  find.file(/.*\..*/, fullPath, (files) => {
    onResolve({ files });
  });  
}

function getCurMoment() {
  const dateISO = new Date().toISOString();
  return dateISO.slice(0, dateISO.indexOf('.')).replace(/:/g, '');
}

function getPhotoName({ file }) {
  return file.slice(file.lastIndexOf('\\') + 1);
}

function getRootDir() {
  let rootDir;
  if(process.env.NODE_ENV === 'production') {
    rootDir = '../f-photo/';
  } else  {
    rootDir = 'E://f-photo/';
  }
  console.log('rootDir', rootDir);
  return rootDir;
}

function clearUpUSB() {
  return fs.remove('F://')
  .then(() => {
  })
  .catch(err => {
    console.error(err)
  });
}

function setState(propsUpd) {
  state = {
    ...state,
    ...propsUpd,
  };
}

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
  browseDirs: [],
  countNewPhotos: 0,
  copyProgress: 0,
  countCopiedPhotos: 0,
  rootDir: getRootDir(),
  curDir: getRootDir(),
  usbDriveLetter: undefined,
};

console.log('state', state);

// ------------------------------------------------------------------------------------------------

app.use(express.static('E:/f-photo'));
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
    doNeedFullPath: true,
    onResolve({ files }) {
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

app.get('/api/browseFiles', (req, res) => {
  findFiles({ 
    doNeedDirs: true,
    onResolve({ files, dirs }) {
      setState({
        files,
        dirs,
      });
    
      res.send({
        files,
        dirs,
      });
    }
  });
});

app.get('/api/toward', (req, res) => {
  let { subdir } = req.query;
  subdir = subdir ? `\\${subdir}` : '';
  const path = `${state.curDir}${subdir}`;

  setState({
    curDir: path,
  });

  res.redirect('browseFiles');
});

app.get('/api/backward', (req, res) => {
  const path = getBackwardPath();
  setState({
    curDir: path,
  });

  res.redirect('browseFiles');  
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
      const photoName = getFileName({ file: photo });
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

function getBackwardPath() {
  if (state.rootDir === state.curDir) return state.curDir;
  return state.curDir.slice(0, state.curDir.lastIndexOf('\\'));
}

function findFiles({ 
  path = state.curDir,

  doNeedDirs = false,
  doNeedFullPath = false,
  onResolve = () => {} 
}) {
  console.log(state.curDir);
  
  find.file('', path, (files) => {
    const browseFiles = doNeedFullPath ? files : files.map((file) => {
      const fileUpd = getFileName({ file });
      return `${fileUpd}`;
    });  

    if (doNeedDirs === false) {
      onResolve({ files: browseFiles, dirs: [] });
      return;
    }

    find.dir('', path, (dirs) => {
      const browseDirs = dirs.filter(isTopLevelDir).map((dir) => {
        return getFileName({ file: dir });
      });  
      console.log('browseDirs', browseDirs);
      onResolve({ files: browseFiles, dirs: browseDirs });
    });  
  });

  // ------------------------------------------- 
  function isTopLevelDir(dir) {
    return path.length === dir.lastIndexOf('\\');
  }
}

function getCurMoment() {
  const dateISO = new Date().toISOString();
  return dateISO.slice(0, dateISO.indexOf('.')).replace(/:/g, '');
}

function getFileName({ file }) {
  return file.slice(file.lastIndexOf('\\') + 1);
}

function getRootDir() {
  let rootDir;
  if(process.env.NODE_ENV === 'production') {
    rootDir = '..\\f-photo';
  } else  {
    rootDir = 'E:\\f-photo';
  }

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
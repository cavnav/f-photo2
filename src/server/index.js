
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs-extra');

const path = require('path');
const usbDetect = require('usb-detection');
const drivelist = require('drivelist');
const find = require('find');

const Jimp = require('jimp');
const WhatsappBot = require('./scriptWhatsappBot');

const app = express();
const albumDir = path.resolve('e:\\projects\\album\\');

let state = {
  newPhotos: [],
  browseFiles: [],
  browseDirs: [],
  countNewPhotos: 0,
  copyProgress: 0,
  countCopiedPhotos: 0,
  albumDir,
  projectDir: path.resolve(__dirname, '../../../'),
  curDir: albumDir,
  usbDriveLetter: undefined,

};

let timeoutIdImg

// ------------------------------------------------------------------------------------------------

app.use(express.static(albumDir));
app.use(express.static('public'));
app.use(express.static('dist'));
app.use(bodyParser.json());

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));

app.post('/api/share', async(req, response) => {
  console.log('dg', req.body);
  response.send(req.body);
  const date = getCurMoment();
  
  const sharedFolder = path.resolve(state.albumDir, date);
  await (async () => {
    const { filesSrc } = req.body;
    for (let index = 0; index < files.length; index++) {
      const fileFrom = path.resolve(state.albumDir, filesSrc[index]);
      const fileTo = path.resolve(sharedFolder, path.basename(fileFrom));
      await fs.copy(fileFrom, fileTo);
    }
  })();
  
  setState({
    copyProgress: 100, 
  });

  const whatsappBot = new WhatsappBot({
    botParams: {
      names: req.body.names,
      sharedFolder,
    },
    onClose: () => { console.log('onClose') },
  });
  whatsappBot.run();
});

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

    const usbDriveLetterUpd = (usbDriveLetter) ? `${usbDriveLetter}\\` : usbDriveLetter;
    setState({
      usbDriveLetter: usbDriveLetterUpd,
    });
    console.log('usbDriveLetter', usbDriveLetterUpd)

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
    doNeedTopLevelSearch: false,
    doNeedFullPath: true,
    onResolve({ files }) {

      console.log(111, files);
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
        path: state.curDir.replace(/\\/g, '/').split('/'),
      });
    }
  });
});

app.post('/api/toward', (req, res) => {
  let { 
    subdir,
    resetTo, 
  } = req.body;

  const resetToUpd = resetTo ? resetTo.join('\\') : resetTo;
  subdir = subdir ? `\\${subdir}` : '';
  const path = resetToUpd || `${state.curDir}${subdir}`;

  setState({
    curDir: path,
  });

  res.redirect('browseFiles');
});

app.post('/api/backward', (req, res) => {
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

app.get('/api/saveChanges', (req, res) => {
  let { action } = req.query;
  res.redirect(action);
});

app.get('/api/remove', async (req, res) => {
  const { file } = req.query;
  const fileUpd = state.curDir.concat('\\', file);
  removeFile({ file: fileUpd, resolve });
  
  function resolve() {
    res.send(req.query);
  }
});

app.get('/api/imgRotate', (req, response) => {
  let { img, deg = 0, path } = req.query;
  const imgUpd = state.curDir.concat('\\', img);
  const pathUpd = state.curDir.concat('\\', path);

  Jimp.read(imgUpd)
  .then(imgUpd => {
    return imgUpd
      .rotate(-deg)
      .write(pathUpd); // save
  })
  .then(res => response.send(req.query))
  .catch(console.error);
});

app.post('/api/saveFilesToFlash', async (req, response) => {
  response.send(req.body);
  clearUpUSB()
  .then(async (res) => {
    const { files } = req.body;
    console.log('saveFilesToFlash', req.body.folders, files);
    const filesList = Object.keys(files);
    const srcRoot = 'e:\\projects\\docsF-photo2\\root\\';
    const destRoot = state.usbDriveLetter;
    for (let index = 0; index < filesList.length; index++) {
      const file = filesList[index]
      const folder = files[file];
      await fs.copy(`${srcRoot}\\${file}`, `${destRoot}\\${folder}\\${file}`);
    }
  })
  .then(res => setState({
    copyProgress: 100, 
  }))
  .catch(console.error);
});

app.post('/api/copyPhotos', (req, res) => {
  const curMoment = getCurMoment();
  const destDir = path.resolve(state.albumDir, curMoment);

  res.send(req.body);

  if (fs.existsSync(destDir)) {
    return;
  }

  setState({
    copyProgress: 0,
    countCopiedPhotos: 0,
  });

  startCopy({ photos: state.newPhotos, destDir });

  function startCopy({ photos, destDir }) {
    photos.length && setTimeout(async () => {
      const [photo] = photos;
      const photoName = getFileName({ file: photo });
      const destPath = path.resolve(destDir, photoName);

      await fs.copy(photo, destPath);

      const countCopiedPhotosUpd = state.countCopiedPhotos + 1;
        
      const copyProgress = calcCopyProgress({ countCopiedPhotos: countCopiedPhotosUpd });

      setState({
        copyProgress,
        countCopiedPhotos: countCopiedPhotosUpd,
      });

      if (copyProgress !== 100) {
        startCopy({ photos: photos.slice(1), destDir });
      } else {
        await clearUpUSB();
        setState({
          curDir: destDir,
        });
      }      
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

function calcCopyProgress({ countCopiedPhotos }) {
  const { countNewPhotos, } = state;
  return Math.floor(countCopiedPhotos * 100 / countNewPhotos);
}

function getBackwardPath() {
  // if (state.albumDir === state.curDir) return state.curDir;
  return state.curDir.slice(0, state.curDir.lastIndexOf('\\'));
}

function saveToFile({ 
  path = './src/server/log.txt', 
  content, 
}) {
  const contentStr = JSON.stringify(content)
  fs.writeFileSync(path, contentStr);
}

function findFiles({ 
  path = state.curDir,

  doNeedTopLevelSearch = true,
  doNeedDirs = false,
  doNeedFullPath = false,
  onResolve = () => {} 
}) {
  
  find.file('', path, (files) => {
    let browseFiles = files; 

    if (doNeedTopLevelSearch) browseFiles = browseFiles.filter(isTopLevelFile);

    if (!doNeedFullPath) browseFiles = browseFiles.map((file) => {
      const fileUpd = getFileName({ file });
      return `${fileUpd}`;
    });  

    if (!doNeedDirs) return onResolve({ files: browseFiles, dirs: [] });
    
    find.dir('', path, (dirs) => {
      const browseDirs = dirs.filter(isTopLevelFile).map((dir) => {
        return getFileName({ file: dir });
      });  
      onResolve({ files: browseFiles, dirs: browseDirs });
    });  
  });

  // ------------------------------------------- 
  function isTopLevelFile(file) {
    return path.length === file.lastIndexOf('\\');
  }
}

function getCurMoment() {
  const dateISO = new Date().toISOString();
  return dateISO.slice(0, dateISO.indexOf('.')).replace(/:/g, '');
}

function getFileName({ file }) {
  return file.slice(file.lastIndexOf('\\') + 1);
}

function removeFile({ 
  file, 
  resolve, 
  err = () => {} 
}) {  
  return fs.remove(file)
  .then(() => {

    resolve();
  })
  .catch(err => {
    err();
  });
}

function clearUpUSB() {
  console.log('clearUSB', state.usbDriveLetter);
  return fs.remove(state.usbDriveLetter)
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
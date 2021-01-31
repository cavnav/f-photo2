
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
const albumDir = path.join('z:', 'album');


let state = {
  newPhotos: [],
  browseFiles: [],
  browseDirs: [],
  countNewPhotos: 0,
  copyProgress: 0,
  countCopiedPhotos: 0,
  albumDir,
  projectDir: path.resolve(__dirname, '../../../'),
  curWindow: 'leftWindow',
  leftWindow: albumDir,
  rightWindow: albumDir,
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
    onClose: () => {},
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
    reqPath: state.usbDriveLetter,
    doNeedTopLevelSearch: false,
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

app.post(
  '/api/addAlbum', 
  async (req, res) => {    
    const {
      curWindow,
      albumName,
    } = req.body;

    const src = path.join(state[curWindow], albumName);
    
    const exists = await fs.pathExists(src);
    if (exists) {
      res.send(false);
      return;
    }

    await fs.ensureDir(
      src,
    );
    
    res.send(req.body);
  }
);

app.post(
  '/api/removeItems',
  async (req, res) => {
    const {
      curWindow,
      items,
    } = req.body;

    setState({
      copyProgress: 0,
      countCopiedPhotos: 0,
    });

    remove({
      slicedItems: items,
    });

    res.send(req.body);

    // ----------------------
    async function remove({
      slicedItems,
    }) {        
      const [item] = slicedItems;
      const src = path.resolve(state[curWindow], path.basename(item));
      await fs.remove(
        src, 
      );
  
      const countProcessed = state.countCopiedPhotos + 1;
  
      const progress = calcProgress({ 
        cntProcessed: countProcessed, 
        total: items.length,
      });

      if (progress !== 100 && slicedItems.length > 1) {
        remove({ 
          slicedItems: slicedItems.slice(1), 
        });
      }

      setState({
        copyProgress: progress,
        countCopiedPhotos: countProcessed,
      });
    }  
  }
);

app.get('/api/browseFiles', (req, res) => {
  findFiles({ 
    doNeedDirs: true,
    onResolve({ 
      files, 
      dirs 
    }) {      

      setState({
        files,
        dirs,
      });

      const myPath = state[state.curWindow] === state.albumDir ? '' : 
        path.join(state[state.curWindow]).replace(albumDir, '');

      res.send({
        files,
        dirs,
        path: myPath,
        sep: path.sep,
      });
    }
  });
});

app.post('/api/resetNavigation', (req, res) => {
  let { 
    resetTo, 
    curWindow,
  } = req.body;

  const resetToUpd = path.join(albumDir, resetTo);
  state[curWindow] && setState({
    [curWindow]: resetToUpd,
  });

  res.send(req.body);
});

app.post('/api/toward', (req, res) => {
  let { 
    subdir = '',
    resetTo, 
    curWindow,
  } = req.body;

  const resetToUpd = resetTo ? path.join(albumDir, resetTo) : undefined;
  const pathUpd = resetTo ? undefined : path.join(state[curWindow], path.basename(subdir));
   
  state[curWindow] && setState({
    [curWindow]: resetToUpd || pathUpd,
    curWindow,
  });

  res.redirect('browseFiles');
});

app.post('/api/backward', (req, res) => {
  const {
    curWindow
  } = req.body;
  const path = getBackwardPath({
    curWindow,
  });

  setState({
    [curWindow]: path,
    curWindow,
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
  const { 
    file,
    curWindow,
  } = req.query;
  const fileUpd = state[curWindow].concat('\\', file);
  removeItem({ file: fileUpd, resolve });
  
  function resolve() {
    res.send(req.query);
  }
});

app.get('/api/imgRotate', (req, response) => {
  let { 
    img, 
    deg = 0, 
    path,
    curWindow, 
  } = req.query;
  const imgUpd = state[curWindow].concat('\\', img);
  const pathUpd = state[curWindow].concat('\\', path);

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
    const filesList = Object.keys(files);
    // TODO const srcRoot = 'z:\\album\\root\\';
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

app.post('/api/moveToPath', 
  async(req, res) => {
    res.send(req.body);

    const {
      destWindow,
      items,
      curWindow,
    } = req.body;

    const source = state[curWindow];
    const dest = state[destWindow];

    setState({
      copyProgress: 0,
      countCopiedPhotos: 0,
    });

    const allItems = await getAllItems({
      items,
      source,
    });
    const flattedItems = allItems.flat();
    
    startCopy({
      sourceItems: items,
      items: flattedItems,
      total: flattedItems.length,
      source,
      dest,
    });

    
    // -------------------------------------
    async function getAllItems({
      items,
      source,
    }) {
      let allItems = [];
      for (let index = 0; index < items.length; index++) {      
        const itemNext = items[index];
        const basename = path.basename(itemNext)
        if (basename === itemNext) { // if file.
          allItems = [
            ...allItems,
            itemNext,
          ];
          continue;
        }
        const itemItems = await getItemsOfItem({ // if folder.
          item: path.resolve(source, basename),
          source,
        });

        allItems = [
          ...allItems,
          ...itemItems,
        ];        
      }

      return allItems;
    }

    async function getItemsOfItem({
      item,
      source,
    }) {              
      const { files } = await new Promise((
        resolve
      ) => {
        findFiles({
          reqPath: item,
          doNeedFullPath: true,
          doNeedTopLevelSearch: false,
          doNeedDirs: false,
          onResolve: resolve,
        })
      });

      // case when empty dir.
      const relatedPathfiles = (files.length ? files : [item]).map((file) => path.relative(source, file))
      return relatedPathfiles;
    }

    async function startCopy({
      items,
      source,
      dest,
      total,
      sourceItems,
    }) {
      console.log('t7', sourceItems, );
      const countProcessed = state.countCopiedPhotos + 1;
      const progress = calcProgress({ 
        cntProcessed: countProcessed, 
        total,
      });

      // either dir or file. Distinguish: fileName\ = dir; fileName = file.
      // if item is file then dest cannot be directory
      const [item] = items;
      const sourceUpd = path.resolve(source, item);
      const destUpd = path.resolve(dest, item);    
      
      console.log('t9', sourceUpd, destUpd);
      await fs.copy(
        sourceUpd, 
        destUpd,
      );

      setState({
        copyProgress: progress - 10,
        countCopiedPhotos: countProcessed,
      });
      
      if (progress !== 100) {
        console.log('t10', sourceItems)
        setTimeout(
          () => {
            startCopy({ 
              items: items.slice(1), 
              dest,
              total,
              source,
              sourceItems,
            });
          },
        );
      }
      else {
        startRemove({
          items: sourceItems,
          source,
        });      
      }
    }

    // ----------------------
    function startRemove({
      items,
      source,
    }) {
      console.log('t8', items, source)
      const [item] = items;
      const basename = path.basename(item);
      const resolvedItem = path.resolve(source, basename);
      removeItem({
        file: resolvedItem, 
        resolve: () => {   
          if (items.length > 1) {   
            setTimeout(
              () => startRemove({
                items: items.slice(1),
                source,
              }),
            );
          }
          else {
            setState({
              copyProgress: 100,
            });
          }
        },           
      })
    }
  }
);

app.post('/api/copyPhotos', (req, res) => {
  const {
    curWindow,
  } = req.body;
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
      const photoName = path.basename(photo);
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
          [curWindow]: destDir,
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

function calcProgress({
  cntProcessed,
  total,
}) {
  return Math.floor(cntProcessed * 100 / total);
}

function getBackwardPath({
  curWindow,
}) {
  const a = state[curWindow]
  .split(path.sep)
  .slice(0, -1);

  if (state.albumDir === state[curWindow]) return state.albumDir;
  return path.join(
    ...state[curWindow]
    .split(path.sep)
    .slice(0, -1)
  );
}

function saveToFile({ 
  path = './src/server/log.txt', 
  content, 
}) {
  const contentStr = JSON.stringify(content)
  fs.writeFileSync(path, contentStr);
}

function findFiles({ 
  reqPath = state[state.curWindow],

  doNeedTopLevelSearch = true,
  doNeedDirs = false,
  doNeedFullPath = false,
  onResolve = () => {} 
}) {
  find.file('', reqPath, (files) => {
    let browseFiles = files; 

    if (doNeedTopLevelSearch) browseFiles = browseFiles.filter(isTopLevelFile);
    if (!doNeedFullPath) browseFiles = browseFiles.map((file) => {
      const fileUpd = path.basename(file);
      return `${fileUpd}`;
    });  

    if (!doNeedDirs) return onResolve({ files: browseFiles, dirs: [] });
    
    find.dir('', reqPath, (dirs) => {
      const { sep } = path;
      const browseDirs = dirs
        .filter(isTopLevelFile)
        .map((dir) => path.join(sep, path.basename(dir))); 

      onResolve({ files: browseFiles, dirs: browseDirs });
    });  
  });

  // ------------------------------------------- 
  function isTopLevelFile(file) {
    return reqPath.length === file.lastIndexOf(path.sep);
  }
}

function getCurMoment() {
  const dateISO = new Date().toISOString();
  return dateISO.slice(0, dateISO.indexOf('.')).replace(/:/g, '');
}

function removeItem({ 
  file, 
  resolve = () => {}, 
}) {  
  console.log('t12', file);
  return fs.remove(file)
  .then(() => {
    resolve();
  })
  .catch(err => {
    console.log(err);
  });
}

function clearUpUSB() {
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
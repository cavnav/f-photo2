const express = require('express');
const bodyParser = require('body-parser');

const os = require('os');
const fs = require('fs');

const usbDetect = require('usb-detection');
const drivelist = require('drivelist');
const find = require('find');

const app = express();

// ------------------------------------------------------------------------------------------------

app.use(express.static('dist'));
app.use(bodyParser.json());

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));
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

app.post('/api/copyPhotos', (req, res) => {
  const { userDirName } = req.body;
  const rootDir = 'E:/f-photo/';
  const dir = `${rootDir}${userDirName}/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);

    find.file(/\.jpg$|\.png$/, 'F:/', (files) => {
      console.log(files);
      files.map((file) => {
        const destFileName = `${dir}${file.slice(file.lastIndex('\\') + 1)}`;
        fs.copyFile(file, destFileName, (err) => {
          if (err) throw err;
        });
      });
      res.send(req.body);
      console.log('successful');
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

const { fork } = require('child_process');
const path = require('path');

module.exports = class WhatsappBot {
  constructor({ botParams, ...controls }) {
    this.botParams = botParams;
    console.log('botParams', this.botParams);
    Object.assign(this, controls);
  }

  run() {
    const scriptPath = path.resolve(__dirname, '../../../whatsappBot/');
    const child = fork(
      `${scriptPath}\\index.js`,
      null,
      {
        cwd: scriptPath,
      }
    );

    child.send(this.botParams); 

    child.on('error', (data) => console.log('err1: ', data));

    child.on('close', (code) => {
      console.log(`close, child process close all stdio with code ${code}`);
      child.unref();
      this.onClose && this.onClose();
    });

    child.on('exit', (code, signal) => {
      console.log('exit', code, signal);
    });

    child.on('message', function(m) { 
      console.log('Parent process received:', m); 
    }); 
  }
}

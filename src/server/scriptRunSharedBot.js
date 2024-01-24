const { fork } = require('child_process');
const path = require('path');

module.exports = class SharedBot {
	constructor({ 
		botParams,
		onClose,
		onError,
	}) {
		this.botParams = botParams;
		this.onClose = onClose;
		this.onError = onError;
	}

	run() {
		const scriptPath = path.resolve(__dirname, '../../../sharedBot');
		const indexPath = path.join(scriptPath, 'index.js');

		const child = fork(
			indexPath, 
			[], 
			{
				cwd: scriptPath,
				//execArgv: ['--trace-deprecation'],
				stdio: 'inherit', // Redirect child's stdio to parent (optional)
			}
		);

		child.send(this.botParams);

		child.on('error', (error) => {
			console.error('Child process error:', error);
		});

		child.on('close', (code) => {
			console.log(`Child process closed with code ${code}`);
			this.onClose?.();
		});

		child.on('exit', (code, signal) => {			
			console.log(`Child process exited with code ${code} and signal ${signal}`);			
		});

		child.on('message', (message) => {
			console.log('Parent process received:', message);
			if (message.type === 'error') {
				this.onError?.(message.error);
			}
		});
	}
};

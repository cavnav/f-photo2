const os = require('os');
const express = require('express');
const multer = require('multer');
const ExifParser = require('exif-parser');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const usbDetect = require('usb-detection');
const drivelist = require('drivelist');
const find = require('find');
const SharedBot = require('./scriptRunSharedBot');

const app = express();

const ALBUM_DIR = path.resolve(__dirname, '../../../album');
const PRINTED_JSON = path.join(__dirname, 'printed.json');
const SHARED_JSON = path.join(__dirname, 'shared.json');
const SHARED_DIR = path.join(__dirname, 'shared');
const RESPONSE_WORKING = "WORKING";
const CHAT_IDS_FILE = path.join(__dirname, './chatIDs.json');
const SEP = '/'; // for web src.
const SYS_SRC_REG_EXP = new RegExp('[\\\\/]', 'g');
const WEB_SRC_REG_EXP = new RegExp(SEP, 'g');
const UPLOADS = path.join(__dirname, 'uploads');
const UPLOAD_BATCH_SIZE = 5;
const UPLOAD_FILE_SIZE = 5;

const ERROR_HANDLERS = {
    'LIMIT_FILE_SIZE': ({req, res, err}) => {
        const file = req.files[err.index]?.originalname || 'unknown file';
        res.status(400).json({
			file,
		});
    },
    'LIMIT_UNEXPECTED_FILE_TYPE': ({res, err}) => {
        res.status(400).json({});
    },
    'default': ({res, err}) => {
        res.status(500).json({error});
    }
};

// Создаем директорию, если её нет
if (!fs.existsSync(UPLOADS)) {
    fs.mkdirSync(UPLOADS);
}

let state = {
	newPhotos: [],
	browseFiles: [],
	browseDirs: [],
	countNewPhotos: 0,
	progress: 0,
	iterationNumber: 0,
	curWindow: 'leftWindow',
	leftWindow: ALBUM_DIR,
	rightWindow: ALBUM_DIR,
	usbDriveLetter: undefined,
	reqBody: {},
	error: '',
};


app.use(express.static(ALBUM_DIR));
app.use(express.static('assets'));
app.use(bodyParser.json());


const storage = multer.diskStorage({
    // Устанавливаем папку для сохранения файлов
    destination: function (req, file, cb) {
        cb(null, UPLOADS);  // Путь к папке для загрузки файлов
    },
    // Создаем уникальное имя файла без расширения
    filename: function (req, file, cb) {
        // Очищаем имя файла
        const sanitizedFileName = sanitizeFileName(path.basename(file.originalname, path.extname(file.originalname)));
        // Генерируем уникальное имя файла
        cb(null, sanitizedFileName + '-' + Date.now());
    }
});

const processEnv = process.env.NODE_ENV?.trim();

if (processEnv === 'production') {
	app.use(express.static('dist'));
} else {
	app.use(express.static('public'));
}

const PORT = processEnv === 'production' ? 8080 : 3000;
const IP_ADDRESS = '0.0.0.0';
const IP_ADDRESS_EXTERNAL = getIPv4Address(); // Привязываем к любому доступному интерфейсу

app.listen(PORT, IP_ADDRESS, () => {
	console.log(`Сервер доступен по адресу http://localhost:${PORT}/`);
	console.log(`Сервер также доступен по адресу http://${IP_ADDRESS_EXTERNAL}:${PORT}/`);
  });

// Создаем экземпляр multer с настройками
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {		
        // Проверка типа файла
        if (
			!file.mimetype.match(/^image\//) && 
			!file.mimetype.match(/^application\/pdf$/)
		) {		
			cb(null, false);
			return;
        }
        cb(null, true);  // Разрешаем загрузку файла.
    },
    limits: { fileSize: UPLOAD_FILE_SIZE * 1024 * 1024 }
}).array('files', UPLOAD_BATCH_SIZE);

// Маршрут для загрузки нескольких файлов.
app.post('/api/upload', (req, res) => {
	upload(req, res, (err) => {
		if (err) {			
			// Обработка ошибок
			if (err instanceof multer.MulterError) {
				if (err.code === 'LIMIT_FILE_SIZE') {
					// Определяем файл, который вызвал ошибку
					err.file = req.files[err.index]?.originalname || 'unknown file';
				}
			}
			return next(err);  // Передаем ошибку в следующий обработчик ошибок
		}
		// Если ошибок нет, отправляем успешный ответ
		res.json({ batchSize: UPLOAD_BATCH_SIZE, path: 'uploads' });
	});
});
	upload,
	async (req, res, next) => {        

        res.json({ batchSize: UPLOAD_BATCH_SIZE, path: UPLOADS });
		next(error);
    }
);

app.use('/api/upload', (err, req, res, next) => {	
	req.customData.errors.push({
		file: file.originalname,
		status: 400,
		message: [
			`требуется: изображение, pdf.`,
			`получен: ${file.originalname}`
		].join('\n')
	});

	ERROR_HANDLERS[err.code]?.(err, req, res);
    

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
				error: {
					file,
					message: `превышен размер файла: ${UPLOAD_FILE_SIZE} MB.`,
				}
			});
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
				error: {
					file,
					message: 'превышен объем пачки для загрузки.',
				}
			});
        } else {
			errors.push({
				file: 
			})
            return res.status(500).json({ 
				error: {
					file,
					message,	
				}
			});
        }
    } else if (err) {   
		if (req.file) {
			errors.push({
				file: req.file.originalname,
				status: 500,
				message: err.message,
			});
		}

        return res.status(errorStatus).json({
			error: errors,
		});
    }
});

app.post('/api/getImageMeta', async (request, response) => {
    try {
		const {imageName, curWindow} = request.body;

		const imagePath = path.resolve(state[curWindow], imageName);
        const buffer = await fs.readFile(imagePath);
        const parser = ExifParser.create(buffer);
        const result = parser.parse();
        
        if (result.tags && result.tags.DateTimeOriginal) {
            response.json({
				...result.tags,
				DateTimeOriginal: new Date(result.tags.DateTimeOriginal * 1000).toISOString().split('.')[0],
			});
        } else {
            response.status(500).json({
				error: 'нет даты съемки.',
			});
        }
    } catch (err) {
        throw new Error(`Error extracting EXIF data: ${err.message}`);
    }
});
  

app.get('/api/getSharedRecipients', async (req, response) => {
	const recipients = await getRecipients();

	const recipientsUpd = Object.values(recipients).map(({
		id,
		first_name,
	}) => {
		return {
			id,
			name: first_name,
		};
	});

	response.send({
		recipients: recipientsUpd,
	});

	async function getRecipients() {
		// Load chat IDs from chatIDsFile (Replace this with your own logic)
		try {
			const data = fs.readFileSync(CHAT_IDS_FILE, 'utf8');
			const chatIDs = JSON.parse(data);
			return chatIDs;
		} catch (err) {
			console.error('Error reading chat IDs file:', err);
			return [];
		}
	}
});

app.post('/api/share', async (req, response) => {
	const {
		files,
		recipients,
	} = req.body;

	response.send(RESPONSE_WORKING);
	
	setState({
		progress: 0,
	});

	await fs.remove(SHARED_DIR);

	// copy selected files to shared folder.
	await (async () => {
		for (let index = 0; index < files.length; index++) {
			const fileFrom = path.join(ALBUM_DIR, files[index]);
			const fileTo = path.join(SHARED_DIR, path.basename(fileFrom));
			await fs.copy(fileFrom, fileTo);
		}
	})();

	const Bot = new SharedBot({
		botParams: {
			recipients,
			sharedFolder: SHARED_DIR,
		},
		onClose: () => { 
			setState({
				progress: 100,
			});
		},
		onError: (error) => {
			setState({
				progress: 100,
				error,
			});
		},
	});

	Bot.run();

	await logShared({
		files,
		recipients,
	});
});

app.get('/api/getUsbDevices', async (req, res) => {
	const drives = await drivelist.list();
	const [usbDriveLetter] = drives
		.filter(drive => drive.isUSB)
		.slice(-1)
		.map((drive) => {
			const [mountpoint] = drive.mountpoints.slice(-1);
			return mountpoint.path;
		});

	const usbDriveLetterUpd = (usbDriveLetter) ? path.join(usbDriveLetter, path.sep) : usbDriveLetter;
	setState({
		usbDriveLetter: usbDriveLetterUpd,
	});

	res.send({
		driveLetter: usbDriveLetter,
	});
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

	const { files } = await findFiles({
		reqPath: state.usbDriveLetter,
		doNeedTopLevelSearch: false,
		doNeedFullPath: true,
	});

	setState({
		newPhotos: [...files],
		countNewPhotos: files.length,
	});
	res.send({
		countNewPhotos: state.countNewPhotos,
	});

});

app.post('/api/addAlbum',
	async (req, res) => {
		const {
			curWindow,
			name,
		} = req.body;

		const src = path.join(state[curWindow], name);

		const exists = await fs.pathExists(src);
		if (exists) {
			res.send({
				error: `Альбом ${name} уже есть`,
			});
			return;
		}

		try {
			await fs.ensureDir(
				src,
			);
		} catch (e) {
			res.send({
				error: `Неправильное название альбома`,
			});
			return;
		}

		res.send(RESPONSE_WORKING);
	}
);

app.post('/api/rename',
	async (req, res) => {
		const {
			curWindow,
			name,
			newName,
			updatedActionLists: actionLists,
		} = req.body;

		const srcName = path.join(state[curWindow], path.sep, name, path.sep);
		const srcNewName = path.join(state[curWindow], path.sep, newName, path.sep);

		try {
			await rename({
				name: srcName,
				newName: srcNewName,
			});
			
			const allItems = await getAllItems({
				items: [path.sep],
				source: srcNewName,
			});

			const flattedItems = allItems.flat();
			const actionListsUpd = await updateActionLists({
				updatedLists: actionLists,
				items: flattedItems,
				source: srcName,
				dest: srcNewName,
			}); 

			result = {
				actionLists: actionListsUpd,
			};

			res.send(result);

		} catch (error) {
			res.send({error});
		}		
	}
);

app.post('/api/removeItems',
	async (req, res) => {
		const {
			curWindow,
			items,
			updatedActionLists,
		} = req.body;		

		setState({
			progress: 0,
			iterationNumber: 0,
		});

		try {
			const source = state[curWindow];
			const allItems = await getAllItems({
				items,
				source,
			});

			const flattedItems = allItems.flat();
			const updatedActionListsUpd = await updateActionLists({
				updatedLists: updatedActionLists,
				items: flattedItems,
				source,				
			});			
			
			res.send({			
				updatedActionLists: updatedActionListsUpd,		
			});

			await remove({
				slicedItems: items,
			});

		} catch (error) {
			res.send({error});
		}

		// ----------------------
		async function remove({
			slicedItems,
		}) {
			const [item] = slicedItems;
			const src = path.resolve(state[curWindow], path.basename(item));
			
			await fs.remove(
				src,
			);

			const progress = setProgress({
				total: items.length,
			});

			if (progress !== 100 && slicedItems.length > 1) {
				await remove({
					slicedItems: slicedItems.slice(1),
				});
			}
		}
	}
);

app.post('/api/resetNavigation', (req, res) => {
	let {
		resetTo,
		curWindow,
	} = req.body;

	const resetToUpd = path.join(ALBUM_DIR, getSystemSrc({src: resetTo}));
	state[curWindow] && setState({
		[curWindow]: resetToUpd,
	});

	res.send({});
});

app.post('/api/toward', getToward());

app.post('/api/backward', getToward({
	isBackward: true,
}));

app.post('/api/towardPrinted', async (req, res) => {
	const {body} = req;

	const dir = body.dir ? path.basename(body.dir) : undefined;
	const jsonItem = await getJsonItem({
		ident: dir,
		jsonPath: PRINTED_JSON
	});

	res.send({
		files: jsonItem,
	});
});

app.post('/api/towardShared', async (req, res) => {
	const jsonItem = await getShared({
		body: req.body,
	});
	res.send({
		files: Object.keys(jsonItem),
	});
});

app.post('/api/towardSharedItems', async (req, res) => {
	const jsonItem = await getShared({
		body: req.body,
	});
	res.send(jsonItem);
});

app.get('/api/checkProgress', (req, res) => {
	res.send({
		progress: state.progress,
		error: state.error,
	});
});

app.post('/api/saveFilesToFlash', async (req, response) => {
	clearUpUSB()
	.then(async () => {
		setState({
			progress: 0,
			iterationNumber: 0,
		});
		const {
			files,
			folderNameField,
		} = req.body;

		const total = Object.keys(files).length;

		await updatePrinted({
			files,
		});

		response.send({});

		// copy to flash  
		const source = path.join(ALBUM_DIR);
		const dest = path.join(state.usbDriveLetter);
		copy({
			source,
			dest,
			total,
			files,
		});

		// ---------------------------------------
		async function copy({
			source,
			dest,
			total,
			files,
		}) {
			for (const file in files) {
				const folder = String(files[file][folderNameField]);
				
				if (folder !== '0') {
					await core({file, folder});
				};			

				setProgress({total});		
			}

			async function core({file, folder}) {
				const fileName = path.basename(file);
				const sourceUpd = path.join(source, file);
				const destUpd = path.join(dest, folder, fileName);

				await fs.copy(
					sourceUpd,
					destUpd,
				);										
			}
		}
	})
	.catch((error) => {
		setState({error});
	});
});

app.post('/api/moveToPath',
	async (req, res) => {
		const {
			items,
			updatedActionLists,
			curWindow,
			destWindow,
		} = req.body;

		const source = state[curWindow];
		const dest = state[destWindow];

		if (source === dest) {
			setState({
				progress: 100,
				iterationNumber: 0,
			});
			return res.status(500).json({
				error: 'Перемещаешь в то же место', 
			});
		};

		setState({
			progress: 0,
			iterationNumber: 0,
		});

		const allItems = await getAllItems({
			items,
			source,
		});

		const flattedItems = allItems.flat();
		const updatedActionListsUpd = await updateActionLists({
			updatedLists: updatedActionLists,
			items: flattedItems,
			source,
			dest,
		});

		res.send({
			dest: dest.replace(ALBUM_DIR, ''),
			updatedActionLists: updatedActionListsUpd,
		});

		await startCopy({
			sourceItems: items,
			items: flattedItems,
			total: flattedItems.length,
			source,
			dest,
		});		

		async function startCopy({
			items,
			source,
			dest,
			total,
			sourceItems,
		}) {
			try {		
				const totalUpd = total * 2; // copy and remove.

				// either dir or file. Distinguish: fileName\ = dir; fileName = file.
				// if item is file then dest cannot be directory
				for (const item of items) {
					const sourceUpd = path.resolve(source, item);
					const destUpd = path.resolve(dest, item);
		
					await fs.copy(sourceUpd, destUpd);

					setProgress({
						total: totalUpd,						
					});		
				}	
				
				await startRemove({
					items: sourceItems,
					source,
					total: totalUpd,
				});
				
			} catch(error) {
				setState({error});
			}
		}

		// ----------------------
		async function startRemove({
			items,
			source,
			total,
		}) {
			try {
				for (const item of items) {
					const basename = path.basename(item);
					const resolvedItem = path.resolve(source, basename);

					await fs.remove(resolvedItem);	
					setProgress({total});	
				}	
				
				setState({progress: 100});

			} catch (error) {
				setState({error});
			}
		}
	}
);

app.post('/api/copyPhotos', (req, res) => {
	const {
		curWindow,
	} = req.body;
	const curMoment = getCurMoment();
	const destDir = path.resolve(ALBUM_DIR, curMoment);

	res.send({destDir: path.basename(destDir)});

	if (fs.existsSync(destDir)) {
		return;
	}

	setState({
		progress: 0,
		iterationNumber: 0,
		[curWindow]: destDir,
	});

	startCopy({ photos: state.newPhotos, destDir });

	function startCopy({ photos, destDir }) {
		photos.length && setTimeout(async () => {
			const [photo] = photos;
			const photoName = path.basename(photo);
			const destPath = path.resolve(destDir, photoName);

			await fs.copy(photo, destPath);

			const progress = setProgress({ total: state.countNewPhotos });
			
			if (progress !== 100) {
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

// glbal error handler.
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: 'Internal Server Error' });
});




function setProgress({
	iterationNumber = state.iterationNumber + 1,
	total,
}) {
	const progress = calcProgress({
		iterationNumber,
		total,
	});	

	setState({
		progress,
		iterationNumber,
	});

	return progress;
}

function calcProgress({
	iterationNumber = state.iterationNumber + 1,
	total,
}) {
	return Math.floor(iterationNumber * 100 / total);
}

function getBackwardPath({
	rootDir,
	curWindow,
}) {
	if (rootDir === state[curWindow]) return rootDir;
	return path.join(
		...state[curWindow]
			.split(path.sep)
			.slice(0, -1)
	);
}

async function findFiles({
	reqPath = state[state.curWindow],

	doNeedTopLevelSearch = true,
	doNeedDirs = false,
	doNeedFullPath = false,
}) {
	const statSync = fs.statSync;
	const isReqPathExists = await fs.pathExists(reqPath);
	let browseFiles = [];
	if (isReqPathExists) {
		const files = await new Promise((resolve) => find.file(reqPath, resolve));
		browseFiles = files.sort(sortByBirthday);
	}

	if (doNeedTopLevelSearch) browseFiles = browseFiles.filter(isTopLevelFile);
	if (!doNeedFullPath) browseFiles = browseFiles.map((file) => {
		const fileUpd = path.basename(file);
		return `${fileUpd}`;
	});

	browseFiles = (
		browseFiles
		.filter(isNotSVI)
		.filter(isNotCTG)
	);

	if (!doNeedDirs) return {
		files: browseFiles,
		dirs: []
	};

	let dirs = [];
	if (isReqPathExists) {
		dirs = await new Promise((resolve) => find.dir(reqPath, resolve));
	}

	let browseDirs = dirs
		.filter(isTopLevelFile)
		.sort(sortByBirthday);
		
	if (!doNeedFullPath) browseDirs = browseDirs.map((dir) => {
		const dirUpd = SEP + path.basename(dir);
		return dirUpd;
	});

	return {
		files: browseFiles,
		dirs: browseDirs,
	};


	// ------------------------------------------- 
	function isNotSVI(file) {
		return !file.includes('System Volume Information');
	}
	function isNotCTG(file) {
		return path.extname(file).toLowerCase() !== '.ctg';
	}
	function isTopLevelFile(file) {
		return reqPath.length === file.lastIndexOf(path.sep);
	}
	function sortByBirthday(a, b) {		
		const aStat = statSync(a);
		const bStat = statSync(b);
		return Number(aStat.birthtime) > Number(bStat.birthtime) ? 1 : -1;
	}
}

function getCurMoment() {
	const dateISO = new Date().toISOString();
	return dateISO.slice(0, dateISO.indexOf('.')).replace(/:/g, '');
}

function clearUpUSB() {
	return fs.remove(state.usbDriveLetter).catch(console.error);
}

function setState(propsUpd) {
	state = {
		...state,
		...propsUpd,
	};
}

function getToward({
	rootDir = ALBUM_DIR,
	isBackward,
} = {}) {
	return async (
		{
			body: {
				dir = '',
				resetTo,
				curWindow,
			},
		},
		res,
	) => {
		const pathUpd = isBackward ? getBackwardPath({
			rootDir,
			curWindow,
		}) : getReqPath();

		const result = await browseFiles({
			curWindow,
			reqPath: pathUpd,
			rootDir,
		});

		setState({
			[curWindow]: pathUpd,
			curWindow,
		});

		res.send(result);


		// --------------------------------------------------------------
		function getReqPath() {
			let resetToUpd;

			if (resetTo !== undefined) {
				resetToUpd = resetTo.replace(WEB_SRC_REG_EXP, path.sep);
			}

			return (resetTo !== undefined && path.join(rootDir, resetToUpd)) ||
				path.join(state[curWindow], path.basename(dir));
		}
	}
}

async function browseFiles({
	reqPath,
}) {
	const {
		files,
		dirs,
	} = await findFiles({
		reqPath,
		doNeedDirs: true,
		doNeedFullPath: false,
	});

	return ({
		files,
		dirs,
	});
}

async function logShared({
	files,
	recipients,
}) {
	const src = SHARED_JSON;
	let json = {};
	
	try {
		json = await fs.readJson(src);
			
	} catch ({code}) {
		if (code != 'ENOENT') {
			throw new Error(code);
		}
	}

	json[getCurMoment()] = {
		files,
		recipients,
	};

	await fs.writeJson(
		src,		
		json,
	);
}

async function updatePrinted({
	files,
}) {
	let json = await fs.readJson(PRINTED_JSON).catch(e => new Object());

	json[getCurMoment()] = files;

	await fs.writeJson(
		PRINTED_JSON,		
		json,
	);
}

async function getJsonItem({
	ident,
	jsonPath,
}) {
	let json = {};
	
	try {
		json = await fs.readJson(jsonPath);
			
	} catch ({code}) {
		if (code != 'ENOENT') {
			throw new Error(code);
		}
	}

	return json[ident] ?? json;
}

/**
 * 
 * обновить списки файлов (печать, поделиться, архивПечати, архивПоделиться)
 */
async function updateActionLists({
	updatedLists,
	items, // updated items. 
	source,
	dest,
}) {
	const printed = await fs.readJson(PRINTED_JSON).catch(e => new Object());
	const shared = await fs.readJson(SHARED_JSON).catch(e => new Object());
	const updatedListsArr = Object.values(updatedLists);

	const sourceRel = source.replace(ALBUM_DIR, '');
	const destRel = dest?.replace(ALBUM_DIR, '');	

	for (let item of items) {
		const sourceFull = getWebSrc({src: path.join(sourceRel, path.sep, item)});	
		const destFull = destRel === undefined ? undefined : getWebSrc({src: path.join(destRel, path.sep, item)});

		updatedListsArr.forEach((files) => {			 			
			update({files, sourceFull, destFull});
		});

		Object.entries(printed).forEach(([id, files]) => {
			update({files, sourceFull, destFull});

			if (Object.keys(files).length === 0) {
				delete printed[id];
			}
		});
	
		Object.entries(shared).forEach(([id, files]) => {
			updateShared({files, sourceFull, destFull});

			if (files.files.length === 0) {
				delete shared[id];
			}
		});
	}

	await fs.writeJson(
		PRINTED_JSON,		
		printed,
	);

	await fs.writeJson(
		SHARED_JSON,		
		shared,
	);

	return updatedLists;

	// ------------------------------
	function update({files, sourceFull, destFull}) {
		if (files[sourceFull]) {
			if (destRel === undefined) {
				delete files[sourceFull];
				return;
			}

			files[destFull] = files[sourceFull];

			delete files[sourceFull];
		}
	}	
	
	function updateShared({files, sourceFull, destFull}) {
		if (destRel === undefined) {
			files.files = files.files.filter((item) => item !== sourceFull);
			
			return;
		}
			
		const itemIndex = files.files.indexOf(sourceFull);

		if (itemIndex > -1) {
			files.files[itemIndex] = destFull;
		}		
	}
}

async function getAllItems({
	items,
	source,
}) {
	let allItems = [];
	for (let index = 0; index < items.length; index++) {
		const itemNext = items[index];
		const basename = path.basename(itemNext);
		if (basename === itemNext) { // file = \\8.jpg -> 8.jpg. folder = \\8\\ -> 8.
			// if file.
			allItems = [
				...allItems,
				itemNext,
			];
			continue;
		}
		// if folder.
		const itemItems = await getItemsOfItem({
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
	const { files } = await findFiles({
		reqPath: item,
		doNeedFullPath: true,
		doNeedTopLevelSearch: false,
		doNeedDirs: false,
	});

	// case when empty dir.
	const relatedPathfiles = (files.length ? files : [item]).map((file) => path.relative(source, file))
	return relatedPathfiles;
}

async function rename({
	name,
	newName,
}) {
	return await fs.rename(name, newName)
	.then((result) => result)
	.catch(() => {
		throw new Error('Попробуй другое название');
	});
}

async function getShared({
	body,
}) {
	const dir = body.dir ? path.basename(body.dir) : undefined;
	const jsonItem = await getJsonItem({
		ident: dir,
		jsonPath: SHARED_JSON,
	});

	return jsonItem;
}

function getWebSrc({src}) {
	return src.replace(SYS_SRC_REG_EXP, SEP);
}

function getSystemSrc({src}) {
	return src.replace(WEB_SRC_REG_EXP, path.sep);
}

function getIPv4Address() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (!iface.internal && iface.family === 'IPv4') {
                return iface.address;
            }
        }
    }
    return 'localhost'; // Default to localhost if no IPv4 address is found
}

const sanitizeFileName = (fileName) => {
    // Убираем потенциально опасные символы из имени файла
    return fileName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
}



const WhatsappBot = require('./scriptWhatsappBot');

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const Jimp = require('jimp');
const path = require('path');
const usbDetect = require('usb-detection');
const drivelist = require('drivelist');
const find = require('find');


const app = express();

const ALBUM_DIR = path.join(path.resolve('../../'), 'album');
const PRINTED_DIR = path.join(ALBUM_DIR, 'printed');
const PRINTED_EXT = '.json';


let state = {
	newPhotos: [],
	browseFiles: [],
	browseDirs: [],
	countNewPhotos: 0,
	progress: 0,
	countCopiedPhotos: 0,
	curWindow: 'leftWindow',
	leftWindow: ALBUM_DIR,
	rightWindow: ALBUM_DIR,
	usbDriveLetter: undefined,
	reqBody: {},
};

let timeoutIdImg

// -----------------------------------------------------------------------------------------------

app.use(express.static(ALBUM_DIR));
app.use(express.static('public'));
app.use(express.static('dist'));
app.use(bodyParser.json());

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));

app.post('/api/share', async (req, response) => {
	response.send(req.body);
	const date = getCurMoment();

	const sharedFolder = path.resolve(ALBUM_DIR, date);
	await (async () => {
		const { filesSrc } = req.body;
		for (let index = 0; index < files.length; index++) {
			const fileFrom = path.resolve(ALBUM_DIR, filesSrc[index]);
			const fileTo = path.resolve(sharedFolder, path.basename(fileFrom));
			await fs.copy(fileFrom, fileTo);
		}
	})();

	setState({
		progress: 100,
	});

	const whatsappBot = new WhatsappBot({
		botParams: {
			names: req.body.names,
			sharedFolder,
		},
		onClose: () => { },
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

		const usbDriveLetterUpd = (usbDriveLetter) ? path.join(usbDriveLetter, path.sep) : usbDriveLetter;
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

		res.send(req.body);
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

		const error = await rename({
			name: srcName,
			newName: srcNewName,
		});

		let result;
		if (error) {
			result = error;
		} else {
			const allItems = await getAllItems({
				items: [path.sep],
				source: srcNewName,
			});
	
			const flattedItems = allItems.flat();

			result = {
				actionLists: updateActionLists({
					updatedLists: actionLists,
					items: flattedItems,
					source: srcName,
					dest: srcNewName,
				}),
			};
		}

		res.send(result);
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
			countCopiedPhotos: 0,
		});

		const source = state[curWindow];
		const allItems = await getAllItems({
			items,
			source,
		});

		const flattedItems = allItems.flat();

		res.send({
			...req.body,
			updatedActionLists: updateActionLists({
				updatedLists: updatedActionLists,
				items: flattedItems,
				source,
			}),
		});

		remove({
			slicedItems: items,
		});

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

			setState({
				progress: progress,
				countCopiedPhotos: countProcessed,
			});

			if (progress !== 100 && slicedItems.length > 1) {
				remove({
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

	// Not only ALBUM_DIR, PRINTED_DIR too.
	const resetToUpd = path.join(ALBUM_DIR, resetTo);
	state[curWindow] && setState({
		[curWindow]: resetToUpd,
	});

	console.log("resetTo", state[curWindow])
	res.send(req.body);
});

app.post('/api/toward', getToward());
app.post('/api/backward', getToward({
	isBackward: true,
}));
app.post('/api/towardPrinted', async (req, res) => {
	const {body} = req;
	if (body.dir) {
		const mappedResult = await mapResponsePrinted({
			jsonSrc: body.dir,
			reqPath: path.join(state[body.curWindow], path.basename(body.dir)),
		});

		res.send(mappedResult);
	} else {
		getToward({
			rootDir: PRINTED_DIR,
			mapResponse: ({
				result: {files},
			}) => {
				return {
					files: files.map((file) => file.replace(PRINTED_EXT, "")),
				};
			}
		})(req, res);
	}
});
app.post('/api/backwardPrinted', getToward(
	{
		rootDir: PRINTED_DIR,
		isBackward: true,
		mapResponse: mapResponsePrinted,
	},
));

app.get('/api/checkProgress', (req, res) => {
	res.send({
		progress: state.progress,
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

app.post('/api/savePrinted', async (req, response) => {
	const {
		dest,
		files,
	} = req.body;
	await createPrintedLog({
		dest,
		files,
	});
	response.send(req.body);
});

app.post('/api/saveFilesToFlash', async (req, response) => {
	clearUpUSB()
		.then(async () => {
			setState({
				progress: 0,
				countCopiedPhotos: 0,
			});
			const {
				files,
				folderNameField,
			} = req.body;

			const total = Object.keys(files).length;

			await createPrintedLog({
				files,
			});

			response.send({
				...req.body,				
			});

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
					if (folder === '0') continue;
					const fileName = path.basename(file);
					const sourceUpd = path.join(source, file);
					const destUpd = path.join(dest, folder, fileName);
					await fs.copy(
						sourceUpd,
						destUpd,
					);

					const countProcessed = state.countCopiedPhotos + 1;
					const progress = calcProgress({
						cntProcessed: countProcessed,
						total,
					});

					setState({
						progress: progress,
						countCopiedPhotos: countProcessed,
					});
				}
			}
		})
		.catch(console.error);
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
				countCopiedPhotos: 0,
			});
			return res.status(500).json({
				error: 'Перемещаешь в то же место', 
			});
		};

		setState({
			progress: 0,
			countCopiedPhotos: 0,
		});

		const allItems = await getAllItems({
			items,
			source,
		});

		const flattedItems = allItems.flat();

		res.send({
			...req.body,
			dest: dest.replace(ALBUM_DIR, ''),
			updatedActionLists: updateActionLists({
				updatedLists: updatedActionLists,
				items: flattedItems,
				source,
				dest,
			}),
		});

		startCopy({
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

			await fs.copy(
				sourceUpd,
				destUpd,
			);

			setState({
				progress,
				countCopiedPhotos: countProcessed,
			});

			if (progress !== 100) {
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
							progress: 100,
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
	const destDir = path.resolve(ALBUM_DIR, curMoment);

	res.send({
		...req.body,
		destDir: path.join(destDir).replace(ALBUM_DIR, ''),
	});

	if (fs.existsSync(destDir)) {
		return;
	}

	setState({
		progress: 0,
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

			const progress = calcprogress({ countCopiedPhotos: countCopiedPhotosUpd });

			setState({
				progress,
				countCopiedPhotos: countCopiedPhotosUpd,
			});

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

function calcprogress({ countCopiedPhotos }) {
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

function saveToFile({
	path = './src/server/log.txt',
	content,
}) {
	const contentStr = JSON.stringify(content)
	fs.writeFileSync(path, contentStr);
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
		browseFiles = files;
	}

	if (doNeedTopLevelSearch) browseFiles = browseFiles.filter(isTopLevelFile);
	if (!doNeedFullPath) browseFiles = browseFiles.map((file) => {
		const fileUpd = path.basename(file);
		return `${fileUpd}`;
	});

	browseFiles = browseFiles.filter(isNotSVI);

	if (!doNeedDirs) return {
		files: browseFiles,
		dirs: []
	};

	let dirs = [];
	if (isReqPathExists) {
		dirs = await new Promise((resolve) => find.dir(reqPath, resolve));
	}

	const { sep } = path;
	const browseDirs = dirs
		.filter(isTopLevelFile)
		.filter(removePrintedFolder)
		.sort(sortByBirthday)
		.map((dir) => path.join(sep, path.basename(dir)));	

	return {
		files: browseFiles,
		dirs: browseDirs,
	};


	// ------------------------------------------- 
	function removePrintedFolder(file) {
		return !file.includes(PRINTED_DIR);
	}
	function isNotSVI(file) {
		return !file.includes('System Volume Information');
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

function removeItem({
	file,
	resolve = () => { },
}) {
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

function getToward({
	rootDir = ALBUM_DIR,
	isBackward,
	mapResponse,
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

		const mappedResult = mapResponse && await mapResponse({
			result,
			reqPath: pathUpd,
		});

		res.send(mappedResult || result);


		// --------------------------------------------------------------
		function getReqPath() {
			return (resetTo !== undefined && path.join(rootDir, resetTo)) ||
				path.join(state[curWindow], path.basename(dir));
		}
	}
}

function getBackward({
	rootDir,
} = {}) {
	return (req, res) => getToward(
		{
			rootDir,
			reqPath: getBackwardPath({
				rootDir,
				curWindow: req.body.curWindow,
			}),
			mapResponse: mapResponsePrinted,
		},
	)(req, res);
};

async function browseFiles({
	reqPath,
	rootDir,
}) {
	const {
		files,
		dirs,
	} = await findFiles({
		reqPath,
		doNeedDirs: true,
	});

	const myPath = reqPath === rootDir ? '' :
		path.join(reqPath).replace(rootDir, '');

	return ({
		files,
		dirs,
		path: myPath,
		sep: path.sep,
	});
}

async function createPrintedLog({
	files,
}) {
	await fs.writeJSON(
		path.join(PRINTED_DIR, getCurMoment().concat(PRINTED_EXT)),
		files,
	);
}

async function mapResponsePrinted({
	reqPath,
}) {
	const json = await fs.readJson(
		reqPath.concat(PRINTED_EXT),
	).catch(e => undefined);

	return {
		files: json ?? {},
	};
}


/**
 * 
 * обновить списки файлов (печать, поделиться, архивПечати, архивПоделиться)
 */
function updateActionLists({
	updatedLists,
	items,
	source,
	dest,
}) {
	if (!dest) return updatedLists;

	const sourceRel = source.replace(ALBUM_DIR, '');
	const destRel = dest.replace(ALBUM_DIR, '');
	const updatedListsArr = Object.values(updatedLists);

	items.forEach((item) => {
		const sourceFull = path.join(sourceRel, path.sep, item);
		const destFull = path.join(destRel, path.sep, item);
		updatedListsArr.forEach((files) => {
			if (files[sourceFull]) {
				files[destFull] = files[sourceFull];
			}
			delete files[sourceFull];
		});
	});

	return updatedLists;
}

async function getAllItems({
	items,
	source,
}) {
	let allItems = [];
	for (let index = 0; index < items.length; index++) {
		const itemNext = items[index];
		const basename = path.basename(itemNext);
		if (basename === itemNext) { // if file. \\8.jpg -> 8.jpg; \\8\\ -> 8
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
	try {
		return await fs.rename(name, newName)
		.then((result) => result)
		.catch((error) => {
			return { 
				error: 'Попробуй другое название' 
			};
		});
	} catch(error) {
		return {
			error,
		};
	};
}
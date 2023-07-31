import { Dialog } from './components';
import {
	eventNames
} from './constants';
import {
	ResumeObj,
} from './resumeObj';
import { AppServerAPI } from './ServerApi';

class MyItems {
	constructor({
		items,
	}) {
		this.items = [...items];
		return this;
	}

	delete(ind) {
		delete this.items[ind];
		this.items = this.items.filter((i) => i);
	}
}

export function setItSilent({
	state,
	stateUpd,
}) {
	if (stateUpd.setItSilent) {
		stateUpd.setItSilent.apply(state);
	}
}

export function tempReducer(
	prevState,
	newState = {},
) {
	if (newState.setItSilent) {
		newState.setItSilent.apply(prevState);
		return prevState;
	}

	return {
		...prevState,
		...newState,
	};
};

export function getFileDateSrcKey({
	date,
	fileSrc
}) {
	return `${date}-${fileSrc}`;
}

export function myArray({
	items,
}) {
	return new MyItems({
		items
	});
}

// export function myArr({
//   items
// }) {
//   let myItems = new Items(...items);

//   return new Proxy(
//     myItems, {
//       get(
//         target,
//         prop,
//         receiver,
//       ) {
//         const propInd = parseInt(prop, 10);
//         if (isNaN(propInd)) {
//           if (prop === 'length') {
//             return receiver.cnt;
//           }

//           return Reflect.get(target, prop, receiver);
//         }
//         let propIntUpd = propInd;
//         if (propInd >= receiver.removed) propIntUpd = propInd + receiver.inc;
//         return Reflect.get(target, propIntUpd, receiver);
//       }
//     }
//   );
// }

export function isCatalogSelected({
	windowName,
}) {
	if (!windowName) return false;
	const resumeObj = new ResumeObj();
	const resumeState = resumeObj.state;
	return Boolean(_get(resumeState[windowName], 'App.browseState.path'));
}

export function isBanMoveItems({
	path,
} = {}) {
	// same path
	// another side is welcome
	// another side is onePhoto


	const destWindow = getOppositeWindow();

	if (destWindow) {
		const resumeObj = new ResumeObj();
		const resumeState = resumeObj.state;
		if (resumeState[destWindow.name] === undefined) {
			return true;
		}
		const destAction = myCrop({
			from: resumeState[destWindow.name],
			selector: {
				App: {
					action: 1,
				},
				Browse: 1,
			},
		});
		
		if (['Welcome', 'OnePhoto'].includes(destAction.action)) {
			return true;
		}

		if (destAction.action === 'Browse' && path === destAction.Browse?.path) {
			return true;
		}
	} else {
		return true;
	}


	return false;
}

export function initRefreshWindowEvent({
	callback,
}) {
	document.addEventListener(eventNames.refreshWindow, callback);
	return () => document.removeEventListener(eventNames.refreshWindow, callback);
}

export function getOppositeWindow() {
	return window.name === "rightWindow" ? window.parent.frames[0] : window.parent.frames[1];
}


export function refreshOppositeWindow() {
	const oppositeWindow = getOppositeWindow();
	oppositeWindow?.document.dispatchEvent(
		new Event(eventNames.refreshWindow)
	);
}

export function getCurDate() {
	const dateISO = new Date().toISOString();
	return dateISO.slice(0, dateISO.indexOf('T'));
}

export function encodeFile({
	file,
}) {
	return encodeURI(file);
}

export function getBackgroundImageStyle({
	file,
}) {
	return {
		'backgroundImage': `url('${encodeFile({ file })}')`
	};
}

export function getFromResumeObj({
	selector,
}) {
	const resumeObj = new ResumeObj();
	const resumeState = resumeObj.state;
	return myCrop({
		from: resumeState,
		selector,
	});
}

export function getVarName(variable) {
	return Object.keys(variable)[0];
}

export function updFromObj({
	obj,
	objUpd,
	stack,
}) {
	// debugger;
	if (stack && stack.length === 0) {
		return obj;
	} else if (stack === undefined) {
		stack = getUpdatedItems({
			obj,
			objUpd,
		});
	}
	let [{
		objRef,
		propName,
		isPropExists,
		propUpd,
	}] = stack;

	if (
		propUpd === undefined ||
		isPropExists === false ||
		propUpd.constructor !== Object
	) {
		objRef[propName] = propUpd;
	} else {
		stack.push(
			...getUpdatedItems({
				obj: objRef[propName],
				objUpd: propUpd,
			})
		);
	}
	return updFromObj({
		obj,
		stack: stack.slice(1),
	});
}

function getUpdatedItems({
	obj,
	objUpd,
}) {
	return Object.entries(objUpd).map((item) => {
		const [propName, propUpd] = item;
		const isPropExists = obj.hasOwnProperty(propName);
		return {
			objRef: obj,
			propName,
			isPropExists,
			propUpd,
		};
	});
}

export function myCrop({
	from,
	selector, // object tree with value 1.
	stack,
	res = {},
}) {
	if (stack && stack.length === 0) return res;
	if (!stack) {
		stack = getSelectorItems({
			from,
			selector,
		});
	}
	let [
		[
			propName,
			propVal,
			sourceVal,
			alias = propVal,
		]
	] = stack;

	if (propVal.constructor !== Object) {
		res[propVal === 1 ? propName : alias] = sourceVal;
	} else if (sourceVal && sourceVal.constructor === Object) {
		stack.push(...getSelectorItems({
			from: sourceVal,
			selector: propVal,
		}))
	}

	return myCrop({
		stack: stack.slice(1),
		res,
	});
}

export function getSelectorItems({
	selector,
	from,
}) {
	return Object.entries(selector).map((item) => {
		const [propName, propVal] = item;
		return [
			propName,
			propVal,
			from[propName],
		];
	});
}

export function getExistsProps({
	obj,
	rp,
}) {
	const hasObjKey = Object.prototype.hasOwnProperty.bind(obj);
	return Object.keys(rp).reduce((res, key) => {
		if (hasObjKey(key)) res[key] = obj[key];
		return res;
	},
		{}
	);
}

export function getStateInit({
	stateDefault,
	resumeObj,
}) {
	const resumed = resumeObj.get();
	return {
		...stateDefault,
		...resumed,
	};
}

export function getDefaultAPI({
	deps,
}) {
	return {
		forceUpdate(props) {
			deps.setState?.(props);
		},
		setInit() {
			deps.setState?.(deps.initialState);
		},
	};
}

export function getCompsAPI({
	items = {},
	toClone = {},
}) {
	const comps = Object.entries(items ?? {}).concat(Object.entries(toClone ?? {}));
	return comps && comps.reduce((res, [name, comp]) => {
			const compUpd = toClone[name] ? comp.clone({
				name,
			}) : comp;
			
			return {
				...res,
				[name]: compUpd,
				[`${name}API`]: {
					...compUpd?.getAPI?.(),
				},
			};
		},
		{}
	);
}

export function refreshWindows(
) {
	window.document.dispatchEvent(
		new Event(eventNames.refreshWindow),
	);

	const oppositeWindow = getOppositeWindow();
	oppositeWindow?.document.dispatchEvent(
		new Event(eventNames.refreshWindow),
	);
}

export function ProgressTitle({
	progress,
}) {
	return `Подожди. ${progress} %`;
}

export function onMoveSelections({
	Comp,
	onChangeSelections,
}) {
	const rp = Comp.getReqProps();
	return checkProgress({
			checkFunc: rp.server.checkProgress,
			notificationAPI: rp.NotificationAPI.forceUpdate,
		})
		.then(() => {
			onChangeSelections?.();
			refreshWindows({
				Comp,
			});
		});
}

export function checkProgress({
	checkFunc,
	notificationAPI,
}) {
	return new Promise((resolve) => {
		coreFunc();

		function coreFunc() {
			return checkFunc()
			.then((res) => {
				const isCopyCompleted = res.progress === 100;
				setTimeout(() => (isCopyCompleted ? null : coreFunc()), 500);        
				
				if (notificationAPI === undefined) {
					return;
				}

				notificationAPI({
					progress: ProgressTitle({
						progress: res.progress,
					}),
				});

				if (isCopyCompleted) {					
					resolve();         
				}
			});
		}
	});
  }

export function getUpdatedActionLists() {
	const resumeObj = new ResumeObj();
	const appState = resumeObj.state;
	const {
		Print: {
			filesToPrint,
		},
		Share: {
			filesToShare = {},
		} = {},
	} = appState;

	return {
		updatedActionLists: {
			filesToPrint,
			filesToShare,
		},
	};
}

export function updateActionsLists({
	lists,
}) {
	const resumeObj = new ResumeObj();
	resumeObj.saveUpdatedActionLists({
		lists,
	});
}

export function getItemName(name, sep) {
	return name?.replace(sep, '');
}

export function myRequest({ request, requestParams, onResponse }) {
    const DialogAPI = Dialog.getAPI();

	DialogAPI.show({
		message: 'Подожди.',
		isModal: true,
		isHide: false,
	});
	return request?.()
		.then(onResponse)
		.then(() => {
			DialogAPI.close();
		});
}

export function onChangeSelections({handler}) {
	return (event) => {
		const src = event.target.getAttribute('src');
		const { checked } = event.target;

		handler({
			src,
			checked,
		});
	}
};
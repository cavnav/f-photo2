import {
	eventNames
} from './constants';
import {
	ResumeObj,
} from './resumeObj';

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

export function isBanMoveItems() {
	// same path
	// welcome
	// onePhoto
	// one side enabled move, then another side onePhoto


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
			},
		});
		
		if (['Welcome', 'OnePhoto'].includes(destAction.action)) {
			return true;

		}
	} else {
		return true;
	}


	return false;
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

export function addHandlers({
	fns,
}) {
	return fns.reduce((res, fn) => {
		res[fn.name] = fn;
		return res;
	}, {});
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
				...compUpd.getAPI?.(),
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

export function checkServerProgress({
	service,
	onResponse,
}) {
	return new Promise((resolve) => {
		fn();

		function fn() {
			service()
				.then(({
					progress,
				}) => {
					onResponse({
						progress,
					});

					if (progress < 100) {
						setTimeout(
							() => fn(),
							500,
						);
						return;
					}

					resolve();
				});
		}
	});
}

export function ProgressNotification({
	progress,
}) {
	return `Подожди. ${progress} %`;
}

export function onMoveSelections({
	Comp,
	onChangeSelections,
}) {
	const rp = Comp.getReqProps();
	return checkServerProgress({
		service: rp.server.checkProgress,
		onResponse: ({
			progress,
		}) => {
			rp.NotificationAPI.forceUpdate({
				title: ProgressNotification({
					progress,
				}),
			});
		},
	})
		.then(() => {
			onChangeSelections?.();
			refreshWindows({
				Comp,
			});
			rp.NotificationAPI.setInit({});
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
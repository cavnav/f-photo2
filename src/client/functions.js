import {useCallback, useEffect} from 'react';
import { channel } from './channel';
import { DIALOG_TYPES } from './components/Dialog/Dialog';
import {
	LAST_ELEMENT,
	eventNames
} from './constants';
import {
	ResumeObj, STORAGE_ITEM,
} from './resumeObj';

const RESUME_OBJ = new ResumeObj();
const TEXT_WAIT = 'подожди...';
const TEXT_SERVER_ERROR = 'произошла ошибка. попробуй повторить свое действие или обратись в поддержку';

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
	const resumeState = RESUME_OBJ.state;
	return Boolean(_get(resumeState[windowName], 'App.browseState.path'));
}

export function isBanMoveItems({
	path,
} = {}) {
	// another side is: samePath, welcome, onePhoto, print, printed.


	const destWindow = getOppositeWindow();

	if (destWindow) {
		const resumeState = RESUME_OBJ.state;
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
		
		if (['Welcome', 'OnePhoto', 'Print', 'PrintedComp'].includes(destAction.action)) {
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
	eventName,
	callback,
}) {
	document.addEventListener(eventName, callback);
	return () => document.removeEventListener(eventName, callback);
}

export function getOppositeWindow() {
	return window.name === "rightWindow" ? window.parent.frames[0] : window.parent.frames[1];
}


export function refreshOppositeWindow({
	eventName = eventNames.refreshWindow,
} = {}) {
	const oppositeWindow = getOppositeWindow();
	oppositeWindow?.document.dispatchEvent(
		new Event(eventName)
	);
}

export function oppositeWindowExitFolder() {
	const oppositeWindow = getOppositeWindow();
	oppositeWindow?.document.dispatchEvent(
		new Event(eventNames.exitFolder)
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
	const resumeState = RESUME_OBJ.state;
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
					...compUpd?.getAPI(),
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
	return progress ? `Подожди. ${progress} %` : 'Подожди';
}

export function onMoveSelections({
	Comp,
	onChangeSelections,
}) {
	const rp = Comp.getReqProps();
	return checkProgress({
			checkFunc: rp.server.checkProgress,
		})
		.then(() => {
			onChangeSelections?.();
			refreshWindows({
				Comp,
			});
		});
}

export function notifyServerError(error) {
	const {DialogAPI} = getChannelComps({
		callback: ({
			Dialog,
		}) => ({items: {Dialog}}),
	});

	console.log(error);
	DialogAPI.showConfirmation({
		message: TEXT_SERVER_ERROR, 
		isHide: false, 
		type: DIALOG_TYPES.error,
	});

}
export function loader({
	isActive,
}) {
	const {DialogAPI} = getChannelComps({
		callback: ({
			Dialog,
		}) => ({items: {Dialog}}),
	});

	if (isActive) {
		/* Похоже, что мой setState если вызывается последовательно 
		несколько раз, выполняется с оптимизацией. 
		Факт - если вызвать:
		DialogAPI.show();
		DialogAPI.update({message: TEXT_WAIT});

		Будет два вызова render, но компонент будет null. (первый рендер)

		Если вызвать:
		DialogAPI.show();
		DialogAPI.update({message: TEXT_WAIT});
		DialogAPI.update({message: 'asdf'});

		Будет два вызова render, но компонент будет диалог с 'asdf'.
		*/
		DialogAPI.show({message: TEXT_WAIT, isHide: false, type: DIALOG_TYPES.notification});
	}
	else {
		DialogAPI.close();
	}
}

export function checkProgress({
	checkFunc,
}) {
	return new Promise((resolve) => {
		coreFunc();

		const {DialogAPI} = getChannelComps({
			callback: ({
				Dialog,
			}) => ({items: {Dialog}}),
		});

		DialogAPI.show({isHide: false});

		// --------------------------
		function coreFunc() {
			return checkFunc()
			.then((res) => {
				const isRequestCompleted = res.error || res.progress === 100;
				setTimeout(() => (isRequestCompleted ? null : coreFunc()), 500);        

				const message = res.error ? TEXT_SERVER_ERROR : ProgressTitle({
					progress: res.progress,						
				});

				if (res.error) {
					DialogAPI.showConfirmation({
						message,
						type: 'error',
						confirmBtn: {
							onConfirm: resolve,
						},
					});
				}
				else {
					DialogAPI.show({
						message,
						isHide: false,
					});

					if (isRequestCompleted) {					
						DialogAPI.close();     
						resolve();    					
					}
				}				
			});
		}
	});
}

export function updateActionsLists({
	lists,
}) {
	// update print, printed, share lists.
	saveActionLists({
		lists,
	});
}

export function getItemName([itemName], sep) {
	return itemName?.replace(sep, '');
}

export function useOnChangeSelections({
	Comp, 
	handler, 
	ident = 'src', 
	deps,
}) {
	return useCallback(
		(event) => {
			const identVal = event.target.getAttribute(ident);
			const { checked } = event.target;

			handler({
				Comp,
				ident: identVal,
				checked,
				event,
			});
		},
		deps,
	);
};

export function updateHtmlSelectorsFromArray({
	selection,
	ident,
}) {
	const updated = updateHtmlSelectors({handler, ident});

	return updated;

	// ---------------------------------
	function handler({item, ident}) {
		const isChecked = Boolean(selection?.includes(ident));
		item.checked = isChecked;
	}
}

export function updateHtmlSelectorsFromObject({
	selection,
	ident,
}) {
	const updated = updateHtmlSelectors({handler, ident});

	return updated;

	// ----------------
	function handler({item, ident}) {
		const selectionsUpd = {};	
		const isChecked = selection[ident];
		item.checked = isChecked;
		if (isChecked) {
			selectionsUpd[ident] = selection[ident];
		}
	}
}

function updateHtmlSelectors({handler, ident = 'src'}) {	
	[...document.querySelectorAll('.itemSelector')].forEach((item) => {
		const identVal = item.getAttribute(ident);
		handler({item, ident: identVal});
	});	
}

export function getChannelComps({callback}) {
	const required = callback?.(channel.comps);
    return getCompsAPI(required);
}

export function getActionLists() {
    const result = {};

    const actions = getActions();
    for (let actionName in actions) {
      result[actionName] = actions[actionName]?.files ?? '';
    }

    return result;
}

function getActions() {
    const {
      Print,
    } = RESUME_OBJ.state;

	return {
		Print,
	};
}

export function getUpdatedActionLists() {
    return {
      updatedActionLists: getActionLists(),
    };
}

export function saveActionLists({
    lists,
}) {
	const state = RESUME_OBJ.state;
    Object.entries(lists).forEach(([actionName, files]) => {
        if (state[actionName]) {
			state[actionName].files = files;
		}
    });

    localStorage.setItem(
      STORAGE_ITEM,
      JSON.stringify(state),
    );
}

export function getSelector({id}) {
	return `[src="${id}"]`;
}

export function scrollToLastElement() {
	scrollToSelector({selector: getSelector({id: LAST_ELEMENT})});
}

export function scrollToSelector({selector}) {
	if (selector === undefined || selector === "") {
		return false;
	}

	const SCROLL_CLASS = 'scroll-to';	

	const elementPrevScroll = document.querySelector(`.${SCROLL_CLASS}`);
	elementPrevScroll?.classList.remove(SCROLL_CLASS);

	const elementTarget = document.querySelector(selector);

	if (elementTarget === null) {
		return false;
	}

	elementTarget.scrollIntoView();
	elementTarget.classList.add(SCROLL_CLASS);

	return true;
}

export const updateFiles = {
	update(props) {
		props.files[props.id] = {
			...files[props.id],
			...props.item,
		};
		return props.files;
	},
	add(props) {
		props.files[props.id] = props.item;
		return props.files;

	},
	delete(props) {
		delete props.files[props.id];
		return props.files;
	},
}
	
export function useOnClickItem({eventHandlers}) {
	return useCallback(
		(event) => {
			const eventHandler = event.target.getAttribute('handler');
			eventHandlers[eventHandler]?.(event);
		},
		[]
	);
};

export function useEffectSetHtmlSelection({
	selection,
	ident,
}) {
	useEffect(
		() => {
			if (selection.constructor === Array) {
				updateHtmlSelectorsFromArray({
					selection,
					ident,
				});
			}
			else if (selection.constructor === Object) {
				updateHtmlSelectorsFromObject({
					selection,
					ident,
				});
			}
		}, 
	);
}

export function getRequestFileHandler({
	Comp, 
	ident:src,	
}) {
	const {
		AppAPI,
		Browse,
		BrowseAPI,
	} = Comp.getComps();

	const {sep} = RESUME_OBJ.state;
	const lastIndexSeparator = src.lastIndexOf(sep);
	const path = src.substr(0, lastIndexSeparator);
	const item = src.substr(lastIndexSeparator + 1);

	const {setState} = Comp.getDeps();
	const identUpd = getSelectorSrc({src});
	
	setState({
		scrollTo: getSelector({id: identUpd}),
	});

	BrowseAPI.setToResumeObj({
		val: {
			path,
			scrollTo: getSelector({id: item}),
		}
	});

	AppAPI.toggleAction({
		action: Browse.name,	
	});
}

export function getSelectorSrc({
	src,
}) {
	const {sep} = RESUME_OBJ.state;
	return src.split(sep).join(sep.concat(sep));	
}
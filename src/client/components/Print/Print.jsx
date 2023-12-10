import './styles.css';

import React, {useEffect} from 'react';

import {
	Stepper,
} from '../';
import { checkProgress, 
	refreshOppositeWindow,
	getVarName, onChangeSelections, updateHtmlSelectorsFromObject, scrollToSelector } from '../../functions';
import { createSteps } from './createSteps';
import { channel } from '../../channel';
import { Copying } from './components/Copying';
import { Empty } from '../';
import { useMutedReducer } from '../../mutedReducer';
import { eventNames } from '../../constants';
import { PrintItemsRender } from '../../common/PrintItemsRender';
import { updateFiles } from './PrintUtils';
import { usePrintActions } from './components/printHooks';


const MAX_FILES_COUNT = 5;
const LAST_ELEMENT = 'last-element';


export const Print = channel.addComp({
	name: 'Print',
	getResumeObj,
	render,
	getAPI,
	getReqProps,
	getComps,
});

function render({
	files, // filesToPrint or printedFiles from folder.
	printed, // printed folder name.
	onBackToPrinted, // when cancel write to flash.
}) {
	const Comp = this;
	const rp = Comp.getReqProps();	
	const {resumeObj} = rp;

	const [state, setState, setStateSilent] = useMutedReducer({		
		initialState: getInitialState({resumeObj}),
		setCompDeps: Comp.setCompDeps,
		...(files && {
			props: {
				files,
				printed,
				onBackToPrinted,
			}
		}),
		fn: ({
			stateUpd,
		}) => {
			resumeObj.save({
				val: stateUpd
			});
		}
	});

	const onChangeFiles = ({ items }) => {		
		const requiredFilesToPrintUpd = {};
		for (const file in state.requiredFilesToPrint) {
			if (state.files[file]) {
				requiredFilesToPrintUpd[file] = state.files[file];
			}
		}
		setStateSilent({
			files: items,
			requiredFilesToPrint: requiredFilesToPrintUpd,
		});
	}	

	const steps = React.useMemo(
		() => {
			if (!state.isSaveToFlash) {
				return undefined;
			}
			
			const files = Object.keys(state.requiredFilesToPrint).length  ? state.requiredFilesToPrint : state.files;			
			
			function saveFilesToFlash() {
				return rp.server.$saveFilesToFlash({
					files,
					folderNameField: 'cnt',
				})				
				.then(() => {
					return checkProgressWrap();
				});				
			}

			function checkProgressWrap() {
				return checkProgress({
					checkFunc: rp.server.checkProgress,
					notificationAPI: ({
							progress,
						}) => rp.DialogAPI.showNotification({
							message: progress,
						})					
				})
				.then(() => rp.DialogAPI.close());
			}

			return createSteps({
				$getUsbDevices: rp.server.$getUsbDevices,
				onAllStepsPassed: () => {
					for (const file in files) {
						delete state.files[file];
					}
					setState({
						files: state.files,
						isSaveToFlash: false,
						isFilesExcess: false,
						requiredFilesToPrint: {},
					});
				},
				Copying: ({
					nextStepBtn,
				}) => <Copying
					nextStepBtn={nextStepBtn}
					filesToPrint={files}
					onCopyCanceled={() => setState({
						isSaveToFlash: false
					})}
					saveFilesToFlash={saveFilesToFlash}
				/>,
			});
		},
		[state.isSaveToFlash],
	);

	const isEmpty = Object.keys(state.files).length === 0;

	const onChangeThisSelections = onChangeSelections({Comp, handler: onChangeSelectionsHandler});
	const onOpenItemFolder = onChangeSelections({Comp, handler: onOpenItemFolderHandler});

	const onSelectItem = (event) => {		
		const handler = event.target.getAttribute('handler');
		const eventHandlers = {
			onChangeThisSelections, 
			onOpenItemFolder,
		};
		eventHandlers[handler]?.(event);
	}

	usePrintActions({
		isSaveToFlash: state.isSaveToFlash,
		isEmpty,
		printed,
		render: rp.AdditionalPanelAPI.renderIt,
		onCancelSaveToFlash: () => {
			setState({
				isSaveToFlash: false,
			});
		},
		onSaveToFlash: async () => {
			const isResolve = await rp.DialogAPI.showChoiceConfirmation({
				message: 'Внимание! Флешка будет очищена перед копированием. Продолжить ?',
			});

			if (isResolve === 'false') {
				return;
			}

			const isRequiredFiles = Object.keys(state.requiredFilesToPrint).length > 0;
			if (isRequiredFiles) {
				setState({
					isSaveToFlash: true,
				});
				return;
			}

			const isFilesExcess = checkFilesExcess({files: state.files});
			if (isFilesExcess) {				
				rp.DialogAPI.showConfirmation({
					message: 'Нельзя записать все фотографии на флешку за один раз. Отметь галочкой фотографии, чтобы их напечатать.',
				});
				setState({
					isFilesExcess: true,
				});
				return;
			}

			setState({
				isSaveToFlash: true,
			});

		},
		onBackToPrinted: state.onBackToPrinted,
	});

	useEffect(
		() => {
			const {
				setState,
			} = Comp.getDeps();
			const rp = Comp.getReqProps();
			const {resumeObj} = rp;
			const refreshWindowWrap = () => {
				setState({
					files: resumeObj.get().files,
				});				
			};

			document.addEventListener(eventNames.refreshWindow, refreshWindowWrap);
			
			return () => document.removeEventListener(eventNames.refreshWindow, refreshWindowWrap);
		},
		[]
	);

	useEffect(
		() => {
			updateHtmlSelectorsFromObject({
				selections: state.requiredFilesToPrint,
			});
		}, 
		[state.isSaveToFlash]
	);

	useEffect(
		() => {
			scrollToSelector({selector: state.scrollTo});
		},
		[state.files]
	)

	useEffect(() => {
		refreshOppositeWindow();
	}, []);


	return (
		<div
			className="Print layout"
			onClick={onSelectItem}
		>
			{steps 
				? <Stepper
					steps={steps}
				/> 
				: <PrintItemsRender 
					items={state.files}
					onChangeItems={onChangeFiles} 
					onRequiredItemName={getVarName({onOpenItemFolder})}
					onChangeSelectionsName={state.isFilesExcess ? getVarName({onChangeThisSelections:1}) : undefined}
				/>			
			}

			<div id="last-element"/>

			{isEmpty && <Empty/>}			
		</div>
	);
}

function getReqProps({
	channel,
	comps,
	resumeObj,
}) {
	return {
		server: channel.server,
		resumeObj,
		...comps,
	}
};

function getAPI({
	Comp,
	deps,
	resumeObj,
}) {
	return {
		getFilesToPrint,
		togglePrint,
		isFileToPrint,
	};


	// -----------------------

	function isFileToPrint({
		src,
	}) {
		return isToPrint({
			val: resumeObj.get().files?.[src],
		});
	}

	function togglePrint({
		src,
	}) {
		const resumed = resumeObj.get();
		// 0 - not to print, but show in list.
		// 1 - to print.
		const printed = isToPrint({
			val: resumed.files[src]?.cnt
		});

		// toggle.
		if (printed) {
			resumed.files = updateFiles.delete({
				files: resumed.files,
				photoSrc: src,
				Comp,
			});
		}
		else {
			resumed.files = updateFiles.add({
				files: resumed.files,
				photoSrc: src,
				cnt: 1,
				Comp,
			});
		}

		resumeObj.save({
			val: {
				files: resumed.files,
			},
		});

		return !printed;
	}

	function getFilesToPrint(props = {}) {
		const {
			state,
		} = deps;
		return props.photoSrc ? state.files[props.photoSrc] : state.files;
	}
}

function getStateDefault() {
	return {
		files: {},
		// используется, когда нельзя записать все файлы на флешку разом. 
		// Тогда надо выбрать конкретные, поставив галочку.
		requiredFilesToPrint: {}, 
		isSaveToFlash: false, 
		isFilesExcess: false,
		scrollTo: `#${LAST_ELEMENT}`,
	};
}

function getInitialState({
	resumeObj,
}) {
	const resumed = resumeObj.get();
	return {
		...getStateDefault(),

		...resumed,
	};
}

function isToPrint({
	val,
}) {
	return [undefined, 0].includes(val) ? false : true;
}

function getComps({
	channelComps,
}) {
	const {
		App,
		AdditionalPanel,
		Dialog,
		Browse,
	} = channelComps;
	return {		
		items: {
			App,
			Dialog,
			Browse,
			AdditionalPanel,
		},
	};
}

function getResumeObj({name}) {
	return {
		selector: [
			name,
		],
		val: getStateDefault(),
	}
}

function checkFilesExcess({files, delta = 0}) {
	return Object.keys(files).length + delta > MAX_FILES_COUNT;
}

function onOpenItemFolderHandler({Comp, src}) {
	const rp = Comp.getReqProps();
	const {sep} = rp.resumeObj.state;
	const lastIndexSeparator = src.lastIndexOf(sep);
	const path = src.substr(0, lastIndexSeparator);
	const item = src.substr(-lastIndexSeparator + 1);

	rp.BrowseAPI.setToResumeObj({
		val: {
			path,
			scrollTo: `[src="${item}"]`,
		}
	});

	const {setState} = Comp.getDeps();
	setState({
		scrollTo: src,
	});

	rp.AppAPI.toggleAction({
		action: rp.Browse.name,	
	});
}

function onChangeSelectionsHandler({Comp, event, src, checked}) {
	const {state, setStateSilent} = Comp.getDeps();

	if (checked) {
		if (checkFilesExcess({files: state.requiredFilesToPrint, delta: 1})) {
			rp.DialogAPI.showConfirmation({
				message: 'Выбрано максимальное количество фотографий для записи на флешку.',
			});
			event.preventDefault();
			return;
		}
		state.requiredFilesToPrint[src] = state.files[src];
	}
	else {
		delete state.requiredFilesToPrint[src];
	}

	setStateSilent({
		requiredFilesToPrint: state.requiredFilesToPrint,
	});
};
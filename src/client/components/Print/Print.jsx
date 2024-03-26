import './styles.css';

import React, {useEffect} from 'react';

import {
	BrowseBase,
	Stepper,
} from '../';
import { checkProgress, 
	getVarName, 
	updateHtmlSelectorsFromObject, 
	scrollToSelector, 
	getExistsProps,
	useOnChangeSelections,
	getRequestFileHandler,
	useOnClickItem,
} from '../../functions';
import { createSteps } from './createSteps';
import { channel } from '../../channel';
import { Copying } from './components/Copying';
import { useMutedReducer } from '../../mutedReducer';
import { EVENT_NAMES } from '../../constants';
import { PrintItemsRender } from './components/PrintItemsRender';
import { usePrintActions } from './components/printHooks';
import { updateFiles } from '../../functions';


const MAX_FILES_COUNT = 5;


export const Print = channel.addComp({
	name: 'Print',
	getResumeObj,
	render,
	getAPI,
	getReqProps,
	getComps,
});

function render(props) {
	const Comp = this;
	const rp = Comp.getReqProps();	
	const {resumeObj} = rp;

	const {state, setState, setStateSilent} = useMutedReducer({		
		initialState: getInitialState({resumeObj}),
		reducer,
		setCompDeps: Comp.setCompDeps,
		props,
		fn: ({
			state,
		}) => {			
			const val = getSavedState({state});
			resumeObj.save({
				val,
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
			if (state.isCopyingScript === false) {
				return [];
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
				})
				.then(() => {
					setState({
						isCancelCopyingBtn: false,
					});		
				});
			}

			return createSteps({
				$getUsbDevices: rp.server.$getUsbDevices,
				onAllStepsPassed: () => {
					for (const file in files) {
						delete state.files[file];
					}
					setState({
						files: state.files,
						isCopyingScript: false,
						isFilesExcess: false,
						isSaveToFlashBtn: true,
						requiredFilesToPrint: {},
					});
				},
				Copying: ({
					nextStepBtn,
				}) => <Copying
					nextStepBtn={nextStepBtn}					
					saveFilesToFlash={saveFilesToFlash}
				/>,
			});
		},
		[state.isCopyingScript],
	);

	const onChangeThisSelections = useOnChangeSelections({Comp, handler: onChangeSelectionsHandler, deps: []});
	const onOpenItemFolder = useOnChangeSelections({Comp, handler: getRequestFileHandler, deps: []});

	const eventHandlers = {
		onChangeThisSelections, 
		onOpenItemFolder,
	};

	const onClickItem = useOnClickItem({eventHandlers});

	usePrintActions({
		isSaveToFlashBtn: state.isSaveToFlashBtn,
		isCancelCopyingBtn: state.isCancelCopyingBtn,
		printed: props.printed,
		render: rp.AdditionalPanelAPI.renderIt,
		onCancelSaveToFlash: () => {
			setState({
				isCancelCopyingBtn: false,
				isCopyingScript: false,
				isSaveToFlashBtn: true,
			});
		},
		onSaveToFlash: async () => {
			const stateUpd = {
				isCopyingScript: true,
				isSaveToFlashBtn: false,
				isCancelCopyingBtn: true,
			};

			const isResolve = await rp.DialogAPI.showChoiceConfirmation({
				message: 'Внимание! Флешка будет очищена перед копированием. Продолжить ?',
			});

			if (isResolve === 'false') {
				return;
			}

			const isRequiredFiles = Object.keys(state.requiredFilesToPrint).length > 0;
			if (isRequiredFiles) {
				setState(stateUpd);
				return;
			}

			const isFilesExcess = checkFilesExcess({files: state.files, delta: 0});
			if (isFilesExcess) {				
				rp.DialogAPI.showConfirmation({
					message: 'Нельзя записать все фотографии на флешку за один раз. Отметь галочкой фотографии, чтобы их напечатать.',
				});
				setState({
					isFilesExcess: true,
				});
				return;
			}

			setState(stateUpd);

		},
		onBackToPrinted: () => {
			state.onBackToPrinted();
			setStateSilent({
				scrollTo: "",
			});
		}
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

			document.addEventListener(EVENT_NAMES.refreshWindow, refreshWindowWrap);
			
			return () => document.removeEventListener(EVENT_NAMES.refreshWindow, refreshWindowWrap);
		},
		[]
	);

	useEffect(
		() => {
			updateHtmlSelectorsFromObject({
				selection: state.requiredFilesToPrint,
			});
		}, 
		[state.isCopyingScript]
	);

	useEffect(
		() => {
			scrollToSelector({selector: state.scrollTo});
		},
		[state.files]
	);


	return (
		<div
			className="Print layout"
		>
			{state.isCopyingScript 
			? 	<Stepper
					steps={steps}
				/> 
			: 	<BrowseBase
					scrollTo={state.scrollTo}
					onClick={onClickItem}
				>
					<PrintItemsRender 
						items={state.files}
						onChangeItems={onChangeFiles} 
						onRequiredItemName={getVarName({onOpenItemFolder})}
						onChangeSelectionsName={state.isFilesExcess ? getVarName({onChangeThisSelections:1}) : undefined}
					/>	
				</BrowseBase>
			}					
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
	resumeObj,
}) {
	return {
		toggleStatus,
		getStatus,
	};


	// -----------------------

	function getStatusObj({
		value,
	}) {
		return {
			toPrint: value,
		};
	}

	function getStatus({
		src,
	}) {
		return getStatusObj({
			value: Boolean(resumeObj.get().files?.[src]),
		});
	}

	function toggleStatus({
		src,
	}) {
		const resumed = resumeObj.get();
		const printed = Boolean(resumed.files[src]?.cnt);

		if (printed) {
			resumed.files = updateFiles.delete({
				files: resumed.files,
				id: src,
			});
		}
		else {
			resumed.files = updateFiles.add({
				files: resumed.files,
				id: src,
				item: {
					cnt: 1,
				}
			});
		}

		resumeObj.save({
			val: {
				files: resumed.files,
			},
		});

		return getStatusObj({
			value: !printed,
		});
	}
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
		val: getSavedState({state: getStateDefault()}),
	}
}

function checkFilesExcess({files, delta}) {
	return Object.keys(files).length + delta > MAX_FILES_COUNT;
}

function onChangeSelectionsHandler({Comp, event, ident, checked}) {
	const {state, setStateSilent} = Comp.getDeps();

	if (checked) {
		if (checkFilesExcess({files: state.requiredFilesToPrint, delta: 1})) {
			rp.DialogAPI.showConfirmation({
				message: 'Выбрано максимальное количество фотографий для записи на флешку.',
			});
			event.preventDefault();
			return;
		}
		state.requiredFilesToPrint[ident] = state.files[ident];
	}
	else {
		delete state.requiredFilesToPrint[ident];
	}

	setStateSilent({
		requiredFilesToPrint: state.requiredFilesToPrint,
	});
};

function reducer({
	state,
	stateUpd,
}) {
	const stateNew = {
		...state,
		...stateUpd,
	};

	const isEmpty = Object.keys(stateNew.files).length === 0;

	stateNew.isEmpty = isEmpty;

	if (isEmpty) {
		stateNew.isSaveToFlashBtn  = false;
		stateNew.isCancelCopyingBtn = false;
	}	
	else if (stateNew.isCopyingScript === false) {
		stateNew.isSaveToFlashBtn = true;
	}

	return stateNew;
}

function getSavedState({state}) {
	return getExistsProps({
		obj: state,
		rp: {
			files: 1,
			requiredFilesToPrint: 1,
			isFilesExcess: 1,
			scrollTo: 1,
			printed: 1,
		},
	});
}

function getStateDefault() {
	return {		
		// props	
		// filesToPrint or printedFiles from folder.
		files: {},
		printed: "", // printed folder name.
		onBackToPrinted: "", // callback to printed.

		// используется, когда нельзя записать все файлы на флешку разом. 
		// Тогда надо выбрать конкретные, поставив галочку.
		requiredFilesToPrint: {}, 
		isSaveToFlashBtn: false,
		isCancelCopyingBtn: false,
		isCopyingScript: false,
		isFilesExcess: false,
		isEmpty: false,
		scrollTo: "",		
	};
}
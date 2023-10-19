import './styles.css';

import React, {useEffect} from 'react';

import {
	Stepper,
} from '../';
import { checkProgress, 
	refreshOppositeWindow,
	getVarName, onChangeSelections, updateHtmlSelectorsFromObject } from '../../functions';
import { createSteps } from './createSteps';
import { channel } from '../../channel';
import { Copying } from './components/Copying';
import { Empty } from '../';
import { useMutedReducer } from '../../mutedReducer';
import { eventNames } from '../../constants';
import { PrintItemsRender } from '../../common/PrintItemsRender';
import { updateFilesToPrint } from './PrintUtils';
import { usePrintActions } from './components/printHooks';


const MAX_FILES_COUNT = 5;


export const Print = channel.addComp({
	name: 'Print',
	getResumeObj,
	render,
	getAPI,
	getReqProps,
	getComps,
});

function render({
	files,
	printed,
	onBackToPrinted,
}) {
	const Comp = this;
	const rp = Comp.getReqProps();	
	const {resumeObj} = rp;

	const [state, setState, setStateSilent] = useMutedReducer({		
		initialState: getInitialState({resumeObj}),
		setCompDeps: Comp.setCompDeps,
		...(files && {
			props: {
				filesToPrint: files,
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
			if (state.filesToPrint[file]) {
				requiredFilesToPrintUpd[file] = state.filesToPrint[file];
			}
		}
		setStateSilent({
			filesToPrint: items,
			requiredFilesToPrint: requiredFilesToPrintUpd,
		});
	}

	const onChangeSelectionsHandler = ({event, src, checked})=> {
		if (checked) {
			if (checkFilesExcess({files: state.requiredFilesToPrint, delta: 1})) {
				rp.DialogAPI.showConfirmation({
					message: 'Выбрано максимальное количество фотографий для записи на флешку.',
				});
				event.preventDefault();
				return;
			}
			state.requiredFilesToPrint[src] = state.filesToPrint[src];
		}
		else {
			delete state.requiredFilesToPrint[src];
		}

		setStateSilent({
			requiredFilesToPrint: state.requiredFilesToPrint,
		});
	};

	const onChangeThisSelections = onChangeSelections({handler: onChangeSelectionsHandler});

	const steps = React.useMemo(
		() => {
			if (!state.isSaveToFlash) {
				return undefined;
			}
			
			const filesToPrint = Object.keys(state.requiredFilesToPrint).length  ? state.requiredFilesToPrint : state.filesToPrint;			
			
			function saveFilesToFlash() {
				return rp.server.$saveFilesToFlash({
					files: filesToPrint,
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
					for (const file in filesToPrint) {
						delete state.filesToPrint[file];
					}
					setState({
						filesToPrint: state.filesToPrint,
						isSaveToFlash: false,
						isFilesExcess: false,
						requiredFilesToPrint: {},
					});
				},
				Copying: ({
					nextStepBtn,
				}) => <Copying
					nextStepBtn={nextStepBtn}
					filesToPrint={filesToPrint}
					onCopyCanceled={() => setState({
						isSaveToFlash: false
					})}
					saveFilesToFlash={saveFilesToFlash}
				/>,
			});
		},
		[state.isSaveToFlash],
	);

	const isEmpty = Object.keys(state.filesToPrint).length === 0;

	const onClickItem = (event) => {		
		const handler = event.target.getAttribute('handler');
		const eventHandlers = {
			onChangeThisSelections,
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

			const isFilesExcess = checkFilesExcess({files: state.filesToPrint});
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
					filesToPrint: resumeObj.get().filesToPrint,
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

	useEffect(() => {
		refreshOppositeWindow();
	}, []);


	return (
		<div
			className="Print layout"
			onClick={onClickItem}
		>
			{steps 
				? <Stepper
					steps={steps}
				/> 
				: <PrintItemsRender 
					items={state.filesToPrint}
					onChangeItems={onChangeFiles} 
					onChangeSelectionsName={state.isFilesExcess ? getVarName({onChangeThisSelections}) : undefined}
				/>
			}

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
			val: resumeObj.get().filesToPrint?.[src],
		});
	}

	function togglePrint({
		src,
	}) {
		const resumed = resumeObj.get();
		// 0 - not to print, but show in list.
		// 1 - to print.
		const printed = isToPrint({
			val: resumed.filesToPrint[src]?.cnt
		});

		// toggle.
		if (printed) {
			resumed.filesToPrint = updateFilesToPrint.delete({
				filesToPrint: resumed.filesToPrint,
				photoSrc: src,
				Comp,
			});
		}
		else {
			resumed.filesToPrint = updateFilesToPrint.add({
				filesToPrint: resumed.filesToPrint,
				photoSrc: src,
				cnt: 1,
				Comp,
			});
		}

		resumeObj.save({
			val: {
				filesToPrint: resumed.filesToPrint,
			},
		});

		return !printed;
	}

	function getFilesToPrint(props = {}) {
		const {
			state,
		} = deps;
		return props.photoSrc ? state.filesToPrint[props.photoSrc] : state.filesToPrint;
	}
}

function getStateDefault() {
	return {
		filesToPrint: {},
		// используется, когда нельзя записать все файлы на флешку разом. Тогда надо выбрать конкретные, поставив галочку.
		requiredFilesToPrint: {}, 
		isSaveToFlash: false, 
		isFilesExcess: false,
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
		AdditionalPanel,
		Dialog,
	} = channelComps;
	return {		
		items: {
			Dialog,
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
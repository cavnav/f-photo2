import './styles.css';

import React from 'react';

import {
	Stepper,
} from '../';
import { checkProgress } from '../../functions';
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

	const [state, setState] = useMutedReducer({
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

	const onChangeFiles = ({ items }) => setState({
		filesToPrint: items,
	});

	const steps = React.useMemo(
		() => {
			if (!state.isSaveToFlash) {
				return undefined;
			}

			const filesToPrint = {};
			const stateFilesToPrint = state.filesToPrint;
			const isFilesExcess = Object.keys(stateFilesToPrint).length > MAX_FILES_COUNT;

			let index = 0;
			for (const file in stateFilesToPrint) {
				if (index === MAX_FILES_COUNT) {
					break;
				}

				filesToPrint[file] = stateFilesToPrint[file];						

				index = index + 1;
			}

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
						}) => rp.DialogAPI.show({
							type: 'notification',
							message: progress,
							isModal: true,
							isHide: false,
						})
					
				})
				.then(() => rp.DialogAPI.close());
			}

			return createSteps({
				$getUsbDevices: rp.server.$getUsbDevices,
				onAllStepsPassed: () => {
					for (const file in filesToPrint) {
						delete stateFilesToPrint[file];
					}
					setState({
						filesToPrint: stateFilesToPrint,
						isSaveToFlash: false,
					});
				},
				Copying: ({
					nextStepBtn,
				}) => <Copying
					isFilesExcess={isFilesExcess}
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
		onSaveToFlash: () => {
			setState({
				isSaveToFlash: true,
			});
		},
		onBackToPrinted: state.onBackToPrinted,
	});

	React.useEffect(
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

	return (
		<div
			className="Print layout"
		>
			{steps 
				? <Stepper
					steps={steps}
				/> 
				: <PrintItemsRender 
					items={state.filesToPrint}
					onChangeItems={onChangeFiles} 
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
				val: {
					cnt: 1,
				},
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
		isSaveToFlash: false, 
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
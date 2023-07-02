import './styles.css';

import React from 'react';

import {
	Stepper,
} from '../';
import { checkProgress } from '../../functions';
import { createSteps } from './createSteps';
import { channel } from '../../channel';
import { Copying } from './components/Copying';
import { ResumeObj } from '../../resumeObj';
import { Spin } from 'antd';
import { Empty } from '../';
import { useMutedReducer } from '../../mutedReducer';
import { eventNames } from '../../constants';
import { PrintItemsRender } from '../../common/PrintItemsRender';


const MAX_FILES_COUNT = 100;


export const Print = channel.addComp({
	name: 'Print',
	render,
	getAPI,
	getReqProps,
	getComps,
});

const resumeObj = new ResumeObj({
	selector: [
		Print.name,
	],
	val: getStateDefault(),
});

function render({
}) {
	const Comp = this;
	const rp = Comp.getReqProps();	

	const [state, setState] = useMutedReducer({
		initialState: getStateInit(),
		setCompDeps: Comp.bindSetCompDeps(),
		fn: ({
			stateUpd,
		}) => {
			resumeObj.save({
				val: {
					filesToPrint: stateUpd.filesToPrint,
				},
			});
		}
	});

	const onCopyCompleted = React.useCallback(({
		destDir,
	}) => {
		setState({
			isCopyCompleted: true,
		});
	}, []);

	const onCopyCanceled = React.useCallback(() => setState({
		isSavePhotosToFlash: false
	}), [state.isSavePhotosToFlash]);

	const onAllStepsPassed = React.useCallback(() => {
		const rp = Comp.getReqProps();

		setState({
			isSavePhotosToFlash: false,
		});		

	}, [state.isSavePhotosToFlash]);

	const steps = React.useMemo(
		() => {
			const filesToPrint = {};
			const stateFilesToPrint = state.filesToPrint;

			let index = 0;
			for (const file in stateFilesToPrint) {
				if (index === MAX_FILES_COUNT) {
					break;
				}

				filesToPrint[file] = stateFilesToPrint[file];				

				index = index + 1;
			}

			return createSteps({
				$getUsbDevices: rp.server.$getUsbDevices,
				onAllStepsPassed,
				Copying: ({
					NextStepBtn,
				}) => <Copying
					NextStepBtn={NextStepBtn}
					filesToPrint={filesToPrint}
					onCopyCompleted={onCopyCompleted}
					onCopyCanceled={onCopyCanceled}
					$saveFilesToFlash={rp.server.$saveFilesToFlash}
					checkProgress={() => checkProgress({
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
						.then(() => rp.DialogAPI.close())
					}
				/>,
			});
		},
		[],
	);

	React.useEffect(
		() => {
			// Задать кнопки действий.
			const rp = Comp.getReqProps();

			rp.AdditionalPanelAPI.renderIt({
				actions: [
					rp.Cancel,
					rp.SaveFilesToFlash,
				],
			})
				.then(() => {
					rp.CancelAPI.forceUpdate({
						title: 'Отменить',
						onClick: () => {
							setState({
								isSavePhotosToFlash: false,
							});
						},
					});
					rp.SaveFilesToFlashAPI.forceUpdate({
						title: 'Записать на флешку',
						onClick: () => {
							setState({
								isSavePhotosToFlash: true,
							});
						},
					});
				});

			return () => {
				rp.AdditionalPanelAPI.renderIt({
					actions: [],
				});
			};
		},
		[]
	);
	React.useEffect(
		() => {
			const {
				setState,
			} = Comp.getDeps();
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
	
	const isEmpty = Object.keys(state.filesToPrint).length === 0;

	return (
		<div
			className="Print layout"
			onClick={onClickDispatcher}
		>
			{state.loading && <Spin size="large" />}

			{state.isSavePhotosToFlash ?
				<Stepper
					steps={steps}
				/> :
				<PrintItemsRender Comp={Comp} />
			}

			{isEmpty && <Empty/>}
		</div>
	);
}

function getReqProps({
	channel,
	comps,
}) {
	return {
		server: channel.server,
		...comps,
	}
};

function getAPI({
	Comp,
	deps,
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
		isSavePhotosToFlash: false, 
	};
}

function getStateInit(
) {
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
		Label,
		AdditionalPanel,
		Dialog,
	} = channelComps;
	return {
		toClone: {
			Cancel: Label,
			SaveFilesToFlash: Label,
		},
		items: {
			Dialog,
			AdditionalPanel,
		},
	};
}

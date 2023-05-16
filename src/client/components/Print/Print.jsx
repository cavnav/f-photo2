import './styles.css';

import React from 'react';

import {
	Stepper,
} from '../';
import { addHandlers, checkProgress, getBackgroundImageStyle } from '../../functions';
import { createSteps } from './createSteps';
import { channel } from '../../channel';
import { Copying } from './components/Copying';
import { Dirs } from '../Dirs/Dirs';
import { ResumeObj } from '../../resumeObj';
import { Spin } from 'antd';
import { Empty } from '../';
import { Dialog } from '../Dialog/Dialog';
import { Select } from '../Dialog';
import { useMutedReducer } from '../../mutedReducer';
import { eventNames } from '../../constants';


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
					...stateUpd,
					isSavePhotosToFlash: false,
				},
			});
		}
	});

	const onCopyCompleted = React.useCallback(({
		destDir,
	}) => {
		setState({
			isCopyCompleted: true,
			createdPrintFolder: destDir,
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

		if (state.createdPrintFolder) {
			setState({
				loading: true,
			});
			rp.server.towardPrinted({
				dir: state.createdPrintFolder,
			})
				.then(Comp.getAPI().onNavigate);
		}

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
				isCopyCompleted: state.isCopyCompleted,
				onAllStepsPassed,
				Copying: () => <Copying
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
		[state.isCopyCompleted],
	);

	const dispatcher = React.useMemo(
		() => addHandlers(
			{
				fns: [
					function onClickDir({
						event
					}) {
						const rp = Comp.getReqProps();
						setState({
							loading: true,
						});
						const dir = event.target.getAttribute('src');
						rp.server.towardPrinted({
							dir,
						})
							.then(Comp.getAPI().onNavigate)
					},
				]
			},
		),
		[],
	);

	const onClickDispatcher = React.useCallback((event) => {
		const { target } = event;
		const onClickCb = target.getAttribute('clickcb');

		onClickCb && dispatcher[onClickCb]({
			event,
		});
	}, []);

	React.useEffect(addKeyDownListener);
	React.useEffect(() => {
		const input = getActiveInput();
		input && input.focus();
	});
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

			// Задать начальные значения.
			resetTo({
				Comp,
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
	return (
		<div
			className="Print layout"
			onClick={onClickDispatcher}
		>
			{state.loading && <Spin size="large" />}
			{Object.keys(state.filesToPrint).length === 0 && (
				<Dirs
					dirs={state.dirs}
					onClickDirFnName={dispatcher.onClickDir.name}
				></Dirs>
			)}

			{state.isSavePhotosToFlash ?
				<Stepper
					steps={steps}
				/> :
				renderPrintState()
			}

			<Empty
				isTrue={state.dirs.length === 0 && Object.keys(state.filesToPrint).length === 0}
			/>
		</div>
	);

	// --------------------------------------------------------------------


	function getActiveInput() {
		document.querySelector(`input[keyid=\'${state.activeInput}\']`);
	}

	function addKeyDownListener() {
		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}

	function onKeyDown(e) {
		const input = document.activeElement;

		if (input === document.body) return;

		const photoSrc = input.getAttribute('keyid');

		if (photoSrc === null) return;

		const cntSource = Number(input.value);
		const getCntUpd = {
			38: () => (cntSource + 1),
			40: () => (cntSource > 0 ? cntSource - 1 : cntSource),
		}[e.which] ?? (() => cntSource);

		setState({
			filesToPrint: updateFilesToPrint.update({
				photoSrc,
				val: {
					cnt: getCntUpd(),
				},
			}),
		});
	}

	function renderPrintState(
	) {
		return (
			<>
				<div className="PrintItems">
					{
						Object.entries(state.filesToPrint).map(([src, { cnt }]) => {
							const key = src;

							return <div
								className="rowData"
								key={key}
							>
								<div
									className='fitPreview file'
									style={getBackgroundImageStyle({
										file: src,
									})}
								>
								</div>
								<div
									className='controls'
									photosrc={src}
								>
									<input
										className="changePhotoCount"
										keyid={key}
										value={cnt}
										onChange={onChangePhotoCount}
									/>
									<input type="button" className="marginRight10" onClick={onClickCancelPhotoPrint} value="Отменить печать" />
								</div>
							</div>
						})
					}
				</div>
			</>
		);
	}

	function onClickCancelPhotoPrint(e) {
		const { photoSrc } = getDataPrint({ element: e.target.parentElement });
		setState({
			filesToPrint: delete state.filesToPrint[photoSrc] && state.filesToPrint,
			activeInput: undefined,
		});
	}

	function onChangePhotoCount(e) {
		const input = e.target;

		// allowed only numbers.
		const numbers = /^[0-9]+$/;
		if (input.value.match(numbers) === null) {
			e.preventDefault();
			return;
		}

		const { photoSrc } = getDataPrint({ element: input.parentElement });

		setState({
			filesToPrint: updateFilesToPrint.update({
				photoSrc,
				val: {
					cnt: input.value,
				},
			}),
			activeInput: photoSrc,
		});
	}

	function getDataPrint({ element }) {
		const photoSrc = element.getAttribute('photosrc');

		return {
			photoSrc,
		};
	}

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
		onNavigate,
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
			});
		}
		else {
			resumed.filesToPrint = updateFilesToPrint.add({
				filesToPrint: resumed.filesToPrint,
				photoSrc: src,
				val: {
					cnt: 1,
				},
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

	function onNavigate({
		dirs,
		path,
		sep,
		files,
	}) {
		// Fires on set from storage, open dir, close dir.
		const rp = Comp.getReqProps();

		const [filesToPrintUpd = {}] = files;
		deps.setState({
			dirs,
			path,
			filesToPrint: filesToPrintUpd,
			snapFilesToPrint: { ...filesToPrintUpd },
			sep,
			loading: false,
		});
	}
}

function getStateDefault() {
	return {
		loading: false,
		filesToPrint: {},
		snapFilesToPrint: {},
		dirs: [],
		sep: '',
		path: '',
		activeInput: undefined,
		isSavePhotosToFlash: false,
		isCopyCompleted: false,
		isDialogSavePrint: false,
		createdPrintFolder: '',
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

function resetTo({
	Comp,
}) {
	const rp = Comp.getReqProps();
	const {
		deps,
	} = Print;

	const { path } = deps.state;

	const answer = isNeedToSaveFilesToPrint({
		deps,
	});
	const filesToPrint = deps.state.filesToPrint;

	deps.setState({
		loading: true,
	});

	rp.server.towardPrinted({
		resetTo: path,
	})
		.then(Comp.getAPI().onNavigate)
		.then(() => {
			// set filesToPrint from storage.
			if (answer.result === false) return;
			deps.setState({
				filesToPrint,
			});
		});
}

function isToPrint({
	val,
}) {
	return [undefined, 0].includes(val) ? false : true;
}

function isNeedToSaveFilesToPrint(props) {
	const {
		deps,
	} = props;
	const filesToPrint = deps.state.filesToPrint;
	const isListNotSaved = Boolean(Object.keys(filesToPrint).length && deps.state.path === '');
	const isListChanged = JSON.stringify(filesToPrint) !== JSON.stringify(deps.state.snapFilesToPrint);

	return {
		result: isListNotSaved || isListChanged,
		isListNotSaved,
		isListChanged,
	};
}

export const updateFilesToPrint = {
	update(props) {
		const filesToPrint = this.getFilesToPrint(props);
		filesToPrint[props.photoSrc] = {
			...filesToPrint[props.photoSrc],
			cnt: props.val.cnt,
		};
		return filesToPrint;
	},
	add(props) {
		const filesToPrint = this.getFilesToPrint(props);
		filesToPrint[props.photoSrc] = {
			cnt: props.val.cnt,
		};
		return filesToPrint;

	},
	delete(props) {
		const filesToPrint = this.getFilesToPrint(props);
		delete filesToPrint[props.photoSrc];
		return filesToPrint;
	},
	getFilesToPrint(props) {
		const { deps } = Print;
		return props.filesToPrint || deps.state.filesToPrint;
	}
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

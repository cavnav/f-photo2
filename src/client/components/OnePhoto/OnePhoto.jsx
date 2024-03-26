import './styles.css';

import React from 'react';
import { ResumeObj } from '../../resumeObj';
import {
	getOppositeWindow, myArray,
	updateActionsLists, refreshOppositeWindow, isBanMoveItems,
	initRefreshWindowEvent,
	getUpdatedActionLists,
	getSelectorSrc,
} from '../../functions';
import { channel } from '../../channel';
import { getCurDate } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { BTN_MOVE, BTN_REMOVE, setBtnTitle } from '../../common/additionalActions/const';
import { EVENT_NAMES } from '../../constants';

export const OnePhoto = channel.addComp({
	name: 'OnePhoto',
	render,
	getAPI: () => ({}),
	getReqProps,
	getComps,
});

const ON_TOGGLE_PHOTO = 'onTogglePhoto';

const resumeObj = new ResumeObj({
	selector: [
		window.name,
		OnePhoto.name,
	],
});

function render(
	{ }
) {
	const Comp = this;
	const {
		resumeBrowse,
		server,
	} = Comp.getReqProps();

	const myFiles = React.useMemo(
		() => myArray({
			items: resumeBrowse.files,
		}),
		[resumeBrowse.files]
	);

	const {state, setState} = useMutedReducer({
		reducer: selfReducer,
		setCompDeps: Comp.setCompDeps,
		initialState: {
			...getStateInit(),
			curPhotoInd: resumeBrowse.curPhotoInd,
			files: myFiles,
		},
	});

	const imgRef = React.useRef(null);

	React.useEffect(addKeyDownListener);
	React.useEffect(() => {
		if ({
			[ON_TOGGLE_PHOTO]: 1,
			onImgServerRotate: 1
		}[state.action] === undefined) return;

		setTimeout(() => {
			if (!imgRef.current) return;
			imgRef.current.style.visibility = 'visible';
			imgRef.current.style.opacity = '1';
		}, 200);
	});

	React.useEffect(() => {
		const {
			BrowseAPI,
		} = Comp.getReqProps();
		
		if (state.curPhotoInd === -1) {
			toggleBrowseAction(Comp);
			return;
		}

		if (state.action === ON_TOGGLE_PHOTO) {
			BrowseAPI.setToResumeObj({
				val: {
					scrollTo: getSelectorSrc({id: state.curPhoto}),
				},
			});
		}
	}, [state.curPhoto]);

	React.useEffect(() => renderAddPanel({
		Comp,
	}), [state.isNoItems]);

	React.useEffect(
		() => initRefreshWindowEvent({
			eventName: EVENT_NAMES.refreshWindow,
			callback: () => {
				// когда удалил или переместил или еще что. чтобы не усложнять.
				toggleBrowseAction(Comp);
			},
		}),
		[]
	);

	React.useEffect(
		() => initRefreshWindowEvent({
			eventName: EVENT_NAMES.exitFolder,
			callback: () => {
				rp.BrowseAPI.exitFolder();
			},
		}),
		[]
	);

	return getRender();

	//--------------------------------------------------------------------------
	function getRender() {
		const rp = Comp.getReqProps();
		const {
			resumeBrowse,
			PhotoStatuses,
		} = rp;
		const id = `${resumeBrowse.path}${state.curPhoto}`;

		const currentTotal = `${state.curPhotoInd + 1} / ${state.files.items.length}`;

		return (
			<div
				className="OnePhoto fitScreen"
			>
				{state.isNoItems === false && (
					<>
						<img
							ref={imgRef}
							src={`${resumeBrowse.path}/${state.curPhotoWithTime}`}
							style={{
								transform: `rotate(${state.curPhotoRotateDeg}deg)`,
								opacity: state.opacity,
								visibility: state.visibility,
							}}
							onLoad={fitCurPhotoSize}
						/>
						<PhotoStatuses.r
							id={id}
						/>
					</>
				)}
				<div className="current-total">{currentTotal}</div>
			</div>
		);
	}

	function toRenderHelp() {
		return <div className="flexCenter marginBottom10">
			Стрелка вправо - показать следующее фото.<br></br>
			Стрелка влево - показать предыдущее фото.<br></br>
			Стрелка вверх - повернуть текущее фото по часовой стрелке.<br></br>
			Стрелка вниз - повернуть текущее фото против часовой стрелки.<br></br>
			Цифра 1 - добавить фото к списку "Печатать".<br></br>
			Цифра 2 - добавить фото к списку "Отправить".<br></br>
			Цифра 0 - удалить фото.<br></br>
			Пробел - сохранить изменения.<br></br>

		</div>
	}

	function addKeyDownListener() {
		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}

	function fitCurPhotoSize(e) {
		Object.assign(
			e.target.style,
			getFitSize(e.target.getBoundingClientRect()),
		);
	}

	function onKeyDown(e) {
		const {
			files,
		} = state;
		const {
			prevPhotoInd,
		} = getIndexes({
			curPhotoInd: state.curPhotoInd,
			filesLength: files.items.length,
		});
		const rp = Comp.getReqProps();
		const comps = Comp.getComps();
		const stateUpd = {};

		switch (e.which) {
			case 13: // enter.
				rp.PhotoStatusesAPI.changeStatus({Comp: comps.Share});
				refreshOppositeWindow();

				break;

			case 32:  // Space
				rp.PhotoStatusesAPI.changeStatus({Comp: comps.Print});
				refreshOppositeWindow();

				break;

			case 37: // prev 
				stateUpd.action = ON_TOGGLE_PHOTO;
				stateUpd.curPhotoInd = prevPhotoInd;
				stateUpd.curPhotoRotateDeg = 0;

				break;

			case 39: // next
				onToggleNextPhoto({
					stateUpd,
					curPhotoInd: state.curPhotoInd,
					files,
				});
				break;

			case 38: // rotate right
				stateUpd.curPhotoRotateDeg = rotate({ deg: state.curPhotoRotateDeg + 90 });
				stateUpd.action = onImgServerRotate.name;
				break;

			case 40:
				stateUpd.curPhotoRotateDeg = rotate({ deg: state.curPhotoRotateDeg - 90 });
				stateUpd.action = onImgServerRotate.name;
				break; // rotate left
		}

		setState(stateUpd);

		changeAddActions();

		// ---------------------------

		function rotate({ deg }) {
			return Math.abs(deg) === 360 ? 0 : deg;
		}

		function changeAddActions() {
			const [updatedProp] = Object.keys(stateUpd);
			if (updatedProp) runTrigger({ updatedProp, });

			// ---------------------------------------

			function runTrigger({ updatedProp, }) {
				return {
					[updatedProp]: () => { },
					curPhotoInd: () => { },
					curPhotoRotateDeg: onImgServerRotate,
				}[updatedProp]({
					server,
					state,
					stateUpd,
					setState,
				}
				);
			}
		}
	}
}

function selfReducer({
	state,
	stateUpd = {},
}) {

	let stateReduced = {
		...state,
		...stateUpd,
	};

	const {
		files,
	} = stateReduced;

	const curPhoto = files.items[stateReduced.curPhotoInd];

	stateReduced = {
		...stateReduced,
		curPhoto,
		isNoItems: curPhoto ? false : true,		
		...getProps({ stateReduced }),
	};

	resumeObj.save({
		val: stateReduced
	});

	return stateReduced;

	// ----------------------------------------

	function getProps({
		stateReduced,
	}) {
		return {
			[stateReduced.action]: {},
			[ON_TOGGLE_PHOTO]: {
				curPhotoWithTime: curPhoto,
				opacity: '0',
				visibility: 'hidden',
				curPhotoRotateDeg: 0,
			},
			[onImgServerRotate.name]: {
				// curPhotoRotateDeg: 0,
				curPhotoWithTime: `${curPhoto}?${new Date().getTime()}`,
				opacity: '0',
				visibility: 'hidden',
			},
		}[stateReduced.action];
	}
};

function getFitSize({ width, height }) {
	return {
		width: 'auto',
		height: '100%',
	};
}

function getIndexes({
	curPhotoInd,
	filesLength,
}) {
	const prevPhotoInd = curPhotoInd > 0 ? curPhotoInd - 1 : 0;
	const nextPhotoInd = curPhotoInd < filesLength - 1 ? (curPhotoInd + 1) : (filesLength - 1);
	return {
		prevPhotoInd,
		nextPhotoInd,
	};
}

function onToggleNextPhoto({
	stateUpd,
	curPhotoInd,
	files,
}) {
	const {
		nextPhotoInd,
	} = getIndexes({
		curPhotoInd: curPhotoInd,
		filesLength: files.items.length,
	});
	stateUpd.curPhotoInd = nextPhotoInd;
	stateUpd.action = ON_TOGGLE_PHOTO;

	return stateUpd;
}

function onImgServerRotate({
}) { }

function getReqProps({ comps, channel, }) {
	const resumeBrowse = comps.Browse.getAPI().getResumeObj({
		selector: {
			files: 1,
			path: 1,
			curPhotoInd: 1,
			selections: 1,
		},
	});

	return {
		server: channel.server,
		...comps,
		resumeBrowse,
	};
};

function deleteFiles({
	Comp,
}) {
	const {
		state,
		setState,
	} = Comp.getDeps();

	// Удалить из списка выбранных файлов Browse.
	const rp = Comp.getReqProps();	
	const browseSelections = rp.resumeBrowse.selections;
	if (browseSelections) {
		const selectionsUpd = [];
		browseSelections.forEach((item) => {
			if (item != state.curPhoto) {
				selectionsUpd.push(item);
			}
		});
		
		rp.BrowseAPI.setToResumeObj({
			val: {
				selections: selectionsUpd,
			},
		});
	}
	

	// remove from onePhoto files.
	state.files.delete(state.curPhotoInd);

	const curPhotoIndUpd = state.files.items.length === state.curPhotoInd ?
		state.curPhotoInd - 1 :
		state.curPhotoInd;		

	setState({
		curPhotoInd: curPhotoIndUpd,
		action: ON_TOGGLE_PHOTO,
	});	
};

function getComps({
	channelComps,
}) {
	const {
		App,
		Browse,
		AdditionalPanel,
		PhotoStatuses,
		ToggleWindow,
		Label,
		Dialog,
		Print,
		Share,
	} = channelComps;

	return {
		toClone: {
			ExitFromOnePhoto: Label,
			ToggleWindow,
			MoveSelections: Label,
			RemoveSelections: Label,
		},
		items: {
			App,
			Browse,
			AdditionalPanel,
			PhotoStatuses,
			Dialog,
			Print,
			Share,
		},
	};
}

function renderAddPanel({
	Comp,
}) {
	const {
		state,
	} = Comp.getDeps();
	const rp = Comp.getReqProps();
	const additionalActions = [
		rp.ExitFromOnePhoto,
		rp.ToggleWindow,
		rp.MoveSelections,
		rp.RemoveSelections,
	];
	rp.AdditionalPanelAPI.renderIt({
		actions: Object.values(additionalActions),
	})
		.then(() => {
			rp.ExitFromOnePhotoAPI.forceUpdate({
				onClick: () => {
					toggleBrowseAction(Comp);
				},
			});

			if (state.isNoItems === false && !isBanMoveItems()) {
				rp.MoveSelectionsAPI.forceUpdate({
					title: setBtnTitle({
						prefix: BTN_MOVE,
						title: 1,
					}),
					onClick: () => {
						rp.server.moveToPath({
							items: [state.curPhotoWithTime],
							destWindow: getOppositeWindow().name,
							...getUpdatedActionLists(),
						})
							.then((res) => {
								if (res?.error) {
									rp.DialogAPI.show({
										type: 'error',
										message: res.error,
										isModal: false,
									});
									throw new Error();
								}
								return res;
							})
							.then((result) => {
								updateActionsLists({ lists: result?.updatedActionLists });
								return result;
							})
							.then(() => {
								deleteFiles({ Comp });
								refreshOppositeWindow();
							})
							.catch(() => { });
					}
				});
			}

			if (state.isNoItems === false) {
				rp.RemoveSelectionsAPI.forceUpdate({
					title: setBtnTitle({
						prefix: BTN_REMOVE,
						title: 1,
					}),
					onClick: () => {
						rp.DialogAPI.showChoiceConfirmation({
							message: "",
							onConfirm,
						});

						function onConfirm() {
							rp.server.removeItems({
								items: [state.curPhotoWithTime],
								...getUpdatedActionLists(),
							})
							.then((result) => {
								updateActionsLists({ lists: result?.updatedActionLists });
								return result;
							})
							.then(() => {
								deleteFiles({
									Comp,
								});
								refreshOppositeWindow();
							});
						}
					},
				});
			}

			rp.ExitFromOnePhotoAPI.forceUpdate({
				title: 'Вернуться',
			});
		});

	return () => {
		const rp = Comp.getReqProps();
		rp.AdditionalPanelAPI.renderIt({
			actions: [],
		});
	};
}

function toggleBrowseAction(Comp) {
	const rp = Comp.getReqProps();
	const {
		Browse,
	} = rp;
	rp.AppAPI.toggleAction({
		action: Browse.name,
	});
}

function getStateInit() {
	const resumed = resumeObj.get();
	return {
		files: {},
		path: undefined,
		loading: false,
		progress: 100,
		curPhoto: '',
		curPhotoWithTime: '',
		curPhotoInd: -1,
		curPhotoRotateDeg: 0,
		curDate: getCurDate(),
		opacity: '1',
		visibility: 'visible',
		action: ON_TOGGLE_PHOTO,
		isNoItems: false,
		resumeBrowse: {},

		...resumed,
	};
}


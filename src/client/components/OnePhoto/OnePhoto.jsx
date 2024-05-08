import './styles.css';

import React, {useEffect, useMemo, useRef} from 'react';
import { ResumeObj } from '../../resumeObj';
import {
	getOppositeWindow, myArray,
	updateActionsLists, sendEventOppositeWindow, isBanMoveItems,
	initWindowEvent,
	getUpdatedActionLists,
	getSelectorSrc,
	magnify,
	IMG_ZOOM_CLASS,
} from '../../functions';
import { channel } from '../../channel';
import { getCurDate } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';
import { BTN_BACKWARD, BTN_MOVE, BTN_REMOVE, BTN_ZOOM, BTN_ZOOM_DEC, BTN_ZOOM_INC, setBtnTitle } from '../../common/additionalActions/const';
import { EVENT_NAMES, SEP } from '../../constants';

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

	const myFiles = useMemo(
		() => myArray({
			items: resumeBrowse.files,
		}),
		[resumeBrowse.files]
	);

	const {state, setState} = useMutedReducer({
		reducer: (props) => selfReducer({...props, browsePath: resumeBrowse.path,}),
		setCompDeps: Comp.setCompDeps,
		initialState: {
			...getStateInit(),
			curPhotoInd: resumeBrowse.curPhotoInd,
			files: myFiles,
		},
	});

	const imgRef = useRef(null);

	useEffect(addKeyDownListener);
	useEffect(() => {
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

	useEffect(() => {
		const {
			BrowseAPI,
		} = Comp.getReqProps();
		
		if (state.curPhotoInd === -1) {
			BrowseAPI.setToResumeObj({
				val: {
					curPhotoInd: -1,
					scrollTo: '',
				},
			});

			toggleBrowseAction(Comp);

			return;
		}

		if (state.action === ON_TOGGLE_PHOTO) {
			BrowseAPI.setToResumeObj({
				val: {
					curPhotoInd: state.curPhotoInd,
					scrollTo: getSelectorSrc({id: state.curPhoto}),
				},
			});
		}		

	}, [state.curPhoto]);

	useEffect(() => renderAddPanel({
		Comp,
	}));

	useEffect(
		() => initWindowEvent({
			eventName: EVENT_NAMES.refreshWindow,
			callback: () => {
				// когда удалил или переместил или еще что. чтобы не усложнять.
				toggleBrowseAction(Comp);
			},
		}),
		[]
	);

	useEffect(
		() => {
			sendEventOppositeWindow({
				eventName: EVENT_NAMES.renderAddPanel,
			});
		},
		[]
	);
	

	return getRender();

	//--------------------------------------------------------------------------
	function getRender() {
		const rp = Comp.getReqProps();
		const {
			PhotoStatuses,
		} = rp;

		const currentTotal = `${state.curPhotoInd + 1} / ${state.files.items.length}`;

		return (
			<div
				className="OnePhoto fitScreen"
			>
				{state.isNoItems === false && (
					<>
						<img
							ref={imgRef}
							src={state.id}
							style={{
								transform: `rotate(${state.curPhotoRotateDeg}deg)`,
								opacity: state.opacity,
								visibility: state.visibility,
							}}
							onLoad={fitCurPhotoSize}
						/>
						<PhotoStatuses.r
							id={state.id}
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
		const {
			ShareAPI,
			PrintAPI,
		} = Comp.getComps();

		const stateUpd = {};

		switch (e.which) {
			case 13: // enter.
				rp.PhotoStatusesAPI.changeStatus({callback: ShareAPI.toggleStatus});
				sendEventOppositeWindow();

				break;

			case 32:  // Space
				rp.PhotoStatusesAPI.changeStatus({callback: PrintAPI.toggleStatus});	
				sendEventOppositeWindow();			

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
	browsePath,
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

	const id = `${browsePath}${SEP}${curPhoto}`;

	stateReduced = {
		...stateReduced,
		id,
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
				curPhoto,
				opacity: '0',
				visibility: 'hidden',
				curPhotoRotateDeg: 0,
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
		const selectionsUpd = browseSelections.filter(
			(item) => {
				return item != state.curPhoto;
			}
		);
			
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
			Zoom: Label,
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
		rp.Zoom,
	];
	rp.AdditionalPanelAPI.renderIt({
		actions: Object.values(additionalActions),
	})
		.then(() => {
			rp.ExitFromOnePhotoAPI.forceUpdate({
				onClick: () => {
					toggleBrowseAction(Comp);
					sendEventOppositeWindow({
						eventName: EVENT_NAMES.renderAddPanel,
					});
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
							items: [state.curPhoto],
							destWindow: getOppositeWindow().name,
							...getUpdatedActionLists(),
						})
						.then((result) => {		
							rp.server.checkProgress()
							.then(() => {
								const curPhoto = state.curPhoto;
								updateActionsLists({ lists: result?.updatedActionLists });
								deleteFiles({ Comp });
								sendEventOppositeWindow({
									detail: {
										scrollTo: getSelectorSrc({id: curPhoto}),
									},
								});			
							});	
						});
					},
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
								items: [state.curPhoto],
								...getUpdatedActionLists(),
							})
							.then((result) => {
								rp.server.checkProgress()
								.then(() => {
									const curPhoto = state.curPhoto;

									updateActionsLists({ lists: result?.updatedActionLists });
									deleteFiles({Comp});
									sendEventOppositeWindow();
									sendEventOppositeWindow({
										eventName: EVENT_NAMES.moveSelections,
										detail: {
											selections: [curPhoto],
										},
									});
								});
							});
						}
					},
				});
			}

			const magnifier = document.querySelector(`.${IMG_ZOOM_CLASS}`);
			rp.ZoomAPI.forceUpdate({
				title: magnifier ? BTN_ZOOM_DEC : BTN_ZOOM_INC,
				onClick: magnifier ? () => {
					magnifier.remove();
					const {setState} = Comp.getDeps();
					setState({});
				 } : () => {
					magnify({					
						img: document.querySelector(getSelectorSrc({id: state.id})),					
					});
					const {setState} = Comp.getDeps();
					setState({});
				}
			});

			rp.ExitFromOnePhotoAPI.forceUpdate({
				title: BTN_BACKWARD,
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
		id: undefined,
		files: {},
		path: undefined,
		loading: false,
		progress: 100,
		curPhoto: '',
		curPhotoInd: -1,
		curPhotoRotateDeg: 0,
		curDate: getCurDate(),
		opacity: '1',
		visibility: 'visible',
		action: ON_TOGGLE_PHOTO,
		isNoItems: false,

		...resumed,
	};
}


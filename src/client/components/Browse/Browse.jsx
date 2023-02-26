import React from 'react';
import {
	Dirs,
} from '../';
import {
	Spin,
	Progress,
} from 'antd';


import './styles.css';
import {
	addHandlers, getBackgroundImageStyle, getOppositeWindow, getUpdatedActionLists, myCrop,
	onMoveSelections, oppositeWindowCheckSamePaths, refreshWindows, updateAddPanelComps
} from '../../functions';
import { channel } from '../../channel';
import { ResumeObj } from '../../resumeObj';
import { eventNames } from '../../constants';
import { Empty } from '../Empty/Empty';
import { useMutedReducer } from '../../mutedReducer';
import { BTN_MOVE, BTN_REMOVE, setBtnTitle } from '../../common/additionalActions/const';


export const Browse = channel.addComp({
	name: 'Browse',
	render,
	getAPI,
	getReqProps,
	getComps,
});

const resumeObj = new ResumeObj({
	selector: [
		window.name,
		Browse.name,
	],
});

function render(
) {
	const Comp = this;
	const [state, setState] = useMutedReducer({
		setCompDeps: Comp.bindSetCompDeps(),
		initialState: getStateInit(),
		fn: ({
			state,
		}) => {
			resumeObj.save({
				val: {
					...state,
					selections: Array.from(state.selections),
				},
			});
		}
	});

	const dispatcher = React.useMemo(
		() => addHandlers({
			fns: [
				function onClickDir({
					event
				}) {
					const rp = Comp.getReqProps();
					const {
						onNavigate,
					} = Comp.getAPI();
					setState({
						loading: true,
					});
					const dir = event.target.getAttribute('src');
					console.log('dispatch')
					rp.server.toward({ dir })
						.then(onNavigate)
						.then(() => {
							changeSelections({
								Comp,
							});
							setState({
								loading: false,
							});
						});
				},

				function onClickItemSelector({
					event: { target },
				}) {
					const src = target.getAttribute('src');
					const { checked } = target;
					changeSelections({
						Comp,
						src,
						checked,
					});
				},

				function onClickFile({
					event
				}) {
					const rp = Comp.getReqProps();

					setState({
						curPhotoInd: +event.target.getAttribute('ind'),
					});

					rp.AppAPI.toggleActions({
						action: rp.OnePhoto.name,
						actions: {
							[rp.OnePhoto.name]: {
								isEnabled: true,
							},
							[Browse.name]: {
								isEnabled: false,
							},
						}
					});
				},
			],
		}),
		[]
	);

	const onClickDispatcher = React.useCallback((event) => {
		const { target } = event;
		const onClickCb = target.getAttribute('clickcb');

		onClickCb && dispatcher[onClickCb]({
			event,
		});
	}, []);

	React.useEffect(() => {
		renderAddPanel({ Comp });
		resetTo({
			Comp,
		});
	}, []);

	React.useEffect(
		() => {
			const rp = Comp.getReqProps();
			const refreshWindowWrap = () => {
				setState({
					loading: true,
				});
				rp.server.toward().then((res) => setState(res)).then(() => {
					setState({
						loading: false,
					});
				});
			}
			document.addEventListener(eventNames.refreshWindow, refreshWindowWrap);
			return () => document.removeEventListener(eventNames.refreshWindow, refreshWindowWrap);
		},
		[]
	);

	React.useEffect(oppositeWindowCheckSamePaths, [state.path]);

	React.useEffect(scrollToSelectedImage, [state.curPhotoInd]);

	React.useEffect(boostPerfImgRender, [state.files]);

	React.useEffect(() => htmlResetSelections({
		Comp,
	}), [state.selections]);

	return getRender();

	// --------------------------------------------------------------------
	function getRender() {
		return (
			<div
				className={`${Browse.name} layout`}
				onClick={onClickDispatcher}
			>
				{state.loading && <Spin size="large" />}
				{state.progress < 100 && (
					<div className="flexCenter width100pr positionAbs">
						<Progress
							type="circle"
							percent={state.progress}
						/>
					</div>
				)}

				<Dirs
					dirs={state.dirs}
					onClickDirFnName={dispatcher.onClickDir.name}
					onClickItemSelectorFnName={dispatcher.onClickItemSelector.name}
				></Dirs>
				{getFilesToRender()}
				<Empty
					isTrue={state.dirs.length === 0 && state.files.length === 0}
				/>

				{/* <Help
          toRender={toRenderHelp()}
          {...{ doNeedHelp: rp.appState.doNeedHelp }}
        /> */}
			</div>
		);
	}

	function scrollToSelectedImage() {
		if (state.curPhotoInd === -1) {
			const curPhotoEl = document.querySelector(`.${Browse.name} .file.curFile`);
			if (curPhotoEl) {
				curPhotoEl.classList.remove('curFile');
			}
			return;
		}
		const curPhotoEl = document.querySelector(`.${Browse.name} .file[ind='${state.curPhotoInd}']`);
		if (curPhotoEl) {
			curPhotoEl.scrollIntoView();
			curPhotoEl.classList.add('curFile');
		}
	}

	function toRenderHelp() {
		return <div className="flexCenter marginBottom10">
			Открыть альбом<br></br>
			Закрыть альбом<br></br>
			Рассмотреть фото<br></br>
			Вернуть фото в альбом.<br></br>

		</div>
	}

	function getFilesToRender() {
		const rp = Comp.getReqProps();
		const browsePath = state.path + state.sep;
		return state.files.map((file, ind) => {
			const style = getBackgroundImageStyle({
				file: `${browsePath}${file}`,
			});
			return (
				<div
					key={file}
					className='positionRel fitPreview file scrollwait'
					style={style}
					ind={ind}
					src={file}
					clickcb={dispatcher.onClickFile.name}
				>
					<input
						className="itemSelector positionAbs"
						type="checkbox"
						src={file}
						clickcb={dispatcher.onClickItemSelector.name}
					/>
				</div>
			);
		});
	}
}

function boostPerfImgRender() {
	const observer = new IntersectionObserver(cb, { threshold: 1 });
	const elements = [...(document.querySelectorAll(`.${Browse.name} .scrollwait`) || [])];
	const observe = observer.observe.bind(observer);
	elements.map(observe);

	return () => { observer.disconnect(); }

	// ------
	function cb(entries) {
		const unobserve = observer.unobserve.bind(observer);
		entries.map(e => {
			e.target.classList.remove('scrollwait');
			unobserve(e.target);
		});
	}
}

// -------------------------------------------------------

function getReqProps({
	comps,
	channel,
}) {
	return {
		server: channel.server,
		...comps,
	};
};

function getAPI({
	Comp,
	deps,
}) {
	return {
		onNavigate,
		setToResumeObj,
		getResumeObj,
		changeSelections,
	};

	// ----------------------------------------

	function getResumeObj({
		selector,
	} = {}) {
		const resumed = resumeObj.get();
		if (selector && selector.constructor === Object) {
			return myCrop({
				from: resumed,
				selector,
			});
		}
		return resumed;
	}

	function setToResumeObj({
		val,
	}) {
		resumeObj.save({
			val,
		});
	}

	function onNavigate(
		res,
	) {
		const {
			setState,
		} = deps;

		setState({
			...res,
			loading: false,
		});

		const rp = Comp.getReqProps();
		rp.ExitFromFolderAPI.forceUpdate({
			title: res.path ? `Закрыть альбом ${res.path}` : '',
			onClick: () => onExitFolder({ Comp }),
		});


		// --------------------------------------------
		function onExitFolder({
			Comp,
		}) {
			const {
				changeSelections,
				onNavigate,
			} = Comp.getAPI();
			changeSelections({
				Comp,
			});
			resumeObj.save({
				val: {
					curPhotoInd: -1,
				},
			});
			const rp = Comp.getReqProps();
			rp.server.backward()
				.then(onNavigate);
		}
	}
}

function changeSelections({
	Comp,
	src,
	checked,
} = {}
) {
	const {
		state,
		setState,
	} = Comp.getDeps();

	setState({
		forceUpdate: false,
		selections: updateSelections(),
	});

	const rp = Comp.getReqProps();
	if (getOppositeWindow() !== undefined) {
		rp.MoveSelectionsAPI.forceUpdate({
			title: setBtnTitle({
				prefix: BTN_MOVE,
				title: state.selections.size,
			}),
		});
	}

	rp.RemoveSelectionsAPI.forceUpdate({
		title: setBtnTitle({
			prefix: BTN_REMOVE,
			title: state.selections.size,
		}),
	});

	rp.RenameAPI.forceUpdate({
		isShow: state.selections.size === 1,
		name: [...state.selections][0],
		onSubmit: ({
			name, 
		}) => {
			onRename({
				Comp,				
				newName: name,
			});
		},
	});

	// ------------------------------------
	function updateSelections() {
		// i.e. clickFolder event or exitFromFolder.
		if (src === undefined) return new Set();

		const action = ({ true: 'add', false: 'delete' })[checked];

		state.selections[action](src);
		return state.selections;
	}
}

function htmlResetSelections({
	Comp,
}) {
	const {
		state: { selections },
	} = Comp.getDeps();

	[...document.querySelectorAll('.itemSelector')].forEach((item) => {
		const src = item.getAttribute('src');
		item.checked = selections.has(src);
	});
}

async function onAddAlbum({
	Comp,
	name,
}) {
	const rp = Comp.getReqProps();

	const res = await rp.server.addAlbum({
		name,
	});

	if (res?.error) {
		rp.DialogAPI.show({
			type: 'error',
			message: res.error,
		});
		return;
	}

	refreshWindows({
		Comp,
	});
}

async function onRename({
	Comp,
	newName,
}) {
	const rp = Comp.getReqProps();
	const deps = Comp.getDeps();
  
	const res = await rp.server.rename({
	  name: [...deps.state.selections][0],
	  newName,
	});
  
	if (res?.error) {
	  rp.DialogAPI.show({
		type: 'error',
		message: res.error,
	  });
	  return;
	} 

	changeSelections({ Comp });	
  
	refreshWindows({
	  Comp,
	});
}


function renderAddPanel({
	Comp,
}) {
	const rp = Comp.getReqProps();
	const {
		state,
	} = Comp.getDeps();

	const additionalActions = [
		rp.ExitFromFolder,
		rp.ToggleWindow,
		rp.AddAlbum,
		rp.Rename,
		rp.MoveSelections,
		rp.RemoveSelections,
	];
	const src = state.path.concat(state.sep);

	rp.AdditionalPanelAPI.renderIt({
		actions: additionalActions,
	})
		.then(() => {
			rp.AddAlbumAPI.onSubmit(({
				name,
			}) => onAddAlbum({
				Comp,
				name,
			}));

			rp.RenameAPI.forceUpdate({
				isShow: state.selections.size === 1,								
			});

			if (getOppositeWindow() !== undefined) {
				rp.MoveSelectionsAPI.forceUpdate({
					onClick: () => {
						const selections = [...state.selections.values()];
						rp.server.moveToPath({
							items: selections,
							updatedActionLists: getUpdatedActionLists(),
							destWindow: getOppositeWindow().name,
						})
							.then((props) => {
								resumeObj.saveUpdatedActionLists({
									lists: props.updatedActionLists,
								});
								return props;
							})
							.then(() => onMoveSelections({
								Comp,
								onChangeSelections: () => changeSelections({
									Comp,
								}),
							}));
					},
				});
			};
			rp.RemoveSelectionsAPI.forceUpdate({
				onClick: () => {
					const selections = [...state.selections.values()];
					rp.server.removeItems({
						items: selections,
						updatedActionLists: getUpdatedActionLists(),
					})
						.then((props) => {
							resumeObj.saveUpdatedActionLists({
								lists: props.updatedActionLists,
							});
							return props;
						})
						.then(({
						}) => onMoveSelections({
							Comp,
							onChangeSelections: () => changeSelections({
								Comp,
							}),
						}));
				},
			});

			updateAddPanelComps({
				Comp,
			});
		});

	return () => {
		rp.AdditionalPanelAPI.renderIt({
			actions: [],
		});
	};
}

function getComps({
	channelComps,
}) {
	const {
		App,
		OnePhoto,
		AdditionalPanel,
		Notification,

		AddAlbum,
		CustomAction,
		Label,
		ToggleWindow,
		Dialog,
		Rename,
	} = channelComps;

	return {
		toClone: {
			ToggleWindow,
			AddAlbum,
			Rename,
			ExitFromFolder: Label,
			MoveSelections: Label,
			RemoveSelections: CustomAction,
		},
		items: {
			App,
			OnePhoto,
			Notification,
			AdditionalPanel,
			Dialog,
		}
	};
}

function resetTo({
	Comp,
}) {
	const rp = Comp.getReqProps();
	const {
		state,
		setState,
	} = Comp.getDeps();

	const {
		onNavigate,
	} = Comp.getAPI();

	setState({
		loading: true,
	});
	rp.server.toward({
		resetTo: state.path,
	})
		.then(onNavigate)
		.then(() => setState({
			loading: false,
		}));
}

function getStateInit() {
	const resumed = resumeObj.get();
	return {
		loading: true,
		previewWidth: 100,
		previewHeight: 100,
		progress: 100,
		sep: undefined,
		path: '',
		curPhotoInd: -1,
		scrollY: 0,
		files: [],
		dirs: [],

		...resumed,
		selections: new Set(resumed.selections),
	};
}
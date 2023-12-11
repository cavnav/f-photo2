import React, {useCallback, useEffect} from 'react';
import './styles.css';
import {
	getItemName, getOppositeWindow, initRefreshWindowEvent, isBanMoveItems, myCrop,
	onChangeSelections,
	onMoveSelections, refreshWindows, refreshOppositeWindow,
	updateActionsLists, updateHtmlSelectorsFromArray,
	getUpdatedActionLists,
	scrollToSelector,
} from '../../functions';
import { channel } from '../../channel';
import { ResumeObj } from '../../resumeObj';
import { useMutedReducer } from '../../mutedReducer';
import { BTN_MOVE, BTN_REMOVE, setBtnTitle } from '../../common/additionalActions/const';
import { Files } from '../File/Files';
import { Dirs } from '../Dirs/Dirs';
import { eventNames } from '../../constants';

const BROWSE_CLASS = 'browse-base';


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
	const rp = Comp.getReqProps();
	const BrowseBase = rp.BrowseBase.r;

	const [state] = useMutedReducer({
		setCompDeps: Comp.setCompDeps,
		initialState: getStateInit(),
		fn: ({
			state,
		}) => {
			const {refHandler, ...stateUpd} = state;
			resumeObj.save({
				val: stateUpd,
			});
		}
	});
	const browsePath = state.path + state.sep;
	const onChangeDirUpd = useCallback(onChangeDir({Comp}), []);
	const onChangeSelectionsUpd = useCallback(onChangeThisSelections({Comp}), []);
	const onRequestFileUpd = useCallback(onRequestFile({Comp}), []);

	React.useEffect(() => {
		const returnCb = renderAddPanel({ Comp });		
		return returnCb;
	}, []);

	React.useEffect(() => {
		resetTo({
			Comp,
		});
	}, []);

	React.useEffect(
		() => initRefreshWindowEvent({ 
			eventName: eventNames.refreshWindow,
			callback: () => onRefreshWindow({ Comp }),
		}),
		[]
	);

	React.useEffect(
		() => initRefreshWindowEvent({ 
			eventName: eventNames.exitFolder,
			callback: () => exitFolder({ Comp }),
		}),
		[]
	);

	React.useEffect(boostPerfImgRender, [state.files]);

	React.useEffect(
		() => {
			updateHtmlSelectorsFromArray({
				selections: state.selections,
			});
		}, 
	);

	useEffect(
		() => scrollToSelector({selector: state.scrollTo}),
	);

	const FilesComp = state.files.length === 0 ? undefined : (props) => <Files
		files={state.files}
		browsePath={browsePath}
		{...props}
	/>;

	const DirsComp = state.dirs.length === 0 ? undefined : (props) => <Dirs
		dirs={state.dirs}
		{...props}
	/>;

	return (
		<BrowseBase 
			refHandler={state.refHandler}
			Files={FilesComp}
			Dirs={DirsComp}
			onChangeDir={onChangeDirUpd}
			onChangeSelections={onChangeSelectionsUpd}
			onRequestFile={onRequestFileUpd}
		/>
	);
}

function boostPerfImgRender() {
	const observer = new IntersectionObserver(cb, { threshold: 1 });
	const elements = [...(document.querySelectorAll(`.${BROWSE_CLASS} .scrollwait`) || [])];
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

function onChangeDir({
	Comp,
}) {
	return (event) => {
		const rp = Comp.getReqProps();
		const {
			onNavigate,
		} = Comp.getAPI();

		const {state} = Comp.getDeps();
		if (state.refHandler.current) {
			state.refHandler.current.scrollTop = 0;
		}

		const {setStateSilent} = Comp.getDeps();
		setStateSilent({
			scrollTo: "",

		});

		const dir = event.target.getAttribute('src');
		
		rp.server.toward({ dir })
			.then(onNavigate)
			.then(() => {				
				changeSelections({
					Comp,
				});
				refreshOppositeWindow();
			});
	};
}

function onChangeThisSelections({Comp}) {
	return onChangeSelections({handler: ({src, checked}) => {
		return changeSelections({
			Comp,
			src,
			checked,
		});
	}});
};

function onRequestFile({Comp}) {
	return (event) => {
		const rp = Comp.getReqProps();
		const deps = Comp.getDeps();
		const curPhotoInd = +event.target.getAttribute('ind'); 

		deps.setState({
			curPhotoInd,
			scrollTo: getFileSelector({id: curPhotoInd}),
		});

		rp.AppAPI.toggleAction({
			action: rp.OnePhoto.name,	
		});
	};
}

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
		resetTo,
		exitFolder: () => exitFolder({Comp}),
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

		let {state} = Comp.getDeps();
		let scrollTo = val.hasOwnProperty('curPhotoInd') ? getFileSelector({id: val.curPhotoInd}) : state.scrollTo;

		resumeObj.save({
			val: {
				scrollTo,
				...val,
			},
		});
	}

	function onNavigate({
		dirs,
		files,
		path,
		sep,
	}) {
		const {
			setState,
		} = deps;

		setState({
			dirs,
			files,
			path,
			sep,
		});

		const rp = Comp.getReqProps();
		rp.ExitFromFolderAPI.forceUpdate({
			title: path ? `Закрыть альбом ${path}` : '',
			onClick: () => {
				exitFolder({ Comp });
			}
		});	
	}
}

function updateSelectionDeps({
	Comp,
}) {
	const deps = Comp.getDeps();
	const { state } = deps;
	const rp = Comp.getReqProps();
	
	const isMoveBtn = !isBanMoveItems({
		path: state.path,
	});
	rp.MoveSelectionsAPI.forceUpdate({
		title: isMoveBtn ? setBtnTitle({
			prefix: BTN_MOVE,
			title: state.selections.length,
		}) : '',
	});


	rp.RemoveSelectionsAPI.forceUpdate({
		title: setBtnTitle({
			prefix: BTN_REMOVE,
			title: state.selections.length,
		}),
	});

	const curName = getItemName(state.selections, state.sep);
	rp.RenameAPI.forceUpdate({
		isShow: isShowRename(state.selections, state.sep),
		name: curName,
		onSubmit: ({
			name,
			newName, 
		}) => {
			onRename({
				Comp,	
				name,	
				newName,
			});
		},
	});

}

function changeSelections({
	Comp,
	src,
	checked,
} = {}
) {
	const {
		state,
		setStateSilent,
	} = Comp.getDeps();

	setStateSilent({
		selections: updateSelections(),
	});

	updateSelectionDeps({
		Comp,
	});

	// ------------------------------------
	function updateSelections() {
		// i.e. clickFolder event or exitFromFolder.
		if (src === undefined) return [];

		const action = ({ true: 'add', false: 'delete' })[checked];

		if (action === 'add') {
			state.selections.push(src);
		}
		else if (action === 'delete') {
			state.selections = state.selections.filter(item => item !== src);
		}

		return state.selections;
	}
}

function onRefreshWindow({
	Comp,
}) {
	const rp = Comp.getReqProps();
	const deps = Comp.getDeps();
	rp.server.toward()			
		.then((res) => {
			deps.setState({
				files: res.files,
				dirs: res.dirs,
			});
			updateSelectionDeps({
				Comp,
			});
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
			isModal: false,
		});
		return;
	}

	const {state, setState} = Comp.getDeps();	
	const src = [state.sep, state.sep, name].join('');
	setState({scrollTo: getFolderSelector({id: src})});

	refreshWindows({
		Comp,
	});
}

async function onRename({
	Comp,
	name,
	newName,
}) {
	const rp = Comp.getReqProps();
  
	const res = await rp.server.rename({
	  name,
	  newName,
	  ...getUpdatedActionLists(),
	});
  
	if (res?.error) {
	  rp.DialogAPI.show({
		type: 'error',
		message: res.error,
		isModal: false,
	  });
	  return;
	} 

	changeSelections({ Comp });	

	updateActionsLists({
		lists: res.actionLists,
	});
  
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

	rp.AdditionalPanelAPI.renderIt({
		actions: additionalActions,
	})
		.then(() => {
			rp.AddAlbumAPI.onSubmit(({
				newName,
			}) => onAddAlbum({
				Comp,
				name: newName,
			}));

			rp.RenameAPI.forceUpdate({
				isShow: isShowRename(state.selections, state.sep),	
				name: getItemName(state.selections, state.sep),
				onSubmit: ({
					name,
					newName, 
				}) => {
					onRename({
						Comp,	
						name,	
						newName,
					});
				},						
			});


			const isMoveBtn = !isBanMoveItems({
				path: state.path,
			});
			// Надо дублировать в двух местах - здесь и в OnePhoto.
			rp.MoveSelectionsAPI.forceUpdate({
				title: isMoveBtn ? setBtnTitle({
					prefix: BTN_MOVE,
					title: state.selections.length,
				}) : '',
				onClick: () => {					
					rp.server.moveToPath({
						items: state.selections,
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
							throw new Error({ name: 'responseError' });					
						} 
						return res;
					})					
					.then((result) => {
						updateActionsLists({ lists: result.updatedActionLists });
						return result;
					})
					.then(() => onMoveSelections({
						Comp,
						onChangeSelections: () => changeSelections({
							Comp,
						}),
					}))
					.then(() => refreshWindows())
					.catch((error) => { 
						if (error.name !== 'responseError') {
							console.log(error);
						}
					});
				},
			});

			// Надо дублировать в двух местах - здесь и в OnePhoto.
			rp.RemoveSelectionsAPI.forceUpdate({
				title: setBtnTitle({
					prefix: BTN_REMOVE,
					title: state.selections.length,
				}),
				onClick: () => {
					rp.DialogAPI.showChoiceConfirmation({
						message: "",
						onConfirm,
					});
					
					function onConfirm() {
						rp.server.removeItems({
							items: state.selections,
							...getUpdatedActionLists(),
						})
						.then((result) => {							
							updateActionsLists({ lists: result.updatedActionLists });
							return result;
						})
						.then(({
						}) => onMoveSelections({
							Comp,
							onChangeSelections: () => changeSelections({
								Comp,
							}),
						}))
						.then(() => {
							onRefreshWindow({Comp});
							refreshOppositeWindow({
								eventName: eventNames.exitFolder,
							});
						});
					}					
				},
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
		BrowseBase,

		AddAlbum,
		Label,
		ToggleWindow,
		Dialog,
		Rename,
	} = channelComps;

	return {
		toClone: {
			BrowseBase,
			ToggleWindow,
			AddAlbum,
			Rename,
			ExitFromFolder: Label,
			MoveSelections: Label,
			RemoveSelections: Label,
		},
		items: {
			App,
			OnePhoto,
			AdditionalPanel,
			Dialog,
		}
	};
}

function resetTo({
	Comp,
	path, 
}) {
	const rp = Comp.getReqProps();
	const {
		state,
	} = Comp.getDeps();

	const pathUpd = path ?? state.path;

	const {
		onNavigate,
	} = Comp.getAPI();

	rp.server.toward({
		resetTo: pathUpd,
	})
	.then(onNavigate);		
}

function exitFolder({
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
	const {state, setState} = Comp.getDeps();
	const src = [state.sep, state.path].join('');
	
	rp.server.backward()
		.then(onNavigate)
		.then(() => {			
			setState({scrollTo: getFolderSelector({id: src})});
			refreshOppositeWindow();
		});
}

function isShowRename([itemName], sep) {
	return itemName?.includes(sep) ?? false;
}

function getFolderSelector({id}) {
	return `.${BROWSE_CLASS} [src="${id}"]`;
}

function getFileSelector({id}) {
	return `.${BROWSE_CLASS} [ind="${id}"]`;
}

function getStateInit() {
	const resumed = resumeObj.get();

	return {
		refHandler: {current: undefined},
		previewWidth: 100,
		previewHeight: 100,
		progress: 100,
		sep: undefined,
		path: '',
		curPhotoInd: -1,
		scrollY: 0,				
		selections: [],
		scrollTo: "",

		...resumed,	
		
		files: [],
		dirs: [],
	};
}

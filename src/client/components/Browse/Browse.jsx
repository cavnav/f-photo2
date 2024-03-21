import React, {useCallback, useEffect} from 'react';
import './styles.css';
import {
	getItemName, getOppositeWindow, initRefreshWindowEvent, isBanMoveItems, myCrop,
	onMoveSelections, refreshWindows, refreshOppositeWindow,
	updateActionsLists,
	getUpdatedActionLists,
	getVarName,
	useOnClickItem,
	useOnChangeSelections,
	useEffectSetHtmlSelection,
	useScrollTo,
	getSelectorFolder,
} from '../../functions';
import { channel } from '../../channel';
import { ResumeObj } from '../../resumeObj';
import { useMutedReducer } from '../../mutedReducer';
import { BTN_MOVE, BTN_REMOVE, setBtnTitle } from '../../common/additionalActions/const';
import { Files } from '../File/Files';
import { Dirs } from '../Dirs/Dirs';
import { eventNames } from '../../constants';
import { BrowseBase } from '../BrowseBase/BrowseBase';


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

	const {state} = useMutedReducer({
		setCompDeps: Comp.setCompDeps,
		initialState: getStateInit(),
		fn: ({
			state,
		}) => {
			resumeObj.save({
				val: state,
			});
		}
	});

	const onChangeDirUpd = useCallback(onChangeDir({Comp}), []);
	const onChangeSelectionsUpd = useOnChangeSelections({
		Comp,
		deps: [],
		handler: changeSelections,
	});
	const onRequestFileUpd = useCallback(onRequestFile({Comp}), []);

	useEffect(() => {
		const returnCb = renderAddPanel({ Comp });		
		return returnCb;
	}, []);

	useEffect(() => {
		resetTo({
			Comp,
		});
	}, []);

	useEffect(
		() => initRefreshWindowEvent({ 
			eventName: eventNames.refreshWindow,
			callback: () => onRefreshWindow({ Comp }),
		}),
		[]
	);

	useEffect(
		() => initRefreshWindowEvent({ 
			eventName: eventNames.exitFolder,
			callback: () => exitFolder({ Comp }),
		}),
		[]
	);

	useEffect(boostPerfImgRender, [state.files]);

	useEffectSetHtmlSelection({
		selection: state.selections,
	});

	useScrollTo({selector: state.scrollTo});

	const FilesComp = state.files.length === 0 ? null : <Files
		files={state.files}
		browsePath={state.path}
		onSelectFile={getVarName({onChangeSelectionsUpd})}
		onRequestFile={getVarName({onRequestFileUpd})}
	/>

	const DirsComp = state.dirs.length === 0 ? null : <Dirs
		dirs={state.dirs}
		onChangeDir={getVarName({onChangeDirUpd})}
		onSelectDir={getVarName({onChangeSelectionsUpd})}
	/>;

	const isEmpty = FilesComp || DirsComp ? false : true;

	const eventHandlers = {
        onChangeDirUpd,
        onChangeSelectionsUpd,
        onRequestFileUpd,
    };

	const onClickItem = useOnClickItem({eventHandlers});

	

	return (
		<BrowseBase 
			isEmpty={isEmpty}
			scrollTo={state.scrollTo}
			onClick={onClickItem}
		>
			{DirsComp}
			{FilesComp}
		</BrowseBase>
	);
}


function boostPerfImgRender() {
	const observer = new IntersectionObserver(cb, { threshold: 1 });
	const elements = [...(document.querySelectorAll(`.scrollwait`) || [])];
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

		const {setStateSilent} = Comp.getDeps();		

		const dir = event.target.getAttribute('src');

		setStateSilent({
			scrollTo: "",
			path: dir,
		});
		
		rp.server.toward({ dir })
			.then(response => onNavigate({Comp, ...response}))
			.then(() => {				
				changeSelections({
					Comp,
				});
				refreshOppositeWindow();
			});
	};
}

function onRequestFile({Comp}) {
	return (event) => {
		const rp = Comp.getReqProps();
		const deps = Comp.getDeps();
		const curPhotoInd = +event.target.getAttribute('ind'); 		 

		deps.setState({
			curPhotoInd,	
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
}) {
	return {
		exitFolder: () => exitFolder({Comp}),
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
}

function onNavigate({
	Comp,
	dirs,
	files,
}) {
	const deps = Comp.getDeps();

	const {
		state,
		setState,
	} = deps;

	setState({
		dirs,
		files,
	});

	const rp = Comp.getReqProps();
	rp.ExitFromFolderAPI.forceUpdate({
		title: state.path ? `Закрыть альбом ${state.path}` : '',
		onClick: () => {
			exitFolder({ Comp });
		}
	});	
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
	ident,
	checked,
} = {}
) {
	// onRename selection will be reset.

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
		if (ident === undefined) return [];

		const action = ({ true: 'add', false: 'delete' })[checked];

		if (action === 'add') {
			state.selections.push(ident);
		}
		else if (action === 'delete') {
			state.selections = state.selections.filter(item => item !== ident);
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

	const {setState} = Comp.getDeps();	
	setState({scrollTo: getSelectorFolder({src: name})});

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

	const deps = Comp.getDeps();

	deps.setState({
		scrollTo: getSelectorFolder({src: newName}),
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
		setState,
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
					.then(() => {
						setState({
							scrollTo: "",
						});
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
						.then(() => onMoveSelections({
							Comp,
							onChangeSelections: () => changeSelections({
								Comp,
							}),
						}))
						.then(() => {							
							refreshOppositeWindow({
								eventName: eventNames.exitFolder,
							});
						})
						.then(() => {
							setState({
								scrollTo: "",
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

		AddAlbum,
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

	rp.server.toward({
		resetTo: pathUpd,
	})
	.then(response => onNavigate({Comp, ...response}));
}

function exitFolder({
	Comp,
}) {
	const {
		changeSelections,
	} = Comp.getAPI();

	changeSelections({
		Comp,
	});
	
	const rp = Comp.getReqProps();
	const {state, setState} = Comp.getDeps();
	
	rp.server.backward()
		.then(response => onNavigate({Comp, ...response}))
		.then(() => {			
			setState({scrollTo: getSelectorFolder({src: state.path})});
			refreshOppositeWindow();
		});
}

function isShowRename([itemName], sep) {
	return itemName?.includes(sep) ?? false;
}

function getStateInit() {
	const resumed = resumeObj.get();

	return {
		path: '',
		curPhotoInd: -1,
		selections: [],
		scrollTo: "",

		...resumed,	
		
		files: [],
		dirs: [],
	};
}

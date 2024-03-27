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
	getSelectorSrc,
} from '../../functions';
import { channel } from '../../channel';
import { ResumeObj } from '../../resumeObj';
import { useMutedReducer } from '../../mutedReducer';
import { BTN_MOVE, BTN_REMOVE, setBtnTitle } from '../../common/additionalActions/const';
import { Files } from '../File/Files';
import { Dirs } from '../Dirs/Dirs';
import { SEP, EVENT_NAMES, BROWSE_ITEM_TYPES } from '../../constants';
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
			eventName: EVENT_NAMES.refreshWindow,
			callback: () => onRefreshWindow({ Comp }),
		}),
		[]
	);

	useEffect(
		() => initRefreshWindowEvent({ 
			eventName: EVENT_NAMES.exitFolder,
			callback: () => exitFolder({ Comp }),
		}),
		[]
	);

	useEffect(
		() => initRefreshWindowEvent({
			eventName: EVENT_NAMES.scrollTo,
			callback: ({detail}) => onScrollTo({Comp, detail}),
		}),
		[]
	)

	useEffect(boostPerfImgRender, [state.files]);

	useEffectSetHtmlSelection({
		selection: state.selections,
	});

	useEffect(
		() => {
			updateSelectionDeps({
				Comp,
			});
		},
		[state.selections]
	);

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
		});
		
		rp.server.toward({ dir })
			.then(response => onNavigate({
				Comp, 
				path: getForwardPath({Comp, path: dir}),
				...response
			}))
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
		setForwardPath: ({path}) => {
			const pathUpd = getForwardPath({Comp, path});
			resumeObj.save({
				val: {
					path: pathUpd,
				},
			});
		},
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
	path,
	dirs,
	files,
}) {
	const deps = Comp.getDeps();

	const {
		setState,
	} = deps;

	setState({
		path,
		dirs,
		files,
	});

	const rp = Comp.getReqProps();
	rp.ExitFromFolderAPI.forceUpdate({
		title: path ? `Закрыть альбом ${path}` : '',
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

	const [name] = state.selections;
	rp.RenameAPI.forceUpdate({
		isShow: isShowRename({selections: state.selections}),
		name,
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
		setState,
	} = Comp.getDeps();

	setState({
		selections: updateSelections(),
	});

	// ------------------------------------
	function updateSelections() {
		// i.e. clickFolder event or exitFromFolder.
		if (ident === undefined) return [];

		const action = ({ true: 'add', false: 'delete' })[checked];

		if (action === 'add') {
			state.selections = state.selections.concat(ident);
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
		});
}

async function onAddAlbum({
	Comp,
	name,
}) {
	const rp = Comp.getReqProps();

	await rp.server.addAlbum({
		name,
	})
	.then(({name}) => {
		const {setState} = Comp.getDeps();	
		setState({scrollTo: getSelectorSrc({id: name})});
	
		refreshWindows({
			Comp,
		});
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
		scrollTo: getSelectorSrc({id: newName}),
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

			const [name] = state.selections;
			rp.RenameAPI.forceUpdate({
				isShow: isShowRename({selections: state.selections}),	
				name,
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
			// Надо менять синхронно - здесь и в OnePhoto.
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
								eventName: EVENT_NAMES.exitFolder,
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
	.then(response => {
		onNavigate({Comp, path: pathUpd, ...response});
	});
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
	const {setState} = Comp.getDeps();

	const {
		backwardPath,
		prevDir,
	} = getBackwardPath({Comp});

	rp.server.backward()
		.then(response => onNavigate({Comp, path: backwardPath, ...response}))
		.then(() => {	
			setState({scrollTo: getSelectorSrc({id: prevDir})});
			refreshOppositeWindow();
		});
}

function isShowRename({selections}) {
	if (selections.length > 1) {
		return false;
	}

	const [item] = selections; 
	const selector = getSelectorSrc({id: item});
	const type = document.querySelector(selector)?.getAttribute('type');

	return type === BROWSE_ITEM_TYPES.folder ?? false;
}

function getForwardPath({Comp, path}) {
	const deps = Comp.getDeps();

	return deps.state.path.concat(SEP, path);
}

function getBackwardPath({Comp}) {
	const deps = Comp.getDeps();

	const lastIndex = deps.state.path.lastIndexOf(SEP);

	return {
		backwardPath: deps.state.path.slice(0, lastIndex),
		prevDir: deps.state.path.slice(lastIndex + 1),
	};
}

function onScrollTo({
	Comp,
	detail: {
		scrollTo,
	},
}) {
	const {setState} = Comp.getDeps();
	setState({
		scrollTo,
	});
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

import React, {useCallback, useEffect} from 'react';
import './styles.css';
import {
	getOppositeWindow, initWindowEvent, isBanMoveItems, myCrop,
	refreshWindows, sendEventOppositeWindow,
	updateActionsLists,
	getUpdatedActionLists,
	getVarName,
	useOnClickItem,
	useOnChangeSelections,
	useEffectSetHtmlSelection,
	getSelectorSrc,
	scrollToSelector,
	useEventScrollTo,
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
		reducer,
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

	useEventChangeSelections({Comp});

	useEffect(() => {
		return renderAddPanel({ Comp });		
	});

	useEffect(() => {
		resetTo({
			Comp,
		});
	}, []);

	useEffect(
		() => initWindowEvent({ 
			eventName: EVENT_NAMES.refreshWindow,
			callback: () => onRefreshWindow({ Comp }),
		}),
		[]
	);

	useEffect(
		() => initWindowEvent({ 
			eventName: EVENT_NAMES.exitFolder,
			callback: () => exitFolder({ Comp }),
		}),
		[]
	);

	useEventScrollTo({
		callback: ({detail}) => {
			const {setState} = Comp.getDeps();

			setState({
				scrollTo: detail.scrollTo,
			});	
		},
	});

	useEffect(boostPerfImgRender, [state.files]);

	useEffectSetHtmlSelection({
		selection: state.selections,
	});

	useEffect(
		() => {
			scrollToSelector({selector: state.scrollTo});
		},
		[state.isNeedScrollTo, state.files]
	);

	useEffect(
		() => initWindowEvent({
			eventName: EVENT_NAMES.renderAddPanel,
			callback: () => {
				renderAddPanel({Comp});
			},
		}),
		[]
	);

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
				sendEventOppositeWindow();
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

	return state.selections;


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

			rp.ExitFromFolderAPI.forceUpdate({
				title: state.path ? `Закрыть альбом ${state.path}` : '',
				onClick: () => {
					exitFolder({ Comp });
				}
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
						rp.server.checkProgress()
						.then(() => {		
							console.log(777, '100%. ready to refresh');
											
							const [lastItem] = state.selections.slice(-1);

							onMoveSelections({
								Comp,
								actionLists:  result.updatedActionLists,
							});					

							sendEventOppositeWindow({
								eventName: EVENT_NAMES.scrollTo,
								detail: {
									scrollTo: getSelectorSrc({id: lastItem}),
								},
							});													
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
							rp.server.checkProgress()
							.then(() => {
								const selections = state.selections;

								onMoveSelections({
									Comp,
									actionLists:  result.updatedActionLists,
								});
							
								sendEventOppositeWindow({
									eventName: EVENT_NAMES.moveSelections,
									detail: {
										selections,
									},
								});
							});
						})
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
			sendEventOppositeWindow();
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

function reducer({
	state,
	stateUpd,
}) {

	const stateNew = {
		...state,
		...stateUpd,
	};

	if (stateUpd.hasOwnProperty('scrollTo')) {
		stateNew.isNeedScrollTo = {};
	}

	return stateNew;
}

function useEventChangeSelections({
	Comp,
}) {
	const {state, setState} = Comp.getDeps();

	useEffect(
		() => initWindowEvent({
			eventName: EVENT_NAMES.moveSelections,
			callback: ({
				detail,
			}) => {		
				const {selections} = detail;	
				
				const selectionsUpd = state.selections.filter((item) => !selections.includes(item));
			
				setState({
					selections: selectionsUpd,
				});
			}
		}),
		[]
	);
}

function onMoveSelections({
	Comp,
	actionLists,
}) {
	updateActionsLists({lists: actionLists});	

	changeSelections({
		Comp,
	});

	const {setState} = Comp.getDeps();

	setState({
		scrollTo: "",
	});
	
	refreshWindows();
}

function getStateInit() {
	const resumed = resumeObj.get();

	return {
		path: '',
		curPhotoInd: -1,
		selections: [],
		isNeedScrollTo: {},
		scrollTo: "",

		...resumed,	
		
		files: [],
		dirs: [],
	};
}

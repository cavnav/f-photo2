import React, {useCallback, useMemo, useEffect} from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { checkProgress, getRequestFileHandler, 
	getVarName, refreshOppositeWindow, scrollToLastElement, scrollToSelector, updateFiles, 
	useEffectSetHtmlSelection, useOnChangeSelections, useOnClickItem 
} from '../../functions';
import { Recipients } from './components/Recipients';
import { Files } from '../File/Files';
import { useEffectShareActions } from './useEffectShareActions';
import { BrowseBase } from '../BrowseBase/BrowseBase';
import { EVENT_NAMES } from '../../constants';


export const Share = channel.addComp({
	name: 'Share',
	render,
	getAPI,
	getComps,
	getResumeObj,
});

function render(props) {
	const Comp = this;
	const resumeObj = Comp.getResumeObj();

	const initialState = useMemo(() => {
		return {
			...getInitialState(),
			...resumeObj.get(),
		};
	}, []);

	const {
		state,
		setState,
	} = useMutedReducer({
		setCompDeps: Comp.setCompDeps,
		initialState,
		props,
		reducer,
		fn: onChangeState({Comp}),
	});

	const files = Object.keys(state.files);

	const comps = Comp.getComps();

	const onChangeCaption = onChangeCaption_({Comp});
	const onChangeRecipients = useCallback(onChangeRecipients_({Comp}), []);	
	const onRequestFile = useOnChangeSelections({
		Comp,
		deps: [],
		handler: (props) => {
			getRequestFileHandler(props);
		},
	});

	const onSelectFile = useOnChangeSelections({
		Comp,
		deps: [],		
		handler: onSelectFile_,
	});

	const eventHandlers = {
		onSelectFile,
		onRequestFile,		
	};

	const onClickItem = useOnClickItem({eventHandlers});

	const isEmpty = files.length === 0;

	const FilesComp = isEmpty ? null : <Files
		files={files}
		onSelectFile={getVarName({onSelectFile})}
		onRequestFile={getVarName({onRequestFile})}
	/>;

	useInitRefreshWindow({
        Comp,
        deps: [],
    });

	useEffectGetSharedReceptients({Comp, deps: []});

	useEffectShareActions({
		additionalPanelRender: comps.AdditionalPanelAPI.renderIt,
		state,

		onClose: () => {
			setState({
				scrollTo: '',
			});
			state.onClose?.();
		},
		onCancelShare: onCancel_({Comp}),
		onSelectTo: onSelectTo_({Comp}),
		onBackwardToPhotos: onBackwardToPhotos({Comp}),
		onSend: onSend({Comp}),
		
		deps: [
			state.filesSelected,
			state.isButtonCancel,
			state.isButtonSelectTo, 
			state.isButtonBackward,
			state.isButtonSend,
		]
	});

	const selectionProps = {
		selection: state.isButtonBackward ? state.recipients : state.filesSelected,
		ident: state.isButtonBackward ? 'ident' : undefined,
	};

	useEffectSetHtmlSelection(selectionProps);

	useEffect(
		() => {
			scrollToSelector({selector: state.scrollTo});
		},
		[]
	);

	useEffect(
		() => {
			if (state.flagScrollToLastElement) {
				scrollToLastElement();

			}
		},
		[state.flagScrollToLastElement]
	);

	return (
		<div 
			className="Share layout"
		>		
			{state.isButtonBackward 
			?	<div>
					подпись:{' '}  			
					<input 
						className='noInputBorder'
						type="text" 
						value={state.caption} 
						onChange={onChangeCaption}
					/>				
					<Recipients 
						items={state.recipientsAll}		
						selection={state.recipients}				
						onChange={onChangeRecipients}
					/>
				</div>

			: 	<BrowseBase 
					isEmpty={isEmpty}

					onClick={onClickItem}
				>
					{FilesComp}
				</BrowseBase>
			}				
		</div>
	);
}

function getAPI({
	resumeObj,
}) {
	return ({
		getStatus,
		toggleStatus,
	});


	// ------------------------------------

	function getStatusObj({
		value,
	}) {
		return {
			toShare: value,
		};
	}

	function toggleStatus({
		src,
	}) {
		const resumed = resumeObj.get();
		const shared = Boolean(resumed.files[src]);

		if (shared) {
			resumed.files = updateFiles.delete({
				files: resumed.files,
				id: src,
			})
		}
		else {
			resumed.files = updateFiles.add({
				files: resumed.files,
				id: src,
				item: {
					to: "",
				},
			});
		}

		resumeObj.save({
			val: {
				files: resumed.files,
			},
		});

		return getStatusObj({
			value: !shared,
		});
	}

	function getStatus({
		src,
	}) {
		return getStatusObj({
			value: Boolean(resumeObj.get().files?.[src]),
		});
	}
}

function getResumeObj({name}) {
	return {
		selector: [
			name,
		],
		val: getInitialState(),
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

	const isSelected = stateNew.filesSelected.length > 0 ? true : false;
	stateNew.isButtonCancel = isSelected;
	stateNew.isButtonSelectTo = isSelected;
	stateNew.isButtonSend = Object.keys(stateNew.recipients).length > 0 && stateNew.filesSelected.length > 0;

	return stateNew;
}

function getComps({
	channelComps,
}) {
	const {
		PhotoStatuses,
		AdditionalPanel,
		App,
		Browse,
	} = channelComps;

	return {
		items: {
			App,
			Browse,
			PhotoStatuses,
			AdditionalPanel,
		},
	};
}

function onCancel_({
	Comp,
}) {
	return () => {
		const deps = Comp.getDeps();
		const {
			state,
			setState,
		} = deps;

		for (let file of state.filesSelected) {
			delete state.files[file];
		}

		setState({
			files: state.files,
			filesSelected: [],
			scrollTo: '',
		});

		refreshOppositeWindow();
	};
}

function onSelectTo_({
	Comp
}) {
	return () => {
		const {setState} = Comp.getDeps();
		setState({
			isButtonBackward: true,
		});
	};
}

function onChangeRecipients_({
	Comp,
}) {
	return ({
		recipients,
	}) => {
		const {
			setState,
		} = Comp.getDeps();
		
		setState({
			recipients,
		});
	};
}

function onBackwardToPhotos({
	Comp,
}) {
	return () => {
		const {setState} = Comp.getDeps();
		setState({
			isButtonBackward: false,
		});
	}
}

function onSend({Comp}) {
	return () => {
		const server = Comp.getServer();

		const {state} = Comp.getDeps();	

		const caption = state.caption;

		server.share({
			files: state.filesSelected, 
			recipients: Object.values(state.recipients).map((item) => {
				item.caption = caption;

				return item;
			}),
		})
		.then(() => {
			return checkProgress({
				checkFunc: server.checkProgress,
			});
		})
		.then(() => {
			const {state, setState} = Comp.getDeps();
			for (let file of state.filesSelected) {
				delete state.files[file];
			}
			setState({
				files: state.files,
				filesSelected: [],
				recipients: {},
				isButtonBackward: false,
			});	
			
			refreshOppositeWindow();
		});
	};
}

function onChangeCaption_({
	Comp,
}) {
	return (event) => {
		const {setState} = Comp.getDeps();
		setState({
			caption: event.target.value,
		});
	};	
}

function onSelectFile_({
	Comp,
	ident,
	checked,
}) {
	const {
		state,
		setState,
	} = Comp.getDeps();

	if (checked) {
		state.filesSelected = state.filesSelected.concat(ident);
	}		
	else {
		state.filesSelected = state.filesSelected.filter(item => item !== ident);
	}

	setState({
		filesSelected: state.filesSelected,
		isButtonSelectTo: true, 
	});
}

function useEffectGetSharedReceptients({
	Comp,
	deps,
}) {
	useEffect(
		() => {
			const server = Comp.getServer();

			server.getSharedRecipients()
			.then(
				({
					recipients,
				}) => {
					const {
						setState,
					} = Comp.getDeps();
					
					setState({
						recipientsAll: recipients,
					});
				}
			);
		}, 
		deps
	);	
}

function onChangeState({
	Comp,
}) {
	return ({
		stateUpd,
	}) => {		
		let value = {};

		const {
			scrollTo,
			files,
			shared,
			filesSelected,
		} = stateUpd;

		if (stateUpd.hasOwnProperty(getVarName({scrollTo}))) {
			value.scrollTo = scrollTo;
		}

		if (stateUpd.hasOwnProperty(getVarName({files}))) {
			value.files = files;
		}

		if (stateUpd.hasOwnProperty(getVarName({shared}))) {
			value.shared = shared;
		}

		if (stateUpd.hasOwnProperty(getVarName({filesSelected}))) {
			value.filesSelected = filesSelected;
		}

		const resumeObj = Comp.getResumeObj();

		resumeObj.save({
			val: value,
		});
	};
}

function useInitRefreshWindow({
    Comp,
    deps,
}) {
    useEffect(
        () => {
            const callback = () => {
                const {
					deps,
					resumeObj,
				 } = Comp.getReqProps();

				const {files, filesSelected} = resumeObj.get();

				deps.setState({
					files,
					filesSelected,
					scrollTo: '',
					flagScrollToLastElement: {},
				});			
			};
            document.addEventListener(EVENT_NAMES.refreshWindow, callback);
			
			return () => document.removeEventListener(EVENT_NAMES.refreshWindow, callback);
        },
        deps,
    );
}

function getInitialState(
) { 
	return {
		// props
		files: {},
		recipients: {},
		shared: '',	
		onClose: undefined,	
		
		caption: '',
		filesSelected: [],
		recipientsAll: {},
		scrollTo: '',
		flagScrollToLastElement: undefined,
		isButtonCancel: false,
		isButtonSelectTo: false,
		isButtonBackward: false,
		isButtonSend: false,
	};
}
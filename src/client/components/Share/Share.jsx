import React, {useCallback, useMemo, useEffect} from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { checkProgress, getRequestFileHandler, getSelector, getVarName, refreshOppositeWindow, updateFiles, useEffectSetHtmlSelection, useOnChangeSelections, useOnClickItem } from '../../functions';
import { Recipients } from './components/Recipients';
import { Files } from '../File/Files';
import { useEffectShareActions } from './useEffectShareActions';
import { BrowseBase } from '../BrowseBase/BrowseBase';
import { eventNames } from '../../constants';


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
			setState({
				scrollTo: getSelector({id: props.ident}),
			});
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

	const FilesComp = <Files
		files={files}
		onSelectFile={getVarName({onSelectFile})}
		onRequestFile={getVarName({onRequestFile})}
	/>

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
					scrollTo={state.scrollTo}
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
			isButtonSelectTo: false,
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
			isButtonSelectTo: true,
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

		if (stateUpd.hasOwnProperty('scrollTo')) {
			value.scrollTo = stateUpd.scrollTo;
		}

		if (stateUpd.hasOwnProperty('files')) {
			value.files = stateUpd.files;
		}

		if (stateUpd.hasOwnProperty('shared')) {
			value.shared = stateUpd.shared;
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

				deps.setState({
					files: resumeObj.get().files,
					scrollTo: "",
				});				
			};
            document.addEventListener(eventNames.refreshWindow, callback);
			
			return () => document.removeEventListener(eventNames.refreshWindow, callback);
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
		isButtonSelectTo: true,
		isButtonBackward: false,
		isButtonSend: false,
	};
}
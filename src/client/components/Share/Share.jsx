import React, { useCallback, useMemo, useEffect } from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import {
	getRequestFileHandler,
	getSelectorSrc,
	getVarName, 
	scrollToSelector, 
	sendEventOppositeWindow, 
	updateFiles,
	useEffectSetHtmlSelection, 
	useOnChangeSelections, 
	useOnClickItem,
	useRefresh,
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
		fn: onChangeState({ Comp }),
	});

	const files = Object.keys(state.files);

	const comps = Comp.getComps();

	const onChangeCaption = onChangeCaption_({ Comp });
	const onChangeRecipients = useCallback(onChangeRecipients_({ Comp }), []);
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

	const onClickItem = useOnClickItem({ eventHandlers });

	const isEmpty = files.length === 0;

	const FilesComp = isEmpty ? null : <Files
		files={files}
		onSelectFile={getVarName({ onSelectFile })}
		onRequestFile={getVarName({ onRequestFile })}
	/>;

	useEffectGetSharedReceptients({ Comp, deps: [] });

	useEffectShareActions({
		additionalPanelRender: comps.AdditionalPanelAPI.renderIt,
		state,

		onClose: () => {
			setState({
				scrollTo: '',
			});
			state.onClose?.();
		},
		onCancelShare: onCancel_({ Comp }),
		onSelectTo: onSelectTo_({ Comp }),
		onBackwardToPhotos: onBackwardToPhotos({ Comp }),
		onSend: onSend({ Comp }),

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

	useRefresh({Comp});
	useRefresh({
		eventName: EVENT_NAMES.moveSelections,
		Comp,
	});

	useScrollTo({Comp});


	return (
		<div
			className="Share layout"
		>
			{state.isButtonBackward
				? <div>
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

				: <BrowseBase
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
				scrollTo: !shared ? getSelectorSrc({id: src}) : "",
			},
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

function getResumeObj({ name }) {
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

	const isFileSelected = stateNew.filesSelected.length > 0 ? true : false;
	stateNew.isButtonCancel = isFileSelected;
	stateNew.isButtonSelectTo = isFileSelected && stateNew.isButtonBackward === false;
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

		sendEventOppositeWindow();
	};
}

function onSelectTo_({
	Comp
}) {
	return () => {
		const { setState } = Comp.getDeps();
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
		const { setState } = Comp.getDeps();
		setState({
			isButtonBackward: false,
		});
	}
}

function onSend({ Comp }) {
	return () => {
		const server = Comp.getServer();

		const { state } = Comp.getDeps();

		const caption = state.caption;

		server.share({
			files: state.filesSelected,
			recipients: Object.values(state.recipients).map((item) => {
				item.caption = caption;

				return item;
			}),
		})
			.then(() => {
				const { serverAPI } = Comp.getReqProps();

				serverAPI.checkProgress()
					.then(() => {
						const { state, setState } = Comp.getDeps();
						for (let file of state.filesSelected) {
							delete state.files[file];
						}
						setState({
							files: state.files,
							filesSelected: [],
							recipients: {},
							isButtonBackward: false,
						});

						sendEventOppositeWindow();
					});
			});
	};
}

function onChangeCaption_({
	Comp,
}) {
	return (event) => {
		const { setState } = Comp.getDeps();
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

		if (stateUpd.hasOwnProperty(getVarName({ scrollTo }))) {
			value.scrollTo = scrollTo;
		}

		if (stateUpd.hasOwnProperty(getVarName({ files }))) {
			value.files = files;
		}

		if (stateUpd.hasOwnProperty(getVarName({ shared }))) {
			value.shared = shared;
		}

		if (stateUpd.hasOwnProperty(getVarName({ filesSelected }))) {
			value.filesSelected = filesSelected;
		}

		const resumeObj = Comp.getResumeObj();

		resumeObj.save({
			val: value,
		});
	};
}

function useScrollTo({Comp}) {
	const deps = Comp.getDeps();

	useEffect(
		() => {			
			scrollToSelector({selector: deps.state.scrollTo});
		},
		[deps.state.files]
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
		isButtonCancel: false,
		isButtonSelectTo: false,
		isButtonBackward: false,
		isButtonSend: false,
	};
}
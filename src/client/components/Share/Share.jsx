import React, {useCallback, useMemo, useEffect} from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { Empty } from '../Empty/Empty';
import { checkProgress, updateFiles } from '../../functions';
import { ShareItems } from './components/ShareItems';
import { useShareActions } from './useShareActions';
import { Recipients } from './components/Recipients';


export const Share = channel.addComp({
	name: 'Share',
	render,
	getAPI,
	getComps,
	getResumeObj,
});

function render() {
	const Comp = this;
	const resumeObj = Comp.getResumeObj();

	const initialState = useMemo(() => {
		return {
			...getInitialState(),
			...resumeObj.get(),
		};
	}, []);

	const [state, setState] = useMutedReducer({
		reducer,
		setCompDeps: Comp.setCompDeps,
		initialState,
	});

	const comps = Comp.getComps();

	const onChangeRecipients = useCallback(onThisChangeRecipients({Comp}), []);

	useShareActions({
		additionalPanelRender: comps.AdditionalPanelAPI.renderIt,
		state,

		onSelectTo: onThisSelectTo({Comp}),
		onBackwardToPhotos: onThisBackwardToPhotos({Comp}),
		onSend: onThisSend({Comp}),
	});

	const onChangeCaption = onChangeCaptionWith({Comp});

	useEffect(
		() => {
			const server = Comp.getServer();

			server.getSharedRecipients()
			.then(({
				recipients,
			}) => {
				const {
					setState,
				} = Comp.getDeps();
				
				setState({
					recipientsAll: recipients,
				});
			});
		}, 
		[]
	);

	return (
		<div className="Share">		
			{state.isButtonBackwardToPhotos 
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
						onChange={onChangeRecipients}
					/>
				</div>
			: state.isEmpty 
				? <Empty />
				: <ShareItems
					sources={state.files}
				/>
			}	
			
		</div>
	);
}

function getAPI({
	Comp,
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

	stateNew.isEmpty = Object.keys(stateNew.files).length === 0;

	return stateNew;
}

function getComps({
	channelComps,
}) {
	const {
		PhotoStatuses,
		AdditionalPanel,
	} = channelComps;

	return {
		items: {
			PhotoStatuses,
			AdditionalPanel,
		},
	};
}

function onThisSelectTo({
	Comp
}) {
	return (event) => {
		const {state, setState} = Comp.getDeps();
		setState({
			isButtonSelectTo: false,
			isButtonBackwardToPhotos: true,
		});
	};
}

function onThisChangeRecipients({
	Comp,
}) {
	return ({
		recipients,
	}) => {
		const {
			setStateSilent,
		} = Comp.getDeps();
		
		setStateSilent({
			recipients,
		});
	};
}

function onThisBackwardToPhotos({
	Comp,
}) {
	return (event) => {
		const {setState} = Comp.getDeps();
		setState({
			isButtonBackwardToPhotos: false,
			isButtonSelectTo: true,
		});
	}
}

function onThisSend({Comp}) {
	return () => {
		const server = Comp.getServer();

		const {state} = Comp.getDeps();	

		const caption = state.caption;

		server.share({
			files: Object.keys(state.files), 
			recipients: state.recipients.map((item) => {
				item.caption = caption;
				return item;
			}),
		})
		.then(() => {
			return checkProgress({
				checkFunc: server.checkProgress,
			})
		});
	};
}

function onChangeCaptionWith({
	Comp,
}) {
	return (event) => {
		const {setState} = Comp.getDeps();
		setState({
			caption: event.target.value,
		});
	};	
}

function getInitialState(
) { 
	return {
		files: {},
		filesSelected: {},
		forceUpdate: false,
		caption: '',
		recipients: {},
		recipientsAll: {},
		isButtonSelectTo: true,
		isButtonBackwardToPhotos: false,
		isButtonSend: true,
	};
}
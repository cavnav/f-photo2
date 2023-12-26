import React, {useMemo} from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { Empty } from '../Empty/Empty';
import { updateFiles } from '../../functions';
import { ShareItems } from './components/ShareItems';
import { useShareActions } from './useShareActions';

const ADDRESSEES = [
	'Мамао',
	'Мама',
	'Любимая',
];

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

	useShareActions({
		additionalPanelRender: comps.AdditionalPanelAPI.renderIt,
		isSelectTo: state.isSelectTo,
		isBackwardToPhotos: state.isBackwardToPhotos,
		onSelectTo: onThisSelectTo({Comp}),
		onBackwardToPhotos: onThisBackwardToPhotos({Comp}),
	});

	const onCancelShare = React.useCallback((e) => {
		const fileElement = e.target;
		const fileSrc = fileElement.getAttribute('keyid');
		const file = state.files[fileSrc];
		
		file.setToShare({
			flag: false,
		});
		
		setState({
			forceUpdate: !state.forceUpdate,
		});
	}, []);

	const onChangeFilesTitle = React.useCallback((e) => {
		setState({
			filesTitle: e.target.value,
		});
	}, []);

	const onChangeAddresses = React.useCallback(({
		selectedItems,
	}) => {
		setState({
			addresses: selectedItems,
		});
	}, []);

	return (
		<div className="Share layout">			
			{state.isEmpty 
			? <Empty />
			: <ShareItems
				sources={state.files}
			/>
			}
		</div>
	);
}

function getFilesSrc({
	Comp,	
}) {
	const {state} = Comp.getDeps();
	return Object.keys(state.files);
}
function getFilesTitle({
	Comp,
}) {
	const {state} = Comp.getDeps();
	return state.filesTitle;
}
function getAddresses({
	Comp,
}) {
	const {state} = Comp.getDeps();
	return state.addresses;
}

function getAPI({
	Comp,
	resumeObj,
}) {
	return ({
		getItems: () => ({
			names: getAddresses({Comp}).map((item) => ({
				name: item,
				title: getFilesTitle({Comp}),
			})),
			files: getFilesSrc({Comp}),
		}),
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
			isSelectTo: false,
			isBackwardToPhotos: true,
		});
	};
}

function onThisBackwardToPhotos({
	Comp,
}) {
	return (event) => {
		const {state, setState} = Comp.getDeps();
		setState({
			isBackwardToPhotos: false,
			isSelectTo: true,
		});
	}
}

function getInitialState(
) { 
	return {
		files: {},
		filesTitle: '',
		addresses: [],
		forceUpdate: false,
		isSelectTo: true,
		isBackwardToPhotos: false,
	};
}
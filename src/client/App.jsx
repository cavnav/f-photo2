// update version
// forward to photo location from print by click
	// fix browse, onePhoto toggle.
	// fix remove from onePhoto
	// check change selections after delete in onePhoto.
// whatsapp / telegram.
// connect android by wifi

// I
// show overwrite confirmation for every files
// remove ctg file

// II
// magnifying glass
// tablet using
// unselect all
// select all

// III

// dialog position on edges
// from one photo 1 side and select print 2 side, then exit from one photo on 1 side.	
// help (fire dialog with corresponding actions)
// add path to onePhoto, it is understand where this photo is
// add status icon to preview image

// same layout for all actions - Browse, Print.
// add icon type for items
// share print, share file status
// sync between browse, print, share, onePhoto
// z100 error
// Failed to load resource
// content-visibility

import './app.css';

import React from 'react';
import { ControlPanel, AdditionalPanel, Dialog } from './components';
import { get as _get } from 'lodash';
import { channel } from './channel';
import { ResumeObj } from './resumeObj';
import { useMutedReducer } from './mutedReducer';
import { Copy,
	Browse,
	Print,
	OnePhoto,
	Welcome,
	Share,
	PrintedComp, 
} from './components';

export const App = channel.addComp({
	name: 'App',
	render,
	getAPI,
	getComps,
	getReqProps,

	// чтобы вызвать автоматическое включение этих компонент в channel.
	Copy,
	Browse,
	Print,
	OnePhoto,
	Welcome,
	Share,
	PrintedComp,
});

const resumeObj = new ResumeObj({
	selector: [
		window.name,
		App.name,
	],
});

function render() {
	const Comp = this;
	let s; // state
	const [d] = React.useState({}); // dispatch.

	[s, d.setAppState] = useMutedReducer({
		initialState: getAppStateInit(),
		setCompDeps: Comp.setCompDeps,
		fn: resumeUpdFn,
	});

	channel.preset({
		s,
		d,
	});

	React.useEffect(() => {
		const onMouseUpWrap = (e) => onMouseUp({ Comp, e });
		document.addEventListener('mouseup', onMouseUpWrap);
		return () => document.removeEventListener('mouseup', onMouseUpWrap);
	},
		[]
	);


	const Action = Comp.getReqProps().comps[s.action];

	return (
		<div className="f-photo">
			<ControlPanel.r />
			<AdditionalPanel.r />
			<div className="Action">
				<Action.r />
			</div>
			<Dialog.r />
		</div>
	);

	//--------------------------------------------------------------------------
}

function resumeUpdFn({
	state,
}) {
	resumeObj.save({
		val: state,
	});
};

function getAppStateInit() {
	const resumed = resumeObj.get();
	const rp = App.getReqProps();
	const { comps } = rp;

	return {
		action: comps.Welcome.name,
		doNeedHelp: false, // move to Help module.
		mouse: {
			x: 0,
			y: 0,
		},
		actions: [
			{
				id: Copy.name,
				title: 'Копировать с флешки',
			},
			{
				id: Browse.name,
				title: 'Альбомы',
			},		
			{
				id: OnePhoto.name,
				title: 'Фото',
				isEnabled: false,
			},
			{
				id: Print.name,
				title: 'Печатать',
			},
			{
				id: PrintedComp.name,
				title: 'Архив печатей',
			},
			// {
			// 	id: Share.name,
			// 	title: 'Отправить',
			// },
			// Help: {
			//   title: '?',
			//   isEnabled: true,
			// }
		],
		...resumed,
	};
};


// Need to be sameFunction and App must be 'this'.
function onMouseUp({
	Comp,
	e
}) {
	Comp.deps.setStateSilent({
		mouse: {
			x: e.clientX,
			y: e.clientY,
		}
	});
}

export function getAPI({
	deps,
}) {
	return {
		setState: deps.setState,
		toggleAction,
	};

	function toggleAction({
		action,
	}) {		
		let Action = deps.state.actions.find((action) => action.id === deps.state.action);
		if (Action.name === OnePhoto.name) {
			Action.isEnabled = false;
		}
		Action = deps.state.actions.find((actionItem) => actionItem.id === action);
		Action.isEnabled = true;

		deps.setState({
			action,		
			actions: deps.state.actions,
		});
	}
}

function getComps({
	channelComps,
}) {
	const {
		Copy,
		Browse,
		Print,
		OnePhoto,
		Welcome,
		PrintedComp,
	} = channelComps;

	return {
		items: {
			Copy,
			Browse,
			Print,
			OnePhoto,
			Welcome,
			PrintedComp,
		}
	}
}

function getReqProps({
	comps,
}) {
	return {
		comps,
	};
}
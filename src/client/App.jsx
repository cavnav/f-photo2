// check all user ways
	// doubled dialog btns.
	// onePhoto mode
		// remove, move
	// btn move dont appear straitway.
	// forbid move btn to print, printed albums, same path.
	// add album press ok btn, dialog hidden.
	// btn rename without check.
	// on remove, rename, move folder / file change all print lists.
	// when explore then print and backward the path reset.
	// show move btn on second window on change path in first window.
	// dialog position on edges
// fix error Warning: Can't perform a React state update on
	// first - browse, then print, then back to browse.
	// first - browse, then print, then back to browse, then print, then change cnt.
// add loading (create Proxy Comp for loading)
	// get countNewPhotos.
	// copying new photos.
// update version

// after back to list to scroll to last opened folder, last viewed photo
// last added folder
// scroll to new photo to print in Print action.
// add counter/all for one photo mode
// forward to photo location from print by click

// I
// show overwrite confirmation for every files
// remove ctg file
// print, printed - click by preview open one photo mode by src this photo. 
	// And one photo need not return to print button, it might simply select print tab.

// II
// magnifying glass
// tablet using
// unselect all
// select all

// III

// Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
//     in bound render (created by bound render)

// help (fire dialog with corresponding actions)
// ban move to print 
// ban move file on Welcome screen
// add path to onePhoto, it is understand where this photo is
// add status icon to preview image

// same layout for all actions - Browse, Print.
// add icon type for items
// share print, share file status
// sync between browse, print, share, onePhoto
// z100 error
// Failed to load resource
// add create resumeObj in channel.addComp().
// content-visibility

import 'antd/dist/antd.css';
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
	Printed, 
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
	Printed,
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
				title: 'Смотреть',
			},			
			{
				id: Print.name,
				title: 'Печатать',
			},
			{
				id: Printed.name,
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
		deps.setState({
			action,		
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
		Printed,
	} = channelComps;

	return {
		items: {
			Copy,
			Browse,
			Print,
			OnePhoto,
			Welcome,
			Printed,
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
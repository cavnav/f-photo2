// on change second window, dont refresh opposit (for move btn i.e.)
// bag from wrong path opposite window on browse from share.
// adding of album not leed to scroll and selecting in printed, shared.
// close album not leed to scroll and selecting in printed, shared.
// for mobile
//  how suggest prev, next, rotate gestures.
//  fix zoom
// add date of image by request
// help by paper.

// I
// show overwrite confirmation for every files

// II
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

export const App = channel.addComp({
	name: 'App',
	render,
	getAPI,
	getComps,	
});

const resumeObj = new ResumeObj({
	selector: [
		window.name,
		App.name,
	],
});

function render() {
	const Comp = this;

	const {state} = useMutedReducer({
		initialState: getAppStateInit(),
		setCompDeps: Comp.setCompDeps,
		fn: resumeUpdFn,
	});


	React.useEffect(
		() => {
			const onMouseUpWrap = (e) => onMouseUp({ Comp, e });
			document.addEventListener('mouseup', onMouseUpWrap);
			return () => document.removeEventListener('mouseup', onMouseUpWrap);
		},
		[]
	);


	const Action = Comp.getReqProps().comps[state.action];

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
	const comps = App.getComps();
	const {
		Copy,
		Browse,
		OnePhoto,
		Print,
		PrintedComp,
		Share,
		SharedComp,
	} = comps;

	const isDesktop = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? false : true;


	const actions = []; // order is important.

	if (isDesktop) {
		actions.push({
			id: Copy.name,
			title: 'Копировать с флешки',
			isEnabled: true,
		});
	}

	actions.push({
		id: Browse.name,
		title: 'Альбомы',
		isEnabled: true,
	});

	actions.push({
		id: OnePhoto.name,
		title: 'Фото',
		isEnabled: false,
	});

	if (isDesktop) {
		actions.push({
			id: Print.name,
			title: 'Печатать',
			isEnabled: true,
		});

		actions.push({
			id: PrintedComp.name,
			title: 'Архив печатей',
			isEnabled: true,
		});

		actions.push({
			id: Share.name,
			title: 'Отправить',
			isEnabled: true,
		});

		actions.push({
			id: SharedComp.name,
			title: 'Архив отправленных',
			isEnabled: true,
		});
	}

	return {
		action: comps.Welcome.name,
		doNeedHelp: false, // move to Help module.
		mouse: {
			x: 0,
			y: 0,
		},

		...resumed,
		
		actions,

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
	Comp,
	deps,
}) {
	return {
		state: deps.state,
		setState: deps.setState,
		toggleAction,
	};

	function toggleAction({
		action,
	}) {		
		let actionsObj = {};
		deps.state.actions.forEach((action) => {
			actionsObj[action.id] = action;
		});

		actionsObj[action].isEnabled = true;

		const {Browse, OnePhoto} = Comp.getComps();
		
		if (action === Browse.name) {
			actionsObj[OnePhoto.name].isEnabled = false;
		}
		if (action === OnePhoto.name) {
			actionsObj[Browse.name].isEnabled = false;
		}
		

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
		Share,
		SharedComp,
	} = channelComps;

	return {
		items: {
			Copy,
			Browse,
			Print,
			OnePhoto,
			Welcome,
			PrintedComp,
			Share,
			SharedComp,
		},
	}
}

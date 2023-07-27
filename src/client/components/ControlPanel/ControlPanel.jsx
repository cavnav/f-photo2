import './styles.css';
import React from 'react';
import { get as _get } from 'lodash';
import { channel } from '../../channel';
import cn from 'classnames';
import { useMutedReducer } from '../../mutedReducer';

export const ControlPanel = channel.addComp({
	name: 'ControlPanel',
	render,
	getReqProps,
	getComps,
});

function render() {
	const Comp = this;
	useMutedReducer({
		initialState: stateInit,
		setCompDeps: Comp.setCompDeps,
	});

	const rp = Comp.getReqProps();
	return (
		<div
			className="controlPanel flex"
			onClick={onClickAction}
		>{
			rp.actions
				.map((props) => {
					const classNames = cn({
						action: true,
						btn: true,
						active: props.id === rp.appStateAction,
					});
					return (
						<div key={props.id} className={classNames} data-id={props.id}>
							{props.title}
						</div>
					);
				})
			}		
		</div>
	);

	// -----------------------------------------------------------------------
	function onClickAction(e) {
		const actionId = e.target.getAttribute('data-id');

		if (actionId !== null) {
			rp.setAppState({
				action: actionId,
			});
		}
	};
}

function getReqProps({ comps, channel }) {
	const cropped = channel.crop({
		s: {
			action: 'appStateAction',
			actions: 1,
		},
		d: {
			setAppState: 1,
		},
	});

	return {
		...cropped,
		...comps,
	};
};

function getComps({
	channelComps,
}) {
	const {
		Print,
		Notification,
	} = channelComps;
	return {
		items: {
			Print,
			Notification,
		},
	};
}

const stateInit = {
	isDialogPrint: false,
};